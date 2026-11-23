---
name: company-intelligence
description: Collect, reconstruct, deduplicate, link, or audit source-backed Company Intelligence events for canonical FOWT Industry companies.
---

# Company Intelligence

Use this skill for Company Intelligence timeline and historical backfill work.

Follow `AGENTS.md` for repository, Git, scope, and validation rules.

## Read First

Read only as needed:

- canonical Industry company data
- `web/data/context/company-events.json`
- `web/data/company-intelligence-adapter.ts`
- `docs/COMPANY_INTELLIGENCE_FULL_HISTORY_AUDIT.md`
- target company / period audit data

## Core Model

Company Intelligence is event-centric.

One real-world development = one canonical event.

Each event may link to:

- multiple `companyIds[]`
- multiple `projectIds[]`
- one primary category
- one or more source citations
- historical attribution where needed

Never duplicate an event merely because several companies are involved.

## Workflow

Use the existing workflow:

canonical company
-> aliases / historical identities
-> first-party archive discovery
-> counterparty discovery
-> candidate publications
-> relevance review
-> existing-event check
-> publication/event deduplication
-> company/project linking
-> category assignment
-> evidence preservation
-> audit
-> validation

Build the evidence set before adding events.

## Collection

Prefer primary evidence:

1. company / project source
2. contractual counterparty
3. government / regulator / certification body
4. research programme / public authority
5. reputable industry source

Use secondary sources mainly for discovery or when primary evidence is unavailable.

Adapt research to company role:

- developers: leases, partnerships, procurement, construction, commissioning
- OEMs: orders, technology, certification, manufacturing, installation
- platforms: FEED, qualification, demonstrations, licensing, industrialisation
- cable / mooring / electrical: contracts, technology, manufacturing, delivery
- EPCI / marine: FEED, awards, vessels, campaigns, installation
- certification / engineering: assurance, design, studies, software, R&D

## Event Identity

Event != publication.

Parallel publications describing the same development belong to one event.

Retain useful supporting provenance.

Keep genuine lifecycle changes separate, for example:

preferred supplier
-> firm order
-> manufacturing
-> installation
-> first power
-> commissioning

Before creating an event, check the existing catalogue.

If it already exists, enrich it with verified:

- company memberships
- project relationships
- citations

## Categories

Use only:

- Projects & Contracts
- Technology & Engineering
- Digital & AI
- Manufacturing & Supply Chain
- Corporate & Market

Do not create new categories without explicit scope.

## Historical Identity

Preserve the organisation that existed at the time.

Canonical current identity and historical attribution are separate.

Handle predecessors, JVs, acquisitions, subsidiaries, and renamed companies only when the relationship is supported.

Do not rewrite historical announcements into current company names.

## Projects

Link only to existing canonical Projects when explicitly supported.

Do not use fuzzy project matching.

If a relevant project is missing:

- retain the event
- do not invent a project ID
- record the Project coverage gap

## Historical Backfill

For every required year, record one status:

- qualifying developments retained
- searched, no qualifying development found
- source/archive unavailable, limitation documented

Completion status:

- `COMPLETE`
- `COMPLETE_WITH_SOURCE_LIMITATION`
- `INCOMPLETE`

Never mark unresolved research as complete.

Do not pad sparse timelines.

## Scope

Include material offshore / floating-wind developments.

Exclude:

- unrelated onshore activity
- unrelated oil & gas
- routine financial reporting
- generic ESG / marketing
- ordinary appointments
- duplicate reporting
- unsupported speculation

Prefer verified evidence over event volume.

## Audit

Track for each company:

- canonical ID
- aliases / historical identities
- role
- years reviewed
- sources inspected
- counterparties inspected
- candidate evidence
- retained events
- exclusions
- source limitations
- earliest / latest event
- completion status

The audit must distinguish:

`no qualifying evidence found`

from:

`not researched`

## Validation

Verify:

- unique stable event IDs
- canonical company IDs
- valid canonical project IDs
- valid dates
- controlled categories
- attributable citations
- deterministic ordering
- no duplicated event objects
- historical attribution preserved
- company timelines render correctly

Run the validation required by `AGENTS.md`.

## Boundaries

Do not use this skill to implement:

- Global Search
- Subscribe
- email
- accounts
- databases / APIs
- RAG / vector search
- AI summaries
- dashboards
- Projects dataset expansion

Keep those as separate tasks.

## Finish

Verify evidence -> event identity -> entity links -> audit -> timeline consistency.

Report retained events, enrichments, duplicates consolidated, source limitations,
completion status, validation, and remaining coverage gaps.