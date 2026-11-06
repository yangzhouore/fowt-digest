import { test as base, expect } from "@playwright/test";

const test = base.extend<{ runtimeErrors: void }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    await page.route("https://www.google.com/s2/favicons?**", (route) => route.fulfill({
      status: 200, contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg"/>',
    }));
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await use();
    await expect(page.getByText(/Application error: a client-side exception/)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /This page couldn.t load/ })).toHaveCount(0);
    expect(errors, "Runtime and hydration errors").toEqual([]);
  }, { auto: true }],
});

test("stored language is read, toggles persist, and reload restores it", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("fowt-digest-language", "zh"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(await page.evaluate(() => localStorage.getItem("fowt-digest-language"))).toBe("en");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem("fowt-digest-language"))).toBe("zh");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});

for (const mode of ["getter", "read", "write"] as const) {
  test(`language remains usable when storage ${mode} throws`, async ({ page }) => {
    await page.addInitScript((failure) => {
      if (failure === "getter") {
        Object.defineProperty(window, "localStorage", {
          configurable: true,
          get() { throw new DOMException("Storage denied", "SecurityError"); },
        });
      } else if (failure === "read") {
        Storage.prototype.getItem = () => { throw new DOMException("Read denied", "SecurityError"); };
      } else {
        // Reading a saved preference works; writing a new one does not.
        localStorage.setItem("fowt-digest-language", "zh");
        Storage.prototype.setItem = () => { throw new DOMException("Storage full", "QuotaExceededError"); };
      }
    }, mode);
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", mode === "write" ? "zh-CN" : "en");
    if (mode === "write") {
      await page.getByRole("button", { name: "EN", exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      expect(await page.evaluate(() => localStorage.getItem("fowt-digest-language"))).toBe("zh");
    }
    await page.getByRole("button", { name: "中文", exact: true }).click();
    await expect(page.getByRole("heading", { name: "浮式风电，精选呈现。", exact: true })).toBeVisible();
    await page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "项目", exact: true }).click();
    await expect(page.getByRole("heading", { name: "项目全景", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Project landscape", exact: true })).toBeVisible();
  });
}
