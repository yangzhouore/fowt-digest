# Project Handover

Use this optional module map after reading [AGENTS.md](AGENTS.md),
[START_HERE.md](START_HERE.md), and [PROJECT_STATUS.md](PROJECT_STATUS.md).
For product state and operational follow-up, use Project Status.

## Repository layout

| Area | Location |
| --- | --- |
| Deterministic Research pipeline | [pipeline/](pipeline/) |
| App Router pages and route handlers | [web/app/](web/app/) |
| Committed intelligence and adapters | [web/data/](web/data/) |
| Subscribe server modules and SQL | [web/subscribe/](web/subscribe/) |
| Local workflow tooling | [tools/](tools/) |
| Durable references and audits | [docs/](docs/) |

## Routes and owning modules

| Area | Route groups | Main code and records |
| --- | --- | --- |
| Home and presentation | `/`, `/about`, `/methodology` | [Homepage](web/app/page.tsx), [header](web/app/site-header.tsx), [language and copies](web/app/i18n/), [global styles](web/app/globals.css) |
| Engineering | `/engineering`, `/engineering/[slug]`, `/engineering/[slug]/candidates` | [Pages and filters](web/app/engineering/), [briefing adapter](web/data/engineering-briefing-adapter.ts), [editions](web/data/briefings/), [source registry](web/data/engineering-source-registry.json) |
| Research | `/archive`, `/weekly/[slug]`, `/weekly/[slug]/candidates`, `/papers/[slug]` | [Archive](web/app/archive/), [digest adapter](web/data/digest-adapter.ts), [editions](web/data/digests/), [candidate adapter](web/data/research-candidate-adapter.ts), [candidate pools](web/data/research-candidates/) |
| Industry | `/industry`, `/industry/uk`, `/industry/[country]` | [Pages](web/app/industry/), [canonical Industry map](web/data/industry/industry-map.ts), [country guide registry](web/data/industry/country-guides.ts) |
| Projects | `/projects`, `/projects/[slug]` | [Pages](web/app/projects/), [project data](web/data/projects/), [project adapter](web/data/project-adapter.ts), [public evidence adapter](web/data/project-public-evidence-adapter.ts) |
| Company Intelligence | `/companies`, `/companies/[company-id]` | [Pages and filters](web/app/companies/), [event catalogue](web/data/context/company-events.json), [company adapter](web/data/company-intelligence-adapter.ts), [category labels](web/data/company-news-categories.ts) |
| Digital & AI | `/digital-ai`, `/digital-ai/signals/[slug]` | [Pages and guide components](web/app/digital-ai/), [committed context and Signals](web/data/digital-ai/), [Digital & AI adapter](web/data/digital-ai-adapter.ts) |
| Global Search | `/search` | [Page and results](web/app/search/), [index construction](web/data/global-search-adapter.ts), [query and ranking](web/data/global-search.ts) |
| Subscribe | `/subscribe`, `/subscribe/confirm`, `/subscribe/manage` | [Pages and forms](web/app/subscribe/), [Subscribe API](web/app/api/subscribe/route.ts), [weekly API](web/app/api/subscribe/weekly/route.ts) |

The [connected-context adapter](web/data/connected-context-adapter.ts) and
[context navigation helpers](web/data/context-navigation.ts) join committed
project, company, and Engineering records. [Project–Engineering
links](web/data/context/project-engineering-links.json) are maintained as
reviewed references.

Global Search builds browser search documents from existing adapters.
Company Intelligence, Search, and Subscribe use the canonical Industry company
IDs. Company events can link projects and preserve historical names independently
of current identity.

## Research and publication

- [OpenAlex query construction](pipeline/openalex_query.py),
  [client](pipeline/openalex_client.py), and [collector](pipeline/openalex_collector.py)
  handle source retrieval.
- [Orchestration](pipeline/orchestrator.py) and [run storage](pipeline/run_storage.py)
  coordinate local runs and diagnostics.
- [Normalisation](pipeline/normaliser.py), [deduplication](pipeline/deduplicator.py),
  [classification](pipeline/relevance_classifier.py), [ranking](pipeline/ranker.py),
  and [digest assembly](pipeline/weekly_digest.py) prepare Research output.
- [Website publisher](pipeline/website_publisher.py) and the
  [publication workflow](tools/publication_workflow.py) transfer and validate
  accepted output locally.

## Subscribe server modules

- Input and canonical company registry access live in [preferences](web/subscribe/preferences.ts).
  Subscription actions are in [service](web/subscribe/service.ts).
- [Runtime configuration](web/subscribe/runtime.ts), [SQL access](web/subscribe/store.ts),
  [tokens](web/subscribe/tokens.ts), and the [migration](web/subscribe/migrations/001_subscribe.sql)
  define the server and database boundary.
- [Weekly selection](web/subscribe/digests.ts), [delivery](web/subscribe/delivery.ts),
  [templates](web/subscribe/templates.ts), and [Resend client](web/subscribe/mail.ts)
  implement the delivery path. [Vercel configuration](web/vercel.json) owns the schedule.
- See the [runbook](docs/SUBSCRIBE_MVP.md) for environment, setup, and recovery.

## Validation and test locations

- Python regression tests live in [pipeline/tests/](pipeline/tests/).
- [Website validators and Node tests](web/scripts/) are registered in
  [web/package.json](web/package.json). The focused suites include
  [Company Intelligence](web/scripts/company-intelligence.test.js),
  [Global Search](web/scripts/global-search.test.js), and
  [Subscribe](web/scripts/subscribe.test.js).
- [Shared Chromium tests](web/tests/browser/) use
  [Playwright configuration](web/playwright.config.ts). The
  [Subscribe test fixture](web/tests/browser/fixtures/subscribe-services.cjs)
  provides isolated persistence and mail interception.
- Country-guide tests live under [web/data/industry/](web/data/industry/).
  Their separate local browser configuration is in
  [web/app/industry/](web/app/industry/).
- Hosted validation is defined in [the GitHub Actions workflow](.github/workflows/ci.yml).

## Repository skills

| Task | Skill |
| --- | --- |
| Weekly Research collection and selection | [fowt-paper](skills/fowt-paper/SKILL.md) |
| Weekly Engineering source discovery and review | [fowt-news](skills/fowt-news/SKILL.md) |
| Project records and evidence review | [fowt-project-intelligence](skills/fowt-project-intelligence/SKILL.md) |
| Company Intelligence research and event maintenance | [company-intelligence](skills/company-intelligence/SKILL.md) |
