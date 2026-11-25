import { expect, test, type Page } from "@playwright/test";
import { getAllDigests } from "../../data/digest-adapter";
import { getAllEngineeringBriefings } from "../../data/engineering-briefing-adapter";
import { engineeringItemHref } from "../../data/context-navigation";
import { getBriefingWeekPreviews } from "../../app/briefing-weeks";
import type { EditorialImage } from "../../app/editorial-images";
import { renderHomepageFixture } from "./fixtures/homepage-briefing";
import { selectDarkTheme } from "./theme";

const engineering = getAllEngineeringBriefings();
const research = getAllDigests();
const latest = [...engineering, ...research].map(({ slug }) => slug).sort().at(-1)!;
const engineeringEdition = engineering.find(({ slug }) => slug === latest);
const researchEdition = research.find(({ slug }) => slug === latest);

async function expectHomepageContract(page: Page) {
  const main = page.getByRole("main");
  await expect(main).toHaveCount(1);
  await expect(main.getByRole("heading", { name: "Latest briefing", level: 1 })).toBeVisible();
  await expect(main.locator(".briefing-masthead")).toHaveCount(0);

  const engineeringTrack = main.getByRole("region", { name: "Engineering News", exact: true });
  const engineeringStories = engineeringEdition?.items ?? [];
  await expect(engineeringTrack.getByRole("listitem")).toHaveCount(engineeringStories.length);
  for (const [index, item] of engineeringStories.entries()) {
    const row = engineeringTrack.getByRole("listitem").nth(index);
    const title = row.getByRole("heading", { level: 3 }).getByRole("link");
    await expect(title).toHaveText(item.title);
    await expect(title).toHaveAttribute("href", engineeringItemHref(latest, item.id));
    await expect(row.getByText(item.oneLineSummary, { exact: true })).toHaveCount(0);
    await expect(row.locator(".briefing-story-keywords span")).toHaveText(item.engineeringTopics.slice(0, 3));
    const card = row.getByRole("article", { name: item.title, exact: true });
    await expect(card).toHaveClass("briefing-story");
    const source = item.sourceRecords.find(({ sourceUrl }) => sourceUrl === item.sourceUrl);
    if (source) {
      await expect(card.locator(".briefing-story-meta > :first-child")).toHaveAttribute("datetime", source.publishedDate);
      await expect(card.getByRole("link", { name: source.publisher, exact: true })).toHaveAttribute("href", source.sourceUrl);
    }
  }
  if (engineeringEdition) {
    await expect(engineeringTrack.getByRole("link", { name: "Browse all engineering news" })).toHaveAttribute("href", "/engineering");
  } else {
    await expect(engineeringTrack.getByText("No Engineering edition was published for this date.")).toBeVisible();
    await expect(engineeringTrack.getByRole("link", { name: "Engineering archive" })).toHaveAttribute("href", "/engineering");
  }

  const researchTrack = main.getByRole("region", { name: "Research Papers", exact: true });
  const papers = researchEdition?.papers ?? [];
  if (researchEdition) await expect(researchTrack.getByRole("list", { name: "Research Papers" })).toBeVisible();
  await expect(researchTrack.getByRole("listitem")).toHaveCount(papers.length);
  for (const [index, paper] of papers.entries()) {
    const row = researchTrack.getByRole("listitem").nth(index);
    const title = row.getByRole("heading", { level: 3 }).getByRole("link");
    await expect(title).toHaveText(paper.title);
    await expect(title).toHaveAttribute("href", `/papers/${paper.slug}`);
    const card = row.getByRole("article", { name: paper.title, exact: true });
    await expect(card).toHaveClass("briefing-story");
    await expect(card.locator(".briefing-story-meta > :first-child")).toHaveAttribute("datetime", paper.publicationDate);
    await expect(card.locator(".briefing-story-meta > span")).toHaveCount(0);
    const keywords = await card.locator(".briefing-story-keywords span").allTextContents();
    expect(keywords.length).toBeLessThanOrEqual(3);
    if (paper.topicTags.length > 0) expect(keywords.length).toBeGreaterThan(0);
    for (const keyword of keywords) {
      expect(paper.title.toLowerCase().includes(keyword.toLowerCase()) || paper.topicTags.includes(keyword)).toBe(true);
    }
    await expect(card.locator(".briefing-story-body > :last-child")).toHaveCSS("text-align", "end");
    const source = card.getByText(paper.publicationSource, { exact: true });
    await expect(source).toBeVisible();
    if (paper.sourceUrl) await expect(source).toHaveAttribute("href", paper.sourceUrl);
    await expect(card.getByRole("link", { name: /Read paper/ })).toHaveCount(0);
  }
  if (researchEdition) {
    await expect(researchTrack.getByRole("link", { name: "Browse all research papers" })).toHaveAttribute("href", "/archive");
  } else {
    await expect(researchTrack.getByText("No Research edition was published for this date.")).toBeVisible();
    await expect(researchTrack.getByRole("link", { name: "Research archive" })).toHaveAttribute("href", "/archive");
  }
  await expect(main.getByRole("link", { name: "Past briefings" })).toHaveCount(0);
  await expect(main.getByRole("link", { name: "Subscribe" })).toHaveAttribute("href", "/subscribe");
}

