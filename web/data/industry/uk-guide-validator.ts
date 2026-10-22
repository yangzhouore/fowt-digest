export type GuideLanguage = "en" | "zh";
export type GuideText = Record<GuideLanguage, string>;
export type GuideBlock =
  | { type: "paragraph" | "diagram"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "list"; ordered: boolean; items: string[] };
export type GuideSource = {
  id: string; title: string; publisher: string; url: string;
  documentDate: string | null; reviewedOn: string; jurisdiction: string; supportsTopics: number[]; claimScope: string;
};
export type GuideTopic = {
  id: string; number: number; chapter: string; title: GuideText; kinds: string[];
  sourceIds: string[]; content: Record<GuideLanguage, GuideBlock[]>;
};
export type UKGuide = {
  schemaVersion: "uk-fowt-guide.v1"; reviewedOn: string; scope: string;
  topics: GuideTopic[]; sources: GuideSource[];
  organisationEvidence: { id: string; rowIndex: number; kind: string; sourceIds: string[]; role: GuideText }[];
};

// This runs at page build time as well as in the local acceptance harness.
// It checks evidence references and shape; editorial review checks meaning.
export function validateUKGuide(input: unknown, today = new Date().toISOString().slice(0, 10)): string[] {
  const errors: string[] = [];
  const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
  const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
  const unique = (values: unknown[]) => new Set(values).size === values.length;
  const date = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value && value <= today;
  const check = (condition: unknown, message: string) => { if (!condition) errors.push(message); };
  if (!object(input)) return ["Guide must be an object"];
  check(input.schemaVersion === "uk-fowt-guide.v1", "Unknown guide schema");
  check(date(input.reviewedOn), "Invalid/future guide review date");
  check(text(input.scope), "Missing scope");
  if (!Array.isArray(input.topics) || !Array.isArray(input.sources)) return [...errors, "Topics and sources must be arrays"];
  const sources = new Map<string, Record<string, unknown>>();
  const urls: unknown[] = [];
  for (const source of input.sources) {
    if (!object(source)) { errors.push("Invalid source record"); continue; }
    check(text(source.id) && /^src-[a-f0-9]{12}$/.test(source.id), "Unsafe source ID");
    check(!sources.has(String(source.id)), "Duplicate source ID");
    sources.set(String(source.id), source);
    for (const field of ["title", "publisher", "jurisdiction", "claimScope"]) check(text(source[field]), `Missing source ${field}`);
    try { const url = new URL(String(source.url)); check(url.protocol === "https:" && !url.username && !url.password, "Source URL must be credential-free HTTPS"); } catch { errors.push("Invalid source URL"); }
    urls.push(source.url);
    check(date(source.reviewedOn) && source.reviewedOn <= String(input.reviewedOn), "Invalid source review date");
    check(source.documentDate === null || (date(source.documentDate) && source.documentDate <= String(source.reviewedOn)), "Invalid source document date");
    check(Array.isArray(source.supportsTopics) && source.supportsTopics.length && unique(source.supportsTopics) && source.supportsTopics.every((n) => Number.isInteger(n) && n >= 1 && n <= 22), "Missing/invalid source claim scope");
  }
  check(unique(urls), "Duplicate source URL");
  const cards = input.organisationEvidence;
  check(Array.isArray(cards) && cards.length === 23 && unique(cards.map((card) => object(card) ? card.id : null)), "Retain 23 unique organisation evidence records");
  if (Array.isArray(cards)) for (const [index, card] of cards.entries()) {
    if (!object(card)) { errors.push("Invalid organisation evidence"); continue; }
    check(text(card.id) && /^[a-z]+(?:-[a-z]+)*$/.test(card.id) && card.rowIndex === index, "Invalid organisation identity/order");
    for (const language of ["en", "zh"]) {
      const topic = input.topics.find((topic) => object(topic) && topic.number === 19);
      const blocks = object(topic) && object(topic.content) ? topic.content[language] : undefined;
      const table = Array.isArray(blocks) ? blocks.find((block) => object(block) && block.type === "table") : undefined;
      const row = object(table) && Array.isArray(table.rows) ? table.rows[index] : undefined;
      check(object(card.role) && text(card.role[language]) && Array.isArray(row) && card.role[language] === row[0], "Organisation row and evidence identity must agree in both languages");
    }
    check(["capability", "project", "announcement", "confirmed", "typical", "research"].includes(String(card.kind)), "Invalid organisation evidence kind");
    check(Array.isArray(card.sourceIds) && card.sourceIds.length && unique(card.sourceIds) && card.sourceIds.every((id) => {
      const source = sources.get(id);
      return source && Array.isArray(source.supportsTopics) && source.supportsTopics.includes(19);
    }), "Organisation requires scoped evidence");
  }
  const numbers: unknown[] = [];
  const ids: unknown[] = [];
  for (const topic of input.topics) {
    if (!object(topic)) { errors.push("Invalid topic record"); continue; }
    numbers.push(topic.number); ids.push(topic.id);
    check(topic.id === `uk-topic-${String(topic.number).padStart(2, "0")}`, "Unstable topic ID");
    check(["chain", "machine", "develop", "power", "actors", "risks"].includes(String(topic.chapter)), "Unknown chapter");
    check(object(topic.title) && text(topic.title.en) && text(topic.title.zh), "Missing bilingual title");
    check(Array.isArray(topic.kinds) && topic.kinds.length && unique(topic.kinds) && topic.kinds.every((kind) => ["confirmed", "typical", "project", "changing", "interpretation", "illustrative"].includes(kind)), "Invalid evidence label");
    if (!Array.isArray(topic.sourceIds) || !topic.sourceIds.length) errors.push("Source-free topic");
    else {
      check(unique(topic.sourceIds), "Duplicate topic source reference");
      for (const id of topic.sourceIds) {
        const source = sources.get(id);
        check(source && Array.isArray(source.supportsTopics) && source.supportsTopics.includes(topic.number), "Missing source or unsupported claim scope");
      }
    }
    for (const language of ["en", "zh"]) {
      const content = object(topic.content) ? topic.content[language] : undefined;
      if (!Array.isArray(content) || !content.length) { errors.push("Missing bilingual content"); continue; }
      if (topic.number === 3) check(content.some((block) => object(block) && block.type === "table"), "Missing lifecycle decision table");
      if (topic.number === 6) check(content.some((block) => object(block) && block.type === "table"), "Missing physical power route");
      for (const block of content) {
        if (!object(block)) { errors.push("Invalid content block"); continue; }
        const strings = block.type === "table" && Array.isArray(block.rows) && Array.isArray(block.headers)
          ? [...block.headers, ...block.rows.flatMap((row) => Array.isArray(row) ? row : [])]
          : block.type === "list" && Array.isArray(block.items) ? block.items : [block.text];
        for (const value of strings.filter(text)) {
          check(!/\?{3,}|\uFFFD/.test(value), "Corrupted content encoding");
          for (const match of value.matchAll(/\]\((https:\/\/[^)]+)\)/g)) check(Array.isArray(topic.sourceIds) && topic.sourceIds.some((id) => sources.get(id)?.url === match[1]), "Inline source outside topic evidence");
        }
        if (block.type === "paragraph" || block.type === "diagram") {
          check(text(block.text), "Empty content block");
        } else if (block.type === "table") {
          const headers = block.headers;
          check(Array.isArray(headers) && headers.length && headers.every(text), "Invalid table headers");
          check(Array.isArray(block.rows) && block.rows.length && block.rows.every((row) => Array.isArray(row) && Array.isArray(headers) && row.length === headers.length && row.every(text)), "Invalid/ragged table");
          if (topic.number === 3) check(Array.isArray(block.rows) && block.rows.length === 17 && Array.isArray(headers) && headers.length === 5, "Lifecycle must retain 17 stages and all decision fields");
          if (topic.number === 6) check(Array.isArray(block.rows) && block.rows.length === 12, "Power route must retain all 12 grouped steps");
        } else if (block.type === "list") check(typeof block.ordered === "boolean" && Array.isArray(block.items) && block.items.length && block.items.every(text), "Invalid list");
        else errors.push("Unknown block type");
      }
      if (topic.number === 22) check(content.some((block) => object(block) && block.type === "list" && Array.isArray(block.items) && block.items.length === 15), "Retain 15 analysis questions");
    }
  }
  check(input.topics.length === 22 && unique(ids) && numbers.every((number, index) => number === index + 1), "Guide must cover exactly topics 1–22 in order");
  for (const id of sources.keys()) check(input.topics.some((topic) => object(topic) && Array.isArray(topic.sourceIds) && topic.sourceIds.includes(id)), `Unused source ${id}`);
  return errors;
}

export function assertUKGuide(input: unknown): asserts input is UKGuide {
  const errors = validateUKGuide(input);
  if (errors.length) throw new Error(`UK Industry guide validation failed:\n${errors.join("\n")}`);
}
