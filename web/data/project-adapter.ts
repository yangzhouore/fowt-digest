import projectDatasetJson from "./projects/projects.json";

export type ProjectStatus =
  | "concept_early_development"
  | "lease_or_area_awarded"
  | "development"
  | "consented"
  | "pre_construction"
  | "under_construction"
  | "commissioning"
  | "operational"
  | "paused"
  | "cancelled"
  | "decommissioned";

export type SourceRecord = {
  sourceId: string;
  title: string;
  publisher: string;
  url: string;
  sourceTier: 1 | 2 | 3 | 4 | 5;
  publishedDate: string | null;
  accessedDate: string;
  licenseNote: string;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  country: string;
  region: string;
  seaArea: string | null;
  locationDescription: string | null;
  sourceStatus: string;
  normalizedStatus: ProjectStatus;
  capacityMw: number | null;
  turbineCount: number | null;
  turbineRatingMw: number | null;
  waterDepthM: string | null;
  distanceOffshore: string | null;
  expectedCod: string | null;
  actualCod: string | null;
  floatingTechnology: string | null;
  platformType: string;
  developerOwnerText: string | null;
  sourceIds: string[];
  factClaims: FactClaim[];
  intelligence?: ProjectIntelligence;
};

export type FactClaim = {
  path: string;
  value: string | number | boolean;
  sourceId: string;
  note: string | null;
  confidence: "high" | "medium" | "low";
};

export type ProjectIntelligence = {
  currentAssessment: string;
  fidStatus: string;
  sourceIds: string[];
  confirmedFacts: ProjectIntelligenceStatement[];
  editorialInferences: ProjectIntelligenceStatement[];
  currentGates: string[];
  watchpoints: string[];
  unresolvedUncertainties: string[];
};

export type ProjectIntelligenceStatement = {
  text: string;
  sourceIds: string[];
  confidence: "high" | "medium" | "low";
};

export type ProjectCompanyRelationship = {
  id: string;
  projectId: string;
  industryCompanyId: string | null;
  companyName: string;
  role: string;
  roleDetail: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "active" | "past" | "announced" | "unknown";
  sourceStatusText: string | null;
  sourceIds: string[];
  factClaims: FactClaim[];
};

export type ProjectTimelineEvent = {
  id: string;
  projectId: string;
  date: string;
  datePrecision: "day" | "month" | "year";
  eventType: string;
  title: string;
  description: string;
  companyNames: string[];
  sourceIds: string[];
  factClaims: FactClaim[];
};

export type ProjectWithRelations = Project & {
  relationships: ProjectCompanyRelationship[];
  timelineEvents: ProjectTimelineEvent[];
  sources: SourceRecord[];
};

type ProjectDataset = {
  sources: SourceRecord[];
  projects: Project[];
  projectCompanyRelationships: ProjectCompanyRelationship[];
  timelineEvents: ProjectTimelineEvent[];
};

const projectDataset = projectDatasetJson as ProjectDataset;

const sourceById = new Map(
  projectDataset.sources.map((source) => [source.sourceId, source]),
);

const relationshipsByProject = groupByProject(
  projectDataset.projectCompanyRelationships,
);
const eventsByProject = groupByProject(projectDataset.timelineEvents);

export const statusLabels: Record<ProjectStatus, string> = {
  concept_early_development: "Concept / Early Development",
  lease_or_area_awarded: "Lease / Area Awarded",
  development: "Development",
  consented: "Consented",
  pre_construction: "Pre-Construction",
  under_construction: "Under Construction",
  commissioning: "Commissioning",
  operational: "Operational",
  paused: "Paused",
  cancelled: "Cancelled",
  decommissioned: "Decommissioned",
};

export const statusOrder: ProjectStatus[] = [
  "operational",
  "commissioning",
  "under_construction",
  "pre_construction",
  "consented",
  "development",
  "lease_or_area_awarded",
  "concept_early_development",
  "paused",
  "cancelled",
  "decommissioned",
];

