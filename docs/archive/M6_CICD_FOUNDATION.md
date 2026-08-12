# M6 CI/CD Foundation

## Purpose

M6 moves the accepted local validation baseline into GitHub Actions while keeping
production deployment on the existing Vercel Git integration.

The release path is:

```text
Pull Request to main
-> GitHub CI
-> manual acceptance and merge
-> main
-> Vercel deploys the committed static website
```

## CI Triggers

The CI workflow runs on:

- pull requests targeting `main`;
- pushes to `main`;
- manual `workflow_dispatch` runs.

Pull request and `main` validation use the same baseline so a merged change has
already passed the checks that protect production data and build output.

## Validation Jobs

The `pipeline` job uses Python 3.14, explicitly installs `pytest`, then runs:

```powershell
python -m pytest pipeline/tests
git diff --check
```

The `web` job uses Node 24, npm cache keyed by `web/package-lock.json`, and
`npm ci` before running:

```powershell
npm run validate:data
npm run test:data
npm run lint
npm run build
```

## Vercel CD Boundary

GitHub Actions does not deploy the website. It does not use Vercel CLI,
deployment secrets, or Vercel tokens.

Vercel remains the production CD mechanism through its Git integration. A manual
merge to `main` is still the production release gate; Vercel deploys only the
committed static website and digest JSON data from `main`.

## Out of Scope

M6 does not add scheduled OpenAlex execution, automatic digest generation,
automatic publication, automatic commits, automatic pushes, automatic PRs,
automatic merging, historical backfill, backend services, databases, CMS, API
routes, or website feature changes.
