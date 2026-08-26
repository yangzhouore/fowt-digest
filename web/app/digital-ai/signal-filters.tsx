"use client";

import { useMemo, useState } from "react";
import type {
  DigitalAiMaturity,
  DigitalAiSignalWithSources,
  DigitalAiTopic,
} from "../../data/digital-ai-adapter";

type SignalListItem = DigitalAiSignalWithSources & {
  topicLabel: string;
  maturityLabel: string;
};

type Option<T extends string> = { value: T; label: string };

type DigitalAiExperienceProps = {
  signalCount: number;
  signals: SignalListItem[];
  topics: Option<DigitalAiTopic>[];
  maturities: Option<DigitalAiMaturity>[];
  regions: string[];
};

type ImpactArea = {
  id: string;
  stage: string;
  label: string;
  asset: string;
  detail: string;
  outcome: string;
  signalIds: string[];
};

const impactAreas: ImpactArea[] = [
  {
    id: "forecasting",
    stage: "Develop",
    label: "AI Forecasting",
    asset: "Site + metocean",
    detail: "Weather + resource data → forecast → siting and production decisions",
    outcome: "Better Forecasting",
    signalIds: [
      "airu-wrf-ai-offshore-wind-forecasting-grid",
      "ecmwf-dtwo-offshore-wind-modelling-modules",
    ],
  },
  {
    id: "engineering",
    stage: "Design",
    label: "AI Engineering",
    asset: "Turbine + floater",
    detail: "Engineering models → surrogate models → faster design exploration",
    outcome: "Faster Design",
    signalIds: ["ace-fwicc-sciml-floating-wind-system"],
  },
  {
    id: "vision",
    stage: "Manufacture",
    label: "AI Vision",
    asset: "Fabrication + quality",
    detail: "Images + production data → defect detection → quality assurance",
    outcome: "Earlier Detection",
    signalIds: [],
  },
  {
    id: "planning",
    stage: "Install",
    label: "AI Planning",
    asset: "Port + vessels",
    detail: "Weather + vessel + logistics data → installation planning",
    outcome: "Safer Installation",
    signalIds: [],
  },
  {
    id: "control",
    stage: "Operate",
    label: "Smart Control",
    asset: "Turbine + wind farm",
    detail: "Live conditions → control decisions → loads, wake and performance",
    outcome: "Smarter Operations",
    signalIds: ["flexiwind-virtual-offshore-wind-farm-control"],
  },
  {
    id: "twin",
    stage: "Operate",
    label: "Digital Twin",
    asset: "Platform + moorings",
    detail: "Simulation + live data → prediction → structural health and fatigue insight",
    outcome: "Earlier Detection",
    signalIds: [
      "digifloat-windfloat-atlantic-digital-twin",
      "dionysos-floating-wind-hybrid-monitoring",
      "subsee-4d-floating-wind-mooring-digital-twin",
    ],
  },
  {
    id: "predictive",
    stage: "Operate",
    label: "Predictive AI",
    asset: "Inspection + O&M",
    detail: "Condition data → anomaly prediction → maintenance decisions",
    outcome: "Earlier Detection",
    signalIds: [
      "nextwind-california-offshore-wind-digital-twin",
      "eproa-ai-digital-platform-floating-wind-om",
    ],
  },
  {
    id: "autonomy",
    stage: "Operate",
    label: "Autonomy",
    asset: "Drone + robot",
    detail: "Remote sensing + computer vision → offshore inspection",
    outcome: "Safer Inspection",
    signalIds: [
      "atlantis-autonomous-robots-windfloat-atlantic",
      "saturnx-autonomous-drone-offshore-wind-inspection",
      "umass-lowell-ai-blade-monitoring-offshore-wind",
    ],
  },
  {
    id: "cable",
    stage: "Connect",
    label: "Smart Monitoring",
    asset: "Cable + electrical",
    detail: "Inspection data → anomaly detection → cable condition insight",
    outcome: "Earlier Detection",
    signalIds: ["eproa-ai-digital-platform-floating-wind-om"],
  },
  {
    id: "grid",
    stage: "Connect",
    label: "AI Forecasting",
    asset: "Offshore + onshore grid",
    detail: "Generation forecasts → dispatch and flexible grid operation",
    outcome: "Flexible Power",
    signalIds: [
      "airu-wrf-ai-offshore-wind-forecasting-grid",
      "flexiwind-virtual-offshore-wind-farm-control",
    ],
  },
];

