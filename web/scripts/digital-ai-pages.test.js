/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const dataset = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "digital-ai", "signals.json"), "utf8"),
);

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
