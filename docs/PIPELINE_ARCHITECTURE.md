# Pipeline Architecture

## 1. Purpose

This document defines the intended high-level architecture for the future FOWT Research Digest paper processing pipeline. The pipeline will move research from source discovery to human-approved publication data while keeping the website a simple presentation layer.

The pipeline does not exist yet. This is a design document for future implementation.

## 2. Scope

The planned workflow is:

```text
Paper sources
  -> Collection
  -> Metadata normalisation
  -> Deduplication
  -> FOWT relevance classification
  -> Scoring
  -> Weekly selection
  -> Editorial writing
  -> Factual review
  -> Human approval
  -> Publication data
```

The pipeline should be orchestrated by Python. The first prototype should run locally, read and write structured JSON files, and produce publication-ready data for the Next.js website to consume.

## 3. Non-goals

The first pipeline design does not include:

- FastAPI or another web API;
- a database;
- browser scraping as the default collection method;
- autonomous agents;
- CrewAI, AutoGen, LangGraph, or other orchestration frameworks;
- direct frontend orchestration of pipeline tasks;
- automatic publication without human approval;
- production ingestion guarantees;
- user accounts, authentication, or admin dashboards.

## 4. High-level workflow

1. Paper sources provide candidate records from OpenAlex, Crossref, arXiv, and selected conference or publication APIs where available.
2. Collection retrieves raw metadata and stores source-specific records without trying to interpret them too early.
3. Metadata normalisation converts raw records into a consistent internal format.
4. Deduplication groups likely duplicate records across sources.
5. FOWT relevance classification estimates whether each record is directly relevant to floating offshore wind turbines.
6. Scoring evaluates relevant records using explicit editorial dimensions.
7. Weekly selection chooses a balanced set of papers using score, topic diversity, and engineering significance.
8. Editorial writing drafts structured summaries while distinguishing abstract-only analysis from full-text analysis.
9. Factual review checks unsupported claims, incorrect numbers, missing limitations, and metadata inconsistencies.
10. Human approval accepts, edits, rejects, or holds drafted entries.
11. Publication data exports approved weekly editions and paper records as structured JSON for the website.

## 5. Module responsibilities

### Source collectors

Receives: source configuration, date window, search terms, and source API credentials if needed.

Produces: raw source records grouped by source and collection run.

Needs AI: no.

Can run independently: yes, per source.

Failure behaviour: record the failed source, HTTP status or exception, retry transient failures with backoff, and allow the run to continue with successful sources.

### Metadata normaliser

Receives: raw source records from collectors.

Produces: normalised candidate records with consistent fields such as title, authors, source, publication date, DOI or source URL where available, abstract, source name, and paper type.

Needs AI: no for field mapping; possibly later for difficult source-specific cleanup, but not in the first prototype.

Can run independently: yes, once raw records exist.

Failure behaviour: quarantine malformed records with a reason instead of stopping the full run.

### Deduplicator

Receives: normalised candidate records.

Produces: deduplicated paper candidates with source provenance preserved.

Needs AI: no for the first version. Use deterministic matching on DOI, title normalisation, source URL, arXiv ID, and publication metadata.

Can run independently: yes.

Failure behaviour: keep uncertain duplicate groups for human or later review rather than deleting records.

### Relevance classifier

Receives: deduplicated candidates with title, abstract, source, paper type, and categories where available.

Produces: relevance decision, confidence, reason, and topic tags.

Needs AI: yes, where title and abstract require semantic judgement. Deterministic keyword filters can be used as a first pass, but should not be the only classifier.

Can run independently: yes, after deduplication.

Failure behaviour: mark records as `classification_pending` and exclude them from automatic selection until resolved.

### Scorer

Receives: relevant candidates, metadata, abstract or full text availability, topic tags, and classifier output.

Produces: scores and rationale for dimensions such as FOWT relevance, novelty, technical rigour, engineering value, evidence quality, and information completeness.

Needs AI: yes for semantic assessment and rationale. Deterministic code should calculate any mechanical fields.

Can run independently: yes, for each candidate.

Failure behaviour: mark scoring as incomplete and prevent the paper from being selected without manual override.

### Selector

Receives: scored candidates, weekly target size, topic tags, paper types, and editorial constraints.

Produces: selected weekly paper list plus rejected-but-relevant candidates.

Needs AI: optional. The first version should use deterministic ranking and diversity rules, with AI only if an editorial tie-break needs semantic reasoning.

Can run independently: yes, once scoring is complete.

Failure behaviour: produce a partial selection report and identify missing score or diversity inputs.

### Writer

Receives: selected papers, metadata, abstract, available full-text notes if legally accessible, scoring rationale, and analysis level.

Produces: draft editorial entries with summary, research problem, methodology, key findings, engineering relevance, limitations, and analysis level.

Needs AI: yes.

Can run independently: yes, per selected paper.

Failure behaviour: keep the paper selected but mark its draft as `writing_failed` or `draft_required`.

Important rule: the writer must clearly distinguish abstract-only analysis from full-text analysis. It must not imply full-paper review when only metadata or abstract text was available.

### Reviewer

Receives: draft editorial entries, source metadata, abstracts, available full-text notes, score rationale, and selected paper records.

Produces: review findings, required corrections, approval recommendation, and unresolved concerns.

Needs AI: yes, but as a reviewer/checker rather than a rewriter.

Can run independently: yes, per drafted entry.

Failure behaviour: block publication for the affected entry until review succeeds or a human explicitly overrides it.

