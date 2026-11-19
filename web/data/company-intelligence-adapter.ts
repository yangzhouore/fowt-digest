import linkDataset from "./context/company-news-links.json";
import { type CompanyNewsCategory, companyNewsCategories } from "./company-news-categories";
import { getCompanyProjectRecords } from "./connected-context-adapter";
import { getAllDigitalAiSignals } from "./digital-ai-adapter";
import { getAllEngineeringBriefings } from "./engineering-briefing-adapter";
import { getIndustryCompanies } from "./industry/industry-map";
import { getAllProjects } from "./project-adapter";

type SourceReference =
  | { kind: "engineering"; editionSlug: string; sourceRecordId: string }
  | { kind: "digital_ai"; signalId: string; sourceId: string };

export type CompanyNewsRecord = {
  id: string;
  category: CompanyNewsCategory;
  publishedDate: string;
  title: string;
  summary: string;
  publisher: string;
  url: string;
  project?: { name: string; slug: string };
};

const companies = getIndustryCompanies().slice().sort((a, b) => a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id, "en"));
const companiesById = new Map(companies.map((company) => [company.id, company]));
const briefingsBySlug = new Map(getAllEngineeringBriefings().map((briefing) => [briefing.slug, briefing]));
const signalsById = new Map(getAllDigitalAiSignals().map((signal) => [signal.id, signal]));
const projectsById = new Map(getAllProjects().map((project) => [project.id, project]));

function resolveSource(reference: SourceReference, excerpt: string) {
  if (reference.kind === "engineering") {
    const edition = briefingsBySlug.get(reference.editionSlug);
    const source = edition?.sourceRecords.find((record) => record.id === reference.sourceRecordId);
    if (!source) return;
    const summary = edition?.items.find((item) => item.sourceUrl === source.sourceUrl &&
      item.sourceRecords.some((record) => record.id === source.id))?.oneLineSummary;
    return {
      id: source.id, publishedDate: source.publishedDate, title: source.title,
      publisher: source.publisher, url: source.sourceUrl, summary: summary ?? excerpt,
      evidence: [source.sourceText],
    };
  }
  const signal = signalsById.get(reference.signalId);
  const source = signal?.sources.find((source) => source.sourceId === reference.sourceId);
  if (!signal || !source) return;
  return {
    id: source.sourceId, publishedDate: source.publishedDate, title: signal.title,
    publisher: source.publisher, url: source.url, summary: signal.shortDescription,
    evidence: [signal.shortDescription, signal.connectionToFowt, signal.title, ...signal.organizations, source.title],
  };
}

function hasFields(value: unknown, fields: string[]): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    Object.keys(value).every((key) => fields.includes(key));
}

function isReference(value: unknown): value is SourceReference {
  if (!hasFields(value, ["kind", "editionSlug", "sourceRecordId", "signalId", "sourceId"])) return false;
  return value.kind === "engineering"
    ? typeof value.editionSlug === "string" && typeof value.sourceRecordId === "string" &&
      !("signalId" in value || "sourceId" in value)
    : value.kind === "digital_ai" && typeof value.signalId === "string" && typeof value.sourceId === "string" &&
      !("editionSlug" in value || "sourceRecordId" in value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function mentions(excerpt: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "iu").test(excerpt);
}

function compareRecords(a: CompanyNewsRecord, b: CompanyNewsRecord) {
  return b.publishedDate.localeCompare(a.publishedDate, "en") ||
    a.id.localeCompare(b.id, "en") || a.url.localeCompare(b.url, "en");
}

export function resolveCompanyNews(dataset: unknown, today = new Date().toISOString().slice(0, 10)) {
  if (!hasFields(dataset, ["schemaVersion", "links"]) || dataset.schemaVersion !== "company-news-links.v1" || !Array.isArray(dataset.links)) {
    throw new Error("Company news: expected a company-news-links.v1 dataset with a links array");
  }
  const byCompany = new Map<string, Map<string, CompanyNewsRecord>>();
  for (const [index, link] of dataset.links.entries()) {
    const label = `Company news link ${index + 1}`;
    if (!hasFields(link, ["companyId", "source", "category", "projectId", "mappingReviewedOn", "storedExcerpt"])) {
      throw new Error(`${label}: unexpected fields or invalid link object`);
    }
    const { companyId, source, category, projectId, mappingReviewedOn, storedExcerpt } = link;
    const company = typeof companyId === "string" ? companiesById.get(companyId) : undefined;
    if (!company) throw new Error(`${label}: unknown canonical company ID`);
    if (typeof category !== "string" || !Object.hasOwn(companyNewsCategories, category)) {
      throw new Error(`${label}: unsupported primary category`);
    }
    if (!isDate(mappingReviewedOn) || mappingReviewedOn > today) {
      throw new Error(`${label}: invalid mapping review date`);
    }
    if (typeof storedExcerpt !== "string" || !storedExcerpt.trim() || !isReference(source)) {
      throw new Error(`${label}: expected a retained source reference and stored evidence`);
    }
    const resolved = resolveSource(source, storedExcerpt);
    if (!resolved) throw new Error(`${label}: unknown retained source reference`);
    if (!isDate(resolved.publishedDate) || mappingReviewedOn < resolved.publishedDate) {
      throw new Error(`${label}: source must have a publication date on or before review`);
    }
    if (!resolved.evidence.some((text) => text.includes(storedExcerpt)) || !mentions(storedExcerpt, company.name)) {
      throw new Error(`${label}: evidence must be an exact stored excerpt identifying the company`);
    }
    let project;
    if (projectId !== undefined) {
      const canonical = typeof projectId === "string" ? projectsById.get(projectId) : undefined;
      if (!canonical || !getCompanyProjectRecords(company.id).some((record) => record.id === projectId)) {
        throw new Error(`${label}: unknown or unlinked project`);
      }
      if (![canonical.name, ...canonical.aliases].some((name) => mentions(storedExcerpt, name))) {
        throw new Error(`${label}: evidence must identify the linked project`);
      }
      project = { name: canonical.name, slug: canonical.slug };
    }
    const { id, publishedDate, title, summary, publisher, url } = resolved;
    const record = { id, publishedDate, title, summary, publisher, url, category: category as CompanyNewsCategory, project };
    const records = byCompany.get(company.id) ?? new Map<string, CompanyNewsRecord>();
    const previous = records.get(url);
    if (previous && (previous.category !== category || previous.project?.slug !== project?.slug)) {
      throw new Error(`${label}: conflicting mappings for the same source`);
    }
    if (!previous || (compareRecords(record, previous) ||
      record.title.localeCompare(previous.title, "en") || record.summary.localeCompare(previous.summary, "en") ||
      record.publisher.localeCompare(previous.publisher, "en")) < 0) records.set(url, record);
    byCompany.set(company.id, records);
  }
  return new Map([...byCompany].map(([id, records]) => [id, [...records.values()].sort(compareRecords)]));
}

const newsByCompany = resolveCompanyNews(linkDataset);

export function getCompanyIndex() {
  return companies.map(({ id, name, companyType, countryRegion }) => {
    const news = newsByCompany.get(id) ?? [];
    return { id, name, companyType, countryRegion, updateCount: news.length, latestDate: news[0]?.publishedDate };
  });
}

export function getCompanyIntelligence(id: string) {
  const company = companiesById.get(id);
  if (!company) return;
  return { company, news: newsByCompany.get(id) ?? [], projects: getCompanyProjectRecords(id) };
}
