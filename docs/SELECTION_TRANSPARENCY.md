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

For Engineering, the count is the number of retained source records in the
static briefing JSON. For 17-23 August 2026, the retained pool contains 6 source
records and 5 selected highlights.

Historical editions only expose candidate-pool pages when candidate records can
be retained or reconstructed reliably. Reconstructed pools must not be described
as the original historical candidate pools because upstream OpenAlex records,
metadata, indexing, and links can change over time. The 2026-08-16 pool is not
published because the reconstruction did not complete reliably.

## Research Selection

Research candidates are collected from OpenAlex, normalised, deduplicated,
classified for FOWT relevance, scored, then ranked deterministically. The
Selection Score is computed before ranking and now contributes directly to paper
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

Engineering Briefing currently uses manual source-backed review. The static data
stores source records, item-source provenance, category, region and briefing
copy, but it does not retain ranked candidates or deterministic score
components.

Engineering therefore does not show a numeric Selection Score. A future score
would require an accepted deterministic Engineering ranking model before it can
be displayed honestly.
