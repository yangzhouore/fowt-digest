# Engineering Source Policy

## Purpose

This policy defines which source material may feed a future Engineering Briefing
pipeline. It protects the core repository rule that source data is authoritative
and presentation must not silently repair, reinterpret, or invent content.

The policy supports the future flow:

```text
source record
-> validated engineering item
-> weekly engineering briefing
-> static website data
```

It does not implement collection, scraping, APIs, AI summarisation, or website
changes.

## Accepted Source Types

A source may be accepted only when it is publicly reachable, attributable, and
relevant to floating offshore wind engineering practice.

Accepted source classes:

- government or seabed-authority announcements;
- standards, certification, assurance, or recommended-practice updates;
- engineering software release notes or official project documentation;
- company project announcements with concrete engineering, project, vessel,
  cable, foundation, mooring, grid, operations, or supply-chain content;
- trade-association policy, market, permitting, infrastructure, or technical
  updates;
- industry news items with clear publisher attribution and source URL;
- conference announcements when they contain concrete technical or project
  information.

## Excluded Source Types

Exclude sources when the item is not suitable for source-backed engineering
briefing.

Blocking exclusions:

- inaccessible source URL;
- missing publisher or publication date;
- unclear licensing or terms that prohibit storage of the required source data;
- pure marketing, sponsored, advertorial, or recruitment content unless it is
  explicitly labelled and separately accepted;
- opinion without verifiable project, technical, policy, or market facts;
- social-media-only posts;
- anonymous or unattributed claims;
- duplicate source records for the same canonical URL;
- research papers already handled by the Research Digest pipeline.

## Source Provenance Requirements

Every Engineering Source Record must preserve:

- canonical source URL;
- publisher name;
- source title;
- publication date;
- retrieval timestamp;
- source type;
- source excerpt or factual source text used by later stages;
- license or terms note when known;
- collection method label.

A future pipeline may store additional raw metadata, but publication must not
depend on unstored browser state, temporary files, or untraceable source text.

## Source Facts vs Briefing Copy

Source facts are direct facts available from accepted source records. Briefing
copy is presentation text prepared from those facts for readers.

Rules:

- source facts must remain attributable to source records;
- briefing copy must not add claims absent from accepted source facts;
- missing facts must be omitted or shown with neutral wording;
- presentation must not silently repair dates, publishers, URLs, titles, or
  technical claims;
- any future editorial or AI-assisted wording must remain traceable to source
  record IDs.

## Future AI Assistance

AI assistance is not allowed for source collection, source acceptance, or source
record creation.

AI assistance may be considered later only for briefing copy, after explicit
approval, and only when:

- all source records are already validated;
- the generated text cites the source record IDs it uses;
- an editor reviews the generated text before publication;
- validation blocks publication when generated text has no source references;
- the website can distinguish source metadata from briefing/editorial copy.

AI must not invent facts, infer unpublished technical conclusions, or rewrite
research paper content from the Research Digest.

## Publication-Blocking Policy Rules

A future validation step must block publication when:

- any source record lacks required provenance;
- any source URL is empty or invalid;
- any source record falls under a blocking exclusion;
- any briefing item references a missing source record;
- any briefing copy exists without at least one source record reference;
- any item mixes Research Digest paper IDs into Engineering Briefing data;
- duplicate source record IDs or duplicate briefing item IDs exist.
