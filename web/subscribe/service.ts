import type { Mailer } from "./mail";
import { normalizeEmail, validatePreferences } from "./preferences";
import type { SubscriptionStore } from "./store";
import { confirmationEmail } from "./templates";
import { confirmationHash, confirmationLifetimeMs, managementToken, newConfirmationToken, verifyManagementToken } from "./tokens";

export type SubscribeRuntime = { store: SubscriptionStore; send: Mailer; site: string; secret: string };

export async function subscriptionAction(runtime: SubscribeRuntime, input: Record<string, unknown>, now = new Date()) {
  const { store, site, send, secret } = runtime;
  if (input.action === "request" || input.action === "update") {
    const locale = input.locale;
    if (locale !== "en" && locale !== "zh") return { code: "invalid" };
    const preferences = validatePreferences(input);
    if (typeof preferences === "string") return { code: preferences };
    if (input.action === "request") {
      const email = normalizeEmail(input.email);
      if (!email) return { code: "invalidEmail" };
      const token = newConfirmationToken();
      const hash = confirmationHash(token)!;
      const reserved = await store.reserveConfirmation(email, hash, preferences, locale, now, new Date(now.getTime() + confirmationLifetimeMs));
      if (!reserved) return { code: "throttled" };
      const outcome = await send(email, confirmationEmail(site, token, locale), `confirm/${hash}`);
      if (outcome.status !== "sent" || !await store.markConfirmationSent(hash, now)) return { code: "unavailable" };
      return { code: "requested" };
    }
    const grant = verifyManagementToken(input.token, secret);
    return { code: grant && await store.update(grant, preferences, locale, now) ? "saved" : "invalidLink" };
  }
  if (input.action === "confirm") {
    const hash = confirmationHash(input.token);
    const grant = hash && await store.confirm(hash, now);
    return grant ? { code: "confirmed", token: managementToken(grant, secret) } : { code: "invalidLink" };
  }
  if (input.action === "load" || input.action === "unsubscribe") {
    const grant = verifyManagementToken(input.token, secret);
    if (!grant) return { code: "invalidLink" };
    if (input.action === "unsubscribe") {
      return { code: await store.unsubscribe(grant, now) ? "unsubscribed" : "invalidLink" };
    }
    const settings = await store.load(grant);
    return settings ? { code: "loaded", preferences: settings.preferences } : { code: "invalidLink" };
  }
  return { code: "invalid" };
}
