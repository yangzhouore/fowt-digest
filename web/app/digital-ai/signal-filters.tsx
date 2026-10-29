"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PathwayComparison } from "./pathway-comparison";
import { UseCaseCard, useCases } from "./use-case-card";
import { EnergyIntroduction, EnergyFieldExplorer, EnergyOutlook, EnergySourceRegistry, GuideNavigation } from "./energy-system";
import { fieldWorkflows, fieldForWorkflow } from "./guide-structure";
import context from "../../data/digital-ai/energy-context.json";
import styles from "./energy-system.module.css";
import type { DigitalAiMaturity, DigitalAiSignalWithSources, DigitalAiTopic } from "../../data/digital-ai-adapter";
import { useLanguage } from "../i18n/language-context";

type SignalListItem = DigitalAiSignalWithSources & { topicLabel: string; maturityLabel: string };
type Option<T extends string> = { value: T; label: string };
type DigitalAiExperienceProps = {
  signalCount: number; signals: SignalListItem[]; topics: Option<DigitalAiTopic>[];
  maturities: Option<DigitalAiMaturity>[]; regions: string[];
};

export function DigitalAiExperience({ signalCount, signals, topics, maturities, regions }: DigitalAiExperienceProps) {
  const { language } = useLanguage();
  const copy = (en: string, zh: string) => language === "zh" ? zh : en;
  const [fieldId, setFieldId] = useState("compute");
  const [selectedImpactId, setSelectedImpactId] = useState("forecasting");
  const [hashRequest, setHashRequest] = useState("");
  const [topic, setTopic] = useState("All");
  const [maturity, setMaturity] = useState("All");
  const [region, setRegion] = useState("All");
  const selectField = useCallback((id: string) => {
    setFieldId(id);
    setSelectedImpactId(fieldWorkflows[id][0] ?? "");
    setHashRequest("");
  }, []);

  useEffect(() => {
    const selectFromHash = () => {
      const hash = window.location.hash;
      const application = hash.replace(/^#application-/, "");
      const field = hash.replace(/^#energy-/, "");
      const parent = fieldForWorkflow(application);
      if (parent) { setFieldId(parent); setSelectedImpactId(application); }
      else if (hash === "#ai-to-wind-heading") { setFieldId("weather"); setSelectedImpactId("forecasting"); }
      else if (context.fields.some((entry) => entry.id === field)) {
        setFieldId(field); setSelectedImpactId(fieldWorkflows[field][0] ?? "");
      }
      if (hash === "#digital-ai-evidence-heading") {
        const drawer = document.getElementById("digital-ai-all-evidence");
        if (drawer instanceof HTMLDetailsElement) drawer.open = true;
      }
      setHashRequest(hash);
    };
    window.addEventListener("hashchange", selectFromHash);
    window.addEventListener("popstate", selectFromHash);
    selectFromHash();
    return () => {
      window.removeEventListener("hashchange", selectFromHash);
      window.removeEventListener("popstate", selectFromHash);
    };
  }, []);

  // Legacy application anchors may only exist after selecting their parent topic.
  useEffect(() => {
    if (!hashRequest) return;
    document.getElementById(hashRequest.slice(1))?.scrollIntoView({ block: "nearest" });
  }, [hashRequest, fieldId, selectedImpactId]);

  const signalById = useMemo(() => new Map(signals.map((signal) => [signal.id, signal])), [signals]);
  const workflowIds = fieldWorkflows[fieldId];
  const selectedWorkflow = workflowIds.includes(selectedImpactId) ? selectedImpactId : workflowIds[0];
  const selectedCase = useCases.find((item) => item.id === selectedWorkflow);
  const filteredSignals = useMemo(() => signals.filter((signal) => (
    (topic === "All" || signal.topic === topic) && (maturity === "All" || signal.maturity === maturity) &&
    (region === "All" || signal.region === region)
  )), [maturity, region, signals, topic]);

  return <>
    <GuideNavigation />
    <EnergyIntroduction />
    <EnergyFieldExplorer fieldId={fieldId} onFieldChange={selectField}>
      <div id="ai-to-wind-heading" className={styles.workflows}>
        {workflowIds.length ? <>
          <p className={styles.kicker}>{copy("Put this topic into a wind workflow", "将本主题放入风电工作流程")}</p>
          <p>{copy("Each illustrative task keeps its documented examples or explicit evidence gap. Select a task to follow inputs, method, output and human decision.", "每项示意任务分别保留已有案例或明确证据空缺。选择任务，依次理解输入、方法、输出与人工决策。")}</p>
          <div className={styles.workflowButtons} role="group" aria-label={copy("Related wind workflows", "相关风电流程")}>
            {workflowIds.map((id) => {
              const item = useCases.find((entry) => entry.id === id)!;
              return <button key={id} id={`application-${id}`} data-impact-id={id} type="button"
                aria-pressed={id === selectedWorkflow} aria-controls="digital-ai-use-case"
                onClick={() => { setSelectedImpactId(id); setHashRequest(""); }}>{item.title[language]}</button>;
            })}
          </div>
          <p className={styles.announcement} role="status" aria-live="polite" aria-atomic="true">{selectedCase?.title[language]}</p>
          <UseCaseCard id={selectedWorkflow} signals={signalById} language={language} maturityLabel={digitalCopy} />
        </> : <p className={styles.contextNote}>{copy("This topic provides wider energy-system context. The detailed wind workflows are under Weather, Wind project work, Grids and Floating wind; compare electricity-supply choices in the next chapter.", "本主题提供更广的能源系统背景。风电详细流程位于天气、风电项目工作、电网与浮式风电主题；下一章比较供电选择。")}</p>}
      </div>
    </EnergyFieldExplorer>
    <section className={`digital-ai-story digital-ai-power-story ${styles.supply}`} aria-labelledby="wind-to-ai-heading">
      <header className="digital-ai-section-heading"><span>03</span><div>
        <p className="eyebrow">{copy("Energy for AI", "能源为 AI 供电")}</p>
        <h2 id="wind-to-ai-heading">{copy("How could wind supply computing?", "风电如何为计算供电？")}</h2>
      </div></header>
      <p>{copy("The previous chapter asks how AI supports energy decisions. Now reverse the question: where does computing get electricity, how is it bought, and what happens when wind output falls? Compare the four reading contexts below.", "上一章讨论 AI 如何支持能源决策。现在反过来问：计算的电力来自哪里、如何采购、风电出力下降时怎么办？下方比较四种阅读背景。")}</p>
      <PathwayComparison language={language} signals={signalById} />
    </section>
    <EnergyOutlook />
      <section className="digital-ai-evidence" aria-labelledby="digital-ai-evidence-heading">
        <header className="digital-ai-section-heading digital-ai-evidence-heading">
          <span>06</span>
          <div>
            <p className="eyebrow">{language === "zh" ? "查证与继续阅读" : "Check and read further"}</p>
            <h2 id="digital-ai-evidence-heading">{language === "zh" ? "查看支撑这些说明的证据" : "Inspect the evidence behind the guide"}</h2>
          </div>
        </header>

        <p>{language === "zh" ? `${signalCount} 条流程与供电记录展示已有案例；10 个能源系统来源支持更广的说明。各自保留原始范围和复核日期。` : `${signalCount} workflow and supply records describe the examples; 10 energy-system sources support the wider explanation. Each keeps its own scope and review dates.`}</p>
        <details id="digital-ai-all-evidence" className="digital-ai-evidence-drawer">
          <summary>{language === "zh" ? "浏览流程与供电记录" : "Browse workflow and supply records"} <span aria-hidden="true">↓</span></summary>
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
        <EnergySourceRegistry />
      </section>
  </>;
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
