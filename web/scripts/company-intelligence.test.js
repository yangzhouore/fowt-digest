/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");
const dataset = require("../data/context/company-events.json");
const { loadCompanyIntelligence } = require("./validate-company-intelligence");

const { getCompanyIndex, getCompanyIntelligence, getCompanyEvents, resolveCompanyEvents, indexCompanyEvents } = loadCompanyIntelligence();
const reviewDate = "2026-11-19";
const resolve = (events) => resolveCompanyEvents({ ...dataset, events }, reviewDate);
const lookup = (id) => structuredClone(dataset.events.find((event) => event.id === id));
const eolmed = lookup("eolmed-first-floating-turbine-tow");
const windfloat = lookup("windfloat-atlantic-supplier-selection");

test("company routes use exact Industry IDs and unreviewed companies have zero updates", () => {
  const directory = getCompanyIndex();
  assert.equal(directory.length, 47);
  assert.equal(new Set(directory.map((company) => company.id)).size, directory.length);
  for (const entry of directory) assert.equal(getCompanyIntelligence(entry.id).company.name, entry.name);
  assert.equal(getCompanyIntelligence("Vestas"), undefined);
  assert.deepEqual(getCompanyIntelligence("equinor").news, []);
  assert.equal(directory.find((entry) => entry.id === "equinor").latestDate, undefined);
});

