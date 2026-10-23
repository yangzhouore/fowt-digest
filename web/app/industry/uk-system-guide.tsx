import type { ReactNode } from "react";
import guideData from "../../data/industry/uk-system-guide.json";
import { assertUKGuide, type GuideBlock, type GuideTopic } from "../../data/industry/uk-guide-validator";
import { LocalizedCopy as Copy } from "../i18n/localized-copy";
import { guideStyles } from "./uk-guide-styles";

const candidate: unknown = guideData;
assertUKGuide(candidate);
const guide = candidate;

const labels: Record<string, { en: string; zh: string }> = {
  confirmed: { en: "Confirmed role / rule", zh: "已确认职责／规则" },
  typical: { en: "Typical practice", zh: "通常做法" },
  project: { en: "Project / organisation example", zh: "项目／机构示例" },
  changing: { en: "Changing arrangements", zh: "制度变化" },
  interpretation: { en: "Engineering interpretation", zh: "工程解读" },
  illustrative: { en: "Illustrative arithmetic", zh: "算术示例" },
};
const organisationLabels: Record<string, { en: string; zh: string }> = {
  capability: { en: "Representative capability", zh: "代表性能力" },
  project: { en: "Documented project example", zh: "有记录的项目示例" },
  announcement: { en: "Capability / facility plans", zh: "能力／设施计划" },
  confirmed: { en: "Institutional role", zh: "机构职责" },
  typical: { en: "Typical delivery role", zh: "典型交付角色" },
  research: { en: "R&D collaboration", zh: "研发合作" },
};

const chapters = [
  { id: "machine", number: "01", en: "How the machine works", zh: "机器怎样工作", intro: { en: "Start with the turbine. Then connect its motion, moorings and electrical system.", zh: "从风机开始，把运动、系泊和电气系统连接起来理解。" } },
  { id: "develop", number: "02", en: "How a project becomes buildable", zh: "项目怎样具备建设条件", intro: { en: "Development work runs in parallel. Investment, construction and operation need those workstreams to agree.", zh: "开发工作并行推进，投资、建设和运行要求各条工作线相互协调。" } },
  { id: "power", number: "03", en: "Follow 1 MWh: power and money", zh: "跟随 1 MWh：电力与资金", intro: { en: "Follow the physical connection first. Then look separately at ownership, electricity sales and settlement.", zh: "先沿物理连接看电力去向，再分别理解产权、售电和结算。" } },
  { id: "actors", number: "04", en: "Who does the work in the UK?", zh: "英国由谁完成这些工作？", intro: { en: "A representative, dated map of development clusters and delivery roles. Capability, plans and contracts are different evidence.", zh: "按日期呈现代表性开发区域与交付角色。能力、计划和合同是不同证据。" } },
  { id: "risks", number: "05", en: "Where projects get stuck", zh: "项目可能卡在哪里", intro: { en: "Ask where interfaces, resources and decisions depend on each other. These are investigation questions, not project risk scores.", zh: "识别接口、资源和决策的依赖关系。这些是调查问题，不是项目风险评分。" } },
];

