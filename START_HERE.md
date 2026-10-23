# Start Here

Use this file as the resume entry point for a new Codex session.

## Stable State

- Current stable branch: `main`
- Latest completed product milestone: International Industry Guides (PR #44), merged into main at `da48422`
- Next product MVP: not yet scoped or accepted; define its objectives, design and acceptance criteria before implementation
- Current feature work: Digital & AI practical use-case cards; design accepted on 2026-10-23, local implementation validated, awaiting PR review/manual merge.
- Latest release tag: `v1.4.0`
- Production website: https://fowt-digest-oegd.vercel.app/
- Delivery: leave the feature PR open for manual merge; final-head CI and preview are recorded in its description.

The product baseline at `da48422` includes Digital & AI, Methodology, the bilingual
interface, Project Intelligence across all 48 projects, Connected Project Context,
the UK/Germany/Norway/China Industry guides, and weekly data through 2026-10-18.
Read `PROJECT_STATUS.md` for validation and CI evidence; a previously pending job
must be checked by run/commit, not treated as a permanent repository problem.

## Normal Reading Path

Read in this order:

1. `AGENTS.md`
2. `START_HERE.md`
3. `PROJECT_STATUS.md`
4. current milestone document, if one exists

Do not read historical docs under `docs/archive/` by default. Open archived docs
only when historical context is specifically required.

## Reference Docs

Current Digital & AI feature:

- Accepted scope and design: `web/app/digital-ai/design/USE_CASE_CARDS_MVP.md`
- Source review and validation: `web/app/digital-ai/design/USE_CASE_CARDS_IMPLEMENTATION.md`
- Ten bilingual practical cards; original 14 Signals unchanged. Internal evidence
  reader and compute-pathway comparisons remain deferred.

Latest merged product milestone (PR #44):

- Objectives, design/self-review, implementation and local acceptance:
  `web/app/industry/design/INTERNATIONAL_INDUSTRY_GUIDES.md`
- UK guide design and implementation:
  `web/app/industry/design/UK_FOWT_SYSTEM_DESIGN.md` and
  `web/app/industry/design/UK_FOWT_SYSTEM_IMPLEMENTATION.md`

Merged Connected Project Context MVP (PR #42, `2e3a0cc`):

- Objectives, design and acceptance gates: `docs/CONNECTED_PROJECT_CONTEXT_MVP.md`
- Design self-review and approval item: `docs/CONNECTED_PROJECT_CONTEXT_DESIGN_REVIEW.md`
- Implementation and validation evidence: `docs/CONNECTED_PROJECT_CONTEXT_IMPLEMENTATION.md`

Merged Projects Public Evidence MVP (PR #41, `e88d325`):

- Objectives, design, acceptance criteria and delivery gates: `docs/PROJECTS_PUBLIC_EVIDENCE_MVP.md`
- Design self-review and user acceptance record: `docs/PROJECTS_PUBLIC_EVIDENCE_DESIGN_REVIEW.md`
- Implementation, pilot reviews and validation evidence: `docs/PROJECTS_PUBLIC_EVIDENCE_IMPLEMENTATION.md`

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
are intentionally static. Merged Connected Project Context provides
explicit Project / Engineering reading links and navigation through existing
Industry company IDs. Geographic maps and automatic project collection or updates
remain outside scope.

Industry Map now starts at `/industry` with four country entry points, a sourced
responsibility comparison and the original international company directory.
The detailed guides live at `/industry/uk`, `/industry/germany`,
`/industry/norway` and `/industry/china`. Existing company anchors and project
backlinks stay on `/industry`. Guide evidence is independent of authoritative
Projects and paper records; capability, R&D, plans and project awards remain
distinct. The UK guide covers the GB electricity market, not Northern Ireland.

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

Additional merged Industry acceptance checks (from `web/`):

```powershell
node --test data/industry/country-guides.test.js data/industry/uk-guide.test.js
npx.cmd playwright test --config=app/industry/browser.playwright.config.ts
npm.cmd run test:smoke
```

The focused Industry commands are local acceptance checks, not extra CI jobs.
Existing CI validates the guide assertions through build and server-render tests
and runs the separate shared browser regression suite. Preserve that distinction
when reporting checks. On Windows, Playwright may need normal process permissions
to shut down its local production server cleanly.
