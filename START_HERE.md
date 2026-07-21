# Start Here

Use this file as the first entry point for a new Codex session.

## Resume Point

- Branch: `feature/website-ux-polish`
- Milestone: Website UX Polish
- Current feature: UX-02 Weekly Digest Scanability
- Current phase: design accepted; implementation not started
- Immediate next task: implement UX-02 on the Weekly Digest page

Everything before this point is complete and accepted unless
`PROJECT_STATUS.md` says otherwise.

## Accepted UX-02 Rule

Weekly Digest is a browsing page, not a reading page. Paper Detail remains the
only page showing the complete abstract.

Display rule:

- If an abstract exists, display the first 280 characters of the existing
  abstract string.
- Do not rewrite, summarise, or interpret the text.
- Preserve the original wording exactly.
- If the abstract is longer than 280 characters, append `...`.
- If no abstract exists, display `No abstract available.`

Boundaries:

- Do not modify pipeline data.
- Do not modify `web/data/digest-adapter.ts`.
- Do not modify Paper Detail.
- Do not add search, filters, backend, database, AI, or new fixtures.

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
