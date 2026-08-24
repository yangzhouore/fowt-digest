
const SCORE_MODEL_ID = "engineering_selection_score_v1";

const SCORE_COMPONENTS = [
  ["engineering_relevance", "Engineering relevance", 30],
  ["project_company", "Project / company", 25],
  ["technology", "Technology", 20],
  ["policy_market", "Policy / market", 15],
  ["source_quality", "Source quality", 10],
];

const FOWT_TERMS = [
  "floating offshore wind",
  "floating wind",
  "floating wind turbine",
  "floating wind turbines",
  "fowt",
];

const ENGINEERING_TERMS = [
  "engineering",
  "port",
  "ports",
  "assembly",
  "logistics",
  "installation",
  "fabrication",
  "manufacturing",
  "consenting",
  "cable",
  "hvdc",
  "mooring",
  "platform",
  "vessel",
  "tow",
  "trenching",
  "grid",
];

const PROJECT_COMPANY_TERMS = [
  "associated british ports",
  "port talbot",
  "brestport",
  "port of brest",
  "haventus",
  "dajin",
  "ardersier",
  "taihan",
  "panstar",
  "mlit",
  "ministry of land",
  "france 2030",
];

const PROJECT_EVENT_TERMS = [
  "tender",
  "procurement",
  "selected",
  "support",
  "state support",
  "mou",
  "partnership",
  "study group",
  "project",
  "customers",
];

const TECHNOLOGY_GROUPS = {
  ports: ["port", "ports", "terminal", "base ports", "marshalling"],
  floating_platforms: ["floating platform", "semi submersible", "semi-submersible"],
  cables: ["cable", "submarine cable", "export cable", "inter-array", "hvdc"],
  installation: ["installation", "tow", "tow-radius", "trenching", "rov", "burial"],
  fabrication: ["fabrication", "manufacturing", "assembly", "storage"],
  digital: ["digital", "ai", "automation", "robotics", "modelling", "modeling"],
};

const POLICY_MARKET_TERMS = [
  "government",
  "ministry",
  "mlit",
  "policy",
  "regulation",
  "consenting",
  "procurement",
  "tender",
  "state support",
  "france 2030",
  "leasing",
  "market",
  "supply chain",
];

function scoreEngineeringSourceRecord(source) {
  const text = combinedText(source);
  const components = [
    engineeringRelevanceComponent(source, text),
    projectCompanyComponent(text),
    technologyComponent(text),
    policyMarketComponent(source, text),
    sourceQualityComponent(source),
  ];

  return {
    modelId: SCORE_MODEL_ID,
    total: components.reduce((sum, component) => sum + component.score, 0),
    maxScore: 100,
    components,
  };
}

function buildEngineeringCandidatePool(briefing) {
  const selectedPrimarySourceIds = new Set(
    briefing.briefingItems.map((item) => item.sourceRecordIds[0]),
  );
  const selectedItemByPrimarySourceId = new Map(
    briefing.briefingItems.map((item) => [item.sourceRecordIds[0], item]),
  );
  const candidates = briefing.sourceRecords
    .filter((source) => source.candidateStatus === undefined || source.candidateStatus === "candidate")
    .map((source) => {
      const score = scoreEngineeringSourceRecord(source);
      return {
        candidateId: source.sourceRecordId,
        sourceRecordId: source.sourceRecordId,
        selected: selectedPrimarySourceIds.has(source.sourceRecordId),
        selectedBriefingItemId:
          selectedItemByPrimarySourceId.get(source.sourceRecordId)?.briefingItemId ?? null,
        rawRank: 0,
        finalRank: null,
        selectionReason: "not_selected_below_diversity_limit",
        diversityReason: null,
        engineeringSelectionScore: score,
        diversitySignals: diversitySignals(source),
      };
    })
    .sort(candidateSort);

  candidates.forEach((candidate, index) => {
    candidate.rawRank = index + 1;
  });

  const selected = applyDiversitySelection(candidates, 5);
  selected.forEach((candidate, index) => {
    candidate.finalRank = index + 1;
    candidate.selectionReason = "selected_after_diversity";
  });

  const selectedIds = new Set(selected.map((candidate) => candidate.candidateId));
  for (const candidate of candidates) {
    if (!selectedIds.has(candidate.candidateId)) {
      candidate.selected = false;
      candidate.selectedBriefingItemId = null;
      candidate.selectionReason = "not_selected_after_diversity";
    }
  }

  return {
    model: scoreModelMetadata(),
    candidates: candidates.sort((left, right) => left.rawRank - right.rawRank),
  };
}

