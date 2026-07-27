# M5 Repository Automation Design Review

## Status

Design review only. No repository automation has been implemented in this
document.

M4 Website Publishing Workflow is complete and accepted. The current baseline is:

```text
Pipeline
-> Website Publisher
-> Validation
-> Git
-> Deployment
```

The deterministic pipeline remains the single source of truth. The website
remains a static presentation layer. The M4 publisher is now the accepted local
bridge between pipeline output and website data.

## Current Workflow

Publishing a new digest edition currently requires a human to:

1. Run or select a completed pipeline run.
2. Run `python -m pipeline.website_publisher pipeline\data\runs\<run_id>`.
3. Run validation:
   - `python -m pytest pipeline/tests`
   - `npm.cmd run validate:data`
   - `npm.cmd run test:data`
   - `npm.cmd run lint`
   - `npm.cmd run build`
   - `git diff --check`
4. Inspect the resulting Git diff.
5. Commit intentionally.
6. Push to GitHub.
7. Let the existing static hosting platform deploy from committed data.

This preserves the current architecture, but the validation and Git checks are
still spread across manual commands.

## Remaining Manual Steps

- Choosing whether a pipeline run is acceptable for publication.
- Choosing whether to overwrite an existing edition for the same `weekEnd`.
- Reviewing the final website data diff before commit.
- Writing a meaningful commit message.
- Pushing to the remote repository.
- Interpreting deployment results outside the repository.

These are appropriate manual responsibilities for the current product because
they are publication decisions, not mechanical data transformations.

## Bottlenecks

- Validation is easy to run incompletely because commands span Python, Node, and
  repository-level checks.
- There is no single local command that confirms the repository is ready to
  commit after publishing.
- The expected validation order is documented but not enforced by tooling.
- Git status, diff inspection, and validation results are not summarized in one
  deterministic pre-commit report.
- There is no GitHub Actions baseline, so pushed branches rely on local
  validation discipline.

## Automation Opportunities

M5 should automate only deterministic repository checks. Suitable candidates:

- one local validation entry point from the repository root;
- a pre-commit readiness script that runs existing pipeline and website checks
  without changing data;
- a concise validation summary that reports command pass/fail state;
- optional CI documentation or design for a later GitHub Actions baseline.

M5 should not automate publication decisions, pipeline execution, deployment, or
scheduled refreshes.

## Automation Risks

- A script that publishes and commits in one step would blur the human approval
  boundary.
- A script that runs the pipeline would couple publication validation to network
  collection and OpenAlex availability.
- A GitHub Actions workflow that deploys, publishes, or mutates data would exceed
  the static-site architecture.
- Over-broad automation could hide which digest data changed.
- Auto-formatting or broad repository cleanup could create noisy diffs unrelated
  to digest publication.

## Recommended M5 Objective

Add deterministic repository validation automation for the post-M4 publication
workflow.

The objective should be to make it hard to forget required checks before commit
or push, while keeping every data-changing and publication decision manual.

## Recommended M5 Scope

In scope:

- Add a repository-root validation script or command that runs:
  - `python -m pytest pipeline/tests`
  - website `validate:data`
  - website `test:data`
  - website `lint`
  - website `build`
  - `git diff --check`
- Ensure the command exits non-zero on the first failed validation step.
- Print clear step names and outcomes.
- Document the command in `README.md` and
  `docs/WEBSITE_PUBLISHING_WORKFLOW.md`.
- Add lightweight tests for any new validation command if implemented as code.

Out of scope:

- no pipeline behavior changes;
- no website behavior changes;
- no GitHub Actions changes in M5;
- no backend, database, CMS, API, scheduler, or deployment automation;
- no automatic publishing, committing, pushing, or deployment;
- no automatic pipeline run selection;
- no data model redesign.

## Repository Impact

Expected impact should be small:

- one deterministic repository validation entry point;
- documentation updates describing when to run it;
- optional focused tests for the validation wrapper;
- no changes to `pipeline.website_publisher` behavior;
- no changes to `web/data/digest-adapter.ts` behavior;
- no changes to committed digest JSON files except through normal future
  publishing work.

## Validation Strategy

For M5 implementation, validation should include:

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

If M5 adds a root validation command, acceptance validation should also run that
new command and confirm it invokes the same checks in the documented order.

## Acceptance Criteria

M5 should be accepted only when:

- one root-level deterministic validation workflow exists and is documented;
- the workflow does not publish, commit, push, deploy, run scheduled jobs, or
  call external services;
- existing pipeline and website behavior is unchanged;
- the workflow fails clearly when any underlying validation command fails;
- the full validation suite passes;
- final Git diff is limited to accepted automation tooling, focused tests, and
  documentation.

## Postpone To Later Milestones

Later milestones may consider:

- GitHub Actions for pull-request validation;
- deployment-status documentation or checks;
- release checklist generation;
- safer branch or PR templates;
- scheduled collection or publication;
- automatic deployment workflows.

These should wait until M5 proves the local validation workflow is stable and
useful.
