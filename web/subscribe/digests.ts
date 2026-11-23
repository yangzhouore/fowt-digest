import { getCompanyEvents } from "../data/company-intelligence-adapter";
import { companyNewsCategories } from "../data/company-news-categories";
import { companyEventHref, engineeringItemHref } from "../data/context-navigation";
import { getAllDigests } from "../data/digest-adapter";
import { getAllEngineeringBriefings } from "../data/engineering-briefing-adapter";
import { getAllProjects } from "../data/project-adapter";
import { productTitles, subscriptionCompanies, type Locale } from "./preferences";
import type { Delivery, Subscriber } from "./store";

const day = 86_400_000;
const names = new Map(subscriptionCompanies().map(({ id, name }) => [id, name]));
const projects = new Map(getAllProjects().map((project) => [project.id, project]));
const engineeringEditions = getAllEngineeringBriefings();
const researchEditions = getAllDigests();

export function completedWeek(now: Date) {
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const monday = midnight - ((now.getUTCDay() + 6) % 7) * day;
  return { start: isoDate(monday - 7 * day), end: isoDate(monday - day) };
}

function isoDate(value: number) {
  return new Date(value).toISOString().slice(0, 10);
}

type Link = { label: string; url: string };
type Item = { title: string; url: string; lines: string[]; links?: Link[] };
type Section = { title?: string; url?: string; items: Item[]; note?: string };
export type Digest = Delivery & { title: string; period: string; sections: Section[] };

export function weeklyDigests(subscriber: Pick<Subscriber, "locale" | "preferences">, now: Date): Digest[] {
  const { locale, preferences } = subscriber;
  const week = completedWeek(now);
  const period = `${week.start} – ${week.end} UTC`;
  const digests: Digest[] = [];
  if (preferences.news) {
    const edition = currentEdition(engineeringEditions, week.end, now);
    if (edition?.items.length) {
      digests.push({
        kind: "news", key: edition.slug, periodEnd: week.end, period, title: productTitles.news[locale],
        itemIds: edition.items.map((item) => item.id), companyIds: [],
        sections: [{ url: `/engineering/${edition.slug}`, items: edition.items.map((item) => ({
          title: item.title, url: engineeringItemHref(edition.slug, item.id),
          lines: [item.oneLineSummary],
          links: item.sourceRecords.length
            ? item.sourceRecords.map((source) => ({ label: source.publisher, url: source.sourceUrl }))
            : [{ label: locale === "zh" ? "原始来源" : "Original source", url: item.sourceUrl }],
        })) }],
      });
    } else {
      digests.push(skippedEdition("news", week.end, period, locale));
    }
  }
  if (preferences.research) {
    const edition = currentEdition(researchEditions, week.end, now);
    if (edition?.papers.length) {
      digests.push({
        kind: "research", key: edition.slug, periodEnd: week.end, period, title: productTitles.research[locale],
        itemIds: edition.papers.map((paper) => paper.id), companyIds: [],
        sections: [{ url: `/weekly/${edition.slug}`, items: edition.papers.map((paper) => ({
          title: paper.title, url: `/papers/${paper.slug}`,
          lines: [paper.authors.join(", "), paper.publicationSource, paper.topicTags.join(" · ")].filter(Boolean),
        })) }],
      });
    } else {
      digests.push(skippedEdition("research", week.end, period, locale));
    }
  }
  if (preferences.companyIds.length) digests.push(companyDigest(preferences.companyIds, week, locale));
  return digests;
}

function currentEdition<T extends { slug: string; generatedAt: string }>(editions: T[], end: string, now: Date) {
  return editions.find((edition) => edition.slug === end && Date.parse(edition.generatedAt) <= now.getTime());
}

function skippedEdition(kind: "news" | "research", end: string, period: string, locale: Locale): Digest {
  return {
    kind, key: end, periodEnd: end, period, title: productTitles[kind][locale],
    sections: [], itemIds: [], companyIds: [], skipReason: "no_current_edition",
  };
}

function companyDigest(ids: string[], week: ReturnType<typeof completedWeek>, locale: Locale): Digest {
  const companyIds = [...new Set(ids)].sort();
  const sections = companyIds.map<Section>((id) => ({ title: names.get(id) ?? id, url: `/companies/${id}`, items: [] }));
  const shared = new Set<string>();
  const itemIds: string[] = [];
  for (const event of getCompanyEvents()) {
    if (event.publishedDate < week.start || event.publishedDate > week.end) continue;
    const match = companyIds.filter((id) => event.companyIds.includes(id));
    if (!match.length) continue;
    const [first, ...others] = match;
    for (const id of others) shared.add(id);
    itemIds.push(event.id);
    sections[companyIds.indexOf(first)].items.push({
      title: event.title, url: companyEventHref(first, event.id),
      lines: [
        `${event.publishedDate} · ${companyNewsCategories[event.category][locale]}`,
        ...(others.length ? [match.map((id) => names.get(id) ?? id).join(" · ")] : []),
        event.summary,
      ],
      links: [...event.sources.map((source) => ({ label: source.publisher, url: source.url })),
        ...event.projectIds.flatMap((id) => {
          const project = projects.get(id);
          return project ? [{ label: project.name, url: `/projects/${project.slug}` }] : [];
        })],
    });
  }
  for (const [index, section] of sections.entries()) {
    if (shared.has(companyIds[index])) {
      section.note = locale === "zh" ? "共同动态已列于其他企业栏目。" : "Shared developments are listed under another company.";
    } else if (!section.items.length) {
      section.note = locale === "zh" ? "暂无新的已审阅动态。" : "No new reviewed developments.";
    }
  }
  const title = companyIds.length === 1 ? `${sections[0].title} — ${productTitles.company[locale]}` : productTitles.company[locale];
  return {
    kind: "company", key: week.end, periodEnd: week.end, companyIds, itemIds, sections, title,
    period: `${week.start} – ${week.end} UTC`, skipReason: itemIds.length ? undefined : "no_reviewed_developments",
  };
}