const lifecycleStages = ["Develop", "Design", "Manufacture", "Install", "Operate", "Connect"];

const energyPathways = [
  {
    id: "land",
    number: "01",
    label: "Power AI on land",
    maturity: "Established",
    flow: ["Offshore wind", "Grid", "Land-based AI / data centre"],
    note: "Grid-connected offshore wind contributes to the clean electricity mix serving compute infrastructure.",
    signalIds: ["iea-ai-energy-supply-data-centres-renewables"],
  },
  {
    id: "coastal",
    number: "02",
    label: "Co-locate compute",
    maturity: "Emerging",
    flow: ["Offshore wind", "Coastal energy hub", "Nearby data centre"],
    note: "A possible siting pathway near grid landing points. No project evidence is present in this dataset.",
    signalIds: [],
  },
  {
    id: "offshore",
    number: "03",
    label: "Offshore compute",
    maturity: "Experimental",
    flow: ["Offshore wind", "Direct connection", "Offshore AI compute"],
    note: "A conceptual direct-power pathway, not a mature offshore-wind business model in this evidence set.",
    signalIds: [],
  },
  {
    id: "flexible",
    number: "04",
    label: "Flexible compute + energy",
    maturity: "Emerging",
    flow: ["Offshore wind", "Grid + storage", "Flexible AI load"],
    note: "Variable generation, storage and shiftable compute could interact as one energy system. The records below support the component context, not a deployed combined model.",
    signalIds: [
      "iea-ai-energy-supply-data-centres-renewables",
      "flexiwind-virtual-offshore-wind-farm-control",
    ],
  },
];