const summaries: Record<number, { en: string; zh: string }> = {
  2: { en: "The developer integrates design, permissions, contracts, delivery and long-term ownership.", zh: "开发商统筹设计、许可、合同、交付与长期资产责任。" },
  3: { en: "Seventeen stages, with technical work, commercial work, decision-makers and exit conditions.", zh: "十七个阶段，逐项解释技术、商业、决策者及推进条件。" },
  4: { en: "Seabed rights are separate from construction consent. Scotland, England and Wales have different routes.", zh: "海床权利与建设许可分开，苏格兰、英格兰和威尔士程序不同。" },
  5: { en: "Rotor to seabed: physical functions and semi-submersible, spar and TLP tradeoffs.", zh: "从转子到海床，理解各部件及半潜式、Spar、TLP 的取舍。" },
  6: { en: "Generator, array, export and grid voltages serve different jobs; the owner can change along the path.", zh: "发电机、阵列、送出与电网电压用途不同，沿途产权也可能变化。" },
  7: { en: "A moving floater needs a cable that tolerates motion, tension, bending and fatigue.", zh: "运动浮体需要能承受位移、张力、弯曲和疲劳的海缆。" },
  8: { en: "Turbine strings, cable protection and the AC/DC export choice are design decisions.", zh: "风机回路、海缆防护及交直流送出均需设计选择。" },
  9: { en: "Substations collect, transform, protect and control power. Floating turbines do not imply a floating substation.", zh: "变电站汇集、变压、保护与控制电力；浮式风机不等于浮式变电站。" },
  10: { en: "Understand generator-build asset transfer, the OFTO business model and evolving alternatives.", zh: "理解开发商建设后的资产移交、OFTO 商业模式与变化中的方案。" },
  11: { en: "Generation owner, offshore transmission owner, onshore network owner and system operator are distinct.", zh: "发电业主、海上输电业主、陆上网络业主与系统运营方职责不同。" },
  12: { en: "Electricity flows continuously; sales, imbalance and balancing actions have separate commercial rules.", zh: "电力持续流动，售电、偏差结算和平衡行动各有商业规则。" },
  13: { en: "A two-way financial settlement stabilises eligible revenue. The generator still sells its power.", zh: "双向差额结算稳定符合条件的收入，发电商仍需另行售电。" },
  14: { en: "A technically sound design still needs a financeable allocation of cost, revenue and delivery risk.", zh: "技术可靠还不够，成本、收入和交付风险的分配必须能获得资金。" },
  15: { en: "Ports connect serial manufacturing, turbine integration, wet storage and tow-out.", zh: "港口连接批量制造、风机集成、湿储与拖航。" },
  16: { en: "Port and offshore work fronts converge at tow-out, hook-up, testing and energisation.", zh: "港口和海上工作面在拖航、连接、测试与送电环节汇合。" },
  17: { en: "Maintain the turbine and subsea system; plan major repair and funded decommissioning from the start.", zh: "维护风机和水下系统，并从一开始规划大修及退役资金。" },
  18: { en: "Scotland and the Celtic Sea offer different development and infrastructure contexts; pipeline is not generation.", zh: "苏格兰与凯尔特海开发及基础设施背景不同，开发储备不是已发电容量。" },
  19: { en: "Read each supplier or institution by its deliverable, customer and evidence boundary.", zh: "按交付物、客户与证据范围理解每个企业或机构。" },
  20: { en: "Twelve interfaces where packages, responsibilities or schedules can fail to align.", zh: "十二种可能出现设备包、责任或时序不一致的接口。" },
  21: { en: "Separate evidenced capacity and skills pressures from assumptions about an individual project.", zh: "把有证据的产能与技能压力，同单个项目的假设分开。" },
  22: { en: "One decision framework and fifteen questions for reading any UK floating wind project.", zh: "一个决策框架与十五个问题，帮助分析英国浮式风电项目。" },
};