test("homepage shows publication dates and consistent Engineering cards while preserving preview order and links", async ({ page }) => {
  await page.goto("/");
  await expectHomepageContract(page);
  const lead = page.getByRole("region", { name: "Engineering News", exact: true }).getByRole("listitem").first();
  if (engineeringEdition?.items.length) {
    const first = engineeringEdition.items[0];
    await expect(lead.getByRole("article", { name: first.title })).toBeVisible();
    const secondary = engineeringEdition.items.slice(1, 3);
    for (const item of secondary) {
      await expect(page.getByRole("article", { name: item.title, exact: true })).toBeVisible();
    }
    await expect(lead.locator(".briefing-story-body > :last-child")).toHaveCSS("text-align", "end");
    const source = first.sourceRecords.find(({ sourceUrl }) => sourceUrl === first.sourceUrl);
    const action = lead.getByRole("link", { name: first.title, exact: true });
    await expect(action).toHaveAttribute("href", engineeringItemHref(latest, first.id));
    await expect(lead.getByRole("link", { name: /Read briefing item/ })).toHaveCount(0);
    await page.keyboard.press("Tab");
    await action.focus();
    await expect(lead.getByRole("article")).toHaveCSS("background-image", /linear-gradient/);
    await expect(lead.getByRole("article")).toHaveCSS("outline-style", "solid");
    await expect(action).toHaveCSS("text-decoration-line", "none");
    if (source) {
      const sourceLink = lead.getByRole("link", { name: source.publisher, exact: true });
      await expect(sourceLink).toHaveAttribute("href", source.sourceUrl);
      await sourceLink.click({ trial: true });
      await expect(lead.locator("time")).toHaveAttribute("datetime", source.publishedDate);
    }
    const dateBox = await lead.locator("time").boundingBox();
    expect(dateBox).not.toBeNull();
    await page.mouse.move(dateBox!.x + 8, dateBox!.y + 8);
    await expect(lead.getByRole("article")).toHaveCSS("background-image", /linear-gradient/);
    await page.mouse.click(dateBox!.x + 8, dateBox!.y + 8);
    await expect(page).toHaveURL(engineeringItemHref(latest, first.id));
    await page.goBack();
  }
  const paper = researchEdition?.papers[0];
  if (paper) {
    const card = page.getByRole("article", { name: paper.title, exact: true });
    const headline = card.getByRole("heading");
    const size = await headline.evaluate((element) => getComputedStyle(element).fontSize);
    const engineeringTitle = lead.getByRole("heading");
    if (engineeringEdition?.items.length) await expect(engineeringTitle).toHaveCSS("font-size", size);
    const sectionTitle = page.getByRole("heading", { name: "Research Papers", exact: true });
    expect(parseFloat(size)).toBeLessThan(await sectionTitle.evaluate((element) => parseFloat(getComputedStyle(element).fontSize)));
    if (paper.sourceUrl) await card.getByRole("link", { name: paper.publicationSource, exact: true }).click({ trial: true });
    const date = card.locator("time");
    await date.scrollIntoViewIfNeeded();
    const box = await date.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect(card).toHaveCSS("background-image", /linear-gradient/);
    await expect(headline.getByRole("link")).toHaveCSS("text-decoration-line", "none");
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect(page).toHaveURL("/papers/" + paper.slug);
  }
});

