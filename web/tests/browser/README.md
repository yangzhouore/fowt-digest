# Browser smoke tests

Four Chromium tests protect homepage / latest-edition navigation, Projects
filtering and expansion, project-detail navigation, and language switching.
They use visible reader-facing content, not dataset counts or fixed edition dates.
Uncaught browser errors and console errors fail the tests.

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
