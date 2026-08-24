import researchCandidates20260823Json from "./research-candidates/2026-08-23.json";
import researchCandidates20260809Json from "./research-candidates/2026-08-09.json";
import researchCandidates20260802Json from "./research-candidates/2026-08-02.json";
import researchCandidates20260726Json from "./research-candidates/2026-07-26.json";
import researchCandidates20260719Json from "./research-candidates/2026-07-19.json";


type PipelineResearchCandidatePool = {
  schemaVersion: string;
  candidateType: string;
  runId: string;
  sourceName: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  selectionLimit: number;
  candidateCount: number;
  scoreModel: {
    id: string;
    label: string;
    description: string;
    components?: PipelineScoreModelComponent[];
  };
  candidates: PipelineResearchCandidate[];
};

type PipelineResearchCandidate = {
  candidateId: string;
  rank: number;
  selected: boolean;
  selectionReason: string;
  title: string;
  authors: string[];
  publicationSource: string | null;
  publicationType: string;
  publishedDate: string;
  doi: string | null;
  sourceUrl: string | null;
  topicTags: string[];
  classification: string | null;
  classificationConfidence: number | null;
  classificationReason: string | null;
  evidenceBasis: string[];
  selectionScore: number;
  scoreComponents: PipelineSelectionScoreComponent[];
};

type PipelineScoreModelComponent = {
  componentId: string;
  label: string;
  maxScore: number;
};

type PipelineSelectionScoreComponent = {
  componentId: string;
  label: string;
  score: number;
  maxScore: number;
  evidence: string[];
};

export type ResearchSelectionScoreComponent = {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  evidence: string[];
};
export type ResearchCandidatePool = {
  slug: string;
  dateRange: string;
  runId: string;
  sourceName: string;
  generatedAt: string;
  selectionLimit: number;
  candidateCount: number;
  scoreModel: {
    id: string;
    label: string;
    description: string;
    components?: PipelineScoreModelComponent[];
  };
  candidates: ResearchCandidate[];
};

export type ResearchCandidate = {
  id: string;
  rank: number;
  selected: boolean;
  selectionReason: string;
  title: string;
  authors: string[];
  publicationSource: string;
  publicationType: string;
  publicationDate: string;
  doi: string | null;
  sourceUrl: string | null;
  topicTags: string[];
  classification: string | null;
  classificationConfidence: number | null;
  classificationReason: string | null;
  evidenceBasis: string[];
  selectionScore: number;
  scoreComponents: ResearchSelectionScoreComponent[];
};

const researchCandidateJsonFiles = [
  researchCandidates20260823Json,
  researchCandidates20260809Json,
  researchCandidates20260802Json,
  researchCandidates20260726Json,
  researchCandidates20260719Json,
];

const researchCandidatePools = researchCandidateJsonFiles
  .map(validateResearchCandidatePool)
  .map(adaptResearchCandidatePool)
  .sort((a, b) => b.slug.localeCompare(a.slug));

export function getAllResearchCandidatePools(): ResearchCandidatePool[] {
  return researchCandidatePools;
}

export function getResearchCandidatePoolBySlug(
  slug: string,
): ResearchCandidatePool | undefined {
  return researchCandidatePools.find((pool) => pool.slug === slug);
}

export function hasResearchCandidatePool(slug: string): boolean {
  return Boolean(getResearchCandidatePoolBySlug(slug));
}

function adaptResearchCandidatePool(
  pool: PipelineResearchCandidatePool,
): ResearchCandidatePool {
  return {
    slug: pool.weekEnd,
    dateRange: formatDateRange(pool.weekStart, pool.weekEnd),
    runId: pool.runId,
    sourceName: pool.sourceName,
    generatedAt: pool.generatedAt,
    selectionLimit: pool.selectionLimit,
    candidateCount: pool.candidateCount,
    scoreModel: pool.scoreModel,
    candidates: pool.candidates.map(adaptResearchCandidate),
  };
}

function adaptResearchCandidate(
  candidate: PipelineResearchCandidate,
): ResearchCandidate {
  return {
    id: candidate.candidateId,
    rank: candidate.rank,
    selected: candidate.selected,
    selectionReason: selectionReasonLabel(candidate.selectionReason),
    title: candidate.title,
    authors: candidate.authors,
    publicationSource: candidate.publicationSource ?? "Unknown source",
    publicationType: publicationTypeLabel(candidate.publicationType),
    publicationDate: candidate.publishedDate,
    doi: candidate.doi,
    sourceUrl: candidate.sourceUrl,
    topicTags: candidate.topicTags,
    classification: candidate.classification,
    classificationConfidence: candidate.classificationConfidence,
    classificationReason: classificationReasonLabel(candidate.classificationReason),
    evidenceBasis: candidate.evidenceBasis,
    selectionScore: candidate.selectionScore,
    scoreComponents: candidate.scoreComponents.map((component) => ({
      id: component.componentId,
      label: component.label,
      score: component.score,
      maxScore: component.maxScore,
      evidence: component.evidence,
    })),
  };
}

