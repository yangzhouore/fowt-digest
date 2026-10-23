# Germany, Norway and China — Industry investigation

Date: 2026-10-23. Base: main `84c8e69`. Scope: Industry-owned paths only.

## Objective and design

Explain the complete floating-wind delivery system in three additional countries,
using the UK guide's four distinct relationships: industrial delivery, project
development, permissions, and electricity/financial settlement. The current user
request authorises this investigation and page organisation. This document records
the implementation design and self-review; it does not claim a separate user
design approval.

`/industry` becomes an orientation page: four country cards, a sourced comparison
of institutions/connection/revenue, and the unchanged international company
catalogue. Country guides live at `/industry/uk`, `/industry/germany`,
`/industry/norway`, `/industry/china`. Existing company anchors and Project
backlinks stay on `/industry`. UK topic anchors receive visible onward links from
the overview. Each country page has navigation back to comparison and catalogue.

New countries use the same 22-topic coverage and five chapter structure as the UK,
with nine bottom-up levels, a 17-stage lifecycle, a physical electrical route,
separate money route, practical supplier/institution cards, interface questions
and explicit evidence. Country-specific institutions replace UK-specific names;
engineering principles are shared where their meaning is independent of country.
The existing UK data and validator remain unchanged.

## Assumptions and tradeoffs

- This is a representative public-source investigation, not an exhaustive company
  register, procurement database, legal opinion or live market tracker.
- Distinguish domestic project location, supplier location and international
  delivery. A German offshore company is not evidence of German floating capacity.
- Demonstration, installation, commissioning, operation, area award, support award
  and FID are separate states. Dates describe the cited evidence, not a guarantee
  of unchanged project status.
- Norway's Utsira Nord investment support is not the UK CfD or the fixed-bottom
  Sørlige Nordsjø II support arrangement. Norway's grid/settlement institutions
  differ from GB's. Include the October 2026 support-contract update.
- China's national framework needs provincial and project-specific implementation.
  Sea-use rights, energy approval, EIA, grid access and market registration are
  separate. Preserve the 2025 revenue reform and current EIA authority guidance;
  do not reuse historical agency names as current responsibilities.
- German site auctions, approval and TSO connections are separate. Include the
  official postponement of 2026 offshore auctions; do not turn an auction award
  into a revenue guarantee or an inferred floating-wind pipeline.
- Evidence labels distinguish rules, typical practice, documented project scopes,
  supplier capabilities, changing arrangements and engineering interpretation.
  Missing verified supplier/project links remain visible rather than invented.
- Static bilingual TypeScript content and server rendering; no backend, collection,
  runtime translation, new dependencies or shared/package/CI changes.

## Harness and review gates

1. Research primary government, regulator, system-operator and company records.
   Retain URL, title, publisher, jurisdiction, document date (or unknown), review
   date and bounded claim scope. Put evidence beside topics and supplier cards.
2. Validate all three country identities, topic coverage, chain/lifecycle/power
   fields, source references/dates/HTTPS URLs, bilingual copy, evidence labels,
   stable organisation identities and no unsupported supplier contract labels.
3. Review country logic manually, especially permission versus ownership, power
   versus settlement, award versus FID and export capability versus local awards.
4. Run the full repository validation baseline, UK and new country unit checks,
   existing browser regressions and new country navigation/mobile/Chinese checks.
   Inspect rendered desktop/mobile light/dark layouts and page overflow.
5. Inspect diff and protected-file hashes. Record exact results and limitations.
   Commit/push and leave an open PR for manual merge under the user's continuing
   delivery instruction; verify final-head CI.

## Design self-review

Country routes avoid placing four textbooks above the existing catalogue. Shared
chapter/topic structure enables comparison without claiming equivalent maturity
or identical institutions. Tables carry explicit owner/payment/risk boundaries.
Disclosure summaries retain useful meaning before opening. Native links and
disclosures support keyboard use; wide tables scroll inside labelled regions.
Country data is independent of Projects, papers and the existing supplier registry.
The principal remaining limitation is public evidence: no private contract,
licensed standard text or unpublished design is assumed to have been inspected.

## Implementation and logic review

Implemented the overview, sourced responsibility comparison, four-country
navigation and three statically generated country routes. The existing UK guide
now lives at `/industry/uk`; its only renderer change is the directory link back
to `/industry#industry-catalogue`. Existing UK source data, validator and
international registry are unchanged. The overview retains visible onward
shortcuts at the six original UK chapter anchors. Individual UK topic links now
use the `/industry/uk#uk-topic-XX` route.