test("the scrollable homepage timeline switches both sections without navigation", async ({ page }) => {
  const weeks = getBriefingWeekPreviews(engineering, research);
  await page.setViewportSize({ width: 654, height: 774 });
  await page.goto("/");
  const picker = page.getByRole("group", { name: "Select a week" });
  const radios = picker.getByRole("radio");
  await expect(radios).toHaveCount(weeks.length);
  await expect(radios.first()).toBeChecked();
  const strip = picker.locator(".briefing-week-strip");
  expect(await strip.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);

  const engineeringTrack = page.getByRole("region", { name: "Engineering News", exact: true });
  const researchTrack = page.getByRole("region", { name: "Research Papers", exact: true });
  const paired = weeks.findIndex((week, index) => index > 0 && week.engineering && week.research);
  expect(paired).toBeGreaterThan(0);
  await radios.first().press("ArrowRight");
  await expect(radios.nth(1)).toBeChecked();
  await picker.locator("label time").nth(paired).click();
  await expect(radios.nth(paired)).toBeChecked();
  const selected = weeks[paired];
  await expect(engineeringTrack.getByRole("heading", { level: 3 })).toHaveText(selected.engineering!.items.map(({ title }) => title));
  await expect(researchTrack.getByRole("heading", { level: 3 })).toHaveText(selected.research!.papers.map(({ title }) => title));
  await expect(engineeringTrack.getByRole("link", { name: "Browse all engineering news" })).toHaveAttribute("href", "/engineering");
  await expect(researchTrack.getByRole("link", { name: "Browse all research papers" })).toHaveAttribute("href", "/archive");

  const single = weeks.findLastIndex((week) => !week.research || !week.engineering);
  expect(single).toBeGreaterThan(paired);
  await picker.locator("label time").nth(single).click();
  await expect(radios.nth(single)).toBeChecked();
  expect(await strip.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  if (!weeks[single].research) await expect(researchTrack.getByText("No Research edition was published for this date.")).toBeVisible();
  if (!weeks[single].engineering) await expect(engineeringTrack.getByText("No Engineering edition was published for this date.")).toBeVisible();
  await expect(page).toHaveURL("/");
  await picker.locator("label time").first().click();
  await expect(radios.first()).toBeChecked();
  await expectHomepageContract(page);
});

test("single-track and empty fixtures keep availability messages and continuation links", async ({ page }) => {
  const engineeringOnly = engineering.find((edition) => edition.items.length >= 3)!;
  const researchOnly = research.find((edition) => edition.papers.length >= 3)!;
  await page.setContent(renderHomepageFixture(getBriefingWeekPreviews([engineeringOnly], [])));
  await expect(page.getByRole("link", { name: "Browse all engineering news" })).toHaveAttribute("href", "/engineering");
  await expect(page.getByText("No Research edition was published for this date.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Research archive" })).toHaveAttribute("href", "/archive");
  const items = page.getByRole("region", { name: "Engineering News", exact: true }).getByRole("listitem");
  await expect(items).toHaveCount(engineeringOnly.items.length);
  for (const item of engineeringOnly.items) {
    const entry = items.getByRole("article", { name: item.title, exact: true });
    await expect(entry.locator(".briefing-category")).toHaveAttribute("data-category", item.category);
    const headline = entry.getByRole("heading", { level: 3 }).getByRole("link");
    await expect(headline).toHaveText(item.title);
    await expect(headline).toHaveAttribute("href", engineeringItemHref(engineeringOnly.slug, item.id));
    await expect(entry.locator(".briefing-story-keywords span")).toHaveText(item.engineeringTopics.slice(0, 3));
  }

  await page.setContent(renderHomepageFixture(getBriefingWeekPreviews([], [researchOnly])));
  await expect(page.getByText("No Engineering edition was published for this date.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Engineering archive" })).toHaveAttribute("href", "/engineering");
  await expect(page.getByRole("link", { name: "Browse all research papers" })).toHaveAttribute("href", "/archive");
  const papers = page.getByRole("list", { name: "Research Papers" }).getByRole("listitem");
  await expect(papers).toHaveCount(researchOnly.papers.length);
  for (const [index, paper] of researchOnly.papers.entries()) {
    const row = papers.nth(index);
    await expect(row.getByRole("link", { name: paper.title, exact: true })).toHaveAttribute("href", `/papers/${paper.slug}`);
    await expect(row.getByText(paper.publicationSource, { exact: true })).toBeVisible();
  }

  await page.setContent(renderHomepageFixture([]));
  await expect(page.getByText("No editions are available yet.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Past briefings" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Subscribe" })).toHaveAttribute("href", "/subscribe");
});

test("editorial imagery uses the exact edition and lead item ID and renders bilingual alt and credit", async ({ page }) => {
  const edition = engineering.find(({ items }) => items.length >= 3)!;
  const [first, second] = edition.items;
  const weeks = getBriefingWeekPreviews([edition], []);
  const image: EditorialImage = {
    src: "/editorial/browser-fixture.png",
    width: 1600, height: 900,
    alt: { en: "Blue rectangle for the image test", zh: "用于图像测试的蓝色矩形" },
    credit: "Browser test fixture",
    sourceUrl: "https://example.org/fixture",
    licenseNote: "Test fixture",
    rightsReference: "https://example.org/fixture/rights",
  };
  await page.goto("/");
  await page.route("**/_next/image?**", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="blue"/></svg>',
  }));

  const registrationsWithoutLead: Record<string, Record<string, EditorialImage>>[] = [
    {},
    { "2000-01-01": { [first.id]: image }, [edition.slug]: { [second.id]: image } },
  ];
  for (const images of registrationsWithoutLead) {
    await page.setContent(renderHomepageFixture(weeks, "en", images));
    await expect(page.getByRole("img")).toHaveCount(0);
    const lead = page.getByRole("listitem").first();
    await expect(lead.getByRole("heading")).toHaveText(first.title);
    await expect(lead.locator(".briefing-story-keywords span")).toHaveText(first.engineeringTopics.slice(0, 3));
    await expect(lead.getByRole("link", { name: first.title, exact: true })).toHaveAttribute("href", engineeringItemHref(edition.slug, first.id));
    await expect(page.getByRole("listitem").nth(1).getByRole("heading")).toHaveText(second.title);
  }

  for (const language of ["en", "zh"] as const) {
    await page.setContent(renderHomepageFixture(weeks, language, { [edition.slug]: { [first.id]: image } }));
    const lead = page.getByRole("article", { name: first.title, exact: true });
    const picture = lead.getByRole("img", { name: image.alt[language] });
    await expect(picture).toBeVisible();
    await expect(picture).toHaveAttribute("width", "1600");
    await expect(picture).toHaveAttribute("height", "900");
    await expect.poll(() => picture.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByRole("link", { name: image.credit })).toHaveAttribute("href", image.sourceUrl);
    await expect(page.getByRole("link", { name: language === "en" ? "Reuse terms" : "使用条款" })).toHaveAttribute("href", image.rightsReference);
    await expect(page.getByRole("listitem").first().getByRole("heading")).toHaveText(first.title);
  }
});

