# FOWT Research Digest

FOWT Research Digest is a deterministic research and engineering briefing site
for Floating Offshore Wind Turbines. It combines a local Python pipeline for
producing auditable Research Digest data with a static Next.js website for
reading selected Research Digest and Engineering Briefing editions.

Live website: https://fowt-digest-oegd.vercel.app/

Repository: https://github.com/yangzhouore/fowt-digest

## What It Provides

- A deterministic OpenAlex research pipeline from collection through weekly
  digest assembly.
- Static Research Digest editions committed under `web/data/digests/`.
- Static source-backed Engineering Briefing editions committed under
  `web/data/briefings/`.
- Homepage, Research Digest, Paper Detail, Research Archive, Archive Search,
  Engineering archive, Engineering search, and Engineering Briefing reading
  paths.
- Local validation guardrails for committed static digest and briefing JSON.
- Deterministic publishing tooling that copies an accepted pipeline
  `weekly_digest.json` into the website data directory and refreshes adapter
  registration.
- GitHub CI for pull requests and pushes to `main`.

The website does not run the pipeline, collect sources, query OpenAlex, generate
summaries, or deploy itself. It displays committed static JSON data.

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
- New data publication is a manual accepted-change workflow.
- There is no backend, database, CMS, API, scheduler, semantic search, or
  automatic source collection.
- The site does not provide AI-generated summaries, findings, limitations,
  scores, or editorial analysis.
- Paper content is displayed from deterministic pipeline output and is not
  rewritten or repaired by the website.
