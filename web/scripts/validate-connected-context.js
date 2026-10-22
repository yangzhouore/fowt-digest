/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim().length > 0;
const safeId = (value) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

function validateContextLinks(dataset, projects, editions, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const shape = (value, label, fields) => {
    if (!isObject(value)) { errors.push(`${label}: must be an object`); return false; }
    for (const field of Object.keys(value)) check(fields.includes(field), `${label}: unexpected field ${field}`);
    return true;
  };
  if (!shape(dataset, "context", ["schemaVersion", "links"])) return errors;
  check(dataset.schemaVersion === "project-engineering-links.v1", "context: unsupported schemaVersion");
  if (!Array.isArray(dataset.links)) return [...errors, "context.links: must be an array"];
  const ids = new Set();
  const pairs = new Set();
  for (const link of dataset.links) {
    if (!shape(link, "context link", ["id", "projectId", "editionSlug", "briefingItemId", "basis", "mappingReviewedOn"])) continue;
    const label = String(link.id);
    for (const key of ["id", "projectId", "briefingItemId"]) check(safeId(link[key]), `${label}: ${key} must be a safe stable ID`);
    check(!ids.has(link.id), `${label}: duplicate link ID`); ids.add(link.id);
    const pair = JSON.stringify([link.projectId, link.editionSlug, link.briefingItemId]);
    check(!pairs.has(pair), `${label}: duplicate project/item association`); pairs.add(pair);
    const project = projects.find((project) => project.id === link.projectId);
    const edition = editions.find((edition) => edition.weekEnd === link.editionSlug);
    const item = edition?.briefingItems.find((item) => item.briefingItemId === link.briefingItemId);
    check(Boolean(project), `${label}: unknown project`);
    check(Boolean(edition), `${label}: unknown or unregistered edition`);
    check(Boolean(item), `${label}: item is not published in this edition`);
    const date = link.mappingReviewedOn;
    const validDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(`${date}T00:00:00Z`)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
    check(validDate, `${label}: mappingReviewedOn must be a valid YYYY-MM-DD date`);
    if (validDate) check(date <= today, `${label}: future mapping review date`);
    if (!shape(link.basis, `${label}.basis`, ["type", "sourceRecordId", "storedExcerpt", "projectMention"])) continue;
    check(link.basis.type === "project_specific_coverage", `${label}: unsupported basis type`);
    const source = edition?.sourceRecords.find((source) => source.sourceRecordId === link.basis.sourceRecordId);
    check(Boolean(source) && Boolean(item?.sourceRecordIds.includes(link.basis.sourceRecordId)), `${label}: source must belong to the published item`);
    const excerpt = link.basis.storedExcerpt;
    check(isText(excerpt) && excerpt.length <= 240 && excerpt.trim().split(/\s+/).length <= 25, `${label}: storedExcerpt must be a short non-empty extract (max 25 words / 240 characters)`);
    if (source) check(isText(excerpt) && source.sourceText.includes(excerpt), `${label}: storedExcerpt is not an exact stored source substring`);
    const mention = link.basis.projectMention;
    check(isText(mention) && Boolean(project && [project.name, ...project.aliases].some((name) => name.toLowerCase() === mention.toLowerCase())), `${label}: projectMention must be an accepted project name or alias`);
    if (isText(mention) && isText(excerpt)) {
      const escaped = mention.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      check(new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "iu").test(excerpt), `${label}: excerpt must identify the project as a complete name/alias`);
    }
  }
  return errors;
}

function readRepository(rootDir = process.cwd()) {
  const adapter = fs.readFileSync(path.join(rootDir, "data", "engineering-briefing-adapter.ts"), "utf8");
  const imports = [...adapter.matchAll(/^import \w+Json from "\.\/briefings\/(\d{4}-\d{2}-\d{2})\.json";/gm)];
  if (!imports.length) throw new Error("No registered Engineering edition imports found");
  const readJson = (...parts) => JSON.parse(fs.readFileSync(path.join(rootDir, ...parts), "utf8"));
  return {
    dataset: readJson("data", "context", "project-engineering-links.json"),
    projects: readJson("data", "projects", "projects.json").projects,
    editions: imports.map((match) => readJson("data", "briefings", `${match[1]}.json`)),
  };
}
function validateRepository(rootDir = process.cwd()) {
  try {
    const { dataset, projects, editions } = readRepository(rootDir);
    return validateContextLinks(dataset, projects, editions);
  } catch (error) { return [`context: unable to read repository data (${error.message})`]; }
}
if (require.main === module) {
  const errors = validateRepository();
  if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
  else console.log("Connected project context validation passed.");
}
module.exports = { validateContextLinks, readRepository, validateRepository };
