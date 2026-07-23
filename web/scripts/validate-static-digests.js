/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

function validateRepository(rootDir = process.cwd()) {
  return validateStaticDigests({
    digestDir: path.join(rootDir, "data", "digests"),
    adapterPath: path.join(rootDir, "data", "digest-adapter.ts"),
  });
}

function validateStaticDigests({ digestDir, adapterPath }) {
  const errors = [];
  const digestFiles = listDigestFiles(digestDir, errors);
  const adapter = parseAdapterRegistration(adapterPath, errors);

  validateAdapterRegistration({
    adapter,
    digestFiles,
    digestDir,
    errors,
  });

  validateDigestFiles({
    digestFiles,
    digestDir,
    errors,
  });

  return errors;
}

function listDigestFiles(digestDir, errors) {
  try {
    return fs
      .readdirSync(digestDir)
      .filter((fileName) => fileName.endsWith(".json"))
      .sort();
  } catch {
    errors.push(`${digestDir}: unable to read digest directory`);
    return [];
  }
}

function parseAdapterRegistration(adapterPath, errors) {
  let source;
  try {
    source = fs.readFileSync(adapterPath, "utf8");
  } catch {
    errors.push(`${adapterPath}: unable to read adapter`);
    return {
      imports: [],
      registrations: [],
    };
  }

  const imports = [];
  const importPattern =
    /import\s+([A-Za-z_$][\w$]*)\s+from\s+"\.\/digests\/([^"]+\.json)";/g;
  for (const match of source.matchAll(importPattern)) {
    imports.push({
      variableName: match[1],
      target: match[2],
    });
  }

  const arrayMatch = source.match(/const\s+digestJsonFiles\s*=\s*\[([\s\S]*?)\];/);
  const registrations = [];
  if (!arrayMatch) {
    errors.push(`${adapterPath}: digestJsonFiles registration array not found`);
  } else {
    const registrationPattern = /\b([A-Za-z_$][\w$]*)\b/g;
    for (const match of arrayMatch[1].matchAll(registrationPattern)) {
      registrations.push(match[1]);
    }
  }

  return {
    imports,
    registrations,
  };
}

function validateAdapterRegistration({ adapter, digestFiles, digestDir, errors }) {
  const importTargetCounts = countValues(adapter.imports.map((item) => item.target));
  for (const [target, count] of importTargetCounts) {
    if (count > 1) {
      errors.push(`digest-adapter.ts: duplicate JSON import target ${target}`);
    }
  }

  const importedTargets = new Set(adapter.imports.map((item) => item.target));
  for (const fileName of digestFiles) {
    if (!importedTargets.has(fileName)) {
      errors.push(`${fileName}: JSON file is not imported by digest-adapter.ts`);
    }
  }

  for (const importedTarget of importedTargets) {
    if (!fs.existsSync(path.join(digestDir, importedTarget))) {
      errors.push(`${importedTarget}: imported JSON file does not exist`);
    }
  }

  const importByVariable = new Map();
  for (const item of adapter.imports) {
    importByVariable.set(item.variableName, item.target);
  }

  const registrationCounts = countValues(adapter.registrations);
  for (const [variableName, count] of registrationCounts) {
    if (count > 1) {
      errors.push(`digestJsonFiles: duplicate registration ${variableName}`);
    }
  }

  const registeredVariables = new Set(adapter.registrations);
  for (const item of adapter.imports) {
    if (!registeredVariables.has(item.variableName)) {
      errors.push(
        `${item.target}: imported digest ${item.variableName} is omitted from digestJsonFiles`,
      );
    }
  }

  for (const variableName of registeredVariables) {
    if (!importByVariable.has(variableName)) {
      errors.push(`digestJsonFiles: registered digest ${variableName} has no JSON import`);
    }
  }
}

