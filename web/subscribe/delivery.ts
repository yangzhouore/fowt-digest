import { completedWeek, weeklyDigests } from "./digests";
import type { Email, SendOutcome } from "./mail";
import type { SubscribeRuntime } from "./service";
import { digestEmail } from "./templates";
import { managementToken } from "./tokens";

export async function deliverWeekly({ store, send, site, secret }: SubscribeRuntime, now = new Date(),
  { clock = () => new Date(), budgetMs = 30_000, pause = () => new Promise((resolve) => setTimeout(resolve, 550)),
    render = digestEmail } = {}) {
  const cutoff = clock().getTime() + budgetMs;
  const { end } = completedWeek(now);
  const periodClose = new Date(`${end}T00:00:00Z`);
  periodClose.setUTCDate(periodClose.getUTCDate() + 1);
  const result = { periodEnd: end, sent: 0, skipped: 0, failed: 0, uncertain: 0, unresolved: 0, incomplete: false };
  await store.flagAbandoned(now);
  await store.clearExpiredConfirmations(now);
  let after: string | null = null;
  batch: while (true) {
    const recipients = await store.active(after, periodClose);
    if (!recipients.length) break;
    for (const recipient of recipients) {
      if (clock().getTime() >= cutoff) {
        result.incomplete = true;
        break batch;
      }
      for (const digest of weeklyDigests(recipient, now)) {
        if (clock().getTime() >= cutoff) {
          result.incomplete = true;
          break batch;
        }
        if (digest.skipReason) {
          if (await store.claim(recipient, digest, clock())) result.skipped++;
          continue;
        }
        // A preparation failure can be recorded safely before claiming a provider call.
        let content: Email;
        try {
          content = render(digest, site, managementToken(recipient, secret), recipient.locale);
        } catch {
          if (await store.claim(recipient, digest, clock(), true)) result.failed++;
          continue;
        }
        const key = `weekly/${recipient.id}/${digest.kind}/${digest.key}`;
        if (!await store.claim(recipient, digest, clock())) continue;
        let outcome: SendOutcome;
        try {
          outcome = await send(recipient.email, content, key);
        } catch {
          outcome = { status: "uncertain", detail: "provider_submission_unresolved" };
        }
        await store.finish(recipient, digest, clock(), outcome);
        result[outcome.status]++;
        await pause();
      }
    }
    after = recipients.at(-1)!.id;
    if (recipients.length < 100) break;
  }
  result.unresolved = await store.unresolved(end);
  return result;
}
