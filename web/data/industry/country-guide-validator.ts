import type { CountryGuide, CountrySource } from "./country-guide-types";

export function validateCountryGuides(guides: unknown, sources: unknown, today = new Date().toISOString().slice(0, 10)): string[] {
  const errors: string[] = [];
  const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
  const text = (v: unknown) => typeof v === "string" && v.trim().length > 0 && !/\?{3,}|\uFFFD/.test(v);
  const date = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
  const bilingual = (v: unknown, where: string) => { if (!object(v) || !text(v.en) || !text(v.zh)) errors.push(`${where}: bilingual copy missing or damaged`); };
  const sourceIds = new Set<string>();
  const used = new Set<string>();
  if (!Array.isArray(sources)) return ["Sources must be an array"];
  for (const s of sources) {
    if (!object(s)) { errors.push("Invalid source"); continue; }
    if (!text(s.id) || sourceIds.has(String(s.id))) errors.push("Source identity missing or duplicate");
    sourceIds.add(String(s.id));
    for (const key of ["title", "publisher", "jurisdiction", "claimScope"]) if (!text(s[key])) errors.push(`Source ${s.id}: missing ${key}`);
    try { const url = new URL(String(s.url)); if (url.protocol !== "https:" || url.username || url.password) errors.push(`Source ${s.id}: credential-free HTTPS URL required`); } catch { errors.push(`Source ${s.id}: invalid URL`); }
    if (!date(s.reviewedOn) || s.reviewedOn > today) errors.push(`Source ${s.id}: invalid/future review date`);
    if (s.documentDate !== null && (!date(s.documentDate) || s.documentDate > String(s.reviewedOn))) errors.push(`Source ${s.id}: invalid/future document date`);
  }
  const refs = (ids: unknown, where: string) => {
    if (!Array.isArray(ids) || ids.length === 0) { errors.push(`${where}: source-free record`); return; }
    if (new Set(ids).size !== ids.length) errors.push(`${where}: duplicate source reference`);
    for (const id of ids) { if (!sourceIds.has(id)) errors.push(`${where}: missing source ${id}`); used.add(id); }
  };
  if (!Array.isArray(guides) || guides.length !== 3) return [...errors, "Exactly three additional countries required"];
  const slugs = new Set<string>();
  const labels = ["confirmed", "typical", "project", "capability", "research", "changing", "interpretation"];
  for (const g of guides) {
    if (!object(g)) { errors.push("Invalid guide"); continue; }
    const slug = String(g.slug);
    if (!["germany", "norway", "china"].includes(slug) || slugs.has(slug)) errors.push("Country identity missing or duplicate");
    slugs.add(slug);
    for (const key of ["name", "title", "summary", "distinction"]) bilingual(g[key], `${slug}.${key}`);
    if (!date(g.reviewedOn) || g.reviewedOn > today) errors.push(`${slug}: invalid/future review date`);
    if (object(g.comparison)) { for (const key of ["permissions", "connection", "revenue"]) bilingual(g.comparison[key], `${slug}.comparison.${key}`); refs(g.comparison.sourceIds, `${slug}.comparison`); } else errors.push(`${slug}: missing comparison`);
    if (!Array.isArray(g.topics)) { errors.push(`${slug}: missing topics`); continue; }
    if (g.topics.length !== 22 || g.topics.map((t) => object(t) ? t.number : null).join(",") !== Array.from({ length: 22 }, (_, i) => i + 1).join(",")) errors.push(`${slug}: ordered topics 1–22 required`);
    for (const t of g.topics) {
      if (!object(t)) { errors.push(`${slug}: invalid topic`); continue; }
      const where = `${slug}.topic-${t.number}`;
      bilingual(t.title, where); bilingual(t.summary, where);
      refs(t.sourceIds, where);
      if (!Array.isArray(t.kinds) || !t.kinds.length || t.kinds.some((v) => !labels.includes(v))) errors.push(`${where}: invalid evidence label`);
      if (!Array.isArray(t.paragraphs)) errors.push(`${where}: paragraphs required`); else t.paragraphs.forEach((v) => bilingual(v, where));
      if (t.items !== undefined) { if (!Array.isArray(t.items)) errors.push(`${where}: invalid items`); else t.items.forEach((v) => bilingual(v, where)); }
      if (t.table !== undefined) {
        const tb = t.table;
        if (!object(tb) || !Array.isArray(tb.headers) || tb.headers.length < 2 || !Array.isArray(tb.rows) || !tb.rows.length) errors.push(`${where}: invalid table`);
        else {
          tb.headers.forEach((v) => bilingual(v, where));
          const width = tb.headers.length;
          for (const row of tb.rows) { if (!Array.isArray(row) || row.length !== width) errors.push(`${where}: table decision fields mismatch`); else row.forEach((v) => bilingual(v, where)); }
          const expected = ({ 1: 9, 3: 17, 6: 12 } as Record<string, number>)[String(t.number)];
          if (expected && (tb.rows.length !== expected || width !== 5)) errors.push(`${where}: required ${expected} rows and five decision fields`);
        }
      } else if ([1, 3, 6].includes(Number(t.number))) errors.push(`${where}: missing chain/lifecycle/power table`);
      if (t.number === 22 && (!Array.isArray(t.items) || t.items.length !== 15)) errors.push(`${where}: fifteen analysis questions required`);
      if (Array.isArray(t.paragraphs) && !t.paragraphs.length && t.table === undefined && t.items === undefined) errors.push(`${where}: empty topic`);
    }
    if (!Array.isArray(g.roles) || g.roles.length < 12) errors.push(`${slug}: organisation coverage missing`);
    else {
      const identities = new Set();
      for (const r of g.roles) {
        if (!object(r)) { errors.push(`${slug}: invalid organisation`); continue; }
        if (!text(r.id) || !/^[a-z0-9-]+$/.test(String(r.id)) || identities.has(r.id) || !text(r.name)) errors.push(`${slug}: invalid/duplicate organisation identity`);
        identities.add(r.id);
        for (const key of ["category", "delivers", "customer", "boundary"]) bilingual(r[key], `${slug}.role-${r.id}.${key}`);
        if (!["confirmed", "capability", "project", "research"].includes(String(r.kind))) errors.push(`${slug}.role-${r.id}: invalid organisation evidence label`);
        refs(r.sourceIds, `${slug}.role-${r.id}`);
      }
    }
  }
  for (const id of sourceIds) if (!used.has(id)) errors.push(`Unused source ${id}`);
  return errors;
}

export function assertCountryGuides(guides: CountryGuide[], sources: CountrySource[]) {
  const errors = validateCountryGuides(guides, sources);
  if (errors.length) throw new Error(`Country guide validation failed:\n${errors.join("\n")}`);
}
