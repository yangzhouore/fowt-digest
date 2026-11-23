# Project Status

## Current state

FOWT Research Digest provides source-backed floating and offshore wind
intelligence in English and Simplified Chinese. Company Intelligence, Global
Search, and Subscribe are implemented. Subscribe production delivery remains
unverified.

## Product capabilities

- **Engineering** provides weekly source-backed briefings, topic and region
  navigation, and candidate and scoring transparency where available.
- **Research** provides a searchable archive, weekly selections, paper details,
  and candidate provenance where a supporting pool is available.
- **Industry** maps 47 canonical companies to supply-chain roles and provides
  guides for the UK, Germany, Norway, and China.
- **Projects** provides structured project facts, participants, public evidence,
  and timelines. Project Intelligence distinguishes sourced facts from editorial
  inferences and records FID status, readiness, and watchpoints.
- **Company Intelligence** provides source-backed timelines built from one
  shared event catalogue. One real-world development has one canonical event.
  Events use canonical `companyIds[]` and `projectIds[]`, retain original
  citations, and preserve historical attribution separately from current company
  identity.
- **Digital & AI** connects practical wind-industry workflows with energy
  pathways, dated developments, conditional futures, and source-backed Signals.
- **Global Search** searches Companies, Projects, Company Intelligence Events,
  Engineering, Research, and Digital & AI at `/search`. It ranks entities before
  text, uses recorded relationships, and keeps original section search and
  filters available.
- **Subscribe** offers Weekly News Digest, Weekly Research Digest, and Company
  Brief. Readers confirm by email, select canonical companies, manage
  preferences without an account, and unsubscribe.

See the [README route table](README.md#routes) for entry points and the
[handover](PROJECT_HANDOVER.md) for the owning modules.

## Data and architecture boundaries

- The deterministic Python pipeline owns Research collection, normalisation,
  deduplication, classification, ranking, and digest assembly. The local
  publishing workflow prepares accepted output for review and commit.
- Engineering maintains its own source registry, records, and selection.
  Industry, Projects, and Digital & AI have separate curated datasets.
- Industry defines canonical company identities. Projects provides canonical
  project identities. Company Intelligence and connected context link those
  records through reviewed data. Their adapters resolve existing identities and
  source references.
- Site routes present committed intelligence. Global Search derives its index
  from those records and ranks results in the browser. It uses no embeddings,
  semantic or vector search, retrieval-augmented generation, or chatbot.
- Subscribe is the only subsystem with server-side persistence, email, and
  scheduling. Neon stores subscriber and delivery state. Resend sends email,
  and Vercel Cron invokes weekly delivery from committed intelligence. The job
  delivers the previous completed UTC week and skips missing current material.
  See the [runbook](docs/SUBSCRIBE_MVP.md) for exact timing and recovery.
- Presentation can localise interface and reviewed copy. Source facts and
  retained provenance stay unchanged.

## Current validation baseline

[AGENTS.md](AGENTS.md#validation-baseline) owns the shared commands. They cover
the Python pipeline, static data, website data tests, lint, the production
build, and diff whitespace.

[GitHub Actions](.github/workflows/ci.yml) runs separate pipeline, website, and
Chromium jobs for pull requests targeting `main` and pushes to it. Website tests
cover adapters, schema and provenance constraints, selection transparency,
search, and Subscribe. The browser suite uses a production build and a loopback
fixture for Subscribe, with in-memory PostgreSQL and intercepted email.
Builds and tests run without live delivery credentials.

- Full Chromium smoke from `web/` after a build is `npm.cmd run test:smoke`.
- Focused Subscribe checks from `web/` use `npm.cmd run test:subscribe`. These
  tests are also included in `test:data`.
- See the [browser setup guide](web/tests/browser/README.md) for installation
  and local Industry-guide checks.

For release evidence, check the CI run for the exact commit under review.
Subscribe production acceptance is a separate operational check.

## Current operational work

- **Subscribe delivery** still needs production Neon and migration setup,
  verified Resend sending with tracking disabled, Vercel environment and cron
  verification, and a controlled live-email acceptance test. Follow the
  [Subscribe runbook](docs/SUBSCRIBE_MVP.md) before treating delivery as live.
- **Weekly publication** is reviewed and triggered locally. The
  [publishing workflow](docs/WEBSITE_PUBLISHING_WORKFLOW.md) describes the
  collection gate for new Research editions. Refer to the latest committed
  editions and [weekly release records](docs/weekly/) for publication status
  and any edition-specific limitations.

## Known limitations

- The weekly Research and Engineering archives contain selected editions and
  coverage. Candidate transparency depends on retained evidence.
- Company and Project coverage depends on published sources, reviewed records,
  and the canonical registry. The [Company Intelligence audit](docs/COMPANY_INTELLIGENCE_FULL_HISTORY_AUDIT.md)
  records source limitations and project coverage gaps.
- Search can only use the text and relationships represented in committed
  data. Digital & AI retains its offshore-wind and energy evidence scope.
- Incomplete or capped Research collection is gated from ordinary publication.
  Historical editions retain their contemporaneous coverage notes.

## Reference map

| Topic | Reference |
| --- | --- |
| Product principles | [Product Vision](docs/PRODUCT_VISION.md) |
| Code, data, tests, and skills | [Project Handover](PROJECT_HANDOVER.md) |
| Research architecture and contracts | [Pipeline architecture](docs/PIPELINE_ARCHITECTURE.md), [data model](docs/PIPELINE_DATA_MODEL.md) |
| Research publication and selection | [Publishing workflow](docs/WEBSITE_PUBLISHING_WORKFLOW.md), [selection transparency](docs/SELECTION_TRANSPARENCY.md) |
| Engineering evidence and data | [Source policy](docs/ENGINEERING_SOURCE_POLICY.md), [briefing data model](docs/ENGINEERING_BRIEFING_DATA_MODEL.md) |
| Project relationships and public evidence | [Connected context](docs/CONNECTED_PROJECT_CONTEXT_IMPLEMENTATION.md), [public evidence](docs/PROJECTS_PUBLIC_EVIDENCE_IMPLEMENTATION.md) |
| Company Intelligence sources and coverage | [Full-history audit](docs/COMPANY_INTELLIGENCE_FULL_HISTORY_AUDIT.md) |
| Digital & AI | [Signals design](docs/M11_DIGITAL_AI_SIGNALS_DESIGN.md), [unified guide implementation](web/app/digital-ai/design/UNIFIED_GUIDE_IMPLEMENTATION.md) |
| Subscribe operations and recovery | [Subscribe runbook](docs/SUBSCRIBE_MVP.md) |
| Previous releases and designs | [Weekly records](docs/weekly/), [archive](docs/archive/) |
