# Collector Implementation Contract

## Purpose

This document defines the first deterministic pipeline slice for FOWT Research Digest:

```text
OpenAlex collection
  -> raw storage
  -> metadata normalisation
  -> deduplication
  -> local JSON output
```

It is an implementation contract for the first Python pipeline work. It does not design scoring, selection, writing, AI review, human approval, publication automation, database storage, APIs, MCP, or frontend changes.

## Scope

Implement one local, manually run OpenAlex collector prototype that:

- queries OpenAlex for a small set of floating offshore wind keywords;
- stores raw API responses exactly as received;
- normalises records into a compact internal metadata shape;
- deduplicates conservatively using deterministic rules;
- writes JSON outputs under one run directory.

The output is not yet publication data and should not be consumed directly by the website.

## 1. OpenAlex Query Strategy

### Initial keyword groups

Use three explicit keyword groups for the first prototype:

| Group | Terms |
| --- | --- |
| Core FOWT | `"floating offshore wind"`, `"floating wind turbine"`, `"floating offshore wind turbine"` |
| Platform and station keeping | `"floating wind platform"`, `"floating wind mooring"`, `"floating wind semi-submersible"`, `"floating wind spar"`, `"floating wind tension leg platform"` |
| Electrical and operations | `"floating wind dynamic cable"`, `"floating wind wake"`, `"floating wind control"`, `"floating wind installation"`, `"floating wind operations"` |

Keep this list small until the normalisation and deduplication path is reliable.

### Query combination

Run one OpenAlex query per term. Do not create a large boolean query in the first implementation.

For each term:

- query OpenAlex works;
- use the term as an OpenAlex `search` value;
- apply the same date filter and record limit policy;
- record the term in the raw run metadata.

This produces duplicate candidates across terms, which is acceptable because deduplication is part of this slice.

### OpenAlex fields and filters

Use OpenAlex Works API.

Initial filters:

- `from_publication_date` and `to_publication_date` use the weekly date window;
- include journal articles, proceedings papers, and preprints where OpenAlex type metadata permits this;
- do not filter by institution, country, funder, citation count, or open-access status in the first prototype.

Requested fields should be limited to metadata needed for normalisation:

- OpenAlex work ID;
- DOI;
- title;
- abstract inverted index;
- authorships;
- publication year and publication date;
- primary location/source;
- type;
- OpenAlex concepts or topics if returned;
- open-access information;
- landing page or source URL.

If OpenAlex returns extra fields, preserve them in the raw file but do not carry them into normalised records unless listed in this contract.

### Pagination

Use cursor pagination if available from OpenAlex for the chosen endpoint.

For the first prototype:

- request up to 50 records per page;
- stop when OpenAlex has no next cursor;
- also stop when the run reaches the maximum record limit below.

### Rate-limit handling

Use a conservative fixed delay between requests.

Minimum behaviour:

- wait at least 1 second between OpenAlex requests;
- on HTTP 429, retry after a delay;
- respect `Retry-After` if the response provides it;
- otherwise use exponential backoff.

### Timeout behaviour

Use a request timeout of 20 seconds.

On timeout:

- retry according to the retry policy;
- if retries fail, record the failed query in `run_summary.json`;
- continue with other keyword queries.

### Maximum records per run

For the first prototype, cap the run at 200 raw OpenAlex records after combining all keyword queries.

This keeps local files small and makes test runs fast. Increase only after the collector, normaliser, and deduplicator are verified.

## 2. Weekly Date Semantics

The first implementation uses **published date** as the primary weekly inclusion rule.

Definitions:

- `publishedDate`: date the work was published according to OpenAlex metadata.
- `indexedDate`: date the work appeared or was updated in the source index, if available.
- `discoveryDate`: date this pipeline run collected the record.

Rule:

- Include a work in a weekly run only if `publishedDate` falls within the configured inclusive date window.
- Store `indexedDate` if OpenAlex provides a usable value.
- Always store `discoveryDate` as the collection timestamp.

Reasoning:

- Published date is closest to the editorial meaning of a weekly research digest.
- Discovery date is still needed for audit and reproducibility.
- Indexed date is useful later for missed-paper recovery but should not control inclusion in the first implementation.

If `publishedDate` is missing, the record is collected in raw data but rejected from normalised output for this first slice.

