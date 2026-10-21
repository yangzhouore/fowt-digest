import evidenceJson from "./projects/public-evidence.json";
import type { ProjectWithRelations, SourceRecord } from "./project-adapter";

export const evidenceAreas = ["Permitting", "Revenue", "Engineering", "Procurement", "Financing / FID", "Execution"] as const;
export type EvidenceArea = (typeof evidenceAreas)[number];
export type EvidenceRef = { kind: "confirmed_fact" | "timeline_event" | "relationship"; key: string };
export type SourceInspection = {
  sourceId: string; accessedDate: string;
  material: "public_webpage" | "public_document" | "stored_record" | "unavailable";
  finding: string;
};
export type AssessmentReview = {
  id: string; date: string; outcome: "completed" | "partial";
  scope: EvidenceArea[]; coverage: string[]; sources: SourceInspection[];
  findings: { area: EvidenceArea; note: string; sourceIds: string[] }[];
  summary: string; limitations: string;
};
export type EvidenceChange = {
  id: string; date: string; kind: "fact" | "assessment" | "mapping";
  reviewId: string | null; area: EvidenceArea | "Project"; target: string;
  before: string; after: string; rationale: string; sourceIds: string[];
};
export type ProjectEvidenceRecord = {
  projectId: string;
  areas: { area: EvidenceArea; recordRefs: EvidenceRef[]; boundary: string | null; watchpointRefs: string[] }[];
  reviews: AssessmentReview[]; changes: EvidenceChange[];
};
const records = (evidenceJson as { projects: ProjectEvidenceRecord[] }).projects;
const byProject = new Map(records.map((record) => [record.projectId, record]));

export function evidenceAnchor(area: string) {
  return `evidence-${area.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, "")}`;
}

export function getProjectReviewSummary(projectId: string) {
  const record = byProject.get(projectId);
  const latest = record?.reviews.filter((review) => review.outcome === "completed")
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))[0];
  return {
    reviewedOn: latest?.date ?? null,
    evidenceCounts: evidenceAreas.map((area) => ({ area, anchor: evidenceAnchor(area), count: record?.areas.find((entry) => entry.area === area)?.recordRefs.length ?? 0 })),
  };
}

export function getProjectPublicEvidence(project: ProjectWithRelations) {
  return resolveProjectPublicEvidence(project, byProject.get(project.id));
}

// Resolve only explicit references. Validation rejects missing or ambiguous records
// before publication; fail closed here if a caller supplies an incomplete record.
export function resolveProjectPublicEvidence(project: ProjectWithRelations, record?: ProjectEvidenceRecord) {
  const sourceMap = new Map(project.sources.map((source) => [source.sourceId, source]));
  const reviews = [...(record?.reviews ?? [])].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  return {
    reviewedOn: reviews.find((review) => review.outcome === "completed")?.date ?? null,
    reviews: reviews.map((review) => ({ ...review, sources: review.sources.map((inspection) => ({ ...inspection, source: sourceMap.get(inspection.sourceId) })) })),
    changes: [...(record?.changes ?? [])].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)),
    areas: evidenceAreas.map((area) => {
      const entry = record?.areas.find((item) => item.area === area);
      const items = (entry?.recordRefs ?? []).flatMap((ref) => {
        let text: string;
        let sourceIds: string[];
        let eventDate: string | null = null;
        let context: string | null = null;
        if (ref.kind === "confirmed_fact") {
          const matches = project.intelligence?.confirmedFacts.filter((fact) => fact.text === ref.key) ?? [];
          if (matches.length !== 1) return [];
          ({ text, sourceIds } = matches[0]);
        } else if (ref.kind === "timeline_event") {
          const matches = project.timelineEvents.filter((event) => event.id === ref.key && event.projectId === project.id);
          if (matches.length !== 1) return [];
          text = `${matches[0].title}: ${matches[0].description}`;
          sourceIds = matches[0].sourceIds;
          eventDate = matches[0].date;
        } else if (ref.kind === "relationship") {
          const matches = project.relationships.filter((relationship) => relationship.id === ref.key && relationship.projectId === project.id);
          if (matches.length !== 1) return [];
          const relationship = matches[0];
          text = `${relationship.companyName}: ${relationship.roleDetail ?? relationship.role}`;
          context = relationship.sourceStatusText ?? relationship.status;
          sourceIds = relationship.sourceIds;
        } else return [];
        const sources = sourceIds.flatMap((id) => {
          const source = sourceMap.get(id);
          if (!source) return [];
          const inspected = reviews.flatMap((review) => review.sources.map((inspection) => ({ ...inspection, reviewDate: review.date })))
            .find((inspection) => inspection.sourceId === id && ["public_webpage", "public_document"].includes(inspection.material));
          return [{ ...source, inspection: inspected ?? null }];
        });
        if (!sources.length || sources.length !== sourceIds.length) return [];
        return [{ key: `${ref.kind}:${ref.key}`, text, eventDate, context, sources }];
      });
      return { area, anchor: evidenceAnchor(area), items, boundary: entry?.boundary ?? null,
        watchpoints: (entry?.watchpointRefs ?? []).filter((text) => project.intelligence?.watchpoints.filter((watchpoint) => watchpoint === text).length === 1) };
    }),
    sourceById: Object.fromEntries(project.sources.map((source) => [source.sourceId, source])) as Record<string, SourceRecord>,
  };
}