export const roleLabels: Record<string, string> = {
  developer_owner: "Developer / Owner",
  wind_turbine_oem: "Wind Turbine OEM",
  floating_platform_technology_provider: "Platform / Technology",
  platform_engineering: "Platform Engineering",
  fabrication: "Fabrication",
  mooring: "Mooring",
  anchoring: "Anchoring",
  dynamic_cable: "Dynamic Cable",
  inter_array_cable: "Inter-array Cable",
  export_cable: "Export Cable",
  offshore_electrical: "Offshore Electrical",
  grid_connection: "Grid Connection",
  feed: "FEED",
  epci: "EPCI",
  subsea_engineering: "Subsea Engineering",
  marine_installation: "Marine Installation",
  vessel_provider: "Vessel Provider",
  operations_maintenance: "Operations / Maintenance",
  engineering_consultancy: "Engineering / Consultancy",
  certification_assurance: "Certification / Assurance",
  research_public_body: "Research / Public Body",
  port_infrastructure: "Port Infrastructure",
  other_verified_role: "Other Verified Role",
};

export const eventTypeLabels: Record<string, string> = {
  lease_award: "Lease award",
  area_award: "Area award",
  research_lease_award: "Research lease award",
  development_award: "Development award",
  consent_application: "Consent application",
  consent: "Consent",
  marine_licence: "Marine licence",
  environmental_approval: "Environmental approval",
  grid_connection_agreement: "Grid connection agreement",
  subsidy_or_cfd_award: "Subsidy / CfD award",
  fid: "FID",
  technology_selection: "Technology selection",
  turbine_selection: "Turbine selection",
  platform_selection: "Platform selection",
  feed_contract: "FEED contract",
  epci_contract: "EPCI contract",
  cable_contract: "Cable contract",
  mooring_contract: "Mooring contract",
  anchoring_contract: "Anchoring contract",
  fabrication_contract: "Fabrication contract",
  installation_contract: "Installation contract",
  construction_start: "Construction start",
  platform_launch: "Platform launch",
  tow_out: "Tow-out",
  turbine_installation: "Turbine installation",
  first_power: "First power",
  commissioning: "Commissioning",
  commercial_operation: "Commercial operation",
  project_pause: "Project pause",
  project_cancellation: "Project cancellation",
  lease_relinquishment: "Lease relinquishment",
  decommissioning: "Decommissioning",
  ownership_change: "Ownership change",
  other_verified_event: "Other verified event",
};

export function getAllProjects(): Project[] {
  return [...projectDataset.projects].sort(compareProjects);
}

export function getProjectCount(): number {
  return projectDataset.projects.length;
}

export function getProjectBySlug(slug: string): ProjectWithRelations | undefined {
  const project = projectDataset.projects.find((item) => item.slug === slug);
  if (!project) {
    return undefined;
  }

  return getProjectWithRelations(project);
}

export function getProjectOptions() {
  const projects = getAllProjects();
  return {
    regions: unique(projects.map((project) => project.region)),
    countries: unique(projects.map((project) => project.country)),
    statuses: statusOrder.filter((status) =>
      projects.some((project) => project.normalizedStatus === status),
    ),
  };
}

export function getProjectIndexItems() {
  return getAllProjects().map((project) => {
    const relationships = relationshipsByProject.get(project.id) ?? [];
    const developers = relationships
      .filter((relationship) => relationship.role === "developer_owner")
      .map((relationship) => relationship.companyName);

    return {
      id: project.id,
      slug: project.slug,
      name: project.name,
      country: project.country,
      region: project.region,
      normalizedStatus: project.normalizedStatus,
      statusLabel: statusLabels[project.normalizedStatus],
      capacityMw: project.capacityMw,
      floatingTechnology: project.floatingTechnology,
      developers: unique(developers),
    };
  });
}

