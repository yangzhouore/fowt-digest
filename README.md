# FOWT Research Digest

FOWT Research Digest is a project for collecting, processing, and presenting research related to Floating Offshore Wind Turbines (FOWT).

The repository currently contains two independent parts:

- `pipeline/`: a completed deterministic MVP pipeline for producing weekly digest data products.
- `web/`: a static Next.js website prototype that still uses fictional local mock data.

The Python pipeline and the website are intentionally separate. The pipeline does not publish to the website yet, and the website does not read pipeline run outputs yet.

## Current Repository Status

- Active branch: `main`
- MVP pipeline milestone: complete through M3H Pipeline Orchestration
- Completed pipeline milestones: M3A through M3H
- Latest verified pipeline validation: `193 passed, 0 failed`
- Current next phase: Website MVP

MVP v1.0 delivers the deterministic pipeline data flow. It does not include website integration, database storage, AI writing, AI review, scheduling, or automated publication.

## Completed MVP Capabilities

The completed deterministic MVP pipeline includes:

- Deterministic run, candidate, and paper ID helpers
- Run-directory creation and supported JSON output writing
- OpenAlex query generation
- OpenAlex HTTP client with timeout and retry handling
- OpenAlex collection with cursor pagination and raw response preservation
- Metadata normalisation from raw OpenAlex works
- `candidates.json` and `normalised.json` writing
- Deterministic deduplication
- `deduplicated_papers.json` and `deduplication_result.json` writing
- Rule-based FOWT relevance classification
- `classified_papers.json` and `classification_result.json` writing
- Deterministic ranking and selection
- `ranked_papers.json` and `ranking_result.json` writing
- Weekly digest assembly
- `weekly_digest.json` and `weekly_digest_result.json` writing
- Thin pipeline orchestration across accepted file contracts

## Pipeline Architecture

The implemented pipeline sequence is:

```text
Collection
-> Metadata normalisation
-> Deduplication
-> FOWT relevance classification
-> Ranking and selection
-> Weekly digest assembly
-> Pipeline orchestration
```

Each stage validates its input contract and does not silently repair invalid upstream data. Stage outputs are local JSON files written under a run directory such as:

```text
pipeline/data/runs/<runId>/
```

The orchestrator coordinates the accepted stage APIs and reads each documented output file before passing it to the next stage. It does not add new JSON products, retry failed stages, repair intermediate payloads, or change stage behavior.

## Repository Structure

```text
fowt-digest/
  AGENTS.md                         # Contributor and engineering rules
  DIRECTIONS.md                     # Project direction notes
  LESSONS_LEARNED.md                # Project workflow and engineering lessons
  PROJECT_HANDOVER.md               # Continuity notes for future sessions
  PROJECT_STATUS.md                 # Current milestone and repository status
  README.md
  docs/
    COLLECTOR_IMPLEMENTATION_CONTRACT.md
    PIPELINE_ARCHITECTURE.md
    PIPELINE_DATA_MODEL.md
    RELEASE_NOTES_v1.0.md
    architecture.md
    design.md
    MILESTONES.md
    product.md
  pipeline/
    ids.py
    run_storage.py
    openalex_query.py
    openalex_client.py
    openalex_collector.py
    normaliser.py
    deduplicator.py
    relevance_classifier.py
    ranker.py
    weekly_digest.py
    orchestrator.py
    tests/
  web/
    app/
    data/
    package.json
```

## How To Run The Pipeline Locally

The pipeline uses the Python standard library for runtime code. Tests require `pytest`.

Run the full pipeline through the orchestrator from the repository root:

```powershell
python -c "from datetime import date; from pipeline.orchestrator import run_weekly_pipeline; print(run_weekly_pipeline(from_publication_date=date(2026, 7, 13), to_publication_date=date(2026, 7, 19), discovery_date='2026-07-20T00:00:00Z', classified_at='2026-07-20T00:00:00Z', selection_limit=10, week_start='2026-07-13', week_end='2026-07-19', generated_at='2026-07-20T00:00:00Z'))"
```

That command performs real OpenAlex HTTP requests through the standard-library client. For tests and development, inject mocked `fetch_json` and `sleep` functions into `run_weekly_pipeline` to avoid network access and real waiting.

Pipeline run outputs are written under:

```text
pipeline/data/runs/<runId>/
```

## Test Command

Run all pipeline tests from the repository root:

```powershell
python -m pytest pipeline/tests
```

Latest verified result:

```text
193 passed, 0 failed
```

## Website Prototype

The website under `web/` is a static Next.js prototype using fictional mock data. It includes homepage, weekly edition, paper detail, archive, methodology, and about pages.

Run the website locally:

```powershell
cd web
npm install
npm run dev
```

Run website checks:

```powershell
cd web
npm run lint
npm run build
```

The website is not connected to the pipeline in MVP v1.0.

## Current Milestone

MVP v1.0 pipeline work is complete. M3A through M3H have been implemented, accepted, merged to `main`, and documented.

## Next Milestone

Website MVP.

The next phase should focus on the public website experience and deployment path while keeping the pipeline and frontend boundaries explicit until integration is separately scoped.

## Known Limitations

MVP v1.0 intentionally does not include:

- Website integration with pipeline outputs
- Database storage
- AI writing
- AI review
- Scoring
- Automated publication
- Scheduling or cron
- Crossref or arXiv collection
- CI/CD workflow automation

## Engineering Philosophy

The project follows the rules in `AGENTS.md`: document before implementation, keep stages small and deterministic, validate input contracts, avoid speculative abstractions, and keep the frontend independent from pipeline internals until integration is explicitly scoped.
