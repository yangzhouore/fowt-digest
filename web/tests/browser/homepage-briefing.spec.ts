import { expect, test, type Page } from "@playwright/test";
import { getAllDigests } from "../../data/digest-adapter";
import { getAllEngineeringBriefings } from "../../data/engineering-briefing-adapter";
import { engineeringItemHref } from "../../data/context-navigation";
import { getLatestBriefingPreview } from "../../app/briefing-weeks";
import type { EditorialImage } from "../../app/editorial-images";
import { renderHomepageFixture } from "./fixtures/homepage-briefing";
import { selectDarkTheme } from "./theme";

const engineering = getAllEngineeringBriefings();
const research = getAllDigests();
const latest = [...engineering, ...research].map(({ slug }) => slug).sort().at(-1)!;
const engineeringEdition = engineering.find(({ slug }) => slug === latest);
const researchEdition = research.find(({ slug }) => slug === latest);
const dateRange = (engineeringEdition ?? researchEdition)!.dateRange;

async function expectHomepageContract(page: Page) {
  const main = page.getByRole("main");
  await expect(main).toHaveCount(1);
  await expect(main.getByRole("heading", { name: "Latest briefing", level: 1 })).toBeVisible();
  const date = main.getByText(dateRange, { exact: true });
  await expect(date).toHaveAttribute("datetime", latest);
  const engineeringCount = engineeringEdition?.items.length ?? 0;
  const researchCount = researchEdition?.papers.length ?? 0;
  await expect(main.getByText(`${engineeringCount} Engineering ${engineeringCount === 1 ? "update" : "updates"} · ${researchCount} Research ${researchCount === 1 ? "pick" : "picks"}`, { exact: true })).toBeVisible();

  const engineeringTrack = main.getByRole("region", { name: "Engineering", exact: true });
  const engineeringStories = engineeringEdition?.items.slice(0, 3) ?? [];
  await expect(engineeringTrack.getByRole("listitem")).toHaveCount(engineeringStories.length);
  for (const [index, item] of engineeringStories.entries()) {
    const row = engineeringTrack.getByRole("listitem").nth(index);
    const title = row.getByRole("heading", { level: 3 }).getByRole("link");
    await expect(title).toHaveText(item.title);
    await expect(title).toHaveAttribute("href", engineeringItemHref(latest, item.id));
    await expect(row.getByText(item.oneLineSummary, { exact: true })).toBeVisible();
  }
  if (engineeringEdition) {
    await expect(engineeringTrack.getByRole("link", { name: "Read the full Engineering briefing" })).toHaveAttribute("href", `/engineering/${latest}`);
  } else {
    await expect(engineeringTrack.getByText("No Engineering edition was published for this date.")).toBeVisible();
    await expect(engineeringTrack.getByRole("link", { name: "Engineering archive" })).toHaveAttribute("href", "/engineering");
  }

  const researchTrack = main.getByRole("region", { name: "Research", exact: true });
  const papers = researchEdition?.papers.slice(0, 3) ?? [];
  if (researchEdition) await expect(researchTrack.getByRole("list", { name: "Research" })).toBeVisible();
  await expect(researchTrack.getByRole("listitem")).toHaveCount(papers.length);
  for (const [index, paper] of papers.entries()) {
    const row = researchTrack.getByRole("listitem").nth(index);
    const title = row.getByRole("heading", { level: 3 }).getByRole("link");
    await expect(title).toHaveText(paper.title);
    await expect(title).toHaveAttribute("href", `/papers/${paper.slug}`);
    if (paper.publicationSource) {
      await expect(row.getByText(paper.publicationSource, { exact: true })).toBeVisible();
    }
  }
  if (researchEdition) {
    await expect(researchTrack.getByRole("link", { name: "Read the full Research digest" })).toHaveAttribute("href", `/weekly/${latest}`);
  } else {
    await expect(researchTrack.getByText("No Research edition was published for this date.")).toBeVisible();
    await expect(researchTrack.getByRole("link", { name: "Research archive" })).toHaveAttribute("href", "/archive");
  }
  await expect(main.getByRole("link", { name: "Past briefings" })).toHaveAttribute("href", "/briefings");
  await expect(main.getByRole("link", { name: "Subscribe" })).toHaveAttribute("href", "/subscribe");
}