Important rule: the reviewer must identify unsupported claims, incorrect numbers, missing limitations, metadata inconsistencies, and mismatches between evidence level and editorial wording. It should not simply rewrite content.

### Publisher/exporter

Receives: human-approved entries and edition metadata.

Produces: publication JSON consumed by the website.

Needs AI: no.

Can run independently: yes, after approval.

Failure behaviour: do not overwrite the last known-good publication output unless the new export validates successfully.

### Orchestrator

Receives: run configuration, date range, source list, output paths, and pipeline stage options.

Produces: a run directory containing stage outputs, logs, review artifacts, approval state, and final publication data.

Needs AI: no. It coordinates deterministic code and calls AI-assisted modules through explicit, code-controlled sequencing.

Can run independently: yes, as the pipeline entry point.

Failure behaviour: stop at defined boundaries, write a clear run status, and support rerunning from the last valid stage where practical.

## 6. Deterministic steps versus AI-assisted steps

Deterministic Python should handle:

- source API requests;
- response persistence;
- metadata field mapping;
- date filtering;
- duplicate detection using stable identifiers and normalised strings;
- file writing;
- run logging;
- publication export;
- validation of required fields once schemas are defined.

AI-assisted steps should be limited to cases requiring semantic judgement or writing:

- FOWT relevance classification when keyword rules are insufficient;
- scoring rationale;
- topic interpretation;
- editorial summaries;
- factual and consistency review.

AI outputs should be treated as draft or advisory data until reviewed by deterministic checks and human approval.

## 7. Inputs and outputs of each stage

| Stage | Input | Output |
| --- | --- | --- |
| Collection | Date range, source config, query terms | Raw source records |
| Metadata normalisation | Raw source records | Normalised candidate records |
| Deduplication | Normalised records | Deduplicated candidate records with provenance |
| Relevance classification | Deduplicated candidates | Relevance labels, confidence, reasons, topic tags |
| Scoring | Relevant candidates and evidence text | Score dimensions and rationale |
| Weekly selection | Scored candidates and diversity rules | Selected papers and selection report |
| Editorial writing | Selected papers and evidence | Draft editorial entries |
| Factual review | Draft entries and source evidence | Review findings and required corrections |
| Human approval | Drafts and review findings | Approved, rejected, or held entries |
| Publication export | Approved entries and edition metadata | Website-ready JSON publication data |

## 8. Failure and retry strategy

Failures should be explicit and recoverable where possible.

- Collection should retry transient API failures but not hide source outages.
- Normalisation should quarantine malformed records.
- Deduplication should preserve uncertain matches rather than deleting records.
- Classification and scoring failures should mark records as pending or incomplete.
- Writing failures should not remove selected papers from the run.
- Review failures should block publication for affected entries.
- Export should write to a temporary output first, validate required fields, then replace publication data only after success.

Each run should keep enough intermediate files to audit how a paper moved through the pipeline.

## 9. Human approval boundary

Human approval is the publication boundary. No paper entry should become publication data until a human has reviewed:

- metadata accuracy;
- evidence availability;
- score rationale;
- editorial summary;
- limitations;
- review findings;
- whether the analysis is abstract-only or full-text based.

The pipeline may prepare drafts and recommendations, but it must not publish autonomously.

## 10. Initial local-file architecture

The first prototype can use local files instead of a database:

```text
pipeline/
  runs/
    2026-08-09/
      01_raw/
      02_normalised/
      03_deduplicated/
      04_classified/
      05_scored/
      06_selected/
      07_drafts/
      08_reviewed/
      09_approved/
      10_publication/
```

The website should not read the pipeline run directory directly during development unless explicitly designed to do so. A later export step should copy or generate a stable publication data file for the website.

This keeps the frontend independent from collection, scoring, writing, and review logic.

## 11. Possible future evolution

The architecture can evolve safely if complexity justifies it:

- Add formal JSON schemas after the first stable data model is proven.
- Add persistent storage when local files become hard to query or audit.
- Add scheduled execution after manual runs are reliable.
- Add a small approval interface only if file-based review becomes inefficient.
- Add source-specific rate limiting and caching.
- Add full-text handling where access rights allow it.
- Add stronger evaluation of AI outputs against human review decisions.

FastAPI, databases, queues, or orchestration frameworks should remain later decisions, not defaults.

## 12. Open questions

- What date window defines a weekly edition: publication date, indexing date, or discovery date?
- What exact query strategy should be used for OpenAlex, Crossref, and arXiv?
- Which conferences and journals should be treated as selected sources?
- What is the minimum evidence required for scoring: title only, abstract, or full text?
- How should scoring dimensions be weighted?
- How should topic diversity be enforced in weekly selection?
- What is the final publication JSON shape consumed by the website?
- Where should human approval state be recorded in the first prototype?
- How should corrections from review feed back into scoring and writing?
- What standards should be used for logging, run IDs, and audit trails?

## 13. Recommended implementation order

1. Freeze a minimal publication data model for website consumption.
2. Define a minimal candidate paper record for pipeline internals.
3. Implement one deterministic collector, preferably OpenAlex first.
4. Add metadata normalisation for that source.
5. Add deterministic deduplication using identifiers and normalised titles.
6. Add a basic relevance classifier with explicit inputs and outputs.
7. Add scoring only after relevance classification is inspectable.
8. Add deterministic weekly selection using score and topic diversity.
9. Add AI-assisted writer output with strict analysis-level labels.
10. Add reviewer output focused on unsupported claims and metadata consistency.
11. Add a manual approval artifact.
12. Add publication export to website-ready JSON.

This order keeps the system useful at each step without introducing premature infrastructure.