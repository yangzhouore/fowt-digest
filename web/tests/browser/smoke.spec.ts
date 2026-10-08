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
