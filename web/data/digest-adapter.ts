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
  sourceUrl: string | null;
  topicTags: string[];
  rank: number;
  relevanceAssessment?: {
    classification?: string;
  };
};

export type DigestPaper = {
  id: string;
  number: number;
  title: string;
  authors: string[];
  publicationSource: string;
  publicationType: string;
  publicationDate: string;
  topicTags: string[];
  summary: string;
  sourceUrl: string | null;
  classification: string | null;
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

function adaptPaper(paper: PipelinePaper): DigestPaper {
  return {
    id: paper.paperId,
    number: paper.rank,
    title: paper.title,
    authors: paper.authors,
    publicationSource: paper.publicationSource ?? "Unknown source",
    publicationType: publicationTypeLabel(paper.publicationType),
    publicationDate: paper.publishedDate,
    topicTags: paper.topicTags,
    summary: paper.abstract ?? "No abstract available from the pipeline output.",
    sourceUrl: paper.sourceUrl,
    classification: paper.relevanceAssessment?.classification ?? null,
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
