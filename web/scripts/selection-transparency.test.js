/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const {
  SCORE_MODEL_ID,
  buildEngineeringCandidatePool,
  scoreEngineeringSourceRecord,
} = require("./engineering-selection-scoring.js");
const {
  SOURCE_CLASSES,
  validateEngineeringSourceRegistry,
  validateRegistryBackedCollectionAudit,
} = require("./engineering-source-registry.js");

const researchCandidateDir = path.join(__dirname, "..", "data", "research-candidates");
const researchPools = fs.readdirSync(researchCandidateDir)
  .filter((fileName) => fileName.endsWith(".json"))
  .sort()
  .map((fileName) => JSON.parse(fs.readFileSync(path.join(researchCandidateDir, fileName), "utf8")));
const researchDigests = new Map(
  fs.readdirSync(path.join(__dirname, "..", "data", "digests"))
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const digest = JSON.parse(
        fs.readFileSync(path.join(__dirname, "..", "data", "digests", fileName), "utf8"),
      );
      return [digest.weekEnd, digest];
    }),
);
const engineeringBriefingDir = path.join(__dirname, "..", "data", "briefings");
const engineeringSourceRegistry = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "engineering-source-registry.json"), "utf8"),
);
const engineeringBriefing = JSON.parse(
  fs.readFileSync(path.join(engineeringBriefingDir, "2026-08-30.json"), "utf8"),
);
const engineeringBackfillBriefings = fs.readdirSync(engineeringBriefingDir)
  .filter((fileName) => fileName >= "2026-04-05.json" && fileName <= "2026-08-30.json")
  .sort()
  .map((fileName) => JSON.parse(fs.readFileSync(path.join(engineeringBriefingDir, fileName), "utf8")));

const expectedScoreComponents = new Set([
  "fowt_relevance",
  "technical_specificity",
  "research_value",
  "venue_quality",
  "metadata_quality",
  "recency",
]);

const expectedEngineeringComponents = new Map([
  ["engineering_relevance", 30],
  ["project_company", 25],
  ["technology", 20],
  ["policy_market", 15],
  ["source_quality", 10],
]);

const expectedResearchCounts = new Map([
  ["2026-04-05", 118],
  ["2026-04-12", 91],
  ["2026-04-19", 95],
  ["2026-04-26", 90],
  ["2026-05-03", 197],
  ["2026-05-10", 95],
  ["2026-05-17", 81],
  ["2026-05-24", 92],
  ["2026-05-31", 93],
  ["2026-06-07", 100],
  ["2026-06-14", 91],
  ["2026-06-21", 96],
  ["2026-06-28", 101],
  ["2026-07-05", 144],
  ["2026-07-12", 99],
  ["2026-07-19", 82],
  ["2026-07-26", 77],
  ["2026-08-02", 92],
  ["2026-08-09", 106],
  ["2026-08-23", 90],
  ["2026-08-30", 106],
]);

const retainedWeeks = new Set([
  "2026-07-19",
  "2026-07-26",
  "2026-08-02",
  "2026-08-09",
  "2026-08-23",
  "2026-08-30",
]);

const failedReconstructionWeeks = new Set(["2026-08-16"]);

test("research candidate pools are available for retained and reconstructed weeks", () => {
  assert.deepEqual(
    researchPools.map((pool) => pool.weekEnd),
    Array.from(expectedResearchCounts.keys()),
  );
  assert.ok(!researchPools.some((pool) => failedReconstructionWeeks.has(pool.weekEnd)));
});

test("research candidate pools distinguish retained and reconstructed history", () => {
  for (const pool of researchPools) {
    if (retainedWeeks.has(pool.weekEnd)) {
      assert.equal(pool.candidatePoolKind, "retained_historical");
      assert.match(pool.candidatePoolNote, /Retained historical candidate pool/);
    } else {
      assert.equal(pool.candidatePoolKind, "reconstructed_historical");
      assert.match(pool.candidatePoolNote, /current OpenAlex metadata/);
    }
  }
});

test("research candidate counts match retained ranked candidates and digest counts", () => {
  for (const pool of researchPools) {
    const digest = researchDigests.get(pool.weekEnd);
    assert.ok(digest, `missing digest ${pool.weekEnd}`);
    assert.equal(pool.candidates.length, pool.candidateCount);
    assert.equal(digest.checkedResultCount, pool.candidateCount);
    assert.equal(pool.candidateCount, expectedResearchCounts.get(pool.weekEnd));
  }
});

