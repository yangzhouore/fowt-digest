/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const dataset = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "digital-ai", "signals.json"), "utf8"),
);

const useCaseDataset = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "data", "digital-ai", "use-cases.json"), "utf8",
));

test("practical cards cover all ten applications with complete bilingual workflows", () => {
  assert.equal(useCaseDataset.workflowBasis, "illustrative");
  const ids = useCaseDataset.cases.map((item) => item.id);
  assert.equal(new Set(ids).size, 10);
  assert.deepEqual([...ids].sort(), ["forecasting", "engineering", "vision", "planning", "control", "twin", "predictive", "autonomy", "cable", "grid"].sort());
  for (const item of useCaseDataset.cases) {
    for (const field of ["title", "problem", "user", "inputs", "method", "output", "decision", "limitation", "unknown"]) {
      for (const language of ["en", "zh"]) {
        assert.ok(item[field][language].trim().length > 0, `${item.id}.${field}.${language} missing`);
        if (language === "zh") assert.match(item[field][language], /[\u3400-\u9fff]/, `${item.id}.${field} needs Chinese copy`);
      }
    }
    assert.equal(item.maturity, undefined, "maturity belongs to dated evidence, not an application");
  }
});

test("card evidence resolves to the cited source of each existing Signal", () => {
  const evidence = new Map(useCaseDataset.evidence.map((entry) => [entry.signalId, entry]));
  assert.equal(evidence.size, useCaseDataset.evidence.length);
  const referenced = new Set();
  for (const item of useCaseDataset.cases) {
    assert.equal(new Set(item.signalIds).size, item.signalIds.length);
    if (item.featuredSignalId) assert.ok(item.signalIds.includes(item.featuredSignalId));
    for (const id of item.signalIds) {
      referenced.add(id);
      const record = evidence.get(id);
      assert.ok(record, `${item.id}: missing evidence ${id}`);
      const signal = dataset.signals.find((entry) => entry.id === id);
      assert.ok(signal, `unknown Signal ${id}`);
      assert.ok(signal.sourceIds.includes(record.sourceId), `${id}: unrelated source`);
      assert.ok(dataset.sources.some((source) => source.sourceId === record.sourceId));
      for (const language of ["en", "zh"]) assert.ok(record.claim[language].length > 20);
      assert.ok(["public_source", "stored_context"].includes(record.basis));
      if (record.basis === "public_source") assert.match(record.reviewedDate, /^\d{4}-\d{2}-\d{2}$/);
      else assert.equal(record.reviewedDate, null, "inaccessible sources cannot claim a fresh review");
    }
  }
  assert.deepEqual([...referenced].sort(), [...evidence.keys()].sort());
});

test("unsupported areas remain empty and EPROA retains its verification boundary", () => {
  assert.deepEqual(useCaseDataset.cases.filter((item) => !item.signalIds.length).map((item) => item.id).sort(), ["planning", "vision"]);
  for (const item of useCaseDataset.cases.filter((item) => !item.signalIds.length)) assert.equal(item.featuredSignalId, null);
  const eproa = useCaseDataset.evidence.find((entry) => entry.signalId === "eproa-ai-digital-platform-floating-wind-om");
  assert.equal(eproa.basis, "stored_context");
  assert.match(eproa.claim.en, /could not be rechecked/);
  assert.match(useCaseDataset.cases.find((item) => item.id === "predictive").limitation.en, /does not establish remaining life/);
});

const TOPICS = new Set([
  "ai_for_engineering",
  "digital_twin",
  "autonomous_om_robotics",
  "industrial_software_digital_engineering",
  "smart_grid_forecasting",
  "ai_infrastructure_data_centres",
]);

test("Digital and AI MVP has a small source-backed signal set", () => {
  assert.ok(dataset.signals.length >= 12);
  assert.ok(dataset.signals.length <= 20);
  assert.equal(dataset.sources.length, dataset.signals.length);
});

test("Digital and AI signals cover accepted taxonomy and source diversity", () => {
  const topics = new Set(dataset.signals.map((signal) => signal.topic));
  const sourceClasses = new Set(dataset.sources.map((source) => source.sourceClass));
  assert.ok(topics.size >= 4);
  assert.ok(sourceClasses.size >= 3);
  for (const topic of topics) {
    assert.ok(TOPICS.has(topic), `unsupported topic ${topic}`);
  }
});

test("Digital and AI slugs are unique and route-safe", () => {
  const slugs = dataset.signals.map((signal) => signal.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
});

test("Digital and AI source links resolve through stored source IDs", () => {
  const sourceIds = new Set(dataset.sources.map((source) => source.sourceId));
  for (const signal of dataset.signals) {
    assert.ok(signal.sourceIds.length > 0, `${signal.id} missing sources`);
    for (const sourceId of signal.sourceIds) {
      assert.ok(sourceIds.has(sourceId), `${signal.id} references missing ${sourceId}`);
    }
  }
});

test("Digital and AI signals state a direct sector connection", () => {
  for (const signal of dataset.signals) {
    assert.ok(signal.connectionToFowt.length > 40, `${signal.id} has weak connection text`);
    assert.doesNotMatch(signal.connectionToFowt.toLowerCase(), /generic ai news/);
  }
});
