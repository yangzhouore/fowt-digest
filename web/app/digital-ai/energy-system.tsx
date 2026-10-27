"use client";

import { useEffect, useState } from "react";
import context from "../../data/digital-ai/energy-context.json";
import { useLanguage } from "../i18n/language-context";
import styles from "./energy-system.module.css";

const sourceById = new Map(context.sources.map((source) => [source.id, source]));

function Sources({ ids }: { ids: string[] }) {
  const { language } = useLanguage();
  return <p className={styles.sources}>{language === "zh" ? "依据：" : "Sources: "}{ids.map((id, index) => {
    const source = sourceById.get(id)!;
    return <span key={id}>{index > 0 ? " · " : ""}<a href={source.url} title={source.title}>{source.publisher}</a></span>;
  })}</p>;
}

export function EnergySystemOverview() {
  const { language } = useLanguage();
  const copy = (en: string, zh: string) => language === "zh" ? zh : en;
  const [fieldId, setFieldId] = useState(context.fields[0].id);
  const [audience, setAudience] = useState<"reader" | "developer">("reader");
  useEffect(() => {
    const readHash = () => {
      const id = window.location.hash.replace(/^#energy-/, "");
      if (context.fields.some((field) => field.id === id)) setFieldId(id);
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);
  const field = context.fields.find((item) => item.id === fieldId)!;

  return <div className={styles.guide}>
    <nav className={styles.navigation} aria-label={copy("AI and energy reading guide", "AI 与能源阅读导航")}>
      {[
        ["energy-system", "Start here", "从这里开始"],
        ["energy-fields", "Explore the connections", "探索联系"],
        ["ai-to-wind-heading", "Wind applications", "风电应用"],
        ["wind-to-ai-heading", "Power pathways", "供电路径"],
        ["energy-updates", "Developments", "相关进展"],
        ["energy-future", "What could come next", "未来可能怎样"],
      ].map(([id, en, zh]) => <a key={id} href={`#${id}`}>{copy(en, zh)}</a>)}
    </nav>

    <section id="energy-system" aria-labelledby="energy-system-heading" className={styles.section}>
      <p className={styles.kicker}>{copy("Start with three relationships", "先理解三种关系")}</p>
      <h2 id="energy-system-heading">{copy("AI uses energy. AI can also help manage it.", "AI 消耗能源，也能辅助管理能源。")}</h2>
      <p className={styles.lead}>{copy("Think of a connected system: computing creates a load; wind and other sources supply electricity; grids, storage and operating decisions connect the two.", "把它看作互相连接的系统：计算形成用电负荷，风电等能源提供电力，电网、储能与运行决策把两者连接起来。")}</p>
      <ol className={styles.relationships}>
        {context.relationships.map((item, index) => <li key={item.id}>
          <span className={styles.number} aria-hidden="true">0{index + 1}</span>
          <h3>{item.title[language]}</h3><p>{item.text[language]}</p><Sources ids={item.sourceIds} />
        </li>)}
      </ol>
      <div className={styles.systemFlows}>
        <div><h3>{copy("Electricity flows through infrastructure", "电力通过基础设施传递")}</h3>
          <ol aria-label={copy("Illustrative electricity route", "示意供电路径")}>
            <li>{copy("Wind, solar and other generation", "风电、光伏及其他发电")}</li>
            <li>{copy("Grid, with storage and other balancing resources", "电网，以及储能等平衡资源")}</li>
            <li>{copy("Computing, cooling and facility equipment", "计算、冷却与设施设备")}</li>
          </ol>
        </div>
        <div><h3>{copy("Information supports decisions", "信息支持决策")}</h3>
          <ol aria-label={copy("Illustrative decision-support route", "示意决策支持路径")}>
            <li>{copy("Weather, sensors and operating records", "天气、传感器与运行记录")}</li>
            <li>{copy("Models produce forecasts or alerts", "模型产生预测或预警")}</li>
            <li>{copy("People act on assets or eligible workloads", "人员调整设备或符合条件的任务")}</li>
          </ol>
        </div>
        <p className={styles.meta}>{copy("Illustrative routes. A purchase contract does not trace individual electrons, and a model output does not itself operate equipment.", "路径仅为示意。购电合同不追踪单个电子；模型输出本身也不会操作设备。")}</p>
        <Sources ids={["iea-supply", "doe-ai", "google-flex"]} />
      </div>
      <aside className={styles.distinction}>
        <strong>{copy("AI is more than a chatbot", "AI 不只是聊天机器人")}</strong>
        <p>{copy("In energy, AI may estimate tomorrow's wind or flag an unusual sensor pattern. Physics models and optimization also matter; a digital tool is not automatically AI. Look for the input, the output and the decision it supports.", "在能源领域，AI 可估计明天的风况，或标记异常传感器模式。物理模型与优化同样重要，数字工具不自动等于 AI。应关注它的输入、输出，以及所支持的决策。")}</p>
        <Sources ids={["doe-ai", "nlr-hybrid", "fem-subsee"]} />
      </aside>
    </section>

    <section id="energy-fields" aria-labelledby="energy-fields-heading" className={styles.section}>
      <p className={styles.kicker}>{copy("Follow the connections", "沿着联系理解系统")}</p>
      <h2 id="energy-fields-heading">{copy("From a computing task to a floating turbine", "从一次计算任务，到一台浮式风机")}</h2>
      <p>{copy("Choose a field. Each one solves a different part of the problem; none replaces the whole energy system.", "选择一个领域。每个领域解决不同问题，任何一个都不能替代整个能源系统。")}</p>
      <div className={styles.fieldButtons} role="group" aria-label={copy("Energy system fields", "能源系统领域")}>
        {context.fields.map((item, index) => <button key={item.id} id={`energy-${item.id}`} type="button"
          aria-pressed={fieldId === item.id} aria-controls="energy-field-detail" onClick={() => setFieldId(item.id)}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item.title[language]}
        </button>)}
      </div>
      <div className={styles.audience} role="group" aria-label={copy("Choose your reading perspective", "选择阅读视角")}>
        <span>{copy("Your perspective", "你的视角")}</span>
        <button type="button" aria-pressed={audience === "reader"} onClick={() => setAudience("reader")}>{copy("I want to understand", "我想理解")}</button>
        <button type="button" aria-pressed={audience === "developer"} onClick={() => setAudience("developer")}>{copy("I build or evaluate tools", "我开发或评估工具")}</button>
      </div>
      <p className={styles.announcement} aria-live="polite" aria-atomic="true">{field.title[language]}</p>
      <article id="energy-field-detail" className={styles.fieldDetail} aria-labelledby="energy-field-title" data-field={field.id}>
        <p className={styles.kicker}>{field.step[language]}</p><h3 id="energy-field-title">{field.title[language]}</h3>
        <p>{field.mechanism[language]}</p>
        <div className={styles.action}>
          <h4>{audience === "reader" ? copy("What to ask", "应该问什么") : copy("A starting point to evaluate", "可以评估的起点")}</h4>
          <p>{field[audience][language]}</p>
        </div>
        <p><strong>{copy("Evidence boundary", "证据边界")}: </strong>{field.boundary[language]}</p>
        <Sources ids={field.sourceIds} />
        {"relatedHref" in field ? <a className={styles.moreLink} href={field.relatedHref!}>{copy("Explore the related wind example", "查看相关风电示例")} →</a> : null}
      </article>
      <details className={styles.glossary}>
        <summary>{copy("Six terms that make the headlines easier to read", "读懂新闻标题的六组术语")}</summary>
        <dl>{context.glossary.map((item) => <div key={item.term.en}><dt>{item.term[language]}</dt><dd>{item.meaning[language]}<Sources ids={item.sourceIds} /></dd></div>)}</dl>
      </details>
    </section>
  </div>;
}

const kindLabels: Record<string, [string, string]> = {
  analysis: ["Report analysis", "报告分析"], operational_release: ["Operational release", "业务运行发布"],
  research_progress: ["Research progress", "研究进展"], projection: ["Conditional projection", "条件性预测"],
  company_contract: ["Company-reported contracts", "企业报告的合同"], company_matching: ["Company-reported matching", "企业报告的匹配"],
};

export function EnergyOutlook() {
  const { language } = useLanguage();
  const copy = (en: string, zh: string) => language === "zh" ? zh : en;
  return <div className={styles.guide}>
    <section id="energy-updates" aria-labelledby="energy-updates-heading" className={styles.section}>
      <p className={styles.kicker}>{copy("Dated developments, explained", "理解有日期的相关进展")}</p>
      <h2 id="energy-updates-heading">{copy("What is changing across AI and energy?", "AI 与能源领域正在发生什么变化？")}</h2>
      <p>{copy("A selected 2026 reading list, checked on", "2026 年精选阅读，查阅日期：")} <time dateTime={context.reviewedOn}>{context.reviewedOn}</time>. {copy("This is a curated snapshot, not a live or exhaustive news feed.", "这是精选静态快照，并非实时或完整新闻流。")}</p>
      <ol className={styles.updates}>
        {context.developments.map((item) => {
          const source = sourceById.get(item.sourceId)!;
          return <li key={item.id}>
            <p className={styles.meta}><time dateTime={source.publishedOn!}>{source.publishedOn}</time> · {kindLabels[item.kind][language === "zh" ? 1 : 0]}</p>
            <h3>{item.title[language]}</h3><p>{item.fact[language]}</p>
            <details><summary>{copy("Why it matters — and its limits", "为什么重要，以及它的局限")}</summary>
              <p><strong>{copy("Reading implication", "阅读启示")}: </strong>{item.meaning[language]}</p>
              <p><strong>{copy("Does not establish", "尚不能证明")}: </strong>{item.boundary[language]}</p>
            </details>
            <Sources ids={[item.sourceId]} />
          </li>;
        })}
      </ol>
    </section>

    <section id="energy-future" aria-labelledby="energy-future-heading" className={styles.section}>
      <p className={styles.kicker}>{copy("A future to investigate", "值得持续观察的未来")}</p>
      <h2 id="energy-future-heading">{copy("Three pathways, with conditions attached", "三条带有前提条件的路径")}</h2>
      <p>{copy("These are editorial scenarios drawn from the sources below, not deployment forecasts. They can develop together; there is no promised date or probability.", "以下为依据所列来源提出的编辑情景，并非部署预测。三条路径可并行发展，未承诺实现日期或概率。")}</p>
      <div className={styles.scenarios}>
        {context.scenarios.map((item, index) => <article key={item.id}>
          <span className={styles.number} aria-hidden="true">0{index + 1}</span><h3>{item.title[language]}</h3><p>{item.possibility[language]}</p>
          <dl><div><dt>{copy("What must be in place", "需要具备什么")}</dt><dd>{item.requires[language]}</dd></div>
            <div><dt>{copy("What to watch", "观察什么")}</dt><dd>{item.watch[language]}</dd></div></dl>
          <Sources ids={item.sourceIds} />
        </article>)}
      </div>
    </section>
    <details className={styles.registry}>
      <summary>{copy("Sources, dates and the scope of this review", "来源、日期与本次复核范围")}</summary>
      <p>{copy("Public pages and summaries were reviewed. Source dates describe publications; the review date describes this reading check. Older background is not presented as new news. No full licensed reports, private operating data or project-wide audit is implied.", "本次查阅公开网页与摘要。来源日期表示发布，复核日期表示本次查阅；旧背景不作为新消息呈现。未暗示取得完整授权报告、私有运行数据或完成整个项目审查。")}</p>
      <ul>{context.sources.map((source) => <li key={source.id}>
        <a href={source.url}>{source.title}</a><p className={styles.meta}>{source.publisher} · {copy("Published", "发布")}: {source.publishedOn ?? copy("Not recorded on the page", "页面未记录")} · {copy("Reviewed", "复核")}: {source.reviewedOn}</p>
        <p>{source.scope}</p>
      </li>)}</ul>
    </details>
  </div>;
}
