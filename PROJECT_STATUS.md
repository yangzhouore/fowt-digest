# PROJECT STATUS

Last Updated: 2026-07-16

---

# Project

FOWT Research Digest is a weekly editorial website and separate Python pipeline
for curating research related to Floating Offshore Wind Turbines (FOWT).

The website should remain a simple editorial publication. The Python pipeline
should remain independent from the frontend.

---

# Current Git Status

Default Branch:

master

Current Development Branch:

feature/metadata-normalisation

---

# Current Milestone

Milestone:

M3C - Metadata Normalisation

Status:

In Progress

Current slice:

M3C-3 - PaperMetadata Mapping

Completed:

- M3A - Pipeline Foundation
- M3B - OpenAlex Collector
- M3C-1 - Raw OpenAlex Extraction and Abstract Reconstruction
- M3C-2 - PaperCandidate Mapping

Latest verified validation:

- Command: `python -m pytest pipeline/tests`
- Result: 78 passed, 0 failed

---

# Current Pipeline Status

Implemented:

- deterministic run ID helper
- deterministic candidate ID helper
- deterministic paper ID helper
- DOI normalisation
- title normalisation
- run directory creation
- contract JSON file writing
- OpenAlex query builder
- OpenAlex HTTP client
- OpenAlex collector orchestration
- cursor pagination
- run-wide 200-record cap
- raw OpenAlex response storage
- raw OpenAlex work extraction from successful pages
- abstract reconstruction from `abstract_inverted_index`
- PaperCandidate mapping with deterministic `candidateId`

Not yet implemented:

- PaperMetadata mapping
- candidates.json writing
- normalised.json writing
- deduplication
- scoring
- AI workflow
- website integration
- database

---

# Immediate Next Task

M3C-3 - PaperMetadata Mapping

Map extracted OpenAlex work and PaperCandidate data into the documented
`PaperMetadata` structure in `docs/PIPELINE_DATA_MODEL.md`.

Do not implement yet:

- output-file writing
- deduplication
- scoring
- AI workflow
- website integration
- database

---

# Current Repository Snapshot

Implemented pipeline modules:

- `pipeline/ids.py`
- `pipeline/run_storage.py`
- `pipeline/openalex_query.py`
- `pipeline/openalex_client.py`
- `pipeline/openalex_collector.py`
- `pipeline/normaliser.py`

Implemented pipeline tests:

- `pipeline/tests/test_ids.py`
- `pipeline/tests/test_run_storage.py`
- `pipeline/tests/test_openalex_query.py`
- `pipeline/tests/test_openalex_client.py`
- `pipeline/tests/test_openalex_collector.py`
- `pipeline/tests/test_normaliser.py`

Website status:

- static Next.js MVP exists under `web/`
- website deployment readiness work is complete
- website has not been deployed from this repository state
- website still uses fictional local mock data
- no pipeline integration exists

---

# Architecture Direction

Current repository layout:

```text
docs/
pipeline/
web/
```

Architecture rules:

- keep the Python pipeline independent from the website
- do not add FastAPI before it is needed
- do not add a database before local JSON is insufficient
- do not add AI workflow modules before their milestone
- do not integrate pipeline output into the website until explicitly scoped

---

# Known Limitations

- M3C is not complete.
- PaperMetadata mapping has not started.
- `candidates.json` and `normalised.json` are not written yet.
- Deduplication does not exist.
- AI classification, scoring, writing, and review do not exist.
- The website uses fictional mock data and is not connected to the pipeline.
- `PROJECT_STATUS.md` should be updated again after M3C-3 acceptance.

---

# Development Roadmap

Completed pipeline milestones:

- M3A - Pipeline Foundation
- M3B - OpenAlex Collector

Current pipeline milestone:

- M3C - Metadata Normalisation

Remaining pipeline work after current slice:

- finish PaperMetadata mapping
- implement candidate and normalised output writing
- perform final M3C acceptance
- then move to deduplication only when explicitly requested

Future excluded work until separately scoped:

- Crossref integration
- arXiv integration
- scoring
- selection
- AI writing
- AI review
- database
- frontend integration
- automatic publication

---

# Important Decisions

- Frontend and pipeline remain separated.
- Use local JSON files for the first pipeline prototype.
- Keep modules small and explicit.
- Avoid service, manager, repository, factory, or framework layers.
- Use Python standard library only unless a milestone explicitly changes that.
- Never invent paper metadata or research findings.
