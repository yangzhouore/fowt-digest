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
  await expect(card.getByRole("link")).toHaveCount(3);
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
