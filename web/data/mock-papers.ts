export type MockPaper = {
  id: string;
  slug: string;
  number: number;
  title: string;
  authors: string[];
  publicationSource: string;
  publicationType: "Journal paper" | "Conference paper" | "Preprint";
  publicationDate: string;
  category: string;
  categories: string[];
  score: number;
  analysisLevel: string;
  editorialSummary: string;
  researchProblem: string;
  methodology: string;
  keyFindings: string;
  engineeringRelevance: string;
  limitations: string;
  fictional: true;
};

export type ArchiveEdition = {
  slug: string;
  dateRange: string;
  papersReviewed: number;
  papersSelected: number;
  readingTime: string;
  available: boolean;
};

export const currentEdition = {
  slug: "2026-08-09",
  dateRange: "3-9 August 2026",
  papersReviewed: 18,
  papersSelected: 6,
  readingTime: "9 minutes",
  introduction:
    "This fictional edition groups six floating wind research themes into a compact reading path for MVP testing.",
};

export const archiveEditions: ArchiveEdition[] = [
  {
    slug: currentEdition.slug,
    dateRange: currentEdition.dateRange,
    papersReviewed: currentEdition.papersReviewed,
    papersSelected: currentEdition.papersSelected,
    readingTime: currentEdition.readingTime,
    available: true,
  },
  {
    dateRange: "27 July-2 August 2026",
    slug: "2026-08-02",
    papersReviewed: 16,
    papersSelected: 6,
    readingTime: "8 minutes",
    available: false,
  },
  {
    dateRange: "20-26 July 2026",
    slug: "2026-07-26",
    papersReviewed: 14,
    papersSelected: 5,
    readingTime: "7 minutes",
    available: false,
  },
  {
    dateRange: "13-19 July 2026",
    slug: "2026-07-19",
    papersReviewed: 12,
    papersSelected: 5,
    readingTime: "7 minutes",
    available: false,
  },
];

