"use client";
import { localizeContent } from "../i18n/render-content";


import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import projectMapLocations from "../../data/projects/map-locations.json";
import type { ProjectStatus, ReadinessState } from "../../data/project-adapter";
import type { ConnectedProjectIndexItem } from "../../data/connected-context-adapter";
import { useLanguage } from "../i18n/language-context";
import type { getProjectReviewSummary } from "../../data/project-public-evidence-adapter";

type ProjectFiltersProps = {
  projects: (ConnectedProjectIndexItem & ReturnType<typeof getProjectReviewSummary>)[];
  regions: string[];
  countries: string[];
  statuses: { value: ProjectStatus; label: string }[];
  readinessAreas: readonly string[];
  readinessStates: readonly ReadinessState[];
};

const countryFlags: Record<string, string> = {
  China: "cn", France: "fr", Italy: "it", Japan: "jp", Norway: "no",
  Portugal: "pt", "South Korea": "kr", Spain: "es", "United Kingdom": "gb", "United States": "us",
};

const regionViews: Record<string, string> = {
  "Asia-Pacific": "254 27 90 50",
  Europe: "151 14 72 40",
  "North America": "48 29 72 40",
};

const mapLocations: Record<string, {
  longitude: number;
  latitude: number;
  kind: string;
  source: string;
} | null> = projectMapLocations;

const locationLabels: Record<string, [string, string]> = {
  area: ["Documented project area", "已公布的项目区域"],
  site: ["Published site location", "已公布的项目位置"],
  turbine: ["Documented turbine location", "已公布的风机位置"],
  "proposed turbine": ["Proposed turbine location", "拟建风机位置"],
};

function ProjectCardMap({ project, zh }: { project: ConnectedProjectIndexItem; zh: boolean }) {
  const location = mapLocations[project.slug];
  const view = regionViews[project.region];
  const unavailable = zh ? "位置暂无" : "Location NA";
  const label = location ? locationLabels[location.kind][zh ? 1 : 0] : unavailable;
  if (!view) return <p className="project-map-note">{unavailable}</p>;

  return (
    <div className="project-map-frame">
      <svg className="project-card-map" viewBox={view} role="img" aria-label={`${project.region} · ${label}`}>
        <title>{`${project.region} · ${label}`}</title>
        <image href="/editorial/maps/world-land.svg" width="360" height="150" />
        {location && (
          <g className="project-map-pin"
            transform={`translate(${180 + location.longitude} ${85 - location.latitude}) scale(0.36)`}>
            <circle r="6" className="project-map-area" />
            <path d="M0 0C-2-3-4-5-4-7a4 4 0 0 1 8 0C4-5 2-3 0 0Z" />
            <circle cy="-7" r="1.35" fill="white" />
          </g>
        )}
      </svg>
      {location
        ? <a className="project-map-source" href={location.source}>{label}</a>
        : <span className="project-map-note">{unavailable}</span>}
    </div>
  );
}


const monthFormats = {
  en: new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }),
  zh: new Intl.DateTimeFormat("zh-CN", { month: "short", year: "numeric", timeZone: "UTC" }),
};

function Month({ date, language }: { date: string; language: "en" | "zh" }) {
  const month = date.slice(0, 7);
  return <time dateTime={month}>{month.length === 7 ? monthFormats[language].format(new Date(month + "-01T00:00:00Z")) : month}</time>;
}

function CardDate({ value }: { value: string | null }) {
  if (!value) return <>N/A</>;
  const [year, month] = value.split("-");
  return <time dateTime={value}>{month ? `${month}/${year.slice(-2)}` : year}</time>;
}

const fidLabels = {
  confirmed: ["Confirmed", "已确认"], not_reached: ["Not reached", "未达到"],
  not_verified: ["Not verified", "未核实"], unknown: ["UNKNOWN", "未知"],
};
const areaZh: Record<string, string> = { Permitting: "许可", Revenue: "收入", Engineering: "工程", Procurement: "采购", "Financing / FID": "融资 / FID", Execution: "执行" };
const stateZh: Record<ReadinessState, string> = { SECURED: "已落实", ACTIVE: "推进中", "NOT VERIFIED": "未核实", "NOT STARTED": "未开始", UNKNOWN: "未知" };
function capacityBand(value: number | null | undefined, medium: number, large: number) {
  if (value == null) return "unknown";
  if (value < medium) return "small";
  return value < large ? "medium" : "large";
}

