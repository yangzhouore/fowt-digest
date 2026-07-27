# Website Publishing Workflow

## Purpose

M4 connects deterministic pipeline output to the existing static website data
structure. It does not add website features, backend services, databases, CMS
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

## Previous Manual Steps

Publishing a new static weekly edition previously required:

1. Find the pipeline run directory that contains `weekly_digest.json`.
2. Inspect the digest's `weekEnd`.
3. Copy `weekly_digest.json` into `web/data/digests/<weekEnd>.json`.
4. Add a matching JSON import to `web/data/digest-adapter.ts`.
5. Add the imported digest variable to `digestJsonFiles`.
6. Run website data validation and build checks.

The copy and adapter-registration steps were repetitive and easy to miss.

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

## Validation

After publishing, run:

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

`validate:data` verifies that every committed digest JSON file is registered by
the static adapter and that each digest file satisfies the website data
guardrails.

## Boundaries

The publishing tool is deterministic repository tooling. It does not:

- run the website;
- run the pipeline;
- fetch new data;
- deploy the website;
- generate editorial text;
- add reader-facing behavior.

Homepage, Archive, Weekly Digest, and Paper Detail behavior are preserved. The
newest registered digest remains the homepage digest because the existing
adapter sorts editions newest first.
