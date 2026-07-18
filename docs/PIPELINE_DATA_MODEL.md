# Pipeline Data Model

## Purpose

This document defines the minimum data contracts and workflow states required to implement the future FOWT Research Digest paper-processing pipeline. It is a design document only. It does not define Python classes, Pydantic models, database tables, or frontend code.

The model separates source metadata from AI-generated analysis and human-edited publication content. The first implementation should store these records as local JSON files created by explicit Python pipeline stages.

## Design Rules

- Keep the model small enough to implement with local JSON files.
- Preserve provenance for source metadata, AI assessments, AI review, and human approval.
- Treat source metadata, AI-generated interpretation, and human-edited content as separate concepts.
- Do not require a database, CMS, repository layer, or validation framework for the first prototype.
- Prefer additive version fields over a generic versioning system.

## Shared Field Conventions

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | string | Yes | Pipeline config | Deterministic | Identifies the contract version used to write the record. |
| `createdAt` | ISO datetime string | Yes | Orchestrator | Deterministic | Records when the object was first created. |
| `updatedAt` | ISO datetime string | Yes | Orchestrator | Deterministic | Records when the object was last changed. |
| `processingStatus` | string | Yes where applicable | Owning module | Deterministic or human-edited | Tracks current workflow state. |

Use ISO 8601 timestamps. Use `null` for known missing optional values. Avoid inventing source metadata.

## 1. M3C OpenAlex Normalisation Contract

M3C converts successful OpenAlex work records from `raw_openalex.json` into two local JSON outputs:

- `candidates.json`
- `normalised.json`

This stage reads only successful pages in `raw_openalex.json`:

```text
queries[]
  pages[] where status == "success"
    rawResponse.results[]
```

Failed page wrappers are ignored by the normaliser except for counts that may be recorded later by an orchestrator. The normaliser must not read failed page `error` objects as paper metadata.

### M3C output file shape

`candidates.json` should be an object with this shape:

```json
{
  "runId": "run_YYYYMMDD_HHMMSS_openalex",
  "sourceName": "openalex",
  "candidates": [],
  "rejectedCandidates": []
}
```

`normalised.json` should be an object with this shape:

```json
{
  "runId": "run_YYYYMMDD_HHMMSS_openalex",
  "sourceName": "openalex",
  "normalisedRecords": [],
  "rejectedRecords": []
}
```

Use `rejectedCandidates` only when a deterministic `candidateId` cannot be created. Use `rejectedRecords` when a candidate exists but cannot become `PaperMetadata`. Each rejection item should include raw provenance and a short deterministic `reason` string. Do not create a separate rejection file in M3C.

Rejection items must use exact raw-location provenance and must not duplicate
the top-level `sourceName`. Preserve rejected items in processing order. Do not
include the complete raw OpenAlex work, partial `PaperCandidate` objects,
partial `PaperMetadata` objects, timestamps, or free-form error messages.

`rejectedCandidates[]` items must use this shape:

```json
{
  "reason": "candidate_rejected_missing_id_source",
  "provenance": {
    "rawSourcePath": "pipeline/data/runs/run_YYYYMMDD_HHMMSS_openalex/raw_openalex.json",
    "rawQueryIndex": 0,
    "rawPageIndex": 0,
    "rawResultIndex": 0
  }
}
```

`rejectedCandidates` items do not include `candidateId` because candidate
creation failed.

`rejectedRecords[]` items must use this shape:

```json
{
  "candidateId": "candidate_openalex_example",
  "reason": "metadata_rejected_missing_title",
  "provenance": {
    "rawSourcePath": "pipeline/data/runs/run_YYYYMMDD_HHMMSS_openalex/raw_openalex.json",
    "rawQueryIndex": 0,
    "rawPageIndex": 0,
    "rawResultIndex": 0
  }
}
```

`rejectedRecords` items include `candidateId` because candidate mapping
succeeded before metadata mapping failed.

### OpenAlex fields used in M3C

The normaliser may use only these OpenAlex work fields for M3C:

