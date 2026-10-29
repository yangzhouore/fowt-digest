/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");

const credentials = { ADMIN_ANALYTICS_USERNAME: "test-owner", ADMIN_ANALYTICS_PASSWORD: "test-only-password-at-least-32-characters" };
const authorization = `Basic ${Buffer.from(`${credentials.ADMIN_ANALYTICS_USERNAME}:${credentials.ADMIN_ANALYTICS_PASSWORD}`).toString("base64")}`;
function loader(env = {}, auth = authorization, fetcher = () => { throw Error("Unexpected network request"); }) {
  const cache = new Map();
  function load(file) {
    if (file.endsWith(".css")) return {};
    if (cache.has(file)) return cache.get(file);
    const output = { exports: {}, Buffer, URL, AbortSignal, Date, process: { env }, fetch: fetcher, require(name) {
      if (name === "server-only") return {};
      if (name === "next/headers") return { headers: async () => new Headers({ ...(auth ? { authorization: auth } : {}) }) };
      if (name === "next/navigation") return { notFound: () => { throw Error("blocked"); } };
      if (name === "next/server") {
        class NextResponse extends Response { static next() { return new Response(null); } }
        return { NextResponse };
      }
      if (!name.startsWith(".")) return require(name);
      let target = path.resolve(path.dirname(file), name);
      if (!path.extname(target)) target = [".ts", ".tsx"].map((ext) => target + ext).find(fs.existsSync);
      return load(target);
    } };
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText, output, { filename: file });
    cache.set(file, output.exports);
    return output.exports;
  }
  return (file) => load(path.resolve(__dirname, "..", file));
}
const analytics = loader()("lib/admin-analytics.ts");
const views = { count: 12, uniques: 5, views: [{ timestamp: "2026-10-29T00:00:00Z", count: 12, uniques: 5 }] };
const clones = { count: 3, uniques: 2, clones: [{ timestamp: "2026-10-29T00:00:00Z", count: 3, uniques: 2 }] };
function vercel(by) {
  const fields = { environment: "production", timestamp: "2026-10-29T00:00:00Z", requestPath: "/research?secret=hidden", referrerHostname: "example.org", country: "GB" };
  const key = by === "day" ? "timestamp" : by;
  return { data: [{ [key]: fields[key], pageviews: 20, visitors: 9, ip: "203.0.113.42", city: "Private city", latitude: 51.5, secret: "raw-secret" }] };
}
test("auth fails closed for missing/weak configuration and rejects incorrect or malformed credentials", () => {
  const { adminAuth } = loader()("lib/admin-auth.ts");
  assert.equal(adminAuth(null, {}), "unconfigured");
  assert.equal(adminAuth(authorization, { ...credentials, ADMIN_ANALYTICS_PASSWORD: "weak" }), "unconfigured");
  for (const header of [null, "Bearer secret", "Basic !!!", authorization + "x", "Basic " + "a".repeat(4097)]) assert.equal(adminAuth(header, credentials), "denied");
  assert.equal(adminAuth(authorization, credentials), "ok");
});
test("proxy blocks anonymous requests with a challenge and private response headers", () => {
  const { proxy } = loader(credentials)("proxy.ts");
  const denied = proxy({ headers: new Headers() });
  assert.equal(denied.status, 401);
  assert.match(denied.headers.get("www-authenticate"), /Basic/);
  assert.match(denied.headers.get("cache-control"), /no-store/);
  assert.match(denied.headers.get("x-robots-tag"), /noindex/);
  assert.equal(proxy({ headers: new Headers({ authorization }) }).status, 200);
  assert.equal(loader()("proxy.ts").proxy({ headers: new Headers() }).status, 503);
});
test("server page independently blocks unauthenticated access before provider calls", async () => {
  const page = loader(credentials, null)("app/admin/analytics/page.tsx").default;
  await assert.rejects(page({ searchParams: Promise.resolve({}) }), /blocked/);
});
test("authenticated page loads missing-credential states without leaking auth password", async () => {
  const page = loader(credentials)("app/admin/analytics/page.tsx").default;
  const html = renderToStaticMarkup(await page({ searchParams: Promise.resolve({}) }));
  assert.match(html, /Vercel unavailable/); assert.match(html, /GitHub unavailable/);
  assert.match(html, /trailing 14 days/); assert.ok(!html.includes(credentials.ADMIN_ANALYTICS_PASSWORD));
});
test("GitHub preserves exact upstream unique totals and normalizes all four traffic endpoints", () => {
  const result = analytics.normalizeGitHub(views, clones, [{ referrer: "Google", count: 4, uniques: 3 }], [{ path: "/owner/repo?private=yes", count: 8, uniques: 4 }]);
  assert.equal(result.totals.visitors, 5); assert.equal(result.clones.visitors, 2);
  assert.equal(result.pages[0].label, "/owner/repo"); assert.equal(result.referrers[0].label, "Google");
  assert.equal(result.trend[0].label, "2026-10-29");
});
test("Vercel keeps aggregate visitor totals and only country-level location", () => {
  const result = analytics.normalizeVercel(...["environment", "day", "requestPath", "referrerHostname", "country"].map(vercel));
  assert.equal(result.totals.visitors, 9); assert.equal(result.countries[0].label, "GB");
  assert.equal(result.pages[0].label, "/research");
  assert.doesNotMatch(JSON.stringify(result), /203\.0|Private city|latitude|raw-secret|hidden/);
});
test("raw IP-like labels are redacted including encoded paths, IPv6 and referrers", () => {
  for (const [value, kind] of [["203.0.113.42", "host"], ["/ip/203%2E0%2E113%2E42", "path"], ["2001:db8::1", "host"], ["/::ffff:203.0.113.42", "path"]]) assert.equal(analytics.safeLabel(value, kind), "Redacted");
  assert.equal(analytics.safeLabel("London", "country"), "Unknown / Others");
});
test("provider calls are server-only, uncached and bounded; unsupported ranges do not fetch", async () => {
  const calls = [];
  const fetcher = async (url, options) => { calls.push({ url, options }); return Response.json(vercel(url.searchParams.get("by"))); };
  const result = await analytics.loadVercel(7, { VERCEL_TOKEN: "private-token", VERCEL_PROJECT_ID: "prj_test", VERCEL_TEAM_ID: "team_test" }, fetcher, new Date("2026-10-29T12:00:00Z"));
  assert.ok(result.report); assert.equal(calls.length, 5);
  for (const { url, options } of calls) {
    assert.equal(url.hostname, "api.vercel.com"); assert.equal(options.cache, "no-store"); assert.equal(options.redirect, "error");
    assert.equal(url.searchParams.get("since"), "2026-10-23T00:00:00.000Z");
    assert.equal(url.searchParams.get("teamId"), "team_test"); assert.match(url.searchParams.get("filter"), /production/);
    assert.ok(!url.toString().includes("private-token"));
  }
  assert.ok((await analytics.loadVercel(null, {}, fetcher)).error); assert.equal(calls.length, 5);
  assert.equal(analytics.websiteDays("90"), null); assert.equal(analytics.websiteDays(undefined), 7);
});
test("missing credentials, rate limits, permission failures and malformed responses are safe", async () => {
  assert.ok((await analytics.loadVercel(7, {})).error); assert.ok((await analytics.loadGitHub({})).error);
  const env = { GITHUB_TOKEN: "private-token", GITHUB_OWNER: "owner", GITHUB_REPO: "repo" };
  for (const status of [401, 403, 404, 429, 500]) {
    const result = await analytics.loadGitHub(env, async () => new Response("raw-secret 203.0.113.42", { status }));
    assert.ok(result.error); assert.doesNotMatch(result.error, /raw-secret|203\.0|private-token/);
    if (status === 429) assert.match(result.error, /rate limit/);
  }
  assert.ok((await analytics.loadGitHub(env, async () => Response.json({ unexpected: true }))).error);
  const result = await analytics.loadGitHub(env, async (url) => Response.json(url.pathname.endsWith("views") ? views : url.pathname.endsWith("clones") ? clones : []));
  assert.equal(result.report.totals.views, 12);
});
test("actual server-rendered dashboard never receives raw IP or detailed location fields", async () => {
  const env = { ...credentials, VERCEL_TOKEN: "secret-provider-token", VERCEL_PROJECT_ID: "prj_test" };
  const fetcher = async (url) => Response.json(vercel(url.searchParams.get("by")));
  const page = loader(env, authorization, fetcher)("app/admin/analytics/page.tsx").default;
  const html = renderToStaticMarkup(await page({ searchParams: Promise.resolve({ days: "14" }) }));
  assert.match(html, /GB/); assert.match(html, /Visitor countries/);
  assert.doesNotMatch(html, /203\.0\.113\.42|Private city|latitude|raw-secret|secret-provider-token|secret=hidden/);
});
