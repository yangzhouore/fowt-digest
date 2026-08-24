/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const researchPool = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "data", "research-candidates", "2026-08-23.json"),
    "utf8",
  ),
);
const researchDigest = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "digests", "2026-08-23.json"), "utf8"),
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

test("research candidate count matches retained ranked candidates and digest count", () => {
  assert.equal(researchPool.candidates.length, researchPool.candidateCount);
  assert.equal(researchDigest.checkedResultCount, researchPool.candidateCount);
  assert.equal(researchPool.candidateCount, 90);
});

test("research selected candidates match weekly digest selected papers", () => {
  const selectedCandidateIds = researchPool.candidates
    .filter((candidate) => candidate.selected)
    .map((candidate) => candidate.candidateId);
  const digestPaperIds = researchDigest.selectedPapers.map((paper) => paper.paperId);

  assert.deepEqual(selectedCandidateIds, digestPaperIds);
});

test("research selection scores are component totals from the deterministic model", () => {
  assert.equal(researchPool.scoreModel.id, "research_selection_score_v1");

  for (const candidate of researchPool.candidates) {
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
});

test("research candidates are ordered by score with deterministic tie-breakers", () => {
  const priority = {
    Relevant: 0,
    "Possibly Relevant": 1,
    "Not Relevant": 2,
  };

  for (let index = 1; index < researchPool.candidates.length; index += 1) {
    const previous = researchPool.candidates[index - 1];
    const current = researchPool.candidates[index];

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
});

test("research selected top five are the first eligible scored records", () => {
  const selected = researchPool.candidates.filter((candidate) => candidate.selected);
  const expectedSelected = researchPool.candidates
    .filter((candidate) => candidate.classification !== "Not Relevant")
    .slice(0, researchPool.selectionLimit);

  assert.equal(selected.length, researchPool.selectionLimit);
  assert.deepEqual(
    selected.map((candidate) => candidate.candidateId),
    expectedSelected.map((candidate) => candidate.candidateId),
  );
  assert.ok(selected.every((candidate) => candidate.selectionReason === "selected_within_limit"));
});

test("research candidates keep compact source provenance", () => {
  for (const candidate of researchPool.candidates) {
    assert.ok(candidate.title);
    assert.ok(candidate.publishedDate);
    assert.ok(candidate.publicationType);
    assert.ok(candidate.sourceUrl || candidate.doi);
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
