import Link from "next/link";
import { getProjectEngineeringCoverage, getEngineeringProjectContext, getIndustryEntryHref, getCompanyProjectRecords } from "../data/connected-context-adapter";
import { LocalizedCopy as Copy } from "./i18n/localized-copy";

type Coverage = ReturnType<typeof getProjectEngineeringCoverage>;

function CoverageCard({ link }: { link: Coverage[number] }) {
  return <li className="context-coverage-card">
    <h3>{link.title}</h3>
    <p className="context-meta"><Copy en="Source date" zh="来源日期" />: <time dateTime={link.publishedDate}>{link.publishedDate}</time> · <Copy en="Briefing week" zh="简报周次" />: {link.dateRange}</p>
    <p className="context-meta"><Copy en="Project-specific coverage" zh="项目专属报道" /> · {link.publisher}</p>
    <Link href={link.href}><Copy en="Read Engineering item" zh="阅读工程条目" /><span className="context-sr-only"> — {link.title}</span></Link>
    <details className="context-link-basis">
      <summary><Copy en="Why this link?" zh="为何关联？" /><span className="context-sr-only"> — {link.title}</span></summary>
      <p><Copy en="This published item covers this project's activity. The extract below comes from the stored source record; it is not a new quotation from the original publication." zh="此已发布条目报道该项目的活动。下方节选来自已存档的来源记录，并非重新摘录原始出版物。" /></p>
      <p className="context-stored-excerpt">{link.storedExcerpt}</p>
      <p>{link.publisher} · <a href={link.sourceUrl}><Copy en="Original source" zh="原始来源" /></a></p>
    </details>
  </li>;
}

export function EngineeringCoverageList({ coverage }: { coverage: Coverage }) {
  return coverage.length ? <>
    <ul className="context-coverage-list">{coverage.slice(0, 3).map((link) => <CoverageCard key={link.id} link={link} />)}</ul>
    {coverage.length > 3 && <details className="context-more"><summary><Copy en={`Show all linked coverage (${coverage.length})`} zh={`查看全部关联报道（${coverage.length}）`} /></summary>
      <ul className="context-coverage-list">{coverage.slice(3).map((link) => <CoverageCard key={link.id} link={link} />)}</ul>
    </details>}
  </> : <p><Copy en="No project-specific Engineering coverage linked" zh="未关联项目专属工程报道" /></p>;
}

export function ProjectEngineeringCoverage({ projectId }: { projectId: string }) {
  return <section className="project-intel-section connected-project-context" aria-labelledby="engineering-coverage-heading">
    <h2 id="engineering-coverage-heading"><Copy en="Engineering coverage" zh="工程报道" /></h2>
    <p className="project-muted-note"><Copy en="Published coverage may predate the current assessment. These reading links do not update project facts, readiness or assessment review dates." zh="已发布报道可能早于当前评估。这些阅读链接不会更新项目事实、准备度或评估复核日期。" /></p>
    <EngineeringCoverageList coverage={getProjectEngineeringCoverage(projectId)} />
  </section>;
}

export function EngineeringProjectContext({ editionSlug, itemId }: { editionSlug: string; itemId: string }) {
  const links = getEngineeringProjectContext(editionSlug, itemId);
  if (!links.length) return null;
  return <div className="engineering-project-context">
    <p><strong><Copy en="Project context" zh="项目背景" /></strong></p>
    <ul>{links.map((link) => <li key={link.id}><Link href={`/projects/${link.project.slug}`}>{link.project.name}</Link></li>)}</ul>
  </div>;
}

export function IndustryEntryLink({ companyId, companyName }: { companyId: string | null; companyName: string }) {
  const href = getIndustryEntryHref(companyId);
  return href ? <Link className="context-industry-link" href={href}><Copy en="Industry entry" zh="产业条目" /><span className="context-sr-only"> — {companyName}</span></Link> : null;
}

const roleZh: Record<string, string> = {
  "Developer / Owner": "开发商／业主", "Wind Turbine OEM": "风机 OEM", "Platform / Technology": "平台／技术",
  "Platform Engineering": "平台工程", Fabrication: "制造", Mooring: "系泊", Anchoring: "锚固",
  "Dynamic Cable": "动态海缆", "Inter-array Cable": "阵列间海缆", "Export Cable": "送出海缆",
  "Offshore Electrical": "海上电气", "Grid Connection": "并网", FEED: "前端工程设计", EPCI: "EPCI",
  "Subsea Engineering": "水下工程", "Marine Installation": "海上安装", "Vessel Provider": "船舶提供方",
  "Operations / Maintenance": "运行／维护", "Engineering / Consultancy": "工程／咨询", "Certification / Assurance": "认证／保障",
  "Research / Public Body": "研究／公共机构", "Port Infrastructure": "港口基础设施", "Other Verified Role": "其他已核实角色",
};

function CompanyProjectList({ projects }: { projects: ReturnType<typeof getCompanyProjectRecords> }) {
  return <ul className="context-company-projects">{projects.map((project) => <li key={project.id}>
    <Link href={`/projects/${project.slug}`}>{project.name}</Link>
    {project.roles.map((role) => <div className="context-company-role" key={role.id} data-context-relationship={role.id}>
      <p><strong><Copy en={role.roleLabel} zh={roleZh[role.roleLabel] ?? role.roleLabel} /></strong> · <Copy {...role.contextLabel} /></p>
      {role.scope && <p>{role.scope}</p>}
      {role.detail && <p>{role.detail}</p>}
      <details><summary><Copy en="Role evidence" zh="角色依据" /></summary>
        <ul>{role.sources.map((source) => <li key={source.sourceId}><a href={source.url}>{source.title}</a></li>)}</ul>
      </details>
    </div>)}
  </li>)}</ul>;
}

export function CompanyProjectContext({ companyId, instanceId }: { companyId: string; instanceId: string }) {
  const projects = getCompanyProjectRecords(companyId);
  const headingId = `project-context-${instanceId}`;
  return <section className="company-project-context" aria-labelledby={headingId}>
    <h4 id={headingId}><Copy en="Project records" zh="项目记录" /> ({projects.length})</h4>
    <p className="context-meta"><Copy en="Recorded roles retain their evidence scope and history. A link does not establish a current supply contract or the same role on another project." zh="记录的角色保留其证据范围与历史。关联不代表当前供货合同，也不代表在其他项目中承担相同角色。" /></p>
    {projects.length ? <>
      <CompanyProjectList projects={projects.slice(0, 3)} />
      {projects.length > 3 && <details className="context-more"><summary><Copy en={`Show all project records (${projects.length})`} zh={`查看全部项目记录（${projects.length}）`} /></summary><CompanyProjectList projects={projects.slice(3)} /></details>}
    </> : <p><Copy en="No linked project records" zh="未关联项目记录" /></p>}
  </section>;
}
