# Projects Public Evidence MVP: design review

Date: 2026-10-21.

Design: [PROJECTS_PUBLIC_EVIDENCE_MVP.md](PROJECTS_PUBLIC_EVIDENCE_MVP.md).

Review type: implementation-agent self-review against repository rules and
current code/data. This is not independent peer review or user acceptance.

Outcome at design review: ready for user review. The user subsequently accepted
the design on 2026-10-21 ("yes please do the work"). Implementation may proceed.

## Current implementation inspected

- `web/data/project-adapter.ts`: six readiness gates, FID classification,
  record/source resolution, existing index comparison data and Green Volt exception.
- `web/app/projects/page.tsx` and `project-filters.tsx`: filters, expandable
  comparison rows, verified roles and explicit lack of per-project review dates.
- `web/app/projects/[slug]/page.tsx`: standard and Green Volt detail variants,
  qualitative readiness, watchpoints, factual timeline and source lists.
- `web/data/projects/projects.json` and `docs/PROJECT_SUPPLY_CHAIN_AUDIT.md`:
  existing factual records, per-statement provenance, historical supplier roles,
  and a previous role-verification audit that is not a complete assessment review.
- Project validators/tests, browser smoke tests, and `.github/workflows/ci.yml`.
- `AGENTS.md`, product vision and the Project Intelligence skill.

The start/status documents describe an older release baseline. The design uses
the current code as evidence for existing capabilities; unrelated historical
documentation refresh is excluded.

## Findings resolved in the proposed design

| Finding | Resolution | Acceptance coverage |
|---|---|---|
| Copying every project source into every gate would imply unsupported claim-level evidence | Explicit per-record, per-area mappings; sources inherited only from the referenced record | AC3 |
| Legacy access dates or the 7 October role audit could be mistaken for whole-assessment freshness | No date backfill; separate review scope and completed/partial outcomes | AC5, AC6 |
| A data migration could appear to be a fresh project audit | Label migration evidence as stored records; complete three separately documented pilot reviews | AC5, AC6 |
| Another readiness matrix would compete with existing presentation | Evolve the existing matrix and use a shared resolver/component in both variants | AC4, AC8 |
| Green Volt's bespoke states could drift from the index | Preserve its current state contract and test consistency across both routes | AC4 |
| Source counts could become an implied readiness score | Link counts are navigation only; keep qualitative states independent | AC4, AC7 |
| Missing evidence could be presented as no activity, no FID, or no need for a component | Explicit missing-evidence states and bounded open questions; retain supplier context | AC2, AC4, AC7 |
| Positional references to facts/watchpoints could silently change meaning | Unique exact-text references with failing validation when they no longer resolve | AC3 |
| New claims might enter through helpful-sounding boundary/watchpoint copy | Use existing watchpoints and manually reviewed limitations; new pilot facts need sources | AC3, AC7 |
| A successful build would not demonstrate usable disclosures or source navigation | Add browser interaction checks and desktop/mobile visual review | AC8, AC9 |
| Local success might be reported while remote checks remain pending | Verify all final PR-head checks and keep the PR open for manual merge | AC9, AC10 |

## Review questions and result at design time

- Does scope exclude papers and pipeline changes? Yes: protected-path checks in AC1.
- Does this need a backend or runtime editorial logic? No: committed mappings,
  review records, deterministic resolution and static presentation.
- Does a completed review imply knowledge of internal documents? No: its scope
  is public evidence and recorded limitations.
- Can legacy profiles render without invented dates or filled gaps? Yes: explicit
  unrecorded review and empty area states are required.
- Does the design independently verify current project facts today? No. Pilot
  source inspection belongs to the approved implementation phase.
- Are unavailable sources hidden by a completed label? No. Partial reviews
  cannot advance the completed assessment date or satisfy the pilot acceptance gate.
- Are source tiers treated as proof of document type or truth? No.
- Are human/user decisions explicit? Yes: user design acceptance precedes
  implementation; the user performs the final merge.
- Have implementation tests or CI passed for this MVP? Not yet; they are future
  acceptance gates and must not be represented as completed.

## Acceptance record

User accepted the documented scope on 2026-10-21, including all 48 profiles and
the three pilot public-source assessment reviews. Any material expansion or
inability to meet pilot acceptance must still be surfaced.

## Design-phase verification record

- Base commit: `2242a372bad457297167908141ffab0129a852c9`.
- Initial working tree was clean on `main`; a dedicated feature branch was created.
- Only the two milestone documents and their start/status pointers were changed.
- Confirmed the current dataset contains 48 projects and all three proposed pilot IDs.
- Confirmed both milestone documents exist and their cross-references resolve.
- `git diff --check` passed; inspected the tracked documentation diff and final status.
- Application/data tests, build, browser checks, and remote CI were not run in
  this documentation-only phase. They remain required after approved implementation.
- No commit, push, PR, deployment, or merge has been performed in this phase.
