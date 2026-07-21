# FOWT Research Digest

## Project Goal

Build a simple and reliable website and deterministic pipeline that publish a
weekly digest of academic and conference papers related to Floating Offshore
Wind Turbines.

The product should help researchers and engineers quickly identify:

- what was published during the week;
- which papers were selected by the deterministic pipeline;
- what metadata and abstract evidence is available;
- where the original source can be opened;
- what is known from pipeline output and what remains unavailable.

For the current repository state and resume task, read `START_HERE.md` and
`PROJECT_STATUS.md`. This file defines durable engineering rules, not milestone
status.

## Working Principles

### 1. Think Before Coding

Before implementing:

1. Restate the requested outcome.
2. State relevant assumptions.
3. Identify unclear requirements.
4. Present meaningful tradeoffs when they exist.
5. Prefer the simpler interpretation.
6. Define verifiable success criteria.
7. Provide a short implementation plan.

Do not silently make product or architecture decisions.

### 2. Simplicity First

Write the minimum code required to solve the current task.

- Do not add speculative features.
- Do not create abstractions for one-time use.
- Do not add configuration that has not been requested.
- Do not introduce a library when the platform already provides the feature.
- Do not create generic component systems prematurely.
- Do not add an API before the website requires one.
- Do not add a database while local structured data is sufficient.
- Do not install a UI component library.
- Prefer readable code over clever code.

If an implementation can be substantially shorter without losing clarity,
rewrite it.

### 3. Surgical Changes

When editing existing code:

- Touch only files required by the task.
- Do not refactor unrelated code.
- Do not reformat unrelated files.
- Match the existing style.
- Mention unrelated issues instead of fixing them.
- Remove only unused code created by the current change.

Every changed line should be traceable to the requested task.

### 4. Goal-Driven Execution

For every implementation task:

1. Define success criteria.
2. Add or update the smallest useful tests.
3. Implement the change.
4. Run the relevant checks.
5. Inspect the final diff.
6. Report what was verified.

Do not claim completion when checks have not been run.

## Architecture Rules

Use the repository layout intentionally:

- `web/`: Next.js and TypeScript website.
- `pipeline/`: Python research-processing pipeline.
- `docs/`: product, architecture, roadmap, and data-contract documents.

Keep the Python pipeline independent from the frontend.

Each pipeline stage should validate its input contract, never silently repair it.

Do not add FastAPI, a database, CMS, scheduler, API routes, MCP servers, or AI
workflow modules unless a milestone explicitly scopes that work.

Avoid cross-package dependencies unless they are necessary.

## Frontend Rules

The website is content-first and typography-first.

Use:

- semantic HTML;
- straightforward CSS;
- clear typography;
- generous whitespace;
- thin borders;
- numbered sections where they help scanning;
- restrained colours;
- accessible links;
- responsive layouts.

Avoid:

- rounded content cards;
- gradients;
- glassmorphism;
- decorative shadows;
- dashboard-style layouts;
- unnecessary animations;
- carousels;
- excessive icons;
- visual effects that reduce readability.

Do not install Tailwind or a component library unless explicitly requested.

Components should be created only when:

- the same structure is genuinely reused; or
- extracting it materially improves readability.

Do not turn every page section into a component.

## Content Rules

The pipeline is the source of truth for paper data. The website may format data
for presentation, but it must not invent, rewrite, summarise, re-rank, repair,
or reinterpret paper content.

Preserve source metadata where it is displayed:

- title;
- authors;
- publication source;
- publication date;
- DOI or original source URL;
- publication type where available;
- topic tags where useful;
- abstract text where available.

Missing fields should be omitted or handled with neutral wording. Never invent
paper metadata, research results, findings, limitations, scores, or editorial
analysis.

## Git Rules

Before making changes:

- inspect `git status`;
- inspect relevant existing files.

After making changes:

- run relevant tests and checks;
- inspect `git diff`;
- summarise changed files;
- do not commit unless explicitly requested.

## Communication Format

Before coding, respond with:

1. Goal
2. Assumptions
3. Tradeoffs
4. Plan
5. Success criteria

After coding, respond with:

1. What changed
2. Files changed
3. Verification performed
4. Known limitations
5. Suggested next step
