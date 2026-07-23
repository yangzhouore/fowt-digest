# Project Status

Last updated: 2026-07-23

## Current State

- Current branch: `feature/website-ux-polish`
- Current milestone: Website UX Polish / Website Demo Dataset
- Current feature: final branch review
- Current phase: implementation baseline complete, accepted, committed, and pushed
- Latest accepted implementation baseline: `28815e0`
- Immediate next task: final branch/PR review before merging this milestone
- Do not begin new UX implementation until this milestone is merged and the next
  feature receives a Design Review.

## Latest Accepted Work

- Deterministic pipeline MVP complete through M3H Pipeline Orchestration.
- MVP v1.0.0 tag published for the deterministic pipeline.
- Website Feature 01 complete: Homepage and Weekly Digest display real static pipeline digest data.
- Website Feature 02 complete: Weekly Digest links to real Paper Detail pages.
- Website Feature 03 complete: Archive lists available static digest editions.
- UX Polish design baseline complete in `docs/PRODUCT_VISION.md` and `docs/UX_ROADMAP.md`.
- UX-01 Homepage Entry and Reader Framing complete and accepted.
- UX-02 Weekly Digest Scanability complete, accepted, and committed.
- UX-03 Paper Detail Readability complete, accepted, and committed.
- Multiple static weekly digest support complete, accepted, and committed.
- Historical demonstration dataset complete, accepted, and committed.
- UX-04 Website Presentation Refinement complete, accepted, and committed.

## Latest Validation

- Pipeline suite: `python -m pytest pipeline/tests` -> 193 passed, 0 failed.
- UX-02 acceptance review: local Weekly Digest route returned HTTP 200; rendered paper links matched pipeline rank order; abstract previews and missing-abstract fallback matched the accepted rule.
- Current branch validation: `npm.cmd run lint` passed.
- Current branch validation: `npm.cmd run build` passed.
- Current branch pipeline validation: `python -m pytest pipeline/tests` -> 193 passed.
- Current branch repository validation: `git diff --check` passed.

## Website Baseline

The website currently contains 15 selected historical demonstration editions.
They are representative static weekly editions for demonstration and do not
represent complete weekly historical coverage.

- Static digest files live under `web/data/digests/`.
- `web/data/digest-adapter.ts` explicitly imports and validates multiple digest
  JSON files.
- Editions are returned newest first.
- The newest digest remains the current homepage digest.
- Weekly Digest pages resolve by edition slug.
- Paper Detail pages resolve papers across loaded editions and link back to the
  correct originating Weekly Digest.
- Archive lists all loaded editions.
- Weekly Digest remains a browsing page with abstract previews.
- Paper Detail displays the complete `paper.abstract` when available and
  neutrally displays `No abstract available.` when missing.

## Current Boundaries

The website is a presentation layer only. The pipeline remains the source of
truth for paper data. The website does not run the pipeline, refresh static data,
or claim complete weekly historical coverage.

Do not add without an explicit accepted scope:

- pipeline changes;
- backend, database, CMS, API routes, scheduler, or deployment automation;
- search, filters, AI summaries, editorial analysis, or automatic publication;
- generated summaries, findings, limitations, scores, or invented paper content.

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

- Static digest source directory: `web/data/digests/`
- Available editions: 15 selected historical demonstration editions
- Papers per edition: up to 6 selected papers
- Implemented reader paths:
  - Homepage -> Weekly Digest -> Paper Detail
  - Archive -> Weekly Digest
  - Paper Detail -> originating Weekly Digest

Detailed continuity notes live in `PROJECT_HANDOVER.md`. The resume entry point
for a new session is `START_HERE.md`.
