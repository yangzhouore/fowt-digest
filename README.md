# FOWT Research Digest

FOWT Research Digest is a deterministic research digest for Floating Offshore
Wind Turbines. It has two deliberately separate parts:

- `pipeline/`: a completed deterministic Python pipeline that produces weekly
  digest JSON data products.
- `web/`: a static Next.js reading experience that currently displays one real
  copied pipeline digest snapshot.

For the current resume point, read `START_HERE.md` first. This README describes
what the repository contains; it does not track detailed milestone status.

## Current Capabilities

The deterministic pipeline MVP is complete through M3H:

```text
Collection
-> Metadata normalisation
-> Deduplication
-> FOWT relevance classification
-> Ranking and selection
-> Weekly digest assembly
-> Pipeline orchestration
```

The website currently supports this real-data reading flow:

```text
Homepage -> Weekly Digest -> Paper Detail
Archive -> Weekly Digest
```

The website uses:

```text
web/data/weekly_digest.json
```

as a static copied pipeline output. It does not run the pipeline.

## Repository Structure

```text
fowt-digest/
  START_HERE.md                     # Resume entry point for new sessions
  AGENTS.md                         # Engineering and collaboration rules
  PROJECT_STATUS.md                 # Concise current status
  PROJECT_HANDOVER.md               # Architecture and continuity notes
  LESSONS_LEARNED.md                # Engineering lessons only
  docs/
    PRODUCT_VISION.md               # Stable product direction
    UX_ROADMAP.md                   # Website UX Polish roadmap
    PIPELINE_ARCHITECTURE.md        # Implemented pipeline architecture
    PIPELINE_DATA_MODEL.md          # Pipeline data contracts
    COLLECTOR_IMPLEMENTATION_CONTRACT.md
    RELEASE_NOTES_v1.0.md
  pipeline/                         # Python pipeline and tests
  web/                              # Next.js website
```

Some older documents in `docs/` are preserved as historical early-MVP notes.
Use `START_HERE.md` for the canonical reading order.

## Running Checks

Run the full pipeline test suite from the repository root:

```powershell
python -m pytest pipeline/tests
```

Run website checks from `web/`:

```powershell
npm.cmd run lint
npm.cmd run build
```

Run the local website from `web/`:

```powershell
npm.cmd run dev
```

## Running The Pipeline

The pipeline can be run through `pipeline.orchestrator.run_weekly_pipeline`.
That path performs real OpenAlex HTTP requests unless test doubles are injected.
For development and tests, use mocked `fetch_json` and `sleep` inputs where
available so work remains deterministic and does not depend on the network.

Pipeline run outputs are written under:

```text
pipeline/data/runs/<runId>/
```

Generated run directories are runtime artifacts and should not be committed.

## Current Development Direction

The pipeline MVP v1.0.0 is complete. Current work is Website UX Polish:
improving readability, scanability, and reader framing while keeping the
pipeline as the source of truth.

The website must not invent, rewrite, summarize, re-rank, or repair pipeline
data. Presentation can format and selectively display fields, but pipeline
contracts remain authoritative.
