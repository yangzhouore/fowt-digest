import briefing20260816Json from "./briefings/2026-08-16.json";
import briefing20260809Json from "./briefings/2026-08-09.json";
import briefing20260802Json from "./briefings/2026-08-02.json";
import briefing20260726Json from "./briefings/2026-07-26.json";
import briefing20260719Json from "./briefings/2026-07-19.json";
import briefing20260712Json from "./briefings/2026-07-12.json";
import briefing20260705Json from "./briefings/2026-07-05.json";
import briefing20260628Json from "./briefings/2026-06-28.json";
import briefing20260621Json from "./briefings/2026-06-21.json";
import briefing20260614Json from "./briefings/2026-06-14.json";
import briefing20260607Json from "./briefings/2026-06-07.json";
import briefing20260531Json from "./briefings/2026-05-31.json";
import briefing20260524Json from "./briefings/2026-05-24.json";
import briefing20260517Json from "./briefings/2026-05-17.json";
import briefing20260510Json from "./briefings/2026-05-10.json";
import briefing20260503Json from "./briefings/2026-05-03.json";
import briefing20260426Json from "./briefings/2026-04-26.json";
import briefing20260419Json from "./briefings/2026-04-19.json";
import briefing20260412Json from "./briefings/2026-04-12.json";
import briefing20260405Json from "./briefings/2026-04-05.json";
import briefing20260308Json from "./briefings/2026-03-08.json";
import briefing20260201Json from "./briefings/2026-02-01.json";
import briefing20260111Json from "./briefings/2026-01-11.json";
import briefing20251214Json from "./briefings/2025-12-14.json";
import briefing20251130Json from "./briefings/2025-11-30.json";
import briefing20251123Json from "./briefings/2025-11-23.json";
import briefing20251026Json from "./briefings/2025-10-26.json";
import briefing20251019Json from "./briefings/2025-10-19.json";
import briefing20250921Json from "./briefings/2025-09-21.json";
import briefing20250907Json from "./briefings/2025-09-07.json";
import briefing20250831Json from "./briefings/2025-08-31.json";
import briefing20250817Json from "./briefings/2025-08-17.json";

type SourceType =
  | "government_announcement"
  | "standards_update"
  | "software_release"
  | "company_announcement"
  | "trade_association"
  | "industry_news"
  | "conference_announcement";

type CollectionMethod =
  | "manual"
  | "approved_feed"
  | "approved_api"
  | "approved_scrape";

type BriefingCategory =
  | "project"
  | "policy"
  | "technology"
  | "software"
  | "standards"
  | "supply_chain"
  | "event";

type EngineeringRegion =
  | "Europe"
  | "Asia-Pacific"
  | "North America"
  | "Africa"
  | "Unspecified";

type PipelineEngineeringSourceRecord = {
  sourceRecordId: string;
  sourceType: SourceType;
  publisher: string;
  title: string;
  sourceUrl: string;
  publishedDate: string;
  retrievedAt: string;
  collectionMethod: CollectionMethod;
  sourceText: string;
  licenseNote: string;
};

type PipelineEngineeringBriefingItem = {
  briefingItemId: string;
  title: string;
  oneLineSummary: string;
  category: BriefingCategory;
  region?: EngineeringRegion;
  sourceRecordIds: string[];
  sourceUrl: string;
  explanation: string;
  whyItMatters: string | null;
  engineeringTopics: string[];
};

type PipelineEngineeringBriefing = {
  schemaVersion: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  checkedResultCount?: number;
  sourceRecords: PipelineEngineeringSourceRecord[];
  briefingItems: PipelineEngineeringBriefingItem[];
};

export type EngineeringSourceRecord = {
  id: string;
  sourceType: SourceType;
  publisher: string;
  title: string;
  sourceUrl: string;
  publishedDate: string;
  retrievedAt: string;
  sourceText: string;
  licenseNote: string;
};

export type EngineeringBriefingItem = {
  id: string;
  number: number;
  title: string;
  oneLineSummary: string;
  category: BriefingCategory;
  region: EngineeringRegion | null;
  sourceUrl: string;
  explanation: string;
  whyItMatters: string | null;
  engineeringTopics: string[];
  sourceRecords: EngineeringSourceRecord[];
};

export type EngineeringBriefing = {
  slug: string;
  dateRange: string;
  itemCount: number;
  checkedResultCount: number;
  generatedAt: string;
  sourceRecords: EngineeringSourceRecord[];
  items: EngineeringBriefingItem[];
};

const engineeringBriefingJsonFiles = [
  briefing20260816Json,
  briefing20260809Json,
  briefing20260802Json,
  briefing20260726Json,
  briefing20260719Json,
  briefing20260712Json,
  briefing20260705Json,
  briefing20260628Json,
  briefing20260621Json,
  briefing20260614Json,
  briefing20260607Json,
  briefing20260531Json,
  briefing20260524Json,
  briefing20260517Json,
  briefing20260510Json,
  briefing20260503Json,
  briefing20260426Json,
  briefing20260419Json,
  briefing20260412Json,
  briefing20260405Json,
  briefing20260308Json,
  briefing20260201Json,
  briefing20260111Json,
  briefing20251214Json,
  briefing20251130Json,
  briefing20251123Json,
  briefing20251026Json,
  briefing20251019Json,
  briefing20250921Json,
  briefing20250907Json,
  briefing20250831Json,
  briefing20250817Json,
];

