# Project Status

Last updated: 2026-07-21

## Current State

- Current branch: `feature/website-ux-polish`
- Current milestone: Website UX Polish
- Current feature: UX-03 Paper Detail Readability
- Current phase: not started; design review is next
- Current implementation scope: none accepted for UX-03 yet
- Immediate next task: begin UX-03 design review for the Paper Detail page
- Repository state before this documentation cleanup: UX-02 accepted and committed in `3f5b9d7`

## Latest Accepted Work

- Deterministic pipeline MVP complete through M3H Pipeline Orchestration.
- MVP v1.0.0 tag published for the deterministic pipeline.
- Website Feature 01 complete: Homepage and Weekly Digest display one real static pipeline digest.
- Website Feature 02 complete: Weekly Digest links to six real Paper Detail pages.
- Website Feature 03 complete: Archive lists the real static digest.
- UX Polish design baseline complete in `docs/PRODUCT_VISION.md` and `docs/UX_ROADMAP.md`.
- UX-01 Homepage Entry and Reader Framing complete and accepted.
- UX-02 Weekly Digest Scanability complete, accepted, and committed.

## Latest Validation

- Pipeline suite: `python -m pytest pipeline/tests` -> 193 passed, 0 failed.
- UX-01 website validation: `npm.cmd run lint` passed.
- UX-01 website validation: `npm.cmd run build` passed.
- UX-01 repository validation: `git diff --check` passed.
- UX-02 acceptance review: local Weekly Digest route returned HTTP 200; rendered paper links matched pipeline rank order; abstract previews and missing-abstract fallback matched the accepted rule.
- UX-02 website validation: `npm.cmd run lint` passed.
- UX-02 website validation: `npm.cmd run build` passed.
- UX-02 repository validation: `git diff --check` passed.

## UX-02 Completed Baseline

Weekly Digest is a browsing page. Paper Detail remains the only page that shows
the complete abstract.

- If an abstract exists, show the first 280 characters of the existing abstract
  string.
- Do not rewrite, summarise, or interpret the abstract.
- Preserve original wording exactly.
- If the abstract is longer than 280 characters, append `...`.
- If no abstract exists, display `No abstract available.`
- This is presentation only and has been implemented on the Weekly Digest page.
- Do not modify pipeline data.
- Do not modify `web/data/digest-adapter.ts`.
- Do not modify Paper Detail.

## Current Boundaries

UX-03 Paper Detail Readability is next, but no UX-03 design has been accepted
yet. Do not implement UX-03 until design review is complete.

Do not add without an explicit accepted scope:

- pipeline changes;
- adapter changes;
- Weekly Digest changes;
- Archive changes;
- Homepage changes;
- search, filters, backend, database, AI, deployment, or new data fixtures.

## Completed Pipeline Milestones

- M3A - Pipeline Foundation
- M3B - OpenAlex Collector
- M3C - Metadata Normalisation
- M3D - Deterministic Deduplication
- M3E - Deterministic FOWT Relevance Classification
- M3F - Deterministic Ranking & Selection
- M3G - Weekly Digest Assembly
- M3H - Pipeline Orchestration

## Website State

- Static digest source: `web/data/weekly_digest.json`
- Source run: `run_20260720_090000_openalex`
- Selected papers in static digest: 6
- Implemented reader paths:
  - Homepage -> Weekly Digest -> Paper Detail
  - Archive -> Weekly Digest

Detailed continuity notes live in `PROJECT_HANDOVER.md`. The resume entry point
for a new session is `START_HERE.md`.
