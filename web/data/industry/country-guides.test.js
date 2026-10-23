/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function loader(language = "en") {
  const cache = new Map();
  function load(file) {
    file = file.replaceAll("\\", "/");
    if (cache.has(file)) return cache.get(file);
    if (file.endsWith(".json")) return JSON.parse(fs.readFileSync(file, "utf8"));
    if (file.endsWith("/i18n/localized-copy.tsx")) return { LocalizedCopy: (props) => props[language] };
    if (/\/site-(header|footer)\.tsx$/.test(file)) return { SiteHeader: () => null, SiteFooter: () => null };
    const context = { exports: {}, URL, require: (name) => {
      if (name === "next/link") return function TestLink(props) { return React.createElement("a", props, props.children); };
      if (name === "next/navigation") return { notFound: () => { throw new Error("not-found"); } };
      if (!name.startsWith(".")) return require(name);
      let target = path.resolve(path.dirname(file), name);
      if (!path.extname(target)) target = [".ts", ".tsx", ".json"].map((ext) => target + ext).find(fs.existsSync);
      if (!target) throw new Error(`Unresolved ${name}`);
      return load(target);
    } };
    cache.set(file, context.exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, context, { filename: file });
    return context.exports;
  }
  return (file) => load(path.resolve(__dirname, "../..", file));
}

const load = loader();
const { countryGuides: guides, countrySources: sources } = load("data/industry/country-guides.ts");
const { validateCountryGuides: validate } = load("data/industry/country-guide-validator.ts");
const clone = (v) => JSON.parse(JSON.stringify(v));

test("all three source-backed guides retain 22 topics and complete decision routes", () => {
  assert.equal(validate(guides, sources, "2026-10-23").length, 0);
  assert.deepEqual(Array.from(guides, (g) => g.slug), ["germany", "norway", "china"]);
  for (const g of guides) {
    assert.equal(g.topics[0].table.rows.length, 9);
    assert.equal(g.topics[2].table.rows.length, 17);
    assert.equal(g.topics[5].table.rows.length, 12);
    assert.equal(g.topics[21].items.length, 15);
    assert.ok(g.roles.length >= 12);
  }
});

for (const [name, mutate, pattern] of [
  ["missing country", (g) => g.pop(), /three additional/],
  ["duplicate country", (g) => g[1].slug = g[0].slug, /Country identity/],
  ["unreviewed country", (g) => g[0].reviewedOn = "2099-01-01", /future review/],
  ["missing topic", (g) => g[0].topics.pop(), /topics 1–22/],
  ["duplicate topic", (g) => g[0].topics[2].number = 2, /topics 1–22/],
  ["missing translation", (g) => g[1].topics[9].paragraphs[0].zh = "", /bilingual copy/],
  ["encoding damage", (g) => g[2].topics[12].summary.zh = "????", /damaged/],
  ["unknown evidence kind", (g) => g[2].topics[12].kinds.push("verified-national-tariff"), /evidence label/],
  ["source-free rule", (g) => g[1].topics[3].sourceIds = [], /source-free/],
  ["broken reference", (g) => g[0].topics[9].sourceIds.push("missing"), /missing source/],
  ["duplicate reference", (g) => g[0].topics[9].sourceIds.push(g[0].topics[9].sourceIds[0]), /duplicate source reference/],
  ["lost level", (g) => g[2].topics[0].table.rows.pop(), /required 9 rows/],
  ["lost stage", (g) => g[1].topics[2].table.rows.pop(), /required 17 rows/],
  ["lost decision column", (g) => g[1].topics[2].table.headers.pop(), /decision fields/],
  ["lost voltage field", (g) => g[0].topics[5].table.rows[2].pop(), /decision fields mismatch/],
  ["missing power table", (g) => delete g[0].topics[5].table, /missing chain\/lifecycle\/power/],
  ["lost question", (g) => g[2].topics[21].items.pop(), /fifteen/],
  ["organisation evidence omitted", (g) => g[1].roles[0].sourceIds = [], /source-free/],
  ["invented supplier contract label", (g) => g[2].roles[0].kind = "current-supply-contract", /organisation evidence label/],
  ["role scope omitted", (g) => g[2].roles[0].boundary.en = "", /bilingual copy/],
  ["duplicate organisation", (g) => g[1].roles.push(g[1].roles[0]), /organisation identity/],
  ["invalid source URL", (_, s) => s[0].url = "http://example.com", /HTTPS/],
  ["credential URL", (_, s) => s[0].url = "https://user:secret@example.com", /credential-free/],
  ["source scope omitted", (_, s) => s[0].claimScope = "", /claimScope/],
  ["impossible date", (_, s) => s[0].documentDate = "2026-02-30", /document date/],
  ["future publication", (_, s) => s[0].documentDate = "2099-01-01", /future document/],
  ["duplicate source", (_, s) => s.push(s[0]), /Source identity/],
]) test(`country harness rejects ${name}`, () => {
  const g = clone(guides); const s = clone(sources); mutate(g, s);
  assert.match(validate(g, s, "2026-10-23").join("\n"), pattern);
});

for (const language of ["en", "zh"]) for (const g of guides) test(`${g.slug} actual server route renders complete ${language} guide and bounded evidence`, async () => {
  const route = loader(language)("app/industry/[country]/page.tsx");
  const html = renderToStaticMarkup(await route.default({ params: Promise.resolve({ country: g.slug }) }));
  assert.ok(html.includes(g.title[language]));
  assert.equal([...html.matchAll(/class="uk-topic country-topic"/g)].length, 21);
  assert.equal([...html.matchAll(/class="uk-tier"/g)].length, 9);
  assert.equal([...html.matchAll(/class="uk-organisation-card"/g)].length, g.roles.length);
  assert.match(html, /href="\/industry#industry-catalogue"/);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  const targets = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(targets.every((target) => ids.includes(target)));
  for (const role of g.roles) assert.ok(html.includes(role.name.replaceAll("&", "&amp;")));
});

test("country route is static and rejects an unsupported country", async () => {
  const route = load("app/industry/[country]/page.tsx");
  assert.equal(route.dynamicParams, false);
  assert.deepEqual(Array.from(route.generateStaticParams(), (p) => p.country), ["germany", "norway", "china"]);
  await assert.rejects(route.default({ params: Promise.resolve({ country: "unknown" }) }), /not-found/);
});

test("public standard metadata does not imply access to full licensed documents", () => {
  assert.match(sources.find((s) => s.id === "cn-standard").claimScope, /metadata inspected/);
  assert.match(sources.find((s) => s.id === "tech-cert").claimScope, /Full paid standard not inspected/);
  assert.ok(sources.some((s) => s.documentDate === null));
});