function applyDiversitySelection(candidates, limit) {
  const selected = [];
  const deferred = [];
  const selectedByProjectGroup = new Map();

  for (const candidate of candidates) {
    if (selected.length >= limit) {
      break;
    }
    const group = candidate.diversitySignals.projectGroup;
    const existing = group ? selectedByProjectGroup.get(group) : undefined;
    if (existing) {
      if (technologyScore(candidate) > technologyScore(existing)) {
        const index = selected.indexOf(existing);
        existing.diversityReason = `Deferred because ${group} was represented by a candidate with broader technology coverage.`;
        deferred.push(existing);
        candidate.diversityReason = `Selected over a higher-ranked duplicate from ${group} because it adds broader technology coverage.`;
        selected[index] = candidate;
        selectedByProjectGroup.set(group, candidate);
      } else {
        candidate.diversityReason = `Deferred because ${group} was already represented.`;
        deferred.push(candidate);
      }
      continue;
    }

    candidate.diversityReason = "Selected by score while adding source/project coverage.";
    selected.push(candidate);
    if (group) {
      selectedByProjectGroup.set(group, candidate);
    }
  }

  for (const candidate of candidates) {
    if (selected.length >= limit) {
      break;
    }
    if (selected.includes(candidate) || deferred.includes(candidate)) {
      continue;
    }
    candidate.diversityReason = "Selected while filling the weekly highlight limit.";
    selected.push(candidate);
  }

  for (const candidate of deferred) {
    if (selected.length >= limit) {
      break;
    }
    candidate.diversityReason = "Selected after higher-ranked duplicate groups were deferred.";
    selected.push(candidate);
  }

  return selected;
}

function technologyScore(candidate) {
  return candidate.engineeringSelectionScore.components.find(
    (component) => component.componentId === "technology",
  )?.score ?? 0;
}

function scoreModelMetadata() {
  return {
    id: SCORE_MODEL_ID,
    label: "Engineering Selection Score",
    description:
      "Deterministic 100-point score computed from source-backed Engineering source records before diversity-aware selection.",
    components: SCORE_COMPONENTS.map(([componentId, label, maxScore]) => ({
      componentId,
      label,
      maxScore,
    })),
    diversityRules: [
      "Rank candidates by Engineering Selection Score.",
      "Prefer not to select two primary highlights from the same detected project group when enough alternatives exist.",
      "Use source record ID as the final deterministic tie-breaker.",
    ],
  };
}

function engineeringRelevanceComponent(source, text) {
  let score = 0;
  const evidence = [];
  if (hasAny(text, FOWT_TERMS)) {
    score += 16;
    evidence.push("floating wind signal");
  }
  if (hasAny(text, ["offshore wind"])) {
    score += 5;
    evidence.push("offshore wind signal");
  }
  const engineeringMatches = matchedTerms(text, ENGINEERING_TERMS);
  if (engineeringMatches.length > 0) {
    score += Math.min(9, engineeringMatches.length * 2);
    evidence.push(`engineering signals: ${engineeringMatches.slice(0, 4).join(", ")}`);
  }
  if (source.sourceType === "standards_update" || source.sourceType === "software_release") {
    score += 3;
    evidence.push(`${source.sourceType.replace(/_/g, " ")} source type`);
  }
  return component("engineering_relevance", score, evidence);
}

function projectCompanyComponent(text) {
  let score = 0;
  const evidence = [];
  const namedEntities = matchedTerms(text, PROJECT_COMPANY_TERMS);
  if (namedEntities.length > 0) {
    score += Math.min(15, namedEntities.length * 4);
    evidence.push(`named project/company signals: ${namedEntities.slice(0, 4).join(", ")}`);
  }
  const events = matchedTerms(text, PROJECT_EVENT_TERMS);
  if (events.length > 0) {
    score += Math.min(10, events.length * 3);
    evidence.push(`project/company event signals: ${events.slice(0, 4).join(", ")}`);
  }
  return component("project_company", score, evidence);
}

function technologyComponent(text) {
  const matchedGroups = Object.entries(TECHNOLOGY_GROUPS)
    .filter(([, terms]) => hasAny(text, terms))
    .map(([group]) => group);
  const score = Math.min(20, matchedGroups.length * 5);
  const evidence = matchedGroups.map((group) => `technology signal: ${group.replace(/_/g, " ")}`);
  return component("technology", score, evidence);
}

