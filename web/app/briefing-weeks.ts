import { engineeringItemHref } from "../data/context-navigation";
import type { DigestEdition } from "../data/digest-adapter";
import type { EngineeringBriefing } from "../data/engineering-briefing-adapter";

type BriefingWeek = {
  slug: string;
  dateRange: string;
  engineering?: EngineeringBriefing;
  research?: DigestEdition;
};

export function getBriefingWeeks(engineering: readonly EngineeringBriefing[], research: readonly DigestEdition[]) {
  const weeks = new Map<string, BriefingWeek>();
  for (const edition of engineering) {
    weeks.set(edition.slug, { slug: edition.slug, dateRange: edition.dateRange, engineering: edition });
  }
  for (const edition of research) {
    const week = weeks.get(edition.slug);
    if (week) {
      week.research = edition;
    } else {
      weeks.set(edition.slug, { slug: edition.slug, dateRange: edition.dateRange, research: edition });
    }
  }
  return [...weeks.values()].sort((a, b) => b.slug.localeCompare(a.slug));
}

export function getBriefingWeekPreviews(engineering: readonly EngineeringBriefing[], research: readonly DigestEdition[]) {
  return getBriefingWeeks(engineering, research).map(toWeekPreview);
}

function toWeekPreview({ slug, dateRange, engineering, research }: BriefingWeek) {
  return {
    slug,
    dateRange,
    engineering: engineering ? {
      href: `/engineering/${slug}`,
      items: Array.from(Map.groupBy(engineering.items, (item) => item.category).values()).flat().map((item) => {
        const { id, title, engineeringTopics, category, sourceRecords, sourceUrl } = item;
        const source = sourceRecords.find((record) => record.sourceUrl === sourceUrl);
        return {
          id, href: engineeringItemHref(slug, id), title, keywords: engineeringTopics.slice(0, 3), category,
          source: source ? { publisher: source.publisher, publishedDate: source.publishedDate, href: source.sourceUrl } : null,
        };
      }),
    } : null,
    research: research ? {
      href: `/weekly/${slug}`,
      papers: research.papers.map(({ id, slug, title, publicationDate, publicationSource, sourceUrl, topicTags }) => ({
        id, href: "/papers/" + slug, title, publicationDate, publicationSource, sourceUrl, topicTags: topicTags.slice(0, 3),
      })),
    } : null,
  };
}
