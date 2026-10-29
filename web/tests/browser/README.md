# Browser smoke tests

Twenty-five Chromium tests protect homepage / latest-edition navigation, Projects
filtering and expansion, project-detail navigation, language switching, public
evidence navigation, honest review states, connected Project / Engineering / Industry
journeys, unique company anchors, and mobile Chinese / dark presentation.
They also cover all ten Digital & AI application cards, evidence filters,
four pathways and comparison scrolling, internal evidence readers and exact
return contexts, Engineering date/year search and region filters, Research
search/paper/edition/candidate navigation, and Methodology/About mobile reading.
The broader AI × Energy guide adds seven-field reader/developer selection,
related wind-example navigation, dated developments, conditional future pathways
and English/Chinese desktop/mobile presentation.
The unified guide additionally checks one ordered chapter navigation, contextual
workflow selection without stale cards, both evidence collections, all ten task
deep links, related development links and browser back/forward. Existing workflow
journeys select the parent topic before its task; the separate lifecycle map is removed.
They use visible reader-facing content, not dataset counts or fixed edition dates.
Uncaught browser errors and console errors fail the tests. Decorative Google
company favicons are stubbed so third-party availability cannot affect acceptance.

From `web/`, run:

```sh
npm ci
npx playwright install chromium
npm run build
npm run test:smoke
```

Playwright starts and stops the production server on `127.0.0.1:3100`; the build
must already exist. Stop any other server on that port before running. Linux
CI uses the official Playwright Noble image with browsers and system dependencies
preinstalled. The workflow pins the image version/digest and checks it against
the installed `@playwright/test` version; update these together. Local Linux
setup can use `npx playwright install --with-deps chromium`. Only Chromium
is configured, with one worker and no retries. Failed tests retain traces and
screenshots in ignored `test-results/`; CI uploads them only on failure.

The public-evidence and connected-context tests also save desktop and mobile Chinese/dark screenshots
in `test-results/` for visual review. These are local QA artifacts, not golden
image comparisons. External source links are checked by destination without
depending on a third-party website being available during CI.

## Industry guide acceptance

The shared suite checks the company directory and connected project journeys.
The four country guides have a separate local suite; CI does not run this
additional browser command. Run it sequentially after the shared suite because
both configurations own port 3100:

```powershell
node --test data/industry/country-guides.test.js data/industry/uk-guide.test.js
npx.cmd playwright test --config=app/industry/browser.playwright.config.ts
```

This adds 62 Node checks and 12 Chromium journeys for the overview and
UK/Germany/Norway/China guides, keyboard disclosures, source scopes, country
navigation and 390px Chinese/dark table scrolling. Both suites fail on runtime
and console errors. Screenshots are local review artifacts, not golden-image
assertions. On Windows, use a terminal with normal process permissions so
Playwright can stop its production server; a shutdown stall is not a passed run.

## Presentation boundaries

Language persists in `localStorage`; source records keep their original text.
Theme uses CSS and the current page header's radio inputs; it resets with a new
page header and is not a persistent site preference. Exercise English/Chinese
and light/dark independently. Existing About and legacy metadata/candidate copy
is partly English even in Chinese mode; these checks do not claim full textual
translation. See [the maintenance review](../../../docs/WEBSITE_MAINTENANCE.md)
for the section map, validation evidence and remaining limits.
