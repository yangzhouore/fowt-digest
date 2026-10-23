export type Copy = { en: string; zh: string };
export type EvidenceKind = "confirmed" | "typical" | "project" | "capability" | "research" | "changing" | "interpretation";
export type CountrySource = {
  id: string; title: string; publisher: string; url: string; jurisdiction: string;
  documentDate: string | null; reviewedOn: string; claimScope: string;
};
export type CountryTable = { headers: Copy[]; rows: Copy[][] };
export type CountryTopic = {
  number: number; title: Copy; summary: Copy; kinds: EvidenceKind[];
  paragraphs: Copy[]; sourceIds: string[]; table?: CountryTable; items?: Copy[];
};
export type CountryRole = {
  id: string; name: string; category: Copy; delivers: Copy; customer: Copy;
  boundary: Copy; kind: EvidenceKind; sourceIds: string[];
};
export type CountryGuide = {
  slug: "germany" | "norway" | "china"; name: Copy; title: Copy; summary: Copy;
  distinction: Copy; reviewedOn: string; topics: CountryTopic[]; roles: CountryRole[];
  comparison: { permissions: Copy; connection: Copy; revenue: Copy; sourceIds: string[] };
};
export const copy = (en: string, zh: string): Copy => ({ en, zh });
