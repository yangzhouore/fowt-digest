# Start Here

Use this file as the first entry point for a new Codex session.

## Resume Point

- Branch: `main`
- Current milestone: M8 Homepage Content Value Refinement
- Current feature: none in progress after M7 merge
- Current phase: M8 complete, accepted, merged to main, and pushed
- Release tag: `v1.3.0`
- Production website: https://fowt-digest-oegd.vercel.app/
- Immediate next task: select the next milestone

Everything before this point is complete, accepted, merged to `main`, pushed,
and passing GitHub CI unless `PROJECT_STATUS.md` says otherwise.

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
- M6 CI/CD Foundation implementation and acceptance review;
- Homepage Editorial UX;
- Archive Search;
- M7 Engineering Briefing design review;
- M7A Engineering source policy and data contracts;
- M7B Manual Engineering Briefing Prototype;
- M7C Historical Engineering Briefing Archive;
- Homepage editorial refinement for Engineering and Research;
- M8 Homepage Content Value Refinement.

The website currently loads static Research Digest JSON files from:

```text
web/data/digests/
```

The research adapter validates the imported digest files, returns editions newest first,
uses the newest digest as the current homepage digest, exposes static paper data
for Archive Search, and resolves Paper Detail pages with the correct originating
Weekly Digest context. The local publishing workflow copies pipeline
`weekly_digest.json` output into this static data structure and refreshes
adapter registration.

The research archive contains 18 selected static digest editions. These are
representative static editions and not complete weekly historical coverage.
Archive Search is immediate, deterministic, static, and client-side only. It
uses committed website data and does not query OpenAlex or any backend.

Engineering Briefing data is independent static website data under:

```text
web/data/briefings/
```

The Engineering Briefing archive contains 20 representative source-backed editions. It is independent from the deterministic OpenAlex Research Pipeline and does not use scraping automation, source APIs, a backend, a database, a CMS, or AI generation.

## Current Boundary

`main` is the current stable branch after M7 merge. No feature branch is active
and the next milestone has not been selected.

GitHub CI is operational for pull requests to `main`, pushes to `main`, and
manual `workflow_dispatch` runs. It validates the pipeline and website baseline.
Vercel remains the production CD mechanism through its Git integration after
accepted changes are merged to `main`; the repository does not use Vercel CLI,
deployment tokens, or a second deployment system.

The website remains a static presentation layer only. It does not run the
pipeline, refresh data automatically, or add AI-written summaries, findings,
limitations, scores, or editorial analysis.

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
