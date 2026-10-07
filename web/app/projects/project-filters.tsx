"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectIndexItem, ProjectStatus, ReadinessState } from "../../data/project-adapter";
import { useLanguage } from "../i18n/language-context";

type ProjectFiltersProps = {
  projects: ProjectIndexItem[];
  regions: string[];
  countries: string[];
  statuses: { value: ProjectStatus; label: string }[];
  readinessAreas: readonly string[];
  readinessStates: readonly ReadinessState[];
};

const fidLabels = {
  confirmed: ["Confirmed", "已确认"], not_reached: ["Not reached", "未达到"],
  not_verified: ["Not verified", "未核实"], unknown: ["UNKNOWN", "未知"],
};
const areaZh: Record<string, string> = { Permitting: "许可", Revenue: "收入", Engineering: "工程", Procurement: "采购", "Financing / FID": "融资 / FID", Execution: "执行" };
const stateZh: Record<ReadinessState, string> = { SECURED: "已落实", ACTIVE: "推进中", "NOT VERIFIED": "未核实", "NOT STARTED": "未开始", UNKNOWN: "未知" };
const capacityOptions = [ ["small", "< 100 MW", "< 100 MW"], ["medium", "100–<500 MW", "100–<500 MW"], ["large", "≥ 500 MW", "≥ 500 MW"], ["unknown", "UNKNOWN", "未知"] ];

