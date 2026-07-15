# PROJECT STATUS

Last Updated: 2026-07-15

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

In Progress

Completed:

- M3A Pipeline Foundation
- M3B-1 OpenAlex Query Builder
- 13 contract search terms supported
- published-date filter construction
- cursor pagination parameter construction
- deterministic OpenAlex search parameter generation
- deterministic query URL generation
- query-builder tests

Latest validation result:

- 27 passed
- 0 failed

Not yet implemented:

- OpenAlex client
- HTTP requests
- response parsing
- raw response storage
- metadata normalisation
- deduplication

M3B-1 is complete. M3B-2 is next.

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

M3B-2 - OpenAlex Client.

Required work:

- implement the minimal OpenAlex client
- perform HTTP requests only in the M3B-2 slice
- preserve raw OpenAlex responses in contract-defined run files when storage is introduced for the client
- keep outputs local and independent from the website

Do not implement yet:

- metadata normalisation
- deduplication
- Crossref
- arXiv
- AI scoring
- AI writing
- AI reviewer
- database
- FastAPI
- MCP

OpenAlex query construction is implemented. The OpenAlex client, collector execution, response parsing, and storage are not implemented yet.

---

# Current Repository Snapshot

Implemented:

- web/
- docs/
- pipeline/__init__.py
- pipeline/ids.py
- pipeline/openalex_query.py
- pipeline/run_storage.py
- pipeline/tests/__init__.py
- pipeline/tests/test_ids.py
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

Completed pages:

- Homepage
- Weekly Edition
- Paper Detail
- Archive
- Methodology
- About

Current navigation:

Homepage

↓

Weekly Edition

↓

Paper Detail

Additional navigation:

- Archive
- Methodology
- About

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
- `pipeline/openalex_query.py`
- `pipeline/run_storage.py`
- `pipeline/tests/__init__.py`
- `pipeline/tests/test_ids.py`
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
- pytest coverage for identifier, storage, and query-builder behaviour

Completed pipeline slices:

- M3A Pipeline Foundation
- M3B-1 OpenAlex Query Builder

Latest validation result:

- 27 passed
- 0 failed

Not yet implemented beyond M3B-1:

- OpenAlex API client
- HTTP requests
- pagination execution
- timeout, retry, or rate-limit handling
- raw response storage
- run summary writing
- candidate record generation
- metadata normalisation
- deduplication output
- local JSON run output under `pipeline/data/runs/<runId>/`

---

## Git

Git is initialized.

The project is synchronized with GitHub.

Development should continue using feature branches.

---

# Known Limitations

Current known issues:

1. Archive metadata is prototype-only and fictional.

2. Methodology and About content are first-pass prototype content.

3. Homepage and Weekly page share duplicated Paper List markup.

Current decision:

DO NOT extract a reusable component yet.

Wait until there are at least 3–4 real reuse locations.

4. Global CSS is growing.

Acceptable for now.

Reorganise only when it becomes difficult to maintain.

5. Theme persistence is intentionally ignored.

Dark mode is NOT part of the MVP.

6. Pipeline design documents describe intended future stages, while the current
   implementation only covers Pipeline Foundation and M3B-1 query construction.
   The OpenAlex client and collector execution are not implemented.

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

- Python paper collection pipeline beyond Pipeline Foundation and M3B-1 query construction

- OpenAlex client and integration
- Crossref integration
- arXiv integration

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

Refine archive metadata and prototype page content only when needed.

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
- No HTTP requests, parsing, or storage implemented yet

Immediate next milestone:

M3B-2 - OpenAlex Client

Do not claim the OpenAlex client or full collector is implemented. Do not start Crossref, arXiv, metadata normalisation, deduplication, or AI workflow modules until their milestones are explicitly started.

---

## Phase 4

Implement AI workflow.

Collector

↓

Classifier

↓

Scorer

↓

Selector

↓

Writer

↓

Reviewer

↓

Human Approval

↓

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