# FOWT Research Digest Agent Rules

## Default Reading Order

For normal milestone work, read only:

1. `AGENTS.md`
2. `START_HERE.md`
3. `PROJECT_STATUS.md`
4. the current milestone document, if one exists

Open other reference documents only when the task requires them. Do not read
`docs/archive/` unless historical context is specifically requested or needed to
resolve an ambiguity. Current milestone scope and current status override older
historical notes.

## Project Boundary

FOWT Research Digest is a static source-backed intelligence website plus a
deterministic local pipeline for Floating Offshore Wind Turbine research data.
The reader-facing product covers Engineering, Research, Industry, Projects, and
Digital & AI, with English and Simplified Chinese interface copy.

Keep boundaries explicit:

- `pipeline/` owns deterministic research data production.
- `web/` owns static website presentation and committed JSON consumption.
- Engineering Briefing data is independent static source-backed website data.
- Industry, Projects, and Digital & AI are independent curated static datasets.
- Language switching is a local presentation concern; it must not rewrite
  source-backed records or introduce runtime translation services.
- The website must not run collection, scoring, summarisation, scheduling, or
  publication automation.

Do not add backend services, databases, CMS, API routes, schedulers, AI writing,
semantic search, deployment automation, or new pipeline stages unless an
accepted milestone explicitly scopes them.

## Working Rules

Before changing files:

- inspect `git status`;
- start from the expected branch and create a feature/chore branch when asked;
- read the relevant source files and reference docs for the task;
- define the requested outcome, assumptions, tradeoffs, plan, and success
  criteria when implementation work begins.

While changing files:

- make the smallest change that satisfies the accepted scope;
- touch only files required by the task;
- preserve existing architecture, visual language, and data contracts;
- do not refactor, reformat, or clean unrelated code;
- do not invent paper metadata, research findings, engineering claims,
  summaries, limitations, scores, or editorial analysis;
- keep source facts traceable to accepted source records.

After changing files:

- run the relevant accepted validation baseline;
- inspect `git diff` and `git status`;
- report what changed, what was verified, and any remaining risk;
- commit only when explicitly requested.

## Validation Baseline

Full accepted validation is:

```powershell
python -m pytest pipeline/tests
cd web
npm.cmd run validate:data
npm.cmd run test:data
npm.cmd run lint
npm.cmd run build
cd ..
git diff --check
```

Use narrower checks only when the task explicitly does not affect the full
surface, and state what was not run.

## Git Discipline

Never work directly on `main` for feature or maintenance work unless the user
explicitly asks. Do not revert user changes. Do not use destructive git commands
unless explicitly requested and approved. Merge to `main` only after acceptance
passes and the user requests the merge.
