/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");
const dataset = require("../data/context/company-news-links.json");
const { loadCompanyIntelligence } = require("./validate-company-intelligence");

const { getCompanyIndex, getCompanyIntelligence, resolveCompanyNews } = loadCompanyIntelligence();
const reviewDate = "2026-11-19";
const resolve = (links) => resolveCompanyNews({ ...dataset, links }, reviewDate);
const engineeringLink = (companyId, editionSlug, sourceRecordId, storedExcerpt) => ({
  companyId, source: { kind: "engineering", editionSlug, sourceRecordId },
  category: "technology_engineering", mappingReviewedOn: reviewDate, storedExcerpt,
});

test("company routes use exact Industry IDs and unreviewed companies have zero updates", () => {
  const directory = getCompanyIndex();
  assert.equal(directory.length, 47);
  assert.equal(new Set(directory.map((company) => company.id)).size, directory.length);
  for (const entry of directory) assert.equal(getCompanyIntelligence(entry.id).company.name, entry.name);
  assert.equal(getCompanyIntelligence("Vestas"), undefined);
  assert.equal(getCompanyIntelligence("vest"), undefined);
  assert.deepEqual(getCompanyIntelligence("equinor").news, []);
  assert.equal(directory.find((entry) => entry.id === "equinor").latestDate, undefined);
});

test("the reviewed Vestas timeline includes both retained developments with source dates and explicit project context", () => {
  const { company, news, projects } = getCompanyIntelligence("vestas");
  assert.equal(company.countryRegion, "Denmark / Global");
  assert.deepEqual(news.map(({ id, publishedDate, category, project }) => [id, publishedDate, category, project?.slug]), [
    ["eng-src-2026-10-11-ow-neretek", "2026-10-07", "technology_engineering", undefined],
    ["eng-src-2025-12-14-eolmed-first-turbine", "2025-12-10", "projects_contracts", "eolmed"],
  ]);
  assert.match(news[0].summary, /bottom-fixed/);
  assert.equal(news[1].summary, "The first Vestas V164-10.0 MW turbine left Port-La Nouvelle for the EolMed site.");
  assert.deepEqual(projects.map(({ id }) => id).sort(), [
    "culzean-demo-floating-wind", "efgl", "eolmed", "kincardine-offshore-wind-farm", "munmubaram", "windfloat-atlantic",
  ]);
  assert.equal(getCompanyIndex().find(({ id }) => id === "vestas").latestDate, news[0].publishedDate);
  assert.equal(getCompanyIndex().find(({ id }) => id === "vestas").updateCount, news.length);
});

for (const [name, mutate, pattern] of [
  ["unknown company", (link) => { link.companyId = "Vestas"; }, /unknown canonical company/],
  ["unknown Engineering edition", (link) => { link.source.editionSlug = "2026-11-15"; }, /unknown retained source/],
  ["missing Engineering source", (link) => { link.source.sourceRecordId = "unknown"; }, /unknown retained source/],
  ["unknown project", (link) => { link.projectId = "unknown"; }, /unknown or unlinked project/],
  ["unlinked project", (link) => { link.projectId = "green-volt"; }, /unknown or unlinked project/],
  ["unmentioned project", (link) => { link.projectId = "efgl"; }, /evidence must identify the linked project/],
  ["unsupported category", (link) => { link.category = "technology"; }, /unsupported primary category/],
  ["prototype property as category", (link) => { link.category = "toString"; }, /unsupported primary category/],
  ["multiple categories", (link) => { link.category = ["projects_contracts", "digital_ai"]; }, /unsupported primary category/],
  ["unsupported source kind", (link) => { link.source.kind = "news"; }, /expected a retained source reference/],
  ["copy of canonical headline", (link) => { link.title = "Headline"; }, /unexpected fields/],
  ["invented evidence", (link) => { link.storedExcerpt += " invented"; }, /exact stored excerpt/],
  ["evidence missing the company", (link) => { link.storedExcerpt = "Port-La Nouvelle"; }, /identifying the company/],
  ["invalid review date", (link) => { link.mappingReviewedOn = "2026-02-30"; }, /invalid mapping review date/],
  ["future review date", (link) => { link.mappingReviewedOn = "2026-11-20"; }, /invalid mapping review date/],
]) test(`link validation rejects ${name}`, () => {
  const [link] = structuredClone(dataset.links);
  mutate(link);
  assert.throws(() => resolve([link]), pattern);
});

