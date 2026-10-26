# Project Status

Last updated: 2026-10-26. Review base: merged main `580a83e` (weekly PR #48);
latest product feature baseline: `710bba5` (PR #47).

## Current State

- Current stable branch: `main`
- Latest completed product milestone: Digital & AI evidence reader and pathway comparison (PR #47), merged into main at `710bba5`
- Next product MVP: not yet scoped or accepted
- Current work: section-by-section code review and maintenance documentation on `chore/codebase-review-documentation`; see `docs/WEBSITE_MAINTENANCE.md`.
- Latest release tag: `v1.4.0`
- Production website: https://fowt-digest-oegd.vercel.app/
- Delivery: create the maintenance PR after local acceptance and leave it open for manual merge; record remote CI/preview separately from local results.

## Latest Merged Weekly Update: 19-25 October 2026 (PR #48)

- Branch: `data/weekly-digest-2026-10-25`, based on main `710bba5`; merged manually into main at `580a83e` (PR #48).
- Skills: `skills/fowt-paper/SKILL.md` and `skills/fowt-news/SKILL.md`.
- Collection/selection/validation record: `docs/weekly/2026-10-25.md`.
- Research: 207 obtained raw records -> 83 deduplicated candidates -> five selected
  by the unchanged deterministic model. Coverage is partial: two HTTP 401
  continuation failures persisted on retry, and the configured cap was reached.
  The candidate-page note preserves these limitations.
- Engineering: 42 registry-domain attempts; eight retained reviewed inventory.
  Eighteen source records -> 16 in-window -> 11 eligible reports -> six same-event
  overlaps removed -> five independent candidates and five highlights. Primary
  candidate records represent five publishers. Counts are not exhaustive coverage.
- Both editions and candidate transparency are registered; the homepage defaults
  to the newly paired week. Historical records and product behaviour are unchanged.
- Local validation: 210 Python tests, data validation, 155 data tests, lint,
  454 static routes and 17 browser journeys passed, plus focused local weekly
  navigation/count/coverage-note and 390px checks. Final-head CI/preview are in the
  weekly PR #48 description; that PR is now merged.

## Merged Digital & AI Evidence Reader and Pathway Comparison (PR #47)

- Branch: `feat/digital-ai-evidence-pathways`, based on main `b409213`.
- User authorised recommendations 2 and 3 without another approval gate.
- Scope/design: `web/app/digital-ai/design/EVIDENCE_PATHWAYS_MVP.md`.
- Source review/validation: `web/app/digital-ai/design/EVIDENCE_PATHWAYS_IMPLEMENTATION.md`.
- Fourteen static internal reading pages expose original records and provenance,
  separate editorial relevance/source notes, and link back to exact page contexts.
- Four pathways compare physical routing, procurement, continuity and evidence;
  coverage labels replace broad maturity badges. Context is not deployment proof.
- Local acceptance: 210 Python tests, static data validation, 155 data tests, lint,
  445-page build (14 reader routes) and 17 browser journeys passed.
- Original Signals/use-case records, papers, pipeline and unrelated datasets were
  unchanged by this feature. [PR #47](https://github.com/yangzhouore/fowt-digest/pull/47)
  was merged manually into main at `710bba5`. All three CI jobs passed on feature
  head `55cc536` in [run #79](https://github.com/yangzhouore/fowt-digest/actions/runs/39972100167).

## Merged Digital & AI Practical Cards (PR #46)

- Branch: `feat/digital-ai-use-case-cards`, based on main `963e891`.
- Accepted design: `web/app/digital-ai/design/USE_CASE_CARDS_MVP.md`.
- Source review and validation: `web/app/digital-ai/design/USE_CASE_CARDS_IMPLEMENTATION.md`.
- Ten bilingual application cards explain problem, inputs, method, output, human
  decision, evidence and limitations. Illustrative workflows and documented
  examples are labelled separately. Two areas retain explicit evidence gaps;
  inaccessible EPROA evidence is labelled as stored context, not freshly verified.
- Local acceptance: 210 Python tests, data validation, 151 data tests, lint,
  431-page build and 14 browser journeys passed. The original 14 Signals,
  authoritative datasets and other product sections are unchanged.
- [PR #46](https://github.com/yangzhouore/fowt-digest/pull/46) was merged manually
  into main at `b409213`. Pipeline validation, Website validation and Browser smoke
  passed on implementation head `91b77c5` in
  [CI run #77](https://github.com/yangzhouore/fowt-digest/actions/runs/39967078082).

## Merged International Industry Guides

- International Industry Guides: [PR #44](https://github.com/yangzhouore/fowt-digest/pull/44), merged at `da48422`.
- Objectives, design/self-review, implementation and acceptance:
  `web/app/industry/design/INTERNATIONAL_INDUSTRY_GUIDES.md`.
- `/industry` provides four country entry points, a sourced responsibility
  comparison and the unchanged international company directory.
- `/industry/uk` retains the UK guide delivered in
  [PR #43](https://github.com/yangzhouore/fowt-digest/pull/43), merged at `84c8e69`.
  UK design/evidence: `web/app/industry/design/UK_FOWT_SYSTEM_DESIGN.md` and
  `web/app/industry/design/UK_FOWT_SYSTEM_IMPLEMENTATION.md`.
- `/industry/germany`, `/industry/norway` and `/industry/china` each use the
  22-topic structure: nine chain levels, 17 lifecycle stages, 12 grouped power
  steps, 15 investigation questions and 16 organisation-role cards.
- New-country coverage has 64 primary/public technical source records. This is
  representative dated coverage, not a complete national supplier register or
  real-time project tracker. The UK guide retains its independent source dataset.
- Distinguish industrial delivery, development, permissions and electricity/money;
  distinguish capability, R&D, announced plans and documented project scopes.
- The original 47-company registry, canonical anchors, Project backlinks, paper
  records and authoritative Projects data were preserved.
- Final implementation head `db8cae9` passed Pipeline validation, Website
  validation and Browser smoke in
  [PR CI run #73](https://github.com/yangzhouore/fowt-digest/actions/runs/39927826616).
- The next product implementation needs a new feature branch and an accepted
  objective/design/validation scope; no new product MVP is implied by this
  handover/CI maintenance task.

## Merged Connected Project Context MVP

- Objectives and acceptance: `docs/CONNECTED_PROJECT_CONTEXT_MVP.md`.
- Design self-review: `docs/CONNECTED_PROJECT_CONTEXT_DESIGN_REVIEW.md`.
- Implementation and validation evidence: `docs/CONNECTED_PROJECT_CONTEXT_IMPLEMENTATION.md`.
- Branch: `feat/connected-project-context-mvp`.
- Scope: Projects <-> Engineering coverage and Projects <-> existing Industry entries.
- Initial Engineering coverage: six audited links across Eolmed, EFGL, Green Volt and Pentland; all 48 profiles have coverage or an explicit empty state.
- Company coverage: existing valid `industryCompanyId` roles only; no inferred matches.
- Papers and all authoritative datasets remain unchanged.
- User accepted the design on 2026-10-22 ("yes please continue"); implementation and local acceptance are complete.
- Local validation: 210 Python tests, data validation, 148 data tests, lint, 427-page build and ten browser tests passed. All 121 protected files match the base by Git-normalized content hash.
- Delivery: [PR #42](https://github.com/yangzhouore/fowt-digest/pull/42) was merged manually and is present in main at `2e3a0cc`.

## Previous Completed MVP

- Scope and measurable acceptance: `docs/PROJECTS_PUBLIC_EVIDENCE_MVP.md`.
- Design self-review: `docs/PROJECTS_PUBLIC_EVIDENCE_DESIGN_REVIEW.md`.
- Implementation and validation evidence: `docs/PROJECTS_PUBLIC_EVIDENCE_IMPLEMENTATION.md`.
- Branch: `feat/projects-public-evidence-mvp`.
- Goals: area-specific public evidence, explicit uncertainty, substantive review dates and change history across Projects.
- Pilot public-source assessment reviews: Green Volt, Hywind Tampen and CampionWind.
- Papers and Research remain outside scope.
- User accepted the design on 2026-10-21. Local validation passed: 210 Python tests, static data validation, 118 data tests, lint, 427-page build and seven browser tests.
- All 48 profiles have explicit evidence areas; three pilot public-source assessment reviews are recorded. Other historical review dates remain unrecorded.
- Pipeline validation, Website validation and Browser smoke passed on implementation-delivery head `00a36be`; the PR records verification of its final head.
- Delivery: https://github.com/yangzhouore/fowt-digest/pull/41 was merged manually and is present in local main at `e88d325`.

## Current Capabilities

The repository contains five independent static content areas:

- Research Digest: deterministic OpenAlex pipeline output published as static
  JSON under `web/data/digests/`.
- Engineering Briefing: manual source-backed static JSON under
  `web/data/briefings/`.
- Industry Map: independent curated country-system guides, evidence and an
  international company registry under `web/data/industry/`.
- Projects: curated source-backed floating offshore wind project data under
  `web/data/projects/`.
- Digital & AI: 14 curated source-backed Signals under `web/data/digital-ai/`,
  used as evidence for the AI × offshore-wind impact maps.

The website supports:

- Homepage with a concise weekly briefing across Engineering and Research, plus
  a multi-week timeline defaulting to the newest paired Engineering/Research week;
- current and archived Research Digest pages;
- Paper Detail pages;
- Research Archive with static client-side search;
- Engineering archive and briefing pages with static search and region filters;
- Engineering candidate transparency pages with deterministic
  `engineering_selection_score_v1`, source-registry diagnostics, selected
  state, score breakdowns and source links for supported weeks;
- Industry overview comparing four countries, UK/Germany/Norway/China system
  guides, and the original company directory with canonical project navigation;
- Projects index and detail pages for 48 source-backed floating offshore wind
  project records, with region/country/status filtering, technical facts,
  verified ecosystem roles, source-backed timelines and provenance links;
- Project Intelligence on all 48 project detail pages, including current
  assessment, explicit FID status, lifecycle progress, project story, qualitative
  readiness gates, watchpoints, and separate sourced facts/editorial inferences;
- Digital & AI page centered on how AI affects the offshore-wind lifecycle and
  how offshore wind may power land, coastal, offshore, and flexible compute;
- reader-facing Methodology and About pages;
- persistent English / Simplified Chinese interface and fixed-copy switching,
  independent from the Light / Dark theme control.

The local research publishing workflow can copy an accepted pipeline
`weekly_digest.json` into website data and refresh adapter registration. GitHub
CI validates pushes and pull requests to `main`. Vercel deploys production from
committed `main` through Git integration.

## Architecture Boundaries

- The pipeline remains the source of truth for research paper data.
- The website is presentation only and consumes committed static JSON and
  TypeScript data fixtures.
- Engineering Briefing data is independent from the OpenAlex Research Pipeline.
- Industry Map data is independent from Research Digest and Engineering data.
- Projects data is static website data and is independent from Research Digest,
  Engineering Briefing and Industry Map UI data.
- Digital & AI data is independent static evidence data; its 14 Signals support
  the impact diagrams and are not a generic AI news feed or ranked pipeline.
- The language layer is local UI state backed by `localStorage`. It does not use
  external translation, locale routes, or duplicated source datasets.
- Archive Search is deterministic, client-side, and uses committed website data.
- No backend, database, CMS, API routes, scheduler, semantic search, AI writing,
  automatic collection, automatic publication, automatic project updates, stock
  data, market data, or deployment automation exists.
- The website must not invent, repair, re-rank, summarise, or reinterpret paper
  records.
- Engineering briefing copy must remain traceable to source records.
- Projects facts, relationships, timelines and sources must remain traceable to
  accepted project source records.

## Current Data Baseline

- Static Research Digest editions: 42 editions, latest week ending 2026-10-25.
- Static Research candidate-pool files: 29 retained or reconstructed weekly
  candidate pools.
- Static Engineering Briefing editions: 42 editions, latest week ending 2026-10-25.
- Static Engineering source registry: 42 approved source records.
- Static Industry Map companies: 47 curated organisations.
- Static Projects records: 48 source-backed floating offshore wind project
  records.
- Static Digital & AI Signals: 14 source-backed records.
- These archives are demonstration coverage, not complete historical coverage.
- Weekly Digest pages may show abstract previews.
- Paper Detail pages show complete abstracts when available.
- Homepage Research cards do not show abstract previews.
- Current Engineering Homepage items use controlled region labels, with
  global/non-specific items classified as `Unspecified`.
- Projects filtering includes region, country, lifecycle, FID, capacity and
  paired readiness area/state. Merged Connected Project Context adds navigation to
  existing Industry entries through recorded company IDs. Geographic maps, GIS
  data and automatic project collection/update remain outside scope.

## Earlier Industry Validation Baseline

Fresh local validation of merged main `da48422` on 2026-10-23
(Python 3.14.5, Node 24.19.0):

```text
python -m pytest pipeline/tests -> 210 passed
npm.cmd run validate:data -> passed
npm.cmd run test:data -> 148 passed
node --test data/industry/country-guides.test.js data/industry/uk-guide.test.js -> 62 passed
npm.cmd run lint -> passed, zero errors
npm.cmd run build -> passed, 431 static pages
git diff --check -> passed
```

Python tests used the installed Python executable and an ignored local pytest
temporary directory. Lint reported six pre-existing warnings in ignored local
prior-MVP pytest fixtures; tracked source had no lint errors. The feature's
accepted browser runs also passed 12 Industry journeys and 10 shared regression
journeys; see the Industry implementation document for exact commands.

Pushes and pull requests to `main` trigger CI. The focused 62 Industry checks and
12 Industry browser journeys are additional direct local checks, not new CI jobs.
Historical pre-maintenance browser runs stalled during OS dependency installation;
the current workflow below already includes the container fix. Those old runs
do not describe current branch health. Record new final-head CI in its PR.

Browser CI now uses the official Playwright Noble image, pinned to the locked
`@playwright/test` version 1.63.0 and an immutable image digest, with browsers and
OS dependencies preinstalled. An explicit installed-package version check fails
if the package is upgraded without updating the image/check. Update all three
together; do not restore unbounded per-run OS package installation or treat
skipped setup/tests as passing. The ten-minute job limit and failure-diagnostic
upload remain in place. See [Playwright's Docker guidance](https://playwright.dev/docs/docker)
for image contents and version compatibility.

## Current Maintenance Review

- Scope, section map, findings and acceptance: `docs/WEBSITE_MAINTENANCE.md`.
- Fixed Engineering edition-date/year search without changing the page layout.
- Added three shared browser journeys for Engineering search, Research provenance
  navigation, and Methodology/About mobile bilingual reading.
- Updated routes, ownership, publication checks and browser CI documentation.
- Source-backed data, styling, pipeline and scoring remain unchanged.
- Local results are in the review document; remote CI and preview status must be
  checked against the eventual PR head.

## Reference Map

Read only when relevant:

- Product principles: `docs/PRODUCT_VISION.md`
- Pipeline architecture: `docs/PIPELINE_ARCHITECTURE.md`
- Pipeline contracts: `docs/PIPELINE_DATA_MODEL.md`
- Website publishing: `docs/WEBSITE_PUBLISHING_WORKFLOW.md`
- Engineering source policy: `docs/ENGINEERING_SOURCE_POLICY.md`
- Engineering briefing contract: `docs/ENGINEERING_BRIEFING_DATA_MODEL.md`
- Selection transparency: `docs/SELECTION_TRANSPARENCY.md`
- Digital & AI scope and evidence rules: `docs/M11_DIGITAL_AI_SIGNALS_DESIGN.md`
- Optional module map: `PROJECT_HANDOVER.md`
- Historical records: `docs/archive/`
