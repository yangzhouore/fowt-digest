import { test as base, expect } from "@playwright/test";

// Runtime errors can otherwise leave a readable server-rendered page behind.
const test = base.extend<{ runtimeErrors: void }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    // Company favicons are decorative third-party images, outside the app contract.
    await page.route("https://www.google.com/s2/favicons?**", (route) => route.fulfill({ status: 200, contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }));
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await use();
    expect(errors, "Browser runtime and console errors").toEqual([]);
  }, { auto: true }],
});

test("project coverage opens the exact Engineering item and returns to its project", async ({ page }) => {
  await page.goto("/projects/pentland-floating-offshore-wind-farm");
  const coverage = page.getByRole("region", { name: "Engineering coverage", exact: true });
  await expect(coverage.getByText("Source date", { exact: false })).toBeVisible();
  const why = coverage.locator("summary").first();
  await why.focus();
  await page.keyboard.press("Enter");
  await expect(coverage.getByText(/The extract below comes from the stored source record/)).toBeVisible();
  await coverage.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/connected-context-desktop.png" });
  await coverage.getByRole("link", { name: /^Read Engineering item/ }).click();
  await expect(page).toHaveURL(/\/engineering\/2026-10-11#item-eng-item-2026-10-11-pentland-anchor-engineering$/);
  const item = page.locator("#item-eng-item-2026-10-11-pentland-anchor-engineering");
  await expect(item).toBeInViewport();
  await item.getByRole("link", { name: "Pentland Floating Offshore Wind Farm", exact: true }).click();
  await expect(page).toHaveURL("/projects/pentland-floating-offshore-wind-farm");
  await page.goto("/projects/hywind-scotland");
  await expect(page.getByText("No project-specific Engineering coverage linked", { exact: true })).toBeVisible();
  await page.goto("/projects/green-volt");
  await expect(page.getByRole("link", { name: /^Industry entry/ })).toHaveCount(0);
});

test("recorded participants connect Projects to canonical Industry entries and other projects", async ({ page }) => {
  await page.goto("/projects");
  const project = page.getByRole("article", { name: "Hywind Tampen", exact: true });
  await project.getByText("Assessment, gates & milestones", { exact: true }).click();
  await project.getByRole("link", { name: "Industry entry — Equinor", exact: true }).first().click();
  await expect(page).toHaveURL(/\/industry#company-equinor$/);
  const company = page.locator("#company-equinor");
  await expect(company).toBeInViewport();
  const summary = company.locator("details > summary").first();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(company.getByRole("heading", { name: /^Project records/ })).toBeVisible();
  await expect(company.getByText(/A link does not establish a current supply contract/)).toBeVisible();
  const more = company.locator("summary").filter({ hasText: "Show all project records" });
  if (await more.count()) await more.click();
  await company.getByRole("link", { name: "Hywind Scotland", exact: true }).click();
  await expect(page).toHaveURL("/projects/hywind-scotland");
  await expect(page.getByRole("link", { name: "Industry entry — Equinor", exact: true }).first()).toBeVisible();
  await page.goto("/industry");
  const ids = await page.locator("[id]").evaluateAll((elements) => elements.map((element) => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  await expect(page.locator('[id^="company-"]')).toHaveCount(47);
  const cables = page.locator("#company-jdr-cables");
  await cables.locator("details > summary").first().click();
  const cableRoles = cables.locator('[data-context-relationship^="rel-supply-efgl-jdr-"]');
  await expect(cableRoles).toHaveCount(2);
  for (const role of await cableRoles.all()) {
    await expect(role.getByText("Historical role", { exact: false })).toBeVisible();
    await expect(role.getByText("Delivered cables", { exact: true })).toBeVisible();
  }
  await cableRoles.first().locator("summary").click();
  await expect(cableRoles.first().getByRole("link").first()).toHaveAttribute("href", /^https:\/\//);
  await cables.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/connected-industry-desktop.png" });
});

test("connected context works in mobile Chinese and dark theme without translating source records", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/efgl");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await page.locator('label[for="theme-dark"]').click();
  const coverage = page.getByRole("region", { name: "工程报道", exact: true });
  await expect(coverage.getByRole("link", { name: /^阅读工程条目/ })).toHaveCount(3);
  await coverage.locator("summary").first().click();
  await expect(coverage.getByText(/此已发布条目报道该项目的活动/).first()).toBeVisible();
  await expect(coverage.locator(".context-stored-excerpt").first()).toContainText("EFGL");
  await coverage.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/connected-context-mobile-zh-dark.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await coverage.getByRole("link", { name: /^阅读工程条目/ }).first().click();
  await expect(page.getByText("项目背景", { exact: true }).first()).toBeVisible();
  await page.goto("/industry#company-equinor");
  await page.locator('label[for="theme-dark"]').click();
  const company = page.locator("#company-equinor");
  await company.locator("details > summary").first().click();
  await expect(company.getByRole("heading", { name: /^项目记录/ })).toBeVisible();
  await expect(company.locator(".context-company-role summary").first()).toHaveCSS("display", "list-item");
  await expect(page.locator("#theme-dark")).toBeChecked();
  await company.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/connected-industry-mobile-zh-dark.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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

test("Engineering search matches edition dates and combines with region filters", async ({ page }) => {
  await page.goto("/engineering");
  const editions = page.locator(".engineering-briefing-editions > li");
  const initialCount = await editions.count();
  const firstDate = await editions.first().locator(".engineering-briefing-card-meta > p").first().innerText();
  const year = firstDate.match(/\b\d{4}\b/)![0];
  const expectedCount = await editions.filter({ has: page.locator(".engineering-briefing-card-meta > p:first-child", { hasText: year }) }).count();
  const input = page.getByRole("searchbox");
  await input.fill(year);
  await expect(editions).toHaveCount(expectedCount);
  await input.fill(firstDate);
  await expect(editions).toHaveCount(1);
  await page.getByRole("button", { name: "Europe", exact: true }).click();
  for (const context of await page.locator(".engineering-news-copy > p").allTextContents()) {
    expect(context).toContain("Europe");
  }
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(editions).toHaveCount(initialCount);
  await input.fill("no-such-engineering-record-xyz");
  await expect(page.getByText("No matching news in the engineering archive.", { exact: true })).toBeVisible();
});

test("Research search opens a paper, its edition and candidate provenance", async ({ page, request }) => {
  await page.goto("/archive");
  const title = await page.locator(".research-archive-item-copy > a").first().innerText();
  const input = page.getByRole("searchbox");
  await input.fill(title);
  const result = page.locator(".archive-search-results > li").first();
  const editionPath = await result.getByRole("link", { name: "View weekly digest", exact: true }).getAttribute("href");
  await result.getByRole("heading").getByRole("link").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(page.getByRole("heading", { name: "Abstract", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to the weekly digest", exact: true }).click();
  await expect(page).toHaveURL(editionPath!);
  await page.getByRole("link", { name: /candidates reviewed/ }).click();
  await expect(page.getByRole("heading", { name: "Ranked candidates", exact: true })).toBeVisible();
  await expect(page.locator(".candidate-source a").first()).toHaveAttribute("href", /^https:\/\//);
  expect((await request.get("/papers/not-a-real-paper")).status()).toBe(404);
  await page.goto("/archive");
  await page.getByRole("searchbox").fill("no-such-research-record-xyz");
  await expect(page.getByText("No matching papers in the static archive.", { exact: true })).toBeVisible();
});

test("Methodology and About render bilingual static reading paths on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/methodology", "/about"]) {
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("button", { name: "中文", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await page.locator('label[for="theme-dark"]').click();
    await expect(page.locator("#theme-dark")).toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/${path.slice(1)}-mobile-zh-dark.png` });
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  }
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
