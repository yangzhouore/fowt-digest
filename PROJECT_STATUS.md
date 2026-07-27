# Project Status

Last updated: 2026-07-27

## Current State

- Current branch: `main`
- Current milestone: stable post-M4 baseline
- Current feature: none active
- Current phase: M4 complete and accepted; stable post-M4 baseline
- Release tag: `v1.1.0`
- Production website: https://fowt-digest-oegd-cs33ynefc-dudu-yang.vercel.app
- Immediate next task: Design Review for the next milestone.

## Latest Accepted Work

- Deterministic pipeline MVP complete through M3H Pipeline Orchestration.
- Existing `v1.0.0` tag marks the deterministic pipeline MVP release.
- Website Feature 01 complete: Homepage and Weekly Digest display real static pipeline digest data.
- Website Feature 02 complete: Weekly Digest links to real Paper Detail pages.
- Website Feature 03 complete: Archive lists available static digest editions.
- UX Polish design baseline complete in `docs/PRODUCT_VISION.md` and `docs/UX_ROADMAP.md`.
- UX-01 Homepage Entry and Reader Framing complete and accepted.
- UX-02 Weekly Digest Scanability complete, accepted, and committed.
- UX-03 Paper Detail Readability complete, accepted, and committed.
- DD-01 Multiple static weekly digest support complete, accepted, and committed.
- DD-02 Historical demonstration dataset complete, accepted, and committed.
- UX-04 Website Presentation Refinement complete, accepted, and committed.
- UX-05 Site Trust Copy Alignment complete, accepted, and merged through PR #11
  in merge commit `12a47b8`.
- DD-03 Static Digest Data Guardrails complete, accepted, and merged through PR #13
  in merge commit `6026063`.
- v1.1.0 release preparation complete.
- M4 Website Publishing Workflow complete and accepted.
  - Added deterministic pipeline-side publisher `pipeline.website_publisher`.
  - Publisher copies `weekly_digest.json` to `web/data/digests/<weekEnd>.json` without transformation.
  - Publisher regenerates explicit static digest imports and `digestJsonFiles` registration from committed digest files.
  - Added focused pytest coverage for publish, overwrite, idempotency, and adapter regeneration behavior.
  - Documented the publishing path in `docs/WEBSITE_PUBLISHING_WORKFLOW.md`.

## Latest Validation

- Pipeline suite: `python -m pytest pipeline/tests` -> 200 passed, 0 failed.
- M4 publishing command: `python -m pipeline.website_publisher pipeline\data\runs\run_20260727_072439_openalex` -> digest already published and adapter already up to date.
- Website data validation: `npm.cmd run validate:data` -> passed.
- Website data tests: `npm.cmd run test:data` -> 26 passed, 0 failed.
- Website lint: `npm.cmd run lint` -> passed.
- Website build: `npm.cmd run build` -> passed and generated 118 static pages.
- Repository validation: `git diff --check` -> passed.

## Website Baseline

The website is publicly deployed at:

```text
https://fowt-digest-oegd-cs33ynefc-dudu-yang.vercel.app
```

The website currently contains 16 selected static digest editions.
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
- DD-03 adds local static digest guardrails through `npm.cmd run validate:data`
  and focused Node tests through `npm.cmd run test:data`.

## Current Boundaries

The website is a presentation layer only. The pipeline remains the source of
truth for paper data. The website does not run the pipeline, refresh static data,
or claim complete weekly historical coverage.

Do not add without an explicit accepted scope:

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
- Publishing command: `python -m pipeline.website_publisher pipeline\data\runs\<run_id>`
- Publishing workflow documentation: `docs/WEBSITE_PUBLISHING_WORKFLOW.md`
- Available editions: 16 selected static digest editions
- Papers per edition: up to 6 selected papers
- Implemented reader paths:
  - Homepage -> Weekly Digest -> Paper Detail
  - Archive -> Weekly Digest
  - Paper Detail -> originating Weekly Digest

Detailed continuity notes live in `PROJECT_HANDOVER.md`. The resume entry point
for a new session is `START_HERE.md`.