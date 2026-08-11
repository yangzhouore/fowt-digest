/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const SOURCE_TYPES = new Set([
  "government_announcement",
  "standards_update",
  "software_release",
  "company_announcement",
  "trade_association",
  "industry_news",
  "conference_announcement",
]);

const COLLECTION_METHODS = new Set([
  "manual",
  "approved_feed",
  "approved_api",
  "approved_scrape",
]);

const CATEGORIES = new Set([
  "project",
  "policy",
  "technology",
  "software",
  "standards",
  "supply_chain",
  "event",
]);

function validateRepository(rootDir = process.cwd()) {
  return validateStaticBriefings({
    briefingDir: path.join(rootDir, "data", "briefings"),
    adapterPath: path.join(rootDir, "data", "engineering-briefing-adapter.ts"),
  });
}

function validateStaticBriefings({ briefingDir, adapterPath }) {
  const errors = [];
  const briefingFiles = listJsonFiles(briefingDir, errors);
  const adapter = parseAdapterRegistration(adapterPath, errors);

  validateAdapterRegistration({ adapter, briefingFiles, briefingDir, errors });
  validateBriefingFiles({ briefingFiles, briefingDir, errors });

  return errors;
}

function listJsonFiles(dir, errors) {
  try {
    return fs
      .readdirSync(dir)
      .filter((fileName) => fileName.endsWith(".json"))
      .sort();
  } catch {
    errors.push(`${dir}: unable to read engineering briefing directory`);
    return [];
  }
}

function parseAdapterRegistration(adapterPath, errors) {
  let source;
  try {
    source = fs.readFileSync(adapterPath, "utf8");
  } catch {
    errors.push(`${adapterPath}: unable to read engineering briefing adapter`);
    return { imports: [], registrations: [] };
  }

  const imports = [];
  const importPattern =
    /import\s+([A-Za-z_$][\w$]*)\s+from\s+"\.\/briefings\/([^"]+\.json)";/g;
  for (const match of source.matchAll(importPattern)) {
    imports.push({ variableName: match[1], target: match[2] });
  }

  const arrayMatch = source.match(
    /const\s+engineeringBriefingJsonFiles\s*=\s*\[([\s\S]*?)\];/,
  );
  const registrations = [];
  if (!arrayMatch) {
    errors.push(`${adapterPath}: engineeringBriefingJsonFiles registration array not found`);
  } else {
    const registrationPattern = /\b([A-Za-z_$][\w$]*)\b/g;
    for (const match of arrayMatch[1].matchAll(registrationPattern)) {
      registrations.push(match[1]);
    }
  }

  return { imports, registrations };
}

function validateAdapterRegistration({ adapter, briefingFiles, briefingDir, errors }) {
  const importedTargets = new Set(adapter.imports.map((item) => item.target));
  for (const fileName of briefingFiles) {
    if (!importedTargets.has(fileName)) {
      errors.push(`${fileName}: JSON file is not imported by engineering-briefing-adapter.ts`);
    }
  }

  for (const importedTarget of importedTargets) {
    if (!fs.existsSync(path.join(briefingDir, importedTarget))) {
      errors.push(`${importedTarget}: imported engineering briefing JSON file does not exist`);
    }
  }

  const importByVariable = new Map();
  for (const item of adapter.imports) {
    if (importByVariable.has(item.variableName)) {
      errors.push(`engineering briefing adapter: duplicate import ${item.variableName}`);
    }
    importByVariable.set(item.variableName, item.target);
  }

  const registeredVariables = new Set();
  for (const variableName of adapter.registrations) {
    if (registeredVariables.has(variableName)) {
      errors.push(`engineeringBriefingJsonFiles: duplicate registration ${variableName}`);
    }
    registeredVariables.add(variableName);
    if (!importByVariable.has(variableName)) {
      errors.push(`engineeringBriefingJsonFiles: registered briefing ${variableName} has no JSON import`);
    }
  }

  for (const item of adapter.imports) {
    if (!registeredVariables.has(item.variableName)) {
      errors.push(`${item.target}: imported briefing ${item.variableName} is omitted from engineeringBriefingJsonFiles`);
    }
  }
}

function validateBriefingFiles({ briefingFiles, briefingDir, errors }) {
  if (briefingFiles.length === 0) {
    errors.push(`${briefingDir}: at least one engineering briefing JSON file is required`);
    return;
  }

  const slugs = new Map();
  for (const fileName of briefingFiles) {
    const filePath = path.join(briefingDir, fileName);
    const briefing = parseJsonFile(filePath, fileName, errors);
    if (briefing === undefined) {
      continue;
    }
    validateBriefing({ briefing, fileName, slugs, errors });
  }
}

function parseJsonFile(filePath, fileName, errors) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    errors.push(`${fileName}: malformed JSON`);
    return undefined;
  }
}

