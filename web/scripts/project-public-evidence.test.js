/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const ts = require("typescript");
const { validateEvidenceDataset, AREAS } = require("./validate-project-public-evidence");
const factual = require("../data/projects/projects.json");
const evidence = require("../data/projects/public-evidence.json");
const validate = (data = evidence, facts = factual) => validateEvidenceDataset(data, facts, { today: "2026-10-21" });
const copy = (value) => JSON.parse(JSON.stringify(value));
const pilot = (data) => data.projects.find((project) => project.projectId === "green-volt");

function loadAdapter(data = evidence) {
  const file = path.join(__dirname, "..", "data", "project-public-evidence-adapter.ts");
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const context = { exports: {}, require: (name) => {
    assert.equal(name, "./projects/public-evidence.json");
    return data;
  } };
  vm.runInNewContext(compiled.outputText, context);
  return context.exports;
}
function projectWithRelations(id) {
  return { ...factual.projects.find((project) => project.id === id),
    relationships: factual.projectCompanyRelationships.filter((item) => item.projectId === id),
    timelineEvents: factual.timelineEvents.filter((item) => item.projectId === id), sources: factual.sources };
}

test("all projects have exactly six explicit, valid evidence areas", () => {
  assert.deepEqual(validate(), []);
  assert.equal(evidence.projects.length, factual.projects.length);
  const adapter = loadAdapter();
  for (const record of evidence.projects) {
    const resolved = adapter.getProjectPublicEvidence(projectWithRelations(record.projectId));
    assert.deepEqual(copy(resolved.areas.map((area) => area.area)), AREAS);
    for (const area of resolved.areas) {
      assert.equal(area.items.length, record.areas.find((entry) => entry.area === area.area).recordRefs.length);
      for (const item of area.items) assert.ok(item.sources.length > 0);
    }
  }
});

for (const [name, mutate, pattern] of [
  ["missing project", (d) => d.projects.pop(), /cover every project/],
  ["duplicate project", (d) => d.projects.push(copy(d.projects[0])), /duplicates/],
  ["missing area", (d) => d.projects[0].areas.pop(), /six readiness areas/],
  ["duplicate area", (d) => d.projects[0].areas[0] = copy(d.projects[0].areas[1]), /duplicates/],
  ["stale fact text", (d) => d.projects[0].areas[2].recordRefs[0].key += " edited", /unresolved/],
  ["cross-project fact", (d) => d.projects[0].areas[0].recordRefs.push(copy(pilot(d).areas[0].recordRefs[0])), /cross-project/],
  ["inference presented as fact", (d) => d.projects[0].areas[0].recordRefs.push({kind:"editorial_inference", key:"test"}), /inferences cannot/],
  ["duplicate evidence", (d) => d.projects[0].areas[2].recordRefs.push(copy(d.projects[0].areas[2].recordRefs[0])), /duplicates/],
  ["unresolved watchpoint", (d) => d.projects[0].areas[0].watchpointRefs.push("unrecorded signal"), /watchpoint/],
  ["invented review date", (d) => d.projects[0].reviewedOn = "2026-10-21", /unexpected field reviewedOn/],
  ["malformed date", (d) => pilot(d).reviews[0].date = "2026-02-30", /valid YYYY/],
  ["future date", (d) => pilot(d).reviews[0].date = "2027-01-01", /future/],
  ["access after review", (d) => pilot(d).reviews[0].sources[0].accessedDate = "2026-10-22", /access date follows/],
  ["unreviewed finding source", (d) => pilot(d).reviews[0].sources[0].material = "unavailable", /not actually inspected/],
  ["incomplete review scope", (d) => pilot(d).reviews[0].scope.pop(), /all six areas/],
  ["incomplete review coverage", (d) => pilot(d).reviews[0].coverage.pop(), /watchpoints coverage/],
  ["incomplete findings", (d) => pilot(d).reviews[0].findings.pop(), /finding for every area/],
  ["unresolved change review", (d) => pilot(d).changes[0].reviewId = "missing", /unresolved reviewId/],
  ["uninspected change source", (d) => pilot(d).changes[0].sourceIds = ["src-green-volt-surveys-2026"], /not inspected/],
  ["missing before value", (d) => pilot(d).changes[0].before = "", /before.*non-empty/],
  ["invalid collection", (d) => pilot(d).reviews[0].sources = null, /must be an array/],
]) test(`rejects ${name}`, () => {
  const data = copy(evidence); mutate(data); assert.match(validate(data).join("\n"), pattern);
});

