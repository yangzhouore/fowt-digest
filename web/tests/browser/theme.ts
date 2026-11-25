import type { Page } from "@playwright/test";

export async function selectDarkTheme(page: Page) {
  const toggle = page.locator(".theme-toggle");
  if (await toggle.getAttribute("aria-pressed") === "false") await toggle.click();
}
