# Project Handover

This file is an optional repository map for agents who need orientation after
reading `AGENTS.md`, `START_HERE.md`, and `PROJECT_STATUS.md`. It is not part of
the default reading path and should not duplicate current status.

## Repository Layout

```text
pipeline/  deterministic Research Digest pipeline and tests
web/       static Next.js website, adapters, validation scripts, committed data
docs/      durable reference docs plus archived historical notes
tools/     repository workflow helpers
.github/   GitHub Actions validation workflow
```

## Main Runtime Areas

Research pipeline:

- `pipeline/openalex_query.py`
- `pipeline/openalex_client.py`
- `pipeline/openalex_collector.py`
- `pipeline/normaliser.py`
- `pipeline/deduplicator.py`
- `pipeline/relevance_classifier.py`
- `pipeline/ranker.py`
- `pipeline/weekly_digest.py`
- `pipeline/orchestrator.py`
- `pipeline/website_publisher.py`
- `pipeline/tests/`

Website:

- `web/app/page.tsx`
- `web/app/site-header.tsx`
- `web/app/weekly/[slug]/page.tsx`
- `web/app/papers/[slug]/page.tsx`
- `web/app/archive/page.tsx`
- `web/app/archive/archive-search.tsx`
- `web/app/engineering/page.tsx`
- `web/app/engineering/[slug]/page.tsx`
- `web/app/industry/page.tsx`
- `web/app/projects/page.tsx`
- `web/app/projects/[slug]/page.tsx`
- `web/app/digital-ai/page.tsx`
- `web/app/digital-ai/signal-filters.tsx`
- `web/app/methodology/page.tsx`
- `web/app/i18n/`
- `web/app/globals.css`

Static website data:

- `web/data/digests/*.json`
- `web/data/digest-adapter.ts`
- `web/data/briefings/*.json`
- `web/data/engineering-briefing-adapter.ts`
- `web/data/industry/industry-map.ts`
- `web/data/projects/projects.json`
- `web/data/project-adapter.ts`
- `web/data/digital-ai/signals.json`
- `web/data/digital-ai-adapter.ts`

Website validation scripts:

- `web/scripts/validate-static-digests.js`
- `web/scripts/validate-static-digests.test.js`
- `web/scripts/validate-static-briefings.js`
- `web/scripts/validate-static-briefings.test.js`
- `web/scripts/validate-static-projects.js`
- `web/scripts/validate-static-projects.test.js`
- `web/scripts/validate-static-digital-ai.js`
- `web/scripts/validate-static-digital-ai.test.js`

Repository workflow:

- `tools/publication_workflow.py`
- `.github/workflows/ci.yml`

## Durable Reference Docs

Open only when relevant:

- Product principles: `docs/PRODUCT_VISION.md`
- Research pipeline architecture: `docs/PIPELINE_ARCHITECTURE.md`
- Research pipeline contracts: `docs/PIPELINE_DATA_MODEL.md`
- Website publishing workflow: `docs/WEBSITE_PUBLISHING_WORKFLOW.md`
- Engineering source policy: `docs/ENGINEERING_SOURCE_POLICY.md`
- Engineering briefing contract: `docs/ENGINEERING_BRIEFING_DATA_MODEL.md`
- Selection transparency: `docs/SELECTION_TRANSPARENCY.md`
- Digital & AI scope and evidence rules: `docs/M11_DIGITAL_AI_SIGNALS_DESIGN.md`

Historical milestone and early-design records live under `docs/archive/` and
should normally remain outside active context.
