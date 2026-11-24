import { engineeringItemHref } from "../data/context-navigation";
import type { DigestEdition } from "../data/digest-adapter";
import type { EngineeringBriefing } from "../data/engineering-briefing-adapter";

const PREVIEW_LIMIT = 3;

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

export function getLatestBriefingPreview(engineering: readonly EngineeringBriefing[], research: readonly DigestEdition[]) {
  const week = getBriefingWeeks(engineering, research)[0];
  if (!week) return null;

  const { slug, dateRange } = week;
  return {
    slug,
    dateRange,
    engineering: week.engineering ? {
      href: `/engineering/${slug}`,
      selectedCount: week.engineering.items.length,
      previewItems: week.engineering.items.slice(0, PREVIEW_LIMIT).map(({ id, title, oneLineSummary }) => ({
        href: engineeringItemHref(slug, id), title, summary: oneLineSummary,
      })),
    } : null,
    research: week.research ? {
      href: `/weekly/${slug}`,
      selectedCount: week.research.papers.length,
      previewPapers: week.research.papers.slice(0, PREVIEW_LIMIT).map(({ slug, title, publicationSource }) => ({
        href: `/papers/${slug}`, title, publicationSource,
      })),
    } : null,
  };
}
