import briefing20260823Json from "./briefings/2026-08-23.json";
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

type PipelineEngineeringScoreComponent = {
  componentId: string;
  label: string;
  score: number;
  maxScore: number;
  evidence: string[];
};

type PipelineEngineeringSelectionScore = {
  modelId: string;
  total: number;
  maxScore: number;
  components: PipelineEngineeringScoreComponent[];
};

type PipelineEngineeringCandidate = {
  candidateId: string;
  sourceRecordId: string;
  selected: boolean;
  selectedBriefingItemId: string | null;
  rawRank: number;
  finalRank: number | null;
  selectionReason: string;
  diversityReason: string | null;
  engineeringSelectionScore: PipelineEngineeringSelectionScore;
  diversitySignals: {
    publisher: string;
    projectGroup: string | null;
    topicGroup: string;
    regionHint: EngineeringRegion;
  };
};

type PipelineEngineeringSelection = {
  candidatePoolType: string;
  selectionModel: {
    id: string;
    label: string;
    description: string;
    components: Array<{ componentId: string; label: string; maxScore: number }>;
    diversityRules: string[];
  };
  candidates: PipelineEngineeringCandidate[];
};

type PipelineEngineeringBriefing = {
  schemaVersion: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  checkedResultCount?: number;
  sourceRecords: PipelineEngineeringSourceRecord[];
  briefingItems: PipelineEngineeringBriefingItem[];
  engineeringSelection?: PipelineEngineeringSelection;
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

export type EngineeringSelectionScoreComponent = {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  evidence: string[];
};

export type EngineeringSelectionScore = {
  total: number;
  maxScore: number;
  components: EngineeringSelectionScoreComponent[];
};

export type EngineeringSourceCandidate = {
  id: string;
  sourceRecord: EngineeringSourceRecord;
  selected: boolean;
  selectedBriefingItemId: string | null;
  rawRank: number;
  finalRank: number | null;
  selectionReason: string;
  diversityReason: string | null;
  score: EngineeringSelectionScore;
  diversitySignals: {
    publisher: string;
    projectGroup: string | null;
    topicGroup: string;
    regionHint: EngineeringRegion;
  };
};

export type EngineeringSelectionModel = PipelineEngineeringSelection["selectionModel"];

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
  selectionScore: EngineeringSelectionScore | null;
  selectionReason: string | null;
  diversityReason: string | null;
  rawRank: number | null;
  finalRank: number | null;
};

export type EngineeringBriefing = {
  slug: string;
  dateRange: string;
  itemCount: number;
  checkedResultCount: number;
  generatedAt: string;
  sourceRecords: EngineeringSourceRecord[];
  items: EngineeringBriefingItem[];
  selectionModel: EngineeringSelectionModel | null;
  sourceCandidates: EngineeringSourceCandidate[];
};

