---
name: fowt-news
description: Collect, score, select, reconstruct, or audit weekly FOWT Engineering news and candidate transparency.
---

# FOWT Weekly Engineering News

Use this skill for weekly Engineering Briefing work.

Follow `AGENTS.md` for repository, Git, scope, and validation rules.

## Read First

Read only as needed:

- `docs/ENGINEERING_SOURCE_POLICY.md`
- `docs/SELECTION_TRANSPARENCY.md`
- `web/data/engineering-source-registry.json`
- target week's Engineering data

## Workflow

Use the existing workflow:

approved source registry
-> weekly discovery
-> exact date filter
-> FOWT relevance filter
-> event/duplicate grouping
-> `engineering_selection_score_v1`
-> deterministic ranking
-> diversity review
-> up to 5 highlights

Never begin with five hand-picked stories.
Build the candidate pool before selection.

## Collection

Search the approved source registry broadly.

Prefer primary evidence:

1. government / regulator / seabed authority
2. developer / owner
3. OEM / supplier / technology company
4. standards / certification / technical body
5. reputable trade press

Trade press may discover an event, but preserve stronger primary provenance
when available.

Track:

- sources attempted / succeeded
- raw discoveries
- in-window items
- relevant items
- duplicates removed
- final candidates
- publishers represented

## Scoring

Do not redesign the existing model.

`engineering_selection_score_v1`:

- Engineering relevance: 30
- Project / company: 25
- Technology: 20
- Policy / market: 15
- Source quality: 10

Score before ranking.
Do not use LLM subjective scoring.

## Deduplication and Diversity

Multiple reports of one event are one candidate, not multiple important events.

Retain supporting provenance where useful.

After ranking, use the existing diversity layer across:

- publisher
- project/event
- engineering topic
- region

Any displacement of a higher-ranked item needs a recorded diversity reason.

## Selection

Select up to 5 strong independent Engineering developments.

Never pad a weak week merely to reach five.

Keep source-backed facts only.
Do not invent engineering claims, companies, dates, scores, or provenance.

## Transparency

Candidate pages should preserve:

rank, selected state, score breakdown, publisher, region, topic,
event group, source link, provenance, and diversity reason where applicable.

`Curated from X candidates across Y sources` must use real counts.

Historical reconstructed pools must be labelled `reconstructed`.

## Finish

Verify candidate pool -> score -> rank -> selection consistency.

Run the validation required by `AGENTS.md`.

Report collection diagnostics, selected highlights, source diversity, validation,
and remaining coverage gaps.
