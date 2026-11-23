import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/browser",
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node --require ./tests/browser/fixtures/subscribe-services.cjs ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100",
    env: { SUBSCRIBE_BROWSER_FIXTURE: "1" },
    url: baseURL,
    reuseExistingServer: false,
  },
});
