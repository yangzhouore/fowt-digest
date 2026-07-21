# PROJECT STATUS

Last Updated: 2026-07-20

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

feature/website-ux-polish

Repository state:

M3H Pipeline Orchestration is complete and merged to `main` in merge commit
`96c7847`. Acceptance review passed. The deterministic MVP pipeline is
complete.

---

# Current Milestone

Milestone:

Website MVP

Status:

In Progress

Current slice:

Website UX Polish design phase complete

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
- M3F - Deterministic Ranking & Selection
- M3G - Weekly Digest Assembly
- M3H - Pipeline Orchestration

Latest verified validation:

- Command: `python -m pytest pipeline/tests/test_orchestrator.py`
- Result: 17 passed, 0 failed
- Command: `python -m pytest pipeline/tests`
- Result: 193 passed, 0 failed
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
- deterministic ranking and selection
- continuous global ranks for all classified records
- selection limited to `Relevant` and `Possibly Relevant` records
- `ranked_papers.json` writing
- `ranking_result.json` aggregate summary writing
- rollback protection for partial ranking output writes
- deterministic weekly digest assembly
- ranked input contract validation without repair
- `weekly_digest.json` writing
- `weekly_digest_result.json` aggregate summary writing
- rollback protection for partial weekly digest output writes
- deterministic pipeline orchestration
- file-contract handoff between accepted stages
- `pipeline/orchestrator.py`
- `pipeline/tests/test_orchestrator.py`

Not yet implemented:

- scoring
- AI workflow
- UX Polish implementation
- database

---

# Immediate Next Task

Perform UX-01 Homepage Entry and Reader Framing design review.

Next recommended milestone:

Website UX Polish

Do not implement yet:

- scoring
- AI workflow
- UX Polish implementation
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
- `pipeline/ranker.py`
- `pipeline/weekly_digest.py`
- `pipeline/orchestrator.py`

Implemented pipeline tests:

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
- `pipeline/tests/test_orchestrator.py`

Website status:

- Website MVP Feature 01 displays one real static pipeline digest on the homepage and weekly page.
- Website MVP Feature 02 displays 6 real static paper detail pages from the same digest.
- Website MVP Feature 03 displays one real archive entry from the same digest.
- Homepage -> Weekly -> Paper Detail reading workflow is complete.
- Archive -> Weekly browsing workflow is complete.
- Website UX Polish design phase is complete.
- `docs/PRODUCT_VISION.md` and `docs/UX_ROADMAP.md` are the UX Polish design baseline.
- No UX implementation feature has started.
- Source run: `run_20260720_090000_openalex`.
- `web/data/weekly_digest.json` contains 6 selected papers from that run.
- `npm.cmd run lint` and `npm.cmd run build` pass.
- static Next.js MVP exists under `web/`
- website deployment readiness work is complete
- website has not been deployed from this repository state
- About and Methodology still contain prototype/mock-data wording until separately scoped.
- the website uses a static copied pipeline digest and does not run the pipeline

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
- integrate pipeline output into the website only through explicitly scoped Website MVP features

---

# Known Limitations

- M3H Pipeline Orchestration is complete and acceptance passed.
- The deterministic MVP pipeline is complete through orchestration and weekly digest assembly.
- Scoring, AI writing, and AI review do not exist.
- Homepage, Weekly, Paper Detail, and Archive use one real static pipeline digest. About and Methodology still include prototype/mock-data wording until separately scoped. UX Polish implementation has not started.

---

# Development Roadmap

Completed pipeline milestones:

- M3A - Pipeline Foundation
- M3B - OpenAlex Collector
- M3C - Metadata Normalisation
- M3D - Deterministic Deduplication
- M3E - Deterministic FOWT Relevance Classification
- M3F - Deterministic Ranking & Selection
- M3G - Weekly Digest Assembly
- M3H - Pipeline Orchestration

Next recommended step:

- Website MVP

Future excluded work until separately scoped:

- Crossref integration
- arXiv integration
- scoring
- AI writing
- AI review
- database
- additional frontend integration beyond scoped Website MVP features
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
- M3F ranking and selection is deterministic and uses no scores, weights, AI, citation counts, diversity balancing, digest generation, or website behavior.
- M3G weekly digest assembly copies selected ranked records only and does not add AI, summaries, editorial content, Markdown, HTML, website integration, or the broader WeeklyEdition model.
- M3H pipeline orchestration sequences accepted stages only and does not alter stage behavior, retry, repair, or create new JSON products.
