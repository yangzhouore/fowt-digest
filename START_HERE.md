# Start Here

Use this file as the resume entry point for a new Codex session.

## Stable State

The 2–8 November 2026 weekly update is prepared locally on
`data/weekly-digest-2026-11-08`, based on `a1bf8bf` (merged OpenAlex maintenance
PR #58). Authenticated collection completed all 13 queries without failures or
a reached cap: 165 ranked Research candidates, five selected records and two
Engineering highlights. Four selected Research records are parts of one archive;
see `docs/weekly/2026-11-08.md` for evidence, selection limits and validation.
The update is prepared for a review PR; merge and deployment await acceptance.
The earlier dated snapshot below
records the pre-merge guide status.

Verified against GitHub on 2026-11-06.

- Current stable branch: `main` at `cab926b` (merged handover PR #57).
- Latest completed product milestone: AI × Energy explainer, PR #50, merged
  at `bb3b06a`. Scope and acceptance: `web/app/digital-ai/design/ENERGY_SYSTEM_MVP.md`;
  source review: `web/app/digital-ai/design/ENERGY_SYSTEM_IMPLEMENTATION.md`.
- Latest weekly update: 26 October–1 November 2026, PR #52, merged at `0a03771`.
  Record: `docs/weekly/2026-11-01.md`. Five Research records from 86 obtained
  candidates (partial coverage), five Engineering highlights from six candidates.
- Subsequent merged fixes: Next.js 16.4.5 (#53), OpenAlex publication types (#54),
  incomplete-collection publication guard (#55), and language-storage resilience (#56).
- Pending product work: Digital & AI unified guide on `feat/digital-ai-unified-guide`,
  [PR #51](https://github.com/yangzhouore/fowt-digest/pull/51), still open.
  Current main `cab926b` is incorporated into the feature branch. Scope and
  implementation documents are
  `web/app/digital-ai/design/UNIFIED_GUIDE_MVP.md` and `UNIFIED_GUIDE_IMPLEMENTATION.md`.
- Separate unmerged work: `feature/private-analytics-dashboard` at `7a0ecd0`.
  Its branch-local `docs/private-analytics.md` records scope and remaining live checks.
- Latest release tag: `v1.4.0`
- Production website: https://fowt-digest-oegd.vercel.app/

The merged product includes Digital & AI, Methodology, the bilingual
interface, Project Intelligence across all 48 projects, Connected Project Context,
the UK/Germany/Norway/China Industry guides, ten practical Digital & AI cards,
14 internal evidence readers, four supply pathways and the broader AI × Energy
explainer. PR #51's unified presentation and private analytics are not in main.

Integrated PR #51 local acceptance is complete; leave it open for manual review/merge.
Check the PR for CI/preview results on its final integration commit. Next,
establish complete OpenAlex collection before the next Research
publication; review analytics separately. PR #55 blocks incomplete or capped
collection but does not fix the earlier HTTP 401 failures or collection cap.
Preserve historical published records and their partial-coverage disclosures.
Read `PROJECT_STATUS.md` for validation evidence and the ordered follow-up work.
Check CI by run/commit; historical success does not validate a new integration.

## Normal Reading Path

Read in this order:

1. `AGENTS.md`
2. `START_HERE.md`
3. `PROJECT_STATUS.md`
4. current milestone document, if one exists

Do not read historical docs under `docs/archive/` by default. Open archived docs
only when historical context is specifically required.

## Reference Docs

Current unified Digital & AI work (PR #51, not yet merged):

- One six-chapter sequence: understand → apply AI → supply computing →
  developments → conditional futures → evidence.
- Seven topics contain the ten practical workflows in context, replacing the
  competing lifecycle map. Reading mappings: `web/app/digital-ai/guide-structure.ts`.
- Existing task/field/pathway/evidence deep links and all source records remain.

Merged AI × Energy explainer (PR #50, `bb3b06a`):

- Independent context data: `web/data/digital-ai/energy-context.json`.
- Presentation: `web/app/digital-ai/energy-system.tsx` and its CSS module.
- Preserve original fourteen Signals, ten wind application cards, four pathways
  and existing reader routes. Context sources do not update their recorded status.
- No live news, AI runtime, collection, new pipeline stages or automatic publishing.

Merged maintenance review (PR #49, `20533eb`):

- Scope, section ownership, findings and validation: `docs/WEBSITE_MAINTENANCE.md`
- Browser acceptance: `web/tests/browser/README.md`
- Preserve the existing presentation and committed source records.

Latest merged weekly update:

- Collection/selection/validation record: `docs/weekly/2026-11-01.md`
- Follow `skills/fowt-paper/SKILL.md` and `skills/fowt-news/SKILL.md` for weekly work.
- Preserve the visible partial Research coverage note; three OpenAlex continuation
  requests failed with HTTP 401 and the configured collection cap was reached.
- PR #52 was merged at `0a03771`. The current publisher requires complete,
  successful, uncapped collection diagnostics matching the run; see
  `docs/WEBSITE_PUBLISHING_WORKFLOW.md`. Historical partial publication is not
  permission to bypass the new guard.

Merged Digital & AI evidence reader and comparison (PR #47, `710bba5`):

- Scope, design and self-review: `web/app/digital-ai/design/EVIDENCE_PATHWAYS_MVP.md`
- Implementation/source review/validation: `web/app/digital-ai/design/EVIDENCE_PATHWAYS_IMPLEMENTATION.md`
- Fourteen static evidence readers and four-pathway comparison; merged manually.

Merged practical cards (PR #46, `b409213`):

- Accepted scope and design: `web/app/digital-ai/design/USE_CASE_CARDS_MVP.md`
- Source review and validation: `web/app/digital-ai/design/USE_CASE_CARDS_IMPLEMENTATION.md`
- Ten bilingual practical cards; original 14 Signals unchanged.

Merged International Industry Guides (PR #44):

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
Research, and Methodology. `/digital-ai` explains the broader AI × Energy system
through seven fields, dated developments and conditional futures, alongside
offshore-wind applications, energy pathways and 14 source-backed Signals.
The interface and fixed editorial copy can switch between English and Simplified
Chinese; source-backed titles,
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
