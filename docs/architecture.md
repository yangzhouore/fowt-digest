# Architecture

## Initial Architecture

The project should start as a static MVP with a Next.js and TypeScript website. The website will consume local JSON data and render editorial pages for the first digest.

Use:

- `web/` for the Next.js and TypeScript website;
- `data/` for local structured JSON used by the MVP;
- `pipeline/` for future Python research-processing scripts;
- `docs/` for product, design, and architecture decisions.

Do not add FastAPI, a database, authentication, MCP, AI agents, or a UI component library during the initial MVP.

## Minimum Repository Structure

Proposed structure:

```text
fowt-digest/
  AGENTS.md
  README.md
  docs/
    product.md
    design.md
    architecture.md
  web/
    # Next.js app, added later
  data/
    # Local mock JSON, added with the MVP
  pipeline/
    # Python scripts, added later
```

Only `docs/` and `README.md` are required during the current definition phase.

## Website Responsibilities

The website will render:

- homepage;
- one weekly edition page;
- individual paper pages;
- archive page;
- methodology page.

The website should use plain CSS or CSS Modules. Keep routing, styling, and data loading simple until real complexity appears.

## Data Responsibilities

The MVP should use local JSON for paper and edition data. The JSON should keep paper metadata separate enough to support individual paper pages without duplicating research claims.

The future Python pipeline may generate or validate this JSON, but the MVP should not require the pipeline to run.

## Boundaries

The repository should not contain production ingestion, autonomous publication, server APIs, or persistent user data yet. Any future move toward those systems should be documented before implementation.