| OpenAlex field | Local use |
| --- | --- |
| `id` | OpenAlex work ID, candidate ID fallback, paper ID fallback, source URL fallback only if no better source URL exists. |
| `doi` | DOI field and DOI-based paper ID. |
| `title` or `display_name` | Local title; `title` is preferred when both are present. |
| `abstract_inverted_index` | Reconstruct `abstract` when present and well-formed. |
| `authorships[].author.display_name` | Author display names in source order. |
| `publication_date` | `publishedDate`; controls whether a record can be normalised. |
| `primary_location.source.display_name` | `publicationSource`. |
| `type` | Mapped to local `publicationType`. |
| `concepts[].display_name` and `topics[].display_name` | Source-derived `topicTags`. |
| `open_access.oa_status` | `openAccessStatus`. |
| `open_access.is_oa` | Supports `fullTextAvailability`. |
| `primary_location.landing_page_url` | Preferred `sourceUrl`. |
| `primary_location.source.host_organization_lineage` and other affiliation/source metadata | Preserve only in raw data; do not map in M3C. |

If OpenAlex returns fields not listed here, preserve them only in `raw_openalex.json`. Do not add them to `candidates.json` or `normalised.json` in M3C.

### Abstract reconstruction

OpenAlex abstracts may arrive as `abstract_inverted_index`, an object mapping each word to one or more integer positions.

M3C should reconstruct the abstract by placing each word at its listed positions and joining tokens with a single space.

If `abstract_inverted_index` is missing, `null`, empty, or malformed, set `abstract` to `null`. Do not fail the record only because the abstract is missing or malformed.

### Publication type mapping

Map OpenAlex `type` into the local `publicationType` field as follows:

| OpenAlex `type` | Local `publicationType` |
| --- | --- |
| `journal-article` | `journal` |
| `proceedings-article` | `conference` |
| `preprint` | `preprint` |
| anything else, missing, or empty | `unknown` |

Do not infer publication type from source names in M3C.

### Topic tag mapping

Use `topicTags` as the only topic field in M3C.

Source-derived tags come from:

1. `topics[].display_name`
2. `concepts[].display_name`

Preserve source order and remove exact duplicate tag strings. Do not generate AI categories, editorial categories, or inferred taxonomy labels in M3C.

### Source URL mapping

Use `primary_location.landing_page_url` when present and non-empty.

If it is missing, use OpenAlex `id` as a fallback source URL only when it is present and URL-like. Otherwise set `sourceUrl` to `null`.

### Indexed date

OpenAlex does not provide a contract-defined indexed date in the current M3C field set. Set `indexedDate` to `null` unless a future contract explicitly names an OpenAlex field for this purpose. Do not map `updated_date` to `indexedDate` in M3C.

### Raw source provenance

Every candidate and normalised record must retain enough provenance to find the original raw work inside `raw_openalex.json`:

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `rawSourcePath` | string | Yes | Path to the run's `raw_openalex.json`. |
| `rawQueryIndex` | number | Yes | Index into `raw_openalex.json.queries`. |
| `rawPageIndex` | number | Yes | Index into the query's `pages`. |
| `rawResultIndex` | number | Yes | Index into `page.rawResponse.results`. |
| `queryGroup` | string | Yes | Query group from the raw page wrapper. |
| `queryTerm` | string | Yes | Search term from the raw page wrapper. |

Do not duplicate the full raw OpenAlex work in normalised records.

## 2. PaperCandidate

A `PaperCandidate` is the collected OpenAlex work reference before metadata normalisation. M3C writes one candidate for each successful raw OpenAlex work that has enough information to create a deterministic `candidateId`.

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | string | Yes | Pipeline constant | Deterministic | Use a small explicit version such as `pipeline-data-0.1`. |
| `runId` | string | Yes | `raw_openalex.json.runId` | Deterministic | Links candidate to the collection run. |
| `candidateId` | string | Yes | Existing ID helper | Deterministic | Use `make_candidate_id(openalex_id, source_url, title, published_date)`. |
| `sourceName` | string | Yes | Pipeline constant | Deterministic | Always `openalex` in M3C. |
| `sourceIdentifiers` | object | Yes | OpenAlex work | Deterministic | Contains `openalexId` and `doi`, each string or `null`. |
| `queryGroup` | string | Yes | Raw page wrapper | Deterministic | Query group that collected the work. |
| `queryTerm` | string | Yes | Raw page wrapper | Deterministic | Search term that collected the work. |
| `rawSourcePath` | string | Yes | Normaliser input path | Deterministic | Path to `raw_openalex.json`. |
| `rawQueryIndex` | number | Yes | Raw output traversal | Deterministic | Index into `queries`. |
| `rawPageIndex` | number | Yes | Raw output traversal | Deterministic | Index into `pages`. |
| `rawResultIndex` | number | Yes | Raw output traversal | Deterministic | Index into `rawResponse.results`. |
| `sourceUrl` | string or null | Yes | OpenAlex work | Deterministic | Preferred source URL or `null`. |
| `publishedDate` | date string or null | Yes | OpenAlex work | Deterministic | Stored for ID fallback and auditing. |
| `discoveryDate` | ISO datetime string | Yes | Run summary or normaliser clock | Deterministic | Use collection run `startedAt` when available. |
| `processingStatus` | string | Yes | Normaliser | Deterministic | Always `collected` when written by M3C. |