test("research selected candidates match weekly digest selected papers", () => {
  for (const pool of researchPools) {
    const digest = researchDigests.get(pool.weekEnd);
    const selectedCandidateIds = pool.candidates
      .filter((candidate) => candidate.selected)
      .map((candidate) => candidate.candidateId);
    const digestPaperIds = digest.selectedPapers.map((paper) => paper.paperId);

    assert.deepEqual(selectedCandidateIds, digestPaperIds);
  }
});

test("research selection scores are component totals from the deterministic model", () => {
  for (const pool of researchPools) {
    assert.equal(pool.scoreModel.id, "research_selection_score_v1");

    for (const candidate of pool.candidates) {
      assert.equal(candidate.scoreComponents.length, expectedScoreComponents.size);
      const componentIds = new Set(candidate.scoreComponents.map((component) => component.componentId));
      assert.deepEqual(componentIds, expectedScoreComponents);

      const total = candidate.scoreComponents.reduce((sum, component) => {
        assert.ok(Number.isInteger(component.score));
        assert.ok(Number.isInteger(component.maxScore));
        assert.ok(component.score >= 0);
        assert.ok(component.maxScore > 0);
        assert.ok(component.score <= component.maxScore);
        assert.ok(Array.isArray(component.evidence));
        return sum + component.score;
      }, 0);

      assert.equal(candidate.selectionScore, total);
      assert.ok(candidate.selectionScore >= 0 && candidate.selectionScore <= 100);
    }
  }
});

test("research candidates are ordered by score with deterministic tie-breakers", () => {
  const priority = {
    Relevant: 0,
    "Possibly Relevant": 1,
    "Not Relevant": 2,
  };

  for (const pool of researchPools) {
    for (let index = 1; index < pool.candidates.length; index += 1) {
      const previous = pool.candidates[index - 1];
      const current = pool.candidates[index];

      const previousKey = [
        -previous.selectionScore,
        priority[previous.classification] ?? 99,
        -Date.parse(`${previous.publishedDate}T00:00:00Z`),
        previous.candidateId,
      ];
      const currentKey = [
        -current.selectionScore,
        priority[current.classification] ?? 99,
        -Date.parse(`${current.publishedDate}T00:00:00Z`),
        current.candidateId,
      ];

      assert.ok(compareTuple(previousKey, currentKey) <= 0);
    }
  }
});

test("research selected top five are the first eligible scored records", () => {
  for (const pool of researchPools) {
    const selected = pool.candidates.filter((candidate) => candidate.selected);
    const expectedSelected = pool.candidates
      .filter((candidate) => candidate.classification !== "Not Relevant")
      .slice(0, pool.selectionLimit);

    assert.equal(pool.selectionLimit, 5);
    assert.equal(selected.length, pool.selectionLimit);
    assert.deepEqual(
      selected.map((candidate) => candidate.candidateId),
      expectedSelected.map((candidate) => candidate.candidateId),
    );
    assert.ok(selected.every((candidate) => candidate.selectionReason === "selected_within_limit"));
  }
});

test("research candidates keep compact source provenance", () => {
  for (const pool of researchPools) {
    for (const candidate of pool.candidates) {
      assert.ok(candidate.title);
      assert.ok(candidate.publishedDate);
      assert.ok(candidate.publicationType);
      assert.ok(candidate.sourceUrl || candidate.doi);
    }
  }
});

