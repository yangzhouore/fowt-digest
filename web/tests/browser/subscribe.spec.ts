import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { selectDarkTheme } from "./theme";

test("subscribe confirms, manages and unsubscribes using real routes with fake mail", async ({ page, request }) => {
  const address = `smoke-${randomUUID()}@example.test`;
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Subscribe" }).click();
  await expect(page).toHaveURL(/\/subscribe$/);
  await expect(page.getByRole("heading", { name: "Stay informed on floating wind" })).toBeVisible();
  await expect(page.locator("form")).toHaveAttribute("method", "post");
  await page.getByRole("textbox", { name: "Email address" }).fill(address);
  await page.getByRole("button", { name: "Subscribe", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Choose at least one subscription." })).toBeVisible();
  await page.getByRole("checkbox", { name: /Company Brief/ }).check();
  await page.getByRole("button", { name: "Subscribe", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Select at least one company for Company Brief." })).toBeVisible();
  await page.getByRole("checkbox", { name: /Weekly News Digest/ }).check();
  await page.getByRole("checkbox", { name: /Weekly Research Digest/ }).check();
  await page.getByRole("searchbox", { name: "Search companies" }).fill("vestas");
  await page.getByRole("button", { name: "Vestas", exact: true }).click();
  const [submitted] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/api/subscribe") && response.request().method() === "POST"),
    page.getByRole("button", { name: "Subscribe", exact: true }).click(),
  ]);
  expect(submitted.ok()).toBe(true);
  await expect(page.getByRole("status").filter({ hasText: "Check your inbox" })).toBeVisible();

  const messages = readFileSync(join(process.cwd(), ".next/cache/subscribe-test-mail.jsonl"), "utf8")
    .trim().split("\n").map((line) => JSON.parse(line)).filter((message) => message.to.includes(address));
  expect(messages).toHaveLength(1);
  const confirm = messages[0].text.match(/http:\/\/127\.0\.0\.1:3100\/subscribe\/confirm#[A-Za-z0-9_-]+/)[0];
  expect(confirm).not.toContain(address);
  const confirmationPage = await page.goto(confirm);
  expect(confirmationPage?.headers()["referrer-policy"]).toBe("no-referrer");
  await expect(page).toHaveURL(/\/subscribe\/confirm$/);
  await page.getByRole("button", { name: "Confirm subscription", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Your subscription is confirmed." })).toBeVisible();
  const manage = page.getByRole("link", { name: "Manage preferences" });
  const manageHref = (await manage.getAttribute("href"))!;
  await manage.click();
  await expect(page.getByRole("checkbox", { name: /Weekly Research Digest/ })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: /Weekly News Digest/ })).toBeChecked();
  await page.getByRole("checkbox", { name: /Weekly Research Digest/ }).uncheck();
  await page.getByRole("button", { name: "Remove Vestas" }).click();
  await page.getByRole("searchbox", { name: "Search companies" }).fill("Equinor");
  await page.getByRole("button", { name: "Equinor", exact: true }).click();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Your preferences were saved." })).toBeVisible();

  await page.goto("/subscribe");
  await page.goto(manageHref);
  await expect(page.getByRole("checkbox", { name: /Weekly Research Digest/ })).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Remove Equinor" })).toBeVisible();
  await page.goto("/subscribe");
  await page.goto(manageHref.replace("#", "#unsubscribe."));
  await expect(page.getByRole("button", { name: "Save preferences" })).toHaveCount(0);
  await page.getByRole("button", { name: "Unsubscribe from all emails" }).click();
  await expect(page.getByRole("status").filter({ hasText: "You’ve unsubscribed from all emails." })).toBeVisible();
  await page.goto("/subscribe");
  await page.goto(manageHref);
  await expect(page.getByRole("alert").filter({ hasText: "This link is invalid" })).toBeVisible();
  await page.goto(`/subscribe/confirm#${"e".repeat(43)}`);
  await expect(page).toHaveURL(/\/subscribe\/confirm$/);
  await page.getByRole("button", { name: "Confirm subscription", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "This link is invalid" })).toBeVisible();
  expect((await request.get("/api/subscribe/weekly")).status()).toBe(401);
  const weekly = await request.get("/api/subscribe/weekly", { headers: { Authorization: "Bearer not-a-secret-browser-cron-fixture" } });
  expect(weekly.ok()).toBe(true);
  expect(await weekly.json()).toMatchObject({ sent: 0, unresolved: 0, incomplete: false });
});

test("Subscribe remains usable on mobile in Chinese and dark mode", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/subscribe");
  await page.getByRole("button", { name: "中文" }).click();
  await selectDarkTheme(page);
  await expect(page.getByRole("heading", { name: "订阅浮式风电动态" })).toBeVisible();
  await page.getByRole("checkbox", { name: /企业简报/ }).check();
  await page.getByRole("searchbox", { name: "搜索企业" }).fill("vestas");
  await expect(page.getByRole("button", { name: "Vestas", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.reload();
  await expect(page.getByRole("heading", { name: "订阅浮式风电动态" })).toBeVisible();
});
