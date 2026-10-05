# Pipeline Architecture

## Implemented Scope

The local Python pipeline produces deterministic OpenAlex Research Digest data.
It does not use AI classification, scoring, writing, or review. The website
consumes committed static JSON; it never executes the pipeline.

`pipeline/orchestrator.py::run_weekly_pipeline` sequences the existing stages.
It is a Python function, not a scheduler or a publication command. Date windows,
timestamps, and selection limits are explicit inputs. Collection uses OpenAlex
publication dates; historical reconstructions use current upstream metadata and
must be labelled accordingly.

## Stages and Contracts

| Module | Responsibility | Run outputs |
| --- | --- | --- |
| `openalex_query.py`, `openalex_client.py`, `openalex_collector.py` | Build queries, retrieve and retain raw pages and collection diagnostics | `raw_openalex.json`, `run_summary.json` |
| `normaliser.py` | Map successful raw works, reconstruct available abstracts, retain rejection reasons/provenance | `candidates.json`, `normalised.json` |
| `deduplicator.py` | Exact deterministic matching and provenance-preserving merging | `deduplicated_papers.json`, `deduplication_result.json` |
| `relevance_classifier.py` | Keyword-based Relevant / Possibly Relevant / Not Relevant classification | `classified_papers.json`, `classification_result.json` |
| `ranker.py` | Compute `research_selection_score_v1`, rank and select eligible papers | `ranked_papers.json`, `ranking_result.json` |
| `weekly_digest.py` | Copy selected ranked records without rewriting or re-selection | `weekly_digest.json`, `weekly_digest_result.json` |

Outputs are flat files under `pipeline/data/runs/<run_id>/`, managed by
`run_storage.py`. The orchestrator returns stage results without adding new
writing, review, approval, or publication-state artifacts.

The 100-point Research score uses relevance (35), technical specificity (25),
research value (15), venue quality (10), metadata quality (10), and recency (5).
Ranking uses total score descending, relevance classification, publication date
descending, then stable paper ID. Selection excludes Not Relevant records and
respects the configured limit; the weekly skill uses up to five. There is no
journal-impact-factor input, LLM score, or Research diversity balancing.

See `PIPELINE_DATA_MODEL.md` for stage shapes and
`SELECTION_TRANSPARENCY.md` for scoring and reconstruction rules.

## Failure Handling

Collection records failed requests/pages and retries transient failures. The
normaliser reads successful pages and records rejected candidates/metadata with
raw provenance. Downstream stages reject malformed contracts rather than
silently repairing them. Local JSON writes use atomic replacement; multi-output
stages retain rollback handling where implemented. Check collection diagnostics
and coverage before accepting an edition; a completed run does not establish
complete global research coverage.

## Publication Boundary

`python -m pipeline.website_publisher pipeline\data\runs\<run_id>` copies an
existing digest byte-for-byte and refreshes explicit digest registration. A
different existing edition requires `--overwrite` to replace it.

`python -m tools.publication_workflow pipeline\data\runs\<run_id>` publishes
that existing digest and runs the accepted validation baseline, stopping on the
first failure. Neither command collects new papers, approves content, commits,
pushes, schedules, or deploys. Approval is a repository review process, not an
implemented per-record approval state machine.

Research candidate pools and their adapter registration are separate reviewed
static artifacts. The publisher does not export them. See
`WEBSITE_PUBLISHING_WORKFLOW.md` for the operational workflow.

## Repository Responsibilities

- `pipeline/`: deterministic Research data production and tests.
- `tools/`: local publication/validation helper.
- `web/`: static Next.js presentation, committed data, adapters, and validators.
- `skills/`: operational Research, Engineering news, and Project Intelligence
  instructions; these do not add website automation.
- `.github/workflows/ci.yml`: Python tests and website data tests, lint, build,
  and whitespace validation for PRs/pushes to main; manual dispatch is supported.

Engineering Briefing, Industry, Projects/Project Intelligence, and Digital & AI
are independent curated website datasets. Engineering has its own deterministic
selection helper and source registry; it does not reuse Research ranking.
Project Intelligence separates source-backed facts from editorial inferences,
FID status, qualitative readiness gates, and watchpoints. Methodology explains
these distinctions. English/Simplified Chinese interface state and Light/Dark
theme remain local presentation concerns; source records are not rewritten.

Vercel Git integration deploys committed main. No backend, database, CMS, API
routes, scheduled collection/publication, semantic search, runtime translation,
or runtime AI writing is implemented. AI editorial records in the data-model
document are unimplemented design references requiring separately accepted scope.