test("homepage preserves the latest edition date, full counts, ordered preview contents and links", async ({ page }) => {
  await page.goto("/");
  await expectHomepageContract(page);
  const masthead = page.getByRole("region", { name: "Latest briefing" });
  await expect(masthead.getByRole("figure", { name: "Floating wind schematic" })).toBeVisible();
  const lead = page.getByRole("region", { name: "Engineering", exact: true }).getByRole("listitem").first();
  if (engineeringEdition?.items.length) {
    const first = engineeringEdition.items[0];
    await expect(lead.getByRole("article", { name: first.title })).toBeVisible();
    const secondary = engineeringEdition.items.slice(1, 3);
    for (const item of secondary) {
      await expect(page.getByRole("article", { name: item.title, exact: true })).toBeVisible();
    }
    const source = first.sourceRecords.find(({ sourceUrl }) => sourceUrl === first.sourceUrl);
    const action = lead.getByRole("link", { name: `Read briefing item ${first.title}` });
    await expect(action).toHaveAttribute("href", engineeringItemHref(latest, first.id));
    if (source) {
      await expect(lead.getByRole("link", { name: source.publisher })).toHaveAttribute("href", source.sourceUrl);
      await expect(lead.locator("time")).toHaveAttribute("datetime", source.publishedDate);
    }
  }
});

test("single-track and empty fixtures keep availability messages, counts and continuation links", async ({ page }) => {
  const engineeringOnly = engineering.find((edition) => edition.items.length >= 3)!;
  const researchOnly = research.find((edition) => edition.papers.length >= 3)!;
  await page.setContent(renderHomepageFixture(getLatestBriefingPreview([engineeringOnly], [])));
  await expect(page.getByText(`${engineeringOnly.items.length} Engineering updates · 0 Research picks`, { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Read the full Engineering briefing" })).toHaveAttribute("href", `/engineering/${engineeringOnly.slug}`);
  await expect(page.getByText("No Research edition was published for this date.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Research archive" })).toHaveAttribute("href", "/archive");
  const items = page.getByRole("region", { name: "Engineering", exact: true }).getByRole("listitem");
  await expect(items).toHaveCount(3);
  for (const [index, item] of engineeringOnly.items.slice(0, 3).entries()) {
    const entry = items.nth(index);
    await expect(entry.getByRole("article", { name: item.title, exact: true })).toBeVisible();
    const headline = entry.getByRole("heading", { level: 3 }).getByRole("link");
    await expect(headline).toHaveText(item.title);
    await expect(headline).toHaveAttribute("href", engineeringItemHref(engineeringOnly.slug, item.id));
    await expect(entry.getByText(item.oneLineSummary, { exact: true })).toBeVisible();
  }

  await page.setContent(renderHomepageFixture(getLatestBriefingPreview([], [researchOnly])));
  await expect(page.getByText(`0 Engineering updates · ${researchOnly.papers.length} Research picks`, { exact: true })).toBeVisible();
  await expect(page.getByText("No Engineering edition was published for this date.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Engineering archive" })).toHaveAttribute("href", "/engineering");
  await expect(page.getByRole("link", { name: "Read the full Research digest" })).toHaveAttribute("href", `/weekly/${researchOnly.slug}`);
  const papers = page.getByRole("list", { name: "Research" }).getByRole("listitem");
  await expect(papers).toHaveCount(3);
  for (const [index, paper] of researchOnly.papers.slice(0, 3).entries()) {
    const row = papers.nth(index);
    await expect(row.getByRole("link", { name: paper.title, exact: true })).toHaveAttribute("href", `/papers/${paper.slug}`);
    await expect(row.getByText(paper.publicationSource, { exact: true })).toBeVisible();
  }

  await page.setContent(renderHomepageFixture(null));
  await expect(page.getByText("No editions are available yet.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Past briefings" })).toHaveAttribute("href", "/briefings");
  await expect(page.getByRole("link", { name: "Subscribe" })).toHaveAttribute("href", "/subscribe");
});

