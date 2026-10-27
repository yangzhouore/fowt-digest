# Website Maintenance and Code Review

Reviewed 2026-10-26 against `main` at `580a83e` (merged weekly PR #48).
Branch: `chore/codebase-review-documentation`.

## Outcome and Scope

The requested outcome is a section-by-section code review, corrected maintenance
documentation, and a working website with the existing presentation. This is
maintenance of the accepted product, not a new MVP. Deliver one PR after local
acceptance; leave merging to the user.

Assumptions: committed records remain authoritative; English/Chinese switching
and light/dark styling keep their current behavior. Review routes, adapters,
client interactions, provenance, pipeline/publication boundaries and validation.
Fix demonstrated defects with the smallest change. Prefer documenting existing
boundaries over refactoring or expanding product scope.

Success criteria: full repository baseline passes; shared and country-guide
browser checks pass; current routes and source records are preserved; docs map
the actual implementation and distinguish local checks from remote CI.

## Section Map and Review Results

Paths below are relative to the repository root.

| Section | Routes and implementation | Data ownership and preserved behavior | Result |
| --- | --- | --- | --- |
| Home | `/`; `web/app/page.tsx`, `homepage-weekly-briefing.tsx` | Joins registered Research/Engineering editions by slug; newest paired week is the default. Five-item previews, week picker and exact edition links remain. | Production build and shared navigation/language checks pass. |
| Engineering | `/engineering`, `/engineering/[slug]`, `/engineering/[slug]/candidates`; `engineering-search.tsx`, `web/data/engineering-briefing-adapter.ts` | Independent `web/data/briefings/*.json` and source registry. Selected highlights, source references, scores, diversity and retained/reconstructed pool distinctions remain separate. Region inference is a presentation fallback for missing region fields. | Fixed edition-date/year search; browser regression proves date search, region combination, clearing and empty state. Existing item anchors and Project return journeys pass. |
| Research | `/archive`, `/weekly/[slug]`, `/weekly/[slug]/candidates`, `/papers/[slug]`; `archive-search.tsx`, `digest-adapter.ts`, `research-candidate-adapter.ts` | Pipeline output in `web/data/digests/`; separately registered candidate pools in `web/data/research-candidates/`. Search uses committed title/author/source/topic/edition context. Weekly abstracts are previews; paper pages retain full stored abstracts or explicit absence. | Data/selection tests and browser search → paper → edition → candidate-source journey pass; unknown paper returns 404. Latest partial-coverage note is preserved. |
| Industry | `/industry`, `/industry/uk`, `/industry/germany`, `/industry/norway`, `/industry/china`; overview/navigation and UK/shared-country renderers | `industry-map.ts` owns the 47-company directory. UK uses `uk-system-guide.json`; the other guides use `country-guides.ts`, country fixtures and shared source/content/builders. Guide evidence is independent of authoritative Projects. | Build-time assertions, 62 focused Node checks and 12 guide browser journeys pass. Canonical company anchors, country navigation, keyboard disclosures and table scrolling remain. |
| Projects | `/projects`, `/projects/[slug]`; `project-filters.tsx`, detail route, `project-public-evidence.tsx` | `projects.json` owns 48 factual/intelligence records. `public-evidence.json` separately maps facts/events/roles to six evidence areas, reviews and changes. Facts, editorial readiness, FID and completed/partial review dates remain distinct. | Validators, server-render tests and desktop/mobile browser checks pass. Filters include region, country, lifecycle, FID, capacity and paired readiness area/state. Green Volt retains its bespoke detail layout. |
| Connected context | Components in Project, Engineering and Industry pages; `connected-context-adapter.ts`, `context-navigation.ts` | Only explicit `web/data/context/project-engineering-links.json` associations and recorded `industryCompanyId` roles resolve. No name matching, inferred contracts or automatic synchronization. Invalid evidence references fail closed. | Bidirectional item/project navigation, canonical company destinations, source scopes and honest empty states pass. |
| Digital & AI | `/digital-ai`, `/digital-ai/signals/[slug]`; `signal-filters.tsx`, `use-case-card.tsx`, `pathway-comparison.tsx`, `signal-reader.tsx` | Independent `signals.json`, `use-cases.json`, `pathways.json`, `reader-notes.json` and adapter. Fourteen Signals support ten application cards and four illustrative energy pathways. Context, source-review dates, stored/unverified evidence and deployment maturity remain distinct. | Data/server-render checks and seven shared browser journeys pass, including keyboard controls, hash return contexts, filters, comparison scrolling and unknown-reader 404. |
| Methodology and About | `/methodology`, `/about`; their `page.tsx` files | Static explanatory copy. Methodology describes the independent Research/Engineering selection models and five content areas; it never runs selection. | Mobile language controls, HTML language, dark-theme controls and page overflow checks pass. Existing partial English copy remains visible in Chinese mode. |
| Shared presentation | `layout.tsx`, `site-header.tsx`, `site-footer.tsx`, `globals.css`, `web/app/i18n/`, section CSS modules/inline guide styles | Language uses a localStorage-backed external store and changes `html.lang`. Theme uses CSS/header radio state; it does not persist when a new page header mounts. No runtime translation. | Existing bilingual navigation and mobile/dark journeys pass. No styles, page markup or source datasets were redesigned. |
| Pipeline and publishing | `pipeline/`, `tools/publication_workflow.py`, `.github/workflows/ci.yml` | Collection → normalization → deduplication → classification → ranking → digest assembly remains local/deterministic. Publisher copies an accepted digest and refreshes Research registration. Candidate pools/Engineering registration are separate reviewed artifacts. | 210 Python tests pass. Publication helper retains stop-on-first-failure validation; website imports no pipeline stages. |

## Changes Made

1. Engineering's placeholder promises year search, but the filter previously
   searched only item/source text. On the unchanged baseline, the regression
   returned 11 editions for the latest year while 33 editions carried that year.
   Add the edition's formatted date range and ISO slug to the existing search
   text. Region rules, item order, source records, counts and default rendering
   are unchanged. The same regression now passes.
2. Add three shared browser journeys for Engineering search, Research provenance
   navigation/empty states, and Methodology/About mobile language/theme reading.
   These cover reader behavior; they do not assert implementation text.
3. Correct `START_HERE.md` and `PROJECT_STATUS.md`: weekly PR #48 is merged,
   Projects has seven filter controls, and the current task is maintenance.
4. Expand `README.md` and `PROJECT_HANDOVER.md` with country guides, evidence
   readers, public-evidence/context ownership and production inspection steps.
5. Correct publishing validation coverage and browser test documentation,
   including the current pinned Playwright CI container and separate Industry
   acceptance suite. Historical milestone/design docs remain historical records.

## Running and Maintaining the Website

Install pytest and website dependencies as described in `../README.md`.
Use the committed `web/package-lock.json` with `npm.cmd ci`; CI uses Python 3.14
and Node 24. From `web/`, `npm.cmd run dev` serves development on port 3000.
Stop it before production inspection with `npm.cmd run build` then
`npm.cmd run start`. Next.js may regenerate `next-env.d.ts` when switching
development/production; review generated changes separately from intended work.

The baseline, from the repository root:

```powershell
python -m pytest pipeline/tests
cd web
npm.cmd run validate:data
npm.cmd run test:data
npm.cmd run lint
npm.cmd run build
npm.cmd run test:smoke
node --test data/industry/country-guides.test.js data/industry/uk-guide.test.js
npx.cmd playwright test --config=app/industry/browser.playwright.config.ts
cd ..
git diff --check
git status
```

Install the matching Chromium browser before browser acceptance; see
`../web/tests/browser/README.md`. Run browser suites sequentially: both own
`127.0.0.1:3100` and require a completed production build. Windows process
permissions must allow the runner to shut down its own server.

Research publication instructions are in `WEBSITE_PUBLISHING_WORKFLOW.md`.
For other sections, edit their own curated data and provenance references,
validate, inspect rendering and open an accepted PR. Site publishing continues
through Vercel Git integration after manual merge to `main`.

## Local Acceptance on 2026-10-26

| Check | Result |
| --- | --- |
| Python pipeline tests | 210 passed |
| `validate:data` | All six validator commands passed |
| `test:data` | 155 passed |
| Focused Industry Node suites | 62 passed |
| ESLint | Passed |
| Production build | Passed; 454 static pages, same route inventory as the base |
| Shared Chromium suite | 20 passed (17 existing + 3 new) |
| Focused Industry Chromium suite | 12 passed |
| `git diff --check` | Passed |
| Built-HTML internal link audit | 5,143 internal anchor destinations resolve to built routes across 455 HTML artifacts, including framework error pages |

Representative generated screenshots were visually inspected for Digital & AI
desktop/light, Methodology mobile Chinese/dark and a Germany mobile guide table.
The table deliberately scrolls within its own region. The link audit checked
route existence, not every fragment target or client-only disclosure state.

The baseline Engineering regression deliberately failed before the fix.
Its initial sandboxed run also stalled during Windows server cleanup; completed
acceptance runs used normal process permissions and exited successfully.
Expected invalid-reader requests produce a Next.js server `NoFallbackError`
diagnostic while returning the tested 404; browser runtime/console assertions
passed. These local results do not imply remote CI or a Vercel preview passed.
Check the final PR head separately.

## Limits and Remaining Risks

- No source facts were recollected or re-audited in this maintenance review.
  External links were checked as destinations by existing tests, not as proof
  that every external site is currently reachable or every dated claim current.
- Research coverage for 2026-10-25 remains partial. Stored candidate notes retain
  the continuation-request failures and collection cap; passing validation does
  not establish exhaustive coverage.
- Browser acceptance uses Chromium, including 390px mobile viewports; this is
  not a Safari/Firefox or real-device certification.
- Screenshots are local visual-review artifacts, not golden-image comparisons.
  The unchanged CSS, markup and data plus browser assertions support preservation
  of presentation; they do not constitute a pixel-by-pixel production comparison.
- Chinese mode does not translate every legacy metadata/candidate/About string.
  Language persistence requires available localStorage; theme persistence is
  not implemented. These existing behaviors were documented, not expanded.
- Decorative company favicons still depend on Google in normal browsing. Tests
  stub them so external availability does not obscure application regressions.
- No backend, collection/scoring changes, new pipeline stages, deployment
  automation, dependency upgrades, merge or production deployment are included.