const engineeringBriefings = engineeringBriefingJsonFiles
  .map(validateEngineeringBriefing)
  .map(adaptEngineeringBriefing)
  .sort((a, b) => b.slug.localeCompare(a.slug));

export const currentEngineeringBriefing: EngineeringBriefing = firstBriefing(
  engineeringBriefings,
);

export function getAllEngineeringBriefings(): EngineeringBriefing[] {
  return engineeringBriefings;
}

export function getEngineeringBriefingBySlug(
  slug: string,
): EngineeringBriefing | undefined {
  return engineeringBriefings.find((briefing) => briefing.slug === slug);
}

function firstBriefing(values: EngineeringBriefing[]): EngineeringBriefing {
  const briefing = values[0];
  if (!briefing) {
    throw new Error("at least one engineering briefing JSON file is required");
  }
  return briefing;
}

function adaptEngineeringBriefing(
  briefing: PipelineEngineeringBriefing,
): EngineeringBriefing {
  const sourceRecords = briefing.sourceRecords.map(adaptSourceRecord);
  const sourceById = new Map(sourceRecords.map((source) => [source.id, source]));

  return {
    slug: briefing.weekEnd,
    dateRange: formatDateRange(briefing.weekStart, briefing.weekEnd),
    itemCount: briefing.briefingItems.length,
    checkedResultCount:
      briefing.checkedResultCount ?? briefing.sourceRecords.length,
    generatedAt: briefing.generatedAt,
    sourceRecords,
    items: briefing.briefingItems.map((item, index) => ({
      id: item.briefingItemId,
      number: index + 1,
      title: item.title,
      oneLineSummary: item.oneLineSummary,
      category: item.category,
      region: item.region ?? null,
      sourceUrl: item.sourceUrl,
      explanation: item.explanation,
      whyItMatters: item.whyItMatters,
      engineeringTopics: item.engineeringTopics,
      sourceRecords: item.sourceRecordIds.map((sourceId) => {
        const source = sourceById.get(sourceId);
        if (!source) {
          throw new Error(`engineering briefing item references missing source ${sourceId}`);
        }
        return source;
      }),
    })),
  };
}

function adaptSourceRecord(
  source: PipelineEngineeringSourceRecord,
): EngineeringSourceRecord {
  return {
    id: source.sourceRecordId,
    sourceType: source.sourceType,
    publisher: source.publisher,
    title: source.title,
    sourceUrl: source.sourceUrl,
    publishedDate: source.publishedDate,
    retrievedAt: source.retrievedAt,
    sourceText: source.sourceText,
    licenseNote: source.licenseNote,
  };
}

function validateEngineeringBriefing(value: unknown): PipelineEngineeringBriefing {
  if (!isRecord(value)) {
    throw new Error("engineering briefing JSON must be an object");
  }
  const briefing = value as Partial<PipelineEngineeringBriefing>;
  requiredString(briefing.schemaVersion, "schemaVersion");
  requiredString(briefing.weekStart, "weekStart");
  requiredString(briefing.weekEnd, "weekEnd");
  requiredString(briefing.generatedAt, "generatedAt");
  if (!Array.isArray(briefing.sourceRecords)) {
    throw new Error("engineering briefing JSON requires sourceRecords");
  }
  if (!Array.isArray(briefing.briefingItems)) {
    throw new Error("engineering briefing JSON requires briefingItems");
  }
  briefing.sourceRecords.forEach(validateSourceRecord);
  briefing.briefingItems.forEach(validateBriefingItem);
  return briefing as PipelineEngineeringBriefing;
}

function validateSourceRecord(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error("engineering briefing sourceRecords must contain objects");
  }
  requiredString(value.sourceRecordId, "sourceRecords.sourceRecordId");
  requiredString(value.sourceType, "sourceRecords.sourceType");
  requiredString(value.publisher, "sourceRecords.publisher");
  requiredString(value.title, "sourceRecords.title");
  requiredString(value.sourceUrl, "sourceRecords.sourceUrl");
  requiredString(value.publishedDate, "sourceRecords.publishedDate");
  requiredString(value.retrievedAt, "sourceRecords.retrievedAt");
  requiredString(value.collectionMethod, "sourceRecords.collectionMethod");
  requiredString(value.sourceText, "sourceRecords.sourceText");
  requiredString(value.licenseNote, "sourceRecords.licenseNote");
}

function validateBriefingItem(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error("engineering briefing briefingItems must contain objects");
  }
  requiredString(value.briefingItemId, "briefingItems.briefingItemId");
  requiredString(value.title, "briefingItems.title");
  requiredString(value.oneLineSummary, "briefingItems.oneLineSummary");
  requiredString(value.category, "briefingItems.category");
  requiredString(value.sourceUrl, "briefingItems.sourceUrl");
  requiredString(value.explanation, "briefingItems.explanation");
  if (value.whyItMatters !== null && typeof value.whyItMatters !== "string") {
    throw new Error("briefingItems.whyItMatters must be a string or null");
  }
  if (!Array.isArray(value.sourceRecordIds)) {
    throw new Error("briefingItems.sourceRecordIds must be an array");
  }
  if (!Array.isArray(value.engineeringTopics)) {
    throw new Error("briefingItems.engineeringTopics must be an array");
  }
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`engineering briefing JSON requires ${field}`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
