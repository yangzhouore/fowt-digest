/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const SIGNAL_TOPICS = new Set([
  "ai_for_engineering",
  "digital_twin",
  "autonomous_om_robotics",
  "industrial_software_digital_engineering",
  "smart_grid_forecasting",
  "ai_infrastructure_data_centres",
]);

const SIGNAL_MATURITIES = new Set([
  "research_concept",
  "prototype",
  "pilot_demonstration",
  "commercial_deployment",
  "operational_scaling",
  "paused_cancelled_superseded",
  "unknown",
]);

const SOURCE_CLASSES = new Set([
  "government_regulator",
  "public_research_lab",
  "eu_programme",
  "research_technical_body",
  "industry_project",
  "space_agency",
  "international_agency",
]);

const SOURCE_TIERS = new Set([1, 2, 3, 4, 5]);
const CONNECTION_TERMS = [
  "offshore wind",
  "floating",
  "wind energy",
  "wind farm",
  "wind turbine",
  "wind-energy",
  "grid",
  "energy infrastructure",
  "renewable energy",
  "renewables",
];

function validateRepository(rootDir = process.cwd()) {
  return validateStaticDigitalAi({
    dataPath: path.join(rootDir, "data", "digital-ai", "signals.json"),
  });
}

function validateStaticDigitalAi({ dataPath }) {
  const errors = [];
  const dataset = parseJsonFile(dataPath, "signals.json", errors);
  if (dataset !== undefined) {
    validateDataset(dataset, errors);
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

function validateDataset(dataset, errors) {
  if (!isRecord(dataset)) {
    errors.push("signals.json: dataset must be an object");
    return;
  }
  if (dataset.schemaVersion !== "digital-ai-signals.v1") {
    errors.push("signals.json: unsupported schemaVersion");
  }
  strictDate(dataset.generatedDate, "signals.json", "generatedDate", errors);

  if (!Array.isArray(dataset.sources) || dataset.sources.length === 0) {
    errors.push("signals.json: sources must be a non-empty array");
    return;
  }
  if (!Array.isArray(dataset.signals) || dataset.signals.length === 0) {
    errors.push("signals.json: signals must be a non-empty array");
    return;
  }

  const sourceIds = validateSources(dataset.sources, errors);
  validateSignals(dataset.signals, sourceIds, errors);
}

function validateSources(sources, errors) {
  const sourceIds = new Map();
  const urls = new Map();

  sources.forEach((source, index) => {
    const label = `signals.json: sources[${index}]`;
    if (!isRecord(source)) {
      errors.push(`${label}: source must be an object`);
      return;
    }
    requiredString(source.sourceId, label, "sourceId", errors);
    requiredString(source.title, label, "title", errors);
    requiredString(source.publisher, label, "publisher", errors);
    requiredUrl(source.url, label, "url", errors);
    enumString(source.sourceClass, SOURCE_CLASSES, label, "sourceClass", errors);
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

function validateSignals(signals, sourceIds, errors) {
  const signalIds = new Map();
  const slugs = new Map();

  signals.forEach((signal, index) => {
    const label = `signals.json: signals[${index}]`;
    if (!isRecord(signal)) {
      errors.push(`${label}: signal must be an object`);
      return;
    }
    requiredString(signal.id, label, "id", errors);
    requiredSlug(signal.slug, label, "slug", errors);
    requiredString(signal.title, label, "title", errors);
    requiredString(signal.dateLabel, label, "dateLabel", errors);
    strictDate(signal.sortDate, label, "sortDate", errors);
    enumString(signal.topic, SIGNAL_TOPICS, label, "topic", errors);
    enumString(signal.maturity, SIGNAL_MATURITIES, label, "maturity", errors);
    requiredString(signal.country, label, "country", errors);
    requiredString(signal.region, label, "region", errors);
    requiredConnection(signal.connectionToFowt, label, errors);
    requiredString(signal.shortDescription, label, "shortDescription", errors);
    requiredString(signal.whyItMatters, label, "whyItMatters", errors);
    stringArray(signal.organizations, label, "organizations", errors);
    stringArray(signal.technologyTags, label, "technologyTags", errors);
    requiredString(signal.evidenceType, label, "evidenceType", errors);
    sourceIdArray(signal.sourceIds, sourceIds, label, "sourceIds", errors);

    if (typeof signal.id === "string") {
      addUnique(signalIds, signal.id, `${label}: duplicate signal id ${signal.id}`, errors);
    }
    if (typeof signal.slug === "string") {
      addUnique(slugs, signal.slug, `${label}: duplicate signal slug ${signal.slug}`, errors);
    }
  });
}

function sourceIdArray(value, sourceIds, label, field, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label}: ${field} must contain at least one source ID`);
    return;
  }
  value.forEach((sourceId, index) => {
    if (typeof sourceId !== "string" || sourceId.trim() === "") {
      errors.push(`${label}: ${field}[${index}] must be a non-empty string`);
      return;
    }
    if (!sourceIds.has(sourceId)) {
      errors.push(`${label}: missing source record ${sourceId}`);
    }
  });
}

function requiredConnection(value, label, errors) {
  if (!requiredString(value, label, "connectionToFowt", errors)) {
    return;
  }
  const lower = value.toLowerCase();
  if (!CONNECTION_TERMS.some((term) => lower.includes(term))) {
    errors.push(`${label}: connectionToFowt must state a wind, offshore, grid or energy-infrastructure connection`);
  }
}

function requiredSlug(value, label, field, errors) {
  if (!requiredString(value, label, field, errors)) {
    return;
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    errors.push(`${label}: ${field} must be route-safe`);
  }
}

function requiredString(value, label, field, errors) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label}: ${field} must be a non-empty string`);
    return false;
  }
  return true;
}

function nullableStrictDate(value, label, field, errors) {
  if (value === null) {
    return;
  }
  strictDate(value, label, field, errors);
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

function stringArray(value, label, field, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label}: ${field} must be a non-empty array`);
    return;
  }
  value.forEach((item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      errors.push(`${label}: ${field}[${index}] must be a non-empty string`);
    }
  });
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
    console.log("Static Digital & AI signal data validation passed.");
    process.exitCode = 0;
    return;
  }

  console.error("Static Digital & AI signal data validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}

if (require.main === module) {
  main();
}

module.exports = {
  SIGNAL_MATURITIES,
  SIGNAL_TOPICS,
  SOURCE_CLASSES,
  validateRepository,
  validateStaticDigitalAi,
};
