# Website Publishing Workflow

## Purpose

The local publisher connects deterministic pipeline output to the
existing static website data structure. It does not add website features,
backend services, databases, CMS
integration, schedulers, APIs, or deployment automation.

The pipeline remains the source of truth. The website remains a static
presentation layer over committed JSON files.

## Data Flow

```text
Pipeline Output
  pipeline/data/runs/<run_id>/weekly_digest.json

Website-ready Digest
  web/data/digests/<weekEnd>.json

Website Consumption
  web/data/digest-adapter.ts
  -> Homepage
  -> Weekly Digest
  -> Paper Detail
  -> Archive
```

`weekly_digest.json` is already the website-ready digest contract. Publishing
does not transform, summarise, re-rank, repair, or reinterpret paper data.

## Publishing Command

Run from the repository root:

```powershell
python -m pipeline.website_publisher pipeline\data\runs\<run_id>
```

The publisher:

- reads `pipeline/data/runs/<run_id>/weekly_digest.json`;
- validates that it is an object with a valid `weekEnd`;
- copies it byte-for-byte to `web/data/digests/<weekEnd>.json`;
- refuses to overwrite a different existing digest unless `--overwrite` is
  passed;
- regenerates the explicit digest imports and `digestJsonFiles` registration in
  `web/data/digest-adapter.ts` from the JSON files present under
  `web/data/digests/`.

To intentionally replace an existing edition for the same `weekEnd`:

```powershell
python -m pipeline.website_publisher pipeline\data\runs\<run_id> --overwrite
```

## Publication Workflow Command

The workflow helper runs the accepted local publication workflow from the
repository root:

```powershell
python -m tools.publication_workflow pipeline\data\runs\<run_id>
```

The workflow command:

- publishes the existing run with `pipeline.website_publisher`;
- runs the repository validation commands in order;
- stops at the first failed validation command;
- prints a summary report.

It does not run the pipeline, select a run, commit, push, deploy, schedule
publication, or call external services beyond the local validation commands.

## Validation

After publishing directly with `pipeline.website_publisher`, run:

```powershell
python -m pytest pipeline/tests
cd web
npm.cmd run validate:data
npm.cmd run test:data
npm.cmd run lint
npm.cmd run build
cd ..
git diff --check
git status
```

`validate:data` runs the Research Digest, Engineering Briefing, Projects, and
Digital & AI static-data validators. For Research, it verifies that every
committed digest JSON file is registered by the static adapter and satisfies the
digest guardrails.

## Weekly Content and Project Workflows

- Research: use `skills/fowt-paper/SKILL.md`, collect the exact publication
  window, classify/score/rank with the existing pipeline, and select up to the
  configured limit (weekly workflow: five). Publish the accepted digest. Retain
  or reconstruct the candidate pool separately under
  `web/data/research-candidates/<weekEnd>.json` and register it in
  `web/data/research-candidate-adapter.ts`; the publisher does not do this.
- Engineering: use `skills/fowt-news/SKILL.md`, discover registry-bounded weekly
  candidates before scoring and diversity-aware selection. Commit source
  records, candidates, diagnostics, and up to five highlights under
  `web/data/briefings/<weekEnd>.json`; register the edition in
  `web/data/engineering-briefing-adapter.ts`. There is no Engineering publisher CLI.
- Project Intelligence: use `skills/fowt-project-intelligence/SKILL.md` for
  requested project audits/batches in `web/data/projects/projects.json`. Keep
  factual identity, timelines, and relationships separate from optional sourced
  assessment/inferences, FID status, readiness gates, and watchpoints.
- Review provenance and selection consistency, run the full baseline, inspect
  the diff, and commit/push/open a PR only when authorized. Merge requires an
  explicit request after acceptance. Vercel Git integration deploys merged main.

Reconstructed pools must be labelled as reconstructions, not original retained
weekly collections. Never pad sparse weeks or fabricate missing evidence.

## Boundaries

The publishing tool is deterministic repository tooling. It does not:

- run the website;
- run the pipeline;
- select a pipeline run;
- fetch new data;
- deploy the website;
- commit or push changes;
- generate editorial text;
- add reader-facing behavior.

The digest adapter sorts newest first. The homepage includes only weeks with
both a registered Research digest and Engineering briefing, defaults to the
newest paired week, and retains the multi-week timeline. Publishing Research
alone does not guarantee a new homepage week.