The three new guides contain 22 topics each, nine chain levels, 17 lifecycle
stages, 12 grouped power-path steps and 15 project-analysis questions. There are
48 organisation-role cards (16 per country), supported by 64 primary/public
technical source records. Roles are attached to stable country-specific IDs,
not auto-matched into authoritative Projects relationships. These counts describe
curated coverage, not national industry totals or unique corporate groups.

| Review question | Resolution |
|---|---|
| Does German offshore capability imply domestic floating deployment? | No. Fixed-bottom delivery, scale-model R&D, international suppliers and German facilities are labelled separately. |
| Is German CfD reform already an operating award? | No. September cabinet proposal and 8 October first reading/committee referral remain proposed/changing arrangements. |
| Is Norway's opened area all financed capacity? | No. 1,500 MW area context, two development actors and support intended for one up-to-500 MW project are distinct. |
| Are Tampen turbine upgrades extra export capacity? | No. 94.6 MW turbine/system figure is explained alongside unchanged export/platform capacity. |
| Are Tampen cables all Norwegian-made? | No. Historical JDR UK delivery and Nexans Norwegian delivery to Scotland remain separate. |
| Is Utsira Nord's old coordinated grid plan current? | No. NVE's July 2026 developer-owned connection account explicitly supersedes that earlier planning assumption. |
| Does China's national offshore total measure floating deployment? | No. Only individually sourced floating cases are presented; wider offshore capacity is not summed into floating capacity. |
| Does assembly/installation prove commercial operation? | No. Linghang's May installation and August quality checks are bounded milestones. OceanX commissioning is attributed to its vendor. |
| Is China's reform one national fixed tariff? | No. Market sales, provincial eligibility/volume/term and mechanism settlement are separate. Arithmetic is hypothetical and reference versus realised price is explicit. |
| Does an R&D partner list prove a supply contract? | No. Chinese innovation partners remain R&D-labelled unless a specific delivered scope is documented. |
| Did we read paid standards or private documents? | No. Public standard catalogue/abstract metadata is identified as such; full licensed content and private contracts are not presumed available. |

All new content is static bilingual presentation data. Shared generic engineering
descriptions are composed at build time, while authorities, connection models,
market/revenue rules, ports, geography, supplier evidence and constraints are
country-specific. There is no new backend, collection, translation service,
package, pipeline stage, shared navigation/style edit or CI configuration change.

## Acceptance evidence

Full local baseline:

- Python: `python -m pytest pipeline/tests` — **210 passed**, using the installed
  Python 3.14 executable and `.pytest_cache/international-industry-pytest`.
- `npm.cmd run validate:data` — all six existing validators passed.
- `npm.cmd run test:data` — **148 passed**, including canonical company IDs and
  Project/Industry context rendering.
- `node --test data/industry/country-guides.test.js data/industry/uk-guide.test.js`
  — **62 passed** (36 new country/SSR checks and 26 existing UK checks).
- `npm.cmd run lint` — zero errors; six pre-existing local warnings from ignored
  prior-MVP pytest fixtures, outside tracked source.
- `npm.cmd run build` — TypeScript and **431 static pages** passed, including the
  four new country routes. Country validation executes during build and existing
  overview SSR tests, so existing CI exercises the data assertion.
- Industry browser harness — **12 passed**: seven new country/overview journeys
  plus five existing UK journeys moved to `/industry/uk`.
- Existing browser regression — **10 passed**.
- Protected-file hash audit — **253 tracked files match base `84c8e69`** by
  Git-normalized content hash, covering everything outside Industry plus the
  international registry, UK data and UK validator.
- Whitespace, encoding and scope audit passed; the negative encoding unit fixture
  intentionally contains damaged text to verify rejection.

Direct browser commands (from `web/`):

```powershell
npx.cmd playwright test --config=app/industry/browser.playwright.config.ts --output=test-results/international-industry-browser-complete
npm.cmd run test:smoke -- --output=test-results/international-regression
```

Playwright required normal Windows process permissions to stop its production
server cleanly; the complete runs exited successfully. Earlier browser passes
caught and fixed a style-text hydration mismatch (two adjacent strings in a
server-rendered style element), then a too-broad source-note selector. No runtime
or console errors remain in the accepted browser runs.

Desktop overview/country heroes, revenue explanations, organisation evidence and
390px Chinese layouts were rendered and visually inspected. Country dark-mode
views and keyboard-scrolled tables stay within page width. Screenshots and traces
are ignored test artefacts under `web/test-results/`; no generated images are
committed. The direct country/UK tests are additional local acceptance checks;
package scripts and CI are unchanged, so they must not be described as new CI jobs.

Final-head CI, deployment URL and manual-merge status are recorded in the PR
description after pushing; successful local checks alone are not a CI claim.