If OpenAlex ID, source URL, and title plus published date are all missing, no deterministic `candidateId` can be created. Reject the candidate and record the reason in the normalisation result when that reporting exists.

## 3. PaperMetadata

A `PaperMetadata` record is the normalised OpenAlex work used by downstream deterministic stages. M3C writes one record for each candidate that has enough metadata to satisfy the required fields below.

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | string | Yes | Pipeline constant | Deterministic | Identifies the data contract. |
| `runId` | string | Yes | Candidate | Deterministic | Links metadata to the collection run. |
| `paperId` | string | Yes | Existing ID helper | Deterministic | Use `make_paper_id(doi, openalex_id, title, published_date)`. |
| `candidateIds` | string[] | Yes | Candidate | Deterministic | Single-item list in M3C. Deduplication may merge later. |
| `sourceName` | string | Yes | Candidate | Deterministic | Always `openalex` in M3C. |
| `sourceIdentifiers` | object | Yes | OpenAlex work | Deterministic | Contains `openalexId` and `doi`, each string or `null`. |
| `doi` | string or null | Yes | OpenAlex work | Deterministic | Store the raw DOI string after trimming, or `null`; ID helper owns DOI normalisation. |
| `title` | string | Yes | OpenAlex work | Deterministic | Required. Prefer `title`, fallback to `display_name`. |
| `authors` | string[] | Yes | OpenAlex work | Deterministic | Author display names in source order; empty array if missing. |
| `abstract` | string or null | Yes | OpenAlex work | Deterministic | Reconstructed from `abstract_inverted_index`, or `null`. |
| `publicationSource` | string or null | Yes | OpenAlex work | Deterministic | `primary_location.source.display_name`, or `null`. |
| `publicationType` | string | Yes | OpenAlex work | Deterministic | One of `journal`, `conference`, `preprint`, or `unknown`. |
| `publishedDate` | date string | Yes | OpenAlex work | Deterministic | Required for M3C normalised output. |
| `indexedDate` | date string or null | Yes | Contract | Deterministic | `null` in M3C unless a future contract names an OpenAlex source field. |
| `sourceUrl` | string or null | Yes | OpenAlex work | Deterministic | Preferred source URL, OpenAlex ID URL fallback, or `null`. |
| `openAccessStatus` | string or null | Yes | OpenAlex work | Deterministic | `open_access.oa_status`, or `null`. |
| `fullTextAvailability` | string | Yes | OpenAlex work | Deterministic | `full_text_available` if `open_access.is_oa` is true; `abstract_only` if abstract exists; otherwise `none`. |
| `topicTags` | string[] | Yes | OpenAlex work | Deterministic | Source-derived topic/concept display names; empty array if missing. |
| `rawSources` | object[] | Yes | Candidate/raw wrapper | Deterministic | Provenance objects with `rawSourcePath`, `rawQueryIndex`, `rawPageIndex`, `rawResultIndex`, `queryGroup`, and `queryTerm`. |
| `processingStatus` | string | Yes | Normaliser | Deterministic | Always `normalised` when written by M3C. |

Do not include `categories` in M3C output. `categories` are editorial or classifier output and belong to later stages.

### M3C missing-field behaviour

| Missing or invalid field | Candidate behaviour | PaperMetadata behaviour |
| --- | --- | --- |
| OpenAlex `id` | Allowed if source URL or title plus published date can create `candidateId`. | Allowed if DOI or title plus published date can create `paperId`. |
| DOI | Allowed. Store `null`. | Allowed. `paperId` falls back to OpenAlex ID or title plus date. |
| Title/display name | Candidate allowed only if OpenAlex ID or source URL exists. | Reject from `normalised.json`; title is required. |
| Publication date | Candidate allowed if OpenAlex ID or source URL exists. | Reject from `normalised.json`; published date is required. |
| Authors | Allowed. | Use empty array. |
| Abstract | Allowed. | Use `null`; set `fullTextAvailability` from remaining evidence. |
| Publication source | Allowed. | Use `null`. |
| Publication type | Allowed. | Use `unknown`. |
| Source URL | Allowed if another candidate ID source exists. | Use `null` unless OpenAlex ID URL fallback is available. |
| Open access fields | Allowed. | Use `null` for `openAccessStatus`; derive `fullTextAvailability` from abstract if possible. |
| Topics/concepts | Allowed. | Use empty `topicTags`. |