## 3. Run File Layout

Use this exact local layout:

```text
pipeline/
  data/
    runs/
      <runId>/
        run_summary.json
        raw_openalex.json
        candidates.json
        normalised.json
        deduplication_result.json
        deduplicated_papers.json
```

Avoid deeper nesting in the first prototype.

### File purposes

| File | Purpose |
| --- | --- |
| `run_summary.json` | Run configuration, keyword terms, date window, request counts, failures, and output counts. |
| `raw_openalex.json` | Raw OpenAlex records exactly as returned, plus minimal wrapper metadata for query term and page. |
| `candidates.json` | `PaperCandidate` records created from raw OpenAlex records. |
| `normalised.json` | `PaperMetadata` records before deduplication. |
| `deduplication_result.json` | Duplicate groups, canonical paper IDs, merge reasons, and uncertain matches. |
| `deduplicated_papers.json` | Final deduplicated `PaperMetadata` records for this slice. |

A run must not overwrite an existing run directory. Repeated runs with the same date window should create a new `runId` unless explicitly run in a controlled test directory.

## 4. Identifier Rules

### runId

Format:

```text
run_<YYYYMMDD>_<HHMMSS>_openalex
```

Use UTC time at run start. Example: `run_20260809_091500_openalex`.

Reason: run IDs identify executions, so they should be unique rather than deterministic by date window.

### candidateId

Format:

```text
candidate_openalex_<hash>
```

Generate `<hash>` deterministically from the OpenAlex work ID when present. If no OpenAlex work ID is present, hash the raw source URL. If neither exists, hash the lowercased title plus published date.

### paperId

Paper IDs identify deduplicated works.

Ordered rules:

1. If DOI exists, use `paper_doi_<normalised-doi-hash>`.
2. Else if OpenAlex work ID exists and no duplicate source IDs conflict, use `paper_openalex_<openalex-id-hash>`.
3. Else use `paper_title_<normalised-title-and-date-hash>`.

### Behaviour by scenario

| Scenario | Behaviour |
| --- | --- |
| DOI exists | DOI controls `paperId` and primary duplicate matching. |
| DOI missing | Use source identifier, then normalised title plus published date. |
| Same paper appears through multiple keyword queries | Same candidate may appear once in raw records, but deduplication must merge normalised records under one `paperId`. |
| Same paper appears in multiple sources later | DOI should create the same `paperId`; source identifiers should be preserved in `sourceIdentifiers`. |
| Title changes slightly | DOI or source identifier still controls matching. Without those, conservative title matching applies and may leave records separate if uncertain. |

Hashing should use a stable algorithm such as SHA-256 and a short prefix long enough to avoid practical collisions in local runs.

## 5. Minimum Data Contracts

Use `topicTags` as the canonical topic field for this slice. Do not use `categories` in collector output.

### PaperCandidate

| Field | Type | Required | Source | Purpose |
| --- | --- | --- | --- | --- |
| `schemaVersion` | string | Yes | Pipeline constant | Identifies this contract version. |
| `runId` | string | Yes | Orchestrator | Links candidate to a run. |
| `candidateId` | string | Yes | Collector | Stable ID for the raw candidate. |
| `sourceName` | string | Yes | Collector | Always `openalex` in this slice. |
| `sourceIdentifiers` | object | Yes | OpenAlex | Stores OpenAlex work ID and DOI if present. |
| `queryTerm` | string | Yes | Collector | Records which keyword found the candidate. |
| `rawRecordIndex` | number | Yes | Collector | Points to the raw record position in `raw_openalex.json`. |
| `discoveryDate` | ISO datetime string | Yes | Collector | Records when the pipeline found the record. |
| `processingStatus` | string | Yes | Collector | Starts as `collected`. |

### PaperMetadata

