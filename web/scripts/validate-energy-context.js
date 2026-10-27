/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");

function validateEnergyContext(value, today = new Date().toISOString().slice(0, 10)) {
  const errors = [];
  const object = (item) => item !== null && typeof item === "object" && !Array.isArray(item);
  const text = (item) => typeof item === "string" && item.trim().length > 0 && !/\uFFFD|\?{3,}/.test(item);
  const date = (item) => typeof item === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item)
    && !Number.isNaN(Date.parse(item)) && new Date(item).toISOString().slice(0, 10) === item;
  const bilingual = (item, label) => {
    if (!object(item) || !text(item.en) || !text(item.zh) || !/[\u3400-\u9fff]/.test(item.zh)) errors.push(`${label}: bilingual text required`);
  };
  if (!object(value)) return ["Energy context must be an object"];
  if (value.schemaVersion !== "ai-energy-context.v1") errors.push("Energy context schema unsupported");
  if (value.scenarioBasis !== "editorial_conditional") errors.push("Future scenarios must be editorial_conditional");
  if (!date(value.reviewedOn) || value.reviewedOn > today) errors.push("Energy context review date invalid/future");
  const sources = new Map();
  if (!Array.isArray(value.sources) || !value.sources.length) return [...errors, "Energy context sources required"];
  for (const source of value.sources) {
    if (!object(source)) { errors.push("Invalid context source"); continue; }
    if (!text(source.id) || sources.has(source.id)) errors.push("Context source ID missing/duplicate");
    sources.set(source.id, source);
    for (const key of ["title", "publisher", "scope"]) if (!text(source[key])) errors.push(`${source.id}: ${key} required`);
    try { const url = new URL(source.url); if (url.protocol !== "https:" || url.username || url.password) throw Error(); }
    catch { errors.push(`${source.id}: credential-free HTTPS source URL required`); }
    if (!date(source.reviewedOn) || source.reviewedOn > value.reviewedOn) errors.push(`${source.id}: invalid review date`);
    if (source.publishedOn !== null && (!date(source.publishedOn) || source.publishedOn > source.reviewedOn)) errors.push(`${source.id}: publication date invalid/future`);
  }
  const used = new Set();
  const refs = (ids, label) => {
    if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length) { errors.push(`${label}: unique source references required`); return; }
    for (const id of ids) { if (!sources.has(id)) errors.push(`${label}: unknown source ${id}`); used.add(id); }
  };
  const groups = [
    ["relationships", 3, ["title", "text"]],
    ["fields", 7, ["title", "step", "mechanism", "reader", "developer", "boundary"]],
    ["glossary", 6, ["term", "meaning"]],
    ["developments", 6, ["title", "fact", "meaning", "boundary"]],
    ["scenarios", 3, ["title", "possibility", "requires", "watch"]],
  ];
  const kinds = new Set(["analysis", "operational_release", "research_progress", "projection", "company_contract", "company_matching"]);
  for (const [name, count, fields] of groups) {
    if (!Array.isArray(value[name]) || value[name].length !== count) { errors.push(`${name}: expected ${count} entries`); continue; }
    const ids = new Set();
    for (const item of value[name]) {
      if (!object(item)) { errors.push(`${name}: invalid entry`); continue; }
      if (name !== "glossary") {
        if (!text(item.id) || !/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id)) errors.push(`${name}: invalid/duplicate ID`);
        ids.add(item.id);
      }
      for (const field of fields) bilingual(item[field], `${name}.${item.id ?? item.term?.en}.${field}`);
      refs(name === "developments" ? [item.sourceId] : item.sourceIds, `${name}.${item.id}`);
      if (name === "developments") {
        if (!kinds.has(item.kind)) errors.push(`${item.id}: unsupported development kind`);
        if (!sources.get(item.sourceId)?.publishedOn) errors.push(`${item.id}: dated development needs publication date`);
      }
      if (name === "fields" && item.relatedHref !== undefined && !/^\/digital-ai#(?:application-(?:forecasting|predictive|twin)|pathway-(?:land|flexible))$/.test(item.relatedHref)) errors.push(`${item.id}: invalid reading-context link`);
    }
  }
  for (const id of sources.keys()) if (!used.has(id)) errors.push(`Unused context source ${id}`);
  return errors;
}

function validateEnergyContextFile(file) {
  try { return validateEnergyContext(JSON.parse(fs.readFileSync(file, "utf8"))); }
  catch { return ["Energy context JSON missing or malformed"]; }
}

module.exports = { validateEnergyContext, validateEnergyContextFile };
