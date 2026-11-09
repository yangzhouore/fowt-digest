# OpenAlex collection readiness

Date: 2026-11-09. Branch: `fix/openalex-collection-readiness`.
Base: main `4e743c6`, including merged guide PR #51.

## Problem and scope

The November 1 collection attempted only five of thirteen queries, encountered
three HTTP 401 continuation failures, and reached the 200 raw-record cap.
OpenAlex documents that continuation beyond `cursor=*` requires a free activated
API key. The client previously had no authentication support. The raw cap counts
overlapping results across terms, before deduplication.

Primary references reviewed November 6:
- https://help.openalex.org/api/authentication/
- https://help.openalex.org/api/paging/

Support `OPENALEX_API_KEY` through an unredirected Authorization header and an
explicit positive `run_record_limit` argument on the collector and orchestrator.
The default remains 200. URLs, query terms, page size, date windows, scoring,
ranking and published historical records retain their existing contracts.
HTTP 401/403 explains key setup and does not retry. Credentials are sent only
to the HTTPS OpenAlex API origin; redirects do not carry the header.

## Running a complete collection

Set the key in the environment of the Python process. A user environment variable
set after a terminal starts requires a new terminal (or explicitly loading it into
that process). Do not paste the value into shared commands, files or PR text.
Obtain a free activated key from https://openalex.org/settings/api.

Call the existing `run_weekly_pipeline` with the intended dates/timestamps,
selection limit of five and an explicit budget such as `run_record_limit=5000`.
This budget is an example, not a guarantee of complete coverage. Inspect
`run_summary.json`: all 13 queries must complete, status must be `success`,
`capReached` false and failed/partial counts zero. If capped, review the budget
before starting a fresh run. Failed or partial runs cannot publish, even with
`--overwrite`. No new pipeline stage or automatic publishing is introduced.

## Verification and remaining work

270 pipeline tests passed on November 9. Regressions cover header authentication
on continuation/retry, no credential forwarding on redirects or other origins,
actionable authentication failure without retry, invalid limits, collection of
260 raw records across all thirteen queries and existing publication guards.
All website data validators, 174 website tests, lint, the 463-page production
build and diff whitespace checks also passed. Browser suites were not rerun
locally because website presentation and committed data are unchanged.

No OpenAlex key was available in the process or user environment during this
review. A complete authenticated live collection remains unverified. Fixture
success does not certify upstream access, budget, indexing or live coverage.
No new edition or reconstructed historical pool is published in this change.
Keep the PR open for review; complete live verification before the next edition.
