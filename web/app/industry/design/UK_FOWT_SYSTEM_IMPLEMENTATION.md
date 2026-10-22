# UK Industry System Guide — implementation and acceptance log

Date: 22 October 2026. Branch: `feat/uk-industry-system-guide`.
Base: `2e3a0cc` (main after the user pulled the merged Connected Project Context MVP).

The user accepted the researched design with: “you can now implement it, please
make sure the logics are clear and pricise.” Implementation follows that scope.
Final-head SHA, CI jobs and Vercel preview status are recorded in the feature PR
description. Leave the PR open for manual merge.

## Reader outcome

Industry Map now starts with a bottom-up UK system explanation and retains the
existing international company catalogue as a clearly labelled reference.

- Nine levels distinguish industrial delivery from transmission/system activity
  and the separate public coordination layer. Each opens to outputs, payer,
  exposure and examples.
- Five chapters cover all 22 requested topics: machine; development; power/money;
  UK actors; interfaces/risks.
- Seventeen lifecycle stages retain objective, technical work, commercial work,
  decision-maker and next-commitment conditions. The diagram shows parallel
  workstreams converging at investment rather than a mandatory serial checklist.
- A turbine/floater/mooring/cable SVG, cable-configuration explanation, and platform
  comparison explain the coupled physical system. The schematic is not to scale.
- Twelve grouped power-path steps retain purpose, illustrative voltage and asset
  responsibility, including the complete rotor-to-consumer route and alternatives.
- Separate commercial flow and CfD examples explain power sales, two-way LCCC
  settlement, supplier-obligation funding, imbalance and network charging.
- Twenty-three organisation-role cards have explicit evidence types and adjacent
  source/date references. Fifteen analysis questions close the guide.
- English and Simplified Chinese explanations are committed static copy. Source
  titles, proper names and explicitly labelled source-claim notes remain original.

## Evidence and logic review

The independent guide has 85 public source records. Every record includes its
publisher, URL, supported claim scope, supported topics, review date, jurisdiction
and a document/update date where established. Unknown dates remain null and are
shown as unestablished; review dates do not replace publication dates.

Each role card has an explicit stable evidence record. The validator binds it to
the English and Chinese role headings, so reordering claims cannot silently
attach another role's source. There is no company-name matching or new project
relationship discovery. Capability, R&D, facility plans, documented project
examples, institutional roles and typical delivery remain distinct labels.

Critical authority pages were rechecked during implementation: current MMO
consenting guidance, Ofgem's OFTO-build consultation status, DESNZ's AR7 term
update, Ocean Winds' Arven scope, and the DESNZ/LCCC explanations used for the
OFTO model and CfD funding. The researched draft provides the full source trail.

The editorial audit preserves these boundaries:

- Seabed rights do not establish construction consent, grid access or finance.
- Scotland, England and Wales have separate responsibilities and changing routes;
  old capacity-only flowcharts are not presented as a complete current rule.
- GB market roles are separate from the wider UK supply-chain geography.
- NESO, TOs, OFTOs, generation owners, Elexon, LCCC and regulators have distinct jobs.
- Floating turbines do not imply a floating substation, a transmission connection
  or universal OFTO applicability. AC/DC choice has no universal distance cutoff.
- Generator, array, export and grid voltages are distinguished and labelled as
  examples/typical practice rather than mandatory project specifications.
- CfD does not purchase the physical electricity or remove all revenue risks.
  The arithmetic assumes a realised price equal to reference for one eligible MWh;
  exclusions, fees, losses and indexation are explicitly outside that example.
- AR7 capacity is an award quantity, not automatically total project capacity or
  proof of construction/FID. The applicable term update is separate from old
  sources that describe historic 15-year contracts.
- Pipeline capacity, port grants, factory ceremonies and research collaborations
  do not establish installed generation or contracted/qualified supply capacity.
- Arven source-scope discrepancies and Ossian's connection update remain visible.
- Interface failure modes and finance-maturity gates are bounded engineering /
  commercial interpretations, not new assessments of named projects.

## Architecture and scope

Only `web/app/industry/` and `web/data/industry/` change. The existing
`industry-map.ts` catalogue and its exports/IDs remain unchanged. The guide is
imported directly by the Industry page; it is not imported by the catalogue or
other sectors' adapters. No new service, route, dependency, collector or pipeline
stage is introduced.

The renderer supports only known paragraph/list/table/diagram blocks and simple
safe inline formatting. It does not inject raw content HTML. Static source and
shape validation runs when the Industry page module is built, including in the
existing CI build and server-render regression suite.

