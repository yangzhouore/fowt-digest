"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dataset from "../../data/digital-ai/pathways.json";
import type { DigitalAiSignalWithSources } from "../../data/digital-ai-adapter";
import styles from "./pathway-comparison.module.css";

export function PathwayComparison({ language, signals }: {
  language: "en" | "zh";
  signals: Map<string, DigitalAiSignalWithSources>;
}) {
  const [selectedId, setSelectedId] = useState("land");
  useEffect(() => {
    const selectFromHash = () => {
      const id = window.location.hash.replace(/^#pathway-/, "");
      if (dataset.pathways.some((entry) => entry.id === id)) setSelectedId(id);
    };
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    return () => window.removeEventListener("hashchange", selectFromHash);
  }, []);
  const item = dataset.pathways.find((entry) => entry.id === selectedId)!;
  const label = (en: string, zh: string) => language === "zh" ? zh : en;
  return (
    <>
      <p className={styles.intro}>{label("Physical electricity supply and renewable procurement are different questions. These routes are illustrative; evidence coverage below describes this collection, not industry-wide readiness.", "实际供电与可再生能源采购是不同问题。以下路径为示意，证据覆盖仅描述本资料集，不代表全行业成熟度。")}</p>
      <div className="digital-ai-pathways" aria-label={label("Wind-to-compute pathways", "风电到算力路径")}>
        {dataset.pathways.map((entry, index) => <button
          key={entry.id} id={`pathway-${entry.id}`} type="button"
          className={selectedId === entry.id ? "is-active" : ""}
          aria-pressed={selectedId === entry.id} aria-controls="digital-ai-pathway-selected"
          onClick={() => setSelectedId(entry.id)}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{entry.title[language]}</strong>
          <small>{entry.coverage[language]}</small>
        </button>)}
      </div>
      <span className={styles.announcement} aria-live="polite" aria-atomic="true">{item.title[language]}</span>
      <div id="digital-ai-pathway-selected" className={`digital-ai-pathway-detail ${styles.detail}`}>
        <h3>{item.title[language]}</h3>
        <p className={styles.kicker}>{label("Illustrative physical route", "示意物理路径")}</p>
        <ol className={styles.flow} aria-label={label("Power route", "供电路径")}>
          {item.flow.map((step, index) => <li key={step.en}><strong>{step[language]}</strong>{index < item.flow.length - 1 ? <span aria-hidden="true">→</span> : null}</li>)}
        </ol>
        <dl className={styles.facts}>
          <div><dt>{label("Location / operating model", "位置 / 运行模式")}</dt><dd>{item.location[language]}</dd></div>
          <div><dt>{label("Possible procurement", "可能的采购安排")}</dt><dd>{item.procurement[language]}</dd></div>
          <div><dt>{label("Continuity question", "持续供能问题")}</dt><dd>{item.continuity[language]}</dd></div>
          <div><dt>{label("Questions to resolve", "待解决问题")}</dt><dd>{item.checks[language]}</dd></div>
        </dl>
        <p className={styles.meta}>{label("Procurement arrangements and checks are illustrative, not documented contracts or a feasibility assessment. Flexible workloads may overlap with siting options; these are not four mutually exclusive technologies.", "采购安排与核查项为示意，不代表已记录合同或可行性评估。灵活负荷可与选址方案重叠，这四项并非互斥技术。")}</p>
        <div className={styles.evidence}>
          <h4>{label("Evidence coverage", "证据覆盖")}: {item.coverage[language]}</h4>
          <p>{item.boundary[language]}</p>
          {item.signalIds.length ? <ul>{item.signalIds.map((id) => {
            const signal = signals.get(id)!;
            const context = dataset.context.find((entry) => entry.signalId === id)!;
            return <li key={id}>
              <p>{context.claim[language]}</p>
              <Link href={`/digital-ai/signals/${signal.slug}`}>{label("Read supporting context", "阅读背景证据")}: {signal.title} →</Link>
              <p className={styles.meta}>{label("Context source review", "背景来源复核")}: {dataset.reviewedDate}</p>
            </li>;
          })}</ul> : <p className={styles.meta}>{label("No supporting project example recorded in this collection.", "本资料集尚未记录支持项目案例。")}</p>}
        </div>
      </div>
      <details className={styles.comparison}>
        <summary>{label("Compare all four pathways", "比较全部四条路径")}</summary>
        <p className={styles.meta}>{label("On a narrow screen, scroll the table horizontally. This compares design questions, not costs or commercial readiness.", "窄屏可横向滚动表格。此处比较设计问题，不比较成本或商业成熟度。")}</p>
        <div className={styles.tableRegion} role="region" aria-label={label("Pathway comparison table", "路径比较表")} tabIndex={0}>
          <table>
            <caption>{label("Wind-to-compute: physical route, procurement and evidence", "风电到算力：物理路径、采购与证据")}</caption>
            <thead><tr><th scope="col">{label("Compare", "比较项")}</th>{dataset.pathways.map((entry) => <th scope="col" key={entry.id}>{entry.title[language]}</th>)}</tr></thead>
            <tbody>
              <tr><th scope="row">{label("Illustrative route", "示意路径")}</th>{dataset.pathways.map((entry) => <td key={entry.id}>{entry.flow.map((step) => step[language]).join(" → ")}</td>)}</tr>
              {([
                ["location", label("Location / model", "位置 / 模式")],
                ["procurement", label("Possible procurement", "可能的采购安排")],
                ["continuity", label("Continuity question", "持续供能问题")],
                ["boundary", label("Evidence boundary", "证据边界")],
              ] as const).map(([key, heading]) => <tr key={key}><th scope="row">{heading}</th>{dataset.pathways.map((entry) => <td key={entry.id}>{entry[key][language]}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
