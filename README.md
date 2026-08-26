# FOWT Research Digest

FOWT Research Digest is a source-backed intelligence briefing for floating and
offshore wind. It combines a deterministic local Research pipeline with a
static Next.js website covering Engineering, Research, Industry, Projects, and
Digital & AI.

Live website: https://fowt-digest-oegd.vercel.app/

Repository: https://github.com/yangzhouore/fowt-digest

## What It Provides

- A deterministic OpenAlex research pipeline from collection through weekly
  digest assembly.
- Static Research Digest editions committed under `web/data/digests/`.
- Static source-backed Engineering Briefing editions committed under
  `web/data/briefings/`.
- Static source-backed Projects data committed under `web/data/projects/`.
- A curated Industry Map under `web/data/industry/`.
- Fourteen source-backed Digital & AI Signals under `web/data/digital-ai/`,
  presented as evidence for AI × offshore-wind lifecycle and energy pathways.
- Homepage, Engineering, Research, Industry Map, Projects, Digital & AI,
  Methodology, About, paper detail, and selection-transparency reading paths.
- A reader-facing Methodology that separates Research and Engineering methods,
  explains provenance and editorial control, and states known limitations.
- English and Simplified Chinese interface and fixed editorial copy, persisted
  locally without external translation services or locale-specific routes.
- Local validation guardrails for all committed static datasets.
- Deterministic publishing tooling that copies an accepted pipeline
  `weekly_digest.json` into the website data directory and refreshes adapter
  registration.
- GitHub CI for pull requests and pushes to `main`.

The website does not run the pipeline, collect sources, query OpenAlex, generate
content at runtime, or deploy itself. It displays committed static data.

## How The Research Digest Works

Implemented research flow:

```text
OpenAlex
-> Collection
-> Metadata normalisation
-> Deduplication
-> FOWT relevance classification
-> Ranking and selection
-> Weekly digest assembly
-> Website publishing tool
-> Static website data
```

Publish a completed pipeline run into the static website data structure from the
repository root:

```powershell
python -m pipeline.website_publisher pipeline\data\runs\<run_id>
```

Run the full local publication workflow from the repository root:

```powershell
python -m tools.publication_workflow pipeline\data\runs\<run_id>
```

The workflow publishes an existing `weekly_digest.json`, runs repository and
website validation, and prints a summary report. It does not run the pipeline,
commit, push, deploy, or choose whether a digest should be published.

## Technology Stack

- Python standard-library pipeline modules with pytest coverage.
- Next.js, React, and TypeScript for the static website.
- Dependency-free Node scripts for static data validation.
- GitHub Actions for validation.
- Vercel Git integration for production deployment.

## Repository Structure

```text
fowt-digest/
  AGENTS.md            # Codex rules and default reading order
  START_HERE.md        # Short resume entry point
  PROJECT_STATUS.md    # Current capabilities, boundaries, and validation
  PROJECT_HANDOVER.md  # Optional module/reference map
  docs/                # Durable references and docs/archive history
  pipeline/            # Deterministic Python pipeline and tests
  tools/               # Repository workflow helpers
  web/                 # Static Next.js website and committed data
```

## Local Development

Run pipeline tests from the repository root:

```powershell
python -m pytest pipeline/tests
```

Run website checks from `web/`:

```powershell
npm.cmd run validate:data
npm.cmd run test:data
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

Full accepted validation baseline:

```powershell
python -m pytest pipeline/tests
cd web
npm.cmd run validate:data
npm.cmd run test:data
npm.cmd run lint
npm.cmd run build
cd ..
git diff --check
```

## Deployment

Production is deployed by Vercel from committed `main` through Git integration.
The repository does not use Vercel CLI, deployment tokens, scheduled jobs, or a
second deployment system.

## Current Limitations

- Research and Engineering archives are selected representative static editions,
  not complete historical coverage.
- Projects are curated source-backed records, not a claim of complete global
  market coverage.
- Digital & AI is a narrow offshore-wind evidence area, not a generic AI news
  feed; emerging and experimental pathways require caution.
- Source-backed titles, abstracts, briefing summaries, company/project facts,
  publishers, proper nouns, and URLs remain in their original language unless
  an explicit translated field exists.
- New data publication is a manual accepted-change workflow.
- There is no backend, database, CMS, API, scheduler, semantic search, or
  automatic source collection.
- The site does not provide AI-generated summaries, findings, limitations,
  scores, or editorial analysis.
- Paper content is displayed from deterministic pipeline output and is not
  rewritten or repaired by the website.
