/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { validateStaticDigitalAi } = require("./validate-static-digital-ai.js");

test("valid Digital and AI fixture passes", () => {
  assert.deepEqual(runValidation(createFixture()), []);
});

test("duplicate signal IDs fail", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.signals.push({ ...dataset.signals[0], slug: "other-signal" });
    },
  });

  assertHasError(fixture, "duplicate signal id");
});

test("unsupported topic fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.signals[0].topic = "generic_ai";
    },
  });

  assertHasError(fixture, "topic has unsupported value generic_ai");
});

test("signals require source provenance", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.signals[0].sourceIds = ["missing-source"];
    },
  });

  assertHasError(fixture, "missing source record missing-source");
});

test("weak FOWT connection fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.signals[0].connectionToFowt = "This is a generic enterprise AI announcement.";
    },
  });

  assertHasError(fixture, "connectionToFowt must state");
});

test("malformed source record fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.sources[0].sourceClass = "blog";
    },
  });

  assertHasError(fixture, "sourceClass has unsupported value blog");
});

function assertHasError(fixture, expected) {
  const errors = runValidation(fixture);
  assert.ok(
    errors.some((error) => error.includes(expected)),
    `Expected error containing ${JSON.stringify(expected)}. Actual errors:\n${errors.join("\n")}`,
  );
}

function runValidation(fixture) {
  return validateStaticDigitalAi({ dataPath: fixture.dataPath });
}

function createFixture({ mutateDataset } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fowt-digital-ai-"));
  const dataPath = path.join(root, "signals.json");
  const dataset = validDataset();
  if (mutateDataset) {
    mutateDataset(dataset);
  }
  fs.writeFileSync(dataPath, JSON.stringify(dataset, null, 2));
  return { dataPath };
}

function validDataset() {
  return {
    schemaVersion: "digital-ai-signals.v1",
    generatedDate: "2026-08-24",
    sources: [
      {
        sourceId: "src-example",
        title: "Example official source",
        publisher: "Example Publisher",
        url: "https://example.com/source",
        sourceClass: "government_regulator",
        sourceTier: 1,
        publishedDate: "2026-01-01",
        accessedDate: "2026-08-24",
        licenseNote: "Public page; factual extraction only.",
      },
    ],
    signals: [
      {
        id: "example-signal",
        slug: "example-signal",
        title: "Example signal",
        dateLabel: "1 Jan 2026",
        sortDate: "2026-01-01",
        topic: "digital_twin",
        maturity: "prototype",
        country: "Exampleland",
        region: "Europe",
        connectionToFowt: "The source connects this digital twin to offshore wind farm operations.",
        shortDescription: "Example source-backed description.",
        whyItMatters: "Example source-grounded reason.",
        organizations: ["Example Organisation"],
        technologyTags: ["digital twin"],
        evidenceType: "official_source",
        sourceIds: ["src-example"],
      },
    ],
  };
}
