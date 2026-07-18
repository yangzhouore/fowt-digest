# PROJECT STATUS

Last Updated: 2026-07-18

---

# Project

FOWT Research Digest is a weekly editorial website and separate Python pipeline
for curating research related to Floating Offshore Wind Turbines (FOWT).

The website should remain a simple editorial publication. The Python pipeline
should remain independent from the frontend.

---

# Current Git Status

Default Branch:

main

Current Branch:

feature/fowt-relevance-classification

Repository state:

M3E implementation is complete, accepted, and ready for Pull Request review.
The Pull Request has not been merged.

---

# Current Milestone

Milestone:

M3E - Deterministic FOWT Relevance Classification

Status:

Accepted

Current slice:

M3E deterministic relevance classification acceptance passed

Completed:

- M3A - Pipeline Foundation
- M3B - OpenAlex Collector
- M3C-1 - Raw OpenAlex Extraction and Abstract Reconstruction
- M3C-2 - PaperCandidate Mapping
- M3C-3 - PaperMetadata Mapping
- M3C-4 - Normalisation Output Writing
- M3C - Metadata Normalisation
- M3D - Deterministic Deduplication
- M3E - Deterministic FOWT Relevance Classification

Latest verified validation:

- Command: `python -m pytest pipeline/tests/test_relevance_classifier.py`
- Result: 16 passed, 0 failed
- Command: `python -m pytest pipeline/tests`
- Result: 146 passed, 0 failed
- Command: `git diff --check`
- Result: passed

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
- PaperMetadata mapping with deterministic `paperId`
- `candidates.json` writing
- `normalised.json` writing
- normalisation rejection handling
- raw provenance preservation in candidates, metadata, and rejection records
- deterministic deduplication
- connected-component duplicate grouping
- DOI, OpenAlex ID, and title/date exact-match rules
- canonical record selection
- deduplicated metadata merging
- `deduplicated_papers.json` writing
- `deduplication_result.json` writing
- rollback protection for partial deduplication output writes
- deterministic FOWT relevance classification
- three-state relevance labels: `Relevant`, `Possibly Relevant`, `Not Relevant`
- `classified_papers.json` writing
- `classification_result.json` aggregate summary writing
- rollback protection for partial classification output writes

Not yet implemented:

- ranking and selection
- scoring
- AI workflow
- website integration
- database

---

# Immediate Next Task

Open a Pull Request for M3E after release-preparation review.

Next recommended milestone after merge:

M3F - Ranking & Selection

Do not implement yet:

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
- `pipeline/deduplicator.py`
- `pipeline/relevance_classifier.py`

Implemented pipeline tests:

- `pipeline/tests/test_ids.py`
- `pipeline/tests/test_run_storage.py`
- `pipeline/tests/test_openalex_query.py`
- `pipeline/tests/test_openalex_client.py`
- `pipeline/tests/test_openalex_collector.py`
- `pipeline/tests/test_normaliser.py`
- `pipeline/tests/test_deduplicator.py`
- `pipeline/tests/test_relevance_classifier.py`

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

- M3E has passed acceptance and is ready for Pull Request review, but has not been merged.
- Ranking, selection, scoring, AI writing, and AI review do not exist.
- The website uses fictional mock data and is not connected to the pipeline.

---

# Development Roadmap

Completed pipeline milestones:

- M3A - Pipeline Foundation
- M3B - OpenAlex Collector
- M3C - Metadata Normalisation
- M3D - Deterministic Deduplication
- M3E - Deterministic FOWT Relevance Classification

Next recommended pipeline milestone:

- M3F - Ranking & Selection

Remaining pipeline work after current milestone:

- open and review the M3E Pull Request
- merge M3E only after PR review passes
- keep scoring, AI writing, and website integration out of scope until separately accepted

Future excluded work until separately scoped:

- Crossref integration
- arXiv integration
- scoring
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
- M3E relevance classification is deterministic and rule-based only.