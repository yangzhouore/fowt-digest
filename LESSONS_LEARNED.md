# Lessons Learned

This document records engineering lessons that should continue to influence how
future work is designed and reviewed. It does not track project status,
architecture, or roadmap progress.

## Engineering Principles

- Documentation before implementation: clarify contracts before writing code.
- Think before coding: state goal, assumptions, requirements, tradeoffs, plan,
  and success criteria before implementation.
- One module, one responsibility: keep query building, HTTP, collection,
  storage, IDs, normalisation, deduplication, classification, ranking, digest
  assembly, and orchestration separate.
- Small pure functions: prefer explicit functions over classes, managers,
  services, repositories, factories, schemas, or framework layers.
- Deterministic outputs: IDs, query generation, JSON formatting, ordering,
  mappings, classification, ranking, and digest assembly must be stable.
- Standard library unless justified: do not add dependencies without a concrete
  milestone need.
- Acceptance before commit: run checks and complete acceptance review before
  committing a slice.
- Milestone acceptance before merge: review the full milestone before merging.
- Merge latest main before opening a PR.
- Keep frontend and pipeline independent unless a feature explicitly scopes an
  integration boundary.

## Lessons

### Contract conflicts must stop implementation

Situation: M3C-2 originally asked for fields that belonged to `PaperMetadata`,
not `PaperCandidate`.

Lesson: Written contracts are the source of truth when a prompt expands scope.

Practical rule: Stop and resolve the scope conflict before implementing fields
that belong to a later record type.

### Pipeline stage ownership must stay narrow

Situation: M3B separated query building, HTTP retry, collector pagination, and
storage into different modules.

Lesson: Small ownership boundaries make acceptance review precise and prevent
later stages from inheriting hidden behavior.

Practical rule: Put business logic in the owning stage only. Reuse helpers
instead of duplicating query, HTTP, ID, or storage behavior.

### Ambiguity belongs in documentation first

Situation: OpenAlex pagination rules were ambiguous until the contract defined
cursor source, initial cursor, page size, stopping conditions, and record cap.

Lesson: Implementation should not invent material behavior when a contract is
incomplete.

Practical rule: Update the relevant design contract before coding ambiguous
behavior.

### Acceptance review catches missing contract behavior

Situation: Final M3B review found the missing fixed delay between normal
OpenAlex requests even though tests passed.

Lesson: Passing tests is not enough when written contract behavior is not fully
covered.

Practical rule: Review against the contract, not only against the current test
suite.

### Expected failures should be explicit and deterministic

Situation: Normalisation and downstream writing stages needed deterministic
`ValueError` handling and exact rejection payloads.

Lesson: Predictable failure behavior is part of the data contract.

Practical rule: Validate input shape early, use short deterministic reasons,
and let unexpected exceptions propagate.

### File outputs need rollback where a stage writes pairs

Situation: Deduplication, classification, ranking, and weekly digest assembly
write paired outputs.

Lesson: A failed second write must not leave a newly created one-file output set.

Practical rule: Validate first, then use local rollback around paired writes
while preserving pre-existing files.

### The website must not improve data by inventing content

Situation: Website integration moved from mock pages to a real static pipeline
digest, but the digest does not include editorial summaries, findings, scores,
or full review text.

Lesson: Presentation can reduce cognitive load, but it must not change the
meaning of pipeline output.

Practical rule: Omit, format, or neutrally fall back for missing fields. Do not
write generated claims into the website.

### Status documents become stale quickly

Situation: `PROJECT_STATUS.md` and handover notes repeatedly drifted after
branches, commits, merges, and acceptance reviews.

Lesson: Continuity documentation needs a single resume entry point and clear
document responsibilities.

Practical rule: Keep detailed current status in one place, and keep README,
handover, roadmap, and lessons from duplicating it.

### Static website data still needs explicit boundaries

Situation: The website moved from one copied digest to multiple committed
static digest files for demonstration.

Lesson: A static demonstration dataset can improve product review without
turning the website into an automated publication system.

Practical rule: Document where committed digest files live, disclose that
selected historical editions are not complete coverage, and keep the website
from running pipeline code.

### CSS parser failures can remove the whole presentation layer

Situation: A malformed generated CSS marker made the compiled global stylesheet
unparsable, so the site rendered with browser defaults even though the stylesheet
link returned HTTP 200.

Lesson: Visual regressions can be caused by stylesheet compilation failure, not
only missing imports or component changes.

Practical rule: When global styling disappears, inspect the served CSS asset for
parser placeholders and prefer ASCII-only CSS markers unless non-ASCII is
required.

## Common Workflow

```text
Design
-> Review
-> Implement
-> Acceptance
-> Commit
-> PR
-> Merge
```

Use this sequence for each meaningful slice. Do not skip acceptance before
commit, and do not merge a milestone without final milestone review.
