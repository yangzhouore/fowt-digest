# Projects Public Evidence & Review History MVP

Status: accepted by the user on 2026-10-21; implemented and delivered in [PR #41](https://github.com/yangzhouore/fowt-digest/pull/41), awaiting manual merge. Final-head CI verification is recorded in the PR.

Acceptance: user replied "yes please do the work" to the documented design and scope, including all 48 profiles and the three pilot reviews.

Design prepared: 2026-10-21.

Branch: `feat/projects-public-evidence-mvp`.

Design review: [PROJECTS_PUBLIC_EVIDENCE_DESIGN_REVIEW.md](PROJECTS_PUBLIC_EVIDENCE_DESIGN_REVIEW.md).

Implementation/review evidence: [PROJECTS_PUBLIC_EVIDENCE_IMPLEMENTATION.md](PROJECTS_PUBLIC_EVIDENCE_IMPLEMENTATION.md).

## 1. Objective

Help an engineering reader answer three questions about a project:

1. What does the recorded public evidence establish in each readiness area?
2. What remains uncertain, and what observable evidence could change the assessment?
3. When was the assessment substantively reviewed, and what changed?

The product presents an inspectable public-evidence assessment. It does not
claim access to private project documents or complete knowledge of internal readiness.

## 2. Scope and assumptions

- Cover the Projects index and all 48 existing project profiles.
- Preserve the six readiness areas: Permitting, Revenue, Engineering,
  Procurement, Financing / FID, and Execution.
- Retain existing lifecycle, FID, readiness, technical facts, project roles,
  story, timeline, and watchpoints unless a documented pilot review supports a correction.
- Add explicit evidence references, evidence boundaries, assessment-review
  metadata, and review/change history.
- Perform focused substantive public-source assessment reviews for three pilots:
  Green Volt (pre-FID and bespoke page), Hywind Tampen (operational), and
  CampionWind (cancelled). Review all six areas, current assessment, FID,
  material timeline, roles, and watchpoints within each pilot's public evidence scope.
- Map existing accepted evidence for the remaining projects. This migration is
  a record-mapping exercise, not a fresh verification of those projects' current state.
- Keep the existing static architecture, visual language, and EN / Simplified
  Chinese language controls. Add bilingual interface labels and notices;
  preserve original source-backed text unless an explicit translation exists.
- No changes to papers, Research data/pages, the pipeline, Engineering data,
  Industry data, or Digital & AI data. Do not refresh unrelated status documentation.
- No backend, runtime collection, automatic assessment, AI writing, translation
  service, new scoring system, global search, or deployment automation.

## 3. Reader-facing design

### Projects index

Preserve the compact comparison rows, filters, and existing expansion behaviour.
Add a short review line beneath each project's identity:

```text
Assessment reviewed: [actual completed review date]
or: Assessment review: not recorded
```

In the expanded row, keep the existing six qualitative readiness states and add
an evidence link count for each area, linking to that area's detail-page section.
An empty area says `No linked evidence recorded`, not `No activity` or `Not applicable`.
Keep next signals as observable developments rather than probability or priority scores.
Do not add a new dense comparison column or a freshness colour threshold.

### Project detail

Keep the current project identity and current assessment first. Add a compact
review strip below the assessment, before the longer story:

- last completed assessment review, or `Not recorded`;
- review scope: `Public-source assessment review` where genuinely completed;
- link to review history;
- concise notice that public evidence does not disclose complete internal readiness.

Evolve the existing readiness matrix into a `Public evidence by readiness area`
section, rather than adding a second competing readiness matrix. Preserve the
existing readiness table's accessible identity and qualitative state labels.

Each area contains:

| Element | Purpose |
|---|---|
| Area and existing qualitative state | Retain the current assessment context |
| Recorded public evidence | Show explicitly referenced accepted facts/events/roles |
| Source links | Publisher, title, publication date when recorded, and access date |
| Evidence basis | Distinguish stored source-backed records from material actually reopened in a dated review |
| Evidence boundary / open question | Explain what these records do not establish; never invent a project problem |
| Next observable signal | Reuse a specifically mapped existing watchpoint, or state that none is mapped |

Keep the facts and editorial assessment visually labelled separately. A
source-backed announcement records what its publisher states; it is not
independent verification of all underlying engineering or contractual claims.

Use a compact desktop layout and stacked, labelled blocks on mobile. Long
source titles must wrap. Source and disclosure controls must work by keyboard.
Use the same component/data resolver for the standard and Green Volt detail
variants, while retaining their surrounding layouts. Projects without
intelligence must still render an honest empty evidence/review state.

### Illustrative layout only; not a project fact

```text
Procurement                                      [existing qualitative state]
Recorded evidence: [accepted supplier-selection record]
Source: [publisher / title / published date / accessed date]
Evidence basis: Stored source-backed record
Boundary: This record establishes selection; it does not establish a supply award.
Next signal: [explicitly mapped contract-announcement watchpoint, if recorded]
```

### Review history

Show review date, scope, sources actually reviewed, limitations, and outcome.
Keep three concepts separate:

1. event/publication date: when a source reports an event;
2. source access date: when material was accessed;
3. completed assessment-review date: when the declared assessment scope was reviewed.

Partial reviews remain visible as partial and do not advance the last completed
assessment-review date. Missing historical review dates remain missing; neither
Git commit dates, dataset generation dates, source access dates, nor build dates
may be substituted for them.

Record material changes with before/after text, rationale, affected area/record,
and supporting source references. Distinguish factual corrections, editorial
assessment changes, and evidence-mapping maintenance. Mapping maintenance is
not displayed as a change in the project's real-world status. A completed
review with no change says `No material change identified within the reviewed scope`.
Projects without a review say `No assessment review history recorded`.

## 4. Data and implementation design

Add an independent committed sidecar, `web/data/projects/public-evidence.json`,
with schema version `fowt-project-public-evidence.v1`. Keep the existing
`projects.json` factual contract intact; only sourced pilot corrections may
alter existing project records. Add a small static adapter/resolver and shared
Projects presentation components; do not put collection or editorial reasoning
inside the runtime adapter.

The sidecar contains one entry per project:

| Field | Contract |
|---|---|
| `projectId` | Existing project ID; unique and complete across the current dataset |
| `areas` | Exactly one entry for each of the six readiness areas |
| `areas[].recordRefs` | Explicit references to this project's confirmed facts, timeline events, or company relationships |
| `areas[].boundary` | Optional manually reviewed evidence limitation/open question |
| `areas[].watchpointRefs` | Explicit references to existing watchpoints; empty is allowed |
| `reviews` | Dated, scoped completed or partial assessment-review records; empty for unreviewed legacy projects |
| `changes` | Review-linked factual/assessment changes or separately labelled mapping maintenance |

Reference timeline events and relationships by existing stable IDs. Confirmed
facts and watchpoints currently lack IDs: use their exact stored text as the
reference key, requiring a unique exact match within the same project. Do not
use array positions, fuzzy matching, keywords, or source-publisher heuristics.
If referenced text changes, validation must require an explicit mapping update.

Resolve evidence prose and source IDs from referenced original records rather
than maintaining a second copy of factual summaries. A project's overall source
list is not proof that every source supports every readiness area. Each evidence
item must inherit sources from its own referenced record.

Readiness state remains the existing editorial assessment, independent of the
number of linked sources. Never infer FID from lifecycle, consent, support,
FEED, supplier selection, or construction expectations. Missing links do not
downgrade a state or establish inactivity. Preserve historical supplier scope.

Review records identify the material actually accessed per source and any
inaccessible sources. `Stored source-backed record` is the migration default;
do not label it a newly reviewed original document. Distinguish public-source
inspection from independent verification. Do not derive document types from
numeric source tiers or URLs.

Material review dates require an actual scoped review with retained evidence.
An unreachable source cannot be counted as reviewed. If sufficient evidence
cannot be inspected for a pilot, record a partial review and report the
acceptance shortfall; do not silently replace the pilot or declare completion.

## 5. Acceptance criteria and verification harness

| ID | Required outcome | Verification |
|---|---|---|
| AC1 | Research/papers and unrelated product data remain unchanged | Compare changed paths and protected data against the recorded base commit |
| AC2 | All 48 profiles have six evidence areas and truthful empty states | Sidecar validator, adapter tests, and build |
| AC3 | Every displayed evidence item resolves to its own project's accepted record and its sources | Reject dangling, duplicate, cross-project, ambiguous, inference-as-fact, or source-free references |
| AC4 | Existing lifecycle/FID/readiness and supplier scope remain consistent across index and both detail variants | Adapter regression cases, including Green Volt, operational and cancelled profiles |
| AC5 | Event, source-access, and assessment-review dates remain distinct | Validation and tests for missing dates, partial reviews, malformed dates and future-dated reviews |
| AC6 | Three pilot reviews are completed with retained public evidence, or the milestone is explicitly reported incomplete | Pilot review checklist and source-by-source review records; no fabricated dates |
| AC7 | Facts, assessments, boundaries, watchpoints and change types remain separate | Structured validation plus editorial inspection of all mappings and pilots |
| AC8 | EN/Chinese labels, keyboard disclosures, long titles, mobile layout, and Light/Dark remain usable | Browser smoke tests plus desktop/mobile visual inspection |
| AC9 | Full repository baseline and all PR CI jobs pass for the final pushed commit | Saved commands/results and GitHub checks on the PR head SHA |
| AC10 | Final PR remains open for the user to merge | PR link, final head SHA, check results, and clean working-tree report |

Extend meaningful validator/adapter tests to reject bad records rather than
merely asserting implementation strings. Add browser coverage for navigating
from an index evidence area to its sources, recorded/unrecorded review states,
the Green Volt variant, language persistence, and a narrow viewport.

Full local acceptance baseline after implementation:

```powershell
python -m pytest pipeline/tests
cd web
npm.cmd run validate:data
npm.cmd run test:data
npm.cmd run lint
npm.cmd run build
npm.cmd run test:smoke
cd ..
git diff --check
git status --short
```

Use an available installed Python executable if the `python` alias is unusable;
record the actual executable and version. Keep existing CI jobs: Pipeline
validation, Website validation, and Browser smoke. New evidence validation and
tests must be included in the existing validation commands/CI path, not only
run manually. Any additional required PR checks must also pass.

## 6. Delivery gates

1. Objectives/design drafted and self-reviewed: this documentation phase.
2. User explicitly accepts the design; record acceptance and any scope changes.
3. Implement schema, mappings, shared presentation, pilot reviews, and tests.
4. Run local acceptance, inspect rendered pages and diff, resolve failures.
5. Make focused commits, push the feature branch, and open the final PR to `main`.
6. Wait for all applicable CI checks on the final head SHA; fix and rerun if needed.
7. Report the PR, verification, remaining evidence boundaries, and leave merging to the user.

Maintain an implementation evidence log after acceptance with the base/head
SHAs, approved scope, pilot review evidence, validation results, visual-review
results, and final CI links. Never mark a gate passed based on planned work.

## 7. Tradeoffs and known risks

- The sidecar adds a small validation contract, but avoids mixing mapping and
  review administration into the existing factual dataset.
- Exact-text references intentionally fail when legacy statements change. This
  creates maintenance work but prevents silent reference drift.
- Existing gate states can remain supported by limited evidence. Labels and
  boundaries must explain that linkage is not a completeness or quality score.
- Most legacy profiles will initially show no completed assessment review.
  This is an honest baseline; the three pilot reviews demonstrate the new workflow.
- Public sources may be inaccessible or insufficient. Review completeness must
  be reported accurately; private access and paid document acquisition are out of scope.
- Current source tiers do not encode reviewed material types. Do not reinterpret them.
- New components need equivalent behaviour on both standard and bespoke pages;
  changing unrelated project-story helpers is outside this MVP.
