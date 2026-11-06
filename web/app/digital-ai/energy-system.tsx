"use client";

import { useState, type ReactNode } from "react";
import { developmentTopics, scenarioTopics } from "./guide-structure";
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

export function EnergyIntroduction() {
  const { language } = useLanguage();
  const copy = (en: string, zh: string) => language === "zh" ? zh : en;
  return <div className={styles.guide}>
    <section id="energy-system" aria-labelledby="energy-system-heading" className={styles.section}>
      <p className={styles.kicker}>{copy("01 / Understand the system", "01 / 理解系统")}</p>
      <h2 id="energy-system-heading">{copy("AI uses energy. AI can also help manage it.", "AI 消耗能源，也能辅助管理能源。")}</h2>
      <p className={styles.lead}>{copy("Think of a connected system: computing creates a load; wind and other sources supply electricity; grids, storage and operating decisions connect the two.", "把它看作互相连接的系统：计算形成用电负荷，风电等能源提供电力，电网、储能与运行决策把两者连接起来。")}</p>
      <ol className={styles.relationships}>
        {context.relationships.map((item) => <li key={item.id}>
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
      <details className={styles.glossary}>
        <summary>{copy("Six terms that make the headlines easier to read", "读懂新闻标题的六组术语")}</summary>
        <dl>{context.glossary.map((item) => <div key={item.term.en}><dt>{item.term[language]}</dt><dd>{item.meaning[language]}<Sources ids={item.sourceIds} /></dd></div>)}</dl>
      </details>
    </section>
  </div>;
}

export function EnergyFieldExplorer({ fieldId, onFieldChange, children }: {
  fieldId: string; onFieldChange: (id: string) => void; children?: ReactNode;
}) {
  const { language } = useLanguage();
  const copy = (en: string, zh: string) => language === "zh" ? zh : en;
  const [audience, setAudience] = useState<"reader" | "developer">("reader");
  const field = context.fields.find((item) => item.id === fieldId)!;
  const fieldTitle = fieldId === "wind" ? copy("Wind project work", "风电项目工作") : field.title[language];
  return <div className={styles.guide}>
    <section id="energy-fields" aria-labelledby="energy-fields-heading" className={styles.section}>
      <p className={styles.kicker}>{copy("02 / Apply AI to energy decisions", "02 / 将 AI 用于能源决策")}</p>
      <h2 id="energy-fields-heading">{copy("Choose a topic. Work through a practical example.", "选择一个主题，理解一个实际工作流程。")}</h2>
      <p>{copy("Start with the explanation, then explore the wind workflows underneath. The reader and developer views share the same evidence.", "先阅读说明，再探索下方相关风电流程。读者与开发者视角使用相同证据。")}</p>
      <div className={styles.fieldButtons} role="group" aria-label={copy("Energy system fields", "能源系统领域")}>
        {context.fields.map((item, index) => <button key={item.id} id={`energy-${item.id}`} type="button"
          aria-pressed={fieldId === item.id} aria-controls="energy-field-detail" onClick={() => onFieldChange(item.id)}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{(item.id === "wind" ? copy("Wind project work", "风电项目工作") : item.title[language])}
        </button>)}
      </div>
      <div className={styles.audience} role="group" aria-label={copy("Choose your reading perspective", "选择阅读视角")}>
        <span>{copy("Your perspective", "你的视角")}</span>
        <button type="button" aria-pressed={audience === "reader"} onClick={() => setAudience("reader")}>{copy("I want to understand", "我想理解")}</button>
        <button type="button" aria-pressed={audience === "developer"} onClick={() => setAudience("developer")}>{copy("I build or evaluate tools", "我开发或评估工具")}</button>
      </div>
      <p className={styles.announcement} aria-live="polite" aria-atomic="true">{fieldTitle}</p>
      <article id="energy-field-detail" className={styles.fieldDetail} aria-labelledby="energy-field-title" data-field={field.id}>
        <p className={styles.kicker}>{field.step[language]}</p><h3 id="energy-field-title">{fieldTitle}</h3>
        <p>{fieldId === "wind" ? copy("Choose a project task below, from design screening and fabrication review to maintenance and inspection. Each example follows the same input, method, output and human-decision pattern.", "从下方选择项目任务，包括设计筛选、制造复核、维护与检查。每个示例都沿用输入、方法、输出及人工决策的同一结构。") : field.mechanism[language]}</p>
        <div className={styles.action}>
          <h4>{audience === "reader" ? copy("What to ask", "应该问什么") : copy("A starting point to evaluate", "可以评估的起点")}</h4>
          <p>{fieldId === "wind" ? (audience === "reader"
            ? copy("Ask which task is supported, what data it uses, and what evidence validates the recommendation.", "应问：支持哪项任务？使用什么数据？哪些证据验证了建议？")
            : copy("Illustrative starting point: choose one task, establish a simple baseline, and compare outputs with known engineering results before changing a design or operating plan.", "示意起点：选择一项任务，建立简单基线；在改变设计或运行计划前，将输出与已知工程结果进行比较。")) : field[audience][language]}</p>
        </div>
        <p><strong>{copy("Evidence boundary", "证据边界")}: </strong>{fieldId === "wind" ? copy("Each task has its own example or explicit evidence gap below. Their recorded maturity and findings must be read separately.", "下方各项任务分别列出案例或明确证据空缺，其记录的成熟度与结论应分别解读。") : field.boundary[language]}</p>
        <Sources ids={field.sourceIds} />
        {"relatedHref" in field && field.relatedHref?.includes("#pathway-") ? <a className={styles.moreLink} href={field.relatedHref}>{copy("Continue to the related supply option", "继续查看相关供电方案")} →</a> : null}
      </article>
      {children}
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
      <p className={styles.kicker}>{copy("04 / Read developments in context", "04 / 结合背景理解进展")}</p>
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
            <a className={styles.moreLink} href={`#energy-${developmentTopics[item.id]}`}>{copy("Explore this topic", "探索相关主题")} →</a>
            <Sources ids={[item.sourceId]} />
          </li>;
        })}
      </ol>
    </section>

    <section id="energy-future" aria-labelledby="energy-future-heading" className={styles.section}>
      <p className={styles.kicker}>{copy("05 / Investigate what could come next", "05 / 观察未来可能的发展")}</p>
      <h2 id="energy-future-heading">{copy("Three pathways, with conditions attached", "三条带有前提条件的路径")}</h2>
      <p>{copy("These are editorial scenarios drawn from the sources below, not deployment forecasts. They can develop together; there is no promised date or probability.", "以下为依据所列来源提出的编辑情景，并非部署预测。三条路径可并行发展，未承诺实现日期或概率。")}</p>
      <div className={styles.scenarios}>
        {context.scenarios.map((item, index) => <article key={item.id}>
          <span className={styles.number} aria-hidden="true">0{index + 1}</span><h3>{item.title[language]}</h3><p>{item.possibility[language]}</p>
          <dl><div><dt>{copy("What must be in place", "需要具备什么")}</dt><dd>{item.requires[language]}</dd></div>
            <div><dt>{copy("What to watch", "观察什么")}</dt><dd>{item.watch[language]}</dd></div></dl>
          <a className={styles.moreLink} href={`#energy-${scenarioTopics[item.id].field}`}>{copy("Return to the practical context", "返回实际应用背景")} →</a>
          {scenarioTopics[item.id].pathway ? <p><a href={`#pathway-${scenarioTopics[item.id].pathway}`}>{copy("Compare the related supply option", "比较相关供电方案")} →</a></p> : null}
          <Sources ids={item.sourceIds} />
        </article>)}
      </div>
    </section>

  </div>;
}