function policyMarketComponent(source, text) {
  let score = 0;
  const evidence = [];
  const matches = matchedTerms(text, POLICY_MARKET_TERMS);
  if (matches.length > 0) {
    score += Math.min(10, matches.length * 2);
    evidence.push(`policy/market signals: ${matches.slice(0, 5).join(", ")}`);
  }
  if (source.sourceType === "government_announcement") {
    score += 5;
    evidence.push("government source type");
  } else if (source.sourceType === "trade_association") {
    score += 3;
    evidence.push("trade association source type");
  } else if (source.sourceType === "company_announcement") {
    score += 2;
    evidence.push("company announcement source type");
  }
  return component("policy_market", score, evidence);
}

function sourceQualityComponent(source) {
  const sourceTypeScores = {
    government_announcement: 10,
    standards_update: 10,
    company_announcement: 8,
    trade_association: 8,
    software_release: 8,
    conference_announcement: 6,
    industry_news: 6,
  };
  return component("source_quality", sourceTypeScores[source.sourceType] ?? 4, [
    `${source.sourceType.replace(/_/g, " ")} source type`,
  ]);
}

function diversitySignals(source) {
  const text = combinedText(source);
  return {
    publisher: source.publisher,
    projectGroup: projectGroup(text),
    topicGroup: topicGroup(text),
    regionHint: regionHint(text),
  };
}

function projectGroup(text) {
  if (hasAny(text, ["france 2030", "marseille fos", "nantes saint nazaire", "port la nouvelle", "cherbourg", "brestport", "port of brest", "inflow"])) {
    return "france_floating_wind_ports_2030";
  }
  if (hasAny(text, ["port talbot", "celtic sea"])) {
    return "port_talbot_celtic_sea";
  }
  if (hasAny(text, ["ardersier", "haventus", "dajin"])) {
    return "ardersier_haventus_dajin";
  }
  if (hasAny(text, ["taihan", "panstar"])) {
    return "korean_cable_robotics";
  }
  if (hasAny(text, ["mlit", "japan", "base ports", "port study"])) {
    return "japan_port_planning";
  }
  if (hasAny(text, ["stillstrom", "esvagt", "semco", "offshore charging", "cable control"])) {
    return "offshore_vessel_charging";
  }
  if (hasAny(text, ["pacifico", "jindo", "manho", "offshore wind integrated cluster"])) {
    return "jindo_offshore_wind_cluster";
  }
  if (hasAny(text, ["stanford", "real time hybrid simulation", "offshore wind testing"])) {
    return "stanford_fowt_testing";
  }
  return null;
}

function topicGroup(text) {
  if (hasAny(text, ["cable", "hvdc", "trenching", "rov"])) {
    return "cables";
  }
  if (hasAny(text, ["port", "ports", "terminal", "marshalling"])) {
    return "ports";
  }
  if (hasAny(text, ["policy", "government", "ministry", "consenting"])) {
    return "policy";
  }
  if (hasAny(text, ["software", "digital", "ai", "automation"])) {
    return "digital";
  }
  return "engineering";
}

function regionHint(text) {
  if (hasAny(text, ["japan", "korea", "korean"])) {
    return "Asia-Pacific";
  }
  if (hasAny(text, ["uk", "wales", "france", "brest", "europe", "celtic sea", "ardersier", "marseille", "cherbourg", "port la nouvelle", "nantes"])) {
    return "Europe";
  }
  if (hasAny(text, ["united states", "u s", "stanford", "california"])) {
    return "North America";
  }
  return "Unspecified";
}

function component(componentId, score, evidence) {
  const [, label, maxScore] = SCORE_COMPONENTS.find(([id]) => id === componentId);
  return {
    componentId,
    label,
    score: Math.max(0, Math.min(maxScore, score)),
    maxScore,
    evidence,
  };
}

function combinedText(source) {
  return normaliseText([
    source.publisher,
    source.title,
    source.sourceType,
    source.sourceText,
  ].join(" "));
}

function normaliseText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text, terms) {
  const padded = ` ${text} `;
  return terms.some((term) => padded.includes(` ${normaliseText(term)} `));
}

function matchedTerms(text, terms) {
  return terms.filter((term) => hasAny(text, [term]));
}

function candidateSort(left, right) {
  return (
    right.engineeringSelectionScore.total - left.engineeringSelectionScore.total ||
    left.sourceRecordId.localeCompare(right.sourceRecordId)
  );
}

module.exports = {
  SCORE_MODEL_ID,
  buildEngineeringCandidatePool,
  scoreEngineeringSourceRecord,
  scoreModelMetadata,
};
