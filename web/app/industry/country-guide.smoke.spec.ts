import { test as base, expect } from "@playwright/test";

const test = base.extend<{ errors: void }>({ errors: [async ({ page }, use) => {
  const errors: string[] = [];
  await page.route("https://www.google.com/s2/favicons?**", (route) => route.fulfill({ status: 200, contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await use(); expect(errors).toEqual([]);
}, { auto: true }] });

test("overview connects four guides, comparison evidence and the unchanged company directory", async ({ page }) => {
  await page.goto("/industry");
  await expect(page.getByRole("heading", { level: 1, name: "One floating system. Four industry pathways." })).toBeVisible();
  await expect(page.locator(".country-card")).toHaveCount(4);
  await page.screenshot({ path: "test-results/international-overview-desktop.png", fullPage: false });
  await page.getByRole("link", { name: /Read the Germany guide/ }).click();
  await expect(page).toHaveURL("/industry/germany");
  await expect(page.locator('.country-nav a[aria-current="page"]')).toHaveText("Germany");
  await page.getByRole("link", { name: "Compare countries", exact: true }).click();
  const evidence = page.locator("#country-comparison .uk-evidence");
  await evidence.locator(":scope > summary").click();
  await expect(evidence.getByText(/First reading and committee referral/)).toBeVisible();
  await page.goto("/industry#company-equinor");
  await page.locator("#company-equinor details > summary").first().click();
  const more = page.locator("#company-equinor summary").filter({ hasText: "Show all project records" });
  if (await more.count()) await more.click();
  await page.locator("#company-equinor").getByRole("link", { name: "Hywind Scotland", exact: true }).click();
  await expect(page).toHaveURL("/projects/hywind-scotland");
});

for (const country of ["germany", "norway", "china"]) {
  test(`${country}: complete routes, organisation evidence and keyboard access`, async ({ page }) => {
    await page.goto(`/industry/${country}`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".uk-tier")).toHaveCount(9);
    await expect(page.locator(".country-topic")).toHaveCount(21);
    await page.screenshot({ path: `test-results/${country}-hero-desktop.png` });
    const firstTier = page.locator(".uk-tier").first();
    await firstTier.locator("summary").focus(); await page.keyboard.press("Enter");
    await expect(firstTier.locator("dl")).toBeVisible();
    const lifecycle = page.locator(`#${country}-topic-03`);
    await lifecycle.locator(":scope > summary").click();
    await expect(lifecycle.locator("tbody tr")).toHaveCount(17);
    const power = page.locator(`#${country}-topic-06`); await power.locator(":scope > summary").click();
    await expect(power.locator("tbody tr")).toHaveCount(12);
    const ownership = page.locator(`#${country}-topic-10`); await ownership.locator(":scope > summary").click();
    const revenue = page.locator(`#${country}-topic-13`); await revenue.locator(":scope > summary").click();
    if (country === "germany") await expect(revenue.getByText(/first reading and committee referral/)).toBeVisible();
    if (country === "norway") await expect(ownership.getByText(/export\/platform capacity was not upgraded/)).toBeVisible();
    if (country === "china") await expect(revenue.getByText(/not an awarded Chinese tariff/)).toBeVisible();
    await revenue.scrollIntoViewIfNeeded(); await page.screenshot({ path: `test-results/${country}-revenue-desktop.png` });
    const roles = page.locator(`#${country}-topic-19`); await roles.locator(":scope > summary").click();
    await expect(roles.locator(".uk-organisation-card")).toHaveCount(16);
    const card = roles.locator(".uk-organisation-card").first();
    await card.locator(".country-org-source > summary").click();
    await expect(card.locator(".country-source-list")).toBeVisible();
    await expect(card.getByText(/Claim scope \(English\)/).first()).toBeVisible();
    await card.scrollIntoViewIfNeeded(); await page.screenshot({ path: `test-results/${country}-roles-desktop.png` });
    const ids = await page.locator("[id]").evaluateAll((elements) => elements.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test(`${country}: Chinese mobile dark view keeps tables inside the page`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/industry/${country}`);
    await page.getByRole("button", { name: "中文", exact: true }).click();
    await page.locator('label[for="theme-dark"]').click();
    await expect(page.locator("h1")).toContainText(/。/);
    await page.screenshot({ path: `test-results/${country}-mobile-hero-zh-dark.png` });
    const lifecycle = page.locator(`#${country}-topic-03`); await lifecycle.locator(":scope > summary").click();
    await expect(lifecycle.getByRole("columnheader", { name: "推进前的条件", exact: true })).toBeVisible();
    const table = lifecycle.locator(".uk-table-scroll");
    await table.focus(); await page.keyboard.press("ArrowRight");
    await expect.poll(() => table.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await lifecycle.scrollIntoViewIfNeeded(); await page.screenshot({ path: `test-results/${country}-mobile-zh-dark.png` });
    await page.getByRole("link", { name: "国家比较", exact: true }).click();
    await expect(page).toHaveURL("/industry");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("一套浮式系统，四国产业路径。");
    await page.screenshot({ path: "test-results/international-overview-mobile-zh-dark.png" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
