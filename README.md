# FOWT Research Digest

FOWT Research Digest is an MVP editorial website for floating offshore wind
turbine research. It presents a weekly, content-first digest using fictional
local paper data while the product and pipeline are still being defined.

The current implementation is a static Next.js website. It does not collect
real papers, score research, publish automatically, or connect to external
research sources.

## Implemented

- Homepage
- Weekly edition page
- Individual paper detail pages
- Archive page with prototype edition entries
- Methodology page
- About page
- Local fictional mock paper data
- Next.js App Router
- TypeScript
- Plain global CSS

## Not Yet Implemented

Future work includes:

- Archive data improvements
- Methodology and About content refinements
- Python collection pipeline
- OpenAlex integration
- Crossref integration
- arXiv integration
- AI scoring
- AI writing
- AI review
- Database
- Automatic publishing

## Repository Structure

```text
fowt-digest/
  AGENTS.md              # Contributor and engineering rules
  DIRECTIONS.md          # Project decisions and future direction
  PROJECT_STATUS.md      # Current status and technical debt notes
  README.md
  docs/
    architecture.md
    design.md
    product.md
  web/
    app/
      about/
      archive/
      methodology/
      papers/[slug]/
      weekly/[slug]/
      globals.css
      layout.tsx
      page.tsx
      site-header.tsx
    data/
      mock-papers.ts
    package.json
```

## Running the Website

Install dependencies and start the local development server from `web/`:

```powershell
cd web
npm install
npm run dev
```

Useful checks:

```powershell
npm run lint
npm run build
```

## Engineering Philosophy

The project follows the rules in `AGENTS.md`: keep the website simple, avoid
premature abstractions, use local structured data until more is needed, and keep
the future Python or AI pipeline separate from the frontend. The visual direction
is restrained, editorial, typography-first, and content-focused.

Do not add backend services, databases, UI component libraries, AI agents, or
production integrations unless the project scope explicitly changes.
