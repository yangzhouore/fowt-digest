import signalDatasetJson from "./digital-ai/signals.json";

export type DigitalAiTopic =
  | "ai_for_engineering"
  | "digital_twin"
  | "autonomous_om_robotics"
  | "industrial_software_digital_engineering"
  | "smart_grid_forecasting"
  | "ai_infrastructure_data_centres";

export type DigitalAiMaturity =
  | "research_concept"
  | "prototype"
  | "pilot_demonstration"
  | "commercial_deployment"
  | "operational_scaling"
  | "paused_cancelled_superseded"
  | "unknown";

export type DigitalAiSourceClass =
  | "government_regulator"
  | "public_research_lab"
  | "eu_programme"
  | "research_technical_body"
  | "industry_project"
  | "space_agency"
  | "international_agency";

export type DigitalAiSource = {
  sourceId: string;
  title: string;
  publisher: string;
  url: string;
  sourceClass: DigitalAiSourceClass;
  sourceTier: 1 | 2 | 3 | 4 | 5;
  publishedDate: string | null;
  accessedDate: string;
  licenseNote: string;
};

export type DigitalAiSignal = {
  id: string;
  slug: string;
  title: string;
  dateLabel: string;
  sortDate: string;
  topic: DigitalAiTopic;
  maturity: DigitalAiMaturity;
  country: string;
  region: string;
  connectionToFowt: string;
  shortDescription: string;
  whyItMatters: string;
  organizations: string[];
  technologyTags: string[];
  evidenceType: string;
  sourceIds: string[];
};

export type DigitalAiSignalWithSources = DigitalAiSignal & {
  sources: DigitalAiSource[];
};

type DigitalAiDataset = {
  schemaVersion: string;
  generatedDate: string;
  sources: DigitalAiSource[];
  signals: DigitalAiSignal[];
};

const signalDataset = signalDatasetJson as DigitalAiDataset;
const sourceById = new Map(
  signalDataset.sources.map((source) => [source.sourceId, source]),
);

export const digitalAiTopicLabels: Record<DigitalAiTopic, string> = {
  ai_for_engineering: "AI for Engineering",
  digital_twin: "Digital Twin",
  autonomous_om_robotics: "Autonomous O&M / Robotics",
  industrial_software_digital_engineering: "Industrial Software / Digital Engineering",
  smart_grid_forecasting: "Smart Grid / Forecasting",
  ai_infrastructure_data_centres: "AI Infrastructure / Data Centres",
};

export const digitalAiMaturityLabels: Record<DigitalAiMaturity, string> = {
  research_concept: "Research / Concept",
  prototype: "Prototype",
  pilot_demonstration: "Pilot / Demonstration",
  commercial_deployment: "Commercial Deployment",
  operational_scaling: "Operational / Scaling",
  paused_cancelled_superseded: "Paused / Cancelled / Superseded",
  unknown: "Unknown",
};

export const digitalAiSourceClassLabels: Record<DigitalAiSourceClass, string> = {
  government_regulator: "Government / Regulator",
  public_research_lab: "Public Research Lab",
  eu_programme: "EU Programme",
  research_technical_body: "Research / Technical Body",
  industry_project: "Industry Project",
  space_agency: "Space Agency",
  international_agency: "International Agency",
};

export function getAllDigitalAiSignals(): DigitalAiSignalWithSources[] {
  return [...signalDataset.signals]
    .sort((a, b) => b.sortDate.localeCompare(a.sortDate) || a.title.localeCompare(b.title))
    .map(withSources);
}

export function getDigitalAiSignalCount(): number {
  return signalDataset.signals.length;
}

export function getDigitalAiDatasetDate(): string {
  return signalDataset.generatedDate;
}

export function getDigitalAiOptions() {
  const signals = getAllDigitalAiSignals();
  return {
    topics: unique(signals.map((signal) => signal.topic)),
    maturities: unique(signals.map((signal) => signal.maturity)),
    regions: unique(signals.map((signal) => signal.region)),
    sourceClasses: unique(signals.flatMap((signal) => signal.sources.map((source) => source.sourceClass))),
  };
}

export function formatDigitalAiTopic(topic: DigitalAiTopic): string {
  return digitalAiTopicLabels[topic];
}

export function formatDigitalAiMaturity(maturity: DigitalAiMaturity): string {
  return digitalAiMaturityLabels[maturity];
}

export function formatDigitalAiSourceClass(sourceClass: DigitalAiSourceClass): string {
  return digitalAiSourceClassLabels[sourceClass];
}

function withSources(signal: DigitalAiSignal): DigitalAiSignalWithSources {
  return {
    ...signal,
    sources: signal.sourceIds
      .map((sourceId) => sourceById.get(sourceId))
      .filter((source): source is DigitalAiSource => Boolean(source)),
  };
}

function unique<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
