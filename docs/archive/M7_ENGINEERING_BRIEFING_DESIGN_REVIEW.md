# M7 Engineering Briefing Design Review

## Product Goal

Add an independent Engineering Briefing that complements the existing Research
Digest for offshore wind engineers. The briefing should help readers scan the
week's most relevant engineering-facing developments in under one minute and
then open a full briefing page for source-backed detail.

The future Homepage should eventually contain two distinct sections:

- Engineering Briefing: approximately five weekly engineering highlights with
  concise one-line summaries and links to briefing detail pages.
- Research Digest: the existing deterministic OpenAlex paper digest, unchanged.

## Proposed Architecture

Treat Engineering Briefing as a separate content product with its own pipeline,
data contracts, publication workflow, and website presentation path.

```text
engineering sources
-> engineering collection
-> source-backed engineering item records
-> editorial/AI-assisted briefing preparation, if accepted
-> engineering briefing JSON
-> static website data
-> Homepage Engineering Briefing and briefing detail pages
```

This should not import, mutate, or extend the OpenAlex research pipeline. The
only shared concerns should be repository validation, static website rendering,
and high-level publishing discipline.

## Pipeline Separation

The repository should clearly separate the two pipelines:

- Research Pipeline: deterministic OpenAlex paper collection, classification,
  ranking, and weekly digest assembly.
- Engineering Pipeline: engineering-source collection, source provenance,
  briefing item preparation, and weekly briefing assembly.

Recommended future layout, if M7 proceeds beyond design:

```text
pipeline/              existing research pipeline only
engineering_pipeline/  future engineering collection and briefing pipeline
web/data/digests/      existing research digest JSON
web/data/briefings/    future engineering briefing JSON
```

No engineering item should enter `pipeline/weekly_digest.py`, research ranking,
or OpenAlex data contracts. No research paper should be reclassified as an
engineering briefing item.

## Possible Sources

Candidate source classes should be evaluated for stability, licensing, update
frequency, technical signal, and source provenance quality before any collection
implementation.

- Trade and industry news: offshorewind.biz has dedicated offshore wind and
  floating wind coverage, including project, vessel, authority, and supply-chain
  items.
- Trade association and policy sources: WindEurope publishes news, policy
  papers, reports, and offshore/floating wind material useful for market,
  permitting, grid, and infrastructure context.
- Government and seabed authorities: BOEM, The Crown Estate, and similar public
  bodies publish leasing, permitting, consultation, and award announcements.
- Company and project announcements: developers such as Equinor publish project
  updates for floating wind assets and markets.
- Engineering software releases: OpenFAST GitHub releases and Orcina OrcaFlex
  release/news pages can surface changes relevant to modelling workflows.
- Standards and assurance bodies: DNV energy news and floating wind pages can
  indicate certification, recommended practice, technical due diligence, and
  design-standard updates.
- Conference and event announcements: WindEurope events, Floating Offshore Wind
  events, and offshore energy conferences can identify agenda shifts and
  engineering themes, but should be lower priority unless the item has concrete
  technical content.

## Content Style

Research Digest must remain deterministic and must not add AI-written paper
summaries.

Engineering Briefing may eventually use AI-assisted summarisation, but only if
there is an accepted source-backed workflow. The minimum acceptable standard
should be:

- every generated sentence traces to one or more stored source records;
- generated text is labelled as briefing copy, not source text;
- source URL, publisher, publication date, and retrieval date are preserved;
- an editor can review and correct briefing text before publication;
- validation blocks publication when provenance is missing.

For M7 implementation, the safer first step is manual or mechanically prepared
briefing copy from collected source excerpts. AI assistance should be a later
explicit decision after provenance and review gates exist.

## Publication Workflow

The Engineering Briefing should follow the existing repository discipline but
remain independent from research publishing:

```text
prepare engineering briefing data
-> validate engineering briefing JSON
-> publish static briefing JSON into web/data/briefings/
-> update explicit website registration
-> run repository validation
-> manual review
-> commit and merge to main
-> Vercel deploys from Git integration
```

GitHub CI should validate committed briefing data once the feature exists. It
should not collect sources, generate summaries, commit data, push branches,
create PRs, or deploy through a second system.

## Future Homepage Layout

A future Homepage can show Engineering Briefing above Research Digest because it
is intended for fast engineering scanning. The Research Digest section should
remain available and unchanged.

Suggested eventual structure:

```text
Engineering Briefing
01 One-line source-backed engineering highlight
02 One-line source-backed engineering highlight
03 One-line source-backed engineering highlight
04 One-line source-backed engineering highlight
05 One-line source-backed engineering highlight
View full engineering briefing

Research Digest
existing current-digest paper previews
View full weekly digest
```

The two sections should use distinct labels and avoid mixing item types. Briefing
items should link to Engineering Briefing pages, while research papers should
continue linking to Paper Detail pages.

## Risks

- Source licensing and terms may prohibit scraping, storage, or republication.
- Trade news can contain sponsored or advertorial content that needs clear
  exclusion or labelling rules.
- Company announcements are useful but promotional and may require balancing
  against public or independent sources.
- Government and standards sources may update slowly but carry high authority.
- AI-assisted summarisation can introduce unsupported claims unless provenance,
  review, and validation gates exist first.
- Engineering relevance is broader and less deterministic than paper relevance;
  selection rules may require explicit editorial criteria.
- Homepage clarity could suffer if Engineering Briefing and Research Digest are
  visually merged or ranked together.

## Scope Boundary

M7 should define the Engineering Briefing product and architecture only. Any
implementation milestone must preserve these boundaries:

- Research Pipeline remains source of truth for research papers.
- Engineering Pipeline is independent and does not use OpenAlex paper ranking.
- Website remains static, with no backend, database, CMS, or API routes.
- Vercel remains CD through Git integration after accepted `main` updates.

## Out of Scope

This design review does not implement:

- source scraping;
- source APIs;
- data downloads;
- AI summaries;
- engineering JSON schemas;
- website pages or Homepage changes;
- CI/CD changes;
- GitHub Actions changes;
- deployment changes;
- changes to the existing research pipeline.

## Phased Implementation Proposal

1. M7A Source and Data Contract Design
   - Define source policy, acceptable source classes, provenance fields, and the
     minimal Engineering Briefing JSON contract.
   - Decide whether AI assistance is allowed later and what review gates are
     mandatory.

2. M7B Manual Static Briefing Prototype
   - Add one hand-authored, source-backed briefing JSON fixture and static
     website rendering.
   - Keep collection and summarisation manual to validate reader value first.

3. M7C Engineering Pipeline Foundation
   - Add independent `engineering_pipeline/` validation and publishing helpers.
   - Validate source records and briefing JSON without scraping automation.

4. M7D Collection Feasibility Review
   - Evaluate source-specific access methods, licensing, rate limits, and
     reliability.
   - Approve only sources that can be collected and stored within their terms.

5. M7E Assisted Briefing Review, Optional
   - Consider AI-assisted briefing copy only after provenance, validation, and
     editorial review workflows are established.
