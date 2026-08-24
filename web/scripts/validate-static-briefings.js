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

const REGIONS = new Set([
  "Europe",
  "Asia-Pacific",
  "North America",
  "Africa",
  "Unspecified",
]);

const CANDIDATE_STATUSES = new Set([
  "candidate",
  "supporting_provenance",
  "duplicate_event",
]);

const ENGINEERING_SELECTION_COMPONENTS = new Map([
  ["engineering_relevance", 30],
  ["project_company", 25],
  ["technology", 20],
  ["policy_market", 15],
  ["source_quality", 10],
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
  const itemIds = validateBriefingItems(briefing.briefingItems, sourceIds, fileName, errors);
  if (briefing.engineeringSelection !== undefined) {
    validateEngineeringSelection({
      selection: briefing.engineeringSelection,
      sourceIds,
      itemIds,
      sourceRecordCount: briefing.sourceRecords.length,
      fileName,
      errors,
    });
  }
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
    if (source.candidateStatus !== undefined) {
      enumString(source.candidateStatus, CANDIDATE_STATUSES, label, "candidateStatus", errors);
    }

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
    if (item.region !== undefined) {
      enumString(item.region, REGIONS, label, "region", errors);
    }
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

  return itemIds;
}

function validateEngineeringSelection({
  selection,
  sourceIds,
  itemIds,
  sourceRecordCount,
  fileName,
  errors,
}) {
  if (!isRecord(selection)) {
    errors.push(`${fileName}: engineeringSelection must be an object`);
    return;
  }
  const label = `${fileName}: engineeringSelection`;
  requiredString(selection.candidatePoolType, label, "candidatePoolType", errors);
  validateSelectionModel(selection.selectionModel, label, errors);
  if (!Array.isArray(selection.candidates)) {
    errors.push(`${label}: candidates must be an array`);
    return;
  }
  const auditedCandidateCount = collectionAuditCandidateCount(selection.collectionAudit);
  if (auditedCandidateCount !== null && selection.candidates.length !== auditedCandidateCount) {
    errors.push(`${label}: candidates must match collectionAudit.candidatePoolSize`);
  } else if (auditedCandidateCount === null && selection.candidates.length !== sourceRecordCount) {
    errors.push(`${label}: candidates must match retained sourceRecords count when no collection audit is stored`);
  }

  const candidateIds = new Map();
  const candidateSourceIds = new Map();
  const rawRanks = new Map();
  const finalRanks = new Map();
  const selectedItemIds = new Map();

  selection.candidates.forEach((candidate, index) => {
    validateEngineeringCandidate({
      candidate,
      index,
      sourceIds,
      itemIds,
      candidateIds,
      candidateSourceIds,
      rawRanks,
      finalRanks,
      selectedItemIds,
      fileName,
      errors,
    });
  });

  ensureContiguousRanks(rawRanks, selection.candidates.length, `${label}: rawRank`, errors);
  ensureContiguousRanks(finalRanks, finalRanks.size, `${label}: selected finalRank`, errors);
}

function collectionAuditCandidateCount(audit) {
  if (!isRecord(audit)) {
    return null;
  }
  return typeof audit.candidatePoolSize === "number" && Number.isInteger(audit.candidatePoolSize)
    ? audit.candidatePoolSize
    : null;
}

function validateSelectionModel(model, label, errors) {
  if (!isRecord(model)) {
    errors.push(`${label}: selectionModel must be an object`);
    return;
  }
  if (model.id !== "engineering_selection_score_v1") {
    errors.push(`${label}: selectionModel.id must be engineering_selection_score_v1`);
  }
  requiredString(model.label, label, "selectionModel.label", errors);
  requiredString(model.description, label, "selectionModel.description", errors);
  if (!Array.isArray(model.components)) {
    errors.push(`${label}: selectionModel.components must be an array`);
  } else {
    const componentIds = new Map();
    model.components.forEach((component, index) => {
      const componentLabel = `${label}: selectionModel.components[${index}]`;
      if (!isRecord(component)) {
        errors.push(`${componentLabel}: component must be an object`);
        return;
      }
      requiredString(component.componentId, componentLabel, "componentId", errors);
      requiredString(component.label, componentLabel, "label", errors);
      const expectedMax = ENGINEERING_SELECTION_COMPONENTS.get(component.componentId);
      if (expectedMax === undefined) {
        errors.push(`${componentLabel}: unsupported componentId ${component.componentId}`);
      } else if (component.maxScore !== expectedMax) {
        errors.push(`${componentLabel}: maxScore must be ${expectedMax}`);
      }
      if (typeof component.componentId === "string") {
        addUnique(componentIds, component.componentId, `${componentLabel}: duplicate componentId ${component.componentId}`, errors);
      }
    });
  }
  if (!Array.isArray(model.diversityRules) || model.diversityRules.length === 0) {
    errors.push(`${label}: selectionModel.diversityRules must be a non-empty array`);
  }
}

function validateEngineeringCandidate({
  candidate,
  index,
  sourceIds,
  itemIds,
  candidateIds,
  candidateSourceIds,
  rawRanks,
  finalRanks,
  selectedItemIds,
  fileName,
  errors,
}) {
  const label = `${fileName}: engineeringSelection.candidates[${index}]`;
  if (!isRecord(candidate)) {
    errors.push(`${label}: candidate must be an object`);
    return;
  }

  requiredString(candidate.candidateId, label, "candidateId", errors);
  requiredString(candidate.sourceRecordId, label, "sourceRecordId", errors);
  requiredString(candidate.selectionReason, label, "selectionReason", errors);
  if (typeof candidate.selected !== "boolean") {
    errors.push(`${label}: selected must be boolean`);
  }
  if (typeof candidate.candidateId === "string") {
    addUnique(candidateIds, candidate.candidateId, `${label}: duplicate candidateId ${candidate.candidateId}`, errors);
  }
  if (typeof candidate.sourceRecordId === "string") {
    addUnique(candidateSourceIds, candidate.sourceRecordId, `${label}: duplicate sourceRecordId ${candidate.sourceRecordId}`, errors);
    if (!sourceIds.has(candidate.sourceRecordId)) {
      errors.push(`${label}: missing source record ${candidate.sourceRecordId}`);
    }
  }
  integerRank(candidate.rawRank, label, "rawRank", errors);
  if (typeof candidate.rawRank === "number") {
    addUnique(rawRanks, candidate.rawRank, `${label}: duplicate rawRank ${candidate.rawRank}`, errors);
  }

  if (candidate.selected) {
    integerRank(candidate.finalRank, label, "finalRank", errors);
    if (typeof candidate.finalRank === "number") {
      addUnique(finalRanks, candidate.finalRank, `${label}: duplicate finalRank ${candidate.finalRank}`, errors);
    }
    if (typeof candidate.selectedBriefingItemId !== "string" || !itemIds.has(candidate.selectedBriefingItemId)) {
      errors.push(`${label}: selected candidate must reference an existing briefing item`);
    } else {
      addUnique(selectedItemIds, candidate.selectedBriefingItemId, `${label}: duplicate selectedBriefingItemId ${candidate.selectedBriefingItemId}`, errors);
    }
  } else {
    if (candidate.finalRank !== null) {
      errors.push(`${label}: unselected candidate finalRank must be null`);
    }
    if (candidate.selectedBriefingItemId !== null) {
      errors.push(`${label}: unselected candidate selectedBriefingItemId must be null`);
    }
  }

  nullableString(candidate.diversityReason, label, "diversityReason", errors);
  validateSelectionScore(candidate.engineeringSelectionScore, label, errors);
  validateDiversitySignals(candidate.diversitySignals, label, errors);
}

function validateSelectionScore(score, label, errors) {
  if (!isRecord(score)) {
    errors.push(`${label}: engineeringSelectionScore must be an object`);
    return;
  }
  if (score.modelId !== "engineering_selection_score_v1") {
    errors.push(`${label}: engineeringSelectionScore.modelId must be engineering_selection_score_v1`);
  }
  if (score.maxScore !== 100) {
    errors.push(`${label}: engineeringSelectionScore.maxScore must be 100`);
  }
  if (typeof score.total !== "number" || !Number.isInteger(score.total) || score.total < 0 || score.total > 100) {
    errors.push(`${label}: engineeringSelectionScore.total must be an integer 0-100`);
  }
  if (!Array.isArray(score.components)) {
    errors.push(`${label}: engineeringSelectionScore.components must be an array`);
    return;
  }

  const componentIds = new Map();
  const total = score.components.reduce((sum, component, index) => {
    const componentLabel = `${label}: engineeringSelectionScore.components[${index}]`;
    if (!isRecord(component)) {
      errors.push(`${componentLabel}: component must be an object`);
      return sum;
    }
    requiredString(component.componentId, componentLabel, "componentId", errors);
    requiredString(component.label, componentLabel, "label", errors);
    const expectedMax = ENGINEERING_SELECTION_COMPONENTS.get(component.componentId);
    if (expectedMax === undefined) {
      errors.push(`${componentLabel}: unsupported componentId ${component.componentId}`);
    } else if (component.maxScore !== expectedMax) {
      errors.push(`${componentLabel}: maxScore must be ${expectedMax}`);
    }
    if (typeof component.componentId === "string") {
      addUnique(componentIds, component.componentId, `${componentLabel}: duplicate componentId ${component.componentId}`, errors);
    }
    if (
      typeof component.score !== "number" ||
      !Number.isInteger(component.score) ||
      component.score < 0 ||
      typeof component.maxScore !== "number" ||
      !Number.isInteger(component.maxScore) ||
      component.score > component.maxScore
    ) {
      errors.push(`${componentLabel}: score must be an integer inside component bounds`);
    }
    if (!Array.isArray(component.evidence)) {
      errors.push(`${componentLabel}: evidence must be an array`);
    }
    return sum + (typeof component.score === "number" ? component.score : 0);
  }, 0);

  for (const componentId of ENGINEERING_SELECTION_COMPONENTS.keys()) {
    if (!componentIds.has(componentId)) {
      errors.push(`${label}: engineeringSelectionScore missing component ${componentId}`);
    }
  }
  if (typeof score.total === "number" && score.total !== total) {
    errors.push(`${label}: engineeringSelectionScore.total must equal component sum`);
  }
}

function validateDiversitySignals(signals, label, errors) {
  if (!isRecord(signals)) {
    errors.push(`${label}: diversitySignals must be an object`);
    return;
  }
  requiredString(signals.publisher, label, "diversitySignals.publisher", errors);
  nullableString(signals.projectGroup, label, "diversitySignals.projectGroup", errors);
  requiredString(signals.topicGroup, label, "diversitySignals.topicGroup", errors);
  enumString(signals.regionHint, REGIONS, label, "diversitySignals.regionHint", errors);
}

function ensureContiguousRanks(rankMap, expectedCount, label, errors) {
  for (let rank = 1; rank <= expectedCount; rank += 1) {
    if (!rankMap.has(rank)) {
      errors.push(`${label}: missing rank ${rank}`);
    }
  }
}

function integerRank(value, label, field, errors) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    errors.push(`${label}: ${field} must be a positive integer`);
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
