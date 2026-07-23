# UX Roadmap

## Purpose

This roadmap defines Website UX Polish work only. It does not track detailed
repository status and does not change pipeline contracts or data.

The website is a reading layer over deterministic pipeline output. UX work may
improve hierarchy, formatting, and scanability. It must not invent content,
repair data, re-rank papers, or add product features outside the scoped UX item.

## Current Product State

Implemented reader paths:

```text
Homepage -> Weekly Digest -> Paper Detail
Archive -> Weekly Digest
Paper Detail -> originating Weekly Digest
```

The website uses static copied pipeline output from:

```text
web/data/digests/
```

The current archive contains 15 selected historical demonstration editions.
These editions are static demonstration data, not complete weekly historical
coverage.

## Progress

- UX-01 Homepage Entry And Reader Framing: complete and accepted.
- UX-02 Weekly Digest Scanability: complete, accepted, and committed.
- UX-03 Paper Detail Readability: complete, accepted, and committed.
- DD-01 Support Multiple Weekly Digests: complete, accepted, and committed.
- DD-02 Generate Historical Demo Dataset: complete, accepted, and committed.
- UX-04 Website Presentation Refinement: complete, accepted, and committed.

The Website UX Polish / Website Demo Dataset milestone is complete, accepted,
and merged into `main` via PR #9 (`eb7c2d5`). Do not begin another UX
implementation until the next milestone scope is explicitly reviewed and
accepted through a Design Review.

## Presentation Issues Versus Dataset Limitations

Presentation issues that UX Polish can address:

- reading hierarchy;
- metadata density;
- date formatting;
- topic display;
- abstract preview length;
- repetitive notices;
- page-level framing and call-to-action clarity.

Dataset limitations that UX Polish must not hide by inventing content:

- historical editions are selected demonstration editions, not complete weekly
  historical coverage;
- some papers have no abstract;
- some optional fields are unknown;
- topic tags come from source metadata and may be long;
- the pipeline does not provide editorial summaries, findings, limitations,
  scores, reading time, or human review text.

## UX-01 Homepage Entry And Reader Framing

Status: complete and accepted.

Scope:

- frame the product as a weekly FOWT research digest before describing the
  pipeline;
- present the current digest as the primary entry point;
- preview only a small number of papers;
- keep pipeline provenance visible but secondary;
- update root metadata so it no longer describes fictional content.

## UX-02 Weekly Digest Scanability

Status: complete, accepted, and committed.

Scope:

- improve hierarchy inside the Weekly Digest list;
- reduce metadata density;
- make dates easier to scan;
- improve topic tag presentation;
- show abstract previews only;
- preserve pipeline rank order and existing paper links.

Accepted abstract preview rule:

- Weekly Digest is a browsing page, not a reading page.
- Paper Detail remains the only page showing the complete abstract.
- If an abstract exists, display the first 280 characters of the existing
  abstract string.
- Do not rewrite, summarise, or interpret the text.
- Preserve original wording exactly.
- If the abstract is longer than 280 characters, append `...`.
- If no abstract exists, display `No abstract available.`
- This is presentation only.
- Do not modify pipeline data.

Acceptance focus:

- selected papers remain in pipeline rank order;
- the page remains a browsing page;
- topic and metadata presentation are easier to scan;
- no search, filtering, sorting, scoring, AI content, or data repair is added.

## UX-03 Paper Detail Readability

Status: complete and accepted.

Scope:

- improve one-paper reading hierarchy;
- present the complete abstract clearly;
- group metadata without exposing low-value internal fields;
- handle missing fields neutrally.

Do not add research problem, methodology, findings, engineering relevance,
limitations, scores, or generated summaries unless the pipeline later provides
those fields through an accepted contract.

## DD-01 Support Multiple Weekly Digests

Status: complete and accepted.

Scope:

- load multiple static digest JSON files through an explicit import list;
- return editions newest first;
- resolve Weekly Digest routes by edition slug;
- resolve Paper Detail pages across loaded editions with the owning edition
  context;
- list all loaded editions in Archive.

Do not add filesystem runtime discovery, backend services, APIs, databases,
automation, search, filters, or pipeline changes.

## DD-02 Generate Historical Demo Dataset

Status: complete and accepted.

Scope:

- generate approximately 15 selected historical weekly editions with the
  existing deterministic pipeline;
- copy only website-ready digest JSON into `web/data/digests/`;
- preserve deterministic ranking and source metadata;
- disclose that the archive is selected demonstration data, not complete weekly
  historical coverage.

Do not add automation, schedulers, a historical backfill system, backend
services, or data claims beyond the generated pipeline output.

## UX-04 Website Presentation Refinement

Status: complete and accepted.

Scope:

- lighten topic presentation without changing topic values or order;
- improve Methodology so readers can understand the project and pipeline path
  within one minute;
- present the pipeline as OpenAlex -> Collection -> Normalisation ->
  Deduplication -> Classification -> Ranking -> Weekly Digest -> Website;
- include restrained project links to GitHub and repository documentation.

Do not introduce backend, database, AI, search, filters, or deployment work.

## Recommended Order

The Website UX Polish and Website Demo Dataset milestone is complete, accepted,
and merged. No new milestone has been selected yet. The next feature should
start with a Design Review before implementation begins.
