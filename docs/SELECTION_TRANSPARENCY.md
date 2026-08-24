# Selection Transparency

Selection transparency explains the weekly curation path without changing the
Research Digest or Engineering Briefing reading experience.

## Curated From X Results

`Curated from X results` means the number of retained records available to the
weekly selection workflow for that edition.

For Research, the count is the deterministic ranked candidate count from the
OpenAlex pipeline. For 17-23 August 2026, the retained ranked pool contains 90
candidates and 5 selected papers.

For Engineering, the count is the number of retained source records in the
static briefing JSON. For 17-23 August 2026, the retained pool contains 6 source
records and 5 selected highlights.

Historical editions only expose candidate-pool pages when candidate records were
actually retained. Missing candidate-pool data must not be reconstructed from
memory or inferred counts.

## Research Selection

Research candidates are collected from OpenAlex, normalised, deduplicated,
classified for FOWT relevance, then ranked deterministically. Current ranking
order is:

1. relevance classification;
2. publication date, newest first;
3. paper ID as a stable tie-breaker.

Selected weekly papers are the highest-ranked relevant or possibly relevant
records within the weekly selection limit.

The Research Selection Score is display-only and is normalized from retained
rank position: rank 1 is 100, the last ranked candidate is 0. It explains the
stored ranking position and does not re-rank records.

## Engineering Selection

Engineering Briefing currently uses manual source-backed review. The static data
stores source records, item-source provenance, category, region and briefing
copy, but it does not retain ranked candidates or deterministic score
components.

Engineering therefore does not show a numeric Selection Score. A future score
would require an accepted deterministic Engineering ranking model before it can
be displayed honestly.
