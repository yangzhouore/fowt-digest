# FOWT Research Digest

FOWT Research Digest is a source-backed intelligence briefing for floating and
offshore wind. The site helps readers follow Engineering and Research,
understand the Industry and its Projects, and find or subscribe to the
intelligence they need.

[Live site](https://fowt-digest-oegd.vercel.app/) ·
[Repository](https://github.com/yangzhouore/fowt-digest)

## What the site provides

- **Engineering and Research** pair source-backed industry briefings with
  selected research papers. Candidate pools and selection details are available
  where supporting records are retained.
- **Industry and Projects** explain the supply chain, country context,
  participants, status, and project evidence.
- **Company Intelligence** provides source-backed timelines. A shared catalogue
  records each development once and uses canonical company and project IDs
  to link related records.
- **Digital & AI** connects practical wind-industry workflows and energy
  pathways with supporting evidence.
- **Global Search** finds companies, projects, company events, Engineering,
  Research, and Digital & AI. It derives its index from committed records and
  uses deterministic, entity-first ranking.
- **Subscribe** offers Weekly News Digest, Weekly Research Digest, and Company
  Brief. Readers confirm by email and can manage preferences or unsubscribe
  without an account.

The interface supports English and Simplified Chinese. Original source text and
provenance are preserved. Coverage reflects selected and reviewed material.

## Routes

| Area | Routes |
| --- | --- |
| Weekly overview | `/` |
| Engineering | `/engineering`, `/engineering/[slug]`, `/engineering/[slug]/candidates` |
| Research | `/archive`, `/weekly/[slug]`, `/weekly/[slug]/candidates`, `/papers/[slug]` |
| Industry | `/industry` and its UK, Germany, Norway, and China guides |
| Projects | `/projects`, `/projects/[slug]` |
| Company Intelligence | `/companies`, `/companies/[company-id]` |
| Digital & AI | `/digital-ai`, `/digital-ai/signals/[slug]` |
| Global Search | `/search` |
| Subscribe | `/subscribe`, `/subscribe/confirm`, `/subscribe/manage` |
| About the briefing | `/methodology`, `/about` |

## How the repository works

The deterministic Python Research pipeline runs locally. It uses OpenAlex
and prepares weekly selections through normalisation, deduplication,
classification, and ranking. The Next.js site renders accepted committed output
alongside independently curated intelligence. Global Search runs in the browser.

Subscribe is the sole server-side persistence, email, and scheduling subsystem.
It uses Neon, Resend, and Vercel Cron. Delivery reads committed intelligence and
does not collect or generate content. Production deployment uses Vercel Git
integration. Live Subscribe delivery remains unverified. See the
[Subscribe runbook](docs/SUBSCRIBE_MVP.md) for setup and acceptance.

For weekly Research publication, pass a completed run to the local workflow
from the repository root.

```powershell
python -m tools.publication_workflow pipeline\data\runs\<run_id>
```

The workflow publishes the accepted digest data locally and runs validation.
See the [publishing workflow](docs/WEBSITE_PUBLISHING_WORKFLOW.md) for the
collection gate, direct publisher command, and adapter registration.

## Local development

CI uses Python 3.14 and Node 24.

- Install pipeline test dependencies with `python -m pip install pytest`.
- From `web/`, run `npm.cmd ci`, then `npm.cmd run dev`. Open `http://localhost:3000`.
- For the full validation baseline, follow [AGENTS.md](AGENTS.md#validation-baseline).
  [Project Status](PROJECT_STATUS.md#current-validation-baseline) describes the
  test suites, including Chromium and the Subscribe fixture.

## Repository map

- [pipeline/](pipeline/) contains the Python pipeline and its tests.
- [web/](web/) contains the site, data, adapters, Subscribe subsystem, and web tests.
- [tools/](tools/) contains local workflow helpers.
- [docs/](docs/) contains durable references, weekly records, and audits.
- [skills/](skills/) contains repository workflows, linked by task in the
  [module map](PROJECT_HANDOVER.md#repository-skills).

Start a new session with [START_HERE.md](START_HERE.md). Use
[PROJECT_STATUS.md](PROJECT_STATUS.md) for current state and
[PROJECT_HANDOVER.md](PROJECT_HANDOVER.md) to find the owning modules.
