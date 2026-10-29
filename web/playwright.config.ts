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
    // Dedicated local server: never query real providers with inherited secrets.
    env: {
      ADMIN_ANALYTICS_USERNAME: "smoke-owner",
      ADMIN_ANALYTICS_PASSWORD: "smoke-only-password-32-characters-long",
      VERCEL_TOKEN: "",
      GITHUB_TOKEN: "",
    },
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: baseURL,
    reuseExistingServer: false,
  },
});
