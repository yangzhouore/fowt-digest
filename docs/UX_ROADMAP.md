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
```

The website uses one static copied pipeline output:

```text
web/data/weekly_digest.json
```

The current digest contains one weekly edition and 6 selected papers.

## Progress

- UX-01 Homepage Entry And Reader Framing: complete and accepted.
- UX-02 Weekly Digest Scanability: design accepted; implementation not started.
- UX-03 Paper Detail Readability: not started.
- UX-04 Archive Expectation Polish: not started.
- UX-05 Global Presentation Polish: not started.

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

- only one static digest exists;
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

Status: design accepted; implementation not started.

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
- Do not modify pipeline data, the digest adapter, or Paper Detail.

Acceptance focus:

- selected papers remain in pipeline rank order;
- the page remains a browsing page;
- topic and metadata presentation are easier to scan;
- no search, filtering, sorting, scoring, AI content, or data repair is added.

## UX-03 Paper Detail Readability

Status: not started.

Scope:

- improve one-paper reading hierarchy;
- present the complete abstract clearly;
- group metadata without exposing low-value internal fields;
- handle missing fields neutrally.

Do not add research problem, methodology, findings, engineering relevance,
limitations, scores, or generated summaries unless the pipeline later provides
those fields through an accepted contract.

## UX-04 Archive Expectation Polish

Status: not started.

Scope:

- make the one-entry archive feel intentional;
- avoid implying unavailable historical editions;
- preserve Archive -> Weekly navigation.

Do not add fake history, pagination, search, filters, or new fixtures.

## UX-05 Global Presentation Polish

Status: not started.

Scope:

- align date formatting;
- reduce repeated notices;
- align metadata labels;
- check mobile scanability;
- address header/navigation clarity only if it directly improves reading flow.

Do not introduce backend, database, AI, search, filters, or deployment work.

## Recommended Order

1. UX-02 Weekly Digest Scanability
2. UX-03 Paper Detail Readability
3. UX-04 Archive Expectation Polish
4. UX-05 Global Presentation Polish

UX-01 is already complete. Each remaining UX feature should be one focused
commit and independently reviewed.
