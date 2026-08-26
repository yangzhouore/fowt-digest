"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectStatus } from "../../data/project-adapter";
import { useLanguage } from "../i18n/language-context";

export type ProjectIndexItem = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
  normalizedStatus: ProjectStatus;
  statusLabel: string;
  capacityMw: number | null;
  floatingTechnology: string | null;
  developers: string[];
};

type ProjectFiltersProps = {
  projects: ProjectIndexItem[];
  regions: string[];
  countries: string[];
  statuses: { value: ProjectStatus; label: string }[];
};

export function ProjectFilters({
  projects,
  regions,
  countries,
  statuses,
}: ProjectFiltersProps) {
  const { language } = useLanguage();
  const [region, setRegion] = useState("All");
  const [country, setCountry] = useState("All");
  const [status, setStatus] = useState("All");

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        return (
          (region === "All" || project.region === region) &&
          (country === "All" || project.country === country) &&
          (status === "All" || project.normalizedStatus === status)
        );
      }),
    [country, projects, region, status],
  );

  const hasFilters = region !== "All" || country !== "All" || status !== "All";

  return (
    <>
      <section className="project-filter-band" aria-labelledby="project-filter-heading">
        <div className="project-filter-heading">
          <h2 id="project-filter-heading">{language === "zh" ? "浏览项目" : "Browse projects"}</h2>
          <p>
            {filteredProjects.length}{" "}
            {language === "zh" ? "个项目" : (filteredProjects.length === 1 ? "project" : "projects")}
          </p>
        </div>
        <div className="project-filter-controls">
          <label>
            <span>{language === "zh" ? "地区" : "Region"}</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              <option value="All">{language === "zh" ? "全部" : "All"}</option>
              {regions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{language === "zh" ? "国家" : "Country"}</span>
            <select value={country} onChange={(event) => setCountry(event.target.value)}>
              <option value="All">{language === "zh" ? "全部" : "All"}</option>
              {countries.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{language === "zh" ? "状态" : "Status"}</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="All">{language === "zh" ? "全部" : "All"}</option>
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {language === "zh" ? projectStatusZh(item.value) : item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {hasFilters ? (
          <button
            className="text-button project-clear-filters"
            type="button"
            onClick={() => {
              setRegion("All");
              setCountry("All");
              setStatus("All");
            }}
          >
            {language === "zh" ? "清除筛选" : "Clear filters"}
          </button>
        ) : null}
      </section>

      <section aria-labelledby="project-list-heading">
        <h2 id="project-list-heading">{language === "zh" ? "项目记录" : "Project records"}</h2>
        {filteredProjects.length > 0 ? (
          <ol className="project-index-list">
            {filteredProjects.map((project) => (
              <li key={project.id}>
                <Link className="project-preview-link" href={`/projects/${project.slug}`}>
                  <article className="project-preview">
                    <div className="project-preview-main">
                      <p className="project-preview-meta">
                        {project.country} / {project.region}
                      </p>
                      <h3>{project.name}</h3>
                      {project.developers.length > 0 ? (
                        <p className="project-preview-developers">
                          {project.developers.slice(0, 3).join(" / ")}
                          {project.developers.length > 3 ? " / +" : null}
                        </p>
                      ) : null}
                    </div>
                    <div className="project-preview-facts">
                      <span className={`project-status project-status-${project.normalizedStatus}`}>
                        {language === "zh" ? projectStatusZh(project.normalizedStatus) : project.statusLabel}
                      </span>
                      {project.capacityMw !== null ? (
                        <span>{formatCapacity(project.capacityMw)}</span>
                      ) : null}
                      {project.floatingTechnology ? (
                        <span>{project.floatingTechnology}</span>
                      ) : null}
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="archive-search-empty">{language === "zh" ? "没有符合这些筛选条件的项目。" : "No projects match these filters."}</p>
        )}
      </section>
    </>
  );
}

function projectStatusZh(status: ProjectStatus): string {
  return ({
    concept_early_development: "概念 / 早期开发", lease_or_area_awarded: "租赁 / 区域已授予", development: "开发中", consented: "已获许可",
    pre_construction: "施工准备", under_construction: "建设中", commissioning: "调试中", operational: "运营中", paused: "已暂停",
    cancelled: "已取消", decommissioned: "已退役",
  } as Record<ProjectStatus, string>)[status];
}

function formatCapacity(value: number): string {
  return `${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 2,
  }).format(value)} MW`;
}
