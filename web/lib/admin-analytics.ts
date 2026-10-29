import "server-only";

type RecordValue = Record<string, unknown>;
export type TrafficRow = { label: string; views: number; visitors: number };
export type Report = { status: string; totals: { views: number; visitors: number }; trend: TrafficRow[]; pages: TrafficRow[]; referrers: TrafficRow[]; countries: TrafficRow[]; clones?: { views: number; visitors: number }; cloneTrend?: TrafficRow[] };
export type Source = { report?: Report; error?: string };
const object = (value: unknown): RecordValue => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("schema");
  return value as RecordValue;
};
const count = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw Error("schema");
  return value;
};
// Provider labels can contain arbitrary user input. Discard IP-like text even in paths.
export function safeLabel(value: unknown, kind: "path" | "host" | "country" | "day"): string {
  if (typeof value !== "string") return "Unknown";
  let label = value.slice(0, 300).replace(/[\u0000-\u001f\u007f]/g, "");
  try { label = decodeURIComponent(label); } catch { return "Redacted"; }
  if (kind === "day") return /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/.test(label) && Number.isFinite(Date.parse(label)) ? label.slice(0, 10) : "Unknown";
  if (/\d{1,3}(?:\.\d{1,3}){3}|(?:[a-f\d]{0,4}:){2,}/i.test(label)) return "Redacted";
  if (kind === "country") return /^[A-Z]{2}$/.test(label) ? label : "Unknown / Others";
  label = label.split(/[?#]/)[0];
  if (kind === "path") return label.startsWith("/") && !label.startsWith("//") ? label : "Others";
  return /^[a-z\d ._-]+$/i.test(label) ? label || "Direct / Unknown" : "Redacted";
}
function rows(value: unknown, key: string, kind: Parameters<typeof safeLabel>[1], github = false): TrafficRow[] {
  if (!Array.isArray(value)) throw Error("schema");
  return value.slice(0, kind === "day" ? 31 : 11).map((item) => {
    const row = object(item);
    return { label: safeLabel(row[key], kind), views: count(row[github ? "count" : "pageviews"]), visitors: count(row[github ? "uniques" : "visitors"]) };
  });
}
const ghTotals = (value: unknown) => { const row = object(value); return { views: count(row.count), visitors: count(row.uniques) }; };
export function normalizeGitHub(views: unknown, clones: unknown, referrers: unknown, paths: unknown): Report {
  return { status: "GitHub · trailing 14 days (UTC)", totals: ghTotals(views), clones: ghTotals(clones),
    trend: rows(object(views).views, "timestamp", "day", true), cloneTrend: rows(object(clones).clones, "timestamp", "day", true),
    pages: rows(paths, "path", "path", true), referrers: rows(referrers, "referrer", "host", true), countries: [] };
}
export function normalizeVercel(total: unknown, trend: unknown, pages: unknown, referrers: unknown, countries: unknown): Report {
  const data = object(total).data;
  if (!Array.isArray(data) || data.length !== 1 || object(data[0]).environment !== "production") throw Error("schema");
  const row = object(data[0]);
  return { status: "Vercel · production · selected UTC calendar days", totals: { views: count(row.pageviews), visitors: count(row.visitors) },
    trend: rows(object(trend).data, "timestamp", "day"), pages: rows(object(pages).data, "requestPath", "path"),
    referrers: rows(object(referrers).data, "referrerHostname", "host"), countries: rows(object(countries).data, "country", "country") };
}
async function query(url: URL, token: string, github: boolean, fetcher: typeof fetch) {
  const response = await fetcher(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000), headers: {
    Authorization: `Bearer ${token}`, Accept: "application/json", ...(github ? { "X-GitHub-Api-Version": "2026-03-10", "User-Agent": "FOWT-owner-analytics" } : {}),
  } });
  if (!response.ok) throw Error(response.status === 429 || (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") ? "rate" : response.status === 400 ? "range" : "access");
  return response.json();
}
function unavailable(error: unknown): Source {
  const reason = error instanceof Error ? error.message : "";
  return { error: reason === "rate" ? "Provider rate limit reached. Try again later." : reason === "range" ? "Requested range is unavailable for this account or provider." : reason === "schema" ? "Provider returned an unsupported analytics format or no production aggregate." : "Analytics unavailable. Check service availability, token permissions, project settings and reporting window." };
}
export function websiteDays(value: unknown): 7 | 14 | 30 | null { return value === undefined ? 7 : value === "7" ? 7 : value === "14" ? 14 : value === "30" ? 30 : null; }
export async function loadVercel(days: number | null, env = process.env, fetcher = fetch, now = new Date()): Promise<Source> {
  if (days === null || ![7, 14, 30].includes(days)) return { error: "Unsupported website range. Choose 7, 14 or 30 days." };
  if (!env.VERCEL_TOKEN || !env.VERCEL_PROJECT_ID) return { error: "Vercel unavailable: configure VERCEL_TOKEN and VERCEL_PROJECT_ID, enable Web Analytics and verify existing collection." };
  try {
    const since = new Date(now); since.setUTCHours(0, 0, 0, 0); since.setUTCDate(since.getUTCDate() - days + 1);
    const payloads = await Promise.all(["environment", "day", "requestPath", "referrerHostname", "country"].map((by) => {
      const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/aggregate");
      for (const [key, value] of Object.entries({ projectId: env.VERCEL_PROJECT_ID!, by, since: since.toISOString(), until: now.toISOString(), limit: by === "day" ? "31" : "10", filter: "environment eq 'production' and not startswith(requestPath, '/admin')" })) url.searchParams.set(key, value);
      if (env.VERCEL_TEAM_ID) url.searchParams.set("teamId", env.VERCEL_TEAM_ID);
      return query(url, env.VERCEL_TOKEN!, false, fetcher);
    }));
    return { report: normalizeVercel(...payloads as [unknown, unknown, unknown, unknown, unknown]) };
  } catch (error) { return unavailable(error); }
}
export async function loadGitHub(env = process.env, fetcher = fetch): Promise<Source> {
  if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) return { error: "GitHub unavailable: configure GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO with repository traffic access." };
  if (![env.GITHUB_OWNER, env.GITHUB_REPO].every((name) => /^[a-z\d_.-]+$/i.test(name))) return { error: "GitHub repository identifiers are invalid." };
  try {
    const payloads = await Promise.all(["views?per=day", "clones?per=day", "popular/referrers", "popular/paths"].map((path) => query(new URL(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/traffic/${path}`), env.GITHUB_TOKEN!, true, fetcher)));
    return { report: normalizeGitHub(...payloads as [unknown, unknown, unknown, unknown]) };
  } catch (error) { return unavailable(error); }
}
