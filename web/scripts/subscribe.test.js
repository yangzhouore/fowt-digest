/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { before, after, test } = require("node:test");
const { PGlite } = require("@electric-sql/pglite");
const { loadStaticAdapter: load } = require("./validate-company-intelligence");

const { normalizeEmail, validatePreferences } = load("../subscribe/preferences.ts");
const { confirmationHash, confirmationLifetimeMs, managementToken, verifyManagementToken } = load("../subscribe/tokens.ts");
const { subscriptionRuntime } = load("../subscribe/runtime.ts");
const { resendMailer } = load("../subscribe/mail.ts");
const { createStore } = load("../subscribe/store.ts");
const { subscriptionAction } = load("../subscribe/service.ts");
const { completedWeek, weeklyDigests } = load("../subscribe/digests.ts");
const { digestEmail } = load("../subscribe/templates.ts");
const { deliverWeekly } = load("../subscribe/delivery.ts");
const { getAllEngineeringBriefings } = load("engineering-briefing-adapter.ts");
const { getAllDigests } = load("digest-adapter.ts");
const { getCompanyEvents } = load("company-intelligence-adapter.ts");

const site = "https://digest.example";
const secret = "test-fixture-only-management-secret";
const date = new Date("2026-11-16T12:00:00Z");
const empty = { news: false, research: false, company: false, companies: [] };
const news = { ...empty, news: true };
const research = { ...empty, research: true };
const only = { ...empty, company: true, companies: ["vestas"] };
const all = { ...only, news: true, research: true };
const company = { news: false, research: false, companyIds: ["vestas"] };
const opts = { pause: async () => {} };
let db;
let store;

before(async () => {
  db = new PGlite();
  await db.exec(readFileSync(path.join(__dirname, "../subscribe/migrations/001_subscribe.sql"), "utf8"));
  store = createStore(async (sql, values) => (await db.query(sql, values)).rows);
});
after(async () => { await db?.close(); });

function mock() {
  const sent = [];
  return {
    sent, site, store, secret,
    async send(email, content, key) {
      sent.push({ email, content, key });
      return { status: "sent", providerId: `fake-${sent.length}` };
    },
  };
}

