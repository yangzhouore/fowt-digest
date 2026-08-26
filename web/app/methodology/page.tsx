import type { Metadata } from "next";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import { LocalizedCopy } from "../i18n/localized-copy";

const coverageAreas = [
  {
    title: "Engineering",
    titleZh: "工程",
    text: "What happened: source-backed project, technology, infrastructure, policy, supply-chain and operational developments.",
    textZh: "发生了什么：有来源依据的项目、技术、基础设施、政策、供应链和运营动态。",
  },
  {
    title: "Research",
    titleZh: "研究",
    text: "What is being studied: recent papers selected from a deterministic OpenAlex workflow.",
    textZh: "正在研究什么：由确定性 OpenAlex 工作流筛选的近期论文。",
  },
  {
    title: "Industry",
    titleZh: "产业",
    text: "Who builds it: a curated map of companies and roles across the floating-wind value chain.",
    textZh: "谁在建设：经整理的浮式风电价值链企业与角色图谱。",
  },
  {
    title: "Projects",
    titleZh: "项目",
    text: "Where it is happening: structured project facts, status, participants, timelines and sources.",
    textZh: "在哪里发生：结构化的项目事实、状态、参与方、时间线和来源。",
  },
  {
    title: "Digital & AI",
    titleZh: "数字化与 AI",
    text: "How digital technologies may change offshore wind, and how offshore wind may support AI and compute infrastructure.",
    textZh: "数字技术如何改变海上风电，以及海上风电如何支持 AI 与算力基础设施。",
  },
];

const researchFlow = [
  "OpenAlex weekly candidates",
  "normalise metadata",
  "exact deduplication",
  "FOWT classification",
  "100-point score",
  "rank and select up to 5",
];

const researchScoreComponents = [
  {
    label: "FOWT relevance",
    points: 35,
    text: "Classifier result, explicit floating-offshore-wind phrases, combined floating and wind terms, and classifier confidence.",
  },
  {
    label: "Technical specificity",
    points: 25,
    text: "Controlled signals covering aerodynamics, hydrodynamics, station keeping, structures, controls, platforms, electrical systems, numerical methods and economics.",
  },
  {
    label: "Research value",
    points: 15,
    text: "Signals for validation, datasets, modelling, optimisation and design, plus the availability of an abstract.",
  },
  {
    label: "Venue quality",
    points: 10,
    text: "A transparent proxy based on source metadata, publication type and technical or repository terms. Journal impact factor is not used.",
  },
  {
    label: "Metadata quality",
    points: 10,
    text: "Completeness of identifiers, source URL, authors, publication source, abstract, topic tags and text-availability metadata.",
  },
  {
    label: "Recency",
    points: 5,
    text: "Publication date relative to the newest candidate in that weekly pool.",
  },
];

const engineeringFlow = [
  "Approved sources",
  "weekly discovery",
  "date and FOWT filtering",
  "duplicate-event grouping",
  "100-point score",
  "diversity and up to 5",
];

const engineeringScoreComponents = [
  {
    label: "Engineering relevance",
    points: 30,
    text: "Explicit floating-wind, offshore-wind and engineering terms for areas such as ports, installation, fabrication, cables, moorings, vessels and grid connection.",
  },
  {
    label: "Project / company",
    points: 25,
    text: "Named project or supply-chain entities and concrete events such as tenders, selections, partnerships, support decisions and study groups.",
  },
  {
    label: "Technology",
    points: 20,
    text: "Controlled groups for ports, floating platforms, cables, installation, fabrication and digital engineering.",
  },
  {
    label: "Policy / market",
    points: 15,
    text: "Government, procurement, regulation, consenting, leasing, state-support, market and supply-chain signals.",
  },
  {
    label: "Source quality",
    points: 10,
    text: "A source-type proxy that gives more weight to government and standards records, followed by attributable company, association, conference and trade sources.",
  },
];

const projectLinks = [
  {
    href: "https://github.com/yangzhouore/fowt-digest",
    label: "GitHub repository",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/pipeline/ranker.py",
    label: "Research scoring implementation",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/web/scripts/engineering-selection-scoring.js",
    label: "Engineering scoring implementation",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/docs/ENGINEERING_SOURCE_POLICY.md",
    label: "Engineering Source Policy",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/docs/M11_DIGITAL_AI_SIGNALS_DESIGN.md",
    label: "Digital & AI scope and evidence rules",
  },
];

