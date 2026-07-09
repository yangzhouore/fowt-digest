# FOWT Research Digest

FOWT Research Digest is an MVP website for publishing a weekly digest of academic and conference papers related to floating offshore wind turbines.

The project is currently in the definition phase. No Next.js application has been initialized yet.

## MVP Scope

The first version will include:

- a homepage;
- one weekly edition page;
- individual paper pages;
- an archive page;
- a methodology page;
- mock paper data stored locally.

The MVP will not include authentication, user accounts, comments, payments, personalised recommendations, a database, an API server, autonomous publication, MCP servers, production AI agents, or automated ingestion.

## Technical Direction

The planned implementation is:

- Next.js and TypeScript for the website;
- plain CSS or CSS Modules for styling;
- local JSON for mock MVP data;
- Python for a future paper-processing pipeline;
- no FastAPI, database, authentication, MCP, AI agents, or UI component library in the initial MVP.

## Proposed Repository Structure

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

## Project Documents

- [Product definition](docs/product.md)
- [Design direction](docs/design.md)
- [Architecture](docs/architecture.md)

## Current Status

Initial project documentation is being established before application code is written. The next implementation step is to initialize the Next.js website under `web/` only after the project definition is accepted.
