# M2 — Pipeline Design Approved

Date:
2026-07-10

Status:
Approved

Review Result:

- Architecture Ready: Yes
- Data Model Ready: Yes
- Collector Contract Ready: Yes

Scope Approved:

- Pipeline Architecture
- Pipeline Data Model
- Collector Implementation Contract

Implementation Ready:

The project is ready to begin implementing the first deterministic pipeline slice:

OpenAlex
→ Metadata Normalisation
→ Deduplication
→ Local JSON Output

Known Limitations:

- Scoring rubric and score weighting are intentionally deferred.
- AI model and prompt choices are intentionally deferred.
- Editorial category taxonomy is intentionally deferred.
- Weekly selection and topic-diversity logic are intentionally deferred.
- Human approval artifact is intentionally deferred.
- Website publication JSON format is intentionally deferred.
- Database migration path is intentionally deferred.
- Full-text PDF analysis is intentionally deferred.

Next Milestone:

M3 — Pipeline Foundation

Notes:

- The frontend and pipeline remain separate.
- Python remains the pipeline orchestrator.
- The first implementation slice is deterministic only.
- OpenAlex is the first source to implement.
- Published date controls weekly inclusion for the first collector slice.
- Local JSON files are the first storage mechanism.
- Run outputs use explicit files under `pipeline/data/runs/<runId>/`.
- Identifier rules are deterministic for candidates and papers.
- Deduplication is conservative and prioritises DOI, source ID, then exact normalised title/date.
- AI-assisted stages remain outside the approved M2 implementation scope.