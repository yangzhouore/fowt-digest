# Start Here

FOWT Research Digest is a source-backed intelligence briefing for floating and
offshore wind. It combines a local, deterministic Research pipeline with a
Next.js website built around committed intelligence. The interface supports
English and Simplified Chinese.

## What is implemented

| Area | Where to start | What readers can do |
| --- | --- | --- |
| Engineering | `/engineering` | Read weekly briefings and inspect the evidence and selection behind them. |
| Research | `/archive` | Browse weekly digests, paper details and available candidate pools. |
| Industry | `/industry` | Explore the value chain, company roles and country guides. |
| Projects | `/projects` | Find documented projects and inspect their status, participants and evidence. |
| Company Intelligence | `/companies` | Follow source-backed company timelines and their recorded project relationships. |
| Digital & AI | `/digital-ai` | Explore practical workflows, energy pathways and supporting Signals. |
| Global Search | `/search` | Find companies, projects and source-backed content using deterministic entity-first search. |
| Subscribe | `/subscribe` | Choose a weekly digest or Company Brief, confirm by email, and manage or cancel without an account. |

The homepage brings Engineering and Research into a shared weekly view. See
[Project Status](PROJECT_STATUS.md) for current capabilities and limitations.

## What to read

Use the normal reading order.

1. [AGENTS.md](AGENTS.md) for repository rules.
2. This page for orientation.
3. [PROJECT_STATUS.md](PROJECT_STATUS.md) for current state and validation.
4. The current milestone document, if one exists.

Open [PROJECT_HANDOVER.md](PROJECT_HANDOVER.md) when you need a module, test,
or skill path. For reader and developer onboarding, use the
[README](README.md). Open historical milestone, weekly, audit, or archive
material when the task needs that evidence.

## Where the code and data live

| Need | Location |
| --- | --- |
| Python Research pipeline and tests | [pipeline/](pipeline/) |
| Local workflow helpers | [tools/](tools/) |
| Next.js routes and interface | [web/app/](web/app/) |
| Committed editions, projects, events, and adapters | [web/data/](web/data/) |
| Subscribe delivery, tokens, and migration | [web/subscribe/](web/subscribe/) |
| Test commands and CI | [web/package.json](web/package.json), [CI workflow](.github/workflows/ci.yml) |
| Detailed references and repository skills | [docs/](docs/), [skills/](skills/) |

For weekly production, use the [publishing workflow](docs/WEBSITE_PUBLISHING_WORKFLOW.md)
and the task-specific skills listed in the [module map](PROJECT_HANDOVER.md#repository-skills).

For company and project work, start with the canonical registries and the
adapters listed in the module map. Use the
[Company Intelligence audit](docs/COMPANY_INTELLIGENCE_FULL_HISTORY_AUDIT.md)
when source coverage or a historical attribution affects the task.
For presentation or delivery work, check the owning route and its tests first.

## Boundaries

- Research collection, scoring, selection, and digest assembly run locally.
  Accepted output is committed before it appears on the site.
- Engineering, Industry, Projects, Company Intelligence, and Digital & AI
  consume curated committed records. Preserve original source facts and
  explicitly recorded relationships.
- Global Search derives its index from committed data and ranks entity matches
  before text matches. Existing section-specific searches remain available.
- Subscribe alone uses server-side persistence, email, and scheduling.
  Intelligence remains committed and static.
- Language switching is a presentation concern. Source-backed text stays in its
  original language unless an explicit translation exists.

## Operational follow-up

Live Subscribe delivery is unverified. Production requires Neon, the migration,
a verified Resend sender, Vercel configuration and cron, and a controlled
live-email acceptance test. Follow the [Subscribe runbook](docs/SUBSCRIBE_MVP.md).

Weekly publication stays a local, reviewed workflow. Use the committed archives
to check which editions are available. The [weekly records](docs/weekly/) capture
edition-specific collection issues and coverage notes.
