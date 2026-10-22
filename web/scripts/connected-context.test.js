/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { readRepository, validateContextLinks } = require("./validate-connected-context");
const root = path.resolve(__dirname, "..");
const fixture = readRepository(root);
const factual = require("../data/projects/projects.json");
const clone = (value) => JSON.parse(JSON.stringify(value));
const validate = (dataset = fixture.dataset, editions = fixture.editions) => validateContextLinks(dataset, fixture.projects, editions, { today: "2026-10-22" });

// Exercise the real TypeScript module graph with only browser/framework shells
// substituted for server-render tests. Authoritative adapters and data are real.
function loader({ language = "en", fallbackSlug } = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    if (file.endsWith(".json")) return JSON.parse(fs.readFileSync(file, "utf8"));
    if (file.endsWith("/i18n/localized-copy.tsx")) return { LocalizedCopy: (props) => props[language] };
    if (file.endsWith("/site-header.tsx") || file.endsWith("/site-footer.tsx")) return { SiteHeader: () => null, SiteFooter: () => null };
    const context = { exports: {}, URL, require: (name) => {
      if (name === "next/link") return function TestLink(props) { return React.createElement("a", props, props.children); };
      if (name === "next/image") return function TestImage({ src, alt, width, height }) { return React.createElement("img", { src, alt, width, height }); };
      if (name === "next/navigation") return { notFound: () => { throw Error("not found"); } };
      if (!name.startsWith(".")) return require(name);
      let target = path.resolve(path.dirname(file), name).replaceAll("\\", "/");
      if (!path.extname(target)) target = [".ts", ".tsx", ".json"].map((ext) => target + ext).find((candidate) => fs.existsSync(candidate));
      if (!target) throw Error(`Unresolved import ${name} in ${file}`);
      return load(target);
    } };
    cache.set(file, context.exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, context, { filename: file });
    if (fallbackSlug && file.endsWith("/data/project-adapter.ts")) {
      const original = context.exports.getProjectBySlug;
      context.exports.getProjectBySlug = (slug) => {
        const project = original(slug);
        return slug === fallbackSlug ? { ...project, intelligence: undefined } : project;
      };
    }
    return context.exports;
  }
  return (relative) => load(path.join(root, relative).replaceAll("\\", "/"));
}
const load = loader();
const adapter = load("data/connected-context-adapter.ts");

test("six accepted seeds resolve bidirectionally for exactly four projects", () => {
  assert.deepEqual(validate(), []);
  assert.equal(fixture.dataset.links.length, 6);
  assert.deepEqual([...new Set(fixture.dataset.links.map((link) => link.projectId))].sort(), ["efgl", "eolmed", "green-volt", "pentland-floating-offshore-wind-farm"]);
  for (const link of fixture.dataset.links) {
    assert.ok(adapter.getProjectEngineeringCoverage(link.projectId).some((item) => item.id === link.id));
    assert.ok(adapter.getEngineeringProjectContext(link.editionSlug, link.briefingItemId).some((item) => item.project.id === link.projectId));
  }
});

