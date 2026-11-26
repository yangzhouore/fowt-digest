/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");
const { loadStaticAdapter } = require("./validate-company-intelligence");

const { getGlobalSearchDocuments } = loadStaticAdapter("global-search-adapter.ts");
const { diversifySearchResults, searchDocuments, searchTypes } = loadStaticAdapter("global-search.ts");
const documents = getGlobalSearchDocuments();
const search = (query) => searchDocuments(documents, query);

test("the search index has six types, stable identities and internal destinations", () => {
  assert.deepEqual([...new Set(documents.map(({ type }) => type))], searchTypes);
  assert.equal(new Set(documents.map(({ type, id }) => `${type}:${id}`)).size, documents.length);
  const companies = new Set(documents.filter(({ type }) => type === "company").map(({ id }) => id));
  const projects = new Set(documents.filter(({ type }) => type === "project").map(({ id }) => id));
  assert.equal(companies.size, loadStaticAdapter("industry/industry-map.ts").getIndustryCompanies().length);
  assert.ok(companies.has("cnooc"));
  assert.equal(projects.size, 48);
  assert.equal(documents.filter(({ type }) => type === "event").length, require("../data/context/company-events.json").events.length);
  for (const document of documents) {
    assert.match(document.href, /^\/(companies|projects|engineering|papers|digital-ai)\//);
    assert.ok(document.companyIds.every((id) => companies.has(id)));
    assert.ok(document.projectIds.every((id) => projects.has(id)));
  }
});

test("exact entity names, canonical IDs and recorded historical aliases rank first", () => {
  for (const [query, type, id] of [
    ["  VeStAs  ", "company", "vestas"],
    ["iberdrola-scottishpower", "company", "iberdrola-scottishpower"],
    ["DNV   GL", "company", "dnv"],
    ["MHI Vestas Offshore Wind", "company", "vestas"],
    ["Hywind Tampen", "project", "hywind-tampen"],
  ]) {
    const result = search(query)[0];
    assert.equal(result.type, type, query);
    assert.equal(result.id, id, query);
  }
  assert.equal(search("Vestas")[0].updateCount, 162);
});

test("Vestas finds linked events, verified projects and original Engineering text", () => {
  const results = search("Vestas");
  assert.deepEqual(new Set(results.map(({ type }) => type)), new Set(["company", "event", "project", "engineering"]));
  assert.ok(results.some(({ type, id, companyIds }) =>
    type === "project" && id === "eolmed" && companyIds.includes("vestas")));
  const engineering = results.filter(({ type }) => type === "engineering");
  assert.ok(engineering.every(({ companyIds }) => companyIds.length === 0));
  assert.ok(search("Hywind Tampen").some(({ type, projectIds }) =>
    type === "event" && projectIds.includes("hywind-tampen")));
});

test("All reserves a place for each matching type without changing their rank order", () => {
  const ranked = search("Vestas");
  const visible = diversifySearchResults(ranked);
  const engineering = ranked.find(({ type }) => type === "engineering");
  assert.ok(!ranked.slice(0, 30).includes(engineering));
  assert.equal(visible.length, 30);
  assert.equal(visible[0].id, "vestas");
  assert.deepEqual(new Set(visible.map(({ type }) => type)), new Set(ranked.map(({ type }) => type)));
  assert.deepEqual(visible, [...ranked.slice(0, 29), engineering]);
  assert.deepEqual(diversifySearchResults(ranked.slice(0, 2)), ranked.slice(0, 2));
});

test("multi-company events appear once and choose destinations independently of membership order", () => {
  const id = "empire-wind-1-firm-order";
  assert.equal(documents.filter((document) => document.id === id).length, 1);
  const event = documents.find((document) => document.id === id);
  const reversed = documents.map((document) => document.id === id
    ? { ...document, companyIds: [...document.companyIds].reverse() } : document);
  for (const [query, company] of [["vestas", "vestas"], ["equinor", "equinor"], [event.title, "equinor"]]) {
    const matches = search(query).filter((document) => document.id === id);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].href, `/companies/${company}#event-${id}`);
    assert.equal(searchDocuments(reversed, query).find((document) => document.id === id).href, matches[0].href);
  }
  assert.equal(event.href, `/companies/equinor#event-${id}`);
});

test("literal technical phrases, spacing and punctuation work without invented matches", () => {
  for (const [query, expectedType] of [
    ["mooring", "digitalAi"], ["dynamic cable", "engineering"], ["CFD", "research"], ["15 MW", "event"],
  ]) {
    assert.ok(search(query).some(({ type }) => type === expectedType), query);
  }
  assert.deepEqual(search("DYNAMIC   cable"), search("dynamic cable"));
  assert.deepEqual(search(" "), []);
  assert.deepEqual(search("((missing) + [term]*?"), []);
});

test("ranking prioritizes explicit relationships over body text and breaks ties deterministically", () => {
  const fixture = [
    { id: "example", type: "company", title: "Example", companyIds: ["example"], projectIds: [], text: "" },
    { id: "body", type: "engineering", title: "Unlinked", date: "2026-08-01", companyIds: [], projectIds: [], text: "example" },
    ...[["b", "2025-02-01"], ["a", "2025-02-01"], ["older", "2025-01-01"]].map(([id, date]) =>
      ({ id, type: "event", title: "Related", date, companyIds: ["example"], projectIds: [], text: "" })),
  ];
  assert.deepEqual(searchDocuments(fixture, "example").map(({ id }) => id), ["example", "a", "b", "older", "body"]);
  assert.deepEqual(searchDocuments([...fixture].reverse(), "example"), searchDocuments(fixture, "example"));
});

test("exact entity IDs, project names, event titles and paper titles beat incidental source text", () => {
  const fixture = [
    { id: "example-company", type: "company", title: "Example Company", companyIds: ["example-company"] },
    { id: "canonical-project", type: "project", title: "Example Project", projectIds: ["canonical-project"] },
    { id: "event", type: "event", title: "Event Title", companyIds: ["example-company"], projectIds: ["canonical-project"] },
    { id: "paper", type: "research", title: "Paper Title" },
    { id: "body", type: "engineering", title: "Unlinked", date: "2026-08-01",
      text: "example company · example-company · example project · event title · paper title" },
  ].map((document) => ({ companyIds: [], projectIds: [], text: "", ...document }));
  for (const [query, first] of [
    ["Example Company", "example-company"], ["example-company", "example-company"],
    ["Example Project", "canonical-project"], ["Event Title", "event"], ["Paper Title", "paper"],
  ]) {
    const ids = searchDocuments(fixture, query).map(({ id }) => id);
    assert.equal(ids[0], first, query);
    assert.equal(ids.at(-1), "body", query);
    if (first !== "paper") assert.ok(ids.includes("event"), query);
  }
});