Implementation choice: local styles are a TypeScript-owned CSS string emitted by
the server, with all selectors prefixed by `.uk-guide`. A raw `.module.css` import
would break the repository's existing framework-free server-render loader. This
keeps the existing acceptance harness and shared CSS untouched. Theme colours
reuse existing variables; no new style affects the company catalogue.

Both language bodies are rendered statically; the existing root language state
selects their visibility with route-scoped CSS. Headings/fixed labels reuse the
existing LocalizedCopy component. There is no runtime translation or new client
guide dataset. Native disclosures and anchor navigation work without new JS.
Wide tables and the labelled schematic scroll within their own focusable regions.
The mobile schematic caption remains outside its scrolling viewport.

## Validation and reproducible commands

Run from the repository root unless the command specifies `web/`.

| Command | Result |
|---|---|
| Installed Python `-m pytest pipeline/tests --basetemp=.pytest_cache/uk-industry-pytest` | 210 passed |
| `web/: npm.cmd run validate:data` | All existing data validators passed |
| `web/: npm.cmd run test:data` | 148 existing tests passed, including actual Industry server rendering and unique company anchors |
| `web/: node --test data/industry/uk-guide.test.js` | 26 Industry guide tests passed |
| `web/: npm.cmd run lint` | Passed; zero errors, six warnings only from ignored prior-MVP pytest fixtures |
| `web/: npm.cmd run build` | Passed, TypeScript and 427 static pages; includes guide validation |
| `web/: npx.cmd playwright test --config=app/industry/browser.playwright.config.ts` | Five Industry acceptance journeys passed |
| `web/: npm.cmd run test:smoke -- --output=test-results/uk-industry-regression` | Ten existing browser journeys passed |
| Git-normalized protected-file hashes against `2e3a0cc` | 251 files unchanged, including the original company catalogue |
| `git diff --check` and new-file whitespace/encoding review | Passed |

Python executable:
`C:/Users/yangz/AppData/Local/Python/pythoncore-3.14-64/python.exe`.
Environment: Python 3.14.5, Node 24.19.0, npm 12.0.2, Windows, Chromium.
Browser runs use normal Windows process permissions to start and stop the local
production server. Pytest output stays outside `web/`; browser output uses its
own ignored directories. Decorative external favicons are stubbed only in tests.

The 26 guide tests cover malformed references, evidence scope, missing language,
missing lifecycle fields/stages, lost power route/questions, corrupted encoding,
source dates/URLs, card identity/order and unsupported contract classifications.
The five browser journeys cover keyboard-opened tiers, complete power/lifecycle
tables, CfD and OFTO boundaries, dated evidence, organisation cards, preserved
company/project navigation, Chinese dark mobile views, and keyboard scrolling.
Runtime/console errors fail browser acceptance.

CI boundary: package scripts, existing Playwright configuration and workflows are
unchanged under the user's Industry-only constraint. The new 26 negative tests
and five focused browser journeys run through the direct commands above; they
are not claimed as additional jobs in existing CI. The guide's build-time
validation, existing Industry server-render tests and all ten existing browser
journeys do run in existing CI. Final-head job results are recorded in the PR.

## Visual review and corrections

Reviewed ignored local screenshots:

- `web/test-results/uk-industry-hero-desktop.png`
- `web/test-results/uk-industry-desktop.png`
- `web/test-results/uk-industry-machine-desktop.png`
- `web/test-results/uk-industry-power-desktop.png`
- `web/test-results/uk-industry-organisations-desktop.png`
- `web/test-results/uk-industry-mobile-zh-dark.png`
- `web/test-results/uk-industry-machine-mobile.png`

Review corrected a Windows shell-encoding issue in newly added Chinese strings
and added encoding regression checks. The SVG title now uses valid text content.
Mobile diagram scrolling keeps its caption fixed. Organisation roles render as
cards with adjacent evidence rather than a wide company-name table. References
to the original numbered research outline were replaced with topic names so the
five-chapter reading order remains clear.

## Handoff and limits

This remains a dated, representative static guide. Sources vary in age; unknown
document dates are explicit. Changing regulation and project arrangements need
manual review before later factual updates. The source checklist is not a claim
of access to private documents or paywalled papers.

Existing canonical destinations for all 47 companies and their recorded project
backlinks remain functional. Protected hash checks confirm other sections,
authoritative project/research data, shared UI and CI configuration are unchanged.
Review the Vercel preview and merge the final PR manually after its checks pass.
