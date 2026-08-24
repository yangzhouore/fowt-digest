/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  validateStaticBriefings,
} = require("./validate-static-briefings.js");

test("valid engineering briefing fixture passes", () => {
  const fixture = createFixture();

  assert.deepEqual(runValidation(fixture), []);
});

test("valid engineering briefing fixture with selection score passes", () => {
  const fixture = createFixture({ briefing: validBriefingWithSelection() });

  assert.deepEqual(runValidation(fixture), []);
});

test("missing source provenance fails", () => {
  const fixture = createFixture({
    mutateSource: (source) => {
      delete source.publisher;
    },
  });

  assertHasError(fixture, "publisher must be a non-empty string");
});

test("briefing item missing source record fails", () => {
  const fixture = createFixture({
    mutateItem: (item) => {
      item.sourceRecordIds = ["eng-src-missing"];
    },
  });

  assertHasError(fixture, "missing source record eng-src-missing");
});

test("unsupported briefing category fails", () => {
  const fixture = createFixture({
    mutateItem: (item) => {
      item.category = "finance";
    },
  });

  assertHasError(fixture, "category has unsupported value finance");
});

test("engineering selection candidate missing source record fails", () => {
  const fixture = createFixture({
    briefing: validBriefingWithSelection(),
    mutateBriefing: (briefing) => {
      briefing.engineeringSelection.candidates[0].sourceRecordId = "eng-src-missing";
    },
  });

  assertHasError(fixture, "missing source record eng-src-missing");
});

test("engineering selection score total must equal component sum", () => {
  const fixture = createFixture({
    briefing: validBriefingWithSelection(),
    mutateBriefing: (briefing) => {
      briefing.engineeringSelection.candidates[0].engineeringSelectionScore.total = 99;
    },
  });

  assertHasError(fixture, "engineeringSelectionScore.total must equal component sum");
});

test("engineering selected candidate must reference briefing item", () => {
  const fixture = createFixture({
    briefing: validBriefingWithSelection(),
    mutateBriefing: (briefing) => {
      briefing.engineeringSelection.candidates[0].selectedBriefingItemId = "eng-item-missing";
    },
  });

  assertHasError(fixture, "selected candidate must reference an existing briefing item");
});

test("unregistered engineering briefing JSON fails", () => {
  const fixture = createFixture();
  writeBriefing(
    fixture.briefingDir,
    "2026-01-11.json",
    validBriefing({ weekStart: "2026-01-05", weekEnd: "2026-01-11" }),
  );

  assertHasError(fixture, "2026-01-11.json: JSON file is not imported");
});

function assertHasError(fixture, expected) {
  const errors = runValidation(fixture);
  assert.ok(
    errors.some((error) => error.includes(expected)),
    `Expected error containing ${JSON.stringify(expected)}. Actual errors:\n${errors.join("\n")}`,
  );
}

function runValidation(fixture) {
  return validateStaticBriefings({
    briefingDir: fixture.briefingDir,
    adapterPath: fixture.adapterPath,
  });
}