export function EnergySourceRegistry() {
  const { language } = useLanguage();
  const copy = (en: string, zh: string) => language === "zh" ? zh : en;
  return <div className={styles.guide}>
    <details className={styles.registry}>
      <summary>{copy("Energy-system sources: dates and review scope", "能源系统来源：日期与复核范围")}</summary>
      <p>{copy("Public pages and summaries were reviewed. Source dates describe publications; the review date describes this reading check. Older background is not presented as new news. No full licensed reports, private operating data or project-wide audit is implied.", "本次查阅公开网页与摘要。来源日期表示发布，复核日期表示本次查阅；旧背景不作为新消息呈现。未暗示取得完整授权报告、私有运行数据或完成整个项目审查。")}</p>
      <ul>{context.sources.map((source) => <li key={source.id}>
        <a href={source.url}>{source.title}</a><p className={styles.meta}>{source.publisher} · {copy("Published", "发布")}: {source.publishedOn ?? copy("Not recorded on the page", "页面未记录")} · {copy("Reviewed", "复核")}: {source.reviewedOn}</p>
        <p>{source.scope}</p>
      </li>)}</ul>
    </details>
  </div>;
}

export function GuideNavigation() {
  const { language } = useLanguage();
  return <nav className={`${styles.guide} ${styles.navigation}`} aria-label={language === "zh" ? "AI 与能源阅读导航" : "AI and energy reading guide"}>
    {[
      ["energy-system", "Understand", "理解系统"],
      ["energy-fields", "Apply AI", "应用 AI"],
      ["wind-to-ai-heading", "Supply computing", "为计算供电"],
      ["energy-updates", "Developments", "相关进展"],
      ["energy-future", "What could come next", "未来可能怎样"],
      ["digital-ai-evidence-heading", "Evidence", "证据"],
    ].map(([id, en, zh], index) => <a key={id} href={`#${id}`}><span aria-hidden="true">0{index + 1} </span>{language === "zh" ? zh : en}</a>)}
  </nav>;
}
