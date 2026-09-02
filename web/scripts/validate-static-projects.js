/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const PROJECT_STATUSES = new Set([
  "concept_early_development",
  "lease_or_area_awarded",
  "development",
  "consented",
  "pre_construction",
  "under_construction",
  "commissioning",
  "operational",
  "paused",
  "cancelled",
  "decommissioned",
]);

const PLATFORM_TYPES = new Set([
  "spar",
  "semi_submersible",
  "barge",
  "tension_leg_platform",
  "twin_hull",
  "other",
  "unknown",
]);

const SOURCE_TIERS = new Set([1, 2, 3, 4, 5]);

const SUPPLY_CHAIN_ROLES = new Set([
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
]);

const RELATIONSHIP_STATUSES = new Set(["active", "past", "announced", "unknown"]);

const TIMELINE_EVENT_TYPES = new Set([
  "lease_award",
  "area_award",
  "research_lease_award",
  "development_award",
  "consent_application",
  "consent",
  "marine_licence",
  "environmental_approval",
  "grid_connection_agreement",
  "subsidy_or_cfd_award",
  "fid",
  "technology_selection",
  "turbine_selection",
  "platform_selection",
  "feed_contract",
  "epci_contract",
  "cable_contract",
  "mooring_contract",
  "anchoring_contract",
  "fabrication_contract",
  "installation_contract",
  "construction_start",
  "platform_launch",
  "tow_out",
  "turbine_installation",
  "first_power",
  "commissioning",
  "commercial_operation",
  "project_pause",
  "project_cancellation",
  "lease_relinquishment",
  "decommissioning",
  "ownership_change",
  "other_verified_event",
]);

const DATE_PRECISIONS = new Set(["day", "month", "year"]);
const CONFIDENCE_LEVELS = new Set(["high", "medium", "low"]);

function validateRepository(rootDir = process.cwd()) {
  return validateStaticProjects({
    dataPath: path.join(rootDir, "data", "projects", "projects.json"),
    industryMapPath: path.join(rootDir, "data", "industry", "industry-map.ts"),
  });
}

function validateStaticProjects({ dataPath, industryMapPath }) {
  const errors = [];
  const dataset = parseJsonFile(dataPath, "projects.json", errors);
  const industryCompanyIds = readIndustryCompanyIds(industryMapPath, errors);

  if (dataset !== undefined) {
    validateProjectDataset(dataset, industryCompanyIds, errors);
  }

  return errors;
}

function parseJsonFile(filePath, fileName, errors) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    errors.push(`${fileName}: malformed JSON`);
    return undefined;
  }
}

function readIndustryCompanyIds(industryMapPath, errors) {
  let source;
  try {
    source = fs.readFileSync(industryMapPath, "utf8");
  } catch {
    errors.push(`${industryMapPath}: unable to read Industry Map company IDs`);
    return new Set();
  }

  const companiesStart = source.indexOf("export const industryCompanies");
  const companiesEnd = source.indexOf("export const industryCompanyCount");
  if (companiesStart === -1 || companiesEnd === -1 || companiesEnd <= companiesStart) {
    errors.push(`${industryMapPath}: unable to locate Industry Map companies`);
    return new Set();
  }

  const companyBlock = source.slice(companiesStart, companiesEnd);
  return new Set(
    [...companyBlock.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]),
  );
}

function validateProjectDataset(dataset, industryCompanyIds, errors) {
  if (!isRecord(dataset)) {
    errors.push("projects.json: dataset must be an object");
    return;
  }

  if (dataset.schemaVersion !== "fowt-projects.v1") {
    errors.push("projects.json: unsupported schemaVersion");
  }
  strictDate(dataset.generatedDate, "projects.json", "generatedDate", errors);

  if (!Array.isArray(dataset.sources) || dataset.sources.length === 0) {
    errors.push("projects.json: sources must be a non-empty array");
    return;
  }
  if (!Array.isArray(dataset.projects) || dataset.projects.length === 0) {
    errors.push("projects.json: projects must be a non-empty array");
    return;
  }
  if (!Array.isArray(dataset.projectCompanyRelationships)) {
    errors.push("projects.json: projectCompanyRelationships must be an array");
    return;
  }
  if (!Array.isArray(dataset.timelineEvents)) {
    errors.push("projects.json: timelineEvents must be an array");
    return;
  }

  const sourceIds = validateSources(dataset.sources, errors);
  const projectIds = validateProjects(dataset.projects, sourceIds, errors);
  validateRelationships(
    dataset.projectCompanyRelationships,
    projectIds,
    sourceIds,
    industryCompanyIds,
    errors,
  );
  validateTimelineEvents(dataset.timelineEvents, projectIds, sourceIds, errors);
}