export function ProjectFilters({ projects, regions, countries, statuses, readinessAreas, readinessStates }: ProjectFiltersProps) {
  const { language } = useLanguage();
  const zh = language === "zh";
  const copy = (en: string, chinese: string) => zh ? chinese : en;
  const [region, setRegion] = useState("All");
  const [country, setCountry] = useState("All");
  const [status, setStatus] = useState("All");
  const [fid, setFid] = useState("All");
  const [capacity, setCapacity] = useState("All");
  const [area, setArea] = useState("All");
  const [state, setState] = useState("All");
  const filteredProjects = useMemo(() => projects.filter((project) =>
    (region === "All" || project.region === region) &&
    (country === "All" || project.country === country) &&
    (status === "All" || project.normalizedStatus === status) &&
    (fid === "All" || project.fid === fid) &&
    (capacity === "All" || (project.capacityMw === null ? capacity === "unknown"
      : capacity === "small" ? project.capacityMw < 100
      : capacity === "medium" ? project.capacityMw >= 100 && project.capacityMw < 500
      : capacity === "large" && project.capacityMw >= 500)) &&
    project.readiness.some((gate) => (area === "All" || gate.area === area) && (state === "All" || gate.state === state))
  ), [projects, region, country, status, fid, capacity, area, state]);
  const hasFilters = [region, country, status, fid, capacity, area, state].some((value) => value !== "All");
  const controls = [
    { label: copy("Region", "地区"), value: region, set: setRegion, options: regions.map((v) => [v, v]) },
    { label: copy("Country", "国家"), value: country, set: setCountry, options: countries.map((v) => [v, v]) },
    { label: copy("Lifecycle", "生命周期"), value: status, set: setStatus, options: statuses.map((s) => [s.value, zh ? projectStatusZh(s.value) : s.label]) },
    { label: "FID", value: fid, set: setFid, options: Object.entries(fidLabels).map(([v, labels]) => [v, labels[zh ? 1 : 0]]) },
    { label: copy("Capacity", "容量"), value: capacity, set: setCapacity, options: capacityOptions.map(([v, en, chinese]) => [v, copy(en, chinese)]) },
    { label: copy("Readiness area", "准备度领域"), value: area, set: setArea, options: readinessAreas.map((v) => [v, zh ? areaZh[v] : v]) },
    { label: copy("Readiness state", "准备度状态"), value: state, set: setState, options: readinessStates.map((v) => [v, zh ? `${stateZh[v]} / ${v}` : v]) },
  ];
  const gateState = (value: ReadinessState) => <strong className={`project-intel-state-pill project-intel-state-${value.toLowerCase().replaceAll(" ", "-")}`}>{zh ? `${stateZh[value]} / ${value}` : value}</strong>;
  return <>
    <section className="project-filter-band" aria-labelledby="project-filter-heading">
      <div className="project-filter-heading">
        <h2 id="project-filter-heading">{copy("Compare project intelligence", "比较项目情报")}</h2>
        <p aria-live="polite">{filteredProjects.length} / {projects.length} {copy("projects", "个项目")}</p>
      </div>
      <div className="project-overview-lifecycle" aria-label={copy("Lifecycle distribution in the dataset", "数据集中的生命周期分布")}>
        {statuses.map((item) => <button key={item.value} type="button" aria-pressed={status === item.value} onClick={() => setStatus(status === item.value ? "All" : item.value)}>
          {zh ? projectStatusZh(item.value) : item.label} <strong>{projects.filter((p) => p.normalizedStatus === item.value).length}</strong>
        </button>)}
      </div>
      <div className="project-filter-controls project-overview-filters">
        {controls.map((control) => <label key={control.label}><span>{control.label}</span>
          <select value={control.value} onChange={(event) => control.set(event.target.value)}>
            <option value="All">{copy("All", "全部")}</option>
            {control.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>)}
      </div>
      <p className="project-muted-note">{copy("Readiness filters match the selected area and state together; All areas matches any gate. Active development does not confirm construction commitment. FID not verified remains visible for operating assets.", "准备度筛选同时匹配所选领域和状态；全部领域可匹配任一门槛。开发推进并不确认建设承诺。运营资产的未核实 FID 仍明确显示。")}</p>
      {hasFilters && <button className="text-button project-clear-filters" type="button" onClick={() => { setRegion("All"); setCountry("All"); setStatus("All"); setFid("All"); setCapacity("All"); setArea("All"); setState("All"); }}>{copy("Clear filters", "清除筛选")}</button>}
    </section>
    <section aria-labelledby="project-list-heading" className="project-overview">
      <h2 id="project-list-heading">{copy("Project landscape", "项目全景")}</h2>
      <p className="project-muted-note">{copy("Next signal is the first recorded watchpoint, not a priority ranking or a single confirmed blocker. Expand a row for all gates and watchpoints. Readiness is the existing editorial assessment; evidence gaps are not proof of inactivity.", "下一信号为记录中的首项观察点，不代表优先排名或唯一已确认阻碍。展开各行可查看所有门槛和观察点。准备度沿用现有编辑评估；证据缺失不等于项目停滞。")}</p>
      <div className="project-comparison-heading" aria-hidden="true"><span>{copy("Project / Capacity", "项目 / 容量")}</span><span>{copy("Lifecycle", "生命周期")}</span><span>FID</span><span>{copy("Key readiness", "关键准备度")}</span><span>{copy("Next signal", "下一信号")}</span></div>
      {filteredProjects.length ? <ol className="project-index-list">
        {filteredProjects.map((project) => <li key={project.id}>
          <article className="project-comparison-row" aria-labelledby={`name-${project.id}`}>
            <div className="project-comparison-cells">
              <div><h3 id={`name-${project.id}`}><Link href={`/projects/${project.slug}`}>{project.name}</Link></h3><p>{project.country} / {project.region}</p><p>{project.capacityMw === null ? copy("Capacity UNKNOWN", "容量未知") : `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(project.capacityMw)} MW`}</p></div>
              <div><span className="project-mobile-label">{copy("Lifecycle", "生命周期")}</span><span className={`project-status project-status-${project.normalizedStatus}`}>{zh ? projectStatusZh(project.normalizedStatus) : project.statusLabel}</span></div>
              <div><span className="project-mobile-label">FID</span><strong>{fidLabels[project.fid][zh ? 1 : 0]}</strong></div>
              <dl className="project-overview-key-gates">{project.readiness.filter((g) => ["Permitting", "Revenue", "Execution"].includes(g.area)).map((g) => <div key={g.area}><dt>{zh ? areaZh[g.area] : g.area}</dt><dd>{gateState(g.state)}</dd></div>)}</dl>
              <div><span className="project-mobile-label">{copy("Next signal", "下一信号")}</span><p>{project.nextSignal ?? copy("UNKNOWN", "未知")}</p></div>
            </div>
            <details className="project-overview-details">
              <summary aria-label={`${copy("Assessment, gates & milestones", "评估、门槛与里程碑")} — ${project.name}`}>{copy("Assessment, gates & milestones", "评估、门槛与里程碑")}</summary>
              <div className="project-overview-expansion">
                <div><h4>{copy("Current assessment", "当前评估")}</h4><p>{project.assessment ?? copy("UNKNOWN", "未知")}</p><p>{project.fidEvidence}</p>
                  <h4>{copy("Latest recorded milestone", "最新记录的里程碑")}</h4>
                  {project.latestMilestone ? <><p><time dateTime={project.latestMilestone.date}>{project.latestMilestone.dateLabel}</time> — {project.latestMilestone.title}</p><p>{project.latestMilestone.description}</p></> : <p>{copy("UNKNOWN", "未知")}</p>}
                </div>
                <div><h4>{copy("Readiness and evidence", "准备度与证据")}</h4><dl className="project-overview-all-gates">{project.readiness.map((g) => <div key={g.area}><dt>{zh ? areaZh[g.area] : g.area} {gateState(g.state)}</dt><dd>{g.evidence}</dd></div>)}</dl>
                  {project.unstructuredGates.length > 0 && <><h4>{copy("Current gates", "当前门槛")}</h4><ul>{project.unstructuredGates.map((g) => <li key={g}>{g}</li>)}</ul></>}
                </div>
                <div><h4>{copy("What to watch next", "下一步观察点")}</h4><ul>{project.watchpoints.length ? project.watchpoints.map((w) => <li key={w}>{w}</li>) : <li>{copy("UNKNOWN", "未知")}</li>}</ul><Link href={`/projects/${project.slug}`}>{copy("Full intelligence & sources", "完整情报与来源")} →</Link></div>
              </div>
              <VerifiedProjectRoles project={project} zh={zh} />
            </details>
          </article>
        </li>)}
      </ol> : <p className="archive-search-empty">{copy("No projects match these filters.", "没有符合这些筛选条件的项目。")}</p>}
      <p className="project-muted-note">{copy("Freshness: material review dates are not recorded per project. Milestone dates describe events, including recorded expectations, and do not indicate when an assessment was reviewed or updated.", "时效性：当前未逐项目记录实质审查日期。里程碑日期描述事件（包括记录的预期事项），并不表示评估的审查或更新日期。")}</p>
    </section>
  </>;
}

function VerifiedProjectRoles({ project, zh }: { project: ProjectIndexItem; zh: boolean }) {
  const copy = (en: string, chinese: string) => zh ? chinese : en;
  const labels: Record<string, string> = { owner: "业主 / 开发商", turbine: "风机", platform: "浮式平台", cable: "电缆", mooring: "系泊 / 锚固", installation: "海上安装", "Dynamic Cable": "动态电缆", "Inter-array Cable": "阵列间电缆", "Export Cable": "送出电缆", Mooring: "系泊", Anchoring: "锚固", "Wind Turbine OEM": "风机 OEM", "Platform / Technology": "平台 / 技术", "Platform Engineering": "平台工程", Fabrication: "制造", "Marine Installation": "海上安装" };
  const missing = copy("N/A — not verified", "N/A — 未核实");
  return <section className="project-supply-chain" aria-labelledby={`supply-${project.id}`}>
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
          <span className="project-supply-chain-sources">{copy("Evidence", "证据")}: {entry.sources.map((source, index) => <a key={source.sourceId} href={source.url} title={source.title} aria-label={`${copy("Evidence", "证据")} ${index + 1}: ${entry.companyName} — ${source.title}`}>{index + 1}</a>)}</span>
        </li>)}</ul>}
      </div>)}</dd>
    </div>)}</dl>
  </section>;
}

function projectStatusZh(status: ProjectStatus): string {
  return ({ concept_early_development: "概念 / 早期开发", lease_or_area_awarded: "租赁 / 区域已授予", development: "开发中", consented: "已获许可", pre_construction: "施工准备", under_construction: "建设中", commissioning: "调试中", operational: "运营中", paused: "已暂停", cancelled: "已取消", decommissioned: "已退役" } as Record<ProjectStatus, string>)[status];
}
