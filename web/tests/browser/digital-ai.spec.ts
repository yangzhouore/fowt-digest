import { test as base, expect } from "@playwright/test";

const test = base.extend<{ runtimeErrors: void }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await use();
    expect(errors, "Digital & AI runtime and console errors").toEqual([]);
  }, { auto: true }],
});

test.beforeEach(async ({ page }) => {
  await page.goto("/digital-ai");
});

test("energy guide explains all seven fields from reader and developer perspectives", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI × Energy");
  await page.screenshot({ path: "test-results/ai-energy-overview-desktop.png", fullPage: false });
  const field = page.locator("#energy-field-detail");
  for (const id of ["compute", "weather", "wind", "hybrids", "grid", "floating", "procurement"]) {
    const button = page.locator(`#energy-${id}`);
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(field).toHaveAttribute("data-field", id);
    await expect(field.getByRole("heading", { name: "What to ask", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "I build or evaluate tools", exact: true }).click();
    await expect(field.getByText(/^Illustrative starting point:/)).toBeVisible();
    await expect(field.getByRole("link").first()).toHaveAttribute("href", /^https:\/\//);
    await page.getByRole("button", { name: "I want to understand", exact: true }).click();
  }
  await page.locator("#energy-floating").click();
  await field.getByRole("link", { name: "Explore the related wind example", exact: false }).click();
  await expect(page.locator("#digital-ai-use-case")).toHaveAttribute("data-use-case", "twin");
  await page.goto("/digital-ai#energy-procurement");
  await expect(field).toHaveAttribute("data-field", "procurement");
  await expect(field.getByText(/Annual renewable matching and hourly matching/)).toBeVisible();
  await field.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/ai-energy-fields-desktop.png" });
});

test("dated developments distinguish projections, contracts and conditional future pathways", async ({ page }) => {
  const updates = page.locator("#energy-updates");
  await expect(updates.locator("ol > li")).toHaveCount(6);
  await expect(updates.locator("li > p").filter({ hasText: "Conditional projection" })).toBeVisible();
  for (const item of await updates.locator("ol > li").all()) {
    await expect(item.locator("time")).toHaveAttribute("datetime", /^2026-/);
    await item.locator("summary").click();
    await expect(item.getByText("Does not establish", { exact: false })).toBeVisible();
    await expect(item.getByRole("link").first()).toHaveAttribute("href", /^https:\/\//);
  }
  await page.getByRole("navigation", { name: "AI and energy reading guide" }).getByRole("link", { name: "What could come next" }).click();
  await expect(page.getByRole("heading", { name: "Three pathways, with conditions attached" })).toBeInViewport();
  const future = page.locator("#energy-future");
  await expect(future.getByRole("article")).toHaveCount(3);
  await expect(future.getByText(/not deployment forecasts/)).toBeVisible();
  await expect(future.getByText(/No integrated FOWT-to-AI deployment is established/)).toBeVisible();
  await page.screenshot({ path: "test-results/ai-energy-outlook-desktop.png" });
});

test("energy system stays readable on mobile in Chinese and dark theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await page.locator('label[for="theme-dark"]').click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI × 能源");
  await page.screenshot({ path: "test-results/ai-energy-overview-mobile-zh-dark.png", fullPage: false });
  await page.getByRole("button", { name: "我开发或评估工具", exact: true }).click();
  for (const id of ["compute", "weather", "wind", "hybrids", "grid", "floating", "procurement"]) {
    await page.locator(`#energy-${id}`).click();
    await expect(page.locator("#energy-field-detail").getByText(/^示意起点：/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.getByText("读懂新闻标题的六组术语", { exact: true }).click();
  await expect(page.getByText("年度 / 逐时匹配", { exact: true })).toBeVisible();
  await page.locator("#energy-fields-heading").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/ai-energy-fields-mobile-zh-dark.png" });
  await page.getByRole("navigation", { name: "AI 与能源阅读导航" }).getByRole("link", { name: "未来可能怎样" }).click();
  await expect(page.getByRole("heading", { name: "三条带有前提条件的路径" })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/ai-energy-outlook-mobile-zh-dark.png" });
});

test("all ten applications explain inputs, decisions and evidence without runtime errors", async ({ page }) => {
  const card = page.locator("#digital-ai-use-case");
  const ids = ["forecasting", "engineering", "vision", "planning", "control", "twin", "predictive", "autonomy", "cable", "grid"];
  for (const id of ids) {
    const button = page.locator(`[data-impact-id="${id}"]`);
    await button.click();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(card).toHaveCount(1);
    await expect(card).toHaveAttribute("data-use-case", id);
    for (const label of ["Illustrative workflow", "Typical inputs", "Method", "Output", "Human decision"]) {
      await expect(card.getByText(label, { exact: true })).toBeVisible();
    }
    if (["vision", "planning"].includes(id)) {
      await expect(card.getByText("No supporting example recorded in this collection.", { exact: true })).toBeVisible();
      await expect(card.getByRole("link")).toHaveCount(0);
    } else {
      await expect(card.getByRole("link").first()).toHaveAttribute("href", /^https:\/\//);
      await expect(card.getByText(/Stored access date: 2026-08-24/).first()).toBeVisible();
    }
  }
  const idsInPage = await page.locator("[id]").evaluateAll((items) => items.map((item) => item.id));
  expect(new Set(idsInPage).size).toBe(idsInPage.length);
});

test("keyboard selection announces a short title and resets expanded evidence", async ({ page }) => {
  const button = page.locator('[data-impact-id="twin"]');
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toBeFocused();
  await expect(page.getByRole("status")).toHaveText("Investigate mooring condition");
  const card = page.locator("#digital-ai-use-case");
  await expect(card.getByText("An anomaly is not a confirmed mooring failure.", { exact: false })).toBeVisible();
  const more = card.locator("summary");
  await more.focus();
  await page.keyboard.press("Enter");
  await expect(card.getByText(/Exact sensor inventories/)).toBeVisible();
  await expect(card.getByRole("link", { name: /Original source/ })).toHaveCount(3);
  await expect(card.getByRole("link", { name: /^Read evidence/ })).toHaveCount(3);
  await page.locator('[data-impact-id="autonomy"]').click();
  await expect(card.locator("details")).not.toHaveAttribute("open", "");
  await expect(card.getByText(/Robotic inspection does not demonstrate autonomous repair/)).toBeVisible();
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/digital-ai-desktop-en-light.png" });
  await page.locator('label[for="theme-dark"]').click();
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/digital-ai-desktop-en-dark.png" });
});

test("mobile bilingual cards follow the selected stage without duplicate content or overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const language of ["en", "zh"]) {
    if (language === "zh") await page.getByRole("button", { name: "中文", exact: true }).click();
    for (const id of ["forecasting", "engineering", "vision", "planning", "control", "twin", "predictive", "autonomy", "cable", "grid"]) {
      await page.locator(`[data-impact-id="${id}"]`).click();
      const card = page.locator("#digital-ai-use-case");
      await expect(card).toHaveCount(1);
      const layout = await card.evaluate((element) => {
        const previous = element.previousElementSibling!;
        return { previousSelected: Boolean(previous.querySelector('button[aria-pressed="true"]')), gap: element.getBoundingClientRect().top - previous.getBoundingClientRect().bottom };
      });
      expect(layout.previousSelected).toBe(true);
      expect(Math.abs(layout.gap)).toBeLessThanOrEqual(2);
      await expect(card.getByText(language === "zh" ? "人工决策" : "Human decision", { exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
  await page.locator('[data-impact-id="twin"]').click();
  const card = page.locator("#digital-ai-use-case");
  await expect(card.getByRole("heading", { level: 3 })).toHaveText("研究系泊系统状态");
  await expect(card.getByRole("heading", { level: 4 })).toContainText("SUBSEE");
  await card.locator("summary").click();
  await expect(card.getByText(/具体传感器清单/)).toBeVisible();
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/digital-ai-mobile-zh-light.png" });
  await page.locator('label[for="theme-dark"]').click();
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/digital-ai-mobile-zh-dark.png" });
});

test("unverified context stays qualified and existing power pathways and filters work", async ({ page }) => {
  await page.locator('[data-impact-id="cable"]').click();
  await expect(page.locator("#digital-ai-use-case").getByText("Stored context · source not rechecked", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Offshore compute/ }).click();
  await expect(page.locator(".digital-ai-pathway-detail")).toContainText("A conceptual direct-power pathway");
  await page.locator(".digital-ai-evidence-drawer > summary").click();
  await expect(page.locator(".digital-ai-evidence-list > li")).toHaveCount(14);
  await page.getByRole("combobox", { name: /^Topic/ }).selectOption("digital_twin");
  const count = await page.locator(".digital-ai-evidence-list > li").count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(14);
  await page.getByRole("combobox", { name: /^Maturity/ }).selectOption("pilot_demonstration");
  await page.getByRole("combobox", { name: /^Region/ }).selectOption("Europe");
  expect(await page.locator(".digital-ai-evidence-list > li").count()).toBeGreaterThan(0);
});

test("internal reading links return to the exact application and preserve source boundaries", async ({ page, request }) => {
  await page.locator('[data-impact-id="twin"]').click();
  await page.locator("#digital-ai-use-case").getByRole("link", { name: /^Read evidence/ }).click();
  await expect(page).toHaveURL(/\/digital-ai\/signals\/subsee-4d-floating-wind-mooring-digital-twin$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("SUBSEE");
  await expect(page.getByRole("heading", { name: "Stored editorial relevance", exact: true })).toBeVisible();
  await expect(page.getByText(/not full papers or private project documentation/)).toBeVisible();
  await expect(page.getByRole("link", { name: /SUBSEE 4D: A digital twin/ })).toHaveAttribute("href", /^https:\/\//);
  await page.screenshot({ path: "test-results/digital-ai-reader-desktop-en-light.png" });
  await page.getByRole("link", { name: "Investigate mooring condition", exact: true }).click();
  await expect(page.locator("#digital-ai-use-case")).toHaveAttribute("data-use-case", "twin");
  await expect(page.locator('[data-impact-id="twin"]')).toHaveAttribute("aria-pressed", "true");
  const response = await request.get("/digital-ai/signals/not-a-real-signal");
  expect(response.status()).toBe(404);
  await page.locator('[data-impact-id="cable"]').click();
  await page.locator("#digital-ai-use-case").getByRole("link", { name: /^Read evidence/ }).click();
  await expect(page.getByText("Stored context · source not rechecked", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Back to all evidence/ }).click();
  await expect(page.locator("#digital-ai-all-evidence")).toHaveAttribute("open", "");
  const record = page.locator(".digital-ai-evidence-list > li").first();
  await record.locator("summary").click();
  await record.getByRole("link", { name: /^Read evidence/ }).click();
  await expect(page).toHaveURL(/\/digital-ai\/signals\//);
});

test("all pathways compare physical routes, procurement and contextual evidence", async ({ page }) => {
  for (const id of ["land", "coastal", "offshore", "flexible"]) {
    const button = page.locator(`#pathway-${id}`);
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const detail = page.locator("#digital-ai-pathway-selected");
    await expect(detail.getByText("Possible procurement", { exact: true })).toBeVisible();
    if (["coastal", "offshore"].includes(id)) {
      await expect(detail.getByText("No supporting project example recorded in this collection.", { exact: true })).toBeVisible();
      await expect(detail.getByRole("link")).toHaveCount(0);
    }
  }
  await expect(page.locator("#digital-ai-pathway-selected")).toContainText("Neither establishes a deployed");
  await page.locator("#digital-ai-pathway-selected").getByRole("link", { name: /^Read supporting context/ }).first().click();
  await page.getByRole("link", { name: "Flexible compute + energy · Context only", exact: true }).click();
  await expect(page.locator("#pathway-flexible")).toHaveAttribute("aria-pressed", "true");
  const comparison = page.locator("summary").filter({ hasText: "Compare all four pathways" });
  await comparison.focus();
  await page.keyboard.press("Enter");
  const table = page.getByRole("table", { name: /Wind-to-compute/ });
  await expect(table.getByRole("columnheader")).toHaveCount(5);
  await expect(table.getByRole("rowheader")).toHaveCount(5);
  await page.getByRole("region", { name: "Pathway comparison table", exact: true }).screenshot({ path: "test-results/digital-ai-pathways-desktop-en-light.png" });
});

test("reader and bounded comparison work on mobile in Chinese and dark theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await page.locator('label[for="theme-dark"]').click();
  await page.locator("summary").filter({ hasText: "比较全部四条路径" }).click();
  const region = page.getByRole("region", { name: "路径比较表", exact: true });
  await region.focus();
  expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await region.screenshot({ path: "test-results/digital-ai-pathways-mobile-zh-dark.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator("#pathway-land").click();
  await page.locator("#digital-ai-pathway-selected").getByRole("link", { name: /^阅读背景证据/ }).click();
  await expect(page.getByRole("heading", { name: "证据范围与局限", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("IEA");
  // Existing theme radios belong to each page header; this feature does not
  // introduce a site-wide theme persistence service.
  await page.locator('label[for="theme-dark"]').click();
  await expect(page.locator("#theme-dark")).toBeChecked();
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/digital-ai-reader-mobile-zh-dark.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("link", { name: /返回全部证据/ }).click();
  await expect(page.locator("#digital-ai-all-evidence")).toHaveAttribute("open", "");
  await expect(page.locator("#digital-ai-all-evidence > summary")).toContainText("浏览全部证据");
  await page.getByRole("combobox", { name: /^主题/ }).selectOption("digital_twin");
  await page.getByRole("combobox", { name: /^地区/ }).selectOption("Global");
  await expect(page.getByText(/没有匹配这些筛选条件的记录/)).toBeVisible();
  await page.getByRole("button", { name: "清除筛选", exact: true }).click();
  await expect(page.locator(".digital-ai-evidence-list > li")).toHaveCount(14);
});
