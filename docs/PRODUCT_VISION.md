# Product Vision

## Product Purpose

FOWT Research Digest is a deterministic research digest for Floating Offshore Wind Turbines. It helps readers scan recent research outputs, understand what was selected by the pipeline, and move quickly from weekly overview to paper-level metadata.

The product is not a general research database. It is a focused weekly reading experience built from deterministic pipeline data.

## Target Reader

The primary reader is a researcher, engineer, analyst, or technical decision-maker who follows floating offshore wind research and needs a compact weekly view of relevant papers.

The reader is expected to value provenance, source metadata, and clear boundaries more than decorative presentation or generated commentary.

## Core User Need

Readers need to answer these questions quickly:

- What FOWT-related research appeared in the current week?
- Which papers were selected by the deterministic pipeline?
- What metadata and abstract information is available for each paper?
- Where can the original source be opened?
- What is known directly from the pipeline output, and what is not yet available?

## Product Value

The product value comes from reducing the effort required to scan weekly FOWT literature while preserving trust in the underlying data.

The pipeline provides deterministic collection, normalisation, deduplication, relevance classification, ranking, selection, and digest assembly. The website presents those outputs in a readable form without changing their meaning.

## Definition Of Success

The product succeeds when a reader can:

- understand that the digest is based on deterministic pipeline output;
- move from Homepage to Weekly Digest to Paper Detail without confusion;
- browse available weekly editions from Archive;
- scan selected papers without excessive metadata noise;
- read available abstracts and source metadata clearly;
- distinguish real pipeline data from missing or future editorial features;
- trust that the website has not invented paper claims or regenerated content.

## Product Principles

- The product is a deterministic FOWT research digest.
- The pipeline is the single source of truth.
- The website is a reading and presentation layer.
- The website must not invent, reinterpret, or regenerate pipeline data.
- Content and reading experience take priority over decorative UI.
- The product should remain narrow and useful before it becomes broad.
- Static local data is acceptable for the current Website MVP.
- Missing data should be presented honestly and neutrally.

## UX Principles

- Reduce cognitive load without removing access to real information.
- Prioritise reading hierarchy: edition context, paper title, source/date, abstract, then supporting metadata.
- Keep list pages scannable; reserve fuller metadata for detail pages.
- Avoid repeated technical notices that interrupt reading.
- Do not convert dataset limitations into invented content.
- Omit or de-emphasise optional unknown fields when they do not help the reader.
- Preserve simple editorial typography and restrained visual styling.
- Make links and reading paths predictable.

## Pipeline And Website Relationship

The pipeline owns data production and validation. The website owns presentation only.

The website may adapt pipeline output for display, such as formatting dates, creating URL-safe slugs, or choosing how much metadata to show on a page. It must not sort, re-rank, repair, reinterpret, summarize, or generate new paper content beyond neutral display fallbacks for missing fields.

Current Website MVP pages use static copied digest JSON files under `web/data/digests/`. The archive contains selected historical demonstration editions, not complete weekly historical coverage. The website does not run the pipeline.

## Explicit Non-goals

The current milestone does not include:

- AI-generated summaries;
- editorial analysis;
- search;
- filters;
- authentication;
- backend services;
- API routes;
- database storage;
- CMS integration;
- scheduler or automation;
- pipeline algorithm changes;
- automatic historical backfill;
- deployment configuration changes.