Rejected normalised records must not be silently discarded. M3C implementation should make rejection reasons inspectable in tests and, when run-summary updating is implemented, count them with short reasons.

## 4. M3E FOWT Relevance Classification Contract

M3E reads `deduplicated_papers.json` and writes two local JSON outputs:

- `classified_papers.json`
- `classification_result.json`

The first M3E implementation is deterministic and rule-based. It must use only
the deduplicated paper `title`, `abstract`, and `topicTags`. Do not use AI,
embeddings, semantic search, fuzzy matching, ranking, publication source, full
text, or website data in M3E.

### M3E output file shape

`classified_papers.json` should be an object with this shape:

```json
{
  "runId": "run_YYYYMMDD_HHMMSS_openalex",
  "sourceName": "openalex",
  "classifiedRecords": []
}
```

Each `classifiedRecords[]` item is a deduplicated `PaperMetadata` record with
`processingStatus` set to `classified` and one embedded `relevanceAssessment`
object. Classification results must be stored only in
`classified_papers.json`.

`classification_result.json` should be an aggregate processing summary only:

```json
{
  "schemaVersion": "pipeline-data-0.1",
  "runId": "run_YYYYMMDD_HHMMSS_openalex",
  "sourceName": "openalex",
  "inputCount": 0,
  "classifiedCount": 0,
  "classificationCounts": {
    "Relevant": 0,
    "Possibly Relevant": 0,
    "Not Relevant": 0
  }
}
```

Do not duplicate per-paper classification results in
`classification_result.json`.

### RelevanceAssessment

A deterministic judgement about whether a paper is directly relevant to
floating offshore wind turbines.

Classification must use one of exactly these values:

- `Relevant`
- `Possibly Relevant`
- `Not Relevant`

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `assessmentId` | string | Yes | Classifier | Deterministic | Internal ID for the assessment. |
| `paperId` | string | Yes | PaperMetadata | Deterministic | Links to the assessed paper. |
| `classification` | enum | Yes | Classifier | Deterministic | One of `Relevant`, `Possibly Relevant`, or `Not Relevant`. |
| `confidence` | number | Yes | Classifier | Deterministic | Fixed rule confidence from 0 to 1. |
| `reason` | string | Yes | Classifier | Deterministic | Short deterministic reason string. |
| `topicTags` | string[] | Yes | PaperMetadata | Deterministic | Copy of existing metadata `topicTags`; do not generate new tags in M3E. |
| `evidenceBasis` | string[] | Yes | Classifier | Deterministic | Subset of `title`, `abstract`, and `topicTags` used by the matched rule. |
| `modelName` | string or null | Yes | Classifier | Deterministic | Always `null` in M3E. |
| `promptVersion` | string or null | Yes | Classifier | Deterministic | Always `null` in M3E. |
| `generatedAt` | ISO datetime string | Yes | Classifier input | Deterministic | Explicit timestamp supplied to the classifier. |

Do not include `isFowtRelevant` in M3E output. The three-state
`classification` value is the source of truth for this stage.

## 5. M3F Deterministic Ranking & Selection Contract

M3F reads `classified_papers.json` and writes two local JSON outputs:

- `ranked_papers.json`
- `ranking_result.json`

The first M3F implementation is deterministic and uses only existing classified
paper metadata. Do not use citation counts, scores, weights, AI, embeddings,
semantic search, diversity balancing, digest generation, or website data in M3F.

### M3F output file shape

`ranked_papers.json` should be an object with this shape:

```json
{
  "runId": "run_YYYYMMDD_HHMMSS_openalex",
  "sourceName": "openalex",
  "selectionLimit": 6,
  "rankedRecords": []
}
```

Each `rankedRecords[]` item directly extends one classified paper record. Do
not wrap the classified record inside a nested `paper` object. Every input paper
must receive one unique continuous global `rank` starting at 1.

