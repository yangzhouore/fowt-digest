import { test as base, expect } from "@playwright/test";

// Runtime errors can otherwise leave a readable server-rendered page behind.
const test = base.extend<{ runtimeErrors: void }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await use();
    expect(errors, "Browser runtime and console errors").toEqual([]);
  }, { auto: true }],
});

test("homepage renders the latest briefing and its Engineering / Research links work", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Floating Wind, Curated.", exact: true })).toBeVisible();

  const engineering = page.getByRole("region", { name: "Engineering", exact: true });
  const research = page.getByRole("region", { name: "Research", exact: true });
  await expect(engineering.getByRole("heading", { level: 3 }).first()).toBeVisible();
  await expect(research.getByRole("heading", { level: 3 }).first()).toBeVisible();

  // Follow the homepage's current edition, without pinning dates or reading JSON.
  const engineeringLink = engineering.getByRole("link", { name: "Explore Engineering" });
  const researchPath = await research.getByRole("link", { name: "Explore Research" }).getAttribute("href");
  const engineeringPath = await engineeringLink.getAttribute("href");
  expect(engineeringPath).toMatch(/^\/engineering\/[^/]+$/);
  expect(researchPath).toMatch(/^\/weekly\/[^/]+$/);
  await engineeringLink.click();
  await expect(page).toHaveURL(engineeringPath!);
  await expect(page.getByRole("heading", { name: "Engineering highlights", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Engineering highlights" }).getByRole("heading", { level: 3 }).first()).toBeVisible();

  await page.getByRole("link", { name: "Back to Homepage", exact: true }).click();
  await page.getByRole("link", { name: "Explore Research" }).click();
  await expect(page).toHaveURL(researchPath!);
  await expect(page.getByRole("heading", { name: "Selected papers", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Selected papers" }).getByRole("heading", { level: 3 }).first()).toBeVisible();
});

test("Projects lifecycle filter changes results and expanded roles expose missing evidence", async ({ page }) => {
  const response = await page.goto("/projects");
  expect(response?.status()).toBe(200);
  const landscape = page.getByRole("region", { name: "Project landscape", exact: true });
  const rows = landscape.getByRole("article");
  await expect(rows.first()).toBeVisible();
  const initialCount = await rows.count();
  expect(initialCount).toBeGreaterThan(1);

  await page.getByRole("combobox", { name: "Lifecycle", exact: true }).selectOption({ label: "Cancelled" });
  await expect.poll(() => rows.count()).toBeLessThan(initialCount);
  await expect(rows.first()).toBeVisible();
  await expect(landscape.getByRole("link", { name: "Hywind Tampen", exact: true })).toHaveCount(0);

  const row = rows.first();
  await expect(row.getByRole("heading", { name: "Verified Project Roles", exact: true })).toBeHidden();
  await row.getByText("Assessment, gates & milestones", { exact: true }).click();
  await expect(row.getByRole("heading", { name: "Verified Project Roles", exact: true })).toBeVisible();
  await expect(row.getByText("N/A — not verified", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await expect(rows).toHaveCount(initialCount);
  await expect(landscape.getByRole("link", { name: "Hywind Tampen", exact: true })).toBeVisible();
});

test("a project overview link opens Hywind Tampen intelligence and returns to the index", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("link", { name: "Hywind Tampen", exact: true }).click();
  await expect(page).toHaveURL("/projects/hywind-tampen");
  await expect(page.getByRole("heading", { name: "Hywind Tampen", level: 1, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lifecycle gates", exact: true })).toBeVisible();
  await expect(page.getByRole("table", { name: "Hywind Tampen readiness matrix" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Signals that would change the assessment", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to all projects", exact: true }).click();
  await expect(page).toHaveURL("/projects");
  await expect(page.getByRole("heading", { name: "Project landscape", exact: true })).toBeVisible();
});

test("language switches to Chinese, persists on navigation, and switches back", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { name: "浮式风电，精选呈现。", exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "项目", exact: true }).click();
  await expect(page.getByRole("heading", { name: "项目全景", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "项目全景", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Project landscape", exact: true })).toBeVisible();
});

test("project evidence links navigate to bounded sources and preserve review date distinctions", async ({ page }) => {
  await page.goto("/projects");
  const project = page.getByRole("article", { name: "Green Volt", exact: true });
  await expect(project.getByText("Assessment reviewed", { exact: false })).toBeVisible();
  await project.getByText("Assessment, gates & milestones", { exact: true }).click();
  await project.getByRole("link", { name: "Public evidence — Green Volt — Engineering", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/green-volt#evidence-engineering$/);
  const engineering = page.locator("#evidence-engineering");
  const disclosure = engineering.locator("summary");
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(engineering.getByRole("heading", { name: "Recorded public evidence", exact: true })).toBeVisible();
  const source = engineering.getByRole("link", { name: "Green Volt completes major survey campaign", exact: true });
  await expect(source).toHaveAttribute("href", "https://greenvoltoffshorewind.com/green-volt-completes-major-survey-campaign/");
  await expect(engineering.getByText("Public webpage inspected", { exact: false }).first()).toBeVisible();
  await engineering.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/project-evidence-desktop.png" });
  await page.getByRole("link", { name: "Review history & changes", exact: true }).click();
  await expect(page).toHaveURL(/#review-history$/);
  await expect(page.getByRole("heading", { name: /Completed public-source review/ })).toBeVisible();
  await page.getByText("Recorded changes", { exact: false }).last().click();
  await expect(page.getByText("Before", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("After", { exact: true }).first()).toBeVisible();
});

test("legacy profiles show unrecorded reviews and stored evidence, with explicit empty areas", async ({ page }) => {
  await page.goto("/projects/hywind-scotland");
  await expect(page.getByText("Assessment review: not recorded", { exact: true })).toBeVisible();
  await expect(page.getByText("No assessment review history recorded", { exact: true })).toBeVisible();
  await page.locator("#evidence-permitting summary").click();
  await expect(page.locator("#evidence-permitting").getByText("No linked evidence recorded", { exact: true })).toBeVisible();
  await page.locator("#evidence-engineering summary").click();
  await expect(page.locator("#evidence-engineering").getByText("Stored source-backed record", { exact: true }).first()).toBeVisible();
});

test("public evidence stays accessible on mobile in Chinese and dark theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/hywind-tampen");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { name: "各准备度领域的公开证据", exact: true })).toBeVisible();
  const gate = page.locator("#evidence-financing-fid");
  await gate.locator("summary").click();
  await expect(gate.getByRole("link", { name: "Investing in Hywind Tampen development", exact: true })).toBeVisible();
  await expect(gate.getByText("已查阅公开网页", { exact: false })).toBeVisible();
  await page.locator('label[for="theme-dark"]').click();
  await expect(page.locator("#theme-dark")).toBeChecked();
  await gate.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/project-evidence-mobile-zh-dark.png" });
  await page.reload();
  await expect(page.getByRole("heading", { name: "各准备度领域的公开证据", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
