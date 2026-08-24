import digest20260823Json from "./digests/2026-08-23.json";
import digest20260816Json from "./digests/2026-08-16.json";
import digest20260809Json from "./digests/2026-08-09.json";
import digest20260802Json from "./digests/2026-08-02.json";
import digest20260726Json from "./digests/2026-07-26.json";
import digest20260719Json from "./digests/2026-07-19.json";
import digest20260712Json from "./digests/2026-07-12.json";
import digest20260705Json from "./digests/2026-07-05.json";
import digest20260628Json from "./digests/2026-06-28.json";
import digest20260621Json from "./digests/2026-06-21.json";
import digest20260614Json from "./digests/2026-06-14.json";
import digest20260607Json from "./digests/2026-06-07.json";
import digest20260531Json from "./digests/2026-05-31.json";
import digest20260524Json from "./digests/2026-05-24.json";
import digest20260517Json from "./digests/2026-05-17.json";
import digest20260510Json from "./digests/2026-05-10.json";
import digest20260503Json from "./digests/2026-05-03.json";
import digest20260426Json from "./digests/2026-04-26.json";
import digest20260419Json from "./digests/2026-04-19.json";
import digest20260412Json from "./digests/2026-04-12.json";
import digest20260405Json from "./digests/2026-04-05.json";
import digest20260315Json from "./digests/2026-03-15.json";
import digest20260118Json from "./digests/2026-01-18.json";
import digest20251221Json from "./digests/2025-12-21.json";
import digest20251116Json from "./digests/2025-11-16.json";
import digest20250921Json from "./digests/2025-09-21.json";
import digest20250720Json from "./digests/2025-07-20.json";
import digest20250615Json from "./digests/2025-06-15.json";
import digest20250518Json from "./digests/2025-05-18.json";
import digest20250420Json from "./digests/2025-04-20.json";
import digest20250316Json from "./digests/2025-03-16.json";
import digest20250216Json from "./digests/2025-02-16.json";
import digest20250119Json from "./digests/2025-01-19.json";


type PipelineDigest = {
  schemaVersion: string;
  runId: string;
  sourceName: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  checkedResultCount?: number;
  selectedPapers: PipelinePaper[];
};

type PipelinePaper = {
  paperId: string;
  title: string;
  authors: string[];
  abstract: string | null;
  publicationSource: string | null;
  publicationType: string;
  publishedDate: string;
  doi: string | null;
  sourceUrl: string | null;
  openAccessStatus: string | null;
  fullTextAvailability: string;
  topicTags: string[];
  rank: number;
  selectionReason: string;
  relevanceAssessment?: {
    classification?: string;
    confidence?: number;
    reason?: string;
    evidenceBasis?: string[];
  };
};

export type DigestPaper = {
  id: string;
  slug: string;
  number: number;
  title: string;
  authors: string[];
  publicationSource: string;
  publicationType: string;
  publicationDate: string;
  doi: string | null;
  topicTags: string[];
  abstract: string | null;
  summary: string;
  sourceUrl: string | null;
  openAccessStatus: string | null;
  fullTextAvailability: string;
  classification: string | null;
  classificationConfidence: number | null;
  classificationReason: string | null;
  evidenceBasis: string[];
  selectionReason: string;
  selectionScore: number | null;
};

export type DigestEdition = {
  slug: string;
  dateRange: string;
  selectedPaperCount: number;
  checkedResultCount: number;
  generatedAt: string;
  introduction: string;
  papers: DigestPaper[];
};

export type DigestPaperResult = {
  edition: DigestEdition;
  paper: DigestPaper;
};

const digestJsonFiles = [
  digest20260823Json,
  digest20260816Json,
  digest20260809Json,
  digest20260802Json,
  digest20260726Json,
  digest20260719Json,
  digest20260712Json,
  digest20260705Json,
  digest20260628Json,
  digest20260621Json,
  digest20260614Json,
  digest20260607Json,
  digest20260531Json,
  digest20260524Json,
  digest20260517Json,
  digest20260510Json,
  digest20260503Json,
  digest20260426Json,
  digest20260419Json,
  digest20260412Json,
  digest20260405Json,
  digest20260315Json,
  digest20260118Json,
  digest20251221Json,
  digest20251116Json,
  digest20250921Json,
  digest20250720Json,
  digest20250615Json,
  digest20250518Json,
  digest20250420Json,
  digest20250316Json,
  digest20250216Json,
  digest20250119Json,
];

const digests = digestJsonFiles
  .map(validateDigest)
  .map(adaptDigest)
  .sort((a, b) => b.slug.localeCompare(a.slug));

export const currentDigest: DigestEdition = firstDigest(digests);

export function getAllDigests(): DigestEdition[] {
  return digests;
}

export function getAllDigestPaperResults(): DigestPaperResult[] {
  return digests.flatMap((edition) =>
    edition.papers.map((paper) => ({ edition, paper })),
  );
}

function firstDigest(values: DigestEdition[]): DigestEdition {
  const digest = values[0];
  if (!digest) {
    throw new Error("at least one weekly digest JSON file is required");
  }
  return digest;
}

export function getDigestBySlug(slug: string): DigestEdition | undefined {
  return digests.find((digest) => digest.slug === slug);
}

export function getDigestPaperBySlug(slug: string): DigestPaper | undefined {
  return getDigestPaperWithEditionBySlug(slug)?.paper;
}

export function getDigestPaperWithEditionBySlug(
  slug: string,
): DigestPaperResult | undefined {
  for (const edition of digests) {
    const paper = edition.papers.find((candidate) => candidate.slug === slug);
    if (paper) {
      return { edition, paper };
    }
  }

  return undefined;
}