export const mockPapers: MockPaper[] = [
  {
    id: "fictional-hydrodynamics-semi-submersible",
    slug: "wave-current-loading-compact-semi-submersible",
    number: 1,
    title:
      "Fictional study of wave-current loading on a compact semi-submersible FOWT platform",
    authors: ["Mira Holt", "Jonas Vale", "Priya Sen"],
    publicationSource: "Fictional Journal of Floating Wind Methods",
    publicationType: "Journal paper",
    publicationDate: "5 August 2026",
    category: "Hydrodynamics",
    categories: ["Hydrodynamics", "Platform response"],
    score: 8,
    analysisLevel: "Engineering screening",
    editorialSummary:
      "A fictional modelling paper used to show how the digest might summarize hydrodynamic load cases without claiming real findings.",
    researchProblem:
      "This fictional paper asks how combined wave-current loading might be summarized for early floating platform screening.",
    methodology:
      "The fictional authors compare simplified load cases against a mock numerical response matrix for a compact semi-submersible concept.",
    keyFindings:
      "The fictional analysis suggests that response sensitivity would be easiest to communicate through grouped sea-state envelopes rather than single design points.",
    engineeringRelevance:
      "The mock framing is useful for showing how digest entries can connect hydrodynamic assumptions to practical design review questions.",
    limitations:
      "The scenario, platform geometry, and results are invented for development and should not be interpreted as engineering evidence.",
    fictional: true,
  },
  {
    id: "fictional-mooring-stiffness-layout",
    slug: "mooring-stiffness-layouts-shallow-water-arrays",
    number: 2,
    title:
      "Fictional comparison of mooring stiffness layouts for shallow-water floating wind arrays",
    authors: ["Elena Marr", "Tomas Iversen"],
    publicationSource: "Fictional Offshore Systems Conference",
    publicationType: "Conference paper",
    publicationDate: "4 August 2026",
    category: "Mooring",
    categories: ["Mooring", "Array layout"],
    score: 7,
    analysisLevel: "Concept comparison",
    editorialSummary:
      "A fictional conference entry included to demonstrate concise treatment of mooring design tradeoffs in the homepage list.",
    researchProblem:
      "This fictional paper explores how different mooring stiffness assumptions could affect array-level layout choices in shallow water.",
    methodology:
      "The mock study compares three invented line-layout families using simplified offsets, restoring force curves, and qualitative installation notes.",
    keyFindings:
      "The fictional result highlights a tradeoff between station-keeping margin and installation complexity across the invented layouts.",
    engineeringRelevance:
      "The entry demonstrates how mooring papers can be summarized around design decisions rather than isolated numerical outputs.",
    limitations:
      "All layouts, comparisons, and performance statements are fictional and are included only to support interface development.",
    fictional: true,
  },
  {
    id: "fictional-dynamic-cable-fatigue",
    slug: "dynamic-cable-fatigue-screening-floating-substations",
    number: 3,
    title:
      "Fictional fatigue screening method for dynamic power cables near floating substations",
    authors: ["Naomi Keel", "Arun Bedi", "Clara Ro"],
    publicationSource: "Fictional Marine Energy Preprint Series",
    publicationType: "Preprint",
    publicationDate: "6 August 2026",
    category: "Dynamic power cables",
    categories: ["Dynamic power cables", "Fatigue screening"],
    score: 6,
    analysisLevel: "Early method note",
    editorialSummary:
      "A fictional preprint-style item showing how cable risk topics can be flagged without presenting unverified results as fact.",
    researchProblem:
      "This fictional preprint asks how early-stage projects might flag dynamic cable fatigue risks near floating substations.",
    methodology:
      "The invented method ranks mock bend-stiffener, hang-off, and touchdown-zone cases using qualitative fatigue exposure bands.",
    keyFindings:
      "The fictional findings emphasize that early screening would be most useful when uncertainty bands are shown alongside risk rankings.",
    engineeringRelevance:
      "The entry shows how the digest can present cable concerns while keeping preprint-style uncertainty visible.",
    limitations:
      "No cable properties, environmental inputs, or fatigue results are real; the content is fictional mock data.",
    fictional: true,
  },
  {
    id: "fictional-turbine-control-platform-motion",
    slug: "platform-pitch-sensitive-floating-turbine-control",
    number: 4,
    title:
      "Fictional control strategy for reducing platform-pitch sensitivity in floating turbines",
    authors: ["Luca Paredes", "Iris Chen"],
    publicationSource: "Fictional Wind Control Letters",
    publicationType: "Journal paper",
    publicationDate: "7 August 2026",
    category: "Turbine control",
    categories: ["Turbine control", "Platform motion"],
    score: 8,
    analysisLevel: "Control concept review",
    editorialSummary:
      "A fictional controls paper entry illustrating how the digest can connect control logic to floating platform motion concerns.",
    researchProblem:
      "This fictional paper considers how controller tuning might be described when platform-pitch sensitivity is the main concern.",
    methodology:
      "The mock study compares invented baseline and motion-aware control cases across simplified wind-speed bins.",
    keyFindings:
      "The fictional analysis suggests that describing control effects by operating region would be clearer than reporting a single aggregate score.",
    engineeringRelevance:
      "The example helps test how control papers can be summarized for readers comparing turbine behaviour and platform response.",
    limitations:
      "The controller, turbine model, and performance outcomes are fictional and have no real validation basis.",
    fictional: true,
  },
  {
    id: "fictional-wake-modelling-array-spacing",
    slug: "wake-modelling-staggered-floating-layouts",
    number: 5,
    title:
      "Fictional wake modelling note for staggered floating wind farm layouts",
    authors: ["Samir Okafor", "Helen Strand", "Mei Watan"],
    publicationSource: "Fictional Journal of Wind Farm Analysis",
    publicationType: "Journal paper",
    publicationDate: "8 August 2026",
    category: "Wake modelling",
    categories: ["Wake modelling", "Array spacing"],
    score: 7,
    analysisLevel: "Array-level interpretation",
    editorialSummary:
      "A fictional array-level paper used to demonstrate how wake modelling topics can be summarized for quick technical scanning.",
    researchProblem:
      "This fictional paper asks how staggered floating layouts might be compared when wake recovery and platform motion are both discussed.",
    methodology:
      "The invented analysis applies a mock wake model to three fictional spacing patterns and reports qualitative recovery trends.",
    keyFindings:
      "The fictional findings suggest that layout comparisons are easiest to scan when wake assumptions are separated from operational constraints.",
    engineeringRelevance:
      "The digest entry demonstrates how array-scale modelling can be made readable without overstating precision.",
    limitations:
      "All wake models, spacing patterns, and conclusions are fictional and are not suitable for design use.",
    fictional: true,
  },
  {
    id: "fictional-operations-tow-to-port",
    slug: "tow-to-port-maintenance-planning-floating-wind",
    number: 6,
    title:
      "Fictional operations assessment for tow-to-port maintenance planning in floating wind",
    authors: ["Nadia Stone", "Peter Lian"],
    publicationSource: "Fictional Floating Wind Operations Forum",
    publicationType: "Conference paper",
    publicationDate: "9 August 2026",
    category: "Installation and operations",
    categories: ["Installation", "Operations", "Maintenance planning"],
    score: 6,
    analysisLevel: "Operations planning note",
    editorialSummary:
      "A fictional operations entry included to show how installation and maintenance planning can appear beside technical research topics.",
    researchProblem:
      "This fictional conference paper asks how tow-to-port maintenance assumptions might be made explicit in early operations planning.",
    methodology:
      "The mock assessment compares invented weather-window, tow-duration, and quayside-availability cases for a fictional project.",
    keyFindings:
      "The fictional result frames port access and weather waiting time as the two clearest assumptions for readers to examine.",
    engineeringRelevance:
      "The entry shows how operational research can be presented alongside hydrodynamics, mooring, cables, controls, and wake modelling.",
    limitations:
      "The operation cases, timing assumptions, and planning conclusions are fictional and for development display only.",
    fictional: true,
  },
];
