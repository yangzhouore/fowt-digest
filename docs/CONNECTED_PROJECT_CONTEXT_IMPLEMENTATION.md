# Connected Project Context implementation and acceptance

Date: 2026-10-22.
Branch: `feat/connected-project-context-mvp`.
Base: `e88d325e5ed8fad6088b0cb287c8ad574d5ea102` (merged PR #41).
Design acceptance commit: `be97bdd`.

The user accepted the objectives, design and self-review with "yes please
continue" before application changes. Implementation and local acceptance are
complete. Final-head Actions results, deployment preview and the immutable head
SHA are recorded in the feature PR description. Leave that PR open for manual merge.

## Delivered reader paths

- Every project profile shows dated Engineering coverage or the bounded empty
  state, "No project-specific Engineering coverage linked".
- Six explicit mappings connect four projects to exact published Engineering
  items. The same mapping supplies the reverse Project context links.
- Participant links in expanded overview roles and all project detail variants
  navigate to canonical Industry company anchors through existing IDs only.
- Industry details group project records alphabetically, preserving each role,
  status, source scope, detail and original provenance. Three projects show
  initially; additional records remain reachable in a disclosure.
- All 47 companies have one canonical target across 61 rendered category cards.
  Repeated cards have unique disclosure and heading IDs and equivalent context.
- Fixed copy supports English / Simplified Chinese; factual titles, names and
  stored source extracts remain original. Native disclosures support keyboard use.

## Linkage audit

This audit inspected committed published items and their retained source records.
It did not inspect original publications, paywalled papers or internal documents,
and does not claim a fresh public-source project assessment. Mapping review dates
refer only to this linkage audit. No underlying source text was rewritten.

| Mapping ID | Source date | Confirmed project-specific activity and boundary |
|---|---|---|
| `eolmed-first-turbine-2025-12` | 2025-12-10 | Stored text explicitly describes turbine departure for installation at EolMed. This is historical coverage, not a new installation-status update. |
| `efgl-first-power-2026-05` | 2026-05-05 | Stored text explicitly describes electricity production at the 30 MW EFGL farm. No inference of completion of other project gates. |
| `efgl-full-power-2026-07` | 2026-07-13 | Stored text explicitly describes full power at EFGL. Kept separate from first-power coverage and the current assessment. |
| `efgl-foundations-om-2026-07` | 2026-07-15 | Stored text explicitly describes O&M support for EFGL foundations. The navigation association does not create a new company role or supply award. |
| `green-volt-survey-notice-2026-07` | 2026-07-22 | Stored text explicitly describes a Green Volt environmental/geophysical survey notice. It does not establish survey completion, FID or a new review date. |
| `pentland-anchor-engineering-2026-10` | 2026-10-05 | Stored text names Pentland Floating Offshore Wind Farm and describes site investigation/anchor engineering collaboration. The source explicitly does not announce a final anchor supply award or installed system. |

All six retained seeds passed identity and excerpt checks: canonical name or
accepted alias, exact stored excerpt, registered edition, published item and its
own supporting source. Extracts are at most 25 words / 240 characters. No shared
company, topic, platform or name-matching algorithm discovers connections.

## Company-record preservation audit

The accepted dataset has 228 project-company relationships. Exactly 92 have
non-null, valid Industry IDs, spanning 30 company IDs. The regression suite checks
all 92 against the original records, including role IDs, project identity, status,
scope, detail and source IDs. Grouping by project does not discard multiple roles.
Null and invalid IDs and unsupported source references create no backlinks.

Browser acceptance specifically checks both EFGL JDR cable roles, their historical
labels, "Delivered cables" scope and original evidence destinations. It also
checks Equinor's project navigation and expansion. Green Volt retains no Industry
links because its existing role records have no catalogue IDs.

## Architecture and scope review

The new sidecar owns navigation associations only. Its validator runs in the
existing `validate:data` command; 30 new negative, resolver and server-render tests
run within `test:data`. Existing CI workflows automatically execute these commands.

The connected-context adapter consumes existing adapters with one-way dependencies.
Project index props are enriched on the server; the client filter imports only a
type. It does not import the Engineering archive or Industry catalogue at runtime.
Routes and reverse links derive from validated IDs rather than stored arbitrary
URLs. The static build still generates 427 pages; no routes or services were added.

Compared against the recorded base, 121 protected tracked files have identical
Git-normalized content hashes: pipeline, authoritative Projects/public evidence,
Engineering, Industry, Research and Digital & AI data, authoritative project /
Engineering / Research adapters, and Research archive / paper / weekly pages.
`git diff` over those protected paths is empty. No facts, review dates, FID states,
readiness, paper content, source metadata or existing scores changed.

## Local validation

Environment: Python 3.14.5, Node 24.19.0, npm 12.0.2, Windows, Chromium.

| Check | Result |
|---|---|
| `python -m pytest pipeline/tests --basetemp=.pytest_cache/connected-pytest` | 210 passed |
| `npm.cmd run validate:data` | All validators passed, including connected context |
| `npm.cmd run test:data` | 148 passed, including 30 connected-context cases |
| `npm.cmd run lint` | Passed, zero errors; six warnings from ignored prior-MVP pytest fixtures only |
| `npm.cmd run build` | Passed, TypeScript and all 427 static pages |
| `npm.cmd run test:smoke -- --output=test-results/connected-browser` | Ten Chromium tests passed |
| Protected-path content hash comparison | 121 checked, zero changed |
| `git diff --check` | Passed |

The Python alias is unusable on this machine; tests used
`C:/Users/yangz/AppData/Local/Python/pythoncore-3.14-64/python.exe`.
Pytest temporary data stays outside `web/`. Browser tests used normal Windows
process permissions to start/stop the production server, and a separate ignored
output directory to avoid earlier fixture cleanup permissions. CI is unchanged.
Decorative external Google favicons are stubbed in browser tests; original source
links are verified by destination without relying on third-party availability.

An initial test-only lint failure (unnamed framework mock components) and an
ambiguous Chinese disclosure selector were corrected before final validation.
Visual review found inherited Industry grid styles compressing nested evidence
labels; scoped disclosure styles fixed it. A browser CSS assertion protects that
layout while the existing company summaries retain their established presentation.

## Browser and visual acceptance

The three additional browser tests exercise:

1. Pentland -> exact Engineering item hash -> Pentland, keyboard-opened linkage
   rationale, legacy coverage empty state and Green Volt's unlinked company roles.
2. Projects overview role -> canonical Equinor entry -> Hywind Scotland profile;
   all rendered IDs are unique; JDR's two EFGL cable roles retain history and sources.
3. EFGL's three records in mobile Chinese and dark theme, original source text,
   Engineering project context, Industry project records, normal disclosure layout
   and absence of horizontal page overflow at 390px.

Visual inspection passed on these ignored local QA artifacts:

- `web/test-results/connected-context-desktop.png`
- `web/test-results/connected-context-mobile-zh-dark.png`
- `web/test-results/connected-industry-desktop.png`
- `web/test-results/connected-industry-mobile-zh-dark.png`

The seven existing homepage, filtering, bilingual and public-evidence journeys
also pass. Synthetic server-render cases cover more than three Engineering links,
company empty states, repeated category IDs and the no-intelligence detail variant.

## Limits and handoff

Initial Engineering coverage is deliberately six curated links across four
projects, not comprehensive news coverage. Additional links require manual
project-specific source-record review. Company context reflects only accepted
catalogue IDs and recorded roles; it is not a statement of current procurement.
Industry cards remain reader-expanded after hash navigation, as accepted.

No merge or deployment configuration change is authorized by this delivery.
Review the preview and merge the open PR manually after its final-head checks pass.
