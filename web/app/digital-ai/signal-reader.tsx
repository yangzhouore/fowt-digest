"use client";

import Link from "next/link";
import type { DigitalAiSignalWithSources } from "../../data/digital-ai-adapter";
import cards from "../../data/digital-ai/use-cases.json";
import extraNotes from "../../data/digital-ai/reader-notes.json";
import pathways from "../../data/digital-ai/pathways.json";
import { useLanguage } from "../i18n/language-context";
import styles from "./signal-reader.module.css";

const maturityNames: Record<string, { en: string; zh: string }> = {
  research_concept: { en: "Research / Concept", zh: "研究 / 概念" },
  prototype: { en: "Prototype", zh: "原型" },
  pilot_demonstration: { en: "Pilot / Demonstration", zh: "试点 / 示范" },
  commercial_deployment: { en: "Commercial Deployment", zh: "商业部署" },
  operational_scaling: { en: "Operational / Scaling", zh: "运营 / 扩展" },
  paused_cancelled_superseded: { en: "Paused / Cancelled / Superseded", zh: "暂停 / 取消 / 已取代" },
  unknown: { en: "Unknown", zh: "未知" },
};

export function SignalReader({ signal }: { signal: DigitalAiSignalWithSources }) {
  const { language } = useLanguage();
  const label = (en: string, zh: string) => language === "zh" ? zh : en;
  const note = cards.evidence.find((entry) => entry.signalId === signal.id)
    ?? extraNotes.notes.find((entry) => entry.signalId === signal.id);
  const unavailable = note && "basis" in note && note.basis === "stored_context";
  const applications = cards.cases.filter((entry) => entry.signalIds.some((id) => id === signal.id));
  const routes = pathways.pathways.filter((entry) => entry.signalIds.some((id) => id === signal.id));
  return (
    <article className={styles.reader} aria-labelledby="signal-title">
      <Link href="/digital-ai#digital-ai-evidence-heading">← {label("Back to all evidence", "返回全部证据")}</Link>
      <header>
        <p className="eyebrow">{label("Digital & AI · Evidence reader", "数字化与 AI · 证据阅读")}</p>
        <h1 id="signal-title">{signal.title}</h1>
        <p className={styles.meta}>{signal.country} / {signal.region} · {label("Record date / period", "记录日期 / 时段")}: {signal.dateLabel}</p>
        <p><strong>{label("Recorded maturity", "已记录成熟度")}:</strong> {maturityNames[signal.maturity][language]}</p>
        <p className={styles.meta}>{label("This describes the dated record, not a fresh project-status audit or the maturity of the whole technology.", "此项描述特定日期的记录，不代表最新项目状态审查或整个技术领域的成熟度。")}</p>
        {language === "zh" ? <p className={styles.meta}>固定说明已翻译；原始记录标题、概要、机构及来源保留原文。</p> : null}
      </header>
      <section aria-labelledby="signal-summary">
        <h2 id="signal-summary">{label("Stored record summary", "已存记录概要")}</h2>
        <p>{signal.shortDescription}</p>
        <h3>{label("Offshore wind connection", "与海上风电的关联")}</h3>
        <p>{signal.connectionToFowt}</p>
        <h3>{label("Stored editorial relevance", "已存编辑关联说明")}</h3>
        <p>{signal.whyItMatters}</p>
        <p className={styles.meta}>{label("This relevance explanation is editorial context, not an additional measured project finding.", "关联说明属于编辑背景，并非额外的项目实测结论。")}</p>
      </section>
      <section aria-labelledby="signal-boundary">
        <h2 id="signal-boundary">{label("Evidence scope and limitations", "证据范围与局限")}</h2>
        {note ? <>
          <p className={styles.badge}>{unavailable ? label("Stored context · source not rechecked", "已存背景 · 来源未重新核实") : label("Public-source note", "公开来源说明")}</p>
          <p>{note.claim[language]}</p>
          <p className={styles.meta}>{label("Source-note review", "来源说明复核")}: {note.reviewedDate ?? label("Not rechecked", "未重新核实")}</p>
        </> : null}
        <p>{label("This reader presents curated public-source records, not full papers or private project documentation. A reported objective, prototype or demonstration does not by itself prove routine commercial deployment, accuracy or savings.", "本阅读页展示经整理的公开来源记录，不提供论文全文或项目内部文件。项目目标、原型或示范本身不能证明常态化商业部署、精度或节省效果。")}</p>
        {applications.length ? <details>
          <summary>{label("Illustrative workflow cautions", "示意流程注意事项")}</summary>
          <p className={styles.meta}>{label("These are explanatory cautions from the application cards, not reported project failures.", "以下为应用卡片的解释性注意事项，不代表项目已发生的故障。")}</p>
          <ul>{applications.map((item) => <li key={item.id}><strong>{item.title[language]}:</strong> {item.limitation[language]}</li>)}</ul>
        </details> : null}
      </section>
      <section aria-labelledby="signal-record-fields">
        <h2 id="signal-record-fields">{label("Recorded context", "记录背景")}</h2>
        <dl className={styles.facts}>
          <div><dt>{label("Evidence type", "证据类型")}</dt><dd>{signal.evidenceType.replaceAll("_", " ")}</dd></div>
          <div><dt>{label("Topic", "主题分类")}</dt><dd>{signal.topic.replaceAll("_", " ")}</dd></div>
          <div><dt>{label("Recorded organisations", "已记录机构")}</dt><dd>{signal.organizations.join(" · ")}</dd></div>
          <div><dt>{label("Technology tags", "技术标签")}</dt><dd>{signal.technologyTags.join(" · ")}</dd></div>
        </dl>
      </section>
      <section aria-labelledby="signal-sources">
        <h2 id="signal-sources">{label("Original sources and provenance", "原始来源与溯源")}</h2>
        {signal.sources.map((source) => <div className={styles.source} key={source.sourceId}>
          <h3><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></h3>
          <p>{source.publisher}</p>
          <dl className={styles.facts}>
            <div><dt>{label("Source published", "来源发布日期")}</dt><dd>{source.publishedDate ?? label("Not recorded", "未记录")}</dd></div>
            <div><dt>{label("Stored access date", "已存访问日期")}</dt><dd>{source.accessedDate}</dd></div>
            <div><dt>{label("Source class", "来源类别")}</dt><dd>{source.sourceClass.replaceAll("_", " ")}</dd></div>
            <div><dt>{label("Reuse note", "使用说明")}</dt><dd>{source.licenseNote}</dd></div>
          </dl>
        </div>)}
      </section>
      <section aria-labelledby="signal-reading-context">
        <h2 id="signal-reading-context">{label("Related reading contexts", "相关阅读背景")}</h2>
        <p className={styles.meta}>{label("Links explain where this record is used on the page; they do not establish a deployment or supplier relationship.", "链接说明本记录在页面中的引用位置，不代表部署或供应商关系。")}</p>
        <ul>
          {applications.map((item) => <li key={item.id}><Link href={`/digital-ai#application-${item.id}`}>{item.title[language]}</Link></li>)}
          {routes.map((item) => <li key={item.id}><Link href={`/digital-ai#pathway-${item.id}`}>{item.title[language]} · {label("Context only", "仅供背景参考")}</Link></li>)}
        </ul>
        {!applications.length && !routes.length ? <p>{label("No application or pathway link recorded in this collection.", "本资料集未记录关联应用或路径链接。")}</p> : null}
      </section>
    </article>
  );
}
