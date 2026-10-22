# Browser smoke tests

Ten Chromium tests protect homepage / latest-edition navigation, Projects
filtering and expansion, project-detail navigation, language switching, public
evidence navigation, honest review states, connected Project / Engineering / Industry
journeys, unique company anchors, and mobile Chinese / dark presentation.
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
CI installs Chromium's system dependencies with `--with-deps`. Only Chromium
is configured, with one worker and no retries. Failed tests retain traces and
screenshots in ignored `test-results/`; CI uploads them only on failure.

The public-evidence and connected-context tests also save desktop and mobile Chinese/dark screenshots
in `test-results/` for visual review. These are local QA artifacts, not golden
image comparisons. External source links are checked by destination without
depending on a third-party website being available during CI.
