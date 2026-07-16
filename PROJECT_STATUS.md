# PROJECT STATUS

Last Updated: 2026-07-16

---

# Project

FOWT Research Digest

A weekly editorial website that curates academic and conference research related
to Floating Offshore Wind Turbines (FOWT).

The long-term goal is to automatically collect, evaluate, summarise and review
new FOWT publications using AI-assisted workflows.

The website itself should remain a simple editorial publication.
The AI system should remain completely separated from the frontend.

---

# Current Milestone

Milestone:

M3B - OpenAlex Collector

Status:

Complete

Completed:

- M3A Pipeline Foundation
- M3B-1 OpenAlex Query Builder
- M3B-2 OpenAlex Client
- M3B-3 Collector Orchestration
- M3B-4 OpenAlex Cursor Pagination
- 13 contract search terms supported
- published-date filter construction
- deterministic OpenAlex search parameter generation
- deterministic query URL generation
- HTTP GET execution through urllib
- HTTP timeout, retry, Retry-After, status validation, and JSON decoding
- collector writes raw_openalex.json and run_summary.json
- full success, partial success, and total failure supported
- initial cursor: `*`
- page size: 50
- next cursor source: `meta.next_cursor`
- run-wide raw record cap: 200
- successful raw pages preserved
- later-page failure preserves earlier pages
- later terms continue after page failure unless cap is reached
- fixed 1-second spacing between normal OpenAlex requests

Latest validation result:

- 57 passed
- 0 failed

Current website status:

- W1 Website Structure Review complete
- W2 Navigation, Layout, and Responsive Consistency complete
- W3 Content Readiness complete
- W4 Deployment Readiness complete
- coherent static MVP skeleton
- Homepage -> Weekly Edition -> Paper Detail reading flow
- Archive, Methodology, and About pages accessible
- production build passes
- ready for first public prototype deployment
- fictional local mock data only
- no pipeline integration, backend, database, API, CMS, analytics, or AI workflow

Deployment status:

- deployment readiness complete
- website has not yet been deployed

Not yet implemented:

- metadata normalisation
- deduplication
- AI workflow
- database
- frontend integration
- production deployment

M3B-1, M3B-2, M3B-3, and M3B-4 are complete. The full OpenAlex Collector milestone has passed final acceptance.

---
# Current Git Status

Default Branch:

master

Current Development Branch:

feature/openalex-collector

Expected current branch:

feature/openalex-collector

---

# Immediate Next Task

Current objective:

Merge completed M3B OpenAlex Collector work, then start Metadata Normalisation.

Required work after merge:

- implement Metadata Normalisation as the next pipeline milestone
- convert raw OpenAlex records into the contract-defined internal metadata shape
- keep deduplication, AI workflow, database, and frontend integration out of scope until their milestones begin

Frontend deployment task:

- deploy the completed Web MVP to Vercel when deployment work resumes
- record the deployment URL in project documentation after deployment

Do not implement yet:

- search
- authentication
- database
- API routes
- pipeline integration
- AI workflow
- CMS
- analytics
- newsletter

OpenAlex query construction, the HTTP client, collector orchestration, raw response storage, cursor pagination, run-wide cap handling, partial/total failure handling, and fixed request spacing are implemented. Metadata normalisation, deduplication, and AI workflow modules do not exist yet.

---
# Current Repository Snapshot

Implemented:

- web/
- docs/
- pipeline/__init__.py
- pipeline/ids.py
- pipeline/openalex_client.py
- pipeline/openalex_collector.py
- pipeline/openalex_query.py
- pipeline/run_storage.py
- pipeline/tests/__init__.py
- pipeline/tests/test_ids.py
- pipeline/tests/test_openalex_client.py
- pipeline/tests/test_openalex_collector.py
- pipeline/tests/test_openalex_query.py
- pipeline/tests/test_run_storage.py

Not yet implemented:

- pipeline/openalex.py
- pipeline/normaliser.py
- pipeline/deduplicator.py
- AI workflow modules

---
# Project Philosophy

This project follows four core engineering principles.

## 1. Think Before Coding

Always:

- restate the goal
- state assumptions
- explain tradeoffs
- define success criteria
- ask questions if requirements are unclear

Never silently make architecture decisions.

---

## 2. Simplicity First

Only implement what is required today.

Avoid:

- speculative abstractions
- generic service layers
- unnecessary configuration
- over-engineering
- premature optimisation

The simplest solution that solves today's problem is preferred.

