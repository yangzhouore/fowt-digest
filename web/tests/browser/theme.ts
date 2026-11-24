import type { Page } from "@playwright/test";

export async function selectDarkTheme(page: Page) {
  const dark = page.locator('label[for="theme-dark"]');
  if (!await dark.isVisible()) await page.locator(".theme-preferences summary").click();
  await dark.click();
}