test("engineering latest candidate transparency stores an audited multi-source candidate pool", () => {
  const selection = engineeringBriefing.engineeringSelection;
  const sourceIds = new Set(
    engineeringBriefing.sourceRecords.map((source) => source.sourceRecordId),
  );
  const itemIds = new Set(engineeringBriefing.briefingItems.map((item) => item.briefingItemId));

  assert.ok(selection);
  assert.equal(selection.candidatePoolType, "approved_source_candidate_pool");
  assert.equal(selection.selectionModel.id, SCORE_MODEL_ID);
  assert.equal(engineeringBriefing.sourceRecords.length, 3);
  assert.equal(engineeringBriefing.checkedResultCount, 2);
  assert.equal(selection.collectionAudit.candidatePoolSize, 2);
  assert.equal(selection.collectionAudit.sourcesAttempted, 42);
  assert.equal(selection.collectionAudit.sourcesSuccessfullyCollected, 2);
  assert.equal(selection.collectionAudit.sourcesFailed, 40);
  assert.equal(selection.collectionAudit.rawItemsCollected, 3);
  assert.equal(selection.collectionAudit.itemsAfterDateFiltering, 3);
  assert.equal(selection.collectionAudit.itemsAfterFowtRelevanceFiltering, 3);
  assert.equal(selection.collectionAudit.duplicateEventOverlapsRemoved, 1);
  assert.equal(selection.candidates.length, selection.collectionAudit.candidatePoolSize);

  const candidateSourceIds = new Set(selection.candidates.map((candidate) => candidate.sourceRecordId));
  assert.ok(candidateSourceIds.has("eng-src-2026-08-30-encomara-squid"));
  assert.ok(candidateSourceIds.has("eng-src-2026-08-30-bw-ideol-floatgen-40gwh"));
  assert.ok(!candidateSourceIds.has("eng-src-2026-08-30-encomara-squid-offshorewind"));

  for (const source of engineeringBriefing.sourceRecords) {
    if (source.candidateStatus === "candidate") {
      assert.ok(candidateSourceIds.has(source.sourceRecordId));
    }
  }

  for (const candidate of selection.candidates) {
    assert.ok(sourceIds.has(candidate.sourceRecordId));
    assertEngineeringScore(candidate.engineeringSelectionScore);
    if (candidate.selected) {
      assert.ok(itemIds.has(candidate.selectedBriefingItemId));
      assert.ok(Number.isInteger(candidate.finalRank));
    } else {
      assert.equal(candidate.selectedBriefingItemId, null);
      assert.equal(candidate.finalRank, null);
    }
  }
});

test("engineering source registry covers approved source classes", () => {
  assert.deepEqual(validateEngineeringSourceRegistry(engineeringSourceRegistry), []);
  assert.equal(engineeringSourceRegistry.sources.length, 42);

  const classes = new Set(engineeringSourceRegistry.sources.map((source) => source.sourceClass));
  for (const sourceClass of SOURCE_CLASSES) {
    assert.ok(classes.has(sourceClass), `missing source class ${sourceClass}`);
  }
});

test("engineering latest collection audit is backed by registry source records", () => {
  const audit = engineeringBriefing.engineeringSelection.collectionAudit;
  const registryIds = new Set(engineeringSourceRegistry.sources.map((source) => source.sourceId));

  assert.deepEqual(
    validateRegistryBackedCollectionAudit(
      audit,
      engineeringSourceRegistry,
      "2026-08-23.json: engineeringSelection",
    ),
    [],
  );
  assert.equal(audit.sourceRegistry, "web/data/engineering-source-registry.json");
  assert.equal(audit.attemptedSources.length, audit.sourcesAttempted);
  assert.ok(audit.attemptedSources.every((source) => registryIds.has(source.sourceId)));
  assert.equal(
    audit.attemptedSources.filter((source) => source.collectionStatus === "succeeded").length,
    audit.sourcesSuccessfullyCollected,
  );
});
test("engineering persisted latest pool matches regenerated scoring output", () => {
  const regenerated = buildEngineeringCandidatePool(engineeringBriefing);

  assert.deepEqual(
    engineeringBriefing.engineeringSelection.candidates,
    regenerated.candidates,
  );
});
test("engineering scoring is deterministic and tolerates sparse metadata", () => {
  const source = {
    sourceRecordId: "eng-src-test-minimal",
    sourceType: "industry_news",
    publisher: "Example",
    title: "Floating offshore wind cable installation update",
    sourceText: null,
  };

  const first = scoreEngineeringSourceRecord(source);
  const second = scoreEngineeringSourceRecord(source);

  assert.deepEqual(first, second);
  assert.equal(first.modelId, SCORE_MODEL_ID);
  assertEngineeringScore(first);
});

test("engineering scored candidates are raw-ranked by score with source ID tie-breaker", () => {
  const { candidates } = buildEngineeringCandidatePool(engineeringBriefing);

  for (let index = 1; index < candidates.length; index += 1) {
    const previous = candidates[index - 1];
    const current = candidates[index];
    const previousKey = [-previous.engineeringSelectionScore.total, previous.sourceRecordId];
    const currentKey = [-current.engineeringSelectionScore.total, current.sourceRecordId];

    assert.ok(compareTuple(previousKey, currentKey) <= 0);
    assert.equal(current.rawRank, index + 1);
  }
});

