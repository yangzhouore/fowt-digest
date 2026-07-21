# Project Handover

Last updated: 2026-07-21

This document gives continuity context. It intentionally avoids duplicating the
full current-status checklist in `PROJECT_STATUS.md`.

## Project Purpose

FOWT Research Digest is a deterministic research digest for Floating Offshore
Wind Turbines. The pipeline produces auditable weekly digest data. The website
presents that data as a reading experience.

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

Website data flow:

```text
pipeline run output
-> copied weekly_digest.json snapshot
-> web/data/digest-adapter.ts
-> Homepage, Weekly Digest, Paper Detail, Archive
```

The website does not run the pipeline. The pipeline does not import website
code.

## Important Design Decisions

- The pipeline is the source of truth for paper data.
- The website is a presentation layer only.
- Each pipeline stage validates its input contract and never silently repairs it.
- Pipeline stages are small modules with explicit public functions.
- Runtime pipeline code uses the Python standard library unless a milestone
  explicitly changes that.
- Stage outputs are local JSON files written through `pipeline/run_storage.py`.
- Website integration currently uses one static copied digest snapshot.
- The website may format fields for display, but must not sort, re-rank, repair,
  summarize, reinterpret, or invent paper content.

## Current Implementation Boundaries

Do not add without an explicit milestone:

- backend, API routes, database, CMS, scheduler, or deployment automation;
- AI writing, AI review, generated summaries, scoring, or semantic search;
- new pipeline data products;
- additional JSON fixtures;
- direct website access to pipeline run directories.

## Current Limitations

- The website displays one static digest snapshot with 6 selected papers.
- About and Methodology may still contain prototype wording until separately
  scoped.
- There is no historical digest dataset beyond the one copied snapshot.
- The website does not execute the pipeline or refresh data automatically.
- No database, search, filters, or publication workflow exists.

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

Website data integration:

- `web/data/weekly_digest.json`
- `web/data/digest-adapter.ts`
- `web/app/page.tsx`
- `web/app/weekly/[slug]/page.tsx`
- `web/app/papers/[slug]/page.tsx`
- `web/app/archive/page.tsx`

## Resume Guidance

Start with `START_HERE.md`, then read `PROJECT_STATUS.md` for the exact current
task. Read this document only for architecture, boundaries, and continuity.
