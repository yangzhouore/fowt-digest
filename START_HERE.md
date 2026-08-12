# Start Here

Use this file as the resume entry point for a new Codex session.

## Stable State

- Current stable branch: `main`
- Active feature branch: none
- Active milestone: none
- Latest completed work: M9 FOWT Industry Map
- Release tag: `v1.3.0`
- Production website: https://fowt-digest-oegd.vercel.app/
- Immediate next action: select or define the next milestone before starting
  implementation work.

Everything before this point is complete, accepted, merged to `main`, pushed,
and expected to pass GitHub CI unless `PROJECT_STATUS.md` says otherwise.

## Normal Reading Path

Read in this order:

1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. current milestone document, if one exists

Do not read historical docs under `docs/archive/` by default. Open archived docs
only when historical context is specifically required.

## Reference Docs

Open only when relevant:

- Product direction: `docs/PRODUCT_VISION.md`
- Research pipeline architecture: `docs/PIPELINE_ARCHITECTURE.md`
- Research pipeline contracts: `docs/PIPELINE_DATA_MODEL.md`
- Website publishing workflow: `docs/WEBSITE_PUBLISHING_WORKFLOW.md`
- Engineering source policy: `docs/ENGINEERING_SOURCE_POLICY.md`
- Engineering briefing data contract: `docs/ENGINEERING_BRIEFING_DATA_MODEL.md`
- Optional repository map: `PROJECT_HANDOVER.md`

## Current Data Locations

- Static Research Digest data: `web/data/digests/`
- Static Engineering Briefing data: `web/data/briefings/`
- Static Industry Map data: `web/data/industry/`
- Research adapter: `web/data/digest-adapter.ts`
- Engineering adapter: `web/data/engineering-briefing-adapter.ts`

The website is a static presentation layer over committed JSON and TypeScript
fixtures. It does not run the pipeline, query OpenAlex, collect engineering
sources, deploy itself, or use AI-generated summaries.

## Standard Workflow

For each new feature or maintenance task:

```text
read current scope
-> create/switch to the requested branch
-> implement only the accepted scope
-> run validation
-> inspect diff
-> commit only when requested
-> merge only when requested after acceptance
```

Full validation baseline:

```powershell
python -m pytest pipeline/tests
cd web
npm.cmd run validate:data
npm.cmd run test:data
npm.cmd run lint
npm.cmd run build
cd ..
git diff --check
git status
```
