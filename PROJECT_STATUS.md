# Project Status

Last updated: 2026-07-23

## Current State

- Current branch: `main`
- Current milestone: FOWT Research Digest v1.1.0 public website release
- Current feature: none active
- Current phase: release preparation complete; stable release baseline
- Release tag: `v1.1.0`
- Production website: https://fowt-digest-oegd-cs33ynefc-dudu-yang.vercel.app
- Immediate next task: Design Review for the next post-v1.1 milestone
- Do not begin implementation until the next milestone scope is explicitly
  reviewed and accepted.

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

## Latest Validation

- Pipeline suite: `python -m pytest pipeline/tests` -> 193 passed, 0 failed.
- DD-03 validation: `npm.cmd run validate:data` passed.
- DD-03 validation: `npm.cmd run test:data` passed with 26 tests.
- Release validation: `npm.cmd run lint` passed.
- Release validation: `npm.cmd run build` passed and generated 111 static pages.
- Release repository validation: `git diff --check` passed.

## Website Baseline

The website is publicly deployed at:

```text
https://fowt-digest-oegd-cs33ynefc-dudu-yang.vercel.app
```

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