Each ranked record must add:

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `rank` | integer | Yes | Ranker | Deterministic | Global rank across all input records, starting at 1. |
| `selected` | boolean | Yes | Ranker | Deterministic | True only when the record is within `selectionLimit` and is not `Not Relevant`. |
| `selectionReason` | enum | Yes | Ranker | Deterministic | One of `selected_within_limit`, `not_selected_below_limit`, or `not_selected_not_relevant`. |

Rank records using exactly this sort order:

1. `relevanceAssessment.classification` priority: `Relevant`, then `Possibly Relevant`, then `Not Relevant`.
2. `publishedDate` descending.
3. `paperId` ascending.

Selection is separate from ranking. Select only `Relevant` and
`Possibly Relevant` records, respect `selectionLimit`, and never select
`Not Relevant` records.

`ranking_result.json` should be an aggregate processing summary only:

```json
{
  "schemaVersion": "pipeline-data-0.1",
  "runId": "run_YYYYMMDD_HHMMSS_openalex",
  "sourceName": "openalex",
  "inputCount": 0,
  "rankedCount": 0,
  "selectedCount": 0,
  "selectionLimit": 6,
  "classificationCounts": {
    "Relevant": 0,
    "Possibly Relevant": 0,
    "Not Relevant": 0
  }
}
```

Do not duplicate paper records or per-paper ranking records in
`ranking_result.json`.
## 6. PaperScore

A structured editorial score and rationale for a relevant paper.

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `scoreId` | string | Yes | Scorer | Deterministic | Internal ID for this scoring record. |
| `paperId` | string | Yes | PaperMetadata | Deterministic | Links score to paper. |
| `fowtRelevance` | number | Yes | Scorer | AI-generated | Scores direct relevance to floating offshore wind. |
| `novelty` | number | Yes | Scorer | AI-generated | Estimates contribution novelty from available evidence. |
| `technicalRigour` | number | Yes | Scorer | AI-generated | Estimates method strength from available evidence. |
| `engineeringValue` | number | Yes | Scorer | AI-generated | Estimates practical value to researchers or engineers. |
| `evidenceQuality` | number | Yes | Scorer | AI-generated | Reflects whether claims are supported by available evidence. |
| `informationCompleteness` | number | Yes | Scorer | AI-generated | Reflects metadata, abstract, and evidence completeness. |
| `overallScore` | number | Yes | Scorer | Deterministic from dimensions | Ranking signal for selection. |
| `scoringRationale` | string | Yes | Scorer | AI-generated | Explains why the score was assigned. |
| `analysisLevel` | enum | Yes | Scorer | Deterministic | One of `metadata_only`, `abstract_only`, or `full_text`. |
| `confidence` | number | Yes | Scorer | AI-generated | Indicates score confidence from 0 to 1. |
| `rubricVersion` | string | Yes | Scoring config | Deterministic | Identifies scoring rules used. |
| `modelName` | string | Yes if AI used | AI configuration | Deterministic | Records scorer model. |
| `promptVersion` | string | Yes if AI used | AI configuration | Deterministic | Records scorer prompt version. |
| `generatedAt` | ISO datetime string | Yes | Scorer | Deterministic | Records scoring time. |

Use a simple numeric scale, for example 0-10, but final scale and weighting remain open decisions.

## 7. SelectionDecision

A record of why a paper was selected, rejected, or held for a weekly edition.

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `decisionId` | string | Yes | Selector | Deterministic | Internal ID for selection decision. |
| `paperId` | string | Yes | PaperMetadata | Deterministic | Links to the paper. |
| `editionId` | string | Yes | Orchestrator | Deterministic | Links decision to the target weekly edition. |
| `decision` | enum | Yes | Selector/human | Deterministic or human-edited | One of `selected`, `rejected`, or `held`. |
| `rank` | number or null | Optional | Selector | Deterministic | Position among selected or candidate papers. |
| `selectionReasons` | string[] | Yes | Selector | Deterministic and AI-assisted | Explains score, topic diversity, and engineering value. |
| `diversityTopics` | string[] | Yes | Selector | Deterministic | Shows topics used for balancing the weekly edition. |
| `humanOverride` | boolean | Yes | Human reviewer | Human-edited | Flags decisions changed manually. |
| `decidedAt` | ISO datetime string | Yes | Selector | Deterministic | Records decision time. |

## 8. EditorialSummary