for (const [name, mutate, pattern] of [
  ["unknown schema", (d) => d.schemaVersion = "other", /schemaVersion/],
  ["non-array links", (d) => d.links = null, /array/],
  ["non-object link", (d) => d.links[0] = null, /object/],
  ["missing ID", (d) => delete d.links[0].id, /stable ID/],
  ["duplicate ID", (d) => d.links[1].id = d.links[0].id, /duplicate link ID/],
  ["duplicate association", (d) => d.links.push({ ...clone(d.links[0]), id: "another-id" }), /duplicate project\/item/],
  ["unknown project", (d) => d.links[0].projectId = "unknown", /unknown project/],
  ["unregistered edition", (d) => d.links[0].editionSlug = "2099-01-01", /unregistered edition/],
  ["wrong edition", (d) => d.links[0].editionSlug = "2026-07-19", /not published/],
  ["candidate-only ID", (d) => d.links[0].briefingItemId = "eng-src-2025-12-14-eolmed-first-turbine", /not published/],
  ["wrong source", (d) => d.links[0].basis.sourceRecordId = d.links[1].basis.sourceRecordId, /source must belong/],
  ["altered stored text", (d) => d.links[0].basis.storedExcerpt += " invented", /exact stored source/],
  ["empty extract", (d) => d.links[0].basis.storedExcerpt = "", /short non-empty/],
  ["oversized extract", (d) => d.links[0].basis.storedExcerpt = "word ".repeat(26), /max 25 words/],
  ["unaccepted alias", (d) => d.links[0].basis.projectMention = "floating wind", /accepted project name/],
  ["shared-company basis", (d) => d.links[0].basis.type = "same_company", /unsupported basis/],
  ["missing basis", (d) => d.links[0].basis = null, /object/],
  ["raw navigation URL", (d) => d.links[0].href = "https://example.com", /unexpected field/],
  ["invalid date", (d) => d.links[0].mappingReviewedOn = "2026-02-30", /valid YYYY/],
  ["future date", (d) => d.links[0].mappingReviewedOn = "2026-10-23", /future/],
]) test(`context validator rejects ${name}`, () => {
  const data = clone(fixture.dataset); mutate(data); assert.match(validate(data).join("\n"), pattern);
});

test("project mentions must be complete names and cannot substitute a different project", () => {
  const data = clone(fixture.dataset);
  data.links[0].projectId = "green-volt";
  data.links[0].basis.projectMention = "Green Volt";
  assert.match(validate(data).join("\n"), /excerpt must identify/);
  const editions = clone(fixture.editions);
  const link = data.links[1];
  const source = editions.find((edition) => edition.weekEnd === link.editionSlug).sourceRecords.find((source) => source.sourceRecordId === link.basis.sourceRecordId);
  source.sourceText = "NOTEFGL is not an EFGL project mention in this extract.";
  link.basis.storedExcerpt = "NOTEFGL";
  assert.match(validate(data, editions).join("\n"), /complete name\/alias/);
});

test("resolver never discovers connections from overlapping names, companies or topics", () => {
  const briefings = load("data/engineering-briefing-adapter.ts").getAllEngineeringBriefings();
  assert.equal(adapter.resolveEngineeringLinks([], fixture.projects, briefings).length, 0);
  assert.equal(adapter.getProjectEngineeringCoverage("windfloat-atlantic").length, 0);
  assert.equal(adapter.getProjectEngineeringCoverage("hywind-tampen").length, 0);
  const broken = clone(fixture.dataset.links);
  broken[0].basis.sourceRecordId = "missing";
  assert.equal(adapter.resolveEngineeringLinks(broken, fixture.projects, briefings).length, 5);
});

test("coverage orders original source dates, not assessment dates or scores", () => {
  const links = adapter.getProjectEngineeringCoverage("efgl");
  assert.deepEqual(clone(links.map((link) => link.briefingItemId)), ["eng-item-2026-07-19-02", "eng-item-2026-07-19-01", "eng-item-2026-05-10-01"]);
  for (const link of links) assert.equal(link.href, `/engineering/${link.editionSlug}#item-${link.briefingItemId}`);
});

test("all 92 accepted company-ID roles resolve without changing scope or history", () => {
  const expected = factual.projectCompanyRelationships.filter((relationship) => relationship.industryCompanyId);
  const roleIds = [];
  for (const id of new Set(expected.map((relationship) => relationship.industryCompanyId))) {
    const records = adapter.getCompanyProjectRecords(id);
    assert.equal(new Set(records.map((record) => record.id)).size, records.length);
    for (const project of records) for (const role of project.roles) {
      roleIds.push(role.id);
      const original = expected.find((relationship) => relationship.id === role.id);
      assert.ok(original);
      assert.equal(original.projectId, project.id);
      assert.equal(role.status, original.status);
      assert.equal(role.scope, original.sourceStatusText);
      assert.equal(role.detail, original.roleDetail);
      assert.deepEqual(clone(role.sources.map((source) => source.sourceId)), original.sourceIds);
    }
  }
  assert.equal(roleIds.length, 92);
  assert.deepEqual(roleIds.sort(), expected.map((role) => role.id).sort());
  assert.equal(adapter.getIndustryEntryHref(null), null);
  assert.equal(adapter.getIndustryEntryHref("not-in-catalogue"), null);
  assert.equal(adapter.getCompanyProjectRecords("not-in-catalogue").length, 0);
});

