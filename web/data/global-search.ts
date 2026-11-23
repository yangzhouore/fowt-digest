import { companyEventHref } from "./context-navigation";

export const searchTypes = ["company", "project", "event", "engineering", "research", "digitalAi"] as const;
export const searchResultLimit = 30;
export type SearchType = (typeof searchTypes)[number];

export type SearchDocument = {
  id: string;
  type: SearchType;
  title: string;
  summary?: string;
  context?: string;
  href: string;
  date?: string;
  dateLabel?: string;
  companyIds: string[];
  projectIds: string[];
  aliases?: string[];
  updateCount?: number;
  text: string;
};

export function normalizeSearchText(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function searchEventHref(eventId: string, companyIds: readonly string[], matches?: ReadonlySet<string>) {
  const ordered = [...companyIds].sort();
  const companyId = ordered.find((id) => matches?.has(id)) ?? ordered[0];
  return companyEventHref(companyId, eventId);
}

export function diversifySearchResults(results: readonly SearchDocument[]) {
  if (results.length <= searchResultLimit) return results;

  // Reserve one slot for the best match of each type, then fill by rank.
  const selected = new Set<SearchDocument>();
  const types = new Set<SearchType>();
  for (const result of results) {
    if (types.has(result.type)) continue;
    selected.add(result);
    types.add(result.type);
  }
  for (const result of results) {
    if (selected.size === searchResultLimit) break;
    selected.add(result);
  }
  return results.filter((result) => selected.has(result));
}

export function searchDocuments(documents: readonly SearchDocument[], input: string) {
  const query = normalizeSearchText(input);
  if (!query) return [];

  // Escape literal punctuation and require word boundaries for text matches.
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const phrase = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:$|[^\\p{L}\\p{N}])`, "u");
  const companies = new Set<string>();
  const projects = new Set<string>();
  for (const document of documents) {
    if (document.type !== "company" && document.type !== "project") continue;
    if ([document.id, document.title, ...(document.aliases ?? [])].some((name) => normalizeSearchText(name) === query)) {
      (document.type === "company" ? companies : projects).add(document.id);
    }
  }

  const ranked = documents.flatMap((document) => {
    const title = normalizeSearchText(document.title);
    const isEntity = document.type === "company" || document.type === "project";
    const related = document.companyIds.some((id) => companies.has(id)) || document.projectIds.some((id) => projects.has(id));
    const rank =
      isEntity && (title === query || document.id === query) ? 70 :
      title === query ? 60 :
      document.aliases?.some((alias) => normalizeSearchText(alias) === query) ? 50 :
      title.startsWith(query) ? 40 :
      phrase.test(title) ? 30 :
      related ? 20 :
      (phrase.test(document.text) ||
        [document.summary, document.context, document.date, document.dateLabel, ...(document.aliases ?? [])]
          .some((field) => field && phrase.test(normalizeSearchText(field)))) ? 10 : 0;
    return rank ? [{ document, rank: rank + Number(isEntity) }] : [];
  });

  return ranked.sort((a, b) =>
    b.rank - a.rank ||
    (b.document.date ?? "").localeCompare(a.document.date ?? "", "en") ||
    a.document.title.localeCompare(b.document.title, "en") ||
    a.document.type.localeCompare(b.document.type, "en") ||
    a.document.id.localeCompare(b.document.id, "en"),
  ).map(({ document }) => document.type === "event"
    ? { ...document, href: searchEventHref(document.id, document.companyIds, companies) }
    : document);
}
