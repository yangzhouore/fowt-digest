"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PathwayComparison } from "./pathway-comparison";
import { UseCaseCard, useCases } from "./use-case-card";
import styles from "./use-case-card.module.css";
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
};

const impactAreas: ImpactArea[] = [
  {
    id: "forecasting",
    stage: "Develop",
    label: "AI Forecasting",
    asset: "Site + metocean",
  },
  {
    id: "engineering",
    stage: "Design",
    label: "AI Engineering",
    asset: "Turbine + floater",
  },
  {
    id: "vision",
    stage: "Manufacture",
    label: "AI Vision",
    asset: "Fabrication + quality",
  },
  {
    id: "planning",
    stage: "Install",
    label: "AI Planning",
    asset: "Port + vessels",
  },
  {
    id: "control",
    stage: "Operate",
    label: "Smart Control",
    asset: "Turbine + wind farm",
  },
  {
    id: "twin",
    stage: "Operate",
    label: "Digital Twin",
    asset: "Platform + moorings",
  },
  {
    id: "predictive",
    stage: "Operate",
    label: "Predictive AI",
    asset: "Inspection + O&M",
  },
  {
    id: "autonomy",
    stage: "Operate",
    label: "Autonomy",
    asset: "Drone + robot",
  },
  {
    id: "cable",
    stage: "Connect",
    label: "Smart Monitoring",
    asset: "Cable + electrical",
  },
  {
    id: "grid",
    stage: "Connect",
    label: "AI Forecasting",
    asset: "Offshore + onshore grid",
  },
];

const lifecycleStages = ["Develop", "Design", "Manufacture", "Install", "Operate", "Connect"];

export function DigitalAiExperience({
  signalCount,
  signals,
  topics,
  maturities,
  regions,
}: DigitalAiExperienceProps) {
  const { language } = useLanguage();
  const [selectedImpactId, setSelectedImpactId] = useState(impactAreas[0].id);
  const [topic, setTopic] = useState("All");
  const [maturity, setMaturity] = useState("All");
  const [region, setRegion] = useState("All");

  useEffect(() => {
    const selectFromHash = () => {
      const hash = window.location.hash;
      const id = hash.replace(/^#application-/, "");
      if (impactAreas.some((area) => area.id === id)) setSelectedImpactId(id);
      if (hash === "#digital-ai-evidence-heading") {
        const drawer = document.getElementById("digital-ai-all-evidence");
        if (drawer instanceof HTMLDetailsElement) drawer.open = true;
      }
    };
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    return () => window.removeEventListener("hashchange", selectFromHash);
  }, []);

  const signalById = useMemo(
    () => new Map(signals.map((signal) => [signal.id, signal])),
    [signals],
  );
  const selectedImpact = impactAreas.find((area) => area.id === selectedImpactId)!;
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

        <p className={styles.announcement} role="status" aria-live="polite" aria-atomic="true">
          {useCases.find((item) => item.id === selectedImpactId)!.title[language]}
        </p>
        <div className={`digital-ai-lifecycle ${styles.lifecycle}`} aria-label={language === "zh" ? "\u6d77\u4e0a\u98ce\u7535\u5e94\u7528\u9886\u57df" : "Offshore wind application areas"}>
          {lifecycleStages.map((stage, stageIndex) => (
            <Fragment key={stage}>
              <div className="digital-ai-stage" data-stage={stage}>
                <div className="digital-ai-stage-marker" aria-hidden="true">
                  <span>{String(stageIndex + 1).padStart(2, "0")}</span>
                </div>
                <h3>{digitalCopy(stage, language)}</h3>
                <div className="digital-ai-impact-buttons">
                  {impactAreas.filter((area) => area.stage === stage).map((area) => (
                    <button
                      className={selectedImpact.id === area.id ? "is-active" : ""}
                      key={area.id}
                      id={`application-${area.id}`}
                      type="button"
                      aria-pressed={selectedImpact.id === area.id}
                      aria-controls="digital-ai-use-case"
                      data-impact-id={area.id}
                      onClick={() => setSelectedImpactId(area.id)}
                    >
                      <strong>{digitalCopy(area.label, language)}</strong>
                      <span>{digitalCopy(area.asset, language)}</span>
                    </button>
                  ))}
                </div>
              </div>
              {selectedImpact.stage === stage ? <UseCaseCard id={selectedImpact.id} signals={signalById} language={language} maturityLabel={digitalCopy} /> : null}
            </Fragment>
          ))}
        </div>
      </section>

      <section className="digital-ai-story digital-ai-power-story" aria-labelledby="wind-to-ai-heading">
        <header className="digital-ai-section-heading">
          <span>02</span>
          <div>
            <p className="eyebrow">{language === "zh" ? "海上风电将如何" : "How will offshore wind"}</p>
            <h2 id="wind-to-ai-heading">{language === "zh" ? "为 AI 供能？" : "Power AI?"}</h2>
          </div>
        </header>

        <PathwayComparison language={language} signals={signalById} />
      </section>

      <section className="digital-ai-evidence" aria-labelledby="digital-ai-evidence-heading">
        <header className="digital-ai-section-heading digital-ai-evidence-heading">
          <span>03</span>
          <div>
            <p className="eyebrow">{language === "zh" ? "证据" : "Evidence"}</p>
            <h2 id="digital-ai-evidence-heading">{language === "zh" ? `${signalCount} 条有来源依据的信号` : `${signalCount} source-backed signals`}</h2>
          </div>
        </header>

        <details id="digital-ai-all-evidence" className="digital-ai-evidence-drawer">
          <summary>{language === "zh" ? "浏览全部证据" : "Explore all evidence"} <span aria-hidden="true">↓</span></summary>
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
          {filteredSignals.length === 0 ? <p>
            {language === "zh" ? "没有匹配这些筛选条件的记录。" : "No records match these filters."}{" "}
            <button type="button" onClick={() => { setTopic("All"); setMaturity("All"); setRegion("All"); }}>{language === "zh" ? "清除筛选" : "Clear filters"}</button>
          </p> : null}
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

function SourceLinks({ signal }: { signal: SignalListItem }) {
  const { language } = useLanguage();
  return (
    <span className="digital-ai-source-links">
      <Link href={`/digital-ai/signals/${signal.slug}`}>{language === "zh" ? "阅读证据" : "Read evidence"} →</Link>
      {signal.sources.map((source) => (
        <a key={source.sourceId} href={source.url} target="_blank" rel="noreferrer">
          {source.publisher} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </span>
  );
}

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