const limitations = [
  "Coverage is incomplete. OpenAlex, the approved Engineering registry and the curated website datasets do not represent every relevant paper, organisation, project or industry event.",
  "Source choice and deterministic weights introduce bias. A high score means a record matched the published model; it is not a universal measure of scientific quality or industry importance.",
  "Historical candidate pools may be retained or reconstructed. Reconstructed Research and Engineering pools can drift because upstream pages, indexes and metadata change over time.",
  "Research selection relies heavily on metadata, topic tags and abstracts. It does not imply that every full paper has been reviewed, and missing or weak abstracts can affect classification and score.",
  "Project facts and status can change after access. Static records may lag announcements, construction changes, ownership changes, pauses or cancellations.",
  "Digital & AI is an emerging field. Research, prototypes and pilots must not be read as proven commercial performance, and speculative infrastructure pathways are labelled cautiously.",
  "Projects are maintained independently from Research, Engineering and Industry. Cross-area relationships are not inferred or automatically synchronized, so valid links and updates may be absent.",
];

const methodologyZh: Record<string, string> = {
  "OpenAlex weekly candidates": "OpenAlex 每周候选记录", "normalise metadata": "规范化元数据", "exact deduplication": "精确去重",
  "FOWT classification": "浮式海上风电分类", "100-point score": "百分制评分", "rank and select up to 5": "排序并最多选择 5 条",
  "Approved sources": "已批准来源", "weekly discovery": "每周发现", "date and FOWT filtering": "日期与浮式海上风电筛选",
  "duplicate-event grouping": "重复事件分组", "diversity and up to 5": "多样性处理并最多选择 5 条",
  "FOWT relevance": "浮式海上风电相关性", "Technical specificity": "技术具体性", "Research value": "研究价值", "Venue quality": "发表渠道质量",
  "Metadata quality": "元数据质量", Recency: "时效性", "Engineering relevance": "工程相关性", "Project / company": "项目 / 企业",
  Technology: "技术", "Policy / market": "政策 / 市场", "Source quality": "来源质量", Total: "总分",
};

const methodologyDescriptionZh: Record<string, string> = {
  "FOWT relevance": "分类结果、明确的浮式海上风电短语、浮式与风电组合术语，以及分类置信度。",
  "Technical specificity": "涵盖空气动力学、水动力学、定位保持、结构、控制、平台、电气系统、数值方法和经济性的受控信号。",
  "Research value": "验证、数据集、建模、优化和设计信号，以及摘要是否可用。",
  "Venue quality": "基于来源元数据、出版类型及技术或存储库术语的透明代理指标，不使用期刊影响因子。",
  "Metadata quality": "标识符、来源 URL、作者、出版来源、摘要、主题标签和文本可用性元数据的完整程度。",
  Recency: "相对于该周候选池中最新记录的发布日期。",
  "Engineering relevance": "浮式风电、海上风电以及港口、安装、制造、海缆、系泊、船舶和并网等工程领域的明确术语。",
  "Project / company": "具名项目或供应链实体，以及招标、选定、合作、支持决定和研究组等具体事件。",
  Technology: "港口、浮式平台、海缆、安装、制造和数字工程等受控技术组。",
  "Policy / market": "政府、采购、监管、许可、租赁、国家支持、市场和供应链信号。",
  "Source quality": "来源类型代理指标，对政府和标准记录赋予更高权重，其次为可归属的企业、协会、会议和行业来源。",
};

const limitationsZh = [
  "覆盖并不完整。OpenAlex、已批准的工程来源名录和网站精选数据集不能代表所有相关论文、机构、项目或产业事件。",
  "来源选择和确定性权重会引入偏差。高分表示记录符合已公布的模型，并非衡量科研质量或产业重要性的通用标准。",
  "历史候选池可能被保留或重建。由于上游页面、索引和元数据会随时间变化，重建的研究和工程候选池可能产生偏移。",
  "研究筛选高度依赖元数据、主题标签和摘要。这并不表示每篇全文都经过审阅；缺失或质量较弱的摘要会影响分类与评分。",
  "项目事实和状态可能在访问后发生变化。静态记录可能滞后于公告、施工变化、所有权变更、暂停或取消。",
  "数字化与 AI 仍属新兴领域。研究、原型和试点不应被视为已证实的商业表现；推测性的基础设施路径会被审慎标注。",
  "项目数据独立于研究、工程和产业内容维护。跨领域关系不会被推断或自动同步，因此可能缺少有效关联与更新。",
];

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How FOWT Digest sources, selects and presents floating and offshore wind intelligence.",
};

