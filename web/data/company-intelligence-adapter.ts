import companyDirectoryLogos from "./industry/company-directory-logos.json";
import eventDataset from "./context/company-events.json";
import { type CompanyNewsCategory, companyNewsCategories } from "./company-news-categories";
import { getCompanyProjectRecords } from "./connected-context-adapter";
import { getAllDigitalAiSignals } from "./digital-ai-adapter";
import { getAllEngineeringBriefings } from "./engineering-briefing-adapter";
import { getIndustryCompanies } from "./industry/industry-map";
import { getAllProjects } from "./project-adapter";

type RetainedSourceReference =
  | { kind: "engineering"; editionSlug: string; sourceRecordId: string }
  | { kind: "digital_ai"; signalId: string; sourceId: string };

type CompanyEventSource = {
  publisher: string;
  url: string;
  tier: "primary" | "secondary";
  evidence: string;
  publishedDate: string | null;
  reference?: RetainedSourceReference;
};

type CompanyEvent = {
  id: string;
  publishedDate: string;
  title: string;
  summary: string;
  category: CompanyNewsCategory;
  companyIds: string[];
  projectIds: string[];
  reviewedOn: string;
  sources: CompanyEventSource[];
  historicalAttributions: { companyId: string; name: string }[];
};

export type CompanyNewsRecord = Pick<CompanyEvent, "id" | "publishedDate" | "title" | "summary" | "category"> & {
  publisher: string;
  url: string;
  projects: { name: string; slug: string }[];
  historicalSubjects: string[];
};

const companies = getIndustryCompanies().slice().sort((a, b) => a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id, "en"));
const companiesById = new Map(companies.map((company) => [company.id, company]));
const briefingsBySlug = new Map(getAllEngineeringBriefings().map((briefing) => [
  briefing.slug, new Map(briefing.sourceRecords.map((source) => [source.id, source])),
]));
const signalsById = new Map(getAllDigitalAiSignals().map((signal) => [signal.id, signal]));
const projectsById = new Map(getAllProjects().map((project) => [project.id, project]));
const retainedUrls = new Set([
  ...[...briefingsBySlug.values()].flatMap((sources) => [...sources.values()].map((source) => source.sourceUrl)),
  ...[...signalsById.values()].flatMap((signal) => signal.sources.map((source) => source.url)),
].map(canonicalUrl));

function hasFields(value: unknown, fields: string[]): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    Object.keys(value).every((key) => fields.includes(key));
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function canonicalUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  for (const parameter of [...url.searchParams.keys()]) {
    if (parameter.startsWith("utm_")) url.searchParams.delete(parameter);
  }
  url.searchParams.sort();
  return url.href.replace(/\/(?=\?|$)/, "");
}

function isOriginalUrl(value: unknown): value is string {
  if (!isText(value) || !value.startsWith("https://") || /\s/.test(value)) return false;
  const url = URL.parse(value);
  return Boolean(url && url.hostname.includes(".") && !url.username && !url.password && url.pathname !== "/");
}

function mentions(text: string, name: string) {
  const escaped = name.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");
  return new RegExp("(^|[^\\p{L}\\p{N}])" + escaped + "($|[^\\p{L}\\p{N}])", "iu").test(text);
}

