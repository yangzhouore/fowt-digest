# FOWT Research Digest

## Project Goal

Build a simple and reliable website that publishes a weekly digest of
academic and conference papers related to floating offshore wind turbines. 

The product should help researchers and engineers quickly identify:
- what was published during the week;
- which papers are most relevant;
- what each paper contributes;
- why the work matters;
- what limitations should be considered.

## Current Phase

We are building the MVP.

The current MVP includes:
- a homepage;
- one weekly edition page;
- individual paper pages;
- an archive page;
- a methodology page;
- mock paper data stored locally.

The current MVP does not include:
- authentication;
- user accounts;
- comments;
- payments;
- personalised recommendations;
- a database;
- an API server;
- autonomous publication;
- MCP servers;
- production AI agents.

Do not implement excluded features unless explicitly requested.

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

Use the following initial architecture:

- `web/`: Next.js and TypeScript website.
- `pipeline/`: Python research-processing scripts.
- `data/`: local structured data for development.
- `docs/`: product and design decisions.

Do not add FastAPI during the initial static MVP.

The Python pipeline may later generate structured JSON consumed by the
Next.js website.

Each pipeline stage should validate its input contract, never silently repair it.

Avoid cross-package dependencies unless they are necessary.

## Frontend Rules

The website is content-first and typography-first.

Use:
- semantic HTML;
- straightforward CSS;
- clear typography;
- generous whitespace;
- thin borders;
- numbered sections;
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

The website must distinguish between:
- journal papers;
- conference papers;
- preprints.

Every paper should retain:
- title;
- authors;
- publication source;
- publication date;
- DOI or original source URL;
- analysis level;
- categories;
- score;
- summary;
- limitations.

Never invent paper metadata or research results.

Mock data must be clearly identified as mock data.

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