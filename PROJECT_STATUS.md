# Project Status

Last updated: 2026-07-21

## Current State

- Current branch: `feature/website-ux-polish`
- Current milestone: Website UX Polish
- Current feature: UX-02 Weekly Digest Scanability
- Current phase: design accepted; implementation not started
- Immediate next task: implement UX-02 on the Weekly Digest page
- Repository state before this documentation cleanup: UX-01 committed and pushed

## Latest Accepted Work

- Deterministic pipeline MVP complete through M3H Pipeline Orchestration.
- MVP v1.0.0 tag published for the deterministic pipeline.
- Website Feature 01 complete: Homepage and Weekly Digest display one real static pipeline digest.
- Website Feature 02 complete: Weekly Digest links to six real Paper Detail pages.
- Website Feature 03 complete: Archive lists the real static digest.
- UX Polish design baseline complete in `docs/PRODUCT_VISION.md` and `docs/UX_ROADMAP.md`.
- UX-01 Homepage Entry and Reader Framing complete and accepted.

## Latest Validation

- Pipeline suite: `python -m pytest pipeline/tests` -> 193 passed, 0 failed.
- UX-01 website validation: `npm.cmd run lint` passed.
- UX-01 website validation: `npm.cmd run build` passed.
- UX-01 repository validation: `git diff --check` passed.

## UX-02 Accepted Rule

Weekly Digest is a browsing page. Paper Detail remains the only page that shows
the complete abstract.

- If an abstract exists, show the first 280 characters of the existing abstract
  string.
- Do not rewrite, summarise, or interpret the abstract.
- Preserve original wording exactly.
- If the abstract is longer than 280 characters, append `...`.
- If no abstract exists, display `No abstract available.`
- This is presentation only.
- Do not modify pipeline data.
- Do not modify `web/data/digest-adapter.ts`.
- Do not modify Paper Detail.

## Current Boundaries

Do not implement in UX-02:

- pipeline changes;
- adapter changes;
- Paper Detail changes;
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
