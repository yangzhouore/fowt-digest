# Projects public evidence MVP: implementation evidence

User design acceptance: 2026-10-21, "yes please do the work".

Approved design: [PROJECTS_PUBLIC_EVIDENCE_MVP.md](PROJECTS_PUBLIC_EVIDENCE_MVP.md).

Base: `2242a372bad457297167908141ffab0129a852c9`.
Branch: `feat/projects-public-evidence-mvp`.

## Delivery state

Implementation and final local validation are complete. Remote PR CI
verification is the remaining delivery gate. The PR will remain open for manual merge.

Implementation commit: `4ce260ab436d69bb73b800e13d31491d11a3a3cf`.
Final delivery head and CI links are recorded in the PR description/checks;
they cannot be embedded in their own commit without changing that head.

## Implemented scope

- One committed evidence record for each of 48 projects, each with six areas.
- Explicit exact-record evidence and watchpoint associations; empty areas stay empty.
- Shared public-evidence matrix for standard and Green Volt profiles; existing
  qualitative states remain separate from source counts.
- Per-source stored access dates and actual review-material/access labels.
- Assessment-review strips and index dates; review findings, limitations,
  inspected sources and before/after changes.
- Three completed scoped public-source reviews. The remaining 45 profiles have
  no completed review date; mapping their existing records does not backfill one.
- Bilingual fixed UI, keyboard disclosures, mobile layout, theme compatibility.
- New validation and regression tests run through existing npm/CI commands.

## Pilot review evidence

All three reviews cover the six areas plus current assessment, FID, material
timeline, roles and watchpoints within their declared public-evidence scope.
Source-by-source inspections and area findings are committed in
`web/data/projects/public-evidence.json`. Only the three pilots' factual or
assessment records changed. These reviews do not establish internal readiness.

### Green Volt

- Reopened developer overview, consent, FEED and September survey-completion pages,
  Crown Estate Scotland's INTOG record, the government AR6 results, and SDI's
  development opportunity page.