test("Vestas renders the full reviewed period using event IDs and the lead original source", () => {
  const { company, news, projects } = getCompanyIntelligence("vestas");
  const events = getCompanyEvents();
  assert.equal(company.countryRegion, "Denmark / Global");
  assert.equal(news.length, 163);
  assert.deepEqual(news.map(({ id }) => id), events.map(({ id }) => id));
  assert.ok(events.every(({ publishedDate }) => "2018-01-01" <= publishedDate && publishedDate <= "2026-11-19"));
  assert.deepEqual([...new Set(events.map(({ publishedDate }) => publishedDate.slice(0, 4)))],
    ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"]);
  assert.deepEqual(news, [...news].sort((a, b) =>
    b.publishedDate.localeCompare(a.publishedDate, "en") || a.id.localeCompare(b.id, "en")));
  assert.equal(news.filter((event) => event.projects.length).length, 21);
  assert.deepEqual(events.find(({ id }) => id === eolmed.id).sources[0].reference, {
    kind: "engineering", editionSlug: "2025-12-14", sourceRecordId: "eng-src-2025-12-14-eolmed-first-turbine",
  });
  assert.equal(news.find(({ id }) => id === eolmed.id).projects[0].slug, "eolmed");
  assert.equal(news.find(({ id }) => id === "neretek-bc90-collaboration").publisher, "Neretek");
  assert.deepEqual(projects.map(({ id }) => id).sort(), [
    "culzean-demo-floating-wind", "efgl", "eolmed", "kincardine-offshore-wind-farm", "munmubaram", "windfloat-atlantic",
  ]);
  const entry = getCompanyIndex().find(({ id }) => id === "vestas");
  assert.equal(entry.latestDate, news[0].publishedDate);
  assert.equal(entry.updateCount, news.length);
});

test("historical names belong to the linked Industry identity without overriding publishers", () => {
  const events = getCompanyEvents();
  assert.equal(events.filter((event) => event.historicalAttributions.length).length, 76);
  const legacy = events.find(({ id }) => id === windfloat.id);
  assert.deepEqual(legacy.historicalAttributions, [{ companyId: "vestas", name: "MHI Vestas Offshore Wind" }]);
  assert.equal(legacy.sources[0].publisher, "MHI Vestas Offshore Wind");
  const acquisition = events.find(({ id }) => id === "vestas-mhi-offshore-jv-acquisition-closed");
  assert.deepEqual(acquisition.historicalAttributions, []);
  assert.equal(acquisition.sources[0].publisher, "Vestas");
});

test("a reviewed Vestas and Equinor event shares one event identity across both company indexes", () => {
  const order = lookup("empire-wind-1-firm-order");
  order.companyIds.push("equinor");
  const [event] = resolve([order]);
  const index = indexCompanyEvents([event]);
  assert.strictEqual(index.get("vestas")[0], index.get("equinor")[0]);
  assert.equal(event.id, "empire-wind-1-firm-order");
  assert.deepEqual(event.companyIds, ["vestas", "equinor"]);
});

test("an event can reference multiple canonical projects backed by its reviewed evidence", () => {
  const event = lookup("efgl-first-turbine-assembly");
  event.projectIds.push("eolmed");
  event.sources.push({
    kind: "external", publisher: "Test fixture", url: "https://example.org/project-evidence",
    tier: "secondary", evidence: "Fixture evidence identifying Eolmed alongside EFGL and Vestas.",
  });
  assert.deepEqual(resolve([event])[0].projectIds, ["efgl", "eolmed"]);
});

test("parallel Nordlicht reporting is retained as two publications on one event", () => {
  const events = getCompanyEvents();
  assert.equal(events.some(({ id }) => id === "nordlicht-low-emission-steel"), false);
  const event = events.find(({ id }) => id === "nordlicht-i-ii-conditional-agreement");
  assert.deepEqual(event.sources.map(({ publisher }) => publisher), ["Vestas", "Vattenfall"]);
  assert.equal(event.publishedDate, "2024-06-17");
  assert.match(event.summary, /56 of the 112/);
  assert.equal(events.find(({ id }) => id === "neretek-bc90-collaboration").sources[1].reference.kind, "engineering");
});

test("the same publication can support distinct events, ordered deterministically by ID on a date tie", () => {
  const a = { ...windfloat, id: "fixture-a" };
  const b = { ...windfloat, id: "fixture-b" };
  assert.deepEqual(resolve([b, a]).map(({ id }) => id), [a.id, b.id]);
  assert.throws(() => resolve([a, { ...b, id: a.id }]), /duplicate event ID/);
});

for (const [name, mutate, message] of [
  ["unknown company", (e) => { e.companyIds = ["Vestas"]; }, /distinct canonical IDs/],
  ["missing companies", (e) => { e.companyIds = []; }, /distinct canonical IDs/],
  ["repeated company", (e) => { e.companyIds.push("vestas"); }, /distinct canonical IDs/],
  ["unsupported company link", (e) => { e.companyIds.push("equinor"); }, /identify each linked company/],
  ["unknown project", (e) => { e.projectIds = ["nonexistent"]; }, /distinct canonical IDs/],
  ["unsupported project link", (e) => { e.projectIds = ["efgl"]; }, /identify each linked project/],
  ["duplicate project", (e) => { e.projectIds.push("eolmed"); }, /distinct canonical IDs/],
  ["unknown category", (e) => { e.category = "toString"; }, /controlled primary category/],
  ["multiple categories", (e) => { e.category = ["projects_contracts", "digital_ai"]; }, /controlled primary category/],
  ["invalid date", (e) => { e.publishedDate = "2025-02-30"; }, /invalid publication or review date/],
  ["review before publication", (e) => { e.reviewedOn = "2024-01-01"; }, /invalid publication or review date/],
  ["future review date", (e) => { e.reviewedOn = "2026-11-20"; }, /invalid publication or review date/],
  ["bad historical identity", (e) => { e.historicalAttributions = [{ companyId: "vestas", name: "Unknown company" }]; }, /invalid historical company attribution/],
  ["unknown retained source", (e) => { e.sources[0].sourceRecordId = "missing"; }, /unknown retained source reference/],
  ["invalid source kind", (e) => { e.sources[0].kind = "generic_news"; }, /invalid source kind or reference/],
  ["missing sources", (e) => { e.sources = []; }, /at least one source/],
  ["bad source tier", (e) => { e.sources[0].tier = "unknown"; }, /invalid source fields or tier/],
  ["invented evidence", (e) => { e.sources[0].evidence += " invented"; }, /exact stored excerpt/],
  ["wrong lead source date", (e) => { e.publishedDate = "2025-12-09"; }, /lead source must match event date/],
  ["unusable URL", (e) => { e.sources[0] = { kind: "external", url: "javascript:alert(1)", publisher: "Fixture", tier: "primary" }; }, /original HTTPS URL/],
  ["weaker lead source", (e) => { e.sources.push({ kind: "external", url: "https://example.org/report", publisher: "Fixture", tier: "primary", evidence: "Fixture" }); }, /strongest available tier/],
]) test("event validation rejects " + name, () => {
  const event = structuredClone(eolmed);
  mutate(event);
  assert.throws(() => resolve([event]), message);
});

test("normalized source URLs deduplicate inside an event and retained coverage requires its canonical reference", () => {
  const event = structuredClone(windfloat);
  event.sources.push({ ...event.sources[0], url: event.sources[0].url + "/?utm_source=test#test", evidence: event.summary });
  assert.throws(() => resolve([event]), /duplicate source publication within event/);
  const reference = getCompanyEvents().find(({ id }) => id === eolmed.id).sources[0];
  event.sources = [{ kind: "external", url: reference.url, publisher: reference.publisher, tier: reference.tier }];
  assert.throws(() => resolve([event]), /reuse the retained source reference/);
});

test("an unselected Engineering candidate resolves directly from its retained source", () => {
  const edition = require("../data/briefings/2026-10-11.json");
  const sourceRecordId = "eng-src-2026-10-11-buchan-certification";
  assert.equal(edition.engineeringSelection.candidates.find((candidate) => candidate.sourceRecordId === sourceRecordId).selected, false);
  const source = edition.sourceRecords.find((record) => record.sourceRecordId === sourceRecordId);
  const [event] = resolve([{
    ...eolmed, companyIds: ["dnv"], projectIds: [], publishedDate: source.publishedDate, id: "buchan-certification-fixture",
    sources: [{ kind: "engineering", editionSlug: edition.weekEnd, sourceRecordId,
      tier: "secondary", evidence: "DNV awarded Basic Design Certification" }],
  }]);
  assert.equal(event.sources[0].reference.sourceRecordId, sourceRecordId);
});

test("Digital & AI citations resolve exact Signal and source IDs", () => {
  const event = {
    ...eolmed, id: "atlantis-fixture", companyIds: ["ocean-winds"], projectIds: [],
    publishedDate: "2023-11-06", title: "ATLANTIS fixture", summary: "Ocean Winds fixture.",
    sources: [{ kind: "digital_ai", signalId: "atlantis-autonomous-robots-windfloat-atlantic",
      sourceId: "src-inesc-atlantis-robots", tier: "primary", evidence: "Ocean Winds" }],
  };
  const [resolved] = resolve([event]);
  assert.deepEqual(resolved.sources[0].reference, {
    kind: "digital_ai", signalId: "atlantis-autonomous-robots-windfloat-atlantic", sourceId: "src-inesc-atlantis-robots",
  });
  event.sources[0].sourceId = "src-arpae-digifloat";
  assert.throws(() => resolve([event]), /unknown retained source reference/);
});