function validateSources(sources, errors) {
  const sourceIds = new Map();
  const urls = new Map();

  sources.forEach((source, index) => {
    const label = `projects.json: sources[${index}]`;
    if (!isRecord(source)) {
      errors.push(`${label}: source must be an object`);
      return;
    }

    requiredString(source.sourceId, label, "sourceId", errors);
    requiredString(source.title, label, "title", errors);
    requiredString(source.publisher, label, "publisher", errors);
    requiredUrl(source.url, label, "url", errors);
    enumValue(source.sourceTier, SOURCE_TIERS, label, "sourceTier", errors);
    nullableStrictDate(source.publishedDate, label, "publishedDate", errors);
    strictDate(source.accessedDate, label, "accessedDate", errors);
    requiredString(source.licenseNote, label, "licenseNote", errors);

    if (typeof source.sourceId === "string") {
      addUnique(sourceIds, source.sourceId, `${label}: duplicate sourceId ${source.sourceId}`, errors);
    }
    if (typeof source.url === "string") {
      addUnique(urls, source.url, `${label}: duplicate url ${source.url}`, errors);
    }
  });

  return sourceIds;
}

function validateProjects(projects, sourceIds, errors) {
  const projectIds = new Map();
  const slugs = new Map();

  projects.forEach((project, index) => {
    const label = `projects.json: projects[${index}]`;
    if (!isRecord(project)) {
      errors.push(`${label}: project must be an object`);
      return;
    }

    requiredString(project.id, label, "id", errors);
    requiredString(project.slug, label, "slug", errors);
    requiredString(project.name, label, "name", errors);
    stringArray(project.aliases, label, "aliases", errors);
    requiredString(project.country, label, "country", errors);
    requiredString(project.region, label, "region", errors);
    nullableString(project.seaArea, label, "seaArea", errors);
    nullableString(project.locationDescription, label, "locationDescription", errors);
    requiredString(project.sourceStatus, label, "sourceStatus", errors);
    enumString(project.normalizedStatus, PROJECT_STATUSES, label, "normalizedStatus", errors);
    nullablePositiveNumber(project.capacityMw, label, "capacityMw", errors);
    nullablePositiveInteger(project.turbineCount, label, "turbineCount", errors);
    nullablePositiveNumber(project.turbineRatingMw, label, "turbineRatingMw", errors);
    nullableString(project.waterDepthM, label, "waterDepthM", errors);
    nullableString(project.distanceOffshore, label, "distanceOffshore", errors);
    nullableString(project.expectedCod, label, "expectedCod", errors);
    nullableString(project.actualCod, label, "actualCod", errors);
    nullableString(project.floatingTechnology, label, "floatingTechnology", errors);
    enumString(project.platformType, PLATFORM_TYPES, label, "platformType", errors);
    nullableString(project.developerOwnerText, label, "developerOwnerText", errors);
    sourceIdArray(project.sourceIds, sourceIds, label, "sourceIds", errors);
    validateFactClaims(project.factClaims, sourceIds, label, errors);
    validateProjectIntelligence(project.intelligence, sourceIds, label, errors);

    if (project.normalizedStatus === "operational" && project.actualCod === null) {
      errors.push(`${label}: operational projects must include actualCod when status is operational`);
    }
    if (project.capacityMw !== null && project.turbineCount !== null && project.turbineRatingMw !== null) {
      const impliedCapacity = project.turbineCount * project.turbineRatingMw;
      if (project.capacityMw > impliedCapacity * 1.05 + 0.1) {
        errors.push(`${label}: capacityMw is greater than turbineCount * turbineRatingMw`);
      }
    }

    if (typeof project.id === "string") {
      addUnique(projectIds, project.id, `${label}: duplicate project id ${project.id}`, errors);
    }
    if (typeof project.slug === "string") {
      addUnique(slugs, project.slug, `${label}: duplicate project slug ${project.slug}`, errors);
    }
  });

  return projectIds;
}

