# Product Vision

## Product Purpose

FOWT Digest is a source-backed intelligence briefing for floating and offshore
wind. It helps technical readers understand what happened in Engineering, what
is being studied in Research, who builds the sector, where projects are
happening, and how offshore wind intersects with Digital & AI.

The product is not a complete research database, market database, or general
news feed. It is a focused static reading experience built from deterministic
pipeline output and curated source-backed records.

## Target Reader

The primary reader is an offshore-wind engineer, researcher, developer, analyst,
project or supply-chain professional, policy professional, or student who needs
a concise view across the floating-wind system. Readers are expected to value
provenance, transparent selection, and honest data boundaries.

## Product Areas

- **Engineering - what happened:** weekly source-backed project, technology,
  infrastructure, policy, supply-chain, and operational developments.
- **Research - what is being studied:** papers selected through the deterministic
  OpenAlex pipeline and exposed with candidate and score transparency where the
  supporting pool exists.
- **Industry - who builds it:** curated organisations and roles across the
  floating-wind value chain.
- **Projects - where it is happening:** structured project facts, status,
  participants, timelines, and provenance.
- **Digital & AI - how the systems affect each other:** practical AI and digital
  impacts across the offshore-wind lifecycle, plus qualified pathways through
  which offshore wind may support compute infrastructure.

## Product Value

The product reduces the effort required to scan a fragmented sector while
preserving the route back to original records. Deterministic selection is used
where applicable; Industry and Projects remain structured intelligence rather
than ranked feeds; Digital & AI Signals remain supporting evidence rather than
a generic news stream.

## Definition Of Success

The product succeeds when a reader can:

- understand the five product areas and move between them without confusion;
- scan weekly Engineering and Research selections quickly;
- inspect candidate pools, scores, metadata, abstracts, and source links;
- understand the floating-wind value chain and browse verified project records;
- grasp the two-way AI × offshore-wind relationship without overstated claims;
- distinguish application areas from real-world evidence and emerging concepts;
- trust that missing facts remain missing rather than being inferred;
- switch fixed interface and editorial copy between English and Simplified
  Chinese without changing source-backed records.

## Product Principles

- Source-backed facts and provenance come before presentation.
- Research and Engineering selection methods remain separate and transparent.
- The pipeline is the source of truth for Research data.
- The website is a static presentation layer over committed data.
- Industry and Projects are structured intelligence, not ranked news feeds.
- Digital & AI stays narrow to offshore wind, digital engineering, energy
  systems, and relevant compute infrastructure.
- Deterministic scores are selection aids, not universal quality judgements.
- `UNKNOWN`, `null`, or omission is preferred to unsupported inference.
- Human review and repository-controlled publication remain explicit.
- Content and reading hierarchy take priority over decorative UI.

## UX Principles

- Keep list pages scannable and reserve fuller evidence for detail or expanded
  views.
- Make navigation, filters, source links, and reading paths predictable.
- Preserve restrained editorial typography and the existing visual language.
- Keep Light / Dark theme and English / Simplified Chinese language preferences
  independent.
- Preserve source-backed titles, abstracts, names, standards, publishers, and
  URLs in their original language unless an explicit translated field exists.

## Architecture Boundary

The local Python pipeline owns deterministic Research collection,
normalisation, deduplication, classification, scoring, selection, digest
assembly, and orchestration. The local publishing workflow copies accepted
Research output into committed website data.

Engineering, Industry, Projects, and Digital & AI use independent committed
static datasets. The website may format those records for display but must not
collect, score, translate, rewrite, repair, or reinterpret them at runtime.

## Current Non-goals

- backend services, databases, CMS, or API routes;
- authentication or user accounts;
- automatic collection, scheduling, or publication;
- runtime AI writing or translation;
- semantic search or AI scoring;
- generic AI news, financial feeds, or market dashboards;
- inferred company, project, or technology relationships;
- automatic synchronization between product-area datasets.
