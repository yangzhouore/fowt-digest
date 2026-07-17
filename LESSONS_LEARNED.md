# LESSONS LEARNED

## Engineering Principles

- Documentation before implementation: clarify contracts before writing code.
- Think before coding: state goal, assumptions, requirements, tradeoffs, plan, and success criteria.
- One module, one responsibility: query building, HTTP, collection, storage, IDs, and normalisation stay separate.
- Small pure functions: prefer explicit functions over classes or framework layers.
- Deterministic outputs: IDs, query generation, JSON formatting, ordering, and mappings must be stable.
- Standard library unless justified: do not add dependencies without a concrete milestone need.
- Acceptance before commit: run tests and perform acceptance review before committing a slice.
- Milestone acceptance before merge: complete final review before merging milestone branches.
- Merge latest main before opening a PR: keep feature branches current with the default branch before review.
- Keep frontend and pipeline independent: the website does not orchestrate or consume pipeline internals until explicitly scoped.

## Lessons Learned

### Prompt conflicted with the data model

Situation: M3C-2 originally requested `topicTags` and `publicationType` tests while the data model placed those fields under `PaperMetadata`, not `PaperCandidate`.

Lesson: The data model is the source of truth when a prompt expands a slice beyond its documented contract.

Practical rule: Stop and report scope conflict before implementing fields that belong to a later record type.

### PaperCandidate and PaperMetadata must stay separate

Situation: Candidate mapping was accepted only after limiting M3C-2 to documented `PaperCandidate` fields and excluding metadata fields such as abstract, authors, publication source, publication type, and topic tags.

Lesson: Early records should not absorb downstream responsibilities.

Practical rule: Map only the fields documented for the current output shape.

### HTTP retry belongs in the client

Situation: M3B-2 implemented timeout, HTTP status handling, Retry-After, retry policy, and JSON decoding in `openalex_client.py`.

Lesson: Network retry behavior should not leak into collector orchestration.

Practical rule: The collector calls the client; the client owns HTTP failure semantics.

### Pagination belongs in the collector

Situation: M3B-4 added cursor iteration, page progression, run-wide cap handling, and partial-page failure behavior to the collector.

Lesson: Pagination is orchestration over repeated client requests, not HTTP transport behavior.

Practical rule: Keep cursor loops in `openalex_collector.py`; keep request execution in `openalex_client.py`.

### Storage belongs in run_storage

Situation: M3A added run directory creation, supported filenames, deterministic JSON writing, and atomic replacement in `run_storage.py`.

Lesson: Output writing should be centralized so collectors and normalisers do not duplicate file behavior.

Practical rule: Use `run_storage.py` for run files; do not write ad hoc JSON from pipeline stages.

### Ambiguity should be resolved in docs first

Situation: OpenAlex pagination rules were ambiguous until the contract explicitly defined cursor source, initial cursor, page size, stopping conditions, and the 200-record cap.

Lesson: Implementation should not invent material behavior when the contract is incomplete.

Practical rule: Update the relevant design contract before coding ambiguous behavior.

### Acceptance review catches contract gaps

Situation: Final M3B review found the missing fixed delay between normal OpenAlex requests; the gap was fixed before final acceptance.

Lesson: Passing tests is necessary but not enough when the contract includes behavior not yet covered.

Practical rule: Run acceptance reviews against the written contract, not only against existing tests.

### Finish one slice before expanding scope

Situation: M3B was implemented in focused slices: query builder, client, collector orchestration, pagination, then request spacing. M3C followed the same pattern with extraction, candidate mapping, then metadata mapping next.

Lesson: Small milestone slices make review and rollback easier.

Practical rule: Do not start downstream work until the current slice is accepted and committed.

### Status documents become stale quickly

Situation: `PROJECT_STATUS.md` repeatedly needed updates after accepted milestones and branch changes.

Lesson: Continuity docs must be maintained as part of milestone closure.

Practical rule: After acceptance, update project status before handing work to another session.

### Keep generated files out of commits

Situation: Python test runs created `__pycache__` directories, which were removed and ignored.

Lesson: Local generated artifacts distract from review and should not enter source control.

Practical rule: Check `git status` after tests and keep generated artifacts ignored.

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

Use this sequence for each meaningful slice. Do not skip acceptance before commit, and do not merge a milestone without final milestone review.

## Resume Checklist

1. Read `AGENTS.md`.
2. Read `PROJECT_HANDOVER.md`.
3. Read `PROJECT_STATUS.md`.
4. Verify current branch.
5. Verify latest tests.
6. Resume only the Immediate Next Task.