function validateProjectIntelligence(intelligence, sourceIds, label, errors) {
  if (intelligence === undefined) {
    return;
  }
  const intelligenceLabel = `${label}: intelligence`;
  if (!isRecord(intelligence)) {
    errors.push(`${intelligenceLabel}: intelligence must be an object`);
    return;
  }

  requiredString(intelligence.currentAssessment, intelligenceLabel, "currentAssessment", errors);
  requiredString(intelligence.fidStatus, intelligenceLabel, "fidStatus", errors);
  sourceIdArray(intelligence.sourceIds, sourceIds, intelligenceLabel, "sourceIds", errors);
  validateIntelligenceStatements(
    intelligence.confirmedFacts,
    sourceIds,
    intelligenceLabel,
    "confirmedFacts",
    errors,
  );
  validateIntelligenceStatements(
    intelligence.editorialInferences,
    sourceIds,
    intelligenceLabel,
    "editorialInferences",
    errors,
  );
  nonEmptyStringArray(intelligence.currentGates, intelligenceLabel, "currentGates", errors);
  nonEmptyStringArray(intelligence.watchpoints, intelligenceLabel, "watchpoints", errors);
  nonEmptyStringArray(
    intelligence.unresolvedUncertainties,
    intelligenceLabel,
    "unresolvedUncertainties",
    errors,
  );
}

function validateIntelligenceStatements(statements, sourceIds, label, field, errors) {
  if (!Array.isArray(statements) || statements.length === 0) {
    errors.push(`${label}: ${field} must be a non-empty array`);
    return;
  }

  statements.forEach((statement, index) => {
    const statementLabel = `${label}: ${field}[${index}]`;
    if (!isRecord(statement)) {
      errors.push(`${statementLabel}: statement must be an object`);
      return;
    }
    requiredString(statement.text, statementLabel, "text", errors);
    sourceIdArray(statement.sourceIds, sourceIds, statementLabel, "sourceIds", errors);
    enumString(statement.confidence, CONFIDENCE_LEVELS, statementLabel, "confidence", errors);
  });
}

function validateRelationships(
  relationships,
  projectIds,
  sourceIds,
  industryCompanyIds,
  errors,
) {
  const relationshipIds = new Map();

  relationships.forEach((relationship, index) => {
    const label = `projects.json: projectCompanyRelationships[${index}]`;
    if (!isRecord(relationship)) {
      errors.push(`${label}: relationship must be an object`);
      return;
    }

    requiredString(relationship.id, label, "id", errors);
    projectReference(relationship.projectId, projectIds, label, "projectId", errors);
    nullableIndustryCompanyId(
      relationship.industryCompanyId,
      industryCompanyIds,
      label,
      errors,
    );
    requiredString(relationship.companyName, label, "companyName", errors);
    enumString(relationship.role, SUPPLY_CHAIN_ROLES, label, "role", errors);
    nullableString(relationship.roleDetail, label, "roleDetail", errors);
    nullableString(relationship.startDate, label, "startDate", errors);
    nullableString(relationship.endDate, label, "endDate", errors);
    enumString(relationship.status, RELATIONSHIP_STATUSES, label, "status", errors);
    nullableString(relationship.sourceStatusText, label, "sourceStatusText", errors);
    sourceIdArray(relationship.sourceIds, sourceIds, label, "sourceIds", errors);
    validateFactClaims(relationship.factClaims, sourceIds, label, errors);

    if (typeof relationship.id === "string") {
      addUnique(
        relationshipIds,
        relationship.id,
        `${label}: duplicate relationship id ${relationship.id}`,
        errors,
      );
    }
  });
}

function validateTimelineEvents(events, projectIds, sourceIds, errors) {
  const eventIds = new Map();

  events.forEach((event, index) => {
    const label = `projects.json: timelineEvents[${index}]`;
    if (!isRecord(event)) {
      errors.push(`${label}: timeline event must be an object`);
      return;
    }

    requiredString(event.id, label, "id", errors);
    projectReference(event.projectId, projectIds, label, "projectId", errors);
    validateDateWithPrecision(event.date, event.datePrecision, label, errors);
    enumString(event.eventType, TIMELINE_EVENT_TYPES, label, "eventType", errors);
    requiredString(event.title, label, "title", errors);
    requiredString(event.description, label, "description", errors);
    stringArray(event.companyNames, label, "companyNames", errors);
    sourceIdArray(event.sourceIds, sourceIds, label, "sourceIds", errors);
    validateFactClaims(event.factClaims, sourceIds, label, errors);

    if (typeof event.id === "string") {
      addUnique(eventIds, event.id, `${label}: duplicate timeline event id ${event.id}`, errors);
    }
  });
}

function validateFactClaims(claims, sourceIds, label, errors) {
  if (!Array.isArray(claims) || claims.length === 0) {
    errors.push(`${label}: factClaims must be a non-empty array`);
    return;
  }

  claims.forEach((claim, index) => {
    const claimLabel = `${label}: factClaims[${index}]`;
    if (!isRecord(claim)) {
      errors.push(`${claimLabel}: fact claim must be an object`);
      return;
    }
    requiredString(claim.path, claimLabel, "path", errors);
    if (claim.value === null || claim.value === undefined) {
      errors.push(`${claimLabel}: value must not be null`);
    }
    sourceReference(claim.sourceId, sourceIds, claimLabel, "sourceId", errors);
    nullableString(claim.note, claimLabel, "note", errors);
    enumString(claim.confidence, CONFIDENCE_LEVELS, claimLabel, "confidence", errors);
  });
}