function createFixture({
  briefing = validBriefing(),
  fileName = "2026-01-04.json",
  mutateSource,
  mutateItem,
  mutateBriefing,
  adapterSource: customAdapterSource,
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fowt-briefing-"));
  const briefingDir = path.join(root, "briefings");
  fs.mkdirSync(briefingDir);
  const adapterPath = path.join(root, "engineering-briefing-adapter.ts");

  if (isObject(briefing)) {
    if (mutateSource) {
      mutateSource(briefing.sourceRecords[0]);
    }
    if (mutateItem) {
      mutateItem(briefing.briefingItems[0]);
    }
    if (mutateBriefing) {
      mutateBriefing(briefing);
    }
  }

  writeBriefing(briefingDir, fileName, briefing);
  fs.writeFileSync(
    adapterPath,
    customAdapterSource ??
      adapterSource([["briefing20260104Json", "2026-01-04.json"]]),
  );

  return { adapterPath, briefingDir };
}

function writeBriefing(briefingDir, fileName, briefing) {
  fs.writeFileSync(path.join(briefingDir, fileName), JSON.stringify(briefing, null, 2));
}

function adapterSource(registrations) {
  return [
    ...registrations.map(
      ([variableName, target]) =>
        `import ${variableName} from "./briefings/${target}";`,
    ),
    "",
    "const engineeringBriefingJsonFiles = [",
    ...registrations.map(([variableName]) => `  ${variableName},`),
    "];",
  ].join("\n");
}

function validBriefing({
  weekStart = "2025-12-29",
  weekEnd = "2026-01-04",
} = {}) {
  return {
    schemaVersion: "engineering-briefing.v1",
    weekStart,
    weekEnd,
    generatedAt: "2026-01-04T09:00:00Z",
    sourceRecords: [validSourceRecord()],
    briefingItems: [validBriefingItem()],
  };
}

function validBriefingWithSelection() {
  const briefing = validBriefing();
  briefing.engineeringSelection = {
    candidatePoolType: "retained_source_records",
    selectionModel: {
      id: "engineering_selection_score_v1",
      label: "Engineering Selection Score",
      description: "Deterministic Engineering score.",
      components: [
        { componentId: "engineering_relevance", label: "Engineering relevance", maxScore: 30 },
        { componentId: "project_company", label: "Project / company", maxScore: 25 },
        { componentId: "technology", label: "Technology", maxScore: 20 },
        { componentId: "policy_market", label: "Policy / market", maxScore: 15 },
        { componentId: "source_quality", label: "Source quality", maxScore: 10 },
      ],
      diversityRules: ["Rank by score.", "Apply diversity."],
    },
    candidates: [
      {
        candidateId: "eng-src-2026-01-04-example",
        sourceRecordId: "eng-src-2026-01-04-example",
        selected: true,
        selectedBriefingItemId: "eng-item-2026-01-04-01",
        rawRank: 1,
        finalRank: 1,
        selectionReason: "selected_after_diversity",
        diversityReason: "Selected by score while adding source/project coverage.",
        engineeringSelectionScore: {
          modelId: "engineering_selection_score_v1",
          total: 50,
          maxScore: 100,
          components: [
            scoreComponent("engineering_relevance", "Engineering relevance", 30, 20),
            scoreComponent("project_company", "Project / company", 25, 10),
            scoreComponent("technology", "Technology", 20, 5),
            scoreComponent("policy_market", "Policy / market", 15, 5),
            scoreComponent("source_quality", "Source quality", 10, 10),
          ],
        },
        diversitySignals: {
          publisher: "Example Publisher",
          projectGroup: null,
          topicGroup: "engineering",
          regionHint: "Europe",
        },
      },
    ],
  };
  return briefing;
}

function scoreComponent(componentId, label, maxScore, score) {
  return {
    componentId,
    label,
    score,
    maxScore,
    evidence: [`${label} evidence`],
  };
}

function validSourceRecord() {
  return {
    sourceRecordId: "eng-src-2026-01-04-example",
    sourceType: "industry_news",
    publisher: "Example Publisher",
    title: "Example source title",
    sourceUrl: "https://example.com/source",
    publishedDate: "2026-01-03",
    retrievedAt: "2026-01-04T09:00:00Z",
    collectionMethod: "manual",
    sourceText: "Example source-backed factual text.",
    licenseNote: "Public webpage.",
  };
}

function validBriefingItem() {
  return {
    briefingItemId: "eng-item-2026-01-04-01",
    title: "Example engineering highlight",
    oneLineSummary: "Example source-backed engineering summary.",
    category: "project",
    region: "Europe",
    sourceRecordIds: ["eng-src-2026-01-04-example"],
    sourceUrl: "https://example.com/source",
    explanation: "Example source-backed explanation.",
    whyItMatters: "Example source-backed why-it-matters note.",
    engineeringTopics: ["Floating wind"],
  };
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
