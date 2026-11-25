import { test as base, expect } from "@playwright/test";
import { selectDarkTheme } from "./theme";

// Runtime errors can otherwise leave a readable server-rendered page behind.
const test = base.extend<{ runtimeErrors: void }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    // Company favicons are decorative third-party images, outside the app contract.
    await page.route("https://www.google.com/s2/favicons?**", (route) => route.fulfill({ status: 200, contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }));
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await use();
    expect(errors, "Browser runtime and console errors").toEqual([]);
  }, { auto: true }],
});

test("global search opens from the header, reads shared queries and links to canonical records", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Site-wide search" }).press("Enter");
  await expect(page).toHaveURL("/search");
  await expect(page.getByRole("heading", { name: "Search Floating Wind Digest" })).toBeVisible();
  await expect(page.getByText("Enter a company, project, topic, or keyword.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Search results" })).toHaveCount(0);

  await page.goto("/search?q=vestas");
  await expect(page.getByRole("searchbox", { name: "Search the site" })).toHaveValue("vestas");
  const results = page.getByRole("region", { name: "Search results" });
  await expect(results.getByRole("heading").first()).toHaveText("Vestas");
  await expect(results.getByRole("button", { name: "Companies (1)", exact: true })).toBeVisible();
  await expect(results.getByRole("listitem")).toHaveCount(30);
  await expect(results.locator('a[href^="/engineering/"]')).toBeVisible();
  await expect(results.locator('a[href^="/projects/"]').first()).toBeVisible();
  await results.getByRole("button", { name: /^Company Intelligence \(\d+\)$/ }).click();
  await expect(results.getByRole("link", { name: "Vestas", exact: true })).toHaveCount(0);
  const event = results.getByRole("link").first();
  const href = await event.getAttribute("href");
  expect(href).toMatch(/^\/companies\/vestas#event-/);
  const anchor = href!.split("#")[1];
  await event.click();
  await expect(page).toHaveURL(new RegExp(`/companies/vestas#${anchor}$`));
  await expect(page.getByRole("heading", { name: "Vestas", exact: true })).toBeVisible();
  await expect(page.locator(`[id="${anchor}"]`)).toBeInViewport();
});

