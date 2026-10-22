import linkDataset from "./context/project-engineering-links.json";
import { getAllEngineeringBriefings, type EngineeringBriefing } from "./engineering-briefing-adapter";
import { getAllProjects, getProjectWithRelations, formatRole, relationshipContextLabel, type Project, type ProjectIndexItem, type ProjectWithRelations } from "./project-adapter";
import { getIndustryCompanies } from "./industry/industry-map";
import { engineeringItemHref, industryCompanyAnchor } from "./context-navigation";

export type ProjectEngineeringLink = {
  id: string; projectId: string; editionSlug: string; briefingItemId: string;
  basis: { type: "project_specific_coverage"; sourceRecordId: string; storedExcerpt: string; projectMention: string };
  mappingReviewedOn: string;
};

// These checks only resolve explicit curated links. They never discover or add links.
export function resolveEngineeringLinks(links: ProjectEngineeringLink[], projects: Project[], briefings: EngineeringBriefing[]) {
  return links.flatMap((link) => {
    const project = projects.find((project) => project.id === link.projectId);
    const edition = briefings.find((edition) => edition.slug === link.editionSlug);
    const item = edition?.items.find((item) => item.id === link.briefingItemId);
    const source = item?.sourceRecords.find((source) => source.id === link.basis.sourceRecordId);
    if (!project || !edition || !item || !source || link.basis.type !== "project_specific_coverage") return [];
    if (!link.basis.storedExcerpt || !source.sourceText.includes(link.basis.storedExcerpt)) return [];
    if (![project.name, ...project.aliases].some((name) => name.toLowerCase() === link.basis.projectMention.toLowerCase())) return [];
    if (!link.basis.storedExcerpt.toLowerCase().includes(link.basis.projectMention.toLowerCase())) return [];
    return [{ id: link.id, project: { id: project.id, name: project.name, slug: project.slug },
      editionSlug: edition.slug, dateRange: edition.dateRange, briefingItemId: item.id,
      title: item.title, publishedDate: source.publishedDate, publisher: source.publisher,
      sourceUrl: source.sourceUrl, storedExcerpt: link.basis.storedExcerpt,
      href: engineeringItemHref(edition.slug, item.id) }];
  }).sort((a, b) => b.publishedDate.localeCompare(a.publishedDate) || b.editionSlug.localeCompare(a.editionSlug) || a.briefingItemId.localeCompare(b.briefingItemId) || a.id.localeCompare(b.id));
}

const links = resolveEngineeringLinks(linkDataset.links as ProjectEngineeringLink[], getAllProjects(), getAllEngineeringBriefings());
const companyIds = new Set(getIndustryCompanies().map((company) => company.id));

export function getProjectEngineeringCoverage(projectId: string) {
  return links.filter((link) => link.project.id === projectId);
}

export function getEngineeringProjectContext(editionSlug: string, briefingItemId: string) {
  return links.filter((link) => link.editionSlug === editionSlug && link.briefingItemId === briefingItemId);
}

export function getIndustryEntryHref(companyId: string | null) {
  return companyId && companyIds.has(companyId) ? `/industry#${industryCompanyAnchor(companyId)}` : null;
}

// Enrich presentation props on the server; client filters do not import catalogues.
export function connectProjectIndexItem(project: ProjectIndexItem) {
  return { ...project, supplyChain: project.supplyChain.map((category) => ({ ...category,
    groups: category.groups.map((group) => ({ ...group,
      entries: group.entries.map((entry) => ({ ...entry, industryHref: getIndustryEntryHref(entry.industryCompanyId) })),
    })),
  })) };
}
export type ConnectedProjectIndexItem = ReturnType<typeof connectProjectIndexItem>;

export function buildCompanyProjectRecords(companyId: string, projects: ProjectWithRelations[], validCompanyIds: ReadonlySet<string>) {
  if (!validCompanyIds.has(companyId)) return [];
  return projects.flatMap((project) => {
    const roles = project.relationships.filter((relationship) => relationship.industryCompanyId === companyId).flatMap((relationship) => {
      const sources = relationship.sourceIds.flatMap((id) => project.sources.filter((source) => source.sourceId === id));
      if (!sources.length || sources.length !== relationship.sourceIds.length) return [];
      return [{ id: relationship.id, roleLabel: formatRole(relationship.role),
        contextLabel: relationshipContextLabel(relationship), status: relationship.status,
        scope: relationship.sourceStatusText, detail: relationship.roleDetail,
        sources: sources.map(({ sourceId, title, url }) => ({ sourceId, title, url })) }];
    });
    return roles.length ? [{ id: project.id, slug: project.slug, name: project.name, roles }] : [];
  }).sort((a, b) => a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id));
}

const projectRecords = getAllProjects().map(getProjectWithRelations);
export function getCompanyProjectRecords(companyId: string) {
  return buildCompanyProjectRecords(companyId, projectRecords, companyIds);
}
