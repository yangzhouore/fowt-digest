---
name: fowt-paper
description: Collect, score, rank, reconstruct, or audit weekly FOWT Research Digest papers and candidate transparency.
---

# FOWT Research Paper Digest

Use this skill for weekly Research Digest work.

Follow `AGENTS.md` for repository, Git, scope, and validation rules.

## Read First

Read only as needed:

- `pipeline/openalex_collector.py`
- `pipeline/relevance_classifier.py`
- `pipeline/ranker.py`
- `pipeline/weekly_digest.py`
- `docs/SELECTION_TRANSPARENCY.md`

Use existing pipeline behavior instead of recreating it manually.

## Workflow

Use:

OpenAlex
→ normalize
→ deduplicate
→ FOWT relevance classification
→ `research_selection_score_v1`
→ deterministic ranking
→ Top 5
→ Weekly Research Digest

Do not manually choose papers.

## Candidate Pool

Collect candidates for the exact weekly publication window.

Preserve where supported:

- rank
- selected state
- classification
- publication metadata
- Selection Score
- component breakdown
- source link

`Curated from X results` must represent the actual candidate pool.

## Scoring

Use the existing `research_selection_score_v1`:

- FOWT relevance: 35
- Technical specificity: 25
- Research value: 15
- Venue quality: 10
- Metadata quality: 10
- Recency: 5

Score before ranking.

Do not derive score from rank.
Do not use LLM subjective scoring.
Do not change weights unless explicitly requested.

## Ranking

Use the accepted deterministic order:

1. Selection Score
2. relevance classification
3. publication date, newest first
4. stable paper ID

Exclude `Not Relevant` records from final selection.

Select up to the configured weekly limit.

## Integrity

Use existing deterministic FOWT and technical signal groups.

Do not invent:

- metadata
- DOI
- findings
- conclusions
- limitations
- scores
- citations

Do not introduce Journal Impact Factor unless a reliable data source and
explicit scoring-model change are separately approved.

## Historical Reconstruction

Distinguish clearly between:

- retained candidate pool
- reconstructed candidate pool

Reconstruction must use the exact historical week and current deterministic
pipeline/OpenAlex metadata.

Never claim a reconstructed pool is the exact original historical pool.

If reliable reconstruction fails, report the gap rather than fabricate data.

## Finish

Verify:

candidate collection
→ classification
→ score
→ ranking
→ Top 5
→ transparency

Run the validation required by `AGENTS.md`.

Report candidate count, Top 5, scoring consistency, reconstruction status,
validation result, and OpenAlex limitations.