function validateDateWithPrecision(date, precision, label, errors) {
  enumString(precision, DATE_PRECISIONS, label, "datePrecision", errors);
  if (precision === "day") {
    strictDate(date, label, "date", errors);
  } else if (precision === "month") {
    if (typeof date !== "string" || !/^\d{4}-\d{2}$/.test(date)) {
      errors.push(`${label}: date must be YYYY-MM for month precision`);
    }
  } else if (precision === "year") {
    if (typeof date !== "string" || !/^\d{4}$/.test(date)) {
      errors.push(`${label}: date must be YYYY for year precision`);
    }
  }
}

function sourceIdArray(value, sourceIds, label, field, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label}: ${field} must contain at least one source ID`);
    return;
  }
  value.forEach((sourceId, index) => {
    sourceReference(sourceId, sourceIds, label, `${field}[${index}]`, errors);
  });
}

function sourceReference(value, sourceIds, label, field, errors) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label}: ${field} must be a non-empty string`);
    return;
  }
  if (!sourceIds.has(value)) {
    errors.push(`${label}: missing source record ${value}`);
  }
}

function projectReference(value, projectIds, label, field, errors) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label}: ${field} must be a non-empty string`);
    return;
  }
  if (!projectIds.has(value)) {
    errors.push(`${label}: missing project ${value}`);
  }
}

function nullableIndustryCompanyId(value, industryCompanyIds, label, errors) {
  if (value === null) {
    return;
  }
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label}: industryCompanyId must be a non-empty string or null`);
    return;
  }
  if (!industryCompanyIds.has(value)) {
    errors.push(`${label}: unknown Industry Map company ID ${value}`);
  }
}

function requiredString(value, label, field, errors) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label}: ${field} must be a non-empty string`);
    return false;
  }
  return true;
}

function nullableString(value, label, field, errors) {
  if (value !== null && typeof value !== "string") {
    errors.push(`${label}: ${field} must be a string or null`);
  }
}

function nullableStrictDate(value, label, field, errors) {
  if (value === null) {
    return;
  }
  strictDate(value, label, field, errors);
}

function enumString(value, allowed, label, field, errors) {
  if (!requiredString(value, label, field, errors)) {
    return;
  }
  if (!allowed.has(value)) {
    errors.push(`${label}: ${field} has unsupported value ${value}`);
  }
}

function enumValue(value, allowed, label, field, errors) {
  if (!allowed.has(value)) {
    errors.push(`${label}: ${field} has unsupported value ${value}`);
  }
}

function requiredUrl(value, label, field, errors) {
  if (!requiredString(value, label, field, errors)) {
    return;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      errors.push(`${label}: ${field} must be an HTTP URL`);
    }
  } catch {
    errors.push(`${label}: ${field} must be a valid URL`);
  }
}

function nullablePositiveNumber(value, label, field, errors) {
  if (value === null) {
    return;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    errors.push(`${label}: ${field} must be a positive number or null`);
  }
}

function nullablePositiveInteger(value, label, field, errors) {
  if (value === null) {
    return;
  }
  if (!Number.isInteger(value) || value <= 0) {
    errors.push(`${label}: ${field} must be a positive integer or null`);
  }
}

function stringArray(value, label, field, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label}: ${field} must be an array`);
    return;
  }
  value.forEach((item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      errors.push(`${label}: ${field}[${index}] must be a non-empty string`);
    }
  });
}

function nonEmptyStringArray(value, label, field, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label}: ${field} must be a non-empty array`);
    return;
  }
  stringArray(value, label, field, errors);
}

function strictDate(value, label, field, errors) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.push(`${label}: ${field} must be a strict YYYY-MM-DD date`);
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    errors.push(`${label}: ${field} must be a valid YYYY-MM-DD date`);
    return false;
  }
  return true;
}

function addUnique(seen, value, message, errors) {
  if (seen.has(value)) {
    errors.push(message);
    return;
  }
  seen.set(value, true);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function main() {
  const errors = validateRepository();
  if (errors.length === 0) {
    console.log("Static project data validation passed.");
    process.exitCode = 0;
    return;
  }

  console.error("Static project data validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}

if (require.main === module) {
  main();
}

module.exports = {
  PROJECT_STATUSES,
  SUPPLY_CHAIN_ROLES,
  TIMELINE_EVENT_TYPES,
  validateRepository,
  validateStaticProjects,
};