test("rejects source-free and ambiguously repeated original facts", () => {
  const facts = copy(factual);
  facts.projects[0].intelligence.confirmedFacts[0].sourceIds = [];
  assert.match(validate(evidence, facts).join("\n"), /source-free/);
  facts.projects[0].intelligence.confirmedFacts.push(copy(facts.projects[0].intelligence.confirmedFacts[1]));
  assert.match(validate(evidence, facts).join("\n"), /ambiguous/);
});

test("resolves source provenance per item without inheriting unrelated project sources", () => {
  const adapter = loadAdapter();
  const resolved = adapter.getProjectPublicEvidence(projectWithRelations("green-volt"));
  const revenue = resolved.areas.find((area) => area.area === "Revenue");
  assert.deepEqual(copy(revenue.items[0].sources.map((source) => source.sourceId)), ["src-green-volt-cfd-ar6-govuk"]);
  assert.equal(revenue.items[0].sources[0].accessedDate, "2026-09-02");
  assert.equal(revenue.items[0].sources[0].inspection.accessedDate, "2026-10-21");
});

test("completed review dates exclude later partial reviews and never use source/event dates", () => {
  const data = copy(evidence);
  const record = pilot(data);
  const partial = { ...copy(record.reviews[0]), id: "partial", outcome: "partial", date: "2026-10-22" };
  record.reviews.push(partial);
  const adapter = loadAdapter(data);
  assert.equal(adapter.getProjectReviewSummary("green-volt").reviewedOn, "2026-10-21");
  assert.equal(adapter.getProjectReviewSummary("hywind-scotland").reviewedOn, null);
  record.reviews = [partial];
  assert.equal(loadAdapter(data).getProjectReviewSummary("green-volt").reviewedOn, null);
});

test("missing intelligence and records resolve to six empty areas without invented evidence", () => {
  const project = { ...projectWithRelations("hywind-scotland"), intelligence: undefined };
  const result = loadAdapter().resolveProjectPublicEvidence(project);
  assert.equal(result.reviewedOn, null);
  assert.equal(result.reviews.length, 0);
  assert.ok(result.areas.every((area) => area.items.length === 0 && area.watchpoints.length === 0));
});

test("timeline and relationship references retain event precision and historical role scope", () => {
  const project = projectWithRelations("hywind-tampen");
  const data = copy(evidence);
  const record = data.projects.find((entry) => entry.projectId === project.id);
  const event = project.timelineEvents.find((event) => event.id === "hywind-tampen-full-operation");
  const relationship = project.relationships.find((item) => item.status === "past");
  record.areas[5].recordRefs = [{kind:"timeline_event", key:event.id},{kind:"relationship",key:relationship.id}];
  assert.deepEqual(validate(data), []);
  const items = loadAdapter(data).getProjectPublicEvidence(project).areas[5].items;
  assert.equal(items[0].eventDate, "2023");
  assert.equal(items[1].context, relationship.sourceStatusText ?? "past");
  record.areas[5].recordRefs[0].key = "green-volt-consent-2024-04-19";
  assert.match(validate(data).join("\n"), /cross-project/);
});

test("unreviewed stored records never acquire newly inspected labels", () => {
  const resolved = loadAdapter().getProjectPublicEvidence(projectWithRelations("hywind-scotland"));
  assert.ok(resolved.areas.flatMap((area) => area.items).flatMap((item) => item.sources).every((source) => source.inspection === null));
});

test("only three approved pilots contain completed substantive review records", () => {
  assert.deepEqual(evidence.projects.filter((project) => project.reviews.some((review) => review.outcome === "completed")).map((project) => project.projectId).sort(), ["campionwind", "green-volt", "hywind-tampen"]);
});
