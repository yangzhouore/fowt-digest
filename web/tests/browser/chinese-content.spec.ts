import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fowt-digest-language", "zh"));
  await page.route("https://www.google.com/s2/favicons?**", (route) => route.fulfill({
    status: 200, contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg"/>',
  }));
});

test("Project filters keep values and open details while the language changes", async ({ page }) => {
  await page.goto("/projects");
  const country = page.locator(".project-filter-controls label").filter({ hasText: /^\s*国家/ }).locator("select");
  await country.selectOption("United Kingdom");
  const count = await page.locator(".project-index-list > li").count();
  await page.locator(".project-index-list details").first().evaluate((node) => { (node as HTMLDetailsElement).open = true; });
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator(".project-filter-controls label").filter({ hasText: /^\s*Country/ }).locator("select")).toHaveValue("United Kingdom");
  await expect(page.locator(".project-index-list > li")).toHaveCount(count);
  await expect(page.locator(".project-index-list details").first()).toHaveAttribute("open", "");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(country).toHaveValue("United Kingdom");
  await expect(country.locator("option:checked")).toHaveText("英国");
});

test("project narrative, technical headings and evidence boundaries switch to Chinese", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const slug of ["hywind-scotland", "green-volt", "campionwind"]) {
    await page.goto(`/projects/${slug}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByRole("heading", { name: "生命周期门槛", exact: true })).toBeVisible();
    await expect(page.locator(".project-intel-standfirst, .green-volt-standfirst")).toContainText(/[\u3400-\u9fff]/);
    await expect(page.locator("#watch-heading")).toContainText(/[\u3400-\u9fff]/);
    const englishName = await page.locator("h1").innerText();
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.locator("h1")).toHaveText(englishName);
    await expect(page.getByRole("heading", { name: "Lifecycle gates", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "中文", exact: true }).click();
  }
  expect(errors).toEqual([]);
});

test("About and Digital evidence prose translate while original citation links remain intact", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "每周快速浏览", exact: true })).toBeVisible();
  await page.goto("/digital-ai/signals/digifloat-windfloat-atlantic-digital-twin");
  await expect(page.locator('section[aria-labelledby="signal-summary"] > p').first()).toContainText(/[\u3400-\u9fff]/);
  const sources = await page.locator('section[aria-labelledby="signal-sources"] a[href^="http"]').evaluateAll((nodes) => nodes.map((node) => ({ href: node.getAttribute("href"), text: node.textContent })));
  await page.getByRole("button", { name: "EN", exact: true }).click();
  expect(await page.locator('section[aria-labelledby="signal-sources"] a[href^="http"]').evaluateAll((nodes) => nodes.map((node) => ({ href: node.getAttribute("href"), text: node.textContent })))).toEqual(sources);
});

test("Engineering news and Research titles are preserved when Chinese is selected", async ({ page }) => {
  await page.goto("/");
  const selector = ".engineering-highlight-list h3, .homepage-paper-list h3";
  const titles = await page.locator(selector).allTextContents();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  expect(await page.locator(selector).allTextContents()).toEqual(titles);
});

test("candidate-page interface labels translate without changing Research titles", async ({ page }) => {
  await page.goto("/");
  const firstTitle = await page.locator(".homepage-paper-list h3").first().innerText();
  const weekly = await page.getByRole("link", { name: /^查看研究摘要/ }).getAttribute("href");
  await page.goto(`${weekly}/candidates`);
  await expect(page.getByRole("heading", { name: "排序后的候选记录", exact: true })).toBeVisible();
  await expect(page.locator(".candidate-list h3").first()).toHaveText(firstTitle);
});

test("all section entry pages support mobile Chinese and dark presentation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/engineering", "/archive", "/industry", "/industry/uk", "/industry/germany", "/industry/norway", "/industry/china", "/projects", "/digital-ai", "/methodology", "/about"]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await page.locator('label[for="theme-dark"]').click();
    await expect(page.locator("main h1").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
  }
  await page.screenshot({ path: "test-results/chinese-content-mobile-dark.png", fullPage: true });
});