test("all five controlled categories accept a single primary category", () => {
  for (const category of ["projects_contracts", "technology_engineering", "digital_ai", "manufacturing_supply_chain", "corporate_market"]) {
    const records = resolve([{ ...dataset.links[0], category }]).get("vestas");
    assert.equal(records[0].category, category);
  }
});

test("an unselected Engineering candidate resolves directly from its retained source", () => {
  const edition = require("../data/briefings/2026-10-11.json");
  const sourceRecordId = "eng-src-2026-10-11-buchan-certification";
  assert.equal(edition.engineeringSelection.candidates.find((candidate) => candidate.sourceRecordId === sourceRecordId).selected, false);
  const link = engineeringLink("dnv", edition.weekEnd, sourceRecordId, "DNV awarded Basic Design Certification");
  assert.equal(resolve([link]).get("dnv")[0].id, sourceRecordId);
});

test("Digital & AI links use a Signal and one of its dated original sources", () => {
  const link = {
    companyId: "ocean-winds", category: "digital_ai", storedExcerpt: "Ocean Winds", mappingReviewedOn: reviewDate,
    source: { kind: "digital_ai", signalId: "atlantis-autonomous-robots-windfloat-atlantic", sourceId: "src-inesc-atlantis-robots" },
  };
  const [record] = resolve([link]).get("ocean-winds");
  assert.equal(record.publishedDate, "2023-11-06");
  assert.match(record.title, /^ATLANTIS/);
  assert.throws(() => resolve([{ ...link, source: { ...link.source, sourceId: "src-arpae-digifloat" } }]), /unknown retained source/);
  assert.throws(() => resolve([{ ...link, source: { ...link.source, signalId: "missing" } }]), /unknown retained source/);
  assert.throws(() => resolve([{
    ...link, companyId: "principle-power", storedExcerpt: "Principle Power",
    source: { kind: "digital_ai", signalId: "digifloat-windfloat-atlantic-digital-twin", sourceId: "src-arpae-digifloat" },
  }]), /source must have a publication date/);
});

test("same-date records order by retained ID regardless of mapping order", () => {
  const a = engineeringLink("ocergy", "2026-11-01", "eng-src-2026-11-01-ont-ocergy", "Reports the same Ocergy company update");
  const b = engineeringLink("ocergy", "2026-11-01", "eng-src-2026-11-01-os-ocergy", "Reports the same Ocergy statement");
  const records = resolve([b, a]).get("ocergy");
  assert.deepEqual(records.map(({ id }) => id), [a.source.sourceRecordId, b.source.sourceRecordId]);
  assert.deepEqual(records, resolve([a, b]).get("ocergy"));
});

test("repeated mappings and the same original source across editions produce one record", () => {
  const a = engineeringLink("dnv", "2026-10-25", "eng-src-2026-10-25-dnv-japan", "Japan's Flag Administration authorized DNV");
  const b = engineeringLink("dnv", "2026-11-01", "eng-src-2026-11-01-dnv-prior-week", "Japanese authorization of DNV floating wind rules");
  const records = resolve([b, a, a]).get("dnv");
  assert.deepEqual(records.map(({ id }) => id), [a.source.sourceRecordId]);
  assert.deepEqual(records, resolve([a, b]).get("dnv"));
  assert.throws(() => resolve([a, { ...b, category: "corporate_market" }]), /conflicting mappings/);
});
