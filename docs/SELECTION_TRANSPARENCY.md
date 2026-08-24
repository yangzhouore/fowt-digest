# Selection Transparency

Selection transparency explains the weekly curation path without changing the
Research Digest or Engineering Briefing reading experience.

## Curated From X Results

`Curated from X results` means the number of candidate records available to the
weekly selection workflow for that edition.

For Research, the count is the deterministic ranked candidate count from the
OpenAlex pipeline. Candidate-pool pages are either retained or reconstructed.
Retained historical pools come from local classified OpenAlex run artifacts that
were already present in the repository. Reconstructed historical pools are newly
collected for the exact weekly publication window using the current deterministic
pipeline, current `research_selection_score_v1`, and current OpenAlex metadata.

For Engineering, the approved source universe is represented by the small
machine-readable registry at `web/data/engineering-source-registry.json`, derived
from `docs/ENGINEERING_SOURCE_POLICY.md`. Engineering candidate counts are the
number of deduplicated, basic-FOWT-relevant weekly candidates collected from the
approved Engineering source universe before scoring. Duplicate reports and
out-of-window official supporting pages may remain in the static source records
as provenance, but they are not counted as independent candidates.

Historical editions only expose candidate-pool pages when candidate records can
be retained or reconstructed reliably. Reconstructed Research pools must not be
described as the original historical candidate pools because upstream OpenAlex
records, metadata, indexing, and links can change over time. The 2026-08-16
Research pool is not published because the reconstruction did not complete
reliably.

Historical Engineering pools from April-August 2026 are labeled as reconstructed
historical registry-source pools. They use the approved 42-source registry, exact
weekly date filtering, basic FOWT/offshore-wind relevance filtering,
duplicate/event grouping, current `engineering_selection_score_v1`, and the same
deterministic diversity layer. They are not described as original retained pools
because publisher indexes and source availability can change over time. Weekly
briefings select up to five highlights; weeks with fewer strong independent
Engineering developments are intentionally not padded.

## Research Selection

Research candidates are collected from OpenAlex, normalised, deduplicated,
classified for FOWT relevance, scored, then ranked deterministically. The
Selection Score is computed before ranking and contributes directly to paper
selection.

The current model is `research_selection_score_v1`, a 100-point deterministic
score with these components:

| Component | Weight | Basis |
| --- | ---: | --- |
| FOWT relevance | 35 | Classifier result, explicit floating-offshore-wind phrases, combined floating and wind signals, classifier confidence. |
| Technical specificity | 25 | Matched title/topic/abstract keyword groups for aerodynamic, hydrodynamic, station-keeping, structural, control, platform, electrical, numerical-method and economic signals. |
| Research value | 15 | Matched keyword groups for validation, datasets, modelling, optimization and design, plus available abstract evidence. |
| Venue quality | 10 | OpenAlex source metadata, publication type and transparent venue/repository signals. |
| Metadata quality | 10 | DOI, source URL, author list, source title, abstract, topic tags and full-text/abstract availability. |
| Recency | 5 | Publication date relative to the newest candidate in the same weekly pool. |

Ranking order is deterministic:

1. Selection Score, highest first;
2. relevance classification as a tie-breaker;
3. publication date, newest first;
4. paper ID as a stable final tie-breaker.

Selected weekly papers are the first eligible records in that order, excluding
records classified as `Not Relevant`, up to the weekly selection limit.

The model does not use journal impact factor. No reliable impact-factor source is
currently committed to the static architecture, and journal prestige should not
dominate the Research Digest. The venue component is therefore a small proxy that
supports journals, conferences, preprints, datasets and repositories without
requiring proprietary metrics.

## Engineering Selection

Engineering candidates are retained public source records collected from the
approved Engineering source classes for the weekly publication window. The latest
scored edition uses `engineering_selection_score_v1`, a 100-point deterministic
score computed from source-record metadata and concise source-backed evidence
text before ranking.

The latest-week collection path is:

```text
approved engineering sources
-> collect all eligible weekly items
-> normalize / deduplicate
-> basic FOWT relevance filter
-> engineering_selection_score_v1
-> importance ranking
-> diversity-aware curation
-> up to 5 Engineering highlights
```

| Component | Weight | Basis |
| --- | ---: | --- |
| Engineering relevance | 30 | Floating-wind, offshore-wind and engineering terms such as ports, installation, fabrication, cables, moorings, grid, vessels and consenting. |
| Project / company | 25 | Named projects, ports, government bodies, developers or supply-chain entities plus concrete events such as tenders, selections, support, partnerships or study groups. |
| Technology | 20 | Controlled topic groups for ports, floating platforms, cables, installation, fabrication and digital engineering. |
| Policy / market | 15 | Government, procurement, state-support, consenting, regulation, supply-chain, leasing and market signals, with source-type additions. |
| Source quality | 10 | Source-type proxy that favors government and standards sources, then company/trade sources, with reputable industry news below primary sources. |

The raw ranking order is deterministic:

1. Engineering Selection Score, highest first;
2. source record ID as a stable final tie-breaker.

The final selected highlights are not always simply the five highest scores when
that would duplicate coverage unnecessarily. After scoring, a deterministic diversity layer checks
publisher, detected project group, topic group and region. It can defer a
higher-ranked duplicate project/topic candidate when another source-backed
candidate adds broader weekly coverage. The candidate page labels the raw rank,
final rank, selected state, score breakdown and diversity reason.

No LLM subjective scoring is used. The score is a transparent heuristic over the
retained candidate records, not a claim that every global engineering news source
was collected. Current Engineering collection remains manual and source-policy
bounded. Reconstructed historical Engineering pools are explicitly labeled as
registry-source reconstructions when built from the approved registry for a
historical weekly window.
