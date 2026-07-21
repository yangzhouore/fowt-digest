import weeklyDigestJson from "./weekly_digest.json";

type PipelineDigest = {
  schemaVersion: string;
  runId: string;
  sourceName: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
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
  selectionReason: string;
};

export type DigestEdition = {
  slug: string;
  dateRange: string;
  selectedPaperCount: number;
  generatedAt: string;
  introduction: string;
  papers: DigestPaper[];
};

const digest = validateDigest(weeklyDigestJson);

export const currentDigest: DigestEdition = {
  slug: digest.weekEnd,
  dateRange: formatDateRange(digest.weekStart, digest.weekEnd),
  selectedPaperCount: digest.selectedPapers.length,
  generatedAt: digest.generatedAt,
  introduction: `Selected papers from the deterministic FOWT pipeline for ${formatDateRange(
    digest.weekStart,
    digest.weekEnd,
  )}.`,
  papers: digest.selectedPapers.map(adaptPaper),
};

export function getAllDigests(): DigestEdition[] {
  return [currentDigest];
}

export function getDigestPaperBySlug(slug: string): DigestPaper | undefined {
  return currentDigest.papers.find((paper) => paper.slug === slug);
}

function adaptPaper(paper: PipelinePaper): DigestPaper {
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
    selectionReason: selectionReasonLabel(paper.selectionReason),
  };
}

function validateDigest(value: unknown): PipelineDigest {
  if (!isRecord(value)) {
    throw new Error("weekly_digest.json must be an object");
  }
  const digestValue = value as Partial<PipelineDigest>;
  requiredString(digestValue.schemaVersion, "schemaVersion");
  requiredString(digestValue.runId, "runId");
  requiredString(digestValue.sourceName, "sourceName");
  requiredString(digestValue.weekStart, "weekStart");
  requiredString(digestValue.weekEnd, "weekEnd");
  requiredString(digestValue.generatedAt, "generatedAt");
  if (!Array.isArray(digestValue.selectedPapers)) {
    throw new Error("weekly_digest.json requires selectedPapers");
  }
  digestValue.selectedPapers.forEach(validatePaper);
  return digestValue as PipelineDigest;
}

function validatePaper(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error("weekly_digest.json selectedPapers must contain objects");
  }
  requiredString(value.paperId, "selectedPapers.paperId");
  requiredString(value.title, "selectedPapers.title");
  requiredString(value.publishedDate, "selectedPapers.publishedDate");
  requiredString(value.publicationType, "selectedPapers.publicationType");
  requiredString(value.fullTextAvailability, "selectedPapers.fullTextAvailability");
  requiredString(value.selectionReason, "selectedPapers.selectionReason");
  if (!Array.isArray(value.authors)) {
    throw new Error("weekly_digest.json selectedPapers.authors must be an array");
  }
  if (!Array.isArray(value.topicTags)) {
    throw new Error("weekly_digest.json selectedPapers.topicTags must be an array");
  }
  if (typeof value.rank !== "number" || !Number.isInteger(value.rank)) {
    throw new Error("weekly_digest.json selectedPapers.rank must be an integer");
  }
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`weekly_digest.json requires ${field}`);
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