const engineeringBriefingJsonFiles = [
  briefing20260823Json,
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
  const sourceCandidates = adaptSourceCandidates(briefing.engineeringSelection, sourceById);
  const candidateByItemId = new Map(
    sourceCandidates
      .filter((candidate) => candidate.selectedBriefingItemId !== null)
      .map((candidate) => [candidate.selectedBriefingItemId, candidate]),
  );

  return {
    slug: briefing.weekEnd,
    dateRange: formatDateRange(briefing.weekStart, briefing.weekEnd),
    itemCount: briefing.briefingItems.length,
    checkedResultCount:
      briefing.checkedResultCount ?? briefing.sourceRecords.length,
    generatedAt: briefing.generatedAt,
    sourceRecords,
    items: briefing.briefingItems.map((item, index) => {
      const candidate = candidateByItemId.get(item.briefingItemId);
      return {
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
        selectionScore: candidate?.score ?? null,
        selectionReason: candidate?.selectionReason ?? null,
        diversityReason: candidate?.diversityReason ?? null,
        rawRank: candidate?.rawRank ?? null,
        finalRank: candidate?.finalRank ?? null,
      };
    }),
    selectionModel: briefing.engineeringSelection?.selectionModel ?? null,
    sourceCandidates,
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

function adaptSourceCandidates(
  selection: PipelineEngineeringSelection | undefined,
  sourceById: Map<string, EngineeringSourceRecord>,
): EngineeringSourceCandidate[] {
  if (!selection) {
    return [];
  }
  return selection.candidates.map((candidate) => {
    const source = sourceById.get(candidate.sourceRecordId);
    if (!source) {
      throw new Error(`engineering candidate references missing source ${candidate.sourceRecordId}`);
    }
    return {
      id: candidate.candidateId,
      sourceRecord: source,
      selected: candidate.selected,
      selectedBriefingItemId: candidate.selectedBriefingItemId,
      rawRank: candidate.rawRank,
      finalRank: candidate.finalRank,
      selectionReason: selectionReasonLabel(candidate.selectionReason),
      diversityReason: candidate.diversityReason,
      score: adaptSelectionScore(candidate.engineeringSelectionScore),
      diversitySignals: candidate.diversitySignals,
    };
  });
}

function adaptSelectionScore(
  score: PipelineEngineeringSelectionScore,
): EngineeringSelectionScore {
  return {
    total: score.total,
    maxScore: score.maxScore,
    components: score.components.map((component) => ({
      id: component.componentId,
      label: component.label,
      score: component.score,
      maxScore: component.maxScore,
      evidence: component.evidence,
    })),
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
  if (briefing.engineeringSelection !== undefined) {
    validateEngineeringSelection(briefing.engineeringSelection);
  }
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

function validateEngineeringSelection(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error("engineeringSelection must be an object");
  }
  requiredString(value.candidatePoolType, "engineeringSelection.candidatePoolType");
  if (!isRecord(value.selectionModel)) {
    throw new Error("engineeringSelection requires selectionModel");
  }
  requiredString(value.selectionModel.id, "engineeringSelection.selectionModel.id");
  requiredString(value.selectionModel.label, "engineeringSelection.selectionModel.label");
  requiredString(value.selectionModel.description, "engineeringSelection.selectionModel.description");
  if (!Array.isArray(value.selectionModel.components)) {
    throw new Error("engineeringSelection selectionModel.components must be an array");
  }
  if (!Array.isArray(value.selectionModel.diversityRules)) {
    throw new Error("engineeringSelection selectionModel.diversityRules must be an array");
  }
  if (!Array.isArray(value.candidates)) {
    throw new Error("engineeringSelection candidates must be an array");
  }
  value.candidates.forEach(validateEngineeringCandidate);
}

function validateEngineeringCandidate(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error("engineeringSelection candidates must contain objects");
  }
  requiredString(value.candidateId, "engineeringSelection.candidates.candidateId");
  requiredString(value.sourceRecordId, "engineeringSelection.candidates.sourceRecordId");
  requiredString(value.selectionReason, "engineeringSelection.candidates.selectionReason");
  if (typeof value.selected !== "boolean") {
    throw new Error("engineeringSelection candidates selected must be boolean");
  }
  if (typeof value.rawRank !== "number" || !Number.isInteger(value.rawRank) || value.rawRank < 1) {
    throw new Error("engineeringSelection candidates rawRank must be a positive integer");
  }
  if (
    value.finalRank !== null &&
    (typeof value.finalRank !== "number" || !Number.isInteger(value.finalRank) || value.finalRank < 1)
  ) {
    throw new Error("engineeringSelection candidates finalRank must be a positive integer or null");
  }
  if (value.selectedBriefingItemId !== null && typeof value.selectedBriefingItemId !== "string") {
    throw new Error("engineeringSelection selectedBriefingItemId must be a string or null");
  }
  if (value.diversityReason !== null && typeof value.diversityReason !== "string") {
    throw new Error("engineeringSelection diversityReason must be a string or null");
  }
  if (!isRecord(value.engineeringSelectionScore)) {
    throw new Error("engineeringSelection candidates require engineeringSelectionScore");
  }
  validateSelectionScore(value.engineeringSelectionScore);
  if (!isRecord(value.diversitySignals)) {
    throw new Error("engineeringSelection candidates require diversitySignals");
  }
}

function validateSelectionScore(value: Record<string, unknown>): void {
  requiredString(value.modelId, "engineeringSelectionScore.modelId");
  if (
    typeof value.total !== "number" ||
    !Number.isInteger(value.total) ||
    value.total < 0 ||
    value.total > 100 ||
    value.maxScore !== 100
  ) {
    throw new Error("engineeringSelectionScore requires integer total 0-100 and maxScore 100");
  }
  if (!Array.isArray(value.components)) {
    throw new Error("engineeringSelectionScore components must be an array");
  }
  value.components.forEach(validateSelectionScoreComponent);
}

function validateSelectionScoreComponent(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error("engineeringSelectionScore components must contain objects");
  }
  requiredString(value.componentId, "engineeringSelectionScore.components.componentId");
  requiredString(value.label, "engineeringSelectionScore.components.label");
  if (
    typeof value.score !== "number" ||
    !Number.isInteger(value.score) ||
    typeof value.maxScore !== "number" ||
    !Number.isInteger(value.maxScore) ||
    value.score < 0 ||
    value.maxScore < 1 ||
    value.score > value.maxScore
  ) {
    throw new Error("engineeringSelectionScore component has invalid bounds");
  }
  if (!Array.isArray(value.evidence)) {
    throw new Error("engineeringSelectionScore component evidence must be an array");
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

function selectionReasonLabel(value: string): string {
  if (value === "selected_after_diversity") {
    return "Selected after diversity review";
  }
  if (value === "not_selected_after_diversity") {
    return "Not selected after diversity review";
  }
  if (value === "not_selected_below_diversity_limit") {
    return "Not selected below diversity limit";
  }
  return value;
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
