import dataset from "../../data/digital-ai/use-cases.json";
import type { DigitalAiSignalWithSources } from "../../data/digital-ai-adapter";
import styles from "./use-case-card.module.css";

type Language = "en" | "zh";
type Copy = { en: string; zh: string };
export const useCases = dataset.cases;

export function UseCaseCard({ id, signals, language, maturityLabel }: {
  id: string;
  signals: Map<string, DigitalAiSignalWithSources & { maturityLabel: string }>;
  language: Language;
  maturityLabel: (text: string, language: Language) => string;
}) {
  const item = useCases.find((entry) => entry.id === id)!;
  const text = (copy: Copy) => copy[language];
  const label = (en: string, zh: string) => language === "zh" ? zh : en;
  const evidence = (signalId: string) => {
    const entry = dataset.evidence.find((record) => record.signalId === signalId)!;
    const signal = signals.get(signalId)!;
    const source = signal.sources.find((record) => record.sourceId === entry.sourceId)!;
    return (
      <div className={styles.example} key={signalId} data-evidence-basis={entry.basis}>
        <p className={styles.kicker}>{entry.basis === "stored_context"
          ? label("Stored context · source not rechecked", "已存背景 · 来源未重新核实")
          : label("Documented example", "已有公开案例")}</p>
        <h4>{signal.title}</h4>
        <p>{text(entry.claim)}</p>
        <p className={styles.meta}>
          {label("Recorded maturity", "已记录成熟度")}: {maturityLabel(signal.maturityLabel, language)}
          {" · "}{label("Record date / period", "记录日期 / 时段")}: {signal.dateLabel}
        </p>
        <a href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {label("Original source", "原始来源")} ↗</a>
        <p className={styles.meta}>
          {label("Source published", "来源发布日期")}: {source.publishedDate ?? label("Not recorded", "未记录")}
          {" · "}{label("Stored access date", "已存访问日期")}: {source.accessedDate}
          {entry.reviewedDate ? <> · {label("Card source review", "卡片来源复核")}: {entry.reviewedDate}</> : null}
        </p>
      </div>
    );
  };
  return (
    <article id="digital-ai-use-case" className={styles.card} aria-labelledby="digital-ai-use-case-title" data-use-case={id}>
      <header>
        <p className={styles.kicker}>{label("Illustrative workflow", "示意工作流程")}</p>
        <h3 id="digital-ai-use-case-title">{text(item.title)}</h3>
        <p>{text(item.problem)}</p>
        <p className={styles.meta}><strong>{label("Typical user", "典型用户")}:</strong> {text(item.user)}</p>
      </header>
      <ol className={styles.flow} aria-label={label("Inputs to method to output", "输入到方法再到输出")}>
        {([
          [label("Typical inputs", "典型输入"), item.inputs],
          [label("Method", "方法"), item.method],
          [label("Output", "输出"), item.output],
        ] as [string, Copy][]).map(([heading, copy]) => (
          <li key={heading}><strong>{heading}</strong><p>{text(copy)}</p></li>
        ))}
      </ol>
      <div className={styles.decision}><strong>{label("Human decision", "人工决策")}</strong><p>{text(item.decision)}</p></div>
      <p className={styles.limit}><strong>{label("Limit", "局限")}:</strong> {text(item.limitation)}</p>
      {item.featuredSignalId ? evidence(item.featuredSignalId) : (
        <div className={styles.example} data-evidence-basis="none">
          <p className={styles.kicker}>{label("Evidence gap", "证据空缺")}</p>
          <p>{label("No supporting example recorded in this collection.", "本资料集尚未记录支持案例。")}</p>
        </div>
      )}
      <details key={id} className={styles.more}>
        <summary>{label("More about evidence and limitations", "更多证据与局限")}</summary>
        <p><strong>{label("Workflow boundary", "流程适用边界")}:</strong> {label(
          "The role, inputs and decision above explain a possible engineering workflow; they are not a named project's operating procedure or proof of achieved benefits.",
          "以上角色、输入与决策用于说明一种可能的工程流程，不代表具体项目的作业规程，也不能证明已实现收益。",
        )}</p>
        <p><strong>{label("Not established by the reviewed evidence", "复核证据尚未确立")}:</strong> {text(item.unknown)}</p>
        <p className={styles.meta}>{label(
          "Recorded maturity describes the dated example, not the whole application area. A card source review does not update project status.",
          "已记录成熟度描述的是特定日期的案例，并非整个应用领域；卡片来源复核不代表更新项目状态。",
        )}</p>
        {item.signalIds.filter((signalId) => signalId !== item.featuredSignalId).map(evidence)}
      </details>
    </article>
  );
}