function validateResearchCandidatePool(
  value: unknown,
): PipelineResearchCandidatePool {
  if (!isRecord(value)) {
    throw new Error("research candidate pool JSON must be an object");
  }
  const pool = value as Partial<PipelineResearchCandidatePool>;
  requiredString(pool.schemaVersion, "schemaVersion");
  requiredString(pool.candidateType, "candidateType");
  requiredString(pool.runId, "runId");
  requiredString(pool.sourceName, "sourceName");
  requiredString(pool.weekStart, "weekStart");
  requiredString(pool.weekEnd, "weekEnd");
  requiredString(pool.generatedAt, "generatedAt");
  if (!isRecord(pool.scoreModel)) {
    throw new Error("research candidate pool JSON requires scoreModel");
  }
  requiredString(pool.scoreModel.id, "scoreModel.id");
  requiredString(pool.scoreModel.label, "scoreModel.label");
  requiredString(pool.scoreModel.description, "scoreModel.description");
  if (
    pool.scoreModel.components !== undefined &&
    !Array.isArray(pool.scoreModel.components)
  ) {
    throw new Error("research candidate pool scoreModel.components must be an array");
  }
  if (!Array.isArray(pool.candidates)) {
    throw new Error("research candidate pool JSON requires candidates");
  }
  if (pool.candidateCount !== pool.candidates.length) {
    throw new Error("research candidate pool candidateCount must match candidates");
  }
  pool.candidates.forEach(validateResearchCandidate);
  return pool as PipelineResearchCandidatePool;
}

function validateResearchCandidate(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error("research candidate pool candidates must contain objects");
  }
  requiredString(value.candidateId, "candidates.candidateId");
  requiredString(value.title, "candidates.title");
  requiredString(value.publishedDate, "candidates.publishedDate");
  requiredString(value.publicationType, "candidates.publicationType");
  requiredString(value.selectionReason, "candidates.selectionReason");
  if (typeof value.rank !== "number" || !Number.isInteger(value.rank) || value.rank < 1) {
    throw new Error("research candidate rank must be a positive integer");
  }
  if (typeof value.selected !== "boolean") {
    throw new Error("research candidate selected must be boolean");
  }
  if (
    typeof value.selectionScore !== "number" ||
    !Number.isInteger(value.selectionScore) ||
    value.selectionScore < 0 ||
    value.selectionScore > 100
  ) {
    throw new Error("research candidate selectionScore must be an integer 0-100");
  }
  if (!Array.isArray(value.authors)) {
    throw new Error("research candidate authors must be an array");
  }
  if (!Array.isArray(value.topicTags)) {
    throw new Error("research candidate topicTags must be an array");
  }
  if (!Array.isArray(value.evidenceBasis)) {
    throw new Error("research candidate evidenceBasis must be an array");
  }
  if (!Array.isArray(value.scoreComponents)) {
    throw new Error("research candidate scoreComponents must be an array");
  }
  value.scoreComponents.forEach(validateScoreComponent);
}


function validateScoreComponent(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error("research candidate scoreComponents must contain objects");
  }
  requiredString(value.componentId, "scoreComponents.componentId");
  requiredString(value.label, "scoreComponents.label");
  if (
    typeof value.score !== "number" ||
    !Number.isInteger(value.score) ||
    typeof value.maxScore !== "number" ||
    !Number.isInteger(value.maxScore) ||
    value.score < 0 ||
    value.maxScore < 1 ||
    value.score > value.maxScore
  ) {
    throw new Error("research candidate score component has invalid bounds");
  }
  if (!Array.isArray(value.evidence)) {
    throw new Error("research candidate score component evidence must be an array");
  }
}
function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`research candidate pool JSON requires ${field}`);
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

function selectionReasonLabel(value: string): string {
  if (value === "selected_within_limit") {
    return "Selected within weekly limit";
  }
  if (value === "not_selected_below_limit") {
    return "Ranked below weekly limit";
  }
  if (value === "not_selected_not_relevant") {
    return "Not selected because classified not relevant";
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