test("homepage previews and continuation stay readable at 654px, 390px and 320px in both languages and themes", async ({ page }) => {
  for (const width of [654, 390, 320]) {
    await page.setViewportSize({ width, height: 774 });
    await page.goto("/");
    for (const language of ["en", "zh"] as const) {
      await page.getByRole("button", { name: language === "en" ? "EN" : "中文", exact: true }).click();
      const main = page.getByRole("main");
      await expect(main.getByRole("heading", { level: 1 })).toHaveText(language === "en" ? "Latest briefing" : "最新简报");
      for (const theme of ["light", "dark"] as const) {
        if (theme === "dark") await selectDarkTheme(page);
        else if (await page.locator(".theme-toggle").getAttribute("aria-pressed") === "true") await page.locator(".theme-toggle").click();
        await expect(page.locator(".theme-toggle")).toHaveAttribute("aria-pressed", String(theme === "dark"));
        await expect(page.locator("html")).toHaveCSS("color-scheme", theme);
        await expect(main.getByRole("link", { name: language === "en" ? "Past briefings" : "往期简报" })).toHaveCount(0);
        await expect(main.getByRole("link", { name: language === "en" ? "Subscribe" : "订阅" })).toBeVisible();
        const strip = (await main.locator(".briefing-week-strip").boundingBox())!;
        expect(strip.x + strip.width).toBeLessThanOrEqual(width);
        const textElements = main.locator("h2, h3 a, li p, .briefing-story time");
        for (const element of await textElements.all()) {
          const box = await element.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        }
        await expect(main.getByRole("heading", { level: 3 })).toHaveText([
          ...(engineeringEdition?.items.map(({ title }) => title) ?? []),
          ...(researchEdition?.papers.map(({ title }) => title) ?? []),
        ]);
      }
    }
  }
});
