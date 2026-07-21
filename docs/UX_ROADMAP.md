# UX Roadmap

## UX Polish Goal

Website UX Polish improves the reading experience for the current static pipeline digest without changing pipeline data, adding generated content, or expanding product scope.

The goal is to make Homepage, Weekly Digest, Paper Detail, and Archive easier to scan and understand while preserving the deterministic pipeline as the source of truth.

## Current Product State

Implemented reader paths:

```text
Homepage -> Weekly Digest -> Paper Detail
Archive -> Weekly Digest
```

The website currently uses one static copied pipeline output:

```text
web/data/weekly_digest.json
```

The digest contains one weekly edition and 6 selected papers. Homepage, Weekly Digest, Paper Detail, and Archive use this real pipeline data. About and Methodology may still contain prototype wording until separately scoped.

## Main UX Problems

### Presentation Issues

- Some copy still frames the site as a pipeline preview before it frames it as a digest.
- Pipeline-data notices are repetitive and can interrupt reading.
- Homepage duplicates too much Weekly Digest content and is not yet a strong entry point.
- Paper Detail pages are accurate but read like metadata records rather than reader-facing paper pages.
- Metadata density can compete with titles and abstracts.
- Raw or low-value fields such as unknown publication type can feel incomplete when shown prominently.
- Date display is not consistently reader-friendly.
- Topic tag lists can be long and hard to scan.
- Archive copy should set expectations around one available edition.
- Header and navigation work, but should stay focused on the reading journey.

### Dataset Limitations

- Only one real digest snapshot is available.
- Some selected papers have no abstract.
- Current publication type values may be `unknown`.
- Some papers have many source-derived topic tags.
- The pipeline does not provide editorial summaries, findings, limitations, scores, or reading-time estimates.

These limitations must not be solved by inventing content in the website.

## Prioritised UX Features

## UX-01 Homepage Entry And Reader Framing

### Scope

Improve the Homepage as the main entry point to the current digest.

Focus on:

- clearer reader-facing introduction;
- less pipeline-heavy copy;
- removal of stale fictional wording in visible product metadata where scoped;
- stronger current-edition call to action;
- clickable paper titles where papers are previewed;
- avoiding duplication of the full Weekly Digest page.

### Presentation Versus Dataset

Presentation improvements can clarify that the site displays one deterministic digest snapshot. Dataset limitations, such as having only one digest and no editorial summaries, should remain explicit but secondary.

### Acceptance Focus

- Homepage explains the product before explaining pipeline mechanics.
- Homepage still states that data comes from a static deterministic pipeline digest.
- Homepage links naturally to Weekly Digest and Paper Detail.
- No generated summaries, invented claims, or new data fields are introduced.

## UX-02 Weekly Digest Scanability

### Scope

Improve the Weekly Digest page as the primary list-reading experience.

Focus on:

- clearer edition hierarchy;
- compact paper list presentation;
- readable metadata ordering;
- concise abstract previews;
- topic tag display that reduces overload;
- clear paper title links to detail pages;
- fewer repeated notices.

### Presentation Versus Dataset

The page may format and limit display density, but it must preserve paper order and must not change selection, ranking, classifications, or topic data.

### Acceptance Focus

- Selected papers remain in pipeline rank order.
- Each paper is easier to scan before opening detail.
- Topic and abstract presentation reduce cognitive load.
- No search, filtering, sorting, scoring, or AI content is added.

## UX-03 Paper Detail Readability

### Scope

Improve Paper Detail pages as the complete metadata reading view for one selected paper.

Focus on:

- stronger title and source/date hierarchy;
- abstract presentation before dense supporting metadata where appropriate;
- cleaner metadata grouping;
- omission or de-emphasis of unknown optional fields;
- consistent date formatting;
- neutral fallback for missing abstract;
- clear source link placement.

### Presentation Versus Dataset

The page can improve how real fields are ordered and displayed. It must not add research problem, methodology, findings, engineering relevance, limitations, scores, or generated summaries because the current pipeline does not provide them.

### Acceptance Focus

- Paper Detail feels like a readable paper page, not a raw record dump.
- Full real metadata remains accessible where useful.
- Missing data is handled neutrally.
- No internal identifiers or pipeline-only fields are exposed unless already accepted for reader value.

## UX-04 Archive Expectation Polish

### Scope

Improve Archive as the browsing entry point for available weekly digests.

Focus on:

- setting expectations that only one static digest is currently available;
- presenting the current edition clearly;
- preserving Archive -> Weekly navigation;
- avoiding language that implies unavailable historical depth.

### Presentation Versus Dataset

The one-entry archive is a dataset limitation. Do not add placeholder editions or fake history.

### Acceptance Focus

- Archive uses real digest data only.
- Archive does not imply more editions exist than are available.
- Archive remains useful as the future home for historical digests.
- No pagination, search, filters, or new data fixtures are added.

## UX-05 Global Presentation Polish

### Scope

Address cross-page presentation issues after the page-specific improvements.

Focus on:

- consistent date formatting;
- consistent notice wording;
- metadata labels that are reader-friendly;
- topic display conventions;
- header/navigation clarity;
- mobile scanability;
- stale root metadata that still describes fictional content.

### Presentation Versus Dataset

Global polish should improve consistency and comprehension. It should not change pipeline contracts, add data products, or introduce broader website features.

### Acceptance Focus

- Pages feel like one coherent reading experience.
- Notices are factual but not repetitive.
- Navigation remains simple and predictable.
- No backend, database, search, filters, AI, or deployment work is introduced.

## Recommended Implementation Order

1. UX-01 Homepage Entry And Reader Framing
2. UX-02 Weekly Digest Scanability
3. UX-03 Paper Detail Readability
4. UX-04 Archive Expectation Polish
5. UX-05 Global Presentation Polish

Each feature should be implemented as one focused commit and independently reviewed before proceeding to the next feature.

## Explicit Non-goals

UX Polish does not include:

- pipeline changes;
- new JSON fixtures;
- AI summaries;
- editorial analysis;
- generated findings or limitations;
- scoring;
- search;
- filters;
- pagination;
- authentication;
- backend services;
- API routes;
- database work;
- deployment configuration;
- automated publishing.