test("global search ranks an exact project first and routes one shared event to either company", async ({ page }) => {
  const results = page.getByRole("region", { name: "Search results" });
  await page.goto("/search?q=Hywind+Tampen");
  const first = results.getByRole("heading").first().getByRole("link");
  await expect(first).toHaveText("Hywind Tampen");
  await expect(first).toHaveAttribute("href", "/projects/hywind-tampen");

  const event = results.getByRole("link", { name: "EFGL reaches full power", exact: true });
  for (const [query, company] of [
    ["vestas", "vestas"], ["ocean-winds", "ocean-winds"], ["EFGL reaches full power", "ocean-winds"],
  ]) {
    await page.goto(`/search?${new URLSearchParams({ q: query })}`);
    await results.getByRole("button", { name: /^Company Intelligence \(/ }).click();
    await expect(event).toHaveCount(1);
    await expect(event).toHaveAttribute("href", `/companies/${company}#event-efgl-full-power`);
  }
});

test("global search handles technical terms, language persistence and mobile dark mode", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/search");
  const search = page.getByRole("searchbox", { name: "Search the site" });
  await search.fill("dynamic cable");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=dynamic\+cable$/);
  const results = page.getByRole("region", { name: "Search results" });
  await results.getByRole("button", { name: /^Engineering \([1-9]\d*\)$/ }).click();
  const engineering = results.getByRole("link").first();
  await expect(engineering).toHaveAttribute("href", /^\/engineering\/.+#item-/);

  await page.getByRole("button", { name: "中文", exact: true }).click();
  await page.getByRole("button", { name: "菜单", exact: true }).click();
  await expect(page.getByRole("banner").getByRole("searchbox", { name: "全站搜索" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^工程 \(/ })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("heading", { name: "搜索浮式风电摘要" })).toBeVisible();
  const chineseSearch = page.getByRole("searchbox", { name: "搜索全站" });
  await expect(chineseSearch).toHaveValue("dynamic cable");
  await selectDarkTheme(page);
  await expect(page.locator(".theme-toggle")).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await chineseSearch.fill("[unmatched]+");
  await chineseSearch.press("Enter");
  await expect(page.getByRole("status")).toHaveText("没有匹配的结果。");
  await page.goBack();
  await expect(chineseSearch).toHaveValue("dynamic cable");
});

test("company directory search leads to the Vestas timeline, source and project", async ({ page }) => {
  const sourceUrl = "https://www.offshorewind.biz/2025/12/10/first-eolmed-floating-offshore-wind-turbine-heads-to-installation-site/";
  await page.route(sourceUrl, (route) => route.fulfill({ contentType: "text/html", body: "<h1>Original EolMed source</h1>" }));
  await page.goto("/companies");
  await expect(page.getByRole("heading", { name: "Company Intelligence" })).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Search by company name" });
  const directory = page.getByRole("region", { name: "Company directory" });
  await search.fill("no-matching-company");
  await expect(directory.getByRole("status")).toHaveText("No companies match this search.");
  await search.fill(" vEsT ");
  await expect(directory.getByRole("link")).toHaveCount(1);
  await expect(directory.getByText(/\d+ retained updates · Latest 2026-/)).toBeVisible();
  await directory.getByRole("link", { name: "Vestas", exact: true }).click();
  await expect(page).toHaveURL("/companies/vestas");
  await expect(page.getByRole("heading", { name: "Vestas", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Company website" })).toHaveAttribute("href", "https://www.vestas.com/");
  const timeline = page.getByRole("region", { name: "Company Timeline" });
  await expect(timeline.getByText(/relevant to offshore and floating wind.*only reviewed records in the Digest archive/)).toBeVisible();
  const filter = timeline.getByLabel("Filter by category");
  const year = timeline.getByLabel("Filter by year");
  await expect(timeline.getByText(/Vestas acquired MHI’s share in December 2020/)).toBeVisible();
  const dates = await timeline.locator("time").evaluateAll((entries) => entries.map((entry) => entry.textContent));
  expect(dates).toEqual([...dates].sort().reverse());
  await year.selectOption("2018");
  await filter.selectOption("digital_ai");
  await expect(timeline.getByRole("heading", { level: 3 })).toHaveText("SMART offshore turbine tools launched");
  await expect(timeline.getByRole("link", { name: "Original source · MHI Vestas Offshore Wind" })).toBeVisible();
  await year.selectOption("2025");
  await expect(timeline.getByRole("status")).toHaveText("No retained developments match these filters.");
  await filter.selectOption("projects_contracts");
  const item = timeline.locator("li").filter({ has: page.getByRole("heading", { name: "First EolMed Floating Offshore Wind Turbine Heads to Installation Site" }) });
  await expect(item.getByRole("link", { name: /^Project EolMed/i })).toHaveAttribute("href", "/projects/eolmed");

  const projects = page.getByRole("region", { name: "Related Projects" });
  await expect(projects.getByRole("link")).toHaveCount(6);
  await expect(projects.getByText(/Preferred supplier; conditional on development/)).toBeVisible();
  await item.getByRole("link", { name: /^Original source/ }).click();
  await expect(page).toHaveURL(sourceUrl);
  await expect(page.getByRole("heading", { name: "Original EolMed source" })).toBeVisible();
  await page.goBack();
  await projects.getByRole("link", { name: /^EolMed/i }).click();
  await expect(page).toHaveURL("/projects/eolmed");
});

test("every company listed in the directory renders a static timeline", async ({ page, request }) => {
  await page.goto("/companies");
  const links = page.getByRole("region", { name: "Company directory" }).getByRole("link");
  await expect(links).toHaveCount(47);
  const paths = await links.evaluateAll((entries) => entries.map((entry) => entry.getAttribute("href") ?? ""));
  expect(new Set(paths).size).toBe(47);
  for (let start = 0; start < paths.length; start += 8) {
    await Promise.all(paths.slice(start, start + 8).map(async (path) => {
      expect(path).toMatch(/^\/companies\/[a-z0-9-]+$/);
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(await response.text(), path).toContain('id="company-timeline-heading"');
      await response.dispose();
    }));
  }
});

test("Industry links to Company Intelligence and sparse timelines retain reviewed evidence", async ({ page, request }) => {
  await page.goto("/industry#industry-catalogue");
  await expect(page.getByRole("link", { name: "Browse Company Intelligence" })).toHaveAttribute("href", "/companies");
  const entry = page.locator("#company-equinor");
  await entry.locator("details > summary").first().click();
  await entry.getByRole("link", { name: "Company Intelligence", exact: true }).click();
  await expect(page).toHaveURL("/companies/equinor");
  const timeline = page.getByRole("region", { name: "Company Timeline" });
  await timeline.getByLabel("Filter by year").selectOption("2019");
  await timeline.getByLabel("Filter by category").selectOption("projects_contracts");
  const award = timeline.locator("li").filter({ has: page.getByRole("heading", { name: "Hywind Tampen main contracts awarded" }) });
  await expect(award.getByRole("link", { name: /Project Hywind Tampen/i })).toHaveAttribute("href", "/projects/hywind-tampen");
  await expect(page.getByRole("region", { name: "Related Projects" })).toBeVisible();
  await expect(page.locator(".site-header").locator('a[href^="/companies"]')).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Explore navigation" }).getByRole("link", { name: "Companies" })).toHaveAttribute("href", "/companies");
  await page.goto("/companies/vicinay-marine");
  await expect(timeline.getByRole("heading", { name: "Vicinay Marine and TECNALIA validate a mooring corrosion sensor" })).toBeVisible();
  await timeline.getByLabel("Filter by year").selectOption("2023");
  await expect(timeline.getByRole("heading", { level: 3 })).toHaveText("FLOAT&M reports progress on floating wind operations and maintenance");
  await timeline.getByLabel("Filter by category").selectOption("corporate_market");
  await expect(timeline.getByRole("status")).toHaveText("No retained developments match these filters.");
  expect((await request.get("/companies/not-in-catalogue")).status()).toBe(404);
});

test("company timeline keeps the selected year and category in mobile Chinese and dark mode", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/companies/vestas");
  const timeline = page.getByRole("region", { name: "Company Timeline" });
  await timeline.getByLabel("Filter by year").selectOption("2026");
  await timeline.getByLabel("Filter by category").selectOption("technology_engineering");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await selectDarkTheme(page);
  const translatedTimeline = page.getByRole("region", { name: "企业动态时间线" });
  await expect(translatedTimeline.getByLabel("按类别筛选")).toHaveValue("technology_engineering");
  await expect(translatedTimeline.getByLabel("按年份筛选")).toHaveValue("2026");
  await expect(translatedTimeline.getByRole("heading", { name: "Vestas and Neretek agree to study deeper-water fixed foundations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "相关项目" })).toBeVisible();
  const contentFits = await translatedTimeline.evaluate((element) => element.scrollWidth <= element.clientWidth);
  expect(contentFits).toBe(true);
});

test("project coverage opens the exact Engineering item and returns to its project", async ({ page }) => {
  await page.goto("/projects/pentland-floating-offshore-wind-farm");
  const coverage = page.getByRole("region", { name: "Engineering coverage", exact: true });
  await expect(coverage.getByText("Source date", { exact: false })).toBeVisible();
  const why = coverage.locator("summary").first();
  await why.focus();
  await page.keyboard.press("Enter");
  await expect(coverage.getByText(/The extract below comes from the stored source record/)).toBeVisible();
  await coverage.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/connected-context-desktop.png" });
  await coverage.getByRole("link", { name: /^Read Engineering item/ }).click();
  await expect(page).toHaveURL(/\/engineering\/2026-10-11#item-eng-item-2026-10-11-pentland-anchor-engineering$/);
  const item = page.locator("#item-eng-item-2026-10-11-pentland-anchor-engineering");
  await expect(item).toBeInViewport();
  await item.getByRole("link", { name: "Pentland Floating Offshore Wind Farm", exact: true }).click();
  await expect(page).toHaveURL("/projects/pentland-floating-offshore-wind-farm");
  await page.goto("/projects/hywind-scotland");
  await expect(page.getByText("No project-specific Engineering coverage linked", { exact: true })).toBeVisible();
  await page.goto("/projects/green-volt");
  await expect(page.getByRole("link", { name: /^Industry entry/ })).toHaveCount(0);
});

test("recorded participants connect Projects to canonical Industry entries and other projects", async ({ page }) => {
  await page.goto("/projects");
  const project = page.getByRole("article", { name: "Hywind Tampen", exact: true });
  await project.getByText("Assessment, gates & milestones", { exact: true }).click();
  await project.getByRole("link", { name: "Industry entry — Equinor", exact: true }).first().click();
  await expect(page).toHaveURL(/\/industry#company-equinor$/);
  const company = page.locator("#company-equinor");
  await expect(company).toBeInViewport();
  const summary = company.locator("details > summary").first();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(company.getByRole("heading", { name: /^Project records/ })).toBeVisible();
  await expect(company.getByText(/A link does not establish a current supply contract/)).toBeVisible();
  const more = company.locator("summary").filter({ hasText: "Show all project records" });
  if (await more.count()) await more.click();
  await company.getByRole("link", { name: "Hywind Scotland", exact: true }).click();
  await expect(page).toHaveURL("/projects/hywind-scotland");
  await expect(page.getByRole("link", { name: "Industry entry — Equinor", exact: true }).first()).toBeVisible();
  await page.goto("/industry");
  const ids = await page.locator("[id]").evaluateAll((elements) => elements.map((element) => element.id));
  expect(new Set(ids).size).toBe(ids.length);
  await expect(page.locator('[id^="company-"]')).toHaveCount(47);
  const cables = page.locator("#company-jdr-cables");
  await cables.locator("details > summary").first().press("Enter");
  const cableRoles = cables.locator('[data-context-relationship^="rel-supply-efgl-jdr-"]');
  await expect(cableRoles).toHaveCount(2);
  for (const role of await cableRoles.all()) {
    await expect(role.getByText("Historical role", { exact: false })).toBeVisible();
    await expect(role.getByText("Delivered cables", { exact: true })).toBeVisible();
  }
  await cableRoles.first().locator("summary").click();
  await expect(cableRoles.first().getByRole("link").first()).toHaveAttribute("href", /^https:\/\//);
  await cables.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/connected-industry-desktop.png" });
});

test("connected context works in mobile Chinese and dark theme without translating source records", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/efgl");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await selectDarkTheme(page);
  const coverage = page.getByRole("region", { name: "工程报道", exact: true });
  await expect(coverage.getByRole("link", { name: /^阅读工程条目/ })).toHaveCount(3);
  await coverage.locator("summary").first().click();
  await expect(coverage.getByText(/此已发布条目报道该项目的活动/).first()).toBeVisible();
  await expect(coverage.locator(".context-stored-excerpt").first()).toContainText("EFGL");
  await coverage.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/connected-context-mobile-zh-dark.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await coverage.getByRole("link", { name: /^阅读工程条目/ }).first().click();
  await expect(page.getByText("项目背景", { exact: true }).first()).toBeVisible();
  await page.goto("/industry#company-equinor");
  await selectDarkTheme(page);
  const company = page.locator("#company-equinor");
  await company.locator("details > summary").first().press("Enter");
  await expect(company.getByRole("heading", { name: /^项目记录/ })).toBeVisible();
  await expect(company.locator(".context-company-role summary").first()).toHaveCSS("display", "list-item");
  await expect(page.locator(".theme-toggle")).toHaveAttribute("aria-pressed", "true");
  await company.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/connected-industry-mobile-zh-dark.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("briefing navigation exposes three primary links, Explore, footer utilities and keyboard preferences", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await expect(navigation).toHaveCount(0);
  await expect(menu).toHaveAttribute("aria-controls", "shell-navigation");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(navigation.getByRole("link", { name: "Briefing" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toHaveCount(0);
  await menu.press("Space");
  await expect(navigation.getByRole("link")).toHaveText(["Briefing", "Explore", "Subscribe"]);
  await expect(page.getByRole("navigation", { name: "Explore navigation" }).getByRole("link")).toHaveText(["Projects", "Companies", "Industry", "Digital & AI"]);
  await expect(navigation.getByRole("link", { name: "Briefing" })).toHaveAttribute("href", "/");
  await expect(navigation.getByRole("link", { name: "Search" })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "Subscribe" })).toHaveAttribute("href", "/subscribe");
  await expect(page.getByRole("navigation", { name: "Further reading" }).getByRole("link", { name: "Methodology" })).toHaveAttribute("href", "/methodology");
  const themeToggle = page.getByRole("button", { name: "Dark mode" });
  await expect(themeToggle).toHaveAttribute("aria-pressed", "false");
  await themeToggle.press("Enter");
  await expect(themeToggle).toHaveAttribute("aria-pressed", "true");
  await themeToggle.press("Space");
  await expect(themeToggle).toHaveAttribute("aria-pressed", "false");
  await themeToggle.press("Space");
  await expect(themeToggle).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  await navigation.getByRole("link", { name: "Explore" }).click();
  await expect(page).toHaveURL("/explore");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toHaveCount(0);
  await expect(page.locator(".theme-toggle")).toHaveAttribute("aria-pressed", "true");
  const destinations = page.getByRole("region", { name: "Explore floating wind" }).getByRole("link");
  await expect(destinations).toHaveText(["Projects", "Companies", "Industry", "Digital & AI"]);
  expect(await destinations.evaluateAll((links) => links.map((link) => link.getAttribute("href"))))
    .toEqual(["/projects", "/companies", "/industry", "/digital-ai"]);
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await page.getByRole("button", { name: "菜单", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "主导航" }).getByRole("link")).toHaveText(["简报", "探索", "订阅"]);
  await expect(page.getByRole("navigation", { name: "探索导航" }).getByRole("link")).toHaveText(["项目", "企业", "产业", "数字化与 AI"]);
  await expect(page.getByRole("heading", { name: "探索浮式风电" })).toBeVisible();
  await expect(page.getByRole("region", { name: "探索浮式风电" }).getByRole("link")).toHaveText(["项目", "企业", "产业", "数字化与 AI"]);
  await selectDarkTheme(page);
  await expect(page.locator(".theme-toggle")).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("desktop sidebar reflects route families and the shell fits either side of its breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/");
  const primary = page.getByRole("navigation", { name: "Primary navigation" });
  const explore = page.getByRole("navigation", { name: "Explore navigation" });
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await expect(menu).toHaveCount(0);
  await expect(primary.getByRole("link")).toHaveText(["Briefing", "Explore", "Subscribe"]);
  await expect(explore.getByRole("link")).toHaveText(["Projects", "Companies", "Industry", "Digital & AI"]);
  await expect(primary.getByRole("link", { name: "Briefing" })).toHaveAttribute("aria-current", "page");
  const banner = page.getByRole("banner");
  await expect(banner.getByRole("link")).toHaveCount(1);
  await expect(banner.getByRole("link", { name: "Floating Wind Digest" })).toHaveAttribute("href", "/");
  const searchEntry = banner.getByRole("searchbox", { name: "Site-wide search" });
  await page.keyboard.press("Control+k");
  await expect(searchEntry).toBeFocused();
  await expect(banner.getByRole("textbox")).toHaveCount(0);
  await searchEntry.press("Enter");
  await expect(page).toHaveURL("/search");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(banner.getByRole("searchbox", { name: "全站搜索" })).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();

  await explore.getByRole("link", { name: "Projects" }).click();
  await expect(explore.getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
  await expect(primary.getByRole("link", { name: "Explore" })).toHaveAttribute("data-active", "true");
  await expect(page.locator(".shell-navigation [aria-current='page']")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  const project = page.locator(".project-overview");
  const lightStatus = await project.evaluate((element) => getComputedStyle(element).getPropertyValue("--pi-secured").trim());
  await selectDarkTheme(page);
  await expect.poll(() => project.evaluate((element) => getComputedStyle(element).getPropertyValue("--pi-secured").trim())).toBe("#82c7a6");
  expect(lightStatus).not.toBe("#82c7a6");
  await expect(page.getByRole("main")).toHaveCSS("background-color", "rgb(15, 23, 42)");
  await expect(page.locator(".app-shell")).toHaveCSS("color", "rgb(241, 245, 249)");

  for (const [path, name] of [["/archive", "Briefing"], ["/projects/hywind-tampen", "Explore"], ["/subscribe", "Subscribe"]]) {
    await page.goto(path);
    await expect(primary.getByRole("link", { name })).toHaveAttribute("data-active", "true");
    if (name === "Explore") await expect(explore.getByRole("link", { name: "Projects" })).toHaveAttribute("data-active", "true");
  }

  for (const width of [1440, 960, 959, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    if (width < 960) {
      await expect(searchEntry).toBeVisible();
      await expect(primary).toHaveCount(0);
      await menu.click();
      await expect(primary.getByRole("link", { name: "Search", exact: true })).toHaveCount(0);
    } else {
      await expect(searchEntry).toBeVisible();
    }
    await expect(primary).toBeVisible();
    const controls = page.locator(".site-header a, .site-header button, .site-header summary, .shell-navigation a");
    for (const control of await controls.all()) {
      if (!await control.isVisible()) continue;
      const box = (await control.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    if (width < 960) await menu.click();
  }
});

test("homepage renders the latest briefing and its Engineering / Research links work", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Latest briefing", exact: true })).toBeVisible();
  const week = await page.getByRole("radio", { checked: true }).inputValue();
  expect(week).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  await expect(page.getByRole("group", { name: "Select a week" }).getByRole("radio").first()).toBeChecked();

  const engineering = page.getByRole("region", { name: "Engineering News", exact: true });
  const research = page.getByRole("region", { name: "Research Papers", exact: true });
  const engineeringPreviews = engineering.getByRole("heading", { level: 3 }).getByRole("link");
  const researchPreviews = research.getByRole("heading", { level: 3 }).getByRole("link");
  await expect(engineeringPreviews.first()).toBeVisible();
  await expect(researchPreviews.first()).toBeVisible();
  const engineeringPreviewCount = await engineeringPreviews.count();
  const researchPreviewCount = await researchPreviews.count();
  expect(await researchPreviews.evaluateAll((links) => links.every((a) => (a.getAttribute("href") ?? "").startsWith("/papers/")))).toBe(true);

  await expect(engineering.getByRole("link", { name: "Browse all engineering news" })).toHaveAttribute("href", "/engineering");
  await expect(research.getByRole("link", { name: "Browse all research papers" })).toHaveAttribute("href", "/archive");
  const href = await engineeringPreviews.first().getAttribute("href");
  expect(href).toMatch(/^\/engineering\/[^/]+#item-.+$/);
  await engineeringPreviews.first().click();
  await expect(page).toHaveURL(href!);
  await expect(page.getByRole("heading", { name: "Engineering highlights", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Engineering highlights", exact: true }).getByRole("heading", { level: 3 })).toHaveCount(engineeringPreviewCount);
  const item = page.locator(href!.slice(href!.indexOf("#")));
  await expect(item.getByRole("heading", { level: 3 })).toBeVisible();
  await expect(item.getByRole("heading", { level: 3 })).toBeInViewport();
  await expect(item.getByRole("link", { name: "Open source" })).toHaveAttribute("href", /^https?:\/\//);
  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText("Engineering highlights");
  await expect(page.getByRole("region", { name: "Briefing metadata" }).getByRole("link")).toHaveAttribute("href", `/engineering/${week}/candidates`);

  await page.getByRole("link", { name: "Back to Homepage", exact: true }).click();
  await page.getByRole("link", { name: "Browse all research papers" }).click();
  await expect(page).toHaveURL("/archive");
  await page.locator(`a[href="/weekly/${week}"]`).first().click();
  await expect(page.getByRole("heading", { name: "Selected papers", exact: true })).toBeVisible();
  const selectedPapers = page.getByRole("region", { name: "Selected papers" }).getByRole("heading", { level: 3 });
  await expect(selectedPapers).toHaveCount(researchPreviewCount);
  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText("Selected papers");
  await expect(page.getByRole("region", { name: "Digest metadata" }).getByRole("link")).toHaveAttribute("href", `/weekly/${week}/candidates`);
});

test("past briefings retains paired and single-track weeks in reverse date order", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const latest = await page.getByRole("radio", { checked: true }).inputValue();
  await page.goto("/briefings");
  await expect(page).toHaveURL("/briefings");
  await expect(page.getByRole("heading", { level: 1, name: "Past briefings" })).toBeVisible();
  const weeks = await page.locator(".briefings-list li").evaluateAll((rows) => rows.map((row) => ({
    date: row.querySelector("time")?.getAttribute("datetime"),
    links: [...row.querySelectorAll("a")].map((a) => a.getAttribute("href")),
  })));
  const dates = weeks.map(({ date }) => date);
  expect(dates[0]).toBe(latest);
  expect(dates).toEqual([...new Set(dates)].sort().reverse());
  expect(weeks.some(({ links }) => links.length === 2)).toBe(true);
  expect(weeks.some(({ links }) => links.length === 1)).toBe(true);
  for (const { date, links } of weeks) {
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link === `/engineering/${date}` || link === `/weekly/${date}`)).toBe(true);
  }
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await selectDarkTheme(page);
  await expect(page.locator(".theme-toggle")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { level: 1, name: "往期简报" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("Engineering search matches edition dates and combines with region filters", async ({ page }) => {
  await page.goto("/engineering");
  const editions = page.locator(".engineering-briefing-editions > li");
  const initialCount = await editions.count();
  const firstDate = await editions.first().locator(".engineering-briefing-card-meta > p").first().innerText();
  const year = firstDate.match(/\b\d{4}\b/)![0];
  const expectedCount = await editions.filter({ has: page.locator(".engineering-briefing-card-meta > p:first-child", { hasText: year }) }).count();
  const input = page.getByRole("main").getByRole("searchbox");
  await input.fill(year);
  await expect(editions).toHaveCount(expectedCount);
  await input.fill(firstDate);
  await expect(editions).toHaveCount(1);
  const categories = page.getByRole("group", { name: "Filter by category" });
  await expect(categories.getByRole("button")).toHaveCount(8);
  await categories.getByRole("button", { name: "Policy", exact: true }).click();
  const contexts = page.locator(".engineering-news-copy > p");
  await expect(contexts.first()).toBeVisible();
  for (const context of await contexts.allTextContents()) {
    expect(context).toMatch(/^policy \/ /);
  }
  await page.getByRole("button", { name: "Europe", exact: true }).click();
  for (const context of await page.locator(".engineering-news-copy > p").allTextContents()) {
    expect(context).toContain("Europe");
  }
  await expect(page.getByRole("button", { name: "Clear filters" })).toHaveCount(0);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await categories.getByRole("button", { name: "All categories" }).click();
  await input.fill("");
  await expect(editions).toHaveCount(initialCount);
  await expect(categories.getByRole("button", { name: "All categories" })).toHaveAttribute("aria-pressed", "true");
  await input.fill("no-such-engineering-record-xyz");
  await expect(page.getByText("No matching news in the engineering archive.", { exact: true })).toBeVisible();
});

test("Research search opens a paper, its edition and candidate provenance", async ({ page, request }) => {
  await page.goto("/archive");
  const title = await page.locator(".research-archive-item-copy > strong").first().innerText();
  const input = page.getByRole("main").getByRole("searchbox");
  await input.fill(title);
  const result = page.locator(".archive-search-results > li").first();
  const editionPath = await result.getByRole("link", { name: "View weekly digest", exact: true }).getAttribute("href");
  await result.getByRole("heading").getByRole("link").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(page.getByRole("heading", { name: "Abstract", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to the weekly digest", exact: true }).click();
  await expect(page).toHaveURL(editionPath!);
  await page.getByRole("link", { name: /candidates reviewed/ }).click();
  await expect(page.getByRole("heading", { name: "Ranked candidates", exact: true })).toBeVisible();
  await expect(page.locator(".candidate-source a").first()).toHaveAttribute("href", /^https:\/\//);
  expect((await request.get("/papers/not-a-real-paper")).status()).toBe(404);
  await page.goto("/archive");
  await page.getByRole("main").getByRole("searchbox").fill("no-such-research-record-xyz");
  await expect(page.getByText("No matching papers in the static archive.", { exact: true })).toBeVisible();
});

test("Methodology and About render bilingual static reading paths on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/methodology", "/about"]) {
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("button", { name: "中文", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await selectDarkTheme(page);
    await expect(page.locator(".theme-toggle")).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/${path.slice(1)}-mobile-zh-dark.png` });
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  }
});

test("Projects lifecycle filter changes results and expanded roles expose missing evidence", async ({ page }) => {
  const response = await page.goto("/projects");
  expect(response?.status()).toBe(200);
  const landscape = page.getByRole("region", { name: "Project landscape", exact: true });
  const rows = landscape.getByRole("article");
  await expect(rows.first()).toBeVisible();
  const initialCount = await rows.count();
  expect(initialCount).toBeGreaterThan(1);

  await page.getByRole("combobox", { name: "Lifecycle", exact: true }).selectOption({ label: "Cancelled" });
  await expect.poll(() => rows.count()).toBeLessThan(initialCount);
  await expect(rows.first()).toBeVisible();
  await expect(landscape.getByRole("link", { name: "Hywind Tampen", exact: true })).toHaveCount(0);

  const row = rows.first();
  await expect(row.getByRole("heading", { name: "Verified Project Roles", exact: true })).toBeHidden();
  await row.getByText("Assessment, gates & milestones", { exact: true }).click();
  await expect(row.getByRole("heading", { name: "Verified Project Roles", exact: true })).toBeVisible();
  await expect(row.getByText("N/A — not verified", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await expect(rows).toHaveCount(initialCount);
  await expect(landscape.getByRole("link", { name: "Hywind Tampen", exact: true })).toBeVisible();
});

test("a project overview link opens Hywind Tampen intelligence and returns to the index", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("link", { name: "Hywind Tampen", exact: true }).click();
  await expect(page).toHaveURL("/projects/hywind-tampen");
  await expect(page.getByRole("heading", { name: "Hywind Tampen", level: 1, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lifecycle gates", exact: true })).toBeVisible();
  await expect(page.getByRole("table", { name: "Hywind Tampen readiness matrix" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Signals that would change the assessment", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to all projects", exact: true }).click();
  await expect(page).toHaveURL("/projects");
  await expect(page.getByRole("heading", { name: "Project landscape", exact: true })).toBeVisible();
});

test("language switches to Chinese, persists on navigation, and switches back", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { name: "最新简报", exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "探索", exact: true }).click();
  await page.getByRole("region", { name: "探索浮式风电" }).getByRole("link", { name: "项目", exact: true }).click();
  await expect(page.getByRole("heading", { name: "项目全景", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "项目全景", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Project landscape", exact: true })).toBeVisible();
});

test("project evidence links navigate to bounded sources and preserve review date distinctions", async ({ page }) => {
  await page.goto("/projects");
  const project = page.getByRole("article", { name: "Green Volt", exact: true });
  await expect(project.getByText("Assessment reviewed", { exact: false })).toBeVisible();
  await project.getByText("Assessment, gates & milestones", { exact: true }).click();
  await project.getByRole("link", { name: "Public evidence — Green Volt — Engineering", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/green-volt#evidence-engineering$/);
  const engineering = page.locator("#evidence-engineering");
  const disclosure = engineering.locator("summary");
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(engineering.getByRole("heading", { name: "Recorded public evidence", exact: true })).toBeVisible();
  const source = engineering.getByRole("link", { name: "Green Volt completes major survey campaign", exact: true });
  await expect(source).toHaveAttribute("href", "https://greenvoltoffshorewind.com/green-volt-completes-major-survey-campaign/");
  await expect(engineering.getByText("Public webpage inspected", { exact: false }).first()).toBeVisible();
  await engineering.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/project-evidence-desktop.png" });
  await page.getByRole("link", { name: "Review history & changes", exact: true }).click();
  await expect(page).toHaveURL(/#review-history$/);
  await expect(page.getByRole("heading", { name: /Completed public-source review/ })).toBeVisible();
  await page.getByText("Recorded changes", { exact: false }).last().click();
  await expect(page.getByText("Before", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("After", { exact: true }).first()).toBeVisible();
});

test("legacy profiles show unrecorded reviews and stored evidence, with explicit empty areas", async ({ page }) => {
  await page.goto("/projects/hywind-scotland");
  await expect(page.getByText("Assessment review: not recorded", { exact: true })).toBeVisible();
  await expect(page.getByText("No assessment review history recorded", { exact: true })).toBeVisible();
  await page.locator("#evidence-permitting summary").click();
  await expect(page.locator("#evidence-permitting").getByText("No linked evidence recorded", { exact: true })).toBeVisible();
  await page.locator("#evidence-engineering summary").click();
  await expect(page.locator("#evidence-engineering").getByText("Stored source-backed record", { exact: true }).first()).toBeVisible();
});

test("public evidence stays accessible on mobile in Chinese and dark theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/hywind-tampen");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { name: "各准备度领域的公开证据", exact: true })).toBeVisible();
  const gate = page.locator("#evidence-financing-fid");
  await gate.locator("summary").click();
  await expect(gate.getByRole("link", { name: "Investing in Hywind Tampen development", exact: true })).toBeVisible();
  await expect(gate.getByText("已查阅公开网页", { exact: false })).toBeVisible();
  await selectDarkTheme(page);
  await expect(page.locator(".theme-toggle")).toHaveAttribute("aria-pressed", "true");
  await gate.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/project-evidence-mobile-zh-dark.png" });
  await page.reload();
  await expect(page.getByRole("heading", { name: "各准备度领域的公开证据", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
