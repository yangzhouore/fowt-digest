# PROJECT STATUS

Last Updated: 2026-07-10

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
web/
```

The website currently contains only a frontend.

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

The future Python pipeline must remain independent from the website.

Recommended future architecture:

```
web/
pipeline/
docs/
```

The website consumes structured data.

The pipeline produces structured data.

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

Current navigation:

Homepage

↓

Weekly Edition

↓

Paper Detail

---

## Mock Data

The website currently uses only local mock data.

No real papers are collected.

No database exists.

No API exists.

---

## Git

Git is initialized.

The project is synchronized with GitHub.

Development should continue using feature branches.

---

# Known Limitations

Current known issues:

1. README needs updating because project scope has changed.

2. Archive metadata is incomplete.

3. Homepage and Weekly page share duplicated Paper List markup.

Current decision:

DO NOT extract a reusable component yet.

Wait until there are at least 3–4 real reuse locations.

4. Global CSS is growing.

Acceptable for now.

Reorganise only when it becomes difficult to maintain.

5. Theme persistence is intentionally ignored.

Dark mode is NOT part of the MVP.

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

- Archive page
- Methodology page
- About page

- Python paper collection pipeline

- OpenAlex integration
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

✓ Homepage

✓ Weekly page

✓ Paper page

Next:

Archive

Methodology

About

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

Collect papers from:

- OpenAlex
- Crossref
- arXiv

Deduplicate.

Store structured paper metadata.

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