Human-facing draft or approved editorial content for a selected paper.

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `summaryId` | string | Yes | Writer | Deterministic | Internal ID for the editorial summary. |
| `paperId` | string | Yes | PaperMetadata | Deterministic | Links summary to paper. |
| `oneSentenceSummary` | string | Yes | Writer | AI-generated or human-edited | Concise reader-facing summary. |
| `researchProblem` | string | Yes | Writer | AI-generated or human-edited | States the problem addressed. |
| `methodology` | string | Yes | Writer | AI-generated or human-edited | Summarises methods without overclaiming. |
| `keyFindings` | string | Yes | Writer | AI-generated or human-edited | Summarises findings supported by evidence. |
| `engineeringRelevance` | string | Yes | Writer | AI-generated or human-edited | Explains why engineers or researchers may care. |
| `limitations` | string | Yes | Writer | AI-generated or human-edited | Lists constraints and evidence limits. |
| `analysisLevel` | enum | Yes | Writer | Deterministic | One of `metadata_only`, `abstract_only`, or `full_text`. |
| `evidenceBasis` | string[] | Yes | Writer | Deterministic | Identifies whether title, abstract, full text, or metadata informed the draft. |
| `modelName` | string | Yes if AI used | AI configuration | Deterministic | Records writer model. |
| `promptVersion` | string | Yes if AI used | AI configuration | Deterministic | Records writer prompt version. |
| `generatedAt` | ISO datetime string | Yes | Writer | Deterministic | Records draft generation time. |
| `humanEdited` | boolean | Yes | Human approval | Human-edited | Indicates whether a human changed the draft. |

## 9. ReviewResult

A review record that checks draft content against available evidence.

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `reviewId` | string | Yes | Reviewer | Deterministic | Internal ID for review record. |
| `paperId` | string | Yes | PaperMetadata | Deterministic | Links review to paper. |
| `summaryId` | string | Yes | EditorialSummary | Deterministic | Links review to the specific draft. |
| `reviewStatus` | enum | Yes | Reviewer/human | AI-generated or human-edited | One of `passed`, `failed`, or `needs_human_review`. |
| `unsupportedClaims` | string[] | Yes | Reviewer | AI-generated | Lists claims not supported by available evidence. |
| `metadataIssues` | string[] | Yes | Reviewer | AI-generated | Flags author, date, source, DOI, or type inconsistencies. |
| `missingLimitations` | string[] | Yes | Reviewer | AI-generated | Identifies important absent caveats. |
| `reviewIssues` | string[] | Yes | Reviewer | AI-generated | General review findings requiring attention. |
| `recommendedAction` | enum | Yes | Reviewer | AI-generated | One of `approve`, `revise`, `reject`, or `hold`. |
| `contentReviewedByAi` | boolean | Yes | Reviewer | Deterministic | Confirms AI review occurred. |
| `modelName` | string | Yes if AI used | AI configuration | Deterministic | Records reviewer model. |
| `promptVersion` | string | Yes if AI used | AI configuration | Deterministic | Records reviewer prompt version. |
| `reviewedAt` | ISO datetime string | Yes | Reviewer | Deterministic | Records review time. |
| `humanApprovalStatus` | enum | Yes | Human approver | Human-edited | One of `not_requested`, `pending`, `approved`, or `rejected`. |
| `approvedBy` | string or null | Optional | Human approver | Human-edited | Identifies approver when approved. |
| `approvedAt` | ISO datetime string or null | Optional | Human approver | Human-edited | Records approval time. |

## 10. WeeklyEdition

The publication unit consumed by the website after human approval.

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `editionId` | string | Yes | Orchestrator | Deterministic | Stable internal edition ID. |
| `slug` | string | Yes | Publisher/exporter | Deterministic | URL-safe edition identifier. |
| `dateRange` | string | Yes | Orchestrator/human | Deterministic or human-edited | Reader-facing weekly range. |
| `papersReviewed` | number | Yes | Selector | Deterministic | Count of candidates reviewed for edition. |
| `papersSelected` | number | Yes | Selector | Deterministic | Count of approved selected papers. |
| `estimatedReadingTime` | string | Yes | Publisher/exporter | Deterministic | Reader-facing estimate. |
| `introduction` | string | Yes | Writer/human | AI-generated or human-edited | Short editorial introduction. |
| `selectedPaperIds` | string[] | Yes | Selector/human | Deterministic or human-edited | Ordered list of approved paper IDs. |
| `publicationStatus` | enum | Yes | Publisher/human | Deterministic or human-edited | One of `draft`, `pending_human_approval`, `approved`, or `published`. |
| `approvedBy` | string or null | Optional | Human approver | Human-edited | Records human approver. |
| `approvedAt` | ISO datetime string or null | Optional | Human approver | Human-edited | Records approval time. |
| `publishedAt` | ISO datetime string or null | Optional | Publisher/exporter | Deterministic | Records publication export time. |
| `schemaVersion` | string | Yes | Publisher/exporter | Deterministic | Publication data contract version. |

