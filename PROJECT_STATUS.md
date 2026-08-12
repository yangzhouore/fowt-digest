# Project Status

Last updated: 2026-08-12

## Current State

- Current branch: `main`
- Current milestone: M8 Homepage Content Value Refinement
- Current feature: none in progress after M7 merge
- Current phase: M8 complete, accepted, merged to main, and pushed
- Release tag: `v1.3.0`
- Production website: https://fowt-digest-oegd.vercel.app/
- Immediate next task: select the next milestone.

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
- M5 Repository Automation Design Review complete and accepted.
  - Accepted scope is deterministic repository validation automation only.
  - Added design review at `docs/M5_REPOSITORY_AUTOMATION_DESIGN_REVIEW.md`.
- M5 Repository Workflow Automation complete, accepted, and merged to `main`.
  - Added `python -m tools.publication_workflow` as the single deterministic workflow entry point.
  - The command publishes an existing pipeline run through `pipeline.website_publisher`.
  - The command runs existing repository and website validation and prints a summary report.
  - It does not run the pipeline, commit, push, deploy, schedule jobs, or call GitHub Actions.
- M6 CI/CD Foundation complete, accepted, and merged to `main`.
  - Added `.github/workflows/ci.yml` for GitHub Actions validation.
  - CI runs on pull requests to `main`, pushes to `main`, and manual `workflow_dispatch` runs.
  - Pipeline validation sets up Python 3.14, explicitly installs `pytest`, runs `python -m pytest pipeline/tests`, and runs `git diff --check`.
  - Website validation sets up Node 24 with npm cache from `web/package-lock.json`, runs `npm ci`, then runs data validation, data tests, lint, and build.
  - Vercel remains the production CD mechanism through its Git integration; no deployment commands or secrets were added.
- Homepage Editorial UX complete, accepted, and merged to `main`.
  - Homepage now shows compact editorial previews for up to five current-digest papers in pipeline rank order.
  - Homepage previews use deterministic title truncation, source-backed topic tags, and short abstract-derived preview text only.
- Archive Search complete, accepted, and merged to `main`.
  - Archive now includes immediate deterministic client-side search over committed static digest data.
  - Search covers paper title, authors, publication source, topic tags, and edition date/year.
  - It does not query OpenAlex and does not add a backend, API route, database, semantic search, embeddings, or AI.
- 2026-08-09 digest publication complete on `main`.
  - Added `web/data/digests/2026-08-09.json`.
  - Refreshed `web/data/digest-adapter.ts` registration.
- 2026-08-02 digest publication complete on `main`.
  - Added `web/data/digests/2026-08-02.json`.
  - Refreshed `web/data/digest-adapter.ts` registration.
- M7 Engineering Briefing complete, accepted, and merge-ready.
  - M7 Design Review documented the independent Engineering Briefing pipeline concept.
  - M7A defined the engineering source policy and static data contracts.
  - M7B added one manual source-backed Engineering Briefing prototype and website route.
  - M7C expanded the independent static Engineering Briefing archive to 20 representative editions.
  - Homepage now presents Engineering Briefing and Research Digest with equal editorial weight.
  - Engineering data remains independent from the deterministic OpenAlex Research Pipeline.

## Latest Validation

- Pipeline suite: `python -m pytest pipeline/tests` -> 204 passed, 0 failed.
- Website data validation: `npm.cmd run validate:data` -> passed.
- Website data tests: `npm.cmd run test:data` -> 31 passed, 0 failed.
- Website lint: `npm.cmd run lint` -> passed.
- Website build: `npm.cmd run build` -> passed and generated 153 static pages.
- Repository validation: `git diff --check` -> passed.
- GitHub CI: latest `main` push for Archive Search merge passed pipeline and website validation.

## Website Baseline

The website is publicly deployed at:

```text
https://fowt-digest-oegd.vercel.app/
```

The website currently contains 18 selected static Research Digest editions and 20 selected static Engineering Briefing editions.
They are representative static weekly editions for demonstration and do not
represent complete weekly historical coverage.

- Static digest files live under `web/data/digests/`.
- `web/data/digest-adapter.ts` explicitly imports and validates multiple digest
  JSON files.
- Editions are returned newest first.
- The newest digest remains the current homepage digest.
- Homepage shows Engineering Briefing highlights and Research Digest cards as separate editorial sections.
- Weekly Digest pages resolve by edition slug.
- Paper Detail pages resolve papers across loaded editions and link back to the
  correct originating Weekly Digest.
- Research Archive lists all loaded research editions and provides static client-side paper search.
- Engineering Archive lists all loaded engineering briefing editions under `/engineering`.
- Weekly Digest remains a browsing page with abstract previews.
- Paper Detail displays the complete `paper.abstract` when available and
  neutrally displays `No abstract available.` when missing.
- DD-03 adds local static digest guardrails through `npm.cmd run validate:data`
  and focused Node tests through `npm.cmd run test:data`.

## Current Boundaries

The website is a static presentation layer only. The pipeline remains the source
of truth for paper data. The website does not run the pipeline, refresh static
data, query OpenAlex, or claim complete weekly historical coverage.

GitHub CI validates pull requests to `main`, pushes to `main`, and manual runs.
Vercel remains the production CD mechanism through its Git integration after
accepted changes are merged to `main`.

Do not add without an explicit accepted scope:

- backend, database, CMS, API routes, scheduler, or deployment automation;
- AI summaries, editorial analysis, semantic search, embeddings, or automatic publication;
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

- Static Research Digest source directory: `web/data/digests/`
- Publishing command: `python -m pipeline.website_publisher pipeline\data\runs\<run_id>`
- Publishing workflow documentation: `docs/WEBSITE_PUBLISHING_WORKFLOW.md`
- Available research editions: 18 selected static digest editions
- Available engineering editions: 20 selected static briefing editions under `web/data/briefings/`
- Papers per edition: up to 6 selected papers
- Implemented reader paths:
  - Homepage -> Engineering Briefing
  - Homepage -> Weekly Digest -> Paper Detail
  - Archive -> Weekly Digest
  - Archive Search -> Paper Detail
  - Archive Search -> originating Weekly Digest
  - Paper Detail -> originating Weekly Digest

Detailed continuity notes live in `PROJECT_HANDOVER.md`. The resume entry point
for a new session is `START_HERE.md`.
