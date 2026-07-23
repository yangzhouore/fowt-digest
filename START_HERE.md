# Start Here

Use this file as the first entry point for a new Codex session.

## Resume Point

- Branch: `feature/dd-03-static-digest-guardrails`
- Milestone: DD-03 Static Digest Data Guardrails
- Current feature: DD-03 Static Digest Data Guardrails
- Current phase: implementation complete, accepted, and committed; documentation baseline complete and accepted
- Accepted implementation commit: `5b558ed`
- Immediate next task: final branch review, then push and PR

Everything before this point is complete, accepted, and merged unless
`PROJECT_STATUS.md` says otherwise.

## Completed Website Baseline

Completed and accepted work now merged into `main` includes:

- UX-01 Homepage Entry and Reader Framing;
- UX-02 Weekly Digest Scanability;
- UX-03 Paper Detail Readability;
- DD-01 multiple static weekly digest support;
- DD-02 historical demonstration dataset with 15 selected weekly editions;
- UX-04 Website Presentation Refinement;
- UX-05 Site Trust Copy Alignment.

The website currently loads static digest JSON files from:

```text
web/data/digests/
```

The adapter validates the imported digest files, returns editions newest first,
uses the newest digest as the current homepage digest, and resolves Paper Detail
pages with the correct originating Weekly Digest context.

The archive contains 15 selected historical demonstration editions. These are
not complete weekly historical coverage.

## Current Boundary

DD-03 implementation is complete, accepted, and committed in `5b558ed`.
Documentation baseline is complete and accepted. DD-03 is not merged yet.
The next workflow step is final branch review, then push and PR. Do not begin
another milestone before DD-03 is merged.

The website remains a presentation layer only. It does not run the pipeline,
refresh data automatically, or add AI-written summaries, findings, limitations,
scores, or editorial analysis.

## Reading Order

Read these first:

1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `docs/PRODUCT_VISION.md`
4. `docs/UX_ROADMAP.md`
5. `PROJECT_HANDOVER.md`

Read only if needed for the task:

- `docs/PIPELINE_ARCHITECTURE.md`
- `docs/PIPELINE_DATA_MODEL.md`
- relevant files under `web/`
- relevant tests or package scripts under `web/`

Historical early-MVP notes remain in `docs/product.md`, `docs/design.md`,
`docs/architecture.md`, and `docs/MILESTONES.md`. Do not use them as current
status sources.

## Development Workflow

For each UX feature:

```text
Design review
-> Implement the approved scope only
-> Run validation
-> Acceptance review
-> Commit only after acceptance
```

Recommended validation for website UX work:

```powershell
cd web
npm.cmd run lint
npm.cmd run build
cd ..
git diff --check
git status
```

## Implementation Discipline

- Make the smallest change that satisfies the accepted UX feature.
- Preserve existing visual language unless the feature explicitly scopes a
  presentation change.
- Use the existing digest adapter when a page already depends on it.
- Do not duplicate pipeline mapping logic in page components.
- Do not improve pipeline data for presentation.
- Do not invent paper claims, summaries, findings, limitations, scores, or
  editorial analysis.
- Keep pipeline and website boundaries explicit.
