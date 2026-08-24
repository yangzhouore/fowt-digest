/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const SOURCE_CLASSES = new Set([
  "government_regulator_seabed_authority",
  "developers_project_owners",
  "turbine_oems",
  "floating_platform_companies",
  "mooring_anchor_suppliers",
  "cable_electrical_grid_companies",
  "ports_fabrication",
  "installation_vessel_companies",
  "certification_standards",
  "engineering_software_digital",
  "industry_associations",
  "conferences_universities",
  "offshore_wind_trade_press",
]);

const REGIONS = new Set([
  "Europe",
  "Asia-Pacific",
  "North America",
  "Africa",
  "Global",
  "Unspecified",
]);

const SOURCE_KINDS = new Set(["official", "trade"]);
const COLLECTION_METHODS = new Set(["index", "feed", "api", "site_search"]);
const COLLECTION_STATUSES = new Set(["succeeded", "failed_or_no_weekly_candidate"]);

function loadEngineeringSourceRegistry(rootDir = process.cwd()) {
  const registryPath = path.join(rootDir, "data", "engineering-source-registry.json");
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

function validateEngineeringSourceRegistry(registry) {
  const errors = [];
  if (!isRecord(registry)) {
    return ["engineering-source-registry.json: registry must be an object"];
  }
  if (registry.schemaVersion !== "engineering-source-registry.v1") {
    errors.push("engineering-source-registry.json: unsupported schemaVersion");
  }
  requiredString(registry.policyDocument, "engineering-source-registry.json", "policyDocument", errors);
  if (!Array.isArray(registry.sources) || registry.sources.length === 0) {
    errors.push("engineering-source-registry.json: sources must be a non-empty array");
    return errors;
  }

  const ids = new Map();
  registry.sources.forEach((source, index) => {
    const label = `engineering-source-registry.json: sources[${index}]`;
    if (!isRecord(source)) {
      errors.push(`${label}: source must be an object`);
      return;
    }
    requiredString(source.sourceId, label, "sourceId", errors);
    requiredString(source.publisher, label, "publisher", errors);
    enumString(source.sourceClass, SOURCE_CLASSES, label, "sourceClass", errors);
    enumString(source.region, REGIONS, label, "region", errors);
    enumString(source.sourceKind, SOURCE_KINDS, label, "sourceKind", errors);
    integerBetween(source.priority, 1, 5, label, "priority", errors);
    requiredUrl(source.collectionUrl, label, "collectionUrl", errors);
    enumString(source.collectionMethod, COLLECTION_METHODS, label, "collectionMethod", errors);
    requiredString(source.accessNotes, label, "accessNotes", errors);

    if (typeof source.sourceId === "string") {
      addUnique(ids, source.sourceId, `${label}: duplicate sourceId ${source.sourceId}`, errors);
    }
  });

  for (const sourceClass of SOURCE_CLASSES) {
    if (!registry.sources.some((source) => source.sourceClass === sourceClass)) {
      errors.push(`engineering-source-registry.json: missing sourceClass ${sourceClass}`);
    }
  }

  return errors;
}

function validateRegistryBackedCollectionAudit(audit, registry, label) {
  const errors = [];
  if (!isRecord(audit) || audit.sourceRegistry !== "web/data/engineering-source-registry.json") {
    return errors;
  }
  const registryById = new Map(registry.sources.map((source) => [source.sourceId, source]));
  if (!Array.isArray(audit.attemptedSources)) {
    errors.push(`${label}: attemptedSources must be an array`);
    return errors;
  }

  let succeeded = 0;
  let failed = 0;
  let rawItems = 0;
  let dateItems = 0;
  let relevantItems = 0;

  audit.attemptedSources.forEach((attempt, index) => {
    const attemptLabel = `${label}: attemptedSources[${index}]`;
    if (!isRecord(attempt)) {
      errors.push(`${attemptLabel}: attempted source must be an object`);
      return;
    }
    requiredString(attempt.sourceId, attemptLabel, "sourceId", errors);
    requiredString(attempt.publisher, attemptLabel, "publisher", errors);
    enumString(attempt.sourceClass, SOURCE_CLASSES, attemptLabel, "sourceClass", errors);
    enumString(attempt.collectionStatus, COLLECTION_STATUSES, attemptLabel, "collectionStatus", errors);
    nonNegativeInteger(attempt.rawItemsDiscovered, attemptLabel, "rawItemsDiscovered", errors);
    nonNegativeInteger(attempt.dateWindowItems, attemptLabel, "dateWindowItems", errors);
    nonNegativeInteger(attempt.fowtRelevantItems, attemptLabel, "fowtRelevantItems", errors);
    requiredString(attempt.result, attemptLabel, "result", errors);
    requiredString(attempt.note, attemptLabel, "note", errors);

    const registered = registryById.get(attempt.sourceId);
    if (!registered) {
      errors.push(`${attemptLabel}: sourceId ${attempt.sourceId} is not in engineering-source-registry.json`);
    } else {
      if (registered.publisher !== attempt.publisher) {
        errors.push(`${attemptLabel}: publisher must match registry source ${attempt.sourceId}`);
      }
      if (registered.sourceClass !== attempt.sourceClass) {
        errors.push(`${attemptLabel}: sourceClass must match registry source ${attempt.sourceId}`);
      }
    }

    if (attempt.collectionStatus === "succeeded") {
      succeeded += 1;
    } else if (attempt.collectionStatus === "failed_or_no_weekly_candidate") {
      failed += 1;
    }
    rawItems += typeof attempt.rawItemsDiscovered === "number" ? attempt.rawItemsDiscovered : 0;
    dateItems += typeof attempt.dateWindowItems === "number" ? attempt.dateWindowItems : 0;
    relevantItems += typeof attempt.fowtRelevantItems === "number" ? attempt.fowtRelevantItems : 0;
  });

  compareNumber(audit.sourcesAttempted, audit.attemptedSources.length, label, "sourcesAttempted", errors);
  compareNumber(audit.sourcesSuccessfullyCollected, succeeded, label, "sourcesSuccessfullyCollected", errors);
  compareNumber(audit.sourcesFailed, failed, label, "sourcesFailed", errors);
  compareNumber(audit.rawItemsCollected, rawItems, label, "rawItemsCollected", errors);
  compareNumber(audit.itemsAfterDateFiltering, dateItems, label, "itemsAfterDateFiltering", errors);
  compareNumber(audit.itemsAfterFowtRelevanceFiltering, relevantItems, label, "itemsAfterFowtRelevanceFiltering", errors);

  return errors;
}

function compareNumber(actual, expected, label, field, errors) {
  if (actual !== expected) {
    errors.push(`${label}: ${field} must equal registry-backed attemptedSources total ${expected}`);
  }
}

function requiredString(value, label, field, errors) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label}: ${field} must be a non-empty string`);
  }
}

function requiredUrl(value, label, field, errors) {
  requiredString(value, label, field, errors);
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      errors.push(`${label}: ${field} must be an HTTP URL`);
    }
  } catch {
    errors.push(`${label}: ${field} must be a valid URL`);
  }
}

function enumString(value, allowed, label, field, errors) {
  requiredString(value, label, field, errors);
  if (!allowed.has(value)) {
    errors.push(`${label}: ${field} has unsupported value ${value}`);
  }
}

function integerBetween(value, min, max, label, field, errors) {
  if (!Number.isInteger(value) || value < min || value > max) {
    errors.push(`${label}: ${field} must be an integer ${min}-${max}`);
  }
}

function nonNegativeInteger(value, label, field, errors) {
  if (!Number.isInteger(value) || value < 0) {
    errors.push(`${label}: ${field} must be a non-negative integer`);
  }
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

module.exports = {
  SOURCE_CLASSES,
  loadEngineeringSourceRegistry,
  validateEngineeringSourceRegistry,
  validateRegistryBackedCollectionAudit,
};