- Added the [16 September survey-completion announcement](https://greenvoltoffshorewind.com/green-volt-completes-major-survey-campaign/)
  as engineering evidence and a material timeline update.
- [AR6 results](https://www.gov.uk/government/publications/contracts-for-difference-cfd-allocation-round-6-results/contracts-for-difference-cfd-allocation-round-6-results-accessible-webpage)
  support the recorded award; [SDI](https://www.sdi.co.uk/invest/capital-investment/opportunities/green-volt-floating-offshore-wind-farm)
  still describes a prospective FID. Neither establishes completed financing.
- Updated the assessment and FID statement to the reviewed source boundary.
  Current private offtake, full design acceptance, major supply contracts and
  construction commitment remain unverified. Earlier Buzzard reporting was not
  freshly verified and is not promoted into a new finding.

### Hywind Tampen

- Reopened the operator's project page, 2019 procurement release, explicit
  investment-decision announcement, and later operating-context article.
- Added the [11 October 2019 investment-decision announcement](https://www.equinor.com/news/archive/2019-10-11-hywind-tampen)
  and milestone. FID remains confirmed, now with direct decision evidence.
- The [operator project page](https://www.equinor.com/energy/hywind-tampen)
  supports the operating configuration; the procurement release has a regulatory
  approval condition. A final permit decision was not inspected, so the
  permitting area has an explicit boundary rather than an inferred permit link.
- Existing supplier roles remain unchanged. Specialist historical supplier
  documents were not all reopened; stored evidence retains its own label.

### CampionWind

- Reopened the Scottish Government project map, Offshore Wind Scotland's
  MarramWind report and Crown Estate Scotland's supply-chain update.
- [Crown Estate Scotland](https://www.crownestatescotland.com/news/scotwind-developers-set-out-latest-multi-billion-pound-supply-chain-commitments)
  directly records termination of CampionWind's option in late 2025.
- Cancellation remains unchanged. Assessment/timeline terminology now separates
  the option agreement from a full lease; the exact effective day stays unknown.
- Capacity descriptions conflict across the reviewed sources. The original
  government-map envelope remains unchanged; the review explicitly records the
  discrepancy rather than silently repairing it.
- Internal closure arrangements, legacy studies, supplier settlements and
  possible successor rights remain outside the reviewed evidence.

## Verification record

Final local results on the implementation worktree:

| Check | Result |
|---|---|
| Python pipeline tests, installed interpreter with writable `--basetemp` | 210 passed |
| `npm.cmd run validate:data` | Passed, including public-evidence validation |
| `npm.cmd run test:data` | 118 passed, including 29 new evidence cases and the missing-intelligence regression |
| `npm.cmd run lint` | Passed; generated pytest fixtures produced six unused-variable warnings, no source-code errors |
| `npm.cmd run build` | Passed; 427 static pages |
| `npm.cmd run test:smoke -- --output=test-results/projects-browser-final` | 7 passed; normal exit code 0 |
| Staged `git diff --check` | Passed, including all new files |

A supplemental `npm.cmd run lint -- --ignore-pattern 'test-results/**'` passed
without warnings, excluding only locally generated test fixtures. CI retains
the standard lint command.

No source-code changes followed these final checks. Documentation completion
and remote CI verification are tracked separately.

Environment: Python 3.14.5, Node 24.19.0, npm 12.0.2; local Windows.

The default Windows Python alias is inaccessible. The installed interpreter is
`C:/Users/yangz/AppData/Local/Python/pythoncore-3.14-64/python.exe`.
Pytest's default temporary directory produced sandbox permission errors; the
same 210 tests passed using a writable, ignored workspace `--basetemp`.
The first sandboxed browser run passed all assertions but hung during server
shutdown. Stopping its verified task-owned server allowed exit code 0; a normal
process-permission rerun subsequently passed all seven tests and exited normally.
The final browser run used a separate output directory because deleting the
pytest-generated directory encountered Windows EPERM. No application code or
CI policy was changed to bypass either environment constraint. CI uses fresh
Linux workspaces and the standard commands.

### Scope and diff inspection

- Compared against the recorded base commit: protected paper/Research, pipeline,
  Engineering, Industry, and Digital & AI paths are unchanged.
- Parsed and compared data: all 45 non-pilot project records, all company
  relationships, non-pilot timelines and original source records are unchanged.
- All 48 lifecycle and capacity values remain unchanged.
- Reverted two incidental pre-existing JSON indentation normalisations outside
  pilot records; no unrelated formatting cleanup is included.
- Inspected new evidence mappings against each project's accepted statements;
  no source list is inherited wholesale into readiness areas.

### Visual review

Inspected local Playwright screenshots:

- `web/test-results/project-evidence-desktop.png`: expanded Green Volt engineering
  evidence, long source titles, distinct old/new access dates and evidence boundary.
- `web/test-results/project-evidence-mobile-zh-dark.png`: 390px viewport, Chinese
  interface, dark theme, readable wrapped source title and FID boundary.

No overlap or clipping was observed in these reviewed views. Browser assertions
also cover disclosure by keyboard, hash navigation, stored/unrecorded states,
Chinese persistence and absence of horizontal overflow. Screenshots are ignored
local QA artifacts; they are not golden-image comparisons.

## Maintenance contract

Update evidence mappings only through explicit original-record references.
Confirmed-fact/watchpoint keys must uniquely equal the stored text; timeline and
relationship keys use stable IDs and must belong to the same project.
An editorial inference cannot be used as a factual evidence reference.

Each completed review needs six area findings, declared assessment/FID/timeline/
roles/watchpoint coverage, inspected public sources, a summary and limitations.
`stored_record` and `unavailable` inspections do not count as original material
inspection. Partial reviews do not advance the completed date. Review dates
cannot be borrowed from event dates, source-access dates or Git history.

Record changes with their review, area/record target, before/after text,
rationale and inspected supporting sources. Mapping maintenance is labelled
separately from factual/assessment changes. The website exposes the area and
reader-facing change, not internal JSON paths.

Run the existing full validation commands, including `npm.cmd run test:smoke`.
The new sidecar validator and data tests are part of `validate:data` and
`test:data`; GitHub's existing Website validation and Browser smoke jobs exercise them.

## PR and CI

Local verification is complete. The final PR description records its delivery
head and CI results, and links to the exact workflow run. Before reporting
delivery, verify Pipeline validation, Website validation, Browser smoke and any
other applicable PR checks for that final head. Do not merge automatically.
