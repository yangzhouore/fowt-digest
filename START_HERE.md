# Start Here

Use this file as the first entry point for a new Codex session.

## Resume Point

- Branch: `feature/m6-cicd`
- Milestone: M6 - CI/CD Foundation
- Current feature: M6 CI/CD Foundation accepted
- Current phase: M6 complete and accepted on feature branch; not merged to main
- Release tag: `v1.2.0`
- Production website: https://fowt-digest-oegd-cs33ynefc-dudu-yang.vercel.app
- Immediate next task: merge accepted M6 branch into main

Everything before this point is complete, accepted, and merged unless
`PROJECT_STATUS.md` says otherwise.

## Completed Website Baseline

Completed and accepted work now merged into `main` includes:

- UX-01 Homepage Entry and Reader Framing;
- UX-02 Weekly Digest Scanability;
- UX-03 Paper Detail Readability;
- DD-01 multiple static weekly digest support;
- DD-02 historical demonstration dataset;
- UX-04 Website Presentation Refinement;
- UX-05 Site Trust Copy Alignment;
- DD-03 Static Digest Data Guardrails;
- M4 Website Publishing Workflow;
- M5 Repository Automation Design Review;
- M5 Repository Workflow Automation implementation and acceptance review;
- M6 CI/CD Foundation implementation and acceptance review.

The website currently loads static digest JSON files from:

```text
web/data/digests/
```

The adapter validates the imported digest files, returns editions newest first,
uses the newest digest as the current homepage digest, and resolves Paper Detail
pages with the correct originating Weekly Digest context. The local publishing
workflow now copies pipeline `weekly_digest.json` output into this static data
structure and refreshes adapter registration.

The archive contains 18 selected static digest editions. These are
representative static editions and not complete weekly historical coverage.

## Current Boundary

M6 implementation is accepted on `feature/m6-cicd` and has not been
merged to `main`. It adds `.github/workflows/ci.yml` as the GitHub Actions
validation workflow for pull requests to `main`, pushes to `main`, and manual
`workflow_dispatch` runs. It keeps pipeline and website validation in separate
jobs and leaves production deployment to the existing Vercel Git integration.
Do not expand it into scheduled OpenAlex execution, automatic digest generation,
automatic publication, automatic commits, automatic pushes, automatic PRs,
automatic merging, Vercel CLI deployment, backend, database, CMS, API routes,
or website behavior changes. M7 has not started.

The website remains a presentation layer only. It does not run the pipeline,
refresh data automatically, or add AI-written summaries, findings, limitations,
scores, or editorial analysis.

## Reading Order

Read these first:

1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `docs/PRODUCT_VISION.md`
4. `docs/UX_ROADMAP.md`
5. `PROJECT_HANDOVER.md`

Read only if needed for the task:

- `docs/PIPELINE_ARCHITECTURE.md`
- `docs/PIPELINE_DATA_MODEL.md`
- `docs/WEBSITE_PUBLISHING_WORKFLOW.md`
- `docs/M5_REPOSITORY_AUTOMATION_DESIGN_REVIEW.md`
- `docs/M6_CICD_FOUNDATION.md`
- relevant files under `web/`
- relevant tests or package scripts under `web/`

Historical early-MVP notes remain in `docs/product.md`, `docs/design.md`,
`docs/architecture.md`, and `docs/MILESTONES.md`. Do not use them as current
status sources.

## Development Workflow

For each new feature:

```text
Design review
-> Implement the approved scope only
-> Run validation
-> Acceptance review
-> Commit only after acceptance
```

Recommended validation for website work:

```powershell
cd web
npm.cmd run validate:data
npm.cmd run test:data
npm.cmd run lint
npm.cmd run build
cd ..
git diff --check
git status
```

## Implementation Discipline

- Make the smallest change that satisfies the accepted feature.
- Preserve existing visual language unless the feature explicitly scopes a
  presentation change.
- Use the existing digest adapter when a page already depends on it.
- Do not duplicate pipeline mapping logic in page components.
- Do not improve pipeline data for presentation.
- Do not invent paper claims, summaries, findings, limitations, scores, or
  editorial analysis.
- Keep pipeline and website boundaries explicit.
