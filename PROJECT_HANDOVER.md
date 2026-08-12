# Project Handover

Last updated: 2026-08-12

This document gives continuity context. It intentionally avoids duplicating the
full current-status checklist in `PROJECT_STATUS.md`.

## Project Purpose

FOWT Research Digest presents two independent static content tracks for Floating Offshore
Wind Turbines: a deterministic Research Digest from OpenAlex pipeline output
and a source-backed Engineering Briefing archive. The website presents both as a reading experience.

## Architecture

Repository layout:

```text
docs/      product direction, roadmap, architecture, and data contracts
pipeline/  deterministic Python pipeline and tests
web/       static Next.js website
```

Implemented pipeline flow:

```text
Collection
-> Metadata normalisation
-> Deduplication
-> FOWT relevance classification
-> Ranking and selection
-> Weekly digest assembly
-> Pipeline orchestration
```

Research website data flow:

```text
pipeline run output (`weekly_digest.json`)
-> `tools.publication_workflow` local workflow command
-> `pipeline.website_publisher` local publishing command
-> selected static digest JSON files under web/data/digests/
-> web/data/digest-adapter.ts
-> Homepage, Weekly Digest, Paper Detail, Research Archive, Archive Search
```


Engineering website data flow:

```text
manual source-backed briefing JSON
-> selected static briefing JSON files under web/data/briefings/
-> web/data/engineering-briefing-adapter.ts
-> Homepage, Engineering Briefing pages, Engineering Archive
```
The website does not run the pipeline. The pipeline does not import website
code. The publishing workflow is explicit local tooling that moves accepted
pipeline output into the website static data structure, runs validation, and
prints a summary report.

GitHub Actions now runs the accepted validation baseline for pull requests to
main, pushes to main, and manual runs. Vercel remains the production CD
mechanism through its Git integration after a manual merge to main.

## Important Design Decisions

- The pipeline is the source of truth for paper data.
- The website is a presentation layer only.
- Each pipeline stage validates its input contract and never silently repairs it.
- Pipeline stages are small modules with explicit public functions.
- Runtime pipeline code uses the Python standard library unless a milestone
  explicitly changes that.
- Stage outputs are local JSON files written through `pipeline/run_storage.py`.
- Website integration uses explicitly imported static digest JSON files.
- Website publishing copies `weekly_digest.json` without transformation and
  refreshes adapter registration deterministically.
- Repository workflow automation coordinates the existing publisher and validation
  commands without running the pipeline, committing, pushing, deploying, or
  scheduling work.
- GitHub CI validates repository changes but does not publish data, deploy the
  website, or mutate the repository.
- The website may format fields for display, but must not sort, re-rank, repair,
  summarize, reinterpret, or invent paper content.
- Archive Search is deterministic, client-side only, and searches committed
  static Research Digest data without querying OpenAlex or any backend.
- Engineering Briefing is independent from the Research Pipeline and uses
  separate static source-backed JSON files.
- M7 Engineering Briefing is complete, accepted, and merged.
- M8 Homepage Content Value Refinement is complete, accepted, and merged.

## Current Implementation Boundaries

Do not add without an explicit milestone:

- backend, API routes, database, CMS, scheduler, or deployment automation;
- AI writing, AI review, generated summaries, scoring, or semantic search;
- new pipeline data products;
- direct website access to pipeline run directories.

## Current Limitations

- The website displays 18 selected static research digest editions and 20
  selected static engineering briefing editions, not complete weekly
  historical coverage.
- Research Digest data is static and committed under `web/data/digests/`.
- Engineering Briefing data is static and committed under `web/data/briefings/`.
- Current Engineering Homepage items may include controlled region labels for reader scanning.
- The website does not execute the pipeline or refresh data automatically.
- No database, filters, scheduler, deployment automation, or automatic
  publication exists.
- No AI-written summaries, findings, limitations, scores, or editorial analysis
  exist in the website.

## Module Snapshot

Pipeline modules:

- `pipeline/ids.py`
- `pipeline/run_storage.py`
- `pipeline/openalex_query.py`
- `pipeline/openalex_client.py`
- `pipeline/openalex_collector.py`
- `pipeline/normaliser.py`
- `pipeline/deduplicator.py`
- `pipeline/relevance_classifier.py`
- `pipeline/ranker.py`
- `pipeline/weekly_digest.py`
- `pipeline/orchestrator.py`
- `pipeline/website_publisher.py`
- `tools/publication_workflow.py`

Website data integration:

- `web/data/digests/*.json`
- `web/data/digest-adapter.ts`
- `.github/workflows/ci.yml`
- `docs/M6_CICD_FOUNDATION.md`
- `docs/WEBSITE_PUBLISHING_WORKFLOW.md`
- `web/app/page.tsx`
- `web/app/weekly/[slug]/page.tsx`
- `web/app/papers/[slug]/page.tsx`
- `web/app/archive/page.tsx`
- `web/app/archive/archive-search.tsx`
- `web/data/briefings/*.json`
- `web/data/engineering-briefing-adapter.ts`
- `web/app/engineering/page.tsx`
- `web/app/engineering/[slug]/page.tsx`

## Resume Guidance

Start with `START_HERE.md`, then read `PROJECT_STATUS.md` for the exact current
task. Read this document only for architecture, boundaries, and continuity.
