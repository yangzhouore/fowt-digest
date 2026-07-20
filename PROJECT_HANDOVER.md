# PROJECT HANDOVER

Last Updated: 2026-07-19

## 1. Project Purpose

FOWT Research Digest is an editorial website and separate Python pipeline for
collecting and preparing weekly research digests about Floating Offshore Wind
Turbines.

The website is a static public MVP using fictional mock data. The pipeline is
being built separately to collect, normalise, deduplicate, classify, rank,
select, and assemble real research metadata later.

## 2. Current Branch

`main`

## 3. Current Milestone and Slice

Milestone:

M3G - Weekly Digest Assembly

Current slice:

M3G is complete and acceptance review passed. It was committed in `e76e0ca feat: add weekly digest assembly` on `main` and pushed to `origin/main`.

Latest validation:

- `python -m pytest pipeline/tests/test_weekly_digest.py` - 15 passed, 0 failed
- `python -m pytest pipeline/tests` - 176 passed, 0 failed
- `git diff --check` - passed

The next recommended milestone is M3H - Pipeline Orchestration. It has not started. The M3G post-commit readiness check found `main` synchronized with `origin/main` and the working tree clean before this documentation-only cleanup.

## 4. Completed Milestones

- M3A - Pipeline Foundation
- M3B - OpenAlex Collector
- M3C - Metadata Normalisation
- M3C-1 - Raw OpenAlex Extraction and Abstract Reconstruction
- M3C-2 - PaperCandidate Mapping
- M3C-3 - PaperMetadata Mapping
- M3C-4 - Normalisation Output Writing
- M3D - Deterministic Deduplication
- M3E - Deterministic FOWT Relevance Classification
- M3F - Deterministic Ranking & Selection
- M3G - Weekly Digest Assembly
- Web MVP deployment readiness is complete, but deployment has not been performed

## 5. Current Architecture and Data Flow

Repository layout:

```text
docs/      design, architecture, data contracts, implementation contracts
pipeline/  Python pipeline modules and tests
web/       static Next.js website using fictional local mock data
```

Current pipeline flow:

```text
OpenAlex query builder
-> OpenAlex HTTP client
-> OpenAlex collector
-> raw_openalex.json and run_summary.json
-> normaliser extraction helpers
-> PaperCandidate mapping
-> PaperMetadata mapping
-> candidates.json and normalised.json writing
-> deterministic deduplication
-> deduplicated_papers.json and deduplication_result.json writing
-> deterministic FOWT relevance classification
-> classified_papers.json and classification_result.json writing
-> deterministic ranking and selection
-> ranked_papers.json and ranking_result.json writing
-> weekly digest assembly
-> weekly_digest.json and weekly_digest_result.json writing
```

The pipeline is not connected to the website.

## 6. Important Design Decisions

- Keep `web/` and `pipeline/` separate.
- Do not add FastAPI, a database, a CMS, or an API until explicitly scoped.
- Use local JSON files for the first pipeline prototype.
- Use Python standard library only for the pipeline unless a milestone changes it.
- Keep implementation explicit and small.
- Do not create service, manager, repository, factory, schema, or framework layers.
- Each pipeline stage validates its input contract and never silently repairs it.
- Do not invent missing paper metadata.
- Preserve source provenance from raw OpenAlex output through normalisation and deduplication.
- Deduplication uses deterministic exact rules only; fuzzy matching is not implemented.
- M3E classification uses deterministic keyword rules only; AI, embeddings, fuzzy matching, semantic search, ranking, and scoring are not implemented.
- M3F ranking and selection uses deterministic classification/date/paper ID ordering only; citation counts, scores, weights, AI, diversity balancing, digest generation, and website behavior are not implemented.
- M3G weekly digest assembly copies selected ranked records only; it does not inspect relevance classification, sort, re-rank, re-select, add summaries, add editorial content, generate Markdown or HTML, integrate with the website, use a database, or implement the broader WeeklyEdition model.

## 7. Current Module Snapshot

Pipeline modules:

- `pipeline/ids.py`: deterministic run, candidate, and paper ID helpers plus DOI/title normalisation.
- `pipeline/run_storage.py`: run directory and JSON writing helpers.
- `pipeline/openalex_query.py`: deterministic OpenAlex query URL generation.
- `pipeline/openalex_client.py`: standard-library HTTP client with timeout/retry handling.
- `pipeline/openalex_collector.py`: collector orchestration, pagination, raw output writing.
- `pipeline/normaliser.py`: raw successful work extraction, abstract reconstruction, PaperCandidate mapping, PaperMetadata mapping, and normalisation output writing.
- `pipeline/deduplicator.py`: deterministic connected-component deduplication, deduplicated metadata output, deduplication report output, and local rollback for partial write failures.
- `pipeline/relevance_classifier.py`: deterministic three-state FOWT relevance classification, classified output writing, aggregate classification reporting, and local rollback for partial write failures.
- `pipeline/ranker.py`: deterministic ranking and selection, ranked output writing, aggregate ranking reporting, and local rollback for partial write failures.
- `pipeline/weekly_digest.py`: deterministic weekly digest assembly, selected ranked paper output writing, aggregate digest reporting, and local rollback for partial write failures.

Pipeline tests:

- `pipeline/tests/test_ids.py`
- `pipeline/tests/test_run_storage.py`
- `pipeline/tests/test_openalex_query.py`
- `pipeline/tests/test_openalex_client.py`
- `pipeline/tests/test_openalex_collector.py`
- `pipeline/tests/test_normaliser.py`
- `pipeline/tests/test_deduplicator.py`
- `pipeline/tests/test_relevance_classifier.py`
- `pipeline/tests/test_ranker.py`
- `pipeline/tests/test_weekly_digest.py`

## 8. Latest Test Status

Command:

```powershell
python -m pytest pipeline/tests
```

Latest result:

```text
176 passed, 0 failed
```

## 9. Known Limitations

- M3G Weekly Digest Assembly is complete and acceptance passed.
- Pipeline orchestration does not exist.
- Scoring, AI writing, and AI review do not exist.
- No database exists.
- The website is not integrated with the pipeline.
- The website still uses fictional local mock data.

## 10. Exact Next Task

Prepare M3H - Pipeline Orchestration.

## 11. What Must Not Be Implemented Yet

Do not implement:

- scoring
- AI writing
- AI review
- Crossref
- arXiv
- website integration
- database
- API routes
- FastAPI
- MCP

## 12. Recommended Reading Order

1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_HANDOVER.md`
4. `LESSONS_LEARNED.md`
5. `docs/PIPELINE_DATA_MODEL.md`
6. `docs/PIPELINE_ARCHITECTURE.md`
7. `pipeline/ids.py`
8. `pipeline/normaliser.py`
9. `pipeline/deduplicator.py`
10. `pipeline/relevance_classifier.py`
11. `pipeline/ranker.py`
12. `pipeline/weekly_digest.py`
13. Existing pipeline tests relevant to the current task

## 13. Resume Instructions

To resume work:

1. Confirm the branch is `main`.
2. Run `git status` and ensure there are no unexpected changes.
3. Run `python -m pytest pipeline/tests`.
4. Prepare M3H - Pipeline Orchestration.
5. Do not start scoring, AI writing, database, or website integration until separately scoped.
