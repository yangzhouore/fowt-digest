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

test("company routes retain reviewed developments and include source-backed project company profiles", () => {
  const directory = getCompanyIndex();
  const curated = directory.filter(({ profilePending }) => !profilePending);
  assert.equal(curated.length, 47);
  assert.equal(new Set(directory.map((company) => company.id)).size, directory.length);
  for (const entry of directory) assert.equal(getCompanyIntelligence(entry.id).company.name, entry.name);
  assert.equal(getCompanyIntelligence("Vestas"), undefined);
  assert.ok(curated.every(({ updateCount }) => updateCount > 0));
  const cnooc = getCompanyIntelligence("cnooc");
  assert.equal(cnooc.company.profilePending, true);
  assert.equal(cnooc.company.description, "");
  assert.equal(cnooc.company.website, "");
  assert.equal(cnooc.company.countryRegion, "China");
  assert.ok(cnooc.news.some(({ id }) => id === "haiyou-guanlan-first-grid-connection"));
  assert.ok(directory.find(({ id }) => id === "cnooc").logo);
  assert.ok(directory.every(({ countryRegion, updateCount }) => countryRegion && updateCount > 0));
  assert.equal(cnooc.projects[0].slug, "haiyou-guanlan");
});

test("Vestas renders the full reviewed period using event IDs and the lead original source", () => {
  const { company, news, projects } = getCompanyIntelligence("vestas");
  const events = getCompanyEvents().filter((event) => event.companyIds.includes("vestas"));
  assert.equal(company.countryRegion, "Denmark / Global");
  assert.equal(news.length, 162);
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

test("TetraSpar commissioning keeps its event identity with its verified developer and turbine memberships", () => {
  const event = getCompanyEvents().find(({ id }) => id === "tetraspar-demonstrator-commissioned");
  assert.equal(event.publishedDate, "2021-12-01");
  assert.deepEqual([...event.companyIds].sort(), ["rwe", "shell", "siemens-gamesa", "stiesdal-offshore"]);
  assert.match(event.summary, /Siemens Gamesa/);
  assert.equal(event.sources.length, 2);
  assert.ok(!getCompanyIntelligence("vestas").news.some(({ id }) => id === event.id));
});

test("historical names belong to the linked Industry identity without overriding publishers", () => {
  const events = getCompanyEvents();
  assert.equal(events.filter((event) =>
    event.historicalAttributions.some(({ companyId, name }) => companyId === "vestas" && name === "MHI Vestas Offshore Wind")).length, 76);
  const legacy = events.find(({ id }) => id === windfloat.id);
  assert.deepEqual(legacy.historicalAttributions, [{ companyId: "vestas", name: "MHI Vestas Offshore Wind" }]);
  assert.equal(legacy.sources[0].publisher, "MHI Vestas Offshore Wind");
  const acquisition = events.find(({ id }) => id === "vestas-mhi-offshore-jv-acquisition-closed");
  assert.deepEqual(acquisition.historicalAttributions, []);
  assert.equal(acquisition.sources[0].publisher, "Vestas");
});

test("a reviewed Vestas and Equinor event shares one event identity across both company indexes", () => {
  const order = lookup("empire-wind-1-firm-order");
  const [event] = resolve([order]);
  const index = indexCompanyEvents([event]);
  assert.strictEqual(index.get("vestas")[0], index.get("equinor")[0]);
  assert.equal(event.id, "empire-wind-1-firm-order");
  assert.deepEqual(event.companyIds, ["vestas", "equinor"]);
});

test("expanded timelines share canonical events and preserve sparse reviewed coverage", () => {
  const events = getCompanyEvents();
  assert.ok(events.every(({ publishedDate }) => "2018-01-01" <= publishedDate && publishedDate <= "2026-11-20"));
  const index = indexCompanyEvents(events);
  const award = events.find(({ id }) => id === "hywind-tampen-main-contract-awards");
  assert.equal(award.sources.length, 2);
  for (const companyId of ["equinor", "siemens-gamesa", "jdr-cables", "subsea7-seaway7"]) {
    assert.strictEqual(index.get(companyId).find(({ id }) => id === award.id), award);
    assert.equal(getCompanyIntelligence(companyId).news.find(({ id }) => id === award.id).projects[0].slug, "hywind-tampen");
  }
  const { news } = getCompanyIntelligence("vryhof");
  assert.ok(news.length > 0 && news.length < getCompanyIntelligence("vestas").news.length);
  assert.ok(news.some((event) => event.projects.some(({ slug }) => slug === "windfloat-atlantic")));
  const legacy = events.find(({ id }) => id === "dnv-gl-floating-certification-guidelines");
  assert.deepEqual(legacy.historicalAttributions, [{ companyId: "dnv", name: "DNV GL" }]);
  const floatm = index.get("vicinay-marine").find(({ id }) => id === "floatm-reports-floating-om-research-progress");
  assert.strictEqual(index.get("saitec-offshore").find(({ id }) => id === floatm.id), floatm);
  assert.deepEqual(floatm.historicalAttributions, [{ companyId: "vicinay-marine", name: "Vicinay Cadenas" }]);
});

test("supplier timelines share the Culzean subcontract and preserve contract stages and publisher attribution", () => {
  const events = getCompanyEvents();
  const index = indexCompanyEvents(events);
  const subcontract = events.find(({ id }) => id === "culzean-delmar-lankhorst-mooring-line-subcontract");
  for (const companyId of ["delmar-systems", "ocergy", "totalenergies"]) {
    assert.strictEqual(index.get(companyId).find(({ id }) => id === subcontract.id), subcontract);
  }
  assert.deepEqual(subcontract.projectIds, ["culzean-demo-floating-wind"]);
  const award = events.find(({ id }) => id === "culzean-delmar-mooring-contract");
  assert.ok(award.publishedDate < subcontract.publishedDate);
  assert.deepEqual(award.sources.map(({ publisher }) => publisher), ["Delmar Systems", "offshoreWIND.biz"]);
  const equipment = index.get("hitachi-energy").find(({ id }) => id === "hitachi-abb-first-66kv-offshore-hybrid-switchgear");
  assert.equal(equipment.sources[0].publisher, "Hitachi");
  assert.deepEqual(equipment.historicalAttributions, [{ companyId: "hitachi-energy", name: "Hitachi ABB Power Grids" }]);
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

test("the Phase 1 catalogue shares the Ostwind award and preserves certification attribution", () => {
  const events = getCompanyEvents();
  const byCompany = indexCompanyEvents(events);
  const award = byCompany.get("nkt").find(({ id }) => id === "ostwind-two-nkt-export-cable-order");
  assert.strictEqual(byCompany.get("boskalis").find(({ id }) => id === award.id), award);
  assert.deepEqual(award.sources.map(({ publisher }) => publisher), ["NKT", "Boskalis"]);
  const qualification = byCompany.get("bureau-veritas").find(({ id }) => id === "snapwind-float-bureau-veritas-approval");
  assert.strictEqual(byCompany.get("lloyds-register").find(({ id }) => id === qualification.id), qualification);
  assert.deepEqual(qualification.sources.map(({ publisher }) => publisher), ["Bureau Veritas", "Lloyd's Register"]);
  const verification = byCompany.get("dnv").find(({ id }) => id === "hywind-tampen-dnv-gl-verification-study");
  assert.deepEqual(verification.historicalAttributions, [{ companyId: "dnv", name: "DNV GL" }]);
  assert.deepEqual(verification.projectIds, ["hywind-tampen"]);
  assert.ok(byCompany.get("corio-generation").every(({ publishedDate }) => publishedDate >= "2022-01-01"));
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
