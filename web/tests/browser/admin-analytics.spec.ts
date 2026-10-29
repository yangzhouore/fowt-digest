import { expect, test } from "@playwright/test";

test("private analytics blocks anonymous access and renders for a test owner", async ({ browser, request }) => {
  const anonymous = await request.get("/admin/analytics");
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers()["www-authenticate"]).toContain("Basic");
  expect(await anonymous.text()).not.toContain("Website visitors");
  // Verify framework data requests cannot bypass the route's authentication.
  expect((await request.get("/admin/analytics?days=14", { headers: { RSC: "1", "x-middleware-subrequest": "proxy:proxy:proxy:proxy:proxy" } })).status()).toBe(401);
  const context = await browser.newContext({ httpCredentials: { username: "smoke-owner", password: "smoke-only-password-32-characters-long" } });
  const page = await context.newPage();
  const response = await page.goto("/admin/analytics");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["cache-control"]).toContain("no-store");
  await expect(page.getByRole("heading", { name: "Analytics", exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Vercel unavailable" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "GitHub unavailable" })).toBeVisible();
  await page.getByLabel("Website range").selectOption("30");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/days=30/);
  await expect(page.getByText(/GitHub retains traffic/)).toBeVisible();
  expect(await context.cookies()).toEqual([]);
  expect(await page.locator("body").innerText()).not.toContain("smoke-only-password");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await context.close();
});
