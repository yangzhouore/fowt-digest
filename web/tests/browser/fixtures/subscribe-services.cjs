/* eslint-disable @typescript-eslint/no-require-imports */
const { appendFileSync, mkdirSync, readFileSync } = require("node:fs");
const { createHash, randomUUID } = require("node:crypto");
const { dirname, join } = require("node:path");
const { PGlite } = require("@electric-sql/pglite");

if (process.env.VERCEL || process.env.SUBSCRIBE_BROWSER_FIXTURE !== "1" || !process.argv.includes("127.0.0.1")) {
  throw new Error("Subscribe browser fixture requires an explicitly enabled loopback test server.");
}

const databaseHost = "subscription-fixture.invalid";
Object.assign(process.env, {
  SUBSCRIBE_DATABASE_URL: `postgresql://fixture:fixture@${databaseHost}/test`,
  RESEND_API_KEY: "re_fixture_only",
  SUBSCRIBE_FROM_EMAIL: "Floating Wind Digest <fixture@example.test>",
  SUBSCRIBE_SITE_URL: "http://127.0.0.1:3100",
  SUBSCRIBE_TOKEN_SECRET: "not-a-secret-browser-management-fixture",
  CRON_SECRET: "not-a-secret-browser-cron-fixture",
});
const file = join(process.cwd(), ".next/cache/subscribe-test-mail.jsonl");
const mailbox = new Map();
const raw = Object.fromEntries([16, 20, 23, 25, 1082, 1184, 1009, 2950].map((oid) => [oid, (value) => value]));
const db = new PGlite();
const ready = db.exec(readFileSync(join(__dirname, "../../../subscribe/migrations/001_subscribe.sql"), "utf8"))
  .then(() => db.query(`
    INSERT INTO subscription_confirmations (email,token_hash,locale,news,research,company_ids,requested_at,expires_at,sent_at)
    VALUES ('expired@example.test',$1,'en',true,false,'{}','2000-01-01','2000-01-02','2000-01-01')
  `, [createHash("sha256").update("e".repeat(43)).digest("hex")]));
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  const target = new URL(url instanceof Request ? url.url : url);
  const headers = new Headers(options?.headers);
  if (target.href === "https://api.invalid/sql" &&
      new URL(headers.get("neon-connection-string") ?? "about:blank").hostname === databaseHost) {
    try {
      await ready;
      const { query, params } = JSON.parse(options.body);
      // Match the Neon HTTP protocol: values are parsed from PostgreSQL text.
      const result = await db.query(query, params, { rowMode: "array", parsers: raw, serializers: raw });
      return Response.json({ fields: result.fields, rows: result.rows });
    } catch (error) {
      return Response.json({ message: error.message }, { status: 400 });
    }
  }
  if (target.href === "https://api.resend.com/emails") {
    const message = JSON.parse(options.body);
    const key = headers.get("idempotency-key");
    if (headers.get("authorization") !== "Bearer re_fixture_only" || !key) return new Response(null, { status: 401 });
    if (!mailbox.has(key)) {
      const id = randomUUID();
      mailbox.set(key, id);
      mkdirSync(dirname(file), { recursive: true });
      appendFileSync(file, JSON.stringify({ id, ...message }) + "\n");
    }
    return Response.json({ id: mailbox.get(key) });
  }
  return originalFetch(url, options);
};