test("editorial imagery uses the exact edition and lead item ID and renders bilingual alt and credit", async ({ page }) => {
  const edition = engineering.find(({ items }) => items.length >= 3)!;
  const [first, second] = edition.items;
  const preview = getLatestBriefingPreview([edition], []);
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
    await page.setContent(renderHomepageFixture(preview, "en", images));
    await expect(page.getByRole("img")).toHaveCount(0);
    const lead = page.getByRole("listitem").first();
    await expect(lead.getByRole("heading")).toHaveText(first.title);
    await expect(lead.getByText(first.oneLineSummary, { exact: true })).toBeVisible();
    await expect(lead.getByRole("link", { name: `Read briefing item ${first.title}` })).toHaveAttribute("href", engineeringItemHref(edition.slug, first.id));
    await expect(page.getByRole("listitem").nth(1).getByRole("heading")).toHaveText(second.title);
  }

  for (const language of ["en", "zh"] as const) {
    await page.setContent(renderHomepageFixture(preview, language, { [edition.slug]: { [first.id]: image } }));
    await expect(page.getByRole("figure", { name: language === "en" ? "Floating wind schematic" : "浮式风电示意图" })).toHaveCount(0);
    const picture = page.getByRole("img", { name: image.alt[language] });
    await expect(picture).toBeVisible();
    await expect(picture).toHaveAttribute("width", "1600");
    await expect(picture).toHaveAttribute("height", "900");
    await expect.poll(() => picture.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByRole("link", { name: image.credit })).toHaveAttribute("href", image.sourceUrl);
    await expect(page.getByRole("link", { name: language === "en" ? "Reuse terms" : "使用条款" })).toHaveAttribute("href", image.rightsReference);
    await expect(page.getByRole("listitem").first().getByRole("heading")).toHaveText(first.title);
  }
});

test("homepage previews and continuation stay readable at 390px and 320px in both languages and themes", async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    for (const language of ["en", "zh"] as const) {
      await page.getByRole("button", { name: language === "en" ? "EN" : "中文", exact: true }).click();
      const main = page.getByRole("main");
      await expect(main.getByRole("heading", { level: 1 })).toHaveText(language === "en" ? "Latest briefing" : "最新简报");
      await expect(main.getByRole("figure", { name: language === "en" ? "Floating wind schematic" : "浮式风电示意图" })).toBeVisible();
      for (const theme of ["light", "dark"] as const) {
        if (theme === "dark") await selectDarkTheme(page);
        else if (await page.locator("#theme-dark").isChecked()) await page.locator('label[for="theme-light"]').click();
        await expect(page.locator(`#theme-${theme}`)).toBeChecked();
        await expect(main.getByRole("link", { name: language === "en" ? "Past briefings" : "往期简报" })).toBeVisible();
        await expect(main.getByRole("link", { name: language === "en" ? "Subscribe" : "订阅" })).toBeVisible();
        const textElements = main.locator("h1, h2, h3 a, li p, time");
        for (const element of await textElements.all()) {
          const box = await element.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        }
        await expect(main.getByRole("heading", { level: 3 })).toHaveText([
          ...(engineeringEdition?.items.slice(0, 3).map(({ title }) => title) ?? []),
          ...(researchEdition?.papers.slice(0, 3).map(({ title }) => title) ?? []),
        ]);
      }
    }
  }
});
