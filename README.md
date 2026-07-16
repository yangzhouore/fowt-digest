# FOWT Research Digest

FOWT Research Digest is an MVP editorial website for floating offshore wind
turbine research. It presents a weekly, content-first digest using fictional
local paper data while the product and pipeline are still being defined.

The current implementation is a static Next.js website. It does not collect
real papers, score research, publish automatically, or connect to external
research sources.

## Current Website Status

The Web MVP is ready for first public deployment as a prototype.

Included pages:

- Homepage
- Weekly edition page
- Individual paper detail pages
- Archive page with prototype edition entries
- Methodology page
- About page

Current limitations:

- All paper and edition data is fictional mock content.
- No Python pipeline integration is connected to the website.
- No backend, API, database, CMS, analytics, search, authentication, or AI
  workflow is implemented.
- The first deployment should be treated as a public prototype, not a live
  research publication.

## Implemented

- Next.js App Router
- TypeScript
- Plain global CSS
- Static route generation for the weekly edition and paper detail pages
- Shared header and footer navigation
- Local fictional mock paper data
- Production build with `npm run build`

## Not Yet Implemented

Future work includes:

- Real paper data
- Python collection pipeline integration
- OpenAlex integration in the public website
- Crossref integration
- arXiv integration
- AI scoring
- AI writing
- AI review
- Database
- Automatic publishing
- CI/CD workflow automation

## Repository Structure

```text
fowt-digest/
  AGENTS.md              # Contributor and engineering rules
  DIRECTIONS.md          # Project decisions and future direction
  PROJECT_STATUS.md      # Current status and technical debt notes
  README.md
  docs/                  # Product, architecture, design, and pipeline docs
  pipeline/              # Python pipeline package, separate from the website
  web/                   # Next.js public website
    app/
      about/
      archive/
      methodology/
      papers/[slug]/
      weekly/[slug]/
      globals.css
      layout.tsx
      page.tsx
      site-footer.tsx
      site-header.tsx
    data/
      mock-papers.ts
    package.json
```

## Local Development

Install dependencies and start the local development server from `web/`:

```powershell
cd web
npm install
npm run dev
```

Then open the local URL printed by Next.js, usually:

```text
http://localhost:3000
```

## Production Build

Run the production checks from `web/`:

```powershell
cd web
npm run lint
npm run build
```

The build should generate the static public routes for:

- `/`
- `/weekly/2026-08-09`
- `/papers/[slug]`
- `/archive`
- `/methodology`
- `/about`

## Vercel Deployment

Recommended first deployment target: Vercel.

Use these project settings:

- Framework preset: Next.js
- Root directory: `web`
- Install command: `npm ci` or Vercel default
- Build command: `npm run build`
- Output directory: Vercel default for Next.js

No environment variables are required for the current MVP.

After deployment, verify:

- homepage loads;
- weekly edition page loads;
- all paper detail pages load;
- archive, methodology, and about pages load;
- internal navigation does not produce 404s;
- the site clearly states that content is fictional mock data.

Deployment has not yet been performed.

## Engineering Philosophy

The project follows the rules in `AGENTS.md`: keep the website simple, avoid
premature abstractions, use local structured data until more is needed, and keep
the future Python or AI pipeline separate from the frontend. The visual direction
is restrained, editorial, typography-first, and content-focused.

Do not add backend services, databases, UI component libraries, AI agents, or
production integrations unless the project scope explicitly changes.