## Workflow States

Use a small explicit state model on `PaperMetadata.processingStatus` and edition-level publication records.

| State | Owner | Required data before entry | Retry allowed | Next valid states |
| --- | --- | --- | --- | --- |
| `collected` | Collector | `PaperCandidate` exists with raw source path | Yes | `normalised` |
| `normalised` | Metadata normaliser | `PaperMetadata` has required metadata fields | Yes | `deduplicated` |
| `deduplicated` | Deduplicator | Duplicate grouping complete and provenance preserved | Yes | `classified` |
| `classified` | Relevance classifier | `RelevanceAssessment` exists | Yes | `scored`, `rejected` |
| `scored` | Scorer | `PaperScore` exists for relevant paper | Yes | `selected`, `rejected`, `held` |
| `selected` | Selector | `SelectionDecision.decision` is `selected` | Yes | `drafted` |
| `drafted` | Writer | `EditorialSummary` exists | Yes | `reviewed`, `review_failed` |
| `review_failed` | Reviewer | `ReviewResult` contains blocking issues | Yes | `drafted`, `rejected`, `pending_human_approval` |
| `reviewed` | Reviewer | `ReviewResult` exists and is not blocking | Yes | `pending_human_approval` |
| `pending_human_approval` | Orchestrator/human | Draft and review are ready for human decision | No automatic retry | `approved`, `rejected` |
| `approved` | Human approver | Human approval recorded | No | `published` |
| `rejected` | Human approver or selector | Rejection reason recorded | Yes only by manual override | `classified`, `scored`, `selected`, or terminal |
| `published` | Publisher/exporter | Approved publication export completed | No | terminal |

Failed deterministic steps may be retried after fixing input data or source failures. Failed AI-assisted steps may be retried with the same inputs only if the previous output is preserved for audit. Human approval should not be bypassed by retries.

## Provenance Requirements

The minimum provenance model must answer:

- Which source provided this metadata? Use `sourceName`, `sourceIdentifiers`, `candidateIds`, and `rawSources`.
- Was the analysis based on title, abstract, or full text? Use `analysisLevel` and `evidenceBasis`.
- Which model and prompt version generated an assessment? Use `modelName` and `promptVersion` on AI-produced records.
- When was the assessment generated? Use `generatedAt` or `reviewedAt`.
- Was the content reviewed by AI? Use `contentReviewedByAi` and `ReviewResult`.
- Was it approved by a human? Use `humanApprovalStatus`, `approvedBy`, and `approvedAt`.

Do not duplicate full raw source responses inside normalised records. Store paths or references to raw files instead.

## Versioning

Use minimal explicit version fields:

| Version item | Where stored | Purpose |
| --- | --- | --- |
| `schemaVersion` | Shared records and `WeeklyEdition` | Identifies data contract used to write the record. |
| `promptVersion` | AI-generated records | Identifies prompt used for classification, scoring, writing, or review. |
| `rubricVersion` | `PaperScore` | Identifies scoring rubric and weight assumptions. |
| `modelName` | AI-generated records | Identifies model that produced an assessment or draft. |
| `generatedAt` / `reviewedAt` / `processedAt` | Stage records | Records processing timestamp for audit. |

This is enough for the first prototype. Do not create a separate generic version registry until repeated migrations justify it.

## Compact Fictional Examples

### PaperCandidate

```json
{
  "schemaVersion": "pipeline-data-0.1",
  "runId": "run_20260809_091500_openalex",
  "candidateId": "candidate_openalex_fictional001",
  "sourceName": "openalex",
  "sourceIdentifiers": {
    "openalexId": "https://openalex.org/W1234567890",
    "doi": null
  },
  "queryGroup": "electrical_and_operations",
  "queryTerm": "floating wind dynamic cable",
  "rawSourcePath": "pipeline/data/runs/run_20260809_091500_openalex/raw_openalex.json",
  "rawQueryIndex": 12,
  "rawPageIndex": 0,
  "rawResultIndex": 3,
  "sourceUrl": "https://openalex.org/W1234567890",
  "publishedDate": "2026-08-08",
  "discoveryDate": "2026-08-09T09:15:00Z",
  "processingStatus": "collected"
}
```

