"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectStatus } from "../../data/project-adapter";

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
          <h2 id="project-filter-heading">Browse projects</h2>
          <p>
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <div className="project-filter-controls">
          <label>
            <span>Region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              <option>All</option>
              {regions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Country</span>
            <select value={country} onChange={(event) => setCountry(event.target.value)}>
              <option>All</option>
              {countries.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="All">All</option>
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
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
            Clear filters
          </button>
        ) : null}
      </section>

      <section aria-labelledby="project-list-heading">
        <h2 id="project-list-heading">Project records</h2>
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
                        {project.statusLabel}
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
          <p className="archive-search-empty">No projects match these filters.</p>
        )}
      </section>
    </>
  );
}

function formatCapacity(value: number): string {
  return `${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 2,
  }).format(value)} MW`;
}
