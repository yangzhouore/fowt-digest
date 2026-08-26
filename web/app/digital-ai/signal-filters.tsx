"use client";

import { useMemo, useState } from "react";
import type {
  DigitalAiMaturity,
  DigitalAiSignalWithSources,
  DigitalAiTopic,
} from "../../data/digital-ai-adapter";
import { useLanguage } from "../i18n/language-context";

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
  const { language } = useLanguage();
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
            <p className="eyebrow">{language === "zh" ? "AI 将如何" : "How will AI"}</p>
            <h2 id="ai-to-wind-heading">{language === "zh" ? "改变海上风电？" : "Change offshore wind?"}</h2>
          </div>
        </header>

        <div className="digital-ai-lifecycle" aria-label="Offshore wind lifecycle from development to grid connection">
          {lifecycleStages.map((stage, stageIndex) => (
            <div className="digital-ai-stage" key={stage}>
              <div className="digital-ai-stage-marker" aria-hidden="true">
                <span>{String(stageIndex + 1).padStart(2, "0")}</span>
              </div>
              <h3>{digitalCopy(stage, language)}</h3>
              <div className="digital-ai-impact-buttons">
                {impactAreas.filter((area) => area.stage === stage).map((area) => (
                  <button
                    className={selectedImpact.id === area.id ? "is-active" : ""}
                    key={area.id}
                    type="button"
                    aria-pressed={selectedImpact.id === area.id}
                    onClick={() => setSelectedImpactId(area.id)}
                  >
                    <strong>{digitalCopy(area.label, language)}</strong>
                    <span>{digitalCopy(area.asset, language)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <ImpactDetail area={selectedImpact} signalById={signalById} language={language} />
      </section>

      <section className="digital-ai-story digital-ai-power-story" aria-labelledby="wind-to-ai-heading">
        <header className="digital-ai-section-heading">
          <span>02</span>
          <div>
            <p className="eyebrow">{language === "zh" ? "海上风电将如何" : "How will offshore wind"}</p>
            <h2 id="wind-to-ai-heading">{language === "zh" ? "为 AI 供能？" : "Power AI?"}</h2>
          </div>
        </header>

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
              <strong>{digitalCopy(pathway.label, language)}</strong>
              <small>{digitalCopy(pathway.maturity, language)}</small>
            </button>
          ))}
        </div>

        <div className="digital-ai-pathway-detail" aria-live="polite">
          <div className="digital-ai-energy-flow">
            {selectedPathway.flow.map((step, index) => (
              <span key={step}>
                <strong>{digitalCopy(step, language)}</strong>
                {index < selectedPathway.flow.length - 1 ? <i aria-hidden="true">→</i> : null}
              </span>
            ))}
          </div>
          <p>{language === "zh" ? pathwayNoteZh[selectedPathway.id] : selectedPathway.note}</p>
          <EvidenceLinks ids={selectedPathway.signalIds} signalById={signalById} emptyLabel={language === "zh" ? "证据仍在形成" : "Evidence emerging"} />
        </div>
      </section>

      <section className="digital-ai-evidence" aria-labelledby="digital-ai-evidence-heading">
        <header className="digital-ai-section-heading digital-ai-evidence-heading">
          <span>03</span>
          <div>
            <p className="eyebrow">{language === "zh" ? "证据" : "Evidence"}</p>
            <h2 id="digital-ai-evidence-heading">{language === "zh" ? `${signalCount} 条有来源依据的信号` : `${signalCount} source-backed signals`}</h2>
          </div>
        </header>

        <details className="digital-ai-evidence-drawer">
          <summary>Explore all evidence <span aria-hidden="true">↓</span></summary>
          <div className="digital-ai-filter-controls">
            <label>
              <span>{language === "zh" ? "主题" : "Topic"}</span>
              <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                <option value="All">{language === "zh" ? "全部主题" : "All topics"}</option>
                {topics.map((item) => <option key={item.value} value={item.value}>{digitalCopy(item.label, language)}</option>)}
              </select>
            </label>
            <label>
              <span>{language === "zh" ? "成熟度" : "Maturity"}</span>
              <select value={maturity} onChange={(event) => setMaturity(event.target.value)}>
                <option value="All">{language === "zh" ? "全部成熟度" : "All maturity"}</option>
                {maturities.map((item) => <option key={item.value} value={item.value}>{digitalCopy(item.label, language)}</option>)}
              </select>
            </label>
            <label>
              <span>{language === "zh" ? "地区" : "Region"}</span>
              <select value={region} onChange={(event) => setRegion(event.target.value)}>
                <option value="All">{language === "zh" ? "全部地区" : "All regions"}</option>
                {regions.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
          </div>

          <p className="digital-ai-results-count">{language === "zh" ? `显示 ${filteredSignals.length} 条` : `${filteredSignals.length} shown`}</p>
          <ol className="digital-ai-evidence-list">
            {filteredSignals.map((signal) => (
              <li key={signal.id}>
                <details>
                  <summary>
                    <span>
                      <small>{digitalCopy(signal.topicLabel, language)}</small>
                      <strong>{signal.title}</strong>
                    </span>
                    <time dateTime={signal.sortDate}>{signal.dateLabel}</time>
                  </summary>
                  <div className="digital-ai-evidence-copy">
                    <p>{signal.shortDescription}</p>
                    <p className="digital-ai-connection"><strong>{language === "zh" ? "与海上风电的关联" : "Offshore wind connection"}</strong>{signal.connectionToFowt}</p>
                    <p className="digital-ai-record-meta">{digitalCopy(signal.maturityLabel, language)} / {signal.country} / {signal.region}</p>
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

function ImpactDetail({ area, signalById, language }: { area: ImpactArea; signalById: Map<string, SignalListItem>; language: "en" | "zh" }) {
  return (
    <div className="digital-ai-impact-detail" aria-live="polite">
      <div>
        <p className="eyebrow">{language === "zh" ? "应用领域" : "Application area"}</p>
        <h3>{digitalCopy(area.label, language)}</h3>
        <p>{language === "zh" ? impactDetailZh[area.id] : area.detail}</p>
      </div>
      <strong className="digital-ai-outcome">{digitalCopy(area.outcome, language)}</strong>
      <div>
        <p className="eyebrow">{language === "zh" ? "现实证据" : "Real-world evidence"}</p>
        <EvidenceLinks ids={area.signalIds} signalById={signalById} emptyLabel={language === "zh" ? "证据仍在形成" : "Evidence emerging"} />
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

const impactDetailZh: Record<string, string> = {
  forecasting: "天气与资源数据 → 预测 → 场址与发电决策", engineering: "工程模型 → 代理模型 → 更快探索设计空间",
  vision: "图像与生产数据 → 缺陷识别 → 质量保证", planning: "天气、船舶与物流数据 → 安装规划",
  control: "实时工况 → 控制决策 → 载荷、尾流与性能", twin: "仿真与实时数据 → 预测 → 结构健康与疲劳分析",
  predictive: "状态数据 → 异常预测 → 维护决策", autonomy: "遥感与计算机视觉 → 海上检测",
  cable: "检测数据 → 异常识别 → 海缆状态分析", grid: "发电预测 → 调度与灵活电网运行",
};

const pathwayNoteZh: Record<string, string> = {
  land: "并网海上风电可为服务算力基础设施的清洁电力组合作出贡献。",
  coastal: "靠近电网登陆点的潜在选址路径；当前数据集尚无项目证据。",
  offshore: "概念性的直接供电路径；在本证据集中并非成熟的海上风电商业模式。",
  flexible: "可变发电、储能与可转移算力负荷可能构成同一能源系统。下方记录支持各组成部分的背景，并不证明已部署的组合模式。",
};

function digitalCopy(text: string, language: "en" | "zh"): string {
  if (language === "en") return text;
  const copy: Record<string, string> = {
    Develop: "开发", Design: "设计", Manufacture: "制造", Install: "安装", Operate: "运维", Connect: "并网",
    "AI Forecasting": "AI 预测", "AI Engineering": "AI 工程", "AI Vision": "AI 视觉", "AI Planning": "AI 规划",
    "Smart Control": "智能控制", "Digital Twin": "数字孪生", "Predictive AI": "预测性 AI", Autonomy: "自主系统", "Smart Monitoring": "智能监测",
    "Site + metocean": "场址 + 海洋气象", "Turbine + floater": "风机 + 浮体", "Fabrication + quality": "制造 + 质量",
    "Port + vessels": "港口 + 船舶", "Turbine + wind farm": "风机 + 风场", "Platform + moorings": "平台 + 系泊",
    "Inspection + O&M": "检测 + 运维", "Drone + robot": "无人机 + 机器人", "Cable + electrical": "海缆 + 电气", "Offshore + onshore grid": "海上 + 陆上电网",
    "Better Forecasting": "更精准的预测", "Faster Design": "更快的设计", "Earlier Detection": "更早发现", "Safer Installation": "更安全的安装",
    "Smarter Operations": "更智能的运维", "Safer Inspection": "更安全的检测", "Flexible Power": "灵活用电",
    "Offshore wind": "海上风电", "Clean electricity": "清洁电力", Grid: "电网", "Land-based AI / data centre": "陆上 AI / 数据中心",
    "Coastal energy hub": "沿海能源枢纽", "Nearby data centre": "邻近数据中心", "Direct connection": "直接连接", "Offshore AI compute": "海上 AI 算力",
    "Grid + storage": "电网 + 储能", "Flexible AI load": "灵活 AI 负荷", "Power AI on land": "为陆上 AI 供能", "Co-locate compute": "邻近部署算力",
    "Offshore compute": "海上算力", "Flexible compute + energy": "灵活算力 + 能源", Established: "较成熟", Emerging: "新兴", Experimental: "试验性",
    "AI for Engineering": "工程 AI", "Autonomous O&M / Robotics": "自主运维 / 机器人", "Industrial Software / Digital Engineering": "工业软件 / 数字工程",
    "Smart Grid / Forecasting": "智能电网 / 预测", "AI Infrastructure / Data Centres": "AI 基础设施 / 数据中心", "Research / Concept": "研究 / 概念",
    Prototype: "原型", "Pilot / Demonstration": "试点 / 示范", "Commercial Deployment": "商业部署", "Operational / Scaling": "运营 / 扩展",
    "Paused / Cancelled / Superseded": "暂停 / 取消 / 已取代", Unknown: "未知",
  };
  return copy[text] ?? text;
}