### PaperScore

```json
{
  "schemaVersion": "pipeline-data-0.1",
  "scoreId": "score_fictional_001",
  "paperId": "paper_fictional_dynamic_cable_001",
  "fowtRelevance": 9,
  "novelty": 6,
  "technicalRigour": 7,
  "engineeringValue": 8,
  "evidenceQuality": 6,
  "informationCompleteness": 7,
  "overallScore": 7.2,
  "scoringRationale": "Fictional example: the abstract describes a floating wind dynamic cable screening method with clear engineering relevance, but the available evidence is abstract-only.",
  "analysisLevel": "abstract_only",
  "confidence": 0.72,
  "rubricVersion": "rubric-0.1",
  "modelName": "example-model",
  "promptVersion": "scorer-0.1",
  "generatedAt": "2026-08-09T10:20:00Z"
}
```

### EditorialSummary

```json
{
  "schemaVersion": "pipeline-data-0.1",
  "summaryId": "summary_fictional_001",
  "paperId": "paper_fictional_dynamic_cable_001",
  "oneSentenceSummary": "Fictional example: an abstract-only draft describing a proposed screening approach for dynamic cable risk in floating wind projects.",
  "researchProblem": "The fictional paper asks how early project teams might flag dynamic cable fatigue concerns before detailed design data is available.",
  "methodology": "The fictional abstract describes a qualitative screening workflow rather than validated numerical results.",
  "keyFindings": "No factual findings are asserted because this example is fictional and abstract-only.",
  "engineeringRelevance": "The topic would be relevant to cable layout and early risk review if verified against a real source.",
  "limitations": "The draft is based only on fictional abstract-level evidence and must not be treated as a real research claim.",
  "analysisLevel": "abstract_only",
  "evidenceBasis": ["title", "abstract", "metadata"],
  "modelName": "example-model",
  "promptVersion": "writer-0.1",
  "generatedAt": "2026-08-09T10:40:00Z",
  "humanEdited": false
}
```

### ReviewResult

```json
{
  "schemaVersion": "pipeline-data-0.1",
  "reviewId": "review_fictional_001",
  "paperId": "paper_fictional_dynamic_cable_001",
  "summaryId": "summary_fictional_001",
  "reviewStatus": "needs_human_review",
  "unsupportedClaims": [],
  "metadataIssues": ["No DOI is present in the fictional source metadata."],
  "missingLimitations": ["Clarify that the analysis is abstract-only."],
  "reviewIssues": ["Human editor should verify whether full text is available before publication."],
  "recommendedAction": "revise",
  "contentReviewedByAi": true,
  "modelName": "example-model",
  "promptVersion": "reviewer-0.1",
  "reviewedAt": "2026-08-09T11:00:00Z",
  "humanApprovalStatus": "pending",
  "approvedBy": null,
  "approvedAt": null
}
```

### WeeklyEdition

```json
{
  "schemaVersion": "pipeline-data-0.1",
  "editionId": "edition_2026_08_09",
  "slug": "2026-08-09",
  "dateRange": "3-9 August 2026",
  "papersReviewed": 18,
  "papersSelected": 6,
  "estimatedReadingTime": "9 minutes",
  "introduction": "Fictional example edition prepared to test the publication data contract.",
  "selectedPaperIds": [
    "paper_fictional_dynamic_cable_001"
  ],
  "publicationStatus": "approved",
  "approvedBy": "human-editor",
  "approvedAt": "2026-08-09T12:00:00Z",
  "publishedAt": null
}
```

## Deliberately Excluded Fields

The first contract excludes fields that do not yet have a clear implementation purpose:

- citation counts;
- institution and affiliation graphs;
- author disambiguation IDs beyond source-provided identifiers;
- user-facing comments or reactions;
- payment, subscription, or account fields;
- browser scrape artifacts as a default source;
- permanent database primary keys separate from local IDs.

These can be reconsidered only when a concrete pipeline step requires them.

## Open Questions

- What exact numeric scale should each score dimension use?
- Should `overallScore` be a weighted average or a rule-based score?
- Which fields are required for publication versus internal processing only?
- Should human edits replace AI-generated text or be stored as a separate revision?
- What is the minimum acceptable evidence level for publication: abstract-only or full-text required for some categories?
- Where should approval identity come from before authentication exists?
- How should rejected records be retained for future audit and reuse?
