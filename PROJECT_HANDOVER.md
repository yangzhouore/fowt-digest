# PROJECT HANDOVER

Last Updated: 2026-07-18

## 1. Project Purpose

FOWT Research Digest is an editorial website and separate Python pipeline for
collecting and preparing weekly research digests about Floating Offshore Wind
Turbines.

The website is a static public MVP using fictional mock data. The pipeline is
being built separately to collect, normalise, and deduplicate real research
metadata later.

## 2. Current Branch

`feature/deduplication`

## 3. Current Milestone and Slice

Milestone:

M3D - Deterministic Deduplication

Current slice:

M3D accepted; documentation updated before commit.

Latest accepted implementation:

M3D deterministic deduplication in `pipeline/deduplicator.py` and
`pipeline/tests/test_deduplicator.py`.

Latest validation:

- `python -m pytest pipeline/tests/test_deduplicator.py` - 20 passed, 0 failed
- `python -m pytest pipeline/tests` - 130 passed, 0 failed

The next milestone is M3E - FOWT Relevance Classification. It has not started.

## 4. Completed Milestones

- M3A - Pipeline Foundation
- M3B - OpenAlex Collector
- M3C - Metadata Normalisation
- M3C-1 - Raw OpenAlex Extraction and Abstract Reconstruction
- M3C-2 - PaperCandidate Mapping
- M3C-3 - PaperMetadata Mapping
- M3C-4 - Normalisation Output Writing
- M3D - Deterministic Deduplication
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
```

The pipeline is not connected to the website.

## 6. Important Design Decisions

- Keep `web/` and `pipeline/` separate.
- Do not add FastAPI, a database, a CMS, or an API until explicitly scoped.
- Use local JSON files for the first pipeline prototype.
- Use Python standard library only for the pipeline unless a milestone changes it.
- Keep implementation explicit and small.
- Do not create service, manager, repository, factory, schema, or framework layers.
- Do not invent missing paper metadata.
- Preserve source provenance from raw OpenAlex output through normalisation and deduplication.
- Deduplication uses deterministic exact rules only; fuzzy matching is not implemented.

## 7. Current Module Snapshot

Pipeline modules:

- `pipeline/ids.py`: deterministic run, candidate, and paper ID helpers plus DOI/title normalisation.
- `pipeline/run_storage.py`: run directory and JSON writing helpers.
- `pipeline/openalex_query.py`: deterministic OpenAlex query URL generation.
- `pipeline/openalex_client.py`: standard-library HTTP client with timeout/retry handling.
- `pipeline/openalex_collector.py`: collector orchestration, pagination, raw output writing.
- `pipeline/normaliser.py`: raw successful work extraction, abstract reconstruction, PaperCandidate mapping, PaperMetadata mapping, and normalisation output writing.
- `pipeline/deduplicator.py`: deterministic connected-component deduplication, deduplicated metadata output, deduplication report output, and local rollback for partial write failures.

Pipeline tests:

- `pipeline/tests/test_ids.py`
- `pipeline/tests/test_run_storage.py`
- `pipeline/tests/test_openalex_query.py`
- `pipeline/tests/test_openalex_client.py`
- `pipeline/tests/test_openalex_collector.py`
- `pipeline/tests/test_normaliser.py`
- `pipeline/tests/test_deduplicator.py`

## 8. Latest Test Status

Command:

```powershell
python -m pytest pipeline/tests/test_deduplicator.py
```

Latest result:

```text
20 passed, 0 failed
```

Command:

```powershell
python -m pytest pipeline/tests
```

Latest result:

```text
130 passed, 0 failed
```

## 9. Known Limitations

- M3D has passed acceptance but has not yet been committed in this working tree.
- FOWT relevance classification does not exist.
- Scoring, selection, AI writing, and AI review do not exist.
- No database exists.
- The website is not integrated with the pipeline.
- The website still uses fictional local mock data.

## 10. Exact Next Task

Prepare M3E - FOWT Relevance Classification

Start with documentation and design. Define the minimum deterministic or AI-assisted relevance contract before implementation.

## 11. What Must Not Be Implemented Yet

Do not implement:

- scoring
- selection
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
10. `pipeline/tests/test_deduplicator.py`
11. Existing pipeline tests relevant to the current task

## 13. Resume Instructions

To resume work:

1. Confirm the branch is `feature/deduplication`.
2. Run `git status` and ensure there are no unexpected changes.
3. If M3D files are still uncommitted, commit the accepted M3D implementation and documentation before starting M3E.
4. Run `python -m pytest pipeline/tests`.
5. Read the relevance-classification sections in `docs/PIPELINE_DATA_MODEL.md` and `docs/PIPELINE_ARCHITECTURE.md`.
6. Do not start scoring, selection, AI writing, database, or website integration until M3E is explicitly scoped.
