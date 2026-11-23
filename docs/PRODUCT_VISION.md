# Product Vision

## Purpose

FOWT Research Digest is a source-backed intelligence briefing for floating and
offshore wind. It helps readers understand what happened, what is being
studied, who is involved, and how offshore wind intersects with Digital & AI.
Its scope is selected, attributable intelligence for technical readers.

The primary audience includes engineers, researchers, developers, analysts,
supply-chain and policy professionals, and students. It values provenance,
transparent selection, and clear evidence limits.

## Product model

The product follows a simple progression from **Build** to **Find** to
**Deliver**.

### Build source-backed intelligence

- **Engineering** explains weekly developments in projects, technology,
  infrastructure, policy, supply chains, and operations.
- **Research** makes curated papers, metadata, and available candidate
  evidence easy to inspect.
- **Industry** defines companies and their roles in the offshore-wind value chain.
- **Projects** documents project facts, status, participants, timelines, and
  evidence. Readers can distinguish confirmed facts from editorial assessments.
- **Company Intelligence** treats the company as a core intelligence entity.
  A source-backed development is represented once and can appear on several
  company timelines through canonical company and project relationships.
  Historical attribution stays visible alongside current company identity.
- **Digital & AI** connects practical use cases and energy pathways with
  qualified evidence from the offshore-wind sector.

### Find across sections

Global Search connects companies, projects, company events, Engineering,
Research, and Digital & AI. It uses deterministic entity-aware ranking
that gives canonical identities priority over text matches. Readers can move
from a cross-section result to its owning record and then to its evidence.
Section-specific searches and filters support narrower questions.

### Deliver what readers follow

Subscribe delivers weekly Engineering news, Research selections, and briefings
for followed companies. People can confirm, manage, and cancel their own
preferences through email links. Delivery selects from reviewed records and
keeps their citations and canonical relationships intact.

## Definition of success

A reader can:

- Scan weekly Engineering and Research selections, then inspect the source or
  candidate evidence for a result.
- Understand company roles and trace a development from a company timeline to
  its sources and recorded project context.
- Find a known company or project and discover relevant evidence across sections
  through predictable search.
- Receive the weekly products they selected and change or cancel delivery
  without an account.
- Distinguish confirmed findings, editorial interpretation, and uncertainty,
  including in Digital & AI.
- Read the interface in English or Simplified Chinese with underlying source
  facts and provenance preserved.

## Product and presentation principles

- Source facts, provenance, and reviewed relationships come first.
- Research and Engineering selection methods remain separate and transparent.
  Deterministic scores help readers understand selection decisions.
- Keep lists scannable and reserve fuller evidence for detail or expanded views.
  Make navigation, filters, source links, and reading paths predictable.
- Preserve source-backed titles, abstracts, names, publishers, and links unless
  an explicit translation exists. Language and theme are presentation choices.
- Represent missing information as unknown or omit it. Preserve uncertainty and
  separate editorial interpretation from confirmed facts.

## Architecture boundary

The local deterministic Research pipeline owns Research collection, scoring,
selection, and digest assembly. Local publication transfers accepted Research
output to committed website data. Engineering, Industry, Projects, Company
Intelligence, and Digital & AI use curated, committed records. Editorial
decisions and recorded relationships remain reviewable in the repository.

The site renders those records and derives deterministic Global Search from
them. Subscribe is the only use of backend persistence, email, and scheduling.
It stores preferences and delivery state, and reads existing intelligence for
weekly delivery. See the [Subscribe runbook](SUBSCRIBE_MVP.md) for the
operational boundary and setup.

## Non-goals

- Runtime AI generation, translation, or scoring.
- Semantic search, vector search, retrieval-augmented generation, or inferred
  company and project relationships.
- User accounts or passwords.
- Runtime collection, editorial publication, or automatic synchronisation
  between intelligence datasets.
- General news feeds, financial feeds, or market dashboards.