function Inline({ text }: { text: string }): ReactNode {
  return text.split(/(\[[^\]]+\]\(https:\/\/[^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
    if (link) return <a key={index} href={link[2]}>{link[1]}</a>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function Blocks({ blocks, title, organisationCards = false }: { blocks: GuideBlock[]; title: string; organisationCards?: boolean }) {
  return blocks.map((block, index) => {
    if (block.type === "paragraph") return <p key={index}><Inline text={block.text} /></p>;
    if (block.type === "diagram") return <pre className="uk-flow-text" key={index}>{block.text}</pre>;
    if (block.type === "list") {
      const List = block.ordered ? "ol" : "ul";
      return <List key={index}>{block.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}</List>;
    }
    if (block.type === "table" && organisationCards) return <div className="uk-organisation-cards" key={index}>{block.rows.map((row, i) => {
      const evidence = guide.organisationEvidence[i];
      return <article className="uk-organisation-card" key={evidence.id}><h4><Inline text={row[0]} /></h4><p><Inline text={row[1]} /></p><p className="uk-role-boundary"><Inline text={row[2]} /></p>
        <div className="uk-card-evidence"><strong><Copy {...organisationLabels[evidence.kind]} /></strong>
          {evidence.sourceIds.map((id) => { const source = guide.sources.find((source) => source.id === id)!; return <p key={id}><a href={source.url}>{source.title}</a><br />{source.publisher} · {source.documentDate ?? <Copy en="Document date not established" zh="文件日期未确定" />}</p>; })}
        </div></article>;
    })}</div>;
    if (block.type === "table") return <div className="uk-table-scroll" key={index} tabIndex={0} role="region" aria-label={title}>
      <table><caption>{title}</caption><thead><tr>{block.headers.map((header, i) => <th scope="col" key={i}><Inline text={header} /></th>)}</tr></thead>
        <tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th scope="row" key={j}><Inline text={cell} /></th> : <td key={j}><Inline text={cell} /></td>)}</tr>)}</tbody>
      </table></div>;
    return null;
  });
}

function Evidence({ topic }: { topic: GuideTopic }) {
  return <details className="uk-evidence"><summary><Copy en="Sources, dates and claim scope" zh="来源、日期与证据范围" /> ({topic.sourceIds.length})</summary>
    <p><Copy en="These records support this topic. Review dates record our source check, not a project assessment or a guarantee that undated material is current." zh="这些记录支持本主题。复核日期表示来源核查，不是项目评估，也不保证未标日期的资料仍然最新。" /></p>
    <ul>{topic.sourceIds.map((id) => {
      const source = guide.sources.find((source) => source.id === id)!;
      return <li key={id}><a href={source.url}>{source.title}</a><p className="uk-source-meta">{source.publisher} · {source.jurisdiction}<br />
        <Copy en="Document / update date" zh="文件／更新日期" />: {source.documentDate ?? <Copy en="Not established from this record" zh="本记录未确定" />} · <Copy en="Reviewed" zh="已复核" />: <time dateTime={source.reviewedOn}>{source.reviewedOn}</time></p>
        <p className="uk-source-meta"><Copy en="Supports" zh="支持内容" />: <Copy {...topic.title} /></p>
        <p className="uk-source-meta" lang="en"><Copy en="Source claim scope (English)" zh="来源所支持的具体范围（英文）" />: {source.claimScope}</p>
      </li>;
    })}</ul>
  </details>;
}

function Topic({ topic, displayNumber }: { topic: GuideTopic; displayNumber: string }) {
  return <details className="uk-topic" id={topic.id}>
    <summary><span className="uk-topic-number">{displayNumber}</span><span><h3><Copy {...topic.title} /></h3><span className="uk-topic-summary"><Copy {...summaries[topic.number]} /></span></span><span className="uk-expand" aria-hidden="true">+</span></summary>
    <div className="uk-topic-body"><div className="uk-kinds">{topic.kinds.map((kind) => <span key={kind}><Copy {...labels[kind]} /></span>)}</div>
      <div className="uk-en" lang="en"><Blocks blocks={topic.content.en} title={topic.title.en} organisationCards={topic.number === 19} /></div>
      <div className="uk-zh" lang="zh-CN"><Blocks blocks={topic.content.zh} title={topic.title.zh} organisationCards={topic.number === 19} /></div>
      <Evidence topic={topic} />
    </div>
  </details>;
}

