export type MockPaper = {
  id: string;
  number: number;
  title: string;
  authors: string[];
  publicationSource: string;
  publicationType: "Journal paper" | "Conference paper" | "Preprint";
  category: string;
  score: number;
  editorialSummary: string;
  fictional: true;
};

export const currentEdition = {
  dateRange: "3-9 August 2026",
  papersReviewed: 18,
  papersSelected: 6,
  readingTime: "9 minutes",
};

export const recentEditions = [
  {
    dateRange: "27 July-2 August 2026",
    slug: "2026-08-02",
  },
  {
    dateRange: "20-26 July 2026",
    slug: "2026-07-26",
  },
  {
    dateRange: "13-19 July 2026",
    slug: "2026-07-19",
  },
];

export const mockPapers: MockPaper[] = [
  {
    id: "fictional-hydrodynamics-semi-submersible",
    number: 1,
    title:
      "Fictional study of wave-current loading on a compact semi-submersible FOWT platform",
    authors: ["Mira Holt", "Jonas Vale", "Priya Sen"],
    publicationSource: "Fictional Journal of Floating Wind Methods",
    publicationType: "Journal paper",
    category: "Hydrodynamics",
    score: 8,
    editorialSummary:
      "A fictional modelling paper used to show how the digest might summarize hydrodynamic load cases without claiming real findings.",
    fictional: true,
  },
  {
    id: "fictional-mooring-stiffness-layout",
    number: 2,
    title:
      "Fictional comparison of mooring stiffness layouts for shallow-water floating wind arrays",
    authors: ["Elena Marr", "Tomas Iversen"],
    publicationSource: "Fictional Offshore Systems Conference",
    publicationType: "Conference paper",
    category: "Mooring",
    score: 7,
    editorialSummary:
      "A fictional conference entry included to demonstrate concise treatment of mooring design tradeoffs in the homepage list.",
    fictional: true,
  },
  {
    id: "fictional-dynamic-cable-fatigue",
    number: 3,
    title:
      "Fictional fatigue screening method for dynamic power cables near floating substations",
    authors: ["Naomi Keel", "Arun Bedi", "Clara Ro"],
    publicationSource: "Fictional Marine Energy Preprint Series",
    publicationType: "Preprint",
    category: "Dynamic power cables",
    score: 6,
    editorialSummary:
      "A fictional preprint-style item showing how cable risk topics can be flagged without presenting unverified results as fact.",
    fictional: true,
  },
  {
    id: "fictional-turbine-control-platform-motion",
    number: 4,
    title:
      "Fictional control strategy for reducing platform-pitch sensitivity in floating turbines",
    authors: ["Luca Paredes", "Iris Chen"],
    publicationSource: "Fictional Wind Control Letters",
    publicationType: "Journal paper",
    category: "Turbine control",
    score: 8,
    editorialSummary:
      "A fictional controls paper entry illustrating how the digest can connect control logic to floating platform motion concerns.",
    fictional: true,
  },
  {
    id: "fictional-wake-modelling-array-spacing",
    number: 5,
    title:
      "Fictional wake modelling note for staggered floating wind farm layouts",
    authors: ["Samir Okafor", "Helen Strand", "Mei Watan"],
    publicationSource: "Fictional Journal of Wind Farm Analysis",
    publicationType: "Journal paper",
    category: "Wake modelling",
    score: 7,
    editorialSummary:
      "A fictional array-level paper used to demonstrate how wake modelling topics can be summarized for quick technical scanning.",
    fictional: true,
  },
  {
    id: "fictional-operations-tow-to-port",
    number: 6,
    title:
      "Fictional operations assessment for tow-to-port maintenance planning in floating wind",
    authors: ["Nadia Stone", "Peter Lian"],
    publicationSource: "Fictional Floating Wind Operations Forum",
    publicationType: "Conference paper",
    category: "Installation and operations",
    score: 6,
    editorialSummary:
      "A fictional operations entry included to show how installation and maintenance planning can appear beside technical research topics.",
    fictional: true,
  },
];
