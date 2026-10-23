import Link from "next/link";
import { countrySources } from "../../data/industry/country-guides";
import type { CountryGuide, CountryTable, CountryTopic, EvidenceKind } from "../../data/industry/country-guide-types";
import { LocalizedCopy as Copy } from "../i18n/localized-copy";
import { guideStyles } from "./uk-guide-styles";
import { internationalStyles } from "./international-styles";

const labels: Record<EvidenceKind, { en: string; zh: string }> = {
  confirmed: { en: "Confirmed rule / role", zh: "已确认规则／职责" }, typical: { en: "Typical practice", zh: "通常做法" },
  project: { en: "Documented project example", zh: "有记录项目示例" }, capability: { en: "Supplier capability", zh: "供应商能力" },
  research: { en: "R&D participation", zh: "研发参与" }, changing: { en: "Changing arrangements", zh: "制度变化" },
  interpretation: { en: "Engineering / commercial interpretation", zh: "工程／商业解读" },
};

export function CountrySources({ ids }: { ids: string[] }) {
  return <ul className="country-source-list">{ids.map((id) => {
    const s = countrySources.find((source) => source.id === id)!;
    return <li key={id}><a href={s.url}>{s.title}</a><small>{s.publisher} · {s.jurisdiction}<br />
      <Copy en="Document / update date" zh="文件／更新日期" />: {s.documentDate ?? <Copy en="Not established" zh="未确定" />} · <Copy en="Reviewed" zh="复核" />: <time dateTime={s.reviewedOn}>{s.reviewedOn}</time></small>
      <small className="source-scope" lang="en"><Copy en="Claim scope (English)" zh="证据范围（英文）" />: {s.claimScope}</small></li>;
  })}</ul>;
}

function Evidence({ ids }: { ids: string[] }) {
  return <details className="uk-evidence"><summary><Copy en="Sources, dates and claim scope" zh="来源、日期与证据范围" /> ({ids.length})</summary>
    <p className="uk-note"><Copy en="A review date records our source check. It is not a new project milestone. Undated pages and forward-looking plans retain their limits." zh="复核日期记录来源核查，不是新项目里程碑。未标日期网页与前瞻计划保留其局限。" /></p><CountrySources ids={ids} /></details>;
}

function Table({ table, title }: { table: CountryTable; title: { en: string; zh: string } }) {
  return <div className="uk-table-scroll" role="region" aria-label={`${title.en} / ${title.zh}`} tabIndex={0}><table><caption><Copy {...title} /></caption>
    <thead><tr>{table.headers.map((h, i) => <th scope="col" key={i}><Copy {...h} /></th>)}</tr></thead>
    <tbody>{table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th scope="row" key={j}><Copy {...cell} /></th> : <td key={j}><Copy {...cell} /></td>)}</tr>)}</tbody>
  </table></div>;
}

function Topic({ topic: t, guide, displayNumber }: { topic: CountryTopic; guide: CountryGuide; displayNumber: string }) {
  return <details className="uk-topic country-topic" id={`${guide.slug}-topic-${String(t.number).padStart(2, "0")}`}>
    <summary><span className="uk-topic-number">{displayNumber}</span><span><h3><Copy {...t.title} /></h3><span className="uk-topic-summary"><Copy {...t.summary} /></span></span><span className="uk-expand" aria-hidden="true">+</span></summary>
    <div className="uk-topic-body"><div className="uk-kinds">{t.kinds.map((kind) => <span key={kind}><Copy {...labels[kind]} /></span>)}</div>
      {t.paragraphs.map((p, i) => <p key={i}><Copy {...p} /></p>)}
      {t.table && <Table table={t.table} title={t.title} />}
      {t.items && <ol>{t.items.map((item, i) => <li key={i}><Copy {...item} /></li>)}</ol>}
      {t.number === 19 && <div className="uk-organisation-cards">{guide.roles.map((r) => <article className="uk-organisation-card" id={`${guide.slug}-role-${r.id}`} key={r.id}>
        <p className="uk-eyebrow"><Copy {...r.category} /></p><h4>{r.name}</h4><p><Copy {...r.delivers} /></p><p className="country-customer"><Copy {...r.customer} /></p><p className="uk-role-boundary"><Copy {...r.boundary} /></p>
        <div className="uk-card-evidence"><strong><Copy {...labels[r.kind]} /></strong>{r.sourceIds.map((id) => { const s = countrySources.find((s) => s.id === id)!; return <p key={id}><a href={s.url}>{s.title}</a> · {s.documentDate ?? <Copy en="Document date unknown" zh="文件日期未知" />}</p>; })}</div>
        <details className="country-org-source"><summary><Copy en="Evidence scope and review dates" zh="证据范围与复核日期" /></summary><CountrySources ids={r.sourceIds} /></details>
      </article>)}</div>}
      <Evidence ids={t.sourceIds} />
    </div>
  </details>;
}

