import { getIndustryCompanies } from "../data/industry/industry-map";

export type Locale = "en" | "zh";
export type Preferences = { news: boolean; research: boolean; companyIds: string[] };
export type PreferenceError = "selection" | "companyRequired" | "invalid";
export const productTitles = {
  news: { en: "Weekly News Digest", zh: "每周新闻摘要" },
  research: { en: "Weekly Research Digest", zh: "每周研究摘要" },
  company: { en: "Company Brief", zh: "企业简报" },
};

const companies = getIndustryCompanies().map(({ id, name }) => ({ id, name }))
  .sort((left, right) => left.name.localeCompare(right.name, "en") || left.id.localeCompare(right.id, "en"));
const companyIds = new Set(companies.map(({ id }) => id));

export function subscriptionCompanies() {
  return companies;
}

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  const parts = email.split("@");
  if (parts.length !== 2 || email.length > 254) return null;
  const [local, domain] = parts;
  if (local.length > 64 || !/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(local)) return null;
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(domain)) return null;
  return email;
}

export function validatePreferences(input: Record<string, unknown>): Preferences | PreferenceError {
  const { news, research, company, companies: selected } = input;
  if (typeof news !== "boolean" || typeof research !== "boolean" || typeof company !== "boolean" ||
      !Array.isArray(selected) || selected.length > companyIds.size ||
      selected.some((id) => typeof id !== "string" || !companyIds.has(id))) return "invalid";
  if (!company && selected.length) return "invalid";
  if (company && !selected.length) return "companyRequired";
  if (!news && !research && !company) return "selection";
  return { news, research, companyIds: [...new Set<string>(selected)].sort() };
}
