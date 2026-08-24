/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

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
const engineeringBriefing = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "briefings", "2026-08-23.json"), "utf8"),
);

const expectedScoreComponents = new Set([
  "fowt_relevance",
  "technical_specificity",
  "research_value",
  "venue_quality",
  "metadata_quality",
  "recency",
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
]);

const retainedWeeks = new Set([
  "2026-07-19",
  "2026-07-26",
  "2026-08-02",
  "2026-08-09",
  "2026-08-23",
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

test("engineering candidate transparency uses retained source records without scores", () => {
  const sourceIds = new Set(
    engineeringBriefing.sourceRecords.map((source) => source.sourceRecordId),
  );

  assert.equal(engineeringBriefing.checkedResultCount, engineeringBriefing.sourceRecords.length);
  assert.equal(engineeringBriefing.sourceRecords.length, 6);

  for (const item of engineeringBriefing.briefingItems) {
    assert.ok(item.sourceRecordIds.length > 0);
    for (const sourceId of item.sourceRecordIds) {
      assert.ok(sourceIds.has(sourceId), `missing source ${sourceId}`);
    }
    assert.equal(item.selectionScore, undefined);
  }
});

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