test("engineering diversity layer does not pad a two-candidate week", () => {
  const { candidates } = buildEngineeringCandidatePool(engineeringBriefing);
  const selected = candidates.filter((candidate) => candidate.selected);
  const selectedIds = selected.map((candidate) => candidate.sourceRecordId);
  const selectedBriefingSourceIds = engineeringBriefing.briefingItems.map(
    (item) => item.sourceRecordIds[0],
  );

  assert.equal(selected.length, 2);
  assert.deepEqual(
    selected.map((candidate) => candidate.finalRank),
    [1, 2],
  );
  assert.deepEqual(selectedIds, selectedBriefingSourceIds);
  assert.ok(selectedIds.includes("eng-src-2026-08-30-encomara-squid"));
  assert.ok(selectedIds.includes("eng-src-2026-08-30-bw-ideol-floatgen-40gwh"));
  assert.ok(selected.every((candidate) => candidate.diversityReason));
});
test("engineering historical backfilled weeks retain scored reconstructed candidate pools", () => {
  const expectedCounts = new Map([
    ["2026-04-05", 2],
    ["2026-04-12", 2],
    ["2026-04-19", 3],
    ["2026-04-26", 2],
    ["2026-05-03", 1],
    ["2026-05-10", 4],
    ["2026-05-17", 1],
    ["2026-05-24", 3],
    ["2026-05-31", 5],
    ["2026-06-07", 1],
    ["2026-06-14", 3],
    ["2026-06-21", 3],
    ["2026-06-28", 4],
    ["2026-07-05", 2],
    ["2026-07-12", 4],
    ["2026-07-19", 3],
    ["2026-07-26", 5],
    ["2026-08-02", 2],
    ["2026-08-09", 3],
    ["2026-08-16", 4],
    ["2026-08-23", 8],
    ["2026-08-30", 2],
  ]);

  for (const briefing of engineeringBackfillBriefings) {
    const expectedCount = expectedCounts.get(briefing.weekEnd);
    assert.ok(expectedCount, `missing expected count for ${briefing.weekEnd}`);
    assert.ok(briefing.engineeringSelection, `missing engineeringSelection for ${briefing.weekEnd}`);
    assert.equal(briefing.engineeringSelection.selectionModel.id, SCORE_MODEL_ID);
    assert.equal(briefing.engineeringSelection.collectionAudit.candidatePoolSize, expectedCount);
    assert.equal(briefing.engineeringSelection.candidates.length, expectedCount);
    assert.equal(briefing.checkedResultCount, expectedCount);
    if (!["2026-08-23", "2026-08-30"].includes(briefing.weekEnd)) {
      assert.equal(
        briefing.engineeringSelection.candidatePoolType,
        "reconstructed_historical_registry_source_pool",
      );
      assert.equal(
        briefing.engineeringSelection.collectionAudit.sourceRegistry,
        "web/data/engineering-source-registry.json",
      );
      assert.ok(briefing.briefingItems.length <= 5);
    }

    const regenerated = buildEngineeringCandidatePool(briefing);
    assert.deepEqual(briefing.engineeringSelection.candidates, regenerated.candidates);

    for (const candidate of briefing.engineeringSelection.candidates) {
      assertEngineeringScore(candidate.engineeringSelectionScore);
      assert.equal(candidate.engineeringSelectionScore.modelId, SCORE_MODEL_ID);
    }
  }
});

function assertEngineeringScore(score) {
  assert.equal(score.modelId, SCORE_MODEL_ID);
  assert.equal(score.maxScore, 100);
  assert.equal(score.components.length, expectedEngineeringComponents.size);
  const total = score.components.reduce((sum, component) => {
    assert.ok(expectedEngineeringComponents.has(component.componentId));
    assert.equal(component.maxScore, expectedEngineeringComponents.get(component.componentId));
    assert.ok(Number.isInteger(component.score));
    assert.ok(component.score >= 0);
    assert.ok(component.score <= component.maxScore);
    assert.ok(Array.isArray(component.evidence));
    return sum + component.score;
  }, 0);
  assert.equal(score.total, total);
  assert.ok(score.total >= 0 && score.total <= 100);
}

function compareTuple(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] < right[index]) {
      return -1;
    }
    if (left[index] > right[index]) {
      return 1;
    }
  }
  return 0;
}