function adaptDigest(digest: PipelineDigest): DigestEdition {
  const dateRange = formatDateRange(digest.weekStart, digest.weekEnd);

  return {
    slug: digest.weekEnd,
    dateRange,
    selectedPaperCount: digest.selectedPapers.length,
    checkedResultCount: digest.checkedResultCount ?? digest.selectedPapers.length,
    generatedAt: digest.generatedAt,
    introduction: `Selected papers from the deterministic FOWT pipeline for ${dateRange}.`,
    papers: digest.selectedPapers.map((paper) =>
      adaptPaper(paper, digest.checkedResultCount ?? digest.selectedPapers.length),
    ),
  };
}

function adaptPaper(paper: PipelinePaper, candidateCount: number): DigestPaper {
  const abstract = paper.abstract;

  return {
    id: paper.paperId,
    slug: slugFromPaperId(paper.paperId),
    number: paper.rank,
    title: paper.title,
    authors: paper.authors,
    publicationSource: paper.publicationSource ?? "Unknown source",
    publicationType: publicationTypeLabel(paper.publicationType),
    publicationDate: paper.publishedDate,
    doi: paper.doi,
    topicTags: paper.topicTags,
    abstract,
    summary: abstract ?? "No abstract available.",
    sourceUrl: paper.sourceUrl,
    openAccessStatus: paper.openAccessStatus,
    fullTextAvailability: fullTextAvailabilityLabel(paper.fullTextAvailability),
    classification: paper.relevanceAssessment?.classification ?? null,
    classificationConfidence: paper.relevanceAssessment?.confidence ?? null,
    classificationReason: classificationReasonLabel(paper.relevanceAssessment?.reason ?? null),
    evidenceBasis: paper.relevanceAssessment?.evidenceBasis ?? [],
    selectionReason: selectionReasonLabel(paper.selectionReason),
    selectionScore: selectionScoreFromRank(paper.rank, candidateCount),
  };
}

function validateDigest(value: unknown): PipelineDigest {
  if (!isRecord(value)) {
    throw new Error("weekly digest JSON must be an object");
  }
  const digestValue = value as Partial<PipelineDigest>;
  requiredString(digestValue.schemaVersion, "schemaVersion");
  requiredString(digestValue.runId, "runId");
  requiredString(digestValue.sourceName, "sourceName");
  requiredString(digestValue.weekStart, "weekStart");
  requiredString(digestValue.weekEnd, "weekEnd");
  requiredString(digestValue.generatedAt, "generatedAt");
  if (!Array.isArray(digestValue.selectedPapers)) {
    throw new Error("weekly digest JSON requires selectedPapers");
  }
  digestValue.selectedPapers.forEach(validatePaper);
  return digestValue as PipelineDigest;
}

function validatePaper(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error("weekly digest JSON selectedPapers must contain objects");
  }
  requiredString(value.paperId, "selectedPapers.paperId");
  requiredString(value.title, "selectedPapers.title");
  requiredString(value.publishedDate, "selectedPapers.publishedDate");
  requiredString(value.publicationType, "selectedPapers.publicationType");
  requiredString(value.fullTextAvailability, "selectedPapers.fullTextAvailability");
  requiredString(value.selectionReason, "selectedPapers.selectionReason");
  if (!Array.isArray(value.authors)) {
    throw new Error("weekly digest JSON selectedPapers.authors must be an array");
  }
  if (!Array.isArray(value.topicTags)) {
    throw new Error("weekly digest JSON selectedPapers.topicTags must be an array");
  }
  if (typeof value.rank !== "number" || !Number.isInteger(value.rank)) {
    throw new Error("weekly digest JSON selectedPapers.rank must be an integer");
  }
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`weekly digest JSON requires ${field}`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function slugFromPaperId(paperId: string): string {
  return paperId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function publicationTypeLabel(value: string): string {
  if (value === "journal") {
    return "Journal paper";
  }
  if (value === "conference") {
    return "Conference paper";
  }
  if (value === "preprint") {
    return "Preprint";
  }
  return "Unknown type";
}

function fullTextAvailabilityLabel(value: string): string {
  if (value === "full_text_available") {
    return "Full text available";
  }
  if (value === "abstract_only") {
    return "Abstract only";
  }
  if (value === "none") {
    return "No full text or abstract available";
  }
  return value;
}

function selectionReasonLabel(value: string): string {
  if (value === "selected_within_limit") {
    return "Selected within limit";
  }
  if (value === "not_selected_below_limit") {
    return "Not selected below limit";
  }
  if (value === "not_selected_not_relevant") {
    return "Not selected because not relevant";
  }
  return value;
}

function classificationReasonLabel(value: string | null): string | null {
  if (value === "relevant_title_fowt_phrase") {
    return "FOWT phrase in title";
  }
  if (value === "relevant_topic_fowt_phrase") {
    return "FOWT phrase in topic tags";
  }
  if (value === "relevant_title_combined_fowt_signals") {
    return "Floating and wind signals in title";
  }
  if (value === "possibly_relevant_abstract_only_fowt_phrase") {
    return "FOWT phrase in abstract";
  }
  if (value === "possibly_relevant_combined_weak_signals") {
    return "Combined floating and wind signals";
  }
  if (value === "possibly_relevant_offshore_wind_only") {
    return "Offshore wind signal only";
  }
  if (value === "not_relevant_no_fowt_signals") {
    return "No FOWT signal found";
  }
  return value;
}

function selectionScoreFromRank(rank: number, candidateCount: number): number | null {
  if (!Number.isInteger(rank) || !Number.isInteger(candidateCount) || candidateCount < 1) {
    return null;
  }
  if (rank < 1 || rank > candidateCount) {
    return null;
  }
  if (candidateCount === 1) {
    return 100;
  }
  return Math.round(((candidateCount - rank) / (candidateCount - 1)) * 100);
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
