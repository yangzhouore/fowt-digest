﻿# FOWT Research Digest

FOWT Research Digest is a deterministic research digest for Floating Offshore
Wind Turbines. It combines a local Python pipeline for producing auditable weekly
digest data with a static Next.js website for reading selected digest editions.

Live website: https://fowt-digest-oegd-cs33ynefc-dudu-yang.vercel.app

Repository: https://github.com/yangzhouore/fowt-digest

## What It Provides

- A deterministic pipeline from OpenAlex collection through weekly digest assembly.
- A static website that presents selected historical demonstration editions.
- Archive, Weekly Digest, and Paper Detail reading paths.
- Paper metadata, abstracts where available, source links, DOI links, topic tags,
  and deterministic selection context.
- Local guardrails that validate committed static digest JSON files and their
  explicit website adapter registration.

The website does not run the pipeline. It displays selected static digest JSON
files copied from deterministic pipeline output.

## How The Digest Works

The implemented pipeline flow is:

```text
OpenAlex
-> Collection
-> Metadata normalisation
-> Deduplication
-> FOWT relevance classification
-> Ranking and selection
-> Weekly digest assembly
-> Static website data
```

Website-ready digest files are committed under:

```text
web/data/digests/
```

The current archive contains 15 selected historical demonstration editions. They
are not complete weekly historical coverage.

## Technology Stack

- Python standard-library pipeline modules with pytest coverage.
- Next.js, React, and TypeScript for the static website.
- Dependency-free Node scripts for static digest data validation.
- Vercel for website deployment.

## Repository Structure

```text
fowt-digest/
  START_HERE.md                     # Resume entry point for new sessions
  AGENTS.md                         # Engineering and collaboration rules
  PROJECT_STATUS.md                 # Concise current status
  PROJECT_HANDOVER.md               # Architecture and continuity notes
  docs/                             # Product, roadmap, architecture, and contracts
  pipeline/                         # Deterministic Python pipeline and tests
  web/                              # Static Next.js website and digest data
```

## Local Development

Run the pipeline tests from the repository root:

```powershell
python -m pytest pipeline/tests
```

Run website commands from `web/`:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run validate:data
npm.cmd run test:data
npm.cmd run dev
```

`validate:data` checks the committed static digest JSON files and their explicit
registration in `web/data/digest-adapter.ts`. `test:data` runs focused invalid-fixture
tests for those guardrails. Neither command modifies data or uses the network.

## Deployment

The website is deployed on Vercel as a static Next.js application. Deployment
serves the committed website data; it does not collect papers, run OpenAlex
requests, regenerate digests, or publish automatically.

## Current Limitations

- The archive is a selected demonstration dataset, not complete weekly coverage.
- Static website data must be regenerated and committed manually when updated.
- The website has no backend, database, CMS, search, filters, scheduler, or API.
- The website does not provide AI-generated summaries, findings, limitations,
  scores, or editorial analysis.
- Paper content is displayed from deterministic pipeline output and is not
  rewritten or repaired by the website.

## Roadmap

Post-release work should begin with a Design Review before implementation. Likely
future areas include stronger data operations, publication workflow decisions, or
additional reader experience improvements, but no post-v1.1 feature is active.

## Project Status

`v1.1.0` is the first public website release candidate. It includes the completed
deterministic pipeline MVP, static multi-edition website, historical demonstration
dataset, site trust copy alignment, and static digest data guardrails.

The existing `v1.0.0` tag marks the earlier deterministic pipeline MVP release.