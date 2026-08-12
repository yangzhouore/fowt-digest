# Engineering Briefing Data Model

## Purpose

This document defines the minimum stable contracts for a future source-backed
Engineering Briefing pipeline. The contracts are intentionally small and are not
implemented in code by M7A.

The intended flow is:

```text
Engineering Source Record
-> Engineering Briefing Item
-> Weekly Engineering Briefing
-> static website data
```

The Engineering Briefing contracts are independent from the existing OpenAlex
Research Digest contracts.

## Contract Principles

- Source records are authoritative.
- Contracts must preserve provenance before presentation.
- Validation must fail closed rather than repair malformed data.
- Briefing copy must be traceable to source records.
- The Engineering Pipeline must not use Research Pipeline ranking, paper IDs, or
  OpenAlex collection outputs.
- Fields should be added only when a future milestone needs them.

## Engineering Source Record

A source record represents one accepted source page or document captured for
possible briefing use.

Required fields:

```json
{
  "sourceRecordId": "eng-src-2026-08-09-example",
  "sourceType": "industry_news",
  "publisher": "Publisher name",
  "title": "Source title",
  "sourceUrl": "https://example.com/source",
  "publishedDate": "2026-08-09",
  "retrievedAt": "2026-08-11T12:00:00Z",
  "collectionMethod": "manual",
  "sourceText": "Stored source excerpt or factual text used by later stages.",
  "licenseNote": "Public webpage; reuse terms not yet reviewed."
}
```

Allowed `sourceType` values for the initial contract:

- `government_announcement`
- `standards_update`
- `software_release`
- `company_announcement`
- `trade_association`
- `industry_news`
- `conference_announcement`

Allowed `collectionMethod` values for the initial contract:

- `manual`
- `approved_feed`
- `approved_api`
- `approved_scrape`

Only `manual` is in scope before a later implementation milestone approves any
automated access method.

## Engineering Briefing Item

A briefing item is one selected engineering-facing development derived from one
or more source records.

Required fields:

```json
{
  "briefingItemId": "eng-item-2026-08-09-01",
  "title": "Brief item title",
  "oneLineSummary": "Concise source-backed briefing sentence.",
  "category": "project",
  "region": "Europe",
  "sourceRecordIds": ["eng-src-2026-08-09-example"],
  "sourceUrl": "https://example.com/source"
}
```

Allowed `category` values for the initial contract:

- `project`
- `policy`
- `technology`
- `software`
- `standards`
- `supply_chain`
- `event`

Optional `region` values for Homepage presentation:

- `Europe`
- `Asia-Pacific`
- `North America`
- `Africa`
- `Global`

Use `Global` only for genuinely cross-regional standards, software releases, or corporate technical developments.

Rules:

- `title` and `oneLineSummary` are briefing/editorial copy, not source text.
- `oneLineSummary` must be supported by the referenced source records.
- `sourceRecordIds` must contain at least one existing source record ID.
- `sourceUrl` should point to the primary source used for reader follow-through.
- `region`, when present, must be supported by the project, company, or event location in the source-backed record.
- Ordering inside a weekly briefing is editorial, not Research Digest ranking.

## Weekly Engineering Briefing

A weekly briefing groups selected briefing items for one publication week.

Required fields:

```json
{
  "schemaVersion": "engineering-briefing.v1",
  "weekStart": "2026-08-03",
  "weekEnd": "2026-08-09",
  "generatedAt": "2026-08-11T12:00:00Z",
  "sourceRecords": [],
  "briefingItems": []
}
```

Rules:

- `weekStart`, `weekEnd`, and `generatedAt` must be valid ISO dates or datetimes.
- `weekStart` must be on or before `weekEnd`.
- `briefingItems` should contain approximately five items, but validation should
  allow fewer when fewer accepted items exist.
- `sourceRecords` must include every source referenced by `briefingItems`.
- Briefing JSON should be committed under a future static website data path such
  as `web/data/briefings/` only after a later implementation milestone.

## Publication-Blocking Validation Rules

A future validator must block publication when:

- `schemaVersion` is missing or unsupported;
- required fields are missing, empty, or the wrong type;
- dates are invalid or `weekStart` is after `weekEnd`;
- `sourceRecordId` or `briefingItemId` values are duplicated;
- a briefing item references a source record that is absent;
- a source record has an invalid URL or missing publisher/title/date;
- `sourceText` is empty;
- `oneLineSummary` is empty or has no source references;
- an item uses unsupported `sourceType`, `collectionMethod`, `category`, or `region`;
- Engineering Briefing data references Research Digest paper IDs as source
  records;
- briefing copy claims cannot be traced to stored source records during review.

## Boundary for Future AI Assistance

AI assistance, if later approved, belongs after source records are validated and
before final briefing item review:

```text
validated source records
-> optional AI-assisted draft briefing copy
-> human review
-> validated briefing items
```

AI output must be stored only as briefing/editorial copy. It must not overwrite
source records, source titles, publication dates, publishers, URLs, or stored
source text. Human review remains the publication gate.
