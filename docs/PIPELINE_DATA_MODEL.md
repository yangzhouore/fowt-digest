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

## 1. PaperCandidate

A collected source record before or during normalisation. This preserves source-specific provenance without forcing every source into the final publication shape too early.

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `candidateId` | string | Yes | Collector | Deterministic | Stable internal identifier for the collected record. |
| `sourceName` | string | Yes | Collector | Deterministic | Names the source, such as `openalex`, `crossref`, or `arxiv`. |
| `sourceIdentifiers` | object | Yes | Source API | Deterministic | Stores source IDs such as OpenAlex ID, Crossref member/work ID, or arXiv ID. |
| `rawSourcePath` | string | Yes | Collector | Deterministic | Points to the saved raw response for audit. |
| `collectedAt` | ISO datetime string | Yes | Collector | Deterministic | Records when the candidate was collected. |
| `indexedDate` | date string or null | Optional | Source API | Deterministic | Supports weekly discovery windows where available. |
| `sourceUrl` | string or null | Optional | Source API | Deterministic | Preserves the original record URL when provided. |
| `processingStatus` | string | Yes | Collector | Deterministic | Usually starts as `collected`. |
| `collectionRunId` | string | Yes | Orchestrator | Deterministic | Connects the record to a pipeline run. |

## 2. PaperMetadata

A normalised candidate record used by downstream pipeline stages.

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `paperId` | string | Yes | Normaliser | Deterministic | Internal ID for the deduplicated paper candidate. |
| `candidateIds` | string[] | Yes | Normaliser/deduplicator | Deterministic | Links back to collected candidates and source provenance. |
| `sourceIdentifiers` | object | Yes | Source APIs | Deterministic | Preserves identifiers from all known sources. |
| `doi` | string or null | Optional | Source APIs | Deterministic | Stores DOI only if supplied by a real source. |
| `title` | string | Yes | Source APIs | Deterministic | Primary paper title for display and matching. |
| `authors` | string[] | Yes | Source APIs | Deterministic | Author names as provided or normalised from source metadata. |
| `abstract` | string or null | Optional | Source APIs | Deterministic | Evidence for relevance, scoring, and writing. |
| `keywords` | string[] | Optional | Source APIs | Deterministic | Supports classification and topic grouping. |
| `publicationSource` | string or null | Optional | Source APIs | Deterministic | Journal, conference, repository, or proceedings name. |
| `publicationType` | enum | Yes | Normaliser | Deterministic | One of `journal`, `conference`, `preprint`, or `unknown`. |
| `publishedDate` | date string or null | Optional | Source APIs | Deterministic | Supports edition date ranges. |
| `indexedDate` | date string or null | Optional | Source APIs | Deterministic | Supports discovery-based windows. |
| `sourceUrl` | string or null | Optional | Source APIs | Deterministic | Original source page where available. |
| `openAccessStatus` | enum or null | Optional | Source APIs | Deterministic | Indicates whether full text may be accessible. |
| `fullTextAvailability` | enum | Yes | Normaliser | Deterministic | One of `none`, `abstract_only`, `full_text_available`, or `unknown`. |
| `rawSources` | string[] | Yes | Normaliser | Deterministic | Paths to raw source files used to form this metadata. |
| `categories` | string[] | Optional | Classifier/human | AI-generated or human-edited | Topic tags for selection and display. |
| `processingStatus` | string | Yes | Current module | Deterministic | Current workflow state for the paper. |

## 3. RelevanceAssessment

A semantic judgement about whether a paper is directly relevant to floating offshore wind turbines.

| Field | Type | Required | Source | Generation | Purpose |
| --- | --- | --- | --- | --- | --- |
| `assessmentId` | string | Yes | Classifier | Deterministic | Internal ID for the assessment. |
| `paperId` | string | Yes | PaperMetadata | Deterministic | Links to the assessed paper. |
| `isFowtRelevant` | boolean | Yes | Classifier | AI-generated or deterministic | Main inclusion signal for scoring. |
| `confidence` | number | Yes | Classifier | AI-generated | Indicates classifier confidence from 0 to 1. |
| `reason` | string | Yes | Classifier | AI-generated | Explains the relevance decision. |
| `topicTags` | string[] | Yes | Classifier | AI-generated | Supports topic diversity and reader scanning. |
| `evidenceBasis` | enum | Yes | Classifier | Deterministic | One of `title`, `abstract`, or `full_text`. |
| `modelName` | string or null | Optional | AI configuration | Deterministic | Records the model used if AI assisted. |
| `promptVersion` | string or null | Optional | AI configuration | Deterministic | Records classifier prompt version. |
| `generatedAt` | ISO datetime string | Yes | Classifier | Deterministic | Records assessment time. |

## 4. PaperScore

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

## 5. SelectionDecision

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

## 6. EditorialSummary

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

## 7. ReviewResult

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

## 8. WeeklyEdition

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
  "candidateId": "candidate_fictional_001",
  "sourceName": "openalex",
  "sourceIdentifiers": {
    "openalexId": "fictional-openalex-record-001"
  },
  "rawSourcePath": "pipeline/runs/2026-08-09/01_raw/openalex/fictional_001.json",
  "collectedAt": "2026-08-09T09:10:00Z",
  "indexedDate": "2026-08-08",
  "sourceUrl": null,
  "processingStatus": "collected",
  "collectionRunId": "run_2026_08_09"
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