function resolveCitation(value: unknown, context: { label: string; first: boolean; summary: string; publishedDate: string; reviewedOn: string }): CompanyEventSource {
  const { label, first, summary, publishedDate, reviewedOn } = context;
  const fields = ["kind", "tier", "evidence"];
  if (!hasFields(value, [...fields, "url", "publisher", "publishedDate", "editionSlug", "sourceRecordId", "signalId", "sourceId"]) ||
    (value.tier !== "primary" && value.tier !== "secondary")) {
    throw new Error(label + ": invalid source fields or tier");
  }
  const { kind, tier } = value;
  if (kind === "external" && hasFields(value, [...fields, "url", "publisher", "publishedDate"])) {
    const { url, publisher } = value;
    const date = value.publishedDate ?? (first ? publishedDate : null);
    const evidence = value.evidence ?? (first ? summary : undefined);
    if (!isOriginalUrl(url) || !isText(publisher) || !isText(evidence)) {
      throw new Error(label + ": external source needs an original HTTPS URL, publisher and reviewed evidence");
    }
    if (retainedUrls.has(canonicalUrl(url))) {
      throw new Error(label + ": reuse the retained source reference for this URL");
    }
    if (date !== null && (!isDate(date) || date > reviewedOn)) {
      throw new Error(label + ": invalid source publication date");
    }
    return { url, publisher, publishedDate: date, tier, evidence };
  }

  let source;
  let reference: RetainedSourceReference;
  if (kind === "engineering" && hasFields(value, [...fields, "editionSlug", "sourceRecordId"]) &&
    isText(value.editionSlug) && isText(value.sourceRecordId)) {
    const { editionSlug, sourceRecordId } = value;
    reference = { kind, editionSlug, sourceRecordId };
    const record = briefingsBySlug.get(editionSlug)?.get(sourceRecordId);
    if (record) source = { url: record.sourceUrl, publisher: record.publisher, publishedDate: record.publishedDate,
      text: [record.sourceText, record.title] };
  } else if (kind === "digital_ai" && hasFields(value, [...fields, "signalId", "sourceId"]) &&
    isText(value.signalId) && isText(value.sourceId)) {
    const { signalId, sourceId } = value;
    reference = { kind, signalId, sourceId };
    const signal = signalsById.get(signalId);
    const record = signal?.sources.find((candidate) => candidate.sourceId === sourceId);
    if (signal && record) source = { url: record.url, publisher: record.publisher, publishedDate: record.publishedDate,
      text: [record.title, signal.title, signal.shortDescription, signal.connectionToFowt, ...signal.organizations] };
  } else {
    throw new Error(label + ": invalid source kind or reference");
  }
  if (!source) throw new Error(label + ": unknown retained source reference");
  if ((first || source.publishedDate !== null) && (!isDate(source.publishedDate) || source.publishedDate > reviewedOn)) {
    throw new Error(label + ": retained source needs a publication date on or before review");
  }
  const { evidence } = value;
  if (!isText(evidence) || !source.text.some((text) => text.includes(evidence))) {
    throw new Error(label + ": evidence must be an exact stored excerpt");
  }
  return { url: source.url, publisher: source.publisher, publishedDate: source.publishedDate, tier, reference, evidence };
}

function resolveIds(value: unknown, catalogue: ReadonlyMap<string, unknown>, label: string, required = false): string[] {
  if (!Array.isArray(value) || (required && value.length === 0) ||
    !value.every((id) => typeof id === "string" && catalogue.has(id)) || new Set(value).size !== value.length) {
    throw new Error(label + ": expected distinct canonical IDs");
  }
  return value.slice();
}

