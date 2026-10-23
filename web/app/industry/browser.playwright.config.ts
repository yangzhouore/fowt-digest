import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".", testMatch: "uk-guide.smoke.spec.ts", workers: 1, retries: 0,
  forbidOnly: Boolean(process.env.CI), reporter: "list",
  outputDir: "../../test-results/uk-industry-browser",
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "npm run start -- --hostname 127.0.0.1 --port 3100", url: "http://127.0.0.1:3100", reuseExistingServer: false },
});
