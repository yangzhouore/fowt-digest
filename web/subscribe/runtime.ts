import { neon } from "@neondatabase/serverless";
import { resendMailer } from "./mail";
import { normalizeEmail } from "./preferences";
import { createStore } from "./store";

function validSecret(value: string | undefined): value is string {
  return !!value && value.length >= 32 && !/[^\x21-\x7e]/.test(value);
}

export function configuredCronSecret(env = process.env) {
  return validSecret(env.CRON_SECRET) ? env.CRON_SECRET : null;
}

export function subscriptionRuntime(env = process.env) {
  const { SUBSCRIBE_DATABASE_URL, RESEND_API_KEY, SUBSCRIBE_FROM_EMAIL, SUBSCRIBE_SITE_URL, SUBSCRIBE_TOKEN_SECRET } = env;
  if (!SUBSCRIBE_DATABASE_URL || !RESEND_API_KEY || !/^re_[a-z0-9_-]+$/i.test(RESEND_API_KEY) || RESEND_API_KEY.trim() !== RESEND_API_KEY ||
      !SUBSCRIBE_FROM_EMAIL || /[\r\n]/.test(SUBSCRIBE_FROM_EMAIL) || !SUBSCRIBE_SITE_URL ||
      !validSecret(SUBSCRIBE_TOKEN_SECRET) || !configuredCronSecret(env)) return null;
  const sender = SUBSCRIBE_FROM_EMAIL.match(/^[^<>]+<([^<>]+)>$/)?.[1] ?? SUBSCRIBE_FROM_EMAIL;
  if (!normalizeEmail(sender)) return null;
  try {
    const database = new URL(SUBSCRIBE_DATABASE_URL);
    const sslmode = database.searchParams.get("sslmode");
    if (!["postgresql:", "postgres:"].includes(database.protocol) || !database.username || !database.password ||
        !database.hostname || !database.pathname.slice(1) || database.hash ||
        (sslmode !== null && !["require", "verify-ca", "verify-full"].includes(sslmode))) return null;
    const site = new URL(SUBSCRIBE_SITE_URL);
    const hosted = Boolean(env.VERCEL || env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview");
    const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(site.hostname);
    if (site.href !== `${site.origin}/` || site.username || site.password ||
        (hosted && loopback) || !(site.protocol === "https:" || (!hosted && site.protocol === "http:" && site.hostname === "127.0.0.1"))) return null;
    const sql = neon(SUBSCRIBE_DATABASE_URL);
    return {
      site: site.origin,
      secret: SUBSCRIBE_TOKEN_SECRET,
      store: createStore(async (statement, params) => await sql.query(statement, params, {
        fetchOptions: { cache: "no-store", signal: AbortSignal.timeout(5000) },
      })),
      send: resendMailer(RESEND_API_KEY, SUBSCRIBE_FROM_EMAIL),
    };
  } catch {
    return null;
  }
}
