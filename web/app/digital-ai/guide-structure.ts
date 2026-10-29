// Explicit reading contexts, not claims about deployment or supplier relationships.
export const fieldWorkflows: Record<string, readonly string[]> = {
  compute: [],
  weather: ["forecasting"],
  wind: ["engineering", "vision", "planning", "control", "predictive", "autonomy"],
  hybrids: [],
  grid: ["grid"],
  floating: ["twin", "cable"],
  procurement: [],
};

export function fieldForWorkflow(id: string): string | undefined {
  return Object.keys(fieldWorkflows).find((field) => fieldWorkflows[field].includes(id));
}

export const developmentTopics: Record<string, string> = {
  "flex-report": "grid", "aifs-release": "weather", "dtwo-update": "floating",
  "iea-update": "compute", "google-contracts": "grid", "microsoft-milestone": "procurement",
};

export const scenarioTopics: Record<string, { field: string; pathway?: string }> = {
  assistance: { field: "wind" },
  coordination: { field: "hybrids", pathway: "flexible" },
  offshore: { field: "floating", pathway: "land" },
};