function validateBriefing({ briefing, fileName, slugs, errors }) {
  if (!isRecord(briefing)) {
    errors.push(`${fileName}: engineering briefing must be an object`);
    return;
  }

  if (briefing.schemaVersion !== "engineering-briefing.v1") {
    errors.push(`${fileName}: unsupported schemaVersion`);
  }
  const weekStartOk = strictDate(briefing.weekStart, fileName, "weekStart", errors);
  const weekEndOk = strictDate(briefing.weekEnd, fileName, "weekEnd", errors);
  strictDateTime(briefing.generatedAt, fileName, "generatedAt", errors);

  if (weekStartOk && weekEndOk && briefing.weekStart > briefing.weekEnd) {
    errors.push(`${fileName}: weekStart must not be later than weekEnd`);
  }
  if (weekEndOk && fileName !== `${briefing.weekEnd}.json`) {
    errors.push(`${fileName}: filename must match weekEnd ${briefing.weekEnd}.json`);
  }
  if (weekEndOk) {
    addUnique(slugs, briefing.weekEnd, `${fileName}: duplicate engineering briefing weekEnd`, errors);
  }

  if (!Array.isArray(briefing.sourceRecords)) {
    errors.push(`${fileName}: sourceRecords must be an array`);
    return;
  }
  if (!Array.isArray(briefing.briefingItems)) {
    errors.push(`${fileName}: briefingItems must be an array`);
    return;
  }

  const sourceIds = validateSourceRecords(briefing.sourceRecords, fileName, errors);
  validateBriefingItems(briefing.briefingItems, sourceIds, fileName, errors);
}

function validateSourceRecords(records, fileName, errors) {
  const sourceIds = new Map();
  const sourceUrls = new Map();

  records.forEach((source, index) => {
    const label = `${fileName}: sourceRecords[${index}]`;
    if (!isRecord(source)) {
      errors.push(`${label}: source record must be an object`);
      return;
    }

    requiredString(source.sourceRecordId, label, "sourceRecordId", errors);
    enumString(source.sourceType, SOURCE_TYPES, label, "sourceType", errors);
    requiredString(source.publisher, label, "publisher", errors);
    requiredString(source.title, label, "title", errors);
    requiredUrl(source.sourceUrl, label, "sourceUrl", errors);
    strictDate(source.publishedDate, label, "publishedDate", errors);
    strictDateTime(source.retrievedAt, label, "retrievedAt", errors);
    enumString(source.collectionMethod, COLLECTION_METHODS, label, "collectionMethod", errors);
    requiredString(source.sourceText, label, "sourceText", errors);
    requiredString(source.licenseNote, label, "licenseNote", errors);

    if (typeof source.sourceRecordId === "string") {
      addUnique(sourceIds, source.sourceRecordId, `${label}: duplicate sourceRecordId ${source.sourceRecordId}`, errors);
      if (source.sourceRecordId.startsWith("paper")) {
        errors.push(`${label}: Engineering Briefing sourceRecordId must not be a Research Digest paper ID`);
      }
    }
    if (typeof source.sourceUrl === "string") {
      addUnique(sourceUrls, source.sourceUrl, `${label}: duplicate sourceUrl ${source.sourceUrl}`, errors);
    }
  });

  return sourceIds;
}

function validateBriefingItems(items, sourceIds, fileName, errors) {
  const itemIds = new Map();

  items.forEach((item, index) => {
    const label = `${fileName}: briefingItems[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${label}: briefing item must be an object`);
      return;
    }

    requiredString(item.briefingItemId, label, "briefingItemId", errors);
    requiredString(item.title, label, "title", errors);
    requiredString(item.oneLineSummary, label, "oneLineSummary", errors);
    enumString(item.category, CATEGORIES, label, "category", errors);
    requiredUrl(item.sourceUrl, label, "sourceUrl", errors);
    requiredString(item.explanation, label, "explanation", errors);
    nullableString(item.whyItMatters, label, "whyItMatters", errors);
    stringArray(item.engineeringTopics, label, "engineeringTopics", errors);

    if (typeof item.briefingItemId === "string") {
      addUnique(itemIds, item.briefingItemId, `${label}: duplicate briefingItemId ${item.briefingItemId}`, errors);
    }

    if (!Array.isArray(item.sourceRecordIds) || item.sourceRecordIds.length === 0) {
      errors.push(`${label}: sourceRecordIds must contain at least one source record ID`);
    } else {
      item.sourceRecordIds.forEach((sourceId, sourceIndex) => {
        if (typeof sourceId !== "string" || sourceId.trim() === "") {
          errors.push(`${label}: sourceRecordIds[${sourceIndex}] must be a non-empty string`);
        } else if (!sourceIds.has(sourceId)) {
          errors.push(`${label}: missing source record ${sourceId}`);
        }
      });
    }
  });
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

function enumString(value, allowed, label, field, errors) {
  if (!requiredString(value, label, field, errors)) {
    return;
  }
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

function strictDateTime(value, label, field, errors) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    errors.push(`${label}: ${field} must be a valid ISO datetime string`);
    return false;
  }
  if (Number.isNaN(Date.parse(value))) {
    errors.push(`${label}: ${field} must be a valid ISO datetime string`);
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
    console.log("Static engineering briefing data validation passed.");
    process.exitCode = 0;
    return;
  }

  console.error("Static engineering briefing data validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}

if (require.main === module) {
  main();
}

module.exports = {
  parseAdapterRegistration,
  validateRepository,
  validateStaticBriefings,
};