export function DigitalAiExperience({
  signalCount,
  signals,
  topics,
  maturities,
  regions,
}: DigitalAiExperienceProps) {
  const [selectedImpactId, setSelectedImpactId] = useState(impactAreas[0].id);
  const [selectedPathwayId, setSelectedPathwayId] = useState(energyPathways[0].id);
  const [topic, setTopic] = useState("All");
  const [maturity, setMaturity] = useState("All");
  const [region, setRegion] = useState("All");

  const signalById = useMemo(
    () => new Map(signals.map((signal) => [signal.id, signal])),
    [signals],
  );
  const selectedImpact = impactAreas.find((area) => area.id === selectedImpactId)!;
  const selectedPathway = energyPathways.find((pathway) => pathway.id === selectedPathwayId)!;
  const filteredSignals = useMemo(
    () => signals.filter((signal) => (
      (topic === "All" || signal.topic === topic) &&
      (maturity === "All" || signal.maturity === maturity) &&
      (region === "All" || signal.region === region)
    )),
    [maturity, region, signals, topic],
  );

  return (
    <>
      <section className="digital-ai-story" aria-labelledby="ai-to-wind-heading">
        <header className="digital-ai-section-heading">
          <span>01</span>
          <div>
            <p className="eyebrow">How will AI</p>
            <h2 id="ai-to-wind-heading">Change offshore wind?</h2>
          </div>
        </header>

        <div className="digital-ai-lifecycle" aria-label="Offshore wind lifecycle from development to grid connection">
          {lifecycleStages.map((stage, stageIndex) => (
            <div className="digital-ai-stage" key={stage}>
              <div className="digital-ai-stage-marker" aria-hidden="true">
                <span>{String(stageIndex + 1).padStart(2, "0")}</span>
              </div>
              <h3>{stage}</h3>
              <div className="digital-ai-impact-buttons">
                {impactAreas.filter((area) => area.stage === stage).map((area) => (
                  <button
                    className={selectedImpact.id === area.id ? "is-active" : ""}
                    key={area.id}
                    type="button"
                    aria-pressed={selectedImpact.id === area.id}
                    onClick={() => setSelectedImpactId(area.id)}
                  >
                    <strong>{area.label}</strong>
                    <span>{area.asset}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <ImpactDetail area={selectedImpact} signalById={signalById} />
      </section>

      <section className="digital-ai-story digital-ai-power-story" aria-labelledby="wind-to-ai-heading">
        <header className="digital-ai-section-heading">
          <span>02</span>
          <div>
            <p className="eyebrow">How will offshore wind</p>
            <h2 id="wind-to-ai-heading">Power AI?</h2>
          </div>
        </header>

        <div className="digital-ai-energy-source" aria-hidden="true">
          <span className="digital-ai-turbine-shape" />
          <strong>Offshore wind</strong>
          <span className="digital-ai-flow-arrow">↓</span>
          <strong>Clean electricity</strong>
        </div>

        <div className="digital-ai-pathways" aria-label="Potential offshore wind to AI infrastructure pathways">
          {energyPathways.map((pathway) => (
            <button
              className={selectedPathway.id === pathway.id ? "is-active" : ""}
              key={pathway.id}
              type="button"
              aria-pressed={selectedPathway.id === pathway.id}
              onClick={() => setSelectedPathwayId(pathway.id)}
            >
              <span>{pathway.number}</span>
              <strong>{pathway.label}</strong>
              <small>{pathway.maturity}</small>
            </button>
          ))}
        </div>

        <div className="digital-ai-pathway-detail" aria-live="polite">
          <div className="digital-ai-energy-flow">
            {selectedPathway.flow.map((step, index) => (
              <span key={step}>
                <strong>{step}</strong>
                {index < selectedPathway.flow.length - 1 ? <i aria-hidden="true">→</i> : null}
              </span>
            ))}
          </div>
          <p>{selectedPathway.note}</p>
          <EvidenceLinks ids={selectedPathway.signalIds} signalById={signalById} emptyLabel="Evidence emerging" />
        </div>
      </section>

      <section className="digital-ai-evidence" aria-labelledby="digital-ai-evidence-heading">
        <header className="digital-ai-section-heading digital-ai-evidence-heading">
          <span>03</span>
          <div>
            <p className="eyebrow">Evidence</p>
            <h2 id="digital-ai-evidence-heading">{signalCount} source-backed signals</h2>
          </div>
        </header>

        <details className="digital-ai-evidence-drawer">
          <summary>Explore all evidence <span aria-hidden="true">↓</span></summary>
          <div className="digital-ai-filter-controls">
            <label>
              <span>Topic</span>
              <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                <option value="All">All topics</option>
                {topics.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>Maturity</span>
              <select value={maturity} onChange={(event) => setMaturity(event.target.value)}>
                <option value="All">All maturity</option>
                {maturities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>Region</span>
              <select value={region} onChange={(event) => setRegion(event.target.value)}>
                <option value="All">All regions</option>
                {regions.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
          </div>

          <p className="digital-ai-results-count">{filteredSignals.length} shown</p>
          <ol className="digital-ai-evidence-list">
            {filteredSignals.map((signal) => (
              <li key={signal.id}>
                <details>
                  <summary>
                    <span>
                      <small>{signal.topicLabel}</small>
                      <strong>{signal.title}</strong>
                    </span>
                    <time dateTime={signal.sortDate}>{signal.dateLabel}</time>
                  </summary>
                  <div className="digital-ai-evidence-copy">
                    <p>{signal.shortDescription}</p>
                    <p className="digital-ai-connection"><strong>Offshore wind connection</strong>{signal.connectionToFowt}</p>
                    <p className="digital-ai-record-meta">{signal.maturityLabel} / {signal.country} / {signal.region}</p>
                    <SourceLinks signal={signal} />
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </details>
      </section>
    </>
  );
}

function ImpactDetail({ area, signalById }: { area: ImpactArea; signalById: Map<string, SignalListItem> }) {
  return (
    <div className="digital-ai-impact-detail" aria-live="polite">
      <div>
        <p className="eyebrow">Application area</p>
        <h3>{area.label}</h3>
        <p>{area.detail}</p>
      </div>
      <strong className="digital-ai-outcome">{area.outcome}</strong>
      <div>
        <p className="eyebrow">Real-world evidence</p>
        <EvidenceLinks ids={area.signalIds} signalById={signalById} emptyLabel="Evidence emerging" />
      </div>
    </div>
  );
}

function EvidenceLinks({ ids, signalById, emptyLabel }: {
  ids: string[];
  signalById: Map<string, SignalListItem>;
  emptyLabel: string;
}) {
  if (ids.length === 0) return <p className="digital-ai-emerging">{emptyLabel}</p>;

  return (
    <ul className="digital-ai-evidence-links">
      {ids.map((id) => {
        const signal = signalById.get(id);
        if (!signal) return null;
        return (
          <li key={id}>
            <strong>{signal.title}</strong>
            <SourceLinks signal={signal} />
          </li>
        );
      })}
    </ul>
  );
}

function SourceLinks({ signal }: { signal: SignalListItem }) {
  return (
    <span className="digital-ai-source-links">
      {signal.sources.map((source) => (
        <a key={source.sourceId} href={source.url} target="_blank" rel="noreferrer">
          {source.publisher} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </span>
  );
}
