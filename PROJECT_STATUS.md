# Project Status

Last updated: 2026-07-23

## Current State

- Current branch: `feature/dd-03-static-digest-guardrails`
- Current milestone: DD-03 Static Digest Data Guardrails
- Current feature: DD-03 Static Digest Data Guardrails
- Current phase: implementation complete, accepted, and committed; documentation baseline complete and accepted
- Accepted implementation commit: `5b558ed`
- Immediate next task: final branch review, then push and PR
- Do not begin another milestone before DD-03 is merged.

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
- DD-01 Multiple static weekly digest support complete, accepted, and committed.
- DD-02 Historical demonstration dataset complete, accepted, and committed.
- UX-04 Website Presentation Refinement complete, accepted, and committed.
- PR #9 merged into `main` in merge commit `eb7c2d5`.
- UX-05 Site Trust Copy Alignment complete, accepted, and merged through PR #11
  in merge commit `12a47b8`.
- DD-03 Static Digest Data Guardrails complete, accepted, and committed in
  `5b558ed`.

## Latest Validation

- Pipeline suite: `python -m pytest pipeline/tests` -> 193 passed, 0 failed.
- UX-02 acceptance review: local Weekly Digest route returned HTTP 200; rendered paper links matched pipeline rank order; abstract previews and missing-abstract fallback matched the accepted rule.
- UX-05 validation: `npm.cmd run lint` passed.
- UX-05 validation: `npm.cmd run build` passed and generated 111 static pages.
- UX-05 repository validation: `git diff --check` passed.
- UX-05 manual `/about` acceptance passed.
- DD-03 validation: `npm.cmd run validate:data` passed.
- DD-03 validation: `npm.cmd run test:data` passed with 26 tests.
- DD-03 validation: `npm.cmd run lint` passed.
- DD-03 validation: `npm.cmd run build` passed and generated 111 static pages.
- DD-03 repository validation: `git diff --check` passed.

## UX-05 Baseline

UX-05 Site Trust Copy Alignment updated the About page and pipeline architecture
wording without changing implementation behavior.

- About page now describes FOWT Research Digest as a static MVP.
- About page states that the website presents 15 selected historical
  demonstration editions generated from deterministic pipeline output.
- About page states that the editions are not complete weekly historical
  coverage.
- About page states that the website does not run the pipeline or provide
  AI-generated paper analysis.
- `docs/PIPELINE_ARCHITECTURE.md` now describes selected static digest JSON files
  under `web/data/digests/`, rather than one copied snapshot.

UX-05 is merged. DD-03 Static Digest Data Guardrails is complete, accepted,
and committed in `5b558ed`. Documentation baseline is complete and accepted.
DD-03 is not merged yet; final branch review, then push and PR are next.

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
- DD-03 adds local static digest guardrails through `npm.cmd run validate:data`
  and focused Node tests through `npm.cmd run test:data`.
- DD-03 changed no website routes, presentation components, pipeline code, digest
  JSON, dependencies, or lockfiles.

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
