# Project Status

Last updated: 2026-08-26

## Current State

- Current stable branch: `main`
- Active milestone: none
- Current documentation branch: `docs/repository-sync`
- Latest merged work: English / Simplified Chinese interface toggle (PR #22)
- Latest release tag: `v1.4.0`
- Production website: https://fowt-digest-oegd.vercel.app/
- Immediate next task: await review of the repository documentation sync.

## Current Capabilities

The repository contains five independent static content areas:

- Research Digest: deterministic OpenAlex pipeline output published as static
  JSON under `web/data/digests/`.
- Engineering Briefing: manual source-backed static JSON under
  `web/data/briefings/`.
- Industry Map: curated static FOWT value-chain data under
  `web/data/industry/`.
- Projects: curated source-backed floating offshore wind project data under
  `web/data/projects/`.
- Digital & AI: 14 curated source-backed Signals under `web/data/digital-ai/`,
  used as evidence for the AI × offshore-wind impact maps.

The website supports:

- Homepage with a concise weekly briefing across Engineering and Research, plus
  a static week selector;
- current and archived Research Digest pages;
- Paper Detail pages;
- Research Archive with static client-side search;
- Engineering archive and briefing pages with static search and region filters;
- Engineering candidate transparency pages with deterministic
  `engineering_selection_score_v1`, source-registry diagnostics, selected
  state, score breakdowns and source links for supported weeks;
- Industry Map page explaining the FOWT value chain and curated companies;
- Projects index and detail pages for 48 source-backed floating offshore wind
  project records, with region/country/status filtering, technical facts,
  verified ecosystem roles, source-backed timelines and provenance links;
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

- Static Research Digest editions: 33 selected representative editions.
- Static Research candidate-pool files: 20 retained or reconstructed weekly
  candidate pools.
- Static Engineering Briefing editions: 33 selected representative editions.
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
- Projects filtering is limited to region, country and normalized lifecycle
  status. No geographic map, GIS data, automatic project collection/update or
  Project-to-Industry deep integration exists yet; those belong to a future
  dedicated milestone.

## Latest Accepted Validation Baseline

Latest local accepted baseline:

```text
python -m pytest pipeline/tests -> 210 passed
npm.cmd run validate:data -> passed
npm.cmd run test:data -> 77 passed
npm.cmd run lint -> passed
npm.cmd run build -> passed, 355 static pages
git diff --check -> passed
```

The current branch passed this baseline locally. Pushes and pull requests to
`main` trigger the corresponding GitHub CI checks.

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