---

## 3. Surgical Changes

Only modify files related to the requested task.

Do not:

- refactor unrelated code
- reformat unrelated files
- redesign unrelated pages

Every changed line should be traceable to the task.

---

## 4. Goal Driven Development

Every implementation should have:

- clear goal
- verification
- build
- lint
- git diff review

Never consider work finished without verification.

---

# Current Architecture

Current repository:

```
docs/
pipeline/
web/
```

The repository currently contains:

- a static Next.js frontend in `web/`;
- local mock website data in `web/data/`;
- product, design, architecture, and pipeline planning docs in `docs/`;
- an initial Python pipeline package in `pipeline/`.

There is currently NO:

- backend
- database
- API
- FastAPI
- MCP
- AI Agent
- authentication
- admin dashboard
- Docker

The Python pipeline must remain independent from the website.

Current architecture:

```
web/
pipeline/
docs/
```

The website consumes structured data.

The pipeline is intended to produce structured data, but currently only contains
foundation identifier helpers and tests.

They should remain loosely coupled.

---

# Current Design Direction

The website is NOT a SaaS landing page.

It is NOT an AI product landing page.

It should feel like:

- editorial
- academic
- typography-first
- reading-focused

Inspired by:

https://ai-digest.liziran.com/en/

Do NOT copy branding or layout.

Design principles:

- typography first
- whitespace
- thin borders
- numbered content
- restrained colours
- linear reading flow

Avoid:

- rounded cards
- gradients
- glassmorphism
- decorative shadows
- dashboard layouts
- oversized hero sections
- excessive animations

Hierarchy should come from typography instead of containers.

---

# Current Progress

Completed:

## Project Foundation

- AGENTS.md
- README
- Product documentation
- Architecture documentation
- Design documentation

---

## Website

MVP pages included:

- Homepage
- Weekly Edition
- Paper Detail
- Archive
- Methodology
- About

Current reading flow:

Homepage -> Weekly Edition -> Paper Detail

Additional navigation:

- Archive
- Methodology
- About

Current website milestone:

W4 - Deployment Readiness complete

---

## Mock Data

The website currently uses only local mock data.

No real papers are collected.

No database exists.

No API exists.

---

## Pipeline

Current implementation:

- `pipeline/__init__.py`
- `pipeline/ids.py`
- `pipeline/openalex_client.py`
- `pipeline/openalex_collector.py`
- `pipeline/openalex_query.py`
- `pipeline/run_storage.py`
- `pipeline/tests/__init__.py`
- `pipeline/tests/test_ids.py`
- `pipeline/tests/test_openalex_client.py`
- `pipeline/tests/test_openalex_collector.py`
- `pipeline/tests/test_openalex_query.py`
- `pipeline/tests/test_run_storage.py`

Implemented:

- UTC run ID generation using the collector contract format
- deterministic OpenAlex candidate ID helper
- deterministic paper ID helper
- DOI normalisation
- title normalisation
- run directory creation
- six contract JSON filenames supported
- UTF-8 deterministic JSON writing
- atomic file replacement
- 13 OpenAlex contract search terms supported
- published-date filter construction
- cursor pagination parameter construction
- deterministic OpenAlex search parameter generation
- deterministic query URL generation
- HTTP GET execution through the OpenAlex client
- timeout, retry, HTTP status, and JSON decoding behaviour
- collector orchestration for one raw collection run
- raw_openalex.json writing
- run_summary.json writing
- cursor pagination execution
- run-wide 200-record cap handling
- fixed 1-second spacing between normal OpenAlex requests
- full success, partial success, and total failure handling
- pytest coverage for identifier, storage, query-builder, client, and collector behaviour

Completed pipeline slices:

- M3A Pipeline Foundation
- M3B-1 OpenAlex Query Builder
- M3B-2 OpenAlex Client
- M3B-3 Collector Orchestration
- M3B-4 OpenAlex Cursor Pagination

Latest validation result:

- 57 passed
- 0 failed

Not yet implemented beyond M3B:

- candidate record generation
- metadata normalisation
- deduplication output
- AI workflow modules
- database
- frontend integration

---
## Git

Git is initialized.

The project is synchronized with GitHub.

Development should continue using feature branches.

---

# Known Limitations

Current known issues:

1. Archive metadata is prototype-only and fictional.

2. Website content is MVP-ready but still describes fictional mock data.

3. Homepage and Weekly page share duplicated Paper List markup.