| Field | Type | Required | Source | Purpose |
| --- | --- | --- | --- | --- |
| `schemaVersion` | string | Yes | Pipeline constant | Identifies this contract version. |
| `runId` | string | Yes | Orchestrator | Links metadata to a run. |
| `paperId` | string | Yes | Normaliser/deduplicator | Internal work identifier. |
| `candidateIds` | string[] | Yes | Normaliser/deduplicator | Preserves source candidate provenance. |
| `sourceIdentifiers` | object | Yes | OpenAlex | Preserves OpenAlex ID and DOI if present. |
| `doi` | string or null | Yes | OpenAlex | Stores DOI only if OpenAlex provides it. |
| `title` | string | Yes | OpenAlex | Required for display and fallback matching. |
| `authors` | string[] | Yes | OpenAlex | Required for source attribution; may be empty if missing. |
| `abstract` | string or null | Yes | OpenAlex | Evidence for later relevance checks. |
| `publicationSource` | string or null | Yes | OpenAlex | Journal, conference, repository, or source name. |
| `publicationType` | string | Yes | Normaliser | One of `journal`, `conference`, `preprint`, or `unknown`. |
| `publishedDate` | date string | Yes | OpenAlex | Controls weekly inclusion. |
| `indexedDate` | date string or null | Yes | OpenAlex | Stored for audit or later missed-paper recovery. |
| `sourceUrl` | string or null | Yes | OpenAlex | Link back to source page if available. |
| `openAccessStatus` | string or null | Yes | OpenAlex | Stored for future full-text handling. |
| `fullTextAvailability` | string | Yes | Normaliser | One of `none`, `abstract_only`, `full_text_available`, or `unknown`. |
| `topicTags` | string[] | Yes | OpenAlex/normaliser | Minimal source-derived tags, not AI classification. |
| `processingStatus` | string | Yes | Normaliser/deduplicator | `normalised` before dedupe, `deduplicated` after dedupe. |

### DeduplicationResult

| Field | Type | Required | Source | Purpose |
| --- | --- | --- | --- | --- |
| `schemaVersion` | string | Yes | Pipeline constant | Identifies this contract version. |
| `runId` | string | Yes | Orchestrator | Links result to a run. |
| `duplicateGroups` | object[] | Yes | Deduplicator | Groups records considered the same paper. |
| `uncertainMatches` | object[] | Yes | Deduplicator | Records possible duplicates not merged. |
| `inputCount` | number | Yes | Deduplicator | Count of normalised records. |
| `outputCount` | number | Yes | Deduplicator | Count of deduplicated records. |

Each `duplicateGroups` item should contain:

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `canonicalPaperId` | string | Yes | ID retained in output. |
| `paperIds` | string[] | Yes | IDs merged into the canonical record. |
| `candidateIds` | string[] | Yes | Source candidates represented by the group. |
| `matchRule` | string | Yes | Rule that caused the merge, such as `doi_exact`, `source_id_exact`, or `title_exact`. |
| `confidence` | string | Yes | `high` or `medium`; low-confidence matches are not merged. |

## 6. Deduplication Rules

Use conservative deterministic deduplication.

### Ordered strategy

1. DOI exact match after DOI normalisation.
2. OpenAlex work ID exact match.
3. Normalised title plus published date exact match.
4. Optional fuzzy title check only for reporting uncertain matches, not automatic merging.

### DOI normalisation

- Lowercase.
- Trim whitespace.
- Remove leading `https://doi.org/` or `http://dx.doi.org/` if present.
- Remove trailing punctuation.

### Title normalisation

- Lowercase.
- Trim whitespace.
- Collapse repeated whitespace.
- Remove punctuation.
- Replace common Greek letters only if present as Unicode and ASCII equivalents in otherwise identical titles.
- Do not remove technical words or apply stemming.

### Fuzzy title matching

The first implementation may compute a simple similarity score for diagnostics, but it must not automatically merge fuzzy matches.

If title similarity is high but DOI/source IDs are absent, write the pair to `uncertainMatches` and keep both records separate.

### Canonical record selection

For each duplicate group, choose canonical metadata by:

1. Prefer record with DOI.
2. Prefer record with abstract.
3. Prefer record with publication source.
4. Prefer record with more authors.
5. Prefer earliest candidate in `normalised.json`.

### Metadata conflict resolution

- Preserve all `candidateIds`.
- Merge `sourceIdentifiers` without discarding identifiers.
- Prefer non-null metadata over null metadata.
- If two non-null values conflict, keep the canonical record value and record the conflict in `deduplication_result.json`.
- Merge `topicTags` as a de-duplicated sorted list.

### Insufficient confidence

If confidence is insufficient, do not merge. Record the possible match in `uncertainMatches` with reason and leave both records in `deduplicated_papers.json`.

