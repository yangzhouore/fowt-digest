# PROJECT HANDOVER

Last Updated: 2026-07-16

## 1. Project Purpose

FOWT Research Digest is an editorial website and separate Python pipeline for
collecting and preparing weekly research digests about Floating Offshore Wind
Turbines.

The website is a static public MVP using fictional mock data. The pipeline is
being built separately to collect and normalise real research metadata later.

## 2. Current Branch

`feature/metadata-normalisation`

## 3. Current Milestone and Slice

Milestone:

M3C - Metadata Normalisation

Current slice:

M3C-3 - PaperMetadata Mapping

M3C-3 has not started. The next step is to map extracted OpenAlex work and
PaperCandidate data into the documented `PaperMetadata` structure.

## 4. Completed Milestones

- M3A - Pipeline Foundation
- M3B - OpenAlex Collector
- M3C-1 - Raw OpenAlex Extraction and Abstract Reconstruction
- M3C-2 - PaperCandidate Mapping
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
-> PaperMetadata mapping (next)
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
- Preserve source provenance from raw OpenAlex output.

## 7. Current Module Snapshot

Pipeline modules:

- `pipeline/ids.py`: deterministic run, candidate, and paper ID helpers.
- `pipeline/run_storage.py`: run directory and JSON writing helpers.
- `pipeline/openalex_query.py`: deterministic OpenAlex query URL generation.
- `pipeline/openalex_client.py`: standard-library HTTP client with timeout/retry handling.
- `pipeline/openalex_collector.py`: collector orchestration, pagination, raw output writing.
- `pipeline/normaliser.py`: raw successful work extraction, abstract reconstruction, and PaperCandidate mapping.

Pipeline tests:

- `pipeline/tests/test_ids.py`
- `pipeline/tests/test_run_storage.py`
- `pipeline/tests/test_openalex_query.py`
- `pipeline/tests/test_openalex_client.py`
- `pipeline/tests/test_openalex_collector.py`
- `pipeline/tests/test_normaliser.py`

## 8. Latest Test Status

Command:

```powershell
python -m pytest pipeline/tests
```

Latest result:

```text
78 passed, 0 failed
```

## 9. Known Limitations

- M3C is not complete.
- PaperMetadata mapping has not started.
- `candidates.json` is not written yet.
- `normalised.json` is not written yet.
- Deduplication does not exist.
- Scoring, selection, AI writing, and AI review do not exist.
- No database exists.
- The website is not integrated with the pipeline.
- The website still uses fictional local mock data.

## 10. Exact Next Task

M3C-3 - PaperMetadata Mapping

Implement a focused normaliser function that maps extracted OpenAlex work and
PaperCandidate data into the `PaperMetadata` shape defined in
`docs/PIPELINE_DATA_MODEL.md`.

This should include only documented PaperMetadata fields and missing-field rules.
Do not write output files in this slice unless the next task explicitly changes
scope.

## 11. What Must Not Be Implemented Yet

Do not implement:

- output-file writing
- deduplication
- Crossref
- arXiv
- scoring
- selection
- AI workflow
- website integration
- database
- API routes
- FastAPI
- MCP

## 12. Recommended Reading Order

1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_HANDOVER.md`
4. `docs/PIPELINE_DATA_MODEL.md`
5. `docs/COLLECTOR_IMPLEMENTATION_CONTRACT.md`
6. `pipeline/ids.py`
7. `pipeline/normaliser.py`
8. `pipeline/tests/test_normaliser.py`
9. Existing pipeline tests relevant to the current task

## 13. Resume Instructions

To resume work:

1. Confirm the branch is `feature/metadata-normalisation`.
2. Run `git status` and ensure there are no unexpected changes.
3. Run `python -m pytest pipeline/tests`.
4. Read the `PaperMetadata` section and missing-field table in `docs/PIPELINE_DATA_MODEL.md`.
5. Implement only M3C-3 PaperMetadata mapping in `pipeline/normaliser.py` and `pipeline/tests/test_normaliser.py` unless the user gives a different scope.
6. Do not update output writing, deduplication, AI, database, or website integration during M3C-3.