Current decision:

DO NOT extract a reusable component yet.

Wait until there are at least 3-4 real reuse locations.

4. Global CSS is growing.

Acceptable for now.

Reorganise only when it becomes difficult to maintain.

5. Theme persistence is intentionally ignored.

Dark mode is NOT part of the MVP.

6. Pipeline design documents describe intended future stages, while the current
   implementation covers Pipeline Foundation and the accepted OpenAlex Collector.
   Metadata normalisation, deduplication, and AI workflow modules are not implemented.

---

# Current Technical Debt

Acceptable technical debt:

- duplicated paper list
- single mock data file
- large globals.css

Unacceptable technical debt:

- duplicated business logic
- speculative abstractions
- unnecessary dependencies
- backend inside web/
- service layers without real need

---

# What Has NOT Been Implemented

Still missing:

- Metadata Normalisation
- Crossref integration
- arXiv integration

- Metadata normalisation
- Deduplication

- Paper Scorer
- Paper Selector
- Technical Writer
- Reviewer

- Human approval workflow

- Automatic publication

- Database

---
# Development Roadmap

## Phase 1 (Current)

Static website

Done:

- Homepage
- Weekly page
- Paper page
- Archive
- Methodology
- About

Next frontend work:

Deploy to Vercel.

---

## Phase 2

Freeze data model.

Define:

Paper

Weekly Edition

Editorial Summary

Score

Category

---

## Phase 3

Build Python pipeline.

Completed milestone:

M3A - Pipeline Foundation

Current status:

- Pipeline package skeleton complete
- Deterministic ID helpers complete
- DOI and title normalisation complete
- Run storage complete
- ID helper tests complete
- Storage tests complete
- Latest validation: 17 passed, 0 failed

Completed milestone:

M3B-1 - OpenAlex Query Builder

Current status:

- 13 contract search terms supported
- Published-date filter implemented
- Cursor pagination parameters implemented
- Deterministic params and URL generation implemented
- Latest validation: 27 passed, 0 failed
- No HTTP requests, parsing, or storage were implemented in this slice

Completed milestone:

M3B-2 - OpenAlex Client

Current status:

- HTTP GET execution implemented
- request timeout implemented
- contract retry behaviour implemented
- HTTP status validation implemented
- JSON decoding implemented
- mocked client tests complete

Completed milestone:

M3B - OpenAlex Collector

Current status:

- M3B-1 Query Builder complete
- M3B-2 OpenAlex Client complete
- M3B-3 Collector Orchestration complete
- M3B-4 Cursor Pagination complete
- 13 contract search terms supported
- deterministic query generation implemented
- HTTP timeout, retry, Retry-After, status validation, and JSON decoding implemented
- cursor pagination implemented
- page size is 50
- run-wide 200-record cap implemented
- raw_openalex.json is written
- run_summary.json is written
- partial and total failure handling implemented
- fixed 1-second spacing between normal OpenAlex requests implemented
- latest validation: 57 passed, 0 failed
- no metadata normalisation, deduplication, AI workflow, database, or frontend integration exists yet

Immediate next milestone after merge:

Metadata Normalisation

Do not claim metadata normalisation, deduplication, Crossref, arXiv, or AI workflow modules are implemented. Do not start them until their milestones are explicitly started.

---
## Phase 4

Implement AI workflow.

Collector

->

Classifier

->

Scorer

->

Selector

->

Writer

->

Reviewer

->

Human Approval

->

Publish

Python should orchestrate the workflow.

The website should NOT orchestrate AI agents.

---

# Important Decisions

These decisions should NOT be changed unless explicitly requested.

1.

Frontend and AI pipeline remain separated.

2.

Do not introduce FastAPI before it is actually needed.

3.

Do not introduce a database before local structured data becomes insufficient.

4.

Do not add a UI component library.

5.

Do not redesign the editorial visual language.

6.

Avoid premature abstraction.

7.

Prefer explicit code over generic frameworks.

---

# Before Starting Any New Task

Always ask:

1.

Does this directly support the current roadmap?

2.

Is this the simplest implementation?

3.

Can this be implemented without introducing new abstractions?

4.

Can this be verified?

5.

Does this violate AGENTS.md?

If uncertain,

STOP

and ask before implementing.

---

# Success Metric

The project is successful if:

The website remains simple.

The AI pipeline remains independent.

The codebase stays understandable after many iterations.

Future contributors should be able to understand the project within 15 minutes.