async function request(runtime, email, choices, now = date, locale = "en") {
  const previous = runtime.sent.length;
  assert.equal((await subscriptionAction(runtime, { action: "request", email, locale, ...choices }, now)).code, "requested");
  if (runtime.sent.length === previous) return null;
  const { text } = runtime.sent.at(-1).content;
  return text.match(/subscribe\/confirm#([A-Za-z0-9_-]+)/)[1];
}

async function activate(runtime, email, choices, now = date, locale = "en") {
  const token = await request(runtime, email, choices, now, locale);
  const confirmed = await subscriptionAction(runtime, { action: "confirm", token }, now);
  assert.equal(confirmed.code, "confirmed");
  return confirmed.token;
}

async function isolate(grant) {
  await db.query("UPDATE subscribers SET status='unsubscribed', news=false, research=false, company_ids='{}' WHERE id <> $1", [grant.id]);
}

const currentPeriodRun = new Date("2026-11-16T18:00:00Z");
const beforePeriodClose = new Date("2026-11-15T08:00:00Z");

test("validates all product combinations and canonical company identities", () => {
  assert.deepEqual(validatePreferences(news), { news: true, research: false, companyIds: [] });
  assert.deepEqual(validatePreferences(research), { news: false, research: true, companyIds: [] });
  assert.deepEqual(validatePreferences(only), company);
  assert.deepEqual(validatePreferences({ ...all, companies: ["vestas", "equinor", "vestas"] }),
    { news: true, research: true, companyIds: ["equinor", "vestas"] });
  assert.equal(validatePreferences({ ...only, companies: ["Vestas"] }), "invalid");
  assert.equal(validatePreferences({ ...only, companies: [] }), "companyRequired");
  assert.equal(validatePreferences({ ...news, companies: ["vestas"] }), "invalid");
  assert.equal(validatePreferences(empty), "selection");
  assert.equal(normalizeEmail(" Person+tag@Example.com "), "person+tag@example.com");
  assert.equal(normalizeEmail("person@example"), null);
  assert.equal(normalizeEmail("one..two@example.com"), null);
});

test("reserves confirmation atomically, stores only the hash and requires fresh single-use proof", async () => {
  const runtime = mock();
  const responses = await Promise.all(["CONFIRM@example.test", "confirm@example.test"].map((email) =>
    subscriptionAction(runtime, { action: "request", email, locale: "en", ...news }, date)));
  assert.deepEqual(responses.map(({ code }) => code).sort(), ["requested", "throttled"]);
  const token = runtime.sent[0].content.text.match(/subscribe\/confirm#([A-Za-z0-9_-]+)/)[1];
  assert.equal(runtime.sent.length, 1);
  assert.equal((await store.active(null, new Date("2030-01-01"))).length, 0);
  const result = await db.query("SELECT token_hash, consumed_at, sent_at FROM subscription_confirmations");
  assert.equal(result.rows[0].token_hash, confirmationHash(token));
  assert.equal(result.rows[0].consumed_at, null);
  assert.ok(result.rows[0].sent_at);
  assert.equal((await subscriptionAction(runtime, { action: "confirm", token: "x".repeat(43) }, date)).code, "invalidLink");
  assert.equal((await subscriptionAction(runtime, { action: "confirm", token }, date)).code, "confirmed");
  assert.equal((await subscriptionAction(runtime, { action: "confirm", token }, date)).code, "invalidLink");
  const expired = await request(runtime, "expired@example.test", news);
  assert.equal((await subscriptionAction(runtime, { action: "confirm", token: expired },
    new Date(date.getTime() + confirmationLifetimeMs))).code, "invalidLink");
});

test("the latest issued confirmation supersedes an earlier unconsumed token", async () => {
  const runtime = mock();
  const earlier = await request(runtime, "supersede@example.test", news);
  const later = new Date(date.getTime() + 31 * 60_000);
  const latest = await request(runtime, "SUPERSEDE@example.test", research, later);
  assert.equal((await subscriptionAction(runtime, { action: "confirm", token: earlier }, later)).code, "invalidLink");
  const current = await subscriptionAction(runtime, { action: "confirm", token: latest }, later);
  assert.equal(current.code, "confirmed");
  const forged = current.token.replace(/^[^.]+/, "00000000-0000-4000-a000-000000000000");
  assert.equal((await subscriptionAction(runtime, { action: "load", token: forged })).code, "invalidLink");
  assert.ok(!current.token.includes("@"));
  assert.deepEqual((await subscriptionAction(runtime, { action: "load", token: current.token })).preferences,
    { news: false, research: true, companyIds: [] });
});

test("a provider rejection cannot activate a request or produce an inbox acknowledgement on repeat", async () => {
  const runtime = mock();
  let exposedToken;
  const email = "unsent@example.test";
  const inputs = { action: "request", email, locale: "en", ...news };
  runtime.send = async (_email, content) => {
    exposedToken = content.text.match(/subscribe\/confirm#([A-Za-z0-9_-]+)/)[1];
    return { status: "failed", detail: "provider_http_403" };
  };
  assert.equal((await subscriptionAction(runtime, inputs, date)).code, "unavailable");
  assert.equal((await subscriptionAction(runtime, inputs, date)).code, "throttled");
  assert.equal((await subscriptionAction(runtime, { action: "confirm", token: exposedToken }, date)).code, "invalidLink");
});

test("pending requests cannot overwrite active preferences and authenticated management can add, remove and unsubscribe", async () => {
  const runtime = mock();
  const token = await activate(runtime, "manage@example.test", news);
  const grant = verifyManagementToken(token, secret);
  assert.ok(grant);
  const later = new Date(date.getTime() + 31 * 60_000);
  const pending = await request(runtime, "manage@example.test", research, later, "zh");
  assert.match(runtime.sent.at(-1).content.text, /确认/);
  assert.deepEqual((await subscriptionAction(runtime, { action: "load", token })).preferences,
    { news: true, research: false, companyIds: [] });
  const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
  assert.equal((await subscriptionAction(runtime, { action: "load", token: tampered })).code, "invalidLink");
  assert.equal((await subscriptionAction(runtime, { action: "update", token, locale: "zh", ...all, companies: ["vestas", "equinor"] }, later)).code, "saved");
  assert.deepEqual((await store.load(grant)).preferences.companyIds, ["equinor", "vestas"]);
  assert.equal((await subscriptionAction(runtime, { action: "update", token, locale: "zh", ...all }, later)).code, "saved");
  assert.deepEqual((await store.load(grant)).preferences.companyIds, ["vestas"]);
  const unsubDate = new Date(later.getTime() + 1000);
  assert.equal((await subscriptionAction(runtime, { action: "unsubscribe", token }, unsubDate)).code, "unsubscribed");
  assert.equal((await subscriptionAction(runtime, { action: "load", token })).code, "invalidLink");
  assert.equal((await subscriptionAction(runtime, { action: "confirm", token: pending }, unsubDate)).code, "invalidLink");
});

test("a later verified request replaces preferences and revokes earlier management links", async () => {
  const runtime = mock();
  const old = await activate(runtime, "replace@example.test", news);
  const current = await activate(runtime, "replace@example.test", research, new Date(date.getTime() + 31 * 60_000));
  assert.equal((await subscriptionAction(runtime, { action: "load", token: old })).code, "invalidLink");
  assert.deepEqual((await subscriptionAction(runtime, { action: "load", token: current })).preferences,
    { news: false, research: true, companyIds: [] });
});

test("completed weeks use a Monday boundary in UTC, including year rollover", () => {
  assert.deepEqual(completedWeek(new Date("2026-01-05T00:00:00Z")), { start: "2025-12-29", end: "2026-01-04" });
  assert.deepEqual(completedWeek(new Date("2026-01-05T00:59:00+01:00")), { start: "2025-12-22", end: "2025-12-28" });
  assert.deepEqual(completedWeek(date), { start: "2026-11-09", end: "2026-11-15" });
});

test("News and Research use exact completed-week editions and reproduce reviewed content without padding", () => {
  const preferences = { news: true, research: true, companyIds: [] };
  const digests = weeklyDigests({ preferences, locale: "en" }, date);
  assert.deepEqual(digests.map(({ kind, key }) => [kind, key]), [["news", "2026-11-15"], ["research", "2026-11-15"]]);
  const briefing = getAllEngineeringBriefings().find(({ slug }) => slug === digests[0].key);
  const researchEdition = getAllDigests().find(({ slug }) => slug === digests[1].key);
  assert.deepEqual(digests[0].itemIds, briefing.items.map(({ id }) => id));
  assert.deepEqual(digests[1].itemIds, researchEdition.papers.map(({ id }) => id));
  const [newsMail, researchMail] = digests.map((digest) => digestEmail(digest, site, "test", "en"));
  for (const item of briefing.items) {
    assert.ok(newsMail.text.includes(item.title));
    assert.ok(newsMail.text.includes(item.oneLineSummary));
  }
  for (const paper of researchEdition.papers) {
    assert.ok(researchMail.text.includes(paper.title));
    assert.ok(researchMail.text.includes(paper.authors.join(", ")));
    assert.ok(researchMail.text.includes(paper.publicationSource));
    assert.ok(!paper.abstract || !researchMail.text.includes(paper.abstract));
  }
  assert.ok(weeklyDigests({ preferences, locale: "en" }, new Date("2026-11-16T09:00:00Z"))
    .every(({ key, skipReason }) => key === "2026-11-15" && skipReason === "no_current_edition"));
  for (const mail of [newsMail, researchMail]) assertDigestShell(mail);
});

test("Company Brief keeps evidence and date boundaries, groups companies and prints each shared event once", () => {
  const at = new Date("2018-12-03T10:00:00Z");
  const event = getCompanyEvents().find(({ id }) => id === "kincardine-first-floating-turbine");
  const [single] = weeklyDigests({ preferences: company, locale: "en" }, at);
  assert.ok(single.itemIds.includes(event.id));
  const singleMail = digestEmail(single, site, "fake", "en");
  assertDigestShell(singleMail);
  assert.match(singleMail.subject, /^Vestas/);
  assert.ok(singleMail.text.includes(event.summary));
  for (const source of event.sources) assert.ok(singleMail.text.includes(source.url));
  assert.ok(singleMail.text.includes("/projects/kincardine"));
  const inputs = { preferences: { ...company, companyIds: ["vestas", "principle-power", "vryhof"] }, locale: "zh" };
  const [shared] = weeklyDigests(inputs, at);
  assert.equal(shared.itemIds.filter((value) => value === event.id).length, 1);
  assert.deepEqual(shared, weeklyDigests({ ...inputs, preferences: { ...company, companyIds: ["vryhof", "vestas", "principle-power"] } }, at)[0]);
  const email = digestEmail(shared, site, "fake", "zh");
  assert.equal(email.text.split(event.title).length, 2);
  assert.match(email.html, /lang="zh-CN"/);
  assert.match(email.text, /管理订阅偏好/);
  assert.ok(email.text.includes("/companies/principle-power#event-" + event.id));
  const [emptyBrief] = weeklyDigests({ preferences: company, locale: "en" }, new Date("2030-02-11T10:00:00Z"));
  assert.equal(emptyBrief.skipReason, "no_reviewed_developments");
  assert.deepEqual(emptyBrief.itemIds, []);
});

function assertDigestShell(mail) {
  assert.match(mail.subject, /Floating Wind Digest/);
  for (const body of [mail.html, mail.text]) {
    assert.match(body, /\d{4}-\d{2}-\d{2} . \d{4}-\d{2}-\d{2} UTC/);
    assert.match(body, /Manage preferences/);
    assert.match(body, /Unsubscribe/);
    assert.match(body, /https:\/\/digest\.example\//);
    assert.doesNotMatch(body, /<img\b/i);
  }
}

test("no previous-period delivery for a new confirmation and no historical fallback on the next run", async () => {
  const runtime = mock();
  const grant = verifyManagementToken(await activate(runtime, "cutoff@example.test", all, new Date("2026-11-16T00:00:00Z")), secret);
  await isolate(grant);
  const first = await deliverWeekly(runtime, currentPeriodRun, opts);
  assert.equal(first.sent, 0);
  assert.equal(first.skipped, 0);
  const rows = (await db.query("SELECT count(*)::int AS n FROM subscription_deliveries WHERE subscriber_id=$1", [grant.id])).rows;
  assert.equal(rows[0].n, 0);

  const laterGrant = verifyManagementToken(await activate(runtime, "historical@example.test", all, new Date("2030-02-10T08:00:00Z")), secret);
  await isolate(laterGrant);
  const later = await deliverWeekly(runtime, new Date("2030-02-11T18:00:00Z"), opts);
  assert.equal(later.sent, 0);
  assert.equal(later.skipped, 3);
  const skips = (await db.query("SELECT kind,status,detail,item_ids FROM subscription_deliveries WHERE subscriber_id=$1 ORDER BY kind", [laterGrant.id])).rows;
  assert.deepEqual(skips, [
    { kind: "company", status: "skipped", detail: "no_reviewed_developments", item_ids: [] },
    { kind: "news", status: "skipped", detail: "no_current_edition", item_ids: [] },
    { kind: "research", status: "skipped", detail: "no_current_edition", item_ids: [] },
  ]);
  assert.equal(runtime.sent.length, 2);
});

test("concurrent cron runs claim mail once, log skips, and never resubmit a delivered edition", async () => {
  const runtime = mock();
  const token = await activate(runtime, "weekly@example.test", { ...all, companies: ["vicinay-marine"] }, beforePeriodClose);
  const grant = verifyManagementToken(token, secret);
  await isolate(grant);
  const run = () => deliverWeekly(runtime, currentPeriodRun, opts);
  const runs = await Promise.all([run(), run()]);
  assert.equal(runs.reduce((count, result) => count + result.sent, 0), 2);
  const rows = (await db.query("SELECT kind, status, item_ids, provider_message_id FROM subscription_deliveries WHERE subscriber_id=$1 ORDER BY kind", [grant.id])).rows;
  assert.deepEqual(rows.map(({ kind, status }) => [kind, status]), [["company", "skipped"], ["news", "sent"], ["research", "sent"]]);
  assert.equal(rows[1].item_ids.length, 2);
  assert.ok(rows[2].provider_message_id);
  assert.equal(runtime.sent.length, 3);
  assert.equal((await run()).sent, 0);
  const following = await deliverWeekly(runtime, new Date("2030-02-18T10:00:00Z"), opts);
  assert.equal(following.sent, 0);
  assert.equal(following.skipped, 3);
  assert.equal(runtime.sent.length, 3);
});

test("explicit provider rejections can retry, uncertain delivery is recorded and never replayed", async () => {
  const runtime = mock();
  const token = await activate(runtime, "failure@example.test", { ...news, research: true }, beforePeriodClose);
  const grant = verifyManagementToken(token, secret);
  await isolate(grant);
  const runDate = currentPeriodRun;
  let attempts = 0;
  const result = await deliverWeekly({ ...runtime, async send(_recipient, _message, key) {
    attempts++;
    return { status: key.includes("/news/") ? "failed" : "uncertain", detail: "test_failure" };
  } }, runDate, opts);
  assert.equal(result.failed, 1);
  assert.equal(result.uncertain, 1);
  assert.equal(attempts, 2);
  const rows = (await db.query("SELECT status, sent_at, provider_message_id FROM subscription_deliveries WHERE subscriber_id=$1 ORDER BY kind", [grant.id])).rows;
  assert.deepEqual(rows.map(({ status, sent_at, provider_message_id }) => [status, sent_at, provider_message_id]),
    [["failed", null, null], ["uncertain", null, null]]);
  const retry = await deliverWeekly(runtime, runDate, opts);
  assert.equal(retry.sent, 1);
  assert.equal(retry.unresolved, 1);
  assert.equal(runtime.sent.length, 2);
  assert.equal(runtime.sent[1].key.split("/")[2], "news");
  assert.equal(managementToken(grant, secret), token);
});

test("a local preparation failure leaves News claimable and does not block other products", async () => {
  const runtime = mock();
  const grant = verifyManagementToken(await activate(runtime, "preparation@example.test", { ...news, research: true }, beforePeriodClose), secret);
  await isolate(grant);
  const initial = await deliverWeekly(runtime, currentPeriodRun, {
    ...opts,
    render(digest, ...args) {
      if (digest.kind === "news") throw new Error("simulated local failure");
      return digestEmail(digest, ...args);
    },
  });
  assert.equal(initial.failed, 1);
  assert.equal(initial.sent, 1);
  const rows = (await db.query("SELECT kind,status,detail FROM subscription_deliveries WHERE subscriber_id=$1 ORDER BY kind", [grant.id])).rows;
  assert.deepEqual(rows, [
    { kind: "news", status: "failed", detail: "local_preparation_failed" },
    { kind: "research", status: "sent", detail: null },
  ]);
  const retry = await deliverWeekly(runtime, currentPeriodRun, opts);
  assert.equal(retry.sent, 1);
  assert.deepEqual(runtime.sent.slice(1).map(({ key }) => key), [
    `weekly/${grant.id}/research/2026-11-15`,
    `weekly/${grant.id}/news/2026-11-15`,
  ]);
});

test("an interrupted claim becomes uncertain and is never reclaimed", async () => {
  const runtime = mock();
  const grant = verifyManagementToken(await activate(runtime, "interrupted@example.test", news, beforePeriodClose), secret);
  await isolate(grant);
  const [recipient] = await store.active(null, new Date("2026-11-16T00:00:00Z"));
  const [digest] = weeklyDigests(recipient, currentPeriodRun);
  const previouslyUnresolved = await store.unresolved(digest.periodEnd);
  assert.equal(await store.claim(recipient, digest, new Date("2026-11-16T17:40:00Z")), true);
  const result = await deliverWeekly(runtime, currentPeriodRun, opts);
  assert.equal(result.sent, 0);
  assert.equal(result.unresolved, previouslyUnresolved + 1);
  assert.equal(runtime.sent.length, 1);
  const rows = (await db.query("SELECT status,detail,sent_at FROM subscription_deliveries WHERE subscriber_id=$1", [grant.id])).rows;
  assert.deepEqual(rows, [{ status: "uncertain", detail: "worker_interrupted", sent_at: null }]);
});

test("Subscribe requires all six valid settings before database or mail access", () => {
  const configured = {
    SUBSCRIBE_DATABASE_URL: "postgresql://fixture:fixture@db.example.test/db?sslmode=require",
    RESEND_API_KEY: "re_fixture",
    SUBSCRIBE_FROM_EMAIL: "Floating Wind Digest <fixture@example.test>",
    SUBSCRIBE_SITE_URL: site,
    SUBSCRIBE_TOKEN_SECRET: secret,
    CRON_SECRET: "test-fixture-only-cron-secret-0000",
    VERCEL_ENV: "production",
  };
  assert.equal(subscriptionRuntime(configured).site, site);
  for (const [name, invalid] of Object.entries({
    SUBSCRIBE_DATABASE_URL: "https://db.example.test",
    RESEND_API_KEY: "re_key with spaces",
    SUBSCRIBE_FROM_EMAIL: "no-sender",
    SUBSCRIBE_SITE_URL: "http://127.0.0.1:3100",
    SUBSCRIBE_TOKEN_SECRET: "short",
    CRON_SECRET: "short",
  })) {
    assert.equal(subscriptionRuntime({ ...configured, [name]: undefined }), null, name);
    assert.equal(subscriptionRuntime({ ...configured, [name]: invalid }), null, name);
  }
  assert.equal(subscriptionRuntime({ ...configured, SUBSCRIBE_SITE_URL: `${site}/subscribe` }), null);
});

test("Resend needs a provider ID for success and separates rejections from ambiguous responses", async (t) => {
  const replies = [
    new Response(null, { status: 429 }),
    new Response(null, { status: 409 }),
    Response.json({ id: " " }),
    Response.json({ id: "provider-id" }),
  ];
  t.mock.method(globalThis, "fetch", async (url, request) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(request.headers["Idempotency-Key"], "weekly/test/news/2026-11-15");
    return replies.shift();
  });
  const send = resendMailer("re_fixture", "fixture@example.test");
  const attempt = () => send("reader@example.test", { subject: "Example", text: "Example", html: "<p>Example</p>" },
    "weekly/test/news/2026-11-15");
  assert.equal((await attempt()).status, "failed");
  assert.equal((await attempt()).status, "uncertain");
  assert.equal((await attempt()).status, "uncertain");
  assert.deepEqual(await attempt(), { status: "sent", providerId: "provider-id" });
});
