# Start Here

Use this file as the resume entry point for a new Codex session.

## Stable State

- Current stable branch: `main`
- Active milestone: none; next scope requires an accepted task
- Latest merged work: Research catch-up through 2026-10-04 and restored homepage multi-week timeline (PRs #33-34)
- Latest release tag: `v1.4.0`
- Production website: https://fowt-digest-oegd.vercel.app/
- Next work: follow the next accepted task; no feature milestone is active.

Stable `main` includes Digital & AI, Methodology, the bilingual interface,
Project Intelligence across all 48 projects, and weekly catch-up through
2026-10-04. It is expected to pass the baseline unless `PROJECT_STATUS.md`
says otherwise.

## Normal Reading Path

Read in this order:

1. `AGENTS.md`
2. `START_HERE.md`
3. `PROJECT_STATUS.md`
4. current milestone document, if one exists

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
- Selection transparency: `docs/SELECTION_TRANSPARENCY.md`
- Digital & AI scope and evidence rules: `docs/M11_DIGITAL_AI_SIGNALS_DESIGN.md`
- Optional repository map: `PROJECT_HANDOVER.md`

## Current Data Locations

- Static Research Digest data: `web/data/digests/`
- Static Engineering Briefing data: `web/data/briefings/`
- Static Industry Map data: `web/data/industry/`
- Static Projects data: `web/data/projects/`
- Static Digital & AI data: `web/data/digital-ai/`
- Research adapter: `web/data/digest-adapter.ts`
- Engineering adapter: `web/data/engineering-briefing-adapter.ts`
- Projects adapter: `web/data/project-adapter.ts`
- Digital & AI adapter: `web/data/digital-ai-adapter.ts`
- Language provider and dictionaries: `web/app/i18n/`

The Projects MVP is implemented and accepted: `/projects` and
`/projects/[slug]` render 48 source-backed floating offshore wind project
records with region/country/status filtering, Project Intelligence, verified
technical facts, project-company roles, source-backed timelines, and provenance links. Projects
are intentionally static. No geographic map, automatic project collection,
automatic updates, or Project-to-Industry deep integration exists yet; those
belong to a future dedicated milestone.

Selection transparency is implemented for Research and Engineering where
candidate-pool data exists. Weekly Research candidate pages expose deterministic
`research_selection_score_v1`; weekly Engineering candidate pages expose
`engineering_selection_score_v1`, source-registry diagnostics, selected state,
score breakdowns and source links. `/engineering` shows all selected highlights
for each edition with selected/candidate/source counts.

The Homepage now presents the weekly Engineering and Research selections with a
multi-week timeline selecting the newest week with both Engineering and Research
data by default. Engineering and Research archive pages support static search over
committed records. The website is a static presentation layer over committed
JSON and TypeScript fixtures. It does not run the pipeline, query OpenAlex,
collect engineering sources, deploy itself, or use AI-generated summaries.

The primary navigation covers Engineering, Industry Map, Projects, Digital & AI,
Research, and Methodology. `/digital-ai` presents the two-way AI × offshore-wind
relationship through an offshore-wind lifecycle map, energy pathways, and 14
source-backed Signals as supporting evidence. The interface and fixed editorial
copy can switch between English and Simplified Chinese; source-backed titles,
abstracts, project/company facts, publishers, proper nouns, and URLs remain in
their original language unless an explicit Chinese field exists.

## Repository Skills

- `skills/fowt-paper/SKILL.md`: deterministic weekly Research collection, scoring,
  selection, and candidate-pool reconstruction/audit.
- `skills/fowt-news/SKILL.md`: registry-bounded Engineering candidate discovery,
  scoring, diversity-aware selection, and transparency.
- `skills/fowt-project-intelligence/SKILL.md`: sourced project-state audits, FID
  gates, fact/inference separation, readiness, and watchpoints.

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
