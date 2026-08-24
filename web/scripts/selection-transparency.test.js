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

test("research selection scores are derived from rank position", () => {
  const total = researchPool.candidateCount;

  for (const candidate of researchPool.candidates) {
    const expectedScore = total === 1
      ? 100
      : Math.round(((total - candidate.rank) / (total - 1)) * 100);

    assert.equal(candidate.selectionScore, expectedScore);
    assert.ok(candidate.selectionScore >= 0 && candidate.selectionScore <= 100);
  }
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
}
);