export function resolveCompanyEvents(dataset: unknown, today = new Date().toISOString().slice(0, 10)): CompanyEvent[] {
  if (!hasFields(dataset, ["schemaVersion", "events"]) ||
    dataset.schemaVersion !== "company-events.v1" || !Array.isArray(dataset.events)) {
    throw new Error("Company Intelligence: expected a company-events.v1 dataset");
  }
  const ids = new Set<string>();
  const events = dataset.events.map((event, index): CompanyEvent => {
    const label = "Company event " + (index + 1);
    if (!hasFields(event, ["id", "publishedDate", "title", "summary", "category", "companyIds", "projectIds",
      "sources", "reviewedOn", "historicalAttributions"])) throw new Error(label + ": invalid event fields");
    const { id, publishedDate, title, summary, category, reviewedOn } = event;
    if (!isText(id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) {
      throw new Error(label + ": invalid or duplicate event ID");
    }
    ids.add(id);
    if (!isDate(publishedDate) || !isDate(reviewedOn) || reviewedOn > today || reviewedOn < publishedDate) {
      throw new Error(label + ": invalid publication or review date");
    }
    if (!isText(title) || !isText(summary) || !isText(category) || !Object.hasOwn(companyNewsCategories, category)) {
      throw new Error(label + ": expected title, summary and controlled primary category");
    }
    const companyIds = resolveIds(event.companyIds, companiesById, label + " companyIds", true);
    const projectIds = resolveIds(event.projectIds, projectsById, label + " projectIds");
    if (!Array.isArray(event.sources) || !event.sources.length) throw new Error(label + ": expected at least one source");
    const sources = event.sources.map((source, index) =>
      resolveCitation(source, { label, first: index === 0, summary, publishedDate, reviewedOn }));
    if (new Set(sources.map(({ url }) => canonicalUrl(url))).size !== sources.length) {
      throw new Error(label + ": duplicate source publication within event");
    }
    if (sources[0].publishedDate !== publishedDate ||
      (sources[0].tier === "secondary" && sources.some((source) => source.tier === "primary"))) {
      throw new Error(label + ": lead source must match event date and use the strongest available tier");
    }
    const evidence = sources.map((source) => source.evidence).join("\n");
    const historicalAttributions = event.historicalAttributions ?? [];
    if (!Array.isArray(historicalAttributions) || !historicalAttributions.every((entry) =>
      hasFields(entry, ["companyId", "name"]) && typeof entry.companyId === "string" &&
      companyIds.includes(entry.companyId) && isText(entry.name) && mentions(evidence, entry.name)) ||
      new Set(historicalAttributions.map(({ companyId }) => companyId)).size !== historicalAttributions.length) {
      throw new Error(label + ": invalid historical company attribution");
    }
    for (const companyId of companyIds) {
      const name = companiesById.get(companyId)!.name;
      if (!mentions(evidence, name) && !historicalAttributions.some((entry) => entry.companyId === companyId)) {
        throw new Error(label + ": evidence must identify each linked company");
      }
    }
    for (const projectId of projectIds) {
      const project = projectsById.get(projectId)!;
      if (![project.name, ...project.aliases].some((name) => mentions(evidence, name))) {
        throw new Error(label + ": evidence must identify each linked project");
      }
    }
    return { id, publishedDate, title, summary, category: category as CompanyNewsCategory, companyIds, projectIds,
      reviewedOn, sources, historicalAttributions };
  });
  return events.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate, "en") || a.id.localeCompare(b.id, "en"));
}

export function indexCompanyEvents(events: readonly CompanyEvent[]) {
  const byCompany = new Map<string, CompanyEvent[]>();
  for (const event of events) {
    for (const companyId of event.companyIds) {
      const list = byCompany.get(companyId);
      if (list) list.push(event);
      else byCompany.set(companyId, [event]);
    }
  }
  return byCompany;
}

const companyEvents = resolveCompanyEvents(eventDataset);
const newsByCompany = indexCompanyEvents(companyEvents);

export function getCompanyEvents(): readonly CompanyEvent[] {
  return companyEvents;
}

const directoryLogos: Readonly<Record<string, { file: string; width: number; height: number; source: string }>> = companyDirectoryLogos;

export function getCompanyIndex() {
  return companies.map(({ id, name, companyType, countryRegion, profilePending, roles }) => {
    const news = newsByCompany.get(id) ?? [];
    const logo = directoryLogos[id];
    return { id, name, companyType, countryRegion, profilePending, roles, logo, updateCount: news.length, latestDate: news[0]?.publishedDate };
  });
}

export function getCompanyIntelligence(id: string) {
  const company = companiesById.get(id);
  if (!company) return;
  const news: CompanyNewsRecord[] = (newsByCompany.get(id) ?? []).map((event) => {
    const { title, summary, publishedDate, category } = event;
    const { url, publisher } = event.sources[0];
    const projects = event.projectIds.map((projectId) => {
      const { name, slug } = projectsById.get(projectId)!;
      return { name, slug };
    });
    return { id: event.id, title, summary, publishedDate, category, publisher, url, projects,
      historicalSubjects: [...new Set(event.historicalAttributions.map(({ name }) => name))] };
  });
  return { company, news, projects: getCompanyProjectRecords(id) };
}