function capacityOptions(medium: number, large: number, unknown: string) {
  return [
    ["small", `< ${medium} MW`],
    ["medium", `${medium}–<${large} MW`],
    ["large", `≥ ${large} MW`],
    ["unknown", unknown],
  ];
}


export function ProjectFilters({ projects, regions, countries, statuses, readinessAreas, readinessStates }: ProjectFiltersProps) {
  const { language } = useLanguage();
  const zh = language === "zh";
  const copy = (en: string, chinese: string) => zh ? chinese : en;
  const [region, setRegion] = useState("All");
  const [country, setCountry] = useState("All");
  const [status, setStatus] = useState("All");
  const [fid, setFid] = useState("All");
  const [capacity, setCapacity] = useState("All");
  const [turbineCapacity, setTurbineCapacity] = useState("All");
  const [area, setArea] = useState("All");
  const [state, setState] = useState("All");
  const filteredProjects = useMemo(() => projects.filter((project) =>
    (region === "All" || project.region === region) &&
    (country === "All" || project.country === country) &&
    (status === "All" || project.normalizedStatus === status) &&
    (fid === "All" || project.fid === fid) &&
    (capacity === "All" || capacityBand(project.capacityMw, 100, 500) === capacity) &&
    (turbineCapacity === "All" || capacityBand(project.turbineRatingMw, 5, 10) === turbineCapacity) &&
    project.readiness.some((gate) => (area === "All" || gate.area === area) && (state === "All" || gate.state === state))
  ), [projects, region, country, status, fid, capacity, turbineCapacity, area, state]);
  const hasFilters = [region, country, status, fid, capacity, turbineCapacity, area, state].some((value) => value !== "All");
  const groups = [
    { label: copy("Lifecycle", "生命周期"), value: status, set: setStatus,
      options: statuses.map(({ value, label }) => [value, zh ? projectStatusZh(value) : label]),
      category: (project: ConnectedProjectIndexItem) => project.normalizedStatus },
    { label: copy("Region", "地区"), value: region, set: setRegion,
      options: regions.map((name) => [name, name]),
      category: (project: ConnectedProjectIndexItem) => project.region },
    { label: copy("Total capacity", "总容量"), value: capacity, set: setCapacity,
      options: capacityOptions(100, 500, copy("Unknown", "未知")),
      category: (project: ConnectedProjectIndexItem) => capacityBand(project.capacityMw, 100, 500) },
    { label: copy("Capacity per turbine", "单机容量"), value: turbineCapacity, set: setTurbineCapacity,
      options: capacityOptions(5, 10, copy("Unknown", "未知")),
      category: (project: ConnectedProjectIndexItem) => capacityBand(project.turbineRatingMw, 5, 10) },
  ];
  const controls = [
    { label: copy("Country", "国家"), value: country, set: setCountry, options: countries.map((v) => [v, v]) },
    { label: "FID", value: fid, set: setFid, options: Object.entries(fidLabels).map(([v, labels]) => [v, labels[zh ? 1 : 0]]) },
    { label: copy("Readiness area", "准备度领域"), value: area, set: setArea, options: readinessAreas.map((v) => [v, zh ? areaZh[v] : v]) },
    { label: copy("Readiness state", "准备度状态"), value: state, set: setState, options: readinessStates.map((v) => [v, zh ? `${stateZh[v]} / ${v}` : v]) },
  ];
  const gateState = (value: ReadinessState) => <strong className={`project-intel-state-pill project-intel-state-${value.toLowerCase().replaceAll(" ", "-")}`}>{zh ? `${stateZh[value]} / ${value}` : value}</strong>;
  return localizeContent(<>
    <section className="project-filter-band" aria-labelledby="project-filter-heading">
      <div className="project-filter-heading">
        <h2 id="project-filter-heading">{copy("Compare project intelligence", "比较项目情报")}</h2>
        <p aria-live="polite">{filteredProjects.length} / {projects.length} {copy("projects", "个项目")}</p>
      </div>
      {groups.map((group) => <fieldset key={group.label} className="project-filter-group">
        <legend>{group.label}</legend>
        <div className="project-overview-lifecycle">
          {group.options.map(([value, label]) => (
            <button key={value} type="button" aria-pressed={group.value === value}
              onClick={() => group.set(group.value === value ? "All" : value)}>
              {label} <strong>{projects.filter((project) => group.category(project) === value).length}</strong>
            </button>
          ))}
        </div>
      </fieldset>)}
      <details className="project-extra-filters">
        <summary>{copy("Additional filters", "其他筛选条件")}</summary>
        <div className="project-filter-controls project-overview-filters">
          {controls.map((control) => <label key={control.label}><span>{control.label}</span>
            <select value={control.value} onChange={(event) => control.set(event.target.value)}>
              <option value="All">{copy("All", "全部")}</option>
              {control.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>)}
        </div>
      </details>
      {hasFilters && <button className="text-button project-clear-filters" type="button" onClick={() => { setRegion("All"); setCountry("All"); setStatus("All"); setFid("All"); setCapacity("All"); setTurbineCapacity("All"); setArea("All"); setState("All"); }}>{copy("Clear filters", "清除筛选")}</button>}
    </section>
    <section aria-labelledby="project-list-heading" className="project-overview">
      <h2 id="project-list-heading">{copy("Project landscape", "项目全景")}</h2>
      {filteredProjects.length ? <ol className="project-index-list">
        {filteredProjects.map((project) => <li key={project.id}>
          <article className="project-comparison-row" aria-labelledby={`name-${project.id}`}>
            <header className="project-card-header">
              <div>
                <h3 id={`name-${project.id}`}><Link href={`/projects/${project.slug}`}>{project.name}</Link></h3>
                <p className="project-location">
                  <span className="project-country">
                    {countryFlags[project.country] && <Image src={`/flags/${countryFlags[project.country]}.svg`} width={20} height={15} alt="" />}
                    {project.country}
                  </span>
                  <span className="project-region" data-region={project.region}>{project.region}</span></p>
                <dl className="project-card-owner">
                  <div><dt>{copy("Owner / developer", "业主 / 开发商")}</dt><dd>{project.developerOwnerText ?? copy("Not recorded", "未记录")}</dd></div>
                </dl>
              </div>
              <ProjectCardMap project={project} zh={zh} />
            </header>
            <div className="project-comparison-cells">
              <div>
                <dl className="project-card-facts">
                  <div><dt>{copy("Total capacity", "总容量")}</dt><dd>{project.capacityMw === null ? copy("Unknown", "未知") : `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(project.capacityMw)} MW`}</dd></div>
                  <div><dt>{copy("Turbine count", "风机数量")}</dt><dd>{project.turbineCount ?? copy("Not recorded", "未记录")}</dd></div>
                  <div><dt title={copy("Capacity per turbine", "单机容量")}>{copy("Per turbine", "单机容量")}</dt><dd>{project.turbineRatingMw == null ? copy("Not recorded", "未记录") : `${project.turbineRatingMw} MW`}</dd></div>
                  <div className="project-card-date"><dt title={copy("Construction start", "开工日期")}>{copy("Build start", "开工日期")}</dt><dd><CardDate value={project.constructionStart} /></dd></div>
                  <div className="project-card-date"><dt title={copy("Commercial operation", "商业运行")}>{copy("In service", "商业运行")}</dt><dd><CardDate value={project.actualCod} /></dd></div>
                </dl>
                <p className="project-review-date">{project.reviewedOn ? <>{copy("Assessment reviewed", "评估复核日期")}: <time dateTime={project.reviewedOn}>{project.reviewedOn}</time></> : copy("Assessment review: not recorded", "评估复核：未记录")}</p>
              </div>
              <dl className="project-overview-key-gates">
                <div><dt>{copy("Lifecycle", "生命周期")}</dt><dd><span className={`project-status project-status-${project.normalizedStatus}`}>{zh ? projectStatusZh(project.normalizedStatus) : project.statusLabel}</span></dd></div>
                <div><dt>FID</dt><dd><strong className="project-fid-badge">{fidLabels[project.fid][zh ? 1 : 0]}</strong></dd></div>
                {project.readiness.filter((g) => ["Permitting", "Revenue", "Execution"].includes(g.area)).map((g) => <div key={g.area}><dt>{zh ? areaZh[g.area] : g.area}</dt><dd>{gateState(g.state)}</dd></div>)}
              </dl>
            </div>
            <div className="project-card-next"><span>{copy("Next signal", "下一信号")}</span><p>{project.nextSignal ?? copy("UNKNOWN", "未知")}</p></div>
            <details className="project-overview-details project-card-milestones">
              <summary>{copy("Recorded milestones", "已记录的里程碑")}</summary>
              {project.milestones.length ? <ol className="project-card-timeline">
                {project.milestones.map((event) => <li key={event.id}><Month date={event.date} language={language} /> <span>{event.title}</span></li>)}
              </ol> : <p>{copy("No dated milestones recorded", "暂无已记录日期的里程碑")}</p>}
            </details>
            <details className="project-overview-details">
              <summary aria-label={`${copy("Assessment, gates & milestones", "评估、门槛与里程碑")} — ${project.name}`}>{copy("Assessment, gates & milestones", "评估、门槛与里程碑")}</summary>
              <div className="project-overview-expansion">
                <div><h4>{copy("Current assessment", "当前评估")}</h4><p>{project.assessment ?? copy("UNKNOWN", "未知")}</p><p>{project.fidEvidence}</p>
                  <h4>{copy("Latest recorded milestone", "最新记录的里程碑")}</h4>
                  {project.latestMilestone ? <><p><time dateTime={project.latestMilestone.date}>{project.latestMilestone.dateLabel}</time> — {project.latestMilestone.title}</p><p>{project.latestMilestone.description}</p></> : <p>{copy("UNKNOWN", "未知")}</p>}
                </div>
                <div><h4>{copy("Readiness and evidence", "准备度与证据")}</h4><dl className="project-overview-all-gates">{project.readiness.map((g) => {
                  const evidence = project.evidenceCounts.find((entry) => entry.area === g.area)!;
                  return <div key={g.area}><dt>{zh ? areaZh[g.area] : g.area} {gateState(g.state)}</dt><dd>{g.evidence}<br /><Link href={`/projects/${project.slug}#${evidence.anchor}`} aria-label={`${copy("Public evidence", "公开证据")} — ${project.name} — ${zh ? areaZh[g.area] : g.area}`}>{evidence.count ? `${copy("Linked evidence records", "已关联证据记录")}: ${evidence.count}` : copy("No linked evidence recorded", "未记录关联证据")}</Link></dd></div>;
                })}</dl>
                  {project.unstructuredGates.length > 0 && <><h4>{copy("Current gates", "当前门槛")}</h4><ul>{project.unstructuredGates.map((g) => <li key={g}>{g}</li>)}</ul></>}
                </div>
                <div><h4>{copy("What to watch next", "下一步观察点")}</h4><ul>{project.watchpoints.length ? project.watchpoints.map((w) => <li key={w}>{w}</li>) : <li>{copy("UNKNOWN", "未知")}</li>}</ul><Link href={`/projects/${project.slug}`}>{copy("Full intelligence & sources", "完整情报与来源")} →</Link></div>
              </div>
              <VerifiedProjectRoles project={project} zh={zh} />
            </details>
          </article>
        </li>)}
      </ol> : <p className="archive-search-empty">{copy("No projects match these filters.", "没有符合这些筛选条件的项目。")}</p>}
      <p className="project-muted-note">{copy("Assessment review dates describe completed public-source reviews. Unrecorded dates remain explicit. Event dates and source access dates do not establish assessment freshness; evidence gaps do not prove inactivity.", "评估复核日期表示已完成的公开来源审查；未记录的日期保持明确标注。事件日期与来源查阅日期不代表评估时效；证据缺失不等于项目停滞。")}</p>
    </section>
  </>, zh ? "zh" : "en");
}

function VerifiedProjectRoles({ project, zh }: { project: ConnectedProjectIndexItem; zh: boolean }) {
  const copy = (en: string, chinese: string) => zh ? chinese : en;
  const labels: Record<string, string> = { owner: "业主 / 开发商", turbine: "风机", platform: "浮式平台", cable: "电缆", mooring: "系泊 / 锚固", installation: "海上安装", "Dynamic Cable": "动态电缆", "Inter-array Cable": "阵列间电缆", "Export Cable": "送出电缆", Mooring: "系泊", Anchoring: "锚固", "Wind Turbine OEM": "风机 OEM", "Platform / Technology": "平台 / 技术", "Platform Engineering": "平台工程", Fabrication: "制造", "Marine Installation": "海上安装" };
  const missing = copy("N/A — not verified", "N/A — 未核实");
  return localizeContent(<section className="project-supply-chain" aria-labelledby={`supply-${project.id}`}>
    <h4 id={`supply-${project.id}`}>{copy("Verified Project Roles", "已核实的项目角色")}</h4>
    <p className="project-muted-note">{copy("Evidence scope distinguishes ownership, technology, engineering, selection, contracts and delivery. An announced or historical role does not itself establish a procurement award or completed delivery. N/A means the role was not verified; installation or engineering evidence does not identify a manufacturer.", "证据范围区分所有权、技术、工程、选择、合同及交付。已公布或历史角色本身不代表采购授标或完成交付。N/A 表示角色尚未核实；安装或工程证据不能据此确认制造商。")}</p>
    <dl className="project-supply-chain-grid">{project.supplyChain.map((category) => <div key={category.key} data-supply-category={category.key}>
      <dt>{zh ? labels[category.key] : category.label}</dt>
      <dd>{category.groups.map((group) => <div className="project-supply-chain-group" key={group.label ?? category.key}>
        {group.label && <h5>{zh ? labels[group.label] : group.label}</h5>}
        {(!group.entries.length || (category.key === "owner" && !group.entries.some((entry) => entry.status === "active" || entry.status === "announced"))) && <p className="project-supply-chain-missing">{category.key === "owner" && group.entries.length ? `${copy("Current", "当前")}: ` : ""}{missing}</p>}
        {group.entries.length > 0 && <ul>{group.entries.map((entry) => <li key={entry.id} data-relationship-status={entry.status}>
          <p><strong>{entry.companyName}</strong> <span className="project-supply-chain-stage">{zh ? entry.contextLabel.zh : entry.contextLabel.en}</span></p>
          {entry.scope && <p className="project-supply-chain-scope"><strong>{entry.scope}</strong></p>}
          {category.key !== "owner" && !group.label && <p className="project-supply-chain-stage">{zh ? labels[entry.roleLabel] ?? entry.roleLabel : entry.roleLabel}</p>}
          <p>{entry.detail ?? entry.roleLabel}</p>
          {entry.industryHref && <Link className="context-industry-link" href={entry.industryHref}>{copy("Industry entry", "产业条目")}<span className="context-sr-only"> — {entry.companyName}</span></Link>}
          <span className="project-supply-chain-sources">{copy("Evidence", "证据")}: {entry.sources.map((source, index) => <a key={source.sourceId} href={source.url} title={source.title} aria-label={`${copy("Evidence", "证据")} ${index + 1}: ${entry.companyName} — ${source.title}`}>{index + 1}</a>)}</span>
        </li>)}</ul>}
      </div>)}</dd>
    </div>)}</dl>
  </section>, zh ? "zh" : "en");
}

function projectStatusZh(status: ProjectStatus): string {
  return ({ concept_early_development: "概念 / 早期开发", lease_or_area_awarded: "租赁 / 区域已授予", development: "开发中", consented: "已获许可", pre_construction: "施工准备", under_construction: "建设中", commissioning: "调试中", operational: "运营中", paused: "已暂停", cancelled: "已取消", decommissioned: "已退役" } as Record<ProjectStatus, string>)[status];
}
