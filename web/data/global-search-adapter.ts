import { getCompanyEvents, getCompanyIndex } from "./company-intelligence-adapter";
import { companyNewsCategories } from "./company-news-categories";
import { getCompanyProjectRecords, getEngineeringProjectContext } from "./connected-context-adapter";
import { engineeringItemHref } from "./context-navigation";
import { getAllDigestPaperResults } from "./digest-adapter";
import { formatDigitalAiTopic, getAllDigitalAiSignals } from "./digital-ai-adapter";
import { getAllEngineeringBriefings } from "./engineering-briefing-adapter";
import { normalizeSearchText, searchEventHref, type SearchDocument } from "./global-search";
import { getIndustryCompanies } from "./industry/industry-map";
import { formatStatus, getAllProjects } from "./project-adapter";

export function getGlobalSearchDocuments(): SearchDocument[] {
  const events = getCompanyEvents();
  const companies = getIndustryCompanies();
  const projects = getAllProjects();
  const companyUpdates = new Map(getCompanyIndex().map(({ id, updateCount }) => [id, updateCount]));
  const companyNames = new Map(companies.map(({ id, name }) => [id, name]));
  const projectNames = new Map(projects.map(({ id, name }) => [id, name]));
  const aliasesByCompany = new Map<string, Set<string>>();
  const projectRolesByCompany = new Map(companies.map(({ id }) => [id, getCompanyProjectRecords(id)]));
  const companiesByProject = new Map<string, { id: string; roles: string[] }[]>();

  for (const event of events) {
    for (const { companyId, name } of event.historicalAttributions) {
      const aliases = aliasesByCompany.get(companyId) ?? new Set<string>();
      aliases.add(name);
      aliasesByCompany.set(companyId, aliases);
    }
  }

  for (const [id, records] of projectRolesByCompany) {
    for (const record of records) {
      const participants = companiesByProject.get(record.id) ?? [];
      participants.push({ id, roles: record.roles.map((role) => role.roleLabel) });
      companiesByProject.set(record.id, participants);
    }
  }

  const companyDocuments = companies.map((company): SearchDocument => {
    const { id, name, companyType, countryRegion, description } = company;
    const aliases = [...(aliasesByCompany.get(id) ?? [])];
    const context = [companyType, countryRegion].join(" · ");
    return {
      id, type: "company", title: name, href: `/companies/${id}`, context, aliases,
      companyIds: [id],
      projectIds: (projectRolesByCompany.get(id) ?? []).map((record) => record.id),
      updateCount: companyUpdates.get(id),
      text: searchable([description, ...company.roles.map((role) => role.replaceAll("-", " "))]),
    };
  });
  const projectDocuments = projects.map((project): SearchDocument => {
    const { id, slug, name, aliases, country, region } = project;
    const participants = companiesByProject.get(id) ?? [];
    const context = [country, region, formatStatus(project.normalizedStatus)].join(" · ");
    const summary = project.intelligence?.currentAssessment;
    return {
      id, type: "project", title: name, href: `/projects/${slug}`, context, summary,
      aliases: [...new Set([slug, ...aliases])].filter((alias) => alias !== id),
      companyIds: participants.map((participant) => participant.id), projectIds: [id],
      text: searchable([project.sourceStatus, project.locationDescription, project.platformType,
        project.floatingTechnology, ...participants.flatMap(({ id, roles }) => [companyNames.get(id), ...roles])]),
    };
  });
  const eventDocuments = events.map((event): SearchDocument => {
    const { id, title, summary, publishedDate, sources, companyIds, projectIds } = event;
    return {
      id, type: "event", title, summary, date: publishedDate, context: sources[0].publisher,
      href: searchEventHref(id, companyIds), companyIds, projectIds,
      text: searchable([...Object.values(companyNewsCategories[event.category]),
        ...sources.map((source) => source.publisher), ...event.historicalAttributions.map(({ name }) => name),
        ...companyIds.map((id) => companyNames.get(id)), ...projectIds.map((id) => projectNames.get(id))]),
    };
  });
  const engineeringDocuments = getAllEngineeringBriefings().flatMap((edition) => edition.items.map((item): SearchDocument => {
    const { id, title, oneLineSummary, sourceRecords } = item;
    const projectIds = [...new Set(getEngineeringProjectContext(edition.slug, id).map(({ project }) => project.id))];
    return {
      id: `${edition.slug}/${id}`, type: "engineering", title, summary: oneLineSummary,
      href: engineeringItemHref(edition.slug, id), date: sourceRecords[0]?.publishedDate,
      context: sourceRecords[0]?.publisher, companyIds: [], projectIds,
      text: searchable([item.category.replaceAll("_", " "), item.region, ...item.engineeringTopics,
        edition.dateRange, edition.slug, ...sourceRecords.flatMap((source) => [source.publisher, source.title, source.sourceText]),
        ...projectIds.map((id) => projectNames.get(id))]),
    };
  }));
  const researchDocuments = getAllDigestPaperResults().map(({ edition, paper }): SearchDocument => ({
    id: paper.slug, type: "research", title: paper.title, href: `/papers/${paper.slug}`,
    context: [...paper.authors.slice(0, 3), paper.publicationSource].filter(Boolean).join(" · "),
    date: paper.publicationDate, companyIds: [], projectIds: [],
    text: searchable([...paper.authors.slice(3), ...paper.topicTags, edition.dateRange, edition.slug]),
  }));
  const digitalAiDocuments = getAllDigitalAiSignals().map((signal): SearchDocument => ({
    id: signal.id, type: "digitalAi", title: signal.title, summary: signal.shortDescription,
    href: `/digital-ai/signals/${signal.slug}`, date: signal.sortDate, dateLabel: signal.dateLabel,
    context: signal.sources[0]?.publisher, companyIds: [], projectIds: [],
    text: searchable([signal.whyItMatters, signal.connectionToFowt,
      formatDigitalAiTopic(signal.topic), signal.country, signal.region, ...signal.technologyTags, ...signal.organizations,
      ...signal.sources.flatMap((source) => [source.title, source.publisher])]),
  }));

  return [...companyDocuments, ...projectDocuments, ...eventDocuments, ...engineeringDocuments, ...researchDocuments, ...digitalAiDocuments];
}

function searchable(fields: (string | null | undefined)[]) {
  return normalizeSearchText(fields.filter(Boolean).join(" · "));
}