function validateDigestFiles({ digestFiles, digestDir, errors }) {
  if (digestFiles.length === 0) {
    errors.push(`${digestDir}: at least one digest JSON file is required`);
    return;
  }

  const editionSlugs = new Map();
  const globalPaperSlugs = new Map();

  for (const fileName of digestFiles) {
    const filePath = path.join(digestDir, fileName);
    const digest = parseJsonFile(filePath, fileName, errors);
    if (digest === undefined) {
      continue;
    }
    validateDigest({
      digest,
      fileName,
      editionSlugs,
      globalPaperSlugs,
      errors,
    });
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

function validateDigest({
  digest,
  fileName,
  editionSlugs,
  globalPaperSlugs,
  errors,
}) {
  if (!isRecord(digest)) {
    errors.push(`${fileName}: digest must be an object`);
    return;
  }

  requiredString(digest.schemaVersion, fileName, "schemaVersion", errors);
  requiredString(digest.runId, fileName, "runId", errors);
  requiredString(digest.sourceName, fileName, "sourceName", errors);
  const weekStartOk = strictDate(digest.weekStart, fileName, "weekStart", errors);
  const weekEndOk = strictDate(digest.weekEnd, fileName, "weekEnd", errors);
  strictDateTime(digest.generatedAt, fileName, "generatedAt", errors);

  if (weekStartOk && weekEndOk && digest.weekStart > digest.weekEnd) {
    errors.push(`${fileName}: weekStart must not be later than weekEnd`);
  }

  if (weekEndOk && fileName !== `${digest.weekEnd}.json`) {
    errors.push(`${fileName}: filename must match weekEnd ${digest.weekEnd}.json`);
  }

  if (weekEndOk) {
    addUnique(editionSlugs, digest.weekEnd, `${fileName}: duplicate edition weekEnd`, errors);
  }

  if (!Array.isArray(digest.selectedPapers)) {
    errors.push(`${fileName}: selectedPapers must be an array`);
    return;
  }

  validatePapers({
    papers: digest.selectedPapers,
    fileName,
    globalPaperSlugs,
    errors,
  });
}

function validatePapers({ papers, fileName, globalPaperSlugs, errors }) {
  const paperIds = new Map();
  const ranks = new Map();

  papers.forEach((paper, index) => {
    const label = `${fileName}: selectedPapers[${index}]`;
    if (!isRecord(paper)) {
      errors.push(`${label}: paper must be an object`);
      return;
    }

    requiredString(paper.paperId, label, "paperId", errors);
    requiredString(paper.title, label, "title", errors);
    strictDate(paper.publishedDate, label, "publishedDate", errors);
    requiredString(paper.publicationType, label, "publicationType", errors);
    requiredString(paper.fullTextAvailability, label, "fullTextAvailability", errors);
    requiredString(paper.selectionReason, label, "selectionReason", errors);
    nullableString(paper.abstract, label, "abstract", errors);
    nullableString(paper.publicationSource, label, "publicationSource", errors);
    nullableString(paper.doi, label, "doi", errors);
    nullableString(paper.sourceUrl, label, "sourceUrl", errors);
    nullableString(paper.openAccessStatus, label, "openAccessStatus", errors);
    nullableString(paper.indexedDate, label, "indexedDate", errors);
    stringArray(paper.authors, label, "authors", errors);
    stringArray(paper.topicTags, label, "topicTags", errors);

    if (typeof paper.rank !== "number" || !Number.isInteger(paper.rank)) {
      errors.push(`${label}: rank must be an integer`);
    } else if (paper.rank < 1) {
      errors.push(`${label}: rank must be a positive integer`);
    } else {
      addUnique(ranks, String(paper.rank), `${label}: duplicate rank ${paper.rank}`, errors);
      if (paper.rank !== index + 1) {
        errors.push(`${label}: array order must agree with rank ${paper.rank}`);
      }
    }

    if (typeof paper.paperId === "string" && paper.paperId.trim() !== "") {
      addUnique(paperIds, paper.paperId, `${label}: duplicate paperId ${paper.paperId}`, errors);
      const slug = slugFromPaperId(paper.paperId);
      if (slug === "") {
        errors.push(`${label}: generated paper slug must be non-empty`);
      } else {
        addUnique(
          globalPaperSlugs,
          slug,
          `${label}: duplicate global paper slug ${slug}`,
          errors,
        );
      }
    }
  });

  for (let rank = 1; rank <= papers.length; rank += 1) {
    if (!ranks.has(String(rank))) {
      errors.push(`${fileName}: ranks must be contiguous from 1 to ${papers.length}`);
      break;
    }
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

function stringArray(value, label, field, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label}: ${field} must be an array`);
    return;
  }

  value.forEach((item, index) => {
    if (typeof item !== "string") {
      errors.push(`${label}: ${field}[${index}] must be a string`);
    }
  });
}

function strictDate(value, label, field, errors) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.push(`${label}: ${field} must be a strict YYYY-MM-DD date`);
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
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

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
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

function countValues(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function slugFromPaperId(paperId) {
  return paperId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function main() {
  const errors = validateRepository();
  if (errors.length === 0) {
    console.log("Static digest data validation passed.");
    process.exitCode = 0;
    return;
  }

  console.error("Static digest data validation failed:");
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
  slugFromPaperId,
  validateRepository,
  validateStaticDigests,
};