function MachineDiagram() {
  return <figure className="uk-machine"><div className="uk-machine-scroll" tabIndex={0} role="region" aria-label="Floating system schematic"><svg viewBox="0 0 820 440" role="img" aria-labelledby="uk-machine-title uk-machine-desc">
    <title id="uk-machine-title">Turbine, floater, mooring and cable interfaces / 风机、浮体、系泊和海缆接口</title>
    <desc id="uk-machine-desc"><Copy en="Schematic, not to scale. The turbine transfers load to the floater; separate mooring lines lead to anchors and a lazy-wave power cable reaches the seabed network." zh="不按比例的示意图。风机把载荷传到浮体；独立系泊线连接锚，懒波形电缆连接海床网络。" /></desc>
    <path className="uk-water" d="M20 237 H800" /><path className="uk-seabed" d="M20 400 H800" />
    <path className="uk-structure" d="M310 210 L320 96 L330 210 Z M268 210 H372 V249 H268 Z" />
    <circle className="uk-hub" cx="320" cy="88" r="11" /><path className="uk-blades" d="M320 80 L317 18 M328 93 L385 121 M312 94 L259 129" />
    <path className="uk-mooring" d="M275 248 Q240 360 115 396 M360 248 Q400 350 503 396" />
    <path className="uk-cable" d="M347 225 C400 350 440 360 466 307 S520 278 552 366 Q570 400 613 400 H790" />
    <circle className="uk-buoy" cx="477" cy="292" r="7" /><circle className="uk-buoy" cx="490" cy="284" r="7" />
    <path className="uk-anchor" d="M104 388 L115 401 L126 388 M492 388 L503 401 L514 388" />
    <text x="422" y="60"><Copy en="Rotor / nacelle / tower" zh="转子／机舱／塔架" /></text><path className="uk-callout" d="M414 65 L334 104" />
    <text x="32" y="195"><Copy en="Floater" zh="浮体" /></text><path className="uk-callout" d="M108 198 L269 220" />
    <text x="24" y="310"><Copy en="Mooring → anchors" zh="系泊 → 锚" /></text>
    <text x="520" y="240"><Copy en="Hang-off / bend control" zh="挂点／弯曲控制" /></text><path className="uk-callout" d="M517 244 L350 228" />
    <text x="540" y="294"><Copy en="Buoyancy modules" zh="浮力模块" /></text><path className="uk-callout" d="M535 290 L495 286" />
    <text x="580" y="355"><Copy en="Touchdown zone" zh="触地区域" /></text><path className="uk-callout" d="M584 360 L570 387" />
    <text x="25" y="427"><Copy en="Seabed / soil" zh="海床／土体" /></text><text x="580" y="427"><Copy en="Cable → array network" zh="海缆 → 阵列网络" /></text>
  </svg></div><figcaption><span className="uk-diagram-hint"><Copy en="Scroll the schematic horizontally; keyboard users can focus it and use arrow keys." zh="示意图可横向滚动；键盘用户可聚焦图示后使用方向键。" /></span><Copy en="An interface schematic, not a project design. Moorings carry station-keeping loads; the cable carries electricity and must tolerate motion." zh="这是接口示意，不是项目设计。系泊承担定位载荷；海缆输送电力并承受运动。" /></figcaption></figure>;
}