const chapters = [
  { id: "machine", en: "How the machine works", zh: "机器怎样工作", numbers: [5, 7, 8, 9] },
  { id: "develop", en: "How a project becomes buildable", zh: "项目怎样具备建设条件", numbers: [2, 3, 4, 14, 15, 16, 17] },
  { id: "power", en: "Follow power, ownership and money", zh: "追踪电力、产权与资金", numbers: [6, 10, 11, 12, 13] },
  { id: "actors", en: "Where activity happens — who delivers it", zh: "活动在哪里——由谁交付", numbers: [18, 19] },
  { id: "risks", en: "Interfaces, constraints and questions", zh: "接口、约束与问题", numbers: [20, 21, 22] },
];

export function CountrySystemGuide({ guide: g }: { guide: CountryGuide }) {
  const chain = g.topics[0]; const table = chain.table!;
  return <div className="uk-guide industry-international"><style>{guideStyles + internationalStyles}</style>
    <header className="uk-hero"><p className="uk-eyebrow"><Copy {...g.name} /> / <Copy en="Floating wind system guide" zh="浮式风电系统指南" /></p><h1><Copy {...g.title} /></h1><p className="uk-lead"><Copy {...g.summary} /></p>
      <p className="uk-note"><Copy {...g.distinction} /></p><div className="uk-hero-bottom"><p><Copy en="Evidence reviewed" zh="证据复核" /> <time dateTime={g.reviewedOn}>{g.reviewedOn}</time><br /><Copy en="Representative public-source coverage · 22 topics" zh="代表性公开来源覆盖 · 22 个主题" /></p><a href={`#${g.slug}-chain`}><Copy en="Start with the complete chain" zh="从完整产业链开始" /> ↓</a></div>
    </header>
    <nav className="uk-chapter-nav" aria-label={`${g.name.en} guide chapters`}><a href={`#${g.slug}-chain`}><Copy en="The complete chain" zh="完整产业链" /></a>{chapters.map((ch, i) => <a key={ch.id} href={`#${g.slug}-${ch.id}`}><span>0{i + 1}</span> <Copy en={ch.en} zh={ch.zh} /></a>)}</nav>
    <section className="uk-chain" id={`${g.slug}-chain`} aria-labelledby={`${g.slug}-chain-heading`}><header className="uk-section-intro"><p className="uk-eyebrow"><Copy en="Deliverables, decisions, permissions and settlement" zh="交付物、决策、许可与结算" /></p><h2 id={`${g.slug}-chain-heading`}><Copy en="Build from the bottom up." zh="从产业链底层逐级理解。" /></h2><p><Copy {...chain.summary} /></p></header>
      {chain.paragraphs.map((p, i) => <p className="uk-note" key={i}><Copy {...p} /></p>)}
      <div className="uk-chain-lanes">{[
        { en: "Industrial delivery", zh: "工业交付", rows: [0, 1, 2, 3, 4, 5] },
        { en: "Connection and electricity system", zh: "连接与电力系统", rows: [6, 7] },
        { en: "Public coordination · alongside", zh: "公共协调 · 并行层", rows: [8] },
      ].map((lane) => <div className="uk-chain-lane" key={lane.en}><h3><Copy en={lane.en} zh={lane.zh} /></h3>{lane.rows.map((i) => <details className="uk-tier" key={i}><summary><strong><Copy {...table.rows[i][0]} /></strong></summary><dl>{table.headers.slice(1).map((h, j) => <div key={j}><dt><Copy {...h} /></dt><dd><Copy {...table.rows[i][j + 1]} /></dd></div>)}</dl></details>)}</div>)}</div>
      <Evidence ids={chain.sourceIds} />
    </section>
    {chapters.map((ch, i) => <section className="uk-chapter" id={`${g.slug}-${ch.id}`} aria-labelledby={`${g.slug}-${ch.id}-heading`} key={ch.id}><header className="uk-section-intro"><p className="uk-eyebrow"><Copy en={`Chapter 0${i + 1}`} zh={`第 0${i + 1} 章`} /></p><h2 id={`${g.slug}-${ch.id}-heading`}><Copy en={ch.en} zh={ch.zh} /></h2></header>
      {ch.id === "machine" && <div className="country-schematic" aria-label="Three separate functions / 三种独立功能"><div><strong><Copy en="Energy conversion" zh="能量转换" /></strong><Copy en="Wind → rotor → generator / converter → transformer → cable" zh="风 → 转子 → 发电机／变流器 → 变压器 → 海缆" /></div><div><strong><Copy en="Structural load path" zh="结构载荷路径" /></strong><Copy en="Rotor / tower → floater → mooring → anchor → soil" zh="转子／塔架 → 浮体 → 系泊 → 锚 → 土体" /></div><div><strong><Copy en="Coupled motion" zh="耦合运动" /></strong><Copy en="Floater ↔ mooring ↔ dynamic cable. A cable carries power; it is not a spare mooring." zh="浮体 ↔ 系泊 ↔ 动态缆。海缆输送电力，不是备用系泊。" /></div></div>}
      {ch.id === "develop" && <p className="country-flow"><Copy en="Rights + consent ∥ design + supply chain ∥ grid + revenue + finance → FID → construction → operation. Parallel workstreams must converge; an area award alone cannot authorise construction." zh="权利＋许可 ∥ 设计＋供应链 ∥ 电网＋收入＋融资 → FID → 建设 → 运行。并行工作线须汇合；仅区域授予不能授权建设。" /></p>}
      {ch.id === "power" && <div className="uk-power-lanes"><div><p className="uk-eyebrow"><Copy en="Physical flow" zh="物理流" /></p><p><Copy en="Wind → machine → array → export → network / offshore load" zh="风 → 机组 → 阵列 → 送出 → 电网／海上负荷" /></p></div><div><p className="uk-eyebrow"><Copy en="Commercial flow" zh="商业流" /></p><p><Copy en="Buyer → generator / marketer · support settlement, imbalance and network charges separately" zh="购电方 → 发电商／营销方 · 支持结算、偏差及网络费另计" /></p></div></div>}
      {ch.numbers.map((n, topicIndex) => <Topic key={n} guide={g} topic={g.topics.find((t) => t.number === n)!} displayNumber={`0${i + 1}.${topicIndex + 1}`} />)}
      <a className="uk-back" href={`#${g.slug}-chain`}><Copy en="Back to the complete chain" zh="返回完整产业链" /> ↑</a>
    </section>)}
    <aside className="uk-boundary"><h2><Copy en="Read the evidence before comparing scale." zh="比较规模前先理解证据。" /></h2><p><Copy en="Typical engineering is not a local regulation. A product page is not a contract, an area is not an operating farm, and a planned date is not an achieved milestone. This guide uses public records; no private contracts or licensed full standards are assumed. Unknown suppliers and dates stay unknown. Source titles, proper names and claim-scope notes retain their original language." zh="典型工程不是本国法规，产品页不是合同，区域不是运行风场，计划日期不是已实现里程碑。本指南使用公开记录，不假设取得私人合同或完整授权标准。未知供应商与日期保持未知；来源标题、专名及证据范围说明保留原文。" /></p><div className="country-links"><Link href="/industry"><Copy en="Compare the four countries" zh="比较四国" /></Link><Link href="/industry#industry-catalogue"><Copy en="Explore the international company directory" zh="浏览国际企业目录" /></Link></div></aside>
  </div>;
}