export default function MethodologyPage() {
  return (
    <main className="methodology-page">
      <SiteHeader />

      <section className="intro" aria-labelledby="methodology-heading">
        <p className="eyebrow"><LocalizedCopy en="01 / What FOWT Digest is" zh="01 / FOWT Digest 是什么" /></p>
        <h1 id="methodology-heading"><LocalizedCopy en="Source-backed intelligence for floating and offshore wind." zh="有来源依据的浮式及海上风电情报简报。" /></h1>
        <p>
          <LocalizedCopy en="FOWT Digest is a static intelligence briefing for people who need a clear view of floating offshore wind without treating every source as equally important or every missing fact as permission to infer. It brings together engineering developments, research papers, industry roles, projects, and a narrow Digital & AI evidence set. Published records remain linked to their underlying sources." zh="FOWT Digest 是面向需要清晰了解浮式海上风电读者的静态情报简报。它不会把所有来源视为同等重要，也不会用推断填补缺失事实。网站汇集工程动态、研究论文、产业角色、项目，以及范围明确的数字化与 AI 证据；已发布记录始终链接至原始来源。" />
        </p>
      </section>

      <section aria-labelledby="why-heading">
        <p className="eyebrow"><LocalizedCopy en="02 / Why this exists" zh="02 / 为什么建立这个网站" /></p>
        <h2 id="why-heading"><LocalizedCopy en="Less noise, clearer evidence." zh="减少噪声，呈现更清晰的证据。" /></h2>
        <p>
          <LocalizedCopy en="Floating wind knowledge is distributed across academic indexes, government and regulatory pages, project announcements, standards bodies, technical organisations, company releases and trade sources. FOWT Digest reduces the time needed to scan that material while preserving the route back to the original record. It is a briefing, not a claim of complete market coverage and not a substitute for primary technical, commercial, legal or investment due diligence." zh="浮式风电知识分散在学术索引、政府与监管机构页面、项目公告、标准机构、技术组织、企业发布和行业媒体中。FOWT Digest 在保留原始记录路径的同时，减少浏览这些材料所需的时间。它是一份简报，不声称完整覆盖市场，也不能替代一手技术、商业、法律或投资尽职调查。" />
        </p>
      </section>

      <section aria-labelledby="audience-heading">
        <p className="eyebrow"><LocalizedCopy en="03 / Who this is for" zh="03 / 面向谁" /></p>
        <h2 id="audience-heading"><LocalizedCopy en="Readers working across the FOWT system." zh="面向浮式海上风电体系的专业读者。" /></h2>
        <p>
          <LocalizedCopy en="The intended readers are offshore-wind engineers, researchers, developers, project and supply-chain teams, public-sector and policy professionals, students, and others who need a concise technical orientation. The site assumes domain interest but does not assume that every reader follows every journal, project or supplier." zh="目标读者包括海上风电工程师、研究人员、开发商、项目与供应链团队、公共部门和政策专业人士、学生，以及需要简明技术导览的其他读者。网站假定读者关注该领域，但不要求其持续跟踪每一本期刊、每个项目或每家供应商。" />
        </p>
      </section>

      <section aria-labelledby="coverage-heading">
        <p className="eyebrow"><LocalizedCopy en="04 / What the site covers" zh="04 / 网站涵盖什么" /></p>
        <h2 id="coverage-heading"><LocalizedCopy en="Five views of one sector." zh="从五个视角理解同一产业。" /></h2>
        <div className="methodology-sectors">
          {coverageAreas.map((area) => (
            <article className="methodology-sector" key={area.title}>
              <h3><LocalizedCopy en={area.title} zh={area.titleZh} /></h3>
              <p><LocalizedCopy en={area.text} zh={area.textZh} /></p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="sources-heading">
        <p className="eyebrow"><LocalizedCopy en="05 / Sources" zh="05 / 来源" /></p>
        <h2 id="sources-heading"><LocalizedCopy en="Attributable records before presentation." zh="先有可归属的记录，再进行呈现。" /></h2>
        <p>
          <LocalizedCopy en="Research candidates currently come from OpenAlex searches within a defined weekly publication window. Engineering starts from a controlled registry of public, attributable sources covering government and regulators, developers and suppliers, standards and certification, ports, engineering software, associations, universities, conferences and specialist trade press. Industry, Projects and Digital & AI use curated static records with source URLs and provenance fields." zh="研究候选记录目前来自限定每周发布日期窗口的 OpenAlex 搜索。工程简报从受控的公开、可归属来源名录开始，涵盖政府与监管机构、开发商与供应商、标准与认证机构、港口、工程软件、协会、高校、会议及专业行业媒体。产业、项目和数字化与 AI 使用带有来源 URL 与溯源字段的精选静态记录。" />
        </p>
        <p>
          <LocalizedCopy en="Primary and authoritative sources are preferred where available. Company and trade sources can provide useful evidence, but their claims are kept within the boundary of what the stored record supports. Missing facts remain absent or unknown. The site does not silently repair dates, relationships, technical values or project status." zh="在条件允许时优先采用一手和权威来源。企业与行业媒体也可提供有用证据，但其主张不会超出存储记录所支持的范围。缺失事实保持空缺或未知；网站不会静默补全日期、关系、技术数值或项目状态。" />
        </p>
        <ul className="project-link-list">
          {projectLinks.map((link) => (
            <li key={link.href}><a href={link.href}>{link.label}</a></li>
          ))}
        </ul>
      </section>

      <section className="research-selection-visual" aria-labelledby="research-selection-heading">
        <p className="eyebrow"><LocalizedCopy en="06 / How Research selection works" zh="06 / 研究内容如何筛选" /></p>
        <h2 id="research-selection-heading"><LocalizedCopy en="A deterministic paper pipeline." zh="确定性的论文流水线。" /></h2>
        <p>
          <LocalizedCopy en="The local Research pipeline queries OpenAlex using controlled FOWT terms and a weekly publication-date window. It stores raw responses, normalises identifiers and metadata, reconstructs abstracts when available, and deduplicates exact matches using DOI, OpenAlex ID or normalised title plus publication date. It then classifies each paper as Relevant, Possibly Relevant or Not Relevant from title, abstract and topic-tag signals. No language model performs this classification." zh="本地研究流水线使用受控的浮式海上风电术语和每周发布日期窗口查询 OpenAlex。它存储原始响应、规范化标识符与元数据、在可用时重建摘要，并通过 DOI、OpenAlex ID 或规范化标题加发布日期进行精确去重。随后依据标题、摘要和主题标签信号，将论文确定性地分类为相关、可能相关或不相关；此分类不使用语言模型。" />
        </p>
        <ol className="research-flow" aria-label="Research selection flow">
          {researchFlow.map((step) => <li key={step}><LocalizedCopy en={step} zh={methodologyZh[step] ?? step} /></li>)}
        </ol>
        <ScoreFormula components={researchScoreComponents} label="Research 100 point score formula" />
        <p>
          <LocalizedCopy en="research_selection_score_v1 is computed before ranking. Candidates are ordered by total score, then relevance classification, publication date and paper ID as stable tie-breakers. Not Relevant records are ineligible; the first eligible records are selected up to the five-paper limit. Candidate pages expose the score and component evidence where pool data exists. The website reads committed digest JSON and does not re-rank or rewrite papers." zh="research_selection_score_v1 在排序前计算。候选记录先按总分排序，再以相关性分类、发布日期和论文 ID 作为稳定的同分排序依据。不相关记录不具备入选资格；从符合条件的记录中依次选择，最多五篇。在存在候选池数据时，候选页面会公开分数与各组成项证据。网站仅读取已提交的摘要 JSON，不会重新排序或改写论文。" />
        </p>
      </section>

      <section className="research-selection-visual" aria-labelledby="engineering-selection-heading">
        <p className="eyebrow"><LocalizedCopy en="07 / How Engineering selection works" zh="07 / 工程内容如何筛选" /></p>
        <h2 id="engineering-selection-heading"><LocalizedCopy en="A separate source-record workflow." zh="独立的来源记录工作流。" /></h2>
        <p>
          <LocalizedCopy en="Engineering does not use the Research paper pipeline. Candidates are discovered from approved public sources, retained for the weekly date window, filtered for basic FOWT relevance, and grouped to remove duplicate coverage of the same event. Collection audits record source attempts and candidate counts where that evidence exists. Each retained source record preserves publisher, title, URL, date, source type, evidence text, retrieval information and licensing notes." zh="工程简报不使用研究论文流水线。候选记录从已批准的公开来源中发现，按每周日期窗口保留，经过基础浮式海上风电相关性筛选，并通过分组移除同一事件的重复报道。在有相应证据时，采集审计会记录来源尝试与候选数量。每条保留的来源记录均保存发布方、标题、URL、日期、来源类型、证据文本、检索信息和许可说明。" />
        </p>
        <ol className="research-flow" aria-label="Engineering selection flow">
          {engineeringFlow.map((step) => <li key={step}><LocalizedCopy en={step} zh={methodologyZh[step] ?? step} /></li>)}
        </ol>
        <ScoreFormula components={engineeringScoreComponents} label="Engineering 100 point score formula" />
        <p>
          <LocalizedCopy en="engineering_selection_score_v1 ranks candidates by total score, using source record ID as the deterministic tie-breaker. A separate deterministic diversity step can defer duplicate project groups and prefer broader technology coverage before selecting up to five highlights. Fewer than five may be published when the source pool does not support padding. The resulting briefing copy and sources are committed as static data; the website does not discover or score news at runtime." zh="engineering_selection_score_v1 按总分排列候选记录，并使用来源记录 ID 作为确定性的同分排序依据。独立的确定性多样性步骤可推后重复项目组，并优先扩大技术覆盖，然后最多选择五条重点。当来源池不足以合理补足时，发布数量可以少于五条。最终简报文案和来源以静态数据提交；网站不会在运行时发现或评分新闻。" />
        </p>
      </section>

      <section aria-labelledby="structured-intelligence-heading">
        <p className="eyebrow"><LocalizedCopy en="08 / How Industry and Projects work" zh="08 / 产业与项目如何组织" /></p>
        <h2 id="structured-intelligence-heading"><LocalizedCopy en="Structured intelligence, not ranked feeds." zh="结构化情报，而非排名信息流。" /></h2>
        <div className="methodology-sectors">
          <article className="methodology-sector">
            <h3><LocalizedCopy en="Industry" zh="产业" /></h3>
            <p>
              <LocalizedCopy en="The Industry Map organises curated organisations by declared roles across project ownership, turbines, floating platforms, moorings, cables, electrical systems, installation, assurance, engineering and simulation. Each company entry includes a representative involvement and source URL. Placement explains a value-chain role; it is not a quality ranking or endorsement." zh="产业图谱按照已声明的角色组织精选机构，覆盖项目所有权、风机、浮式平台、系泊、海缆、电气系统、安装、认证保障、工程和仿真。每个企业条目包含代表性参与情况和来源 URL。图谱位置说明其价值链角色，并非质量排名或背书。" />
            </p>
          </article>
          <article className="methodology-sector">
            <h3><LocalizedCopy en="Projects" zh="项目" /></h3>
            <p>
              <LocalizedCopy en="Projects are maintained as static structured records. Controlled status values make filtering consistent, while individual facts, company relationships and timeline events retain source references and, where needed, field-level claims. Relationships are stored only when supported. Unsupported values remain null rather than being estimated from adjacent projects or companies." zh="项目以静态结构化记录维护。受控状态值确保筛选一致；各项事实、企业关系和时间线事件保留来源引用，并在需要时保留字段级主张。只有得到证据支持的关系才会存储；不受支持的值保持为空，不会根据相邻项目或企业进行估算。" />
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="digital-ai-method-heading">
        <p className="eyebrow"><LocalizedCopy en="09 / Digital & AI methodology" zh="09 / 数字化与 AI 方法" /></p>
        <h2 id="digital-ai-method-heading"><LocalizedCopy en="Offshore wind × digital systems, narrowly defined." zh="严格限定海上风电 × 数字系统的范围。" /></h2>
        <p>
          <LocalizedCopy en="Digital & AI covers applications with a direct offshore-wind, wind-infrastructure or energy-system connection: engineering models, digital twins, autonomous inspection, robotics, industrial software, forecasting, grid integration and relevant compute infrastructure. It excludes generic AI news. Every Signal stores its sector connection, maturity, evidence type and source IDs." zh="数字化与 AI 仅涵盖与海上风电、风电基础设施或能源系统直接相关的应用，包括工程模型、数字孪生、自主检测、机器人、工业软件、预测、并网及相关算力基础设施；不包含泛 AI 新闻。每条信号均存储其产业关联、成熟度、证据类型和来源 ID。" />
        </p>
        <p>
          <LocalizedCopy en="The page separates application areas from real-world evidence. The lifecycle map shows where digital methods could enter engineering practice; linked Signals show what the current source set actually supports. Offshore-wind-to-AI pathways distinguish grid-based supply from emerging coastal, offshore and flexible-compute concepts. Emerging or experimental labels are cautions, not predictions of commercial success." zh="页面将应用领域与现实证据分开。生命周期图展示数字方法可能进入工程实践的位置；关联信号则说明当前来源集实际支持哪些内容。海上风电到 AI 的路径区分电网供能与新兴的沿海、海上和灵活算力概念。“新兴”或“试验性”是审慎限定，而非对商业成功的预测。" />
        </p>
      </section>

      <section aria-labelledby="editorial-control-heading">
        <p className="eyebrow"><LocalizedCopy en="10 / Editorial control and neutrality" zh="10 / 编辑控制与中立性" /></p>
        <h2 id="editorial-control-heading"><LocalizedCopy en="Deterministic tools support, but do not replace, judgement." zh="确定性工具辅助判断，但不取代判断。" /></h2>
        <p>
          <LocalizedCopy en="Collection records, validation rules and scoring make selection more inspectable and repeatable. They do not make it objective in an absolute sense. Source lists, keyword groups, weights, taxonomies and diversity rules are editorial choices and can shape what appears. Scores are selection aids, not technical verdicts." zh="采集记录、验证规则和评分使筛选更易检查、更可重复，但并不意味着绝对客观。来源列表、关键词组、权重、分类体系和多样性规则均属编辑选择，会影响最终呈现。分数是筛选辅助，不是技术结论。" />
        </p>
        <p>
          <LocalizedCopy en="Publication remains a human-controlled repository action: static data is inspected, validated and committed before it reaches the website. The current site does not use AI to write published summaries or to make final publication decisions. Inclusion does not endorse an organisation, technology or project. Provenance is preserved so readers can inspect the evidence and form their own view." zh="发布仍是由人工控制的代码仓库操作：静态数据在进入网站前会经过检查、验证和提交。当前网站不使用 AI 撰写已发布摘要，也不由 AI 作最终发布决定。收录不代表对任何机构、技术或项目的认可。网站保留溯源信息，供读者检查证据并形成自己的判断。" />
        </p>
      </section>

      <section aria-labelledby="limitations-heading">
        <p className="eyebrow"><LocalizedCopy en="11 / Known limitations" zh="11 / 已知局限" /></p>
        <h2 id="limitations-heading"><LocalizedCopy en="What this methodology cannot guarantee." zh="本方法无法保证的事项。" /></h2>
        <ul className="methodology-step-list">
          {limitations.map((limitation, index) => (
            <li key={limitation}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p><LocalizedCopy en={limitation} zh={limitationsZh[index]} /></p>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}

function ScoreFormula({
  components,
  label,
}: {
  components: Array<{ label: string; points: number; text: string }>;
  label: string;
}) {
  return (
    <div className="score-formula" aria-label={label}>
      <dl>
        {components.map((component) => (
          <div key={component.label}>
            <dt><LocalizedCopy en={component.label} zh={methodologyZh[component.label] ?? component.label} /></dt>
            <dd>{component.points}</dd>
          </div>
        ))}
        <div className="score-total">
          <dt><LocalizedCopy en="Total" zh="总分" /></dt>
          <dd>100</dd>
        </div>
      </dl>
      <div className="score-component-copy">
        {components.map((component) => (
          <p key={component.label}>
            <strong><LocalizedCopy en={`${component.label}:`} zh={`${methodologyZh[component.label] ?? component.label}：`} /></strong>{" "}<LocalizedCopy en={component.text} zh={methodologyDescriptionZh[component.label] ?? component.text} />
          </p>
        ))}
      </div>
    </div>
  );
}