function IndustrialChain() {
  const topic = guide.topics[0];
  const en = topic.content.en.find((block) => block.type === "table");
  const zh = topic.content.zh.find((block) => block.type === "table");
  if (en?.type !== "table" || zh?.type !== "table") return null;
  return <section className="uk-chain" id="uk-chain" aria-labelledby="uk-chain-heading">
    <div className="uk-section-intro"><p className="uk-eyebrow"><Copy en="Start here · four connected maps" zh="从这里开始 · 四种关联图" /></p>
      <h2 id="uk-chain-heading"><Copy en="Build from the bottom up." zh="从产业链底层逐级理解。" /></h2>
      <p><Copy en="First follow what gets delivered. Open a level to see its customer, payment relationship, risks and examples. Network operation and public coordination are different layers." zh="先看交付物。展开每层查看客户、付款关系、风险与例子。网络运行和公共协调属于不同层面。" /></p></div>
    <div className="uk-chain-lanes">{[
      { en: "Industrial delivery", zh: "工业交付", rows: [0, 1, 2, 3, 4, 5] },
      { en: "Connection and electricity system", zh: "连接与电力系统", rows: [6, 7] },
      { en: "Permissions and coordination · alongside", zh: "许可与协调 · 并行层", rows: [8] },
    ].map((lane) => <div className="uk-chain-lane" key={lane.en}><h3><Copy en={lane.en} zh={lane.zh} /></h3>{lane.rows.map((rowIndex) => <details className="uk-tier" key={rowIndex}>
      <summary><span className="uk-tier-number">{String(rowIndex + 1).padStart(2, "0")}</span><strong><Copy en={en.rows[rowIndex][0]} zh={zh.rows[rowIndex][0]} /></strong></summary>
      <dl>{en.headers.slice(1).map((header, j) => <div key={j}><dt><Copy en={header} zh={zh.headers[j + 1]} /></dt><dd><span className="uk-en"><Inline text={en.rows[rowIndex][j + 1]} /></span><span className="uk-zh"><Inline text={zh.rows[rowIndex][j + 1]} /></span></dd></div>)}</dl>
    </details>)}</div>)}</div>
    <p className="uk-note"><Copy en="Reading rule: delivery arrows do not imply ownership, regulatory authority or a payment direction. The developer can contract directly or through package leads." zh="阅读规则：交付箭头不代表产权、监管权或付款方向。开发商可以直接采购，也可通过设备包牵头方采购。" /></p>
    <details className="uk-topic"><summary><h3><Copy en="Read the four-chain explanation" zh="阅读四种关系的完整解释" /></h3></summary><div className="uk-topic-body"><div className="uk-en"><Blocks blocks={topic.content.en.filter((b) => b.type !== "table")} title={topic.title.en} /></div><div className="uk-zh"><Blocks blocks={topic.content.zh.filter((b) => b.type !== "table")} title={topic.title.zh} /></div><Evidence topic={topic} /></div></details>
  </section>;
}