export function getProjectWithRelations(project: Project): ProjectWithRelations {
  const relationships = [...(relationshipsByProject.get(project.id) ?? [])].sort(
    compareRelationships,
  );
  const timelineEvents = [...(eventsByProject.get(project.id) ?? [])].sort(
    compareEvents,
  );
  const referencedSourceIds = new Set([
    ...project.sourceIds,
    ...project.factClaims.map((claim) => claim.sourceId),
    ...(project.intelligence?.sourceIds ?? []),
    ...(project.intelligence?.confirmedFacts.flatMap((statement) => statement.sourceIds) ?? []),
    ...(project.intelligence?.editorialInferences.flatMap((statement) => statement.sourceIds) ?? []),
    ...relationships.flatMap((relationship) => relationship.sourceIds),
    ...relationships.flatMap((relationship) =>
      relationship.factClaims.map((claim) => claim.sourceId),
    ),
    ...timelineEvents.flatMap((event) => event.sourceIds),
    ...timelineEvents.flatMap((event) =>
      event.factClaims.map((claim) => claim.sourceId),
    ),
  ]);

  return {
    ...project,
    relationships,
    timelineEvents,
    sources: Array.from(referencedSourceIds)
      .map((sourceId) => sourceById.get(sourceId))
      .filter((source): source is SourceRecord => Boolean(source))
      .sort((a, b) => a.sourceTier - b.sourceTier || a.publisher.localeCompare(b.publisher)),
  };
}

export function formatCapacity(value: number | null): string | null {
  return value === null ? null : `${formatNumber(value)} MW`;
}

export function formatStatus(value: ProjectStatus): string {
  return statusLabels[value];
}

export function formatRole(value: string): string {
  return roleLabels[value] ?? value.replace(/_/g, " ");
}

export function formatEventType(value: string): string {
  return eventTypeLabels[value] ?? value.replace(/_/g, " ");
}

export function formatDate(value: string, precision: "day" | "month" | "year"): string {
  if (precision === "year") {
    return value;
  }
  if (precision === "month") {
    const [year, month] = value.split("-");
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${year}-${month}-01T00:00:00Z`));
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function compareProjects(a: Project, b: Project): number {
  return (
    statusOrder.indexOf(a.normalizedStatus) - statusOrder.indexOf(b.normalizedStatus) ||
    a.region.localeCompare(b.region) ||
    a.country.localeCompare(b.country) ||
    a.name.localeCompare(b.name)
  );
}

function compareRelationships(
  a: ProjectCompanyRelationship,
  b: ProjectCompanyRelationship,
): number {
  return (
    roleSortIndex(a.role) - roleSortIndex(b.role) ||
    a.companyName.localeCompare(b.companyName)
  );
}

function compareEvents(a: ProjectTimelineEvent, b: ProjectTimelineEvent): number {
  return a.date.localeCompare(b.date) || a.title.localeCompare(b.title);
}

function roleSortIndex(role: string): number {
  const orderedRoles = [
    "developer_owner",
    "wind_turbine_oem",
    "floating_platform_technology_provider",
    "platform_engineering",
    "fabrication",
    "mooring",
    "anchoring",
    "dynamic_cable",
    "inter_array_cable",
    "export_cable",
    "offshore_electrical",
    "grid_connection",
    "feed",
    "epci",
    "subsea_engineering",
    "marine_installation",
    "vessel_provider",
    "operations_maintenance",
    "engineering_consultancy",
    "certification_assurance",
    "research_public_body",
    "port_infrastructure",
    "other_verified_role",
  ];
  const index = orderedRoles.indexOf(role);
  return index === -1 ? orderedRoles.length : index;
}

function groupByProject<T extends { projectId: string }>(items: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const values = grouped.get(item.projectId) ?? [];
    values.push(item);
    grouped.set(item.projectId, values);
  }
  return grouped;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 2,
  }).format(value);
}
