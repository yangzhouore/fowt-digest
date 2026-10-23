import { test as base, expect } from "@playwright/test";

const test = base.extend<{ errors: void }>({ errors: [async ({ page }, use) => {
  const errors: string[] = [];
  await page.route("https://www.google.com/s2/favicons?**", (route) => route.fulfill({ status: 200, contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }));
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await use(); expect(errors).toEqual([]);
}, { auto: true }] });

test("bottom-up chain keeps coordination alongside delivery and opens by keyboard", async ({ page }) => {
  await page.goto("/industry/uk");
  await expect(page.getByRole("heading", { level: 1, name: "From materials to megawatt-hours." })).toBeVisible();
  await page.screenshot({ path: "test-results/uk-industry-hero-desktop.png" });
  await expect(page.getByRole("heading", { name: "Permissions and coordination · alongside", exact: true })).toBeVisible();
  const materials = page.locator(".uk-tier").first();
  await materials.locator("summary").focus(); await page.keyboard.press("Enter");
  await expect(materials.getByText(/Component maker pays materials processor/)).toBeVisible();
  await expect(materials.getByRole("link", { name: "Tata Steel", exact: true })).toHaveAttribute("href", /tatasteeluk/);
  await page.screenshot({ path: "test-results/uk-industry-desktop.png", fullPage: false });
  const ids = await page.locator("[id]").evaluateAll((elements) => elements.map((element) => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  await page.locator("#uk-machine").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/uk-industry-machine-desktop.png" });
});

test("electricity, OFTO and CfD explanations retain the important boundaries and dates", async ({ page }) => {
  await page.goto("/industry/uk#uk-power");
  const power = page.locator("#uk-topic-06"); await power.locator(":scope > summary").click();
  await expect(power.locator(".uk-en tbody tr")).toHaveCount(12);
  await expect(power.getByText(/some smaller farms connect to distribution/)).toBeVisible();
  const ofto = page.locator("#uk-topic-10"); await ofto.locator(":scope > summary").click();
  await expect(ofto.getByText(/closed awaiting decision/)).toBeVisible();
  const cfd = page.locator("#uk-topic-13"); await cfd.locator(":scope > summary").click();
  await expect(cfd.locator(".uk-en").getByText(/Illustrative arithmetic only/)).toBeVisible();
  await expect(cfd.locator(".uk-en").getByText(/20-year CPI-indexed contracts/)).toBeVisible();
  await expect(cfd.locator(".uk-en").getByText(/Pentland 92.5 MW and Erebus 100 MW/)).toBeVisible();
  await cfd.locator(".uk-evidence > summary").click();
  await expect(cfd.locator(".uk-evidence").getByText(/2026-01-14/)).toBeVisible();
  await cfd.scrollIntoViewIfNeeded(); await page.screenshot({ path: "test-results/uk-industry-power-desktop.png" });
});

test("lifecycle and organisations preserve decision fields and existing project navigation", async ({ page }) => {
  await page.goto("/industry/uk#uk-develop");
  const lifecycle = page.locator("#uk-topic-03"); await lifecycle.locator(":scope > summary").click();
  await expect(lifecycle.locator(".uk-en tbody tr")).toHaveCount(17);
  await expect(lifecycle.getByText(/investor|Sponsor\/project-company investment governance/).first()).toBeVisible();
  const jurisdiction = page.locator("#uk-topic-04"); await jurisdiction.locator(":scope > summary").click();
  await expect(jurisdiction.getByText(/capacity alone/)).toBeVisible();
  const organisations = page.locator("#uk-topic-19"); await organisations.locator(":scope > summary").click();
  await expect(organisations.locator(".uk-en .uk-organisation-card")).toHaveCount(23);
  await organisations.locator(".uk-en .uk-organisation-card").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/uk-industry-organisations-desktop.png" });
  await page.goto("/industry#company-equinor");
  await page.locator("#company-equinor details > summary").first().click();
  const company = page.locator("#company-equinor");
  const more = company.locator("summary").filter({ hasText: "Show all project records" });
  if (await more.count()) await more.click();
  await company.getByRole("link", { name: "Hywind Scotland", exact: true }).click();
  await expect(page).toHaveURL("/projects/hywind-scotland");
});

test("Chinese mobile guide stays readable in dark theme with isolated table scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/industry/uk");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await page.locator('label[for="theme-dark"]').click();
  await expect(page.getByRole("heading", { level: 1, name: "从材料到兆瓦时。" })).toBeVisible();
  const cfd = page.locator("#uk-topic-13"); await cfd.locator(":scope > summary").click();
  await expect(cfd.locator(".uk-zh")).toBeVisible(); await expect(cfd.locator(".uk-en")).toBeHidden();
  await expect(cfd.getByText(/算术示例。/)).toBeVisible();
  await expect(cfd.getByText(/20 年 CPI/)).toBeVisible();
  await cfd.locator(":scope > summary").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/uk-industry-mobile-zh-dark.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const table = cfd.locator(".uk-zh .uk-table-scroll");
  await table.focus(); await page.keyboard.press("ArrowRight");
  await expect(table).toBeFocused();
  await expect.poll(() => table.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await page.getByRole("link", { name: /返回完整产业链/ }).first().click();
  await expect(page).toHaveURL(/#uk-chain$/);
});

test("machine schematic has text alternatives and readable mobile scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/industry/uk#uk-machine");
  const diagram = page.locator(".uk-machine");
  await expect(diagram.getByRole("img", { name: /Turbine, floater, mooring and cable interfaces/ })).toBeVisible();
  await expect(diagram.getByText(/Moorings carry station-keeping loads/)).toBeVisible();
  const viewport = diagram.locator(".uk-machine-scroll");
  await viewport.focus(); await page.keyboard.press("ArrowRight");
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  const cable = page.locator("#uk-topic-07"); await cable.locator(":scope > summary").click();
  await expect(cable.getByText(/power cable is not a substitute mooring line/)).toBeVisible();
  await diagram.scrollIntoViewIfNeeded(); await page.screenshot({ path: "test-results/uk-industry-machine-mobile.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