test("source-free, null or name-similar relationships do not create company backlinks", () => {
  const project = load("data/project-adapter.ts").getProjectBySlug("green-volt");
  assert.ok(project.relationships.every((relationship) => relationship.industryCompanyId === null));
  assert.equal(adapter.buildCompanyProjectRecords("equinor", [project], new Set(["equinor"])).length, 0);
  const forged = { ...project, relationships: [{ ...project.relationships[0], industryCompanyId: "equinor", sourceIds: ["missing"] }] };
  assert.equal(adapter.buildCompanyProjectRecords("equinor", [forged], new Set(["equinor"])).length, 0);
});

test("industry canonical targets and repeated card disclosures have unique IDs", () => {
  const html = renderToStaticMarkup(React.createElement(load("app/industry/page.tsx").default));
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.filter((id) => id.startsWith("company-")).length, 47);
  assert.equal(ids.filter((id) => id.startsWith("project-context-")).length, 61);
  const projectAdapter = load("data/project-adapter.ts");
  for (const project of projectAdapter.getProjectIndexItems()) {
    const connected = adapter.connectProjectIndexItem(project);
    for (const category of connected.supplyChain) for (const group of category.groups) for (const entry of group.entries) {
      if (entry.industryHref) assert.ok(ids.includes(entry.industryHref.split("#")[1]));
      else assert.equal(entry.industryCompanyId, null);
    }
  }
});

test("coverage overflow stays reachable and empty profiles state the navigation boundary", () => {
  const components = load("app/connected-project-context.tsx");
  const coverage = clone(adapter.getProjectEngineeringCoverage("efgl"));
  coverage.push({ ...coverage[0], id: "fourth-test-item", title: "Fourth test item" });
  const html = renderToStaticMarkup(React.createElement(components.EngineeringCoverageList, { coverage }));
  assert.match(html, /Show all linked coverage \(4\)/);
  assert.equal((html.match(/class="context-coverage-card"/g) ?? []).length, 4);
  const empty = renderToStaticMarkup(React.createElement(components.ProjectEngineeringCoverage, { projectId: "hywind-scotland" }));
  assert.match(empty, /No project-specific Engineering coverage linked/);
});

test("standard, Green Volt and no-intelligence detail variants expose the same reading paths", async () => {
  for (const [slug, fallbackSlug] of [["eolmed", undefined], ["green-volt", undefined], ["eolmed", "eolmed"]]) {
    const detail = loader({ fallbackSlug })("app/projects/[slug]/page.tsx").default;
    const html = renderToStaticMarkup(await detail({ params: Promise.resolve({ slug }) }));
    assert.match(html, /id="engineering-coverage-heading"/);
    assert.match(html, /Read Engineering item/);
    if (slug === "green-volt") assert.doesNotMatch(html, /class="context-industry-link"/);
    else assert.match(html, /href="\/industry#company-bw-ideol"/);
  }
});

test("fixed context labels render in Chinese while source-backed content stays original", () => {
  const components = loader({ language: "zh" })("app/connected-project-context.tsx");
  const html = renderToStaticMarkup(React.createElement(components.ProjectEngineeringCoverage, { projectId: "green-volt" }));
  assert.match(html, /工程报道/); assert.match(html, /阅读工程条目/); assert.match(html, /为何关联/);
  assert.match(html, /Notice to Mariners/);
});