export function UKSystemGuide() {
  return <div className="uk-guide"><style>{guideStyles}</style>
    <header className="uk-hero"><p className="uk-eyebrow"><Copy en="Industry Map / UK field guide" zh="产业图谱／英国系统指南" /></p>
      <h1><Copy en="From materials to megawatt-hours." zh="从材料到兆瓦时。" /></h1>
      <p className="uk-lead"><Copy en="A floating wind farm is a machine, a development project and an electricity business. See how the UK system fits together—and who is responsible at each interface." zh="浮式风电场既是一套机器，也是一个开发项目和电力业务。了解英国体系如何衔接，以及每个接口由谁负责。" /></p>
      <div className="uk-hero-bottom"><p><Copy en="UK supply chain · GB electricity system and market" zh="英国供应链 · GB 电力系统与市场" /><br /><Copy en="Evidence reviewed" zh="证据复核" /> <time dateTime={guide.reviewedOn}>{guide.reviewedOn}</time></p><a href="#uk-chain"><Copy en="Start with the complete chain" zh="从完整产业链开始" /> ↓</a></div>
    </header>
    <nav className="uk-chapter-nav" aria-label="UK floating wind guide"><a href="#uk-chain"><Copy en="The complete chain" zh="完整产业链" /></a>{chapters.map((chapter) => <a href={`#uk-${chapter.id}`} key={chapter.id}><span>{chapter.number}</span> <Copy en={chapter.en} zh={chapter.zh} /></a>)}<a href="#industry-catalogue"><Copy en="Company reference" zh="企业参考目录" /></a></nav>
    <div className="uk-lenses">{[
      ["01", "Equipment", "设备", "Who supplies what?", "谁交付什么？"],
      ["02", "Development", "开发", "What must be ready?", "哪些条件须就绪？"],
      ["03", "Permissions", "许可", "Who can authorise it?", "谁有权批准？"],
      ["04", "Power & money", "电力与资金", "Where does each flow go?", "两种流向各去哪里？"],
    ].map(([number, en, zh, question, questionZh]) => <div key={number}><span>{number}</span><h2><Copy en={en} zh={zh} /></h2><p><Copy en={question} zh={questionZh} /></p></div>)}</div>
    <IndustrialChain />
    {chapters.map((chapter) => <section className="uk-chapter" key={chapter.id} id={`uk-${chapter.id}`} aria-labelledby={`uk-${chapter.id}-heading`}>
      <header className="uk-section-intro"><p className="uk-eyebrow"><Copy en={`Chapter ${chapter.number}`} zh={`第 ${chapter.number} 章`} /></p><h2 id={`uk-${chapter.id}-heading`}><Copy en={chapter.en} zh={chapter.zh} /></h2><p><Copy {...chapter.intro} /></p></header>
      {chapter.id === "machine" && <MachineDiagram />}
      {chapter.id === "develop" && <div className="uk-decision-map"><p><Copy en="Parallel development workstreams" zh="并行开发工作线" /></p><div><span><Copy en="Rights + consent" zh="权利＋许可" /></span><span><Copy en="Design + supply chain" zh="设计＋供应链" /></span><span><Copy en="Grid + revenue + finance" zh="电网＋收入＋资金" /></span></div><strong>↓ <Copy en="Investment decision → construction → operation" zh="投资决定 → 建造 → 运行" /></strong><p className="uk-note"><Copy en="FID is an investor decision, not a universal regulatory certificate. Workstreams overlap; unresolved conditions still need owners and closure plans." zh="FID 是投资者决定，不是统一监管证书。工作相互重叠，未解决条件仍须有人负责并有落实计划。" /></p></div>}
      {chapter.id === "power" && <div className="uk-power-lanes"><div><p className="uk-eyebrow"><Copy en="Physical path" zh="物理路径" /></p><p><Copy en="Wind → rotor → generator → converter / transformer → array → export → grid → demand" zh="风 → 转子 → 发电机 → 变流／变压 → 阵列 → 送出 → 电网 → 需求" /></p></div><div><p className="uk-eyebrow"><Copy en="Commercial path" zh="商业路径" /></p><p><Copy en="Power buyer → generator · LCCC ↔ generator · imbalance settlement and network charges separately" zh="购电方 → 发电商 · LCCC ↔ 发电商 · 偏差结算及网络费用分开" /></p></div><p className="uk-note"><Copy en="The walkthrough is illustrative: it does not trace individual electrons or assume that 1 MWh reaches the customer without losses." zh="这是解释性示例，不追踪单个电子，也不假设 1 MWh 无损耗到达用户。" /></p></div>}
      {guide.topics.filter((topic) => topic.chapter === chapter.id).map((topic, index) => <Topic key={topic.id} topic={topic} displayNumber={`${chapter.number}.${index + 1}`} />)}
      <a className="uk-back" href="#uk-chain"><Copy en="Back to the complete chain" zh="返回完整产业链" /> ↑</a>
    </section>)}
    <aside className="uk-boundary"><h2><Copy en="How to read the evidence" zh="如何理解证据" /></h2><div className="uk-kinds">{Object.entries(labels).map(([id, label]) => <span key={id}><Copy {...label} /></span>)}</div>
      <p><Copy en="Sources and dates sit inside each topic. An example is not a claim about every project. Plans, contracts and operating assets are different states. Our engineering interpretations explain dependencies; they do not update project assessments." zh="各主题内提供来源和日期。个别例子不代表所有项目。计划、合同和运行资产属于不同状态。工程解读解释依赖关系，不更新项目评估。" /></p>
      <p><Copy en="The market guide covers Great Britain; Northern Ireland has separate arrangements. This representative map is not a complete supplier register. Source titles and proper names remain in their original language." zh="市场说明覆盖大不列颠，北爱尔兰另有安排。代表性图谱不是完整供应商名录。来源标题与专有名称保留原文。" /></p>
    </aside>
  </div>;
}
