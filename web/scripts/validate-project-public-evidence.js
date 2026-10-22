/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const AREAS = ["Permitting", "Revenue", "Engineering", "Procurement", "Financing / FID", "Execution"];
const COVERAGE = ["Current assessment", "FID", "Timeline", "Roles", "Watchpoints"];
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim().length > 0;

function validateEvidenceDataset(dataset, factual, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const object = (value, label, keys) => {
    if (!isObject(value)) { errors.push(`${label}: must be an object`); return false; }
    for (const key of Object.keys(value)) check(keys.includes(key), `${label}: unexpected field ${key}`);
    return true;
  };
  const list = (value, label) => {
    if (!Array.isArray(value)) { errors.push(`${label}: must be an array`); return []; }
    return value;
  };
  const text = (value, label) => check(isText(value), `${label}: must be a non-empty string`);
  const unique = (values, label) => check(new Set(values).size === values.length, `${label}: duplicates are not allowed`);
  const date = (value, label) => {
    const valid = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
    check(valid, `${label}: must be a valid YYYY-MM-DD date`);
    if (valid) check(value <= today, `${label}: future review/access date`);
    return valid;
  };
  if (!object(dataset, "public-evidence", ["schemaVersion", "projects"])) return errors;
  check(dataset.schemaVersion === "fowt-project-public-evidence.v1", "public-evidence: unsupported schemaVersion");
  const projects = new Map(factual.projects.map((project) => [project.id, project]));
  const sourceIds = new Set(factual.sources.map((source) => source.sourceId));
  const entries = list(dataset.projects, "public-evidence.projects");
  unique(entries.map((entry) => entry?.projectId), "projectId");
  check(entries.length === projects.size && [...projects.keys()].every((id) => entries.some((entry) => entry?.projectId === id)), "public-evidence: must cover every project exactly once");
  for (const entry of entries) {
    if (!object(entry, "project evidence", ["projectId", "areas", "reviews", "changes"])) continue;
    const label = String(entry.projectId);
    const project = projects.get(entry.projectId);
    check(Boolean(project), `${label}: unknown projectId`);
    if (!project) continue;
    const events = factual.timelineEvents.filter((event) => event.projectId === project.id);
    const relationships = factual.projectCompanyRelationships.filter((relationship) => relationship.projectId === project.id);
    const facts = project.intelligence?.confirmedFacts ?? [];
    const allowedSources = new Set([
      ...project.sourceIds, ...(project.intelligence?.sourceIds ?? []),
      ...facts.flatMap((fact) => fact.sourceIds),
      ...(project.intelligence?.editorialInferences ?? []).flatMap((item) => item.sourceIds),
      ...events.flatMap((event) => event.sourceIds), ...relationships.flatMap((relationship) => relationship.sourceIds),
    ]);
    const checkSources = (values, location, required = false) => {
      const ids = list(values, location);
      if (required) check(ids.length > 0, `${location}: source-free evidence is not allowed`);
      unique(ids, location);
      ids.forEach((id) => check(sourceIds.has(id) && allowedSources.has(id), `${location}: unknown or cross-project source ${id}`));
      return ids;
    };
    const areas = list(entry.areas, `${label}.areas`);
    unique(areas.map((area) => area?.area), `${label}.areas`);
    check(areas.length === AREAS.length && AREAS.every((name) => areas.some((area) => area?.area === name)), `${label}: exactly six readiness areas required`);
    for (const area of areas) {
      if (!object(area, `${label}.area`, ["area", "recordRefs", "boundary", "watchpointRefs"])) continue;
      check(AREAS.includes(area.area), `${label}: unknown readiness area`);
      const location = `${label}.${area.area}`;
      if (area.boundary !== null) text(area.boundary, `${location}.boundary`);
      const refs = list(area.recordRefs, `${location}.recordRefs`);
      unique(refs.map((ref) => `${ref?.kind}:${ref?.key}`), `${location}.recordRefs`);
      for (const ref of refs) {
        if (!object(ref, `${location}.ref`, ["kind", "key"])) continue;
        text(ref.key, `${location}.ref.key`);
        let matches = [];
        if (ref.kind === "confirmed_fact") matches = facts.filter((fact) => fact.text === ref.key);
        else if (ref.kind === "timeline_event") matches = events.filter((event) => event.id === ref.key);
        else if (ref.kind === "relationship") matches = relationships.filter((relationship) => relationship.id === ref.key);
        else check(false, `${location}: unsupported reference kind (editorial inferences cannot be factual evidence)`);
        check(matches.length === 1, `${location}: unresolved, ambiguous or cross-project reference ${ref.key}`);
        if (matches.length === 1) checkSources(matches[0].sourceIds, `${location}.sources`, true);
      }
      const watchpoints = list(area.watchpointRefs, `${location}.watchpointRefs`);
      unique(watchpoints, `${location}.watchpointRefs`);
      for (const watchpoint of watchpoints) check((project.intelligence?.watchpoints ?? []).filter((text) => text === watchpoint).length === 1, `${location}: unresolved or ambiguous watchpoint`);
    }
    const reviews = list(entry.reviews, `${label}.reviews`);
    unique(reviews.map((review) => review?.id), `${label}.reviews.id`);
    for (const review of reviews) {
      if (!object(review, `${label}.review`, ["id", "date", "outcome", "scope", "coverage", "sources", "findings", "summary", "limitations"])) continue;
      text(review.id, `${label}.review.id`);
      date(review.date, `${label}.review.date`);
      check(["completed", "partial"].includes(review.outcome), `${label}.review: invalid outcome`);
      text(review.summary, `${label}.review.summary`);
      text(review.limitations, `${label}.review.limitations`);
      const scope = list(review.scope, `${label}.review.scope`);
      unique(scope, `${label}.review.scope`);
      scope.forEach((area) => check(AREAS.includes(area), `${label}.review: unknown scope area`));
      const coverage = list(review.coverage, `${label}.review.coverage`);
      unique(coverage, `${label}.review.coverage`);
      coverage.forEach((item) => check(COVERAGE.includes(item), `${label}.review: unknown coverage`));
      const inspections = list(review.sources, `${label}.review.sources`);
      unique(inspections.map((inspection) => inspection?.sourceId), `${label}.review.sources`);
      const inspectedIds = new Set();
      for (const inspection of inspections) {
        if (!object(inspection, `${label}.inspection`, ["sourceId", "accessedDate", "material", "finding"])) continue;
        checkSources([inspection.sourceId], `${label}.inspection`);
        date(inspection.accessedDate, `${label}.inspection.accessedDate`);
        check(inspection.accessedDate <= review.date, `${label}.inspection: access date follows review`);
        check(["public_webpage", "public_document", "stored_record", "unavailable"].includes(inspection.material), `${label}.inspection: unsupported material`);
        text(inspection.finding, `${label}.inspection.finding`);
        if (["public_webpage", "public_document"].includes(inspection.material)) inspectedIds.add(inspection.sourceId);
      }
      const findings = list(review.findings, `${label}.review.findings`);
      unique(findings.map((finding) => finding?.area), `${label}.review.findings`);
      for (const finding of findings) {
        if (!object(finding, `${label}.finding`, ["area", "note", "sourceIds"])) continue;
        check(scope.includes(finding.area), `${label}.finding: area outside review scope`);
        text(finding.note, `${label}.finding.note`);
        checkSources(finding.sourceIds, `${label}.finding.sources`).forEach((id) => check(inspectedIds.has(id), `${label}.finding: source was not actually inspected`));
      }
      if (review.outcome === "completed") {
        check(AREAS.every((area) => scope.includes(area)) && scope.length === AREAS.length, `${label}: completed review requires all six areas`);
        check(COVERAGE.every((item) => coverage.includes(item)), `${label}: completed review requires assessment, FID, timeline, roles and watchpoints coverage`);
        check(AREAS.every((area) => findings.some((finding) => finding?.area === area)), `${label}: completed review requires a finding for every area`);
        check(inspectedIds.size > 0, `${label}: completed review requires inspected public material`);
      }
    }
    const changes = list(entry.changes, `${label}.changes`);
    unique(changes.map((change) => change?.id), `${label}.changes.id`);
    for (const change of changes) {
      if (!object(change, `${label}.change`, ["id", "date", "kind", "reviewId", "area", "target", "before", "after", "rationale", "sourceIds"])) continue;
      for (const key of ["id", "target", "before", "after", "rationale"]) text(change[key], `${label}.change.${key}`);
      date(change.date, `${label}.change.date`);
      check(["fact", "assessment", "mapping"].includes(change.kind), `${label}.change: unsupported kind`);
      check([...AREAS, "Project"].includes(change.area), `${label}.change: unsupported area`);
      check(change.before !== change.after, `${label}.change: before and after must differ`);
      checkSources(change.sourceIds, `${label}.change.sources`, change.kind !== "mapping");
      const review = reviews.find((review) => review?.id === change.reviewId);
      if (change.kind !== "mapping" || change.reviewId !== null) {
        check(Boolean(review), `${label}.change: unresolved reviewId`);
        if (review) {
          check(change.date === review.date, `${label}.change: change date must match review`);
          (Array.isArray(change.sourceIds) ? change.sourceIds : []).forEach((id) => check((Array.isArray(review.sources) ? review.sources : []).some((source) => source?.sourceId === id && ["public_webpage", "public_document"].includes(source.material)), `${label}.change: source was not inspected in linked review`));
        }
      }
    }
  }
  return errors;
}

function validateRepository(rootDir = process.cwd()) {
  try {
    const read = (name) => JSON.parse(fs.readFileSync(path.join(rootDir, "data", "projects", name), "utf8"));
    return validateEvidenceDataset(read("public-evidence.json"), read("projects.json"));
  } catch (error) { return [`public-evidence: unable to load JSON (${error.message})`]; }
}
if (require.main === module) {
  const errors = validateRepository();
  if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
  else console.log("Project public evidence validation passed.");
}
module.exports = { AREAS, COVERAGE, validateEvidenceDataset, validateRepository };