## 7. Missing Metadata Behaviour

| Missing field | Behaviour |
| --- | --- |
| DOI | Allowed. Use source ID or title/date fallback for IDs and matching. |
| Abstract | Allowed. Set `abstract` to `null` and `fullTextAvailability` to `none` or `unknown`. |
| Authors | Allowed. Use an empty array and record no rejection. |
| Publication date | Reject from `normalised.json` for this slice because published date controls weekly inclusion. Keep raw record. |
| Publication source | Allowed as `null`. |
| Source URL | Allowed as `null` if OpenAlex does not provide it. |
| Title | Reject from `normalised.json`; title is required for display and fallback deduplication. |
| OpenAlex work ID | Allowed only if DOI or title/date exists; otherwise reject from `normalised.json`. |

Rejected records should be counted in `run_summary.json` with a short reason. They should remain in `raw_openalex.json`.

## 8. Retry and Failure Behaviour

### API retries

- Retry failed OpenAlex requests up to 3 times.
- Retry on timeout, HTTP 429, and 5xx responses.
- Do not retry 4xx responses other than 429.

### Backoff

- Attempt 1: immediate request.
- Retry 1: wait 2 seconds.
- Retry 2: wait 5 seconds.
- Retry 3: wait 10 seconds.
- If `Retry-After` is provided, use the longer of the planned delay and `Retry-After`.

### Partial-run behaviour

A run may complete partially if some keyword queries fail.

- Successful raw responses are preserved.
- Failed query terms are recorded in `run_summary.json`.
- Normalisation and deduplication proceed using available raw records.
- `run_summary.json` must mark the run as `partial_success` if any query failed.

### Raw response preservation

Preserve successful raw responses even if later normalisation or deduplication fails.

If collection fails before any raw records are written, write `run_summary.json` with status `failed`.

### Repeated runs

Repeated runs are safe because every run writes to a unique `runId` directory.

The same paper should receive the same deterministic `paperId` across repeated runs when DOI or stable source ID exists.

## 9. Verification Plan

Do not create tests in this documentation task. The first implementation should include tests for:

| Area | Expected verification |
| --- | --- |
| Query construction | Each keyword creates one OpenAlex request with the configured date window. |
| Date filtering | Records outside the published-date window are excluded from `normalised.json`. |
| ID generation | DOI, source ID, and title/date fallback IDs are stable across runs. |
| Metadata normalisation | OpenAlex records map to the minimum `PaperMetadata` fields. |
| DOI deduplication | Records with the same normalised DOI merge into one paper. |
| Source ID deduplication | Repeated OpenAlex work IDs merge into one paper. |
| Title deduplication | Exact normalised title plus date duplicates merge. |
| Fuzzy title handling | Similar but uncertain titles are reported, not merged. |
| Missing fields | Missing DOI/abstract/authors/source/source URL are allowed; missing title/date are rejected. |
| Repeated runs | Same inputs produce equivalent candidate and paper IDs in a new run directory. |
| Partial failure | Failed query terms are recorded and successful records continue through normalisation and deduplication. |

## 10. Implementation Order

Implement the first slice in this order:

1. Create pipeline package skeleton and local run directory writer.
2. Define simple in-code typed dictionaries or dataclasses for this slice only.
3. Implement ID helper functions.
4. Implement OpenAlex query construction.
5. Implement OpenAlex client with pagination, timeout, delay, and retry behaviour.
6. Write `raw_openalex.json` and `run_summary.json`.
7. Convert raw records to `PaperCandidate` records.
8. Implement OpenAlex metadata normalisation to `PaperMetadata`.
9. Implement missing-field rejection and counts.
10. Implement deterministic deduplication.
11. Write `deduplication_result.json` and `deduplicated_papers.json`.
12. Add tests for the verification plan.
13. Run one small manual collection with a low record cap and inspect outputs.

Stop after this slice works. Do not add relevance classification, scoring, writing, review, approval, publication export, database storage, or frontend integration in the same implementation step.

## Remaining Open Questions Outside This Slice

These are intentionally not resolved here:

- scoring rubric and score weighting;
- AI model and prompt choices;
- category taxonomy for editorial classification;
- weekly selection target and diversity algorithm;
- human approval artifact;
- website publication JSON shape;
- database migration path;
- full-text PDF analysis.