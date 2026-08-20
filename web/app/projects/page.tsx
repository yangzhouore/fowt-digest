import type { Metadata } from "next";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import {
  formatStatus,
  getProjectCount,
  getProjectIndexItems,
  getProjectOptions,
} from "../../data/project-adapter";
import { ProjectFilters } from "./project-filters";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Static project intelligence for source-backed floating offshore wind projects.",
};

export default function ProjectsPage() {
  const projects = getProjectIndexItems();
  const options = getProjectOptions();
  const countryCount = options.countries.length;

  return (
    <main>
      <SiteHeader />

      <section className="project-hero" aria-labelledby="projects-heading">
        <p className="eyebrow">Project Intelligence</p>
        <h1 id="projects-heading">Global FOWT Projects</h1>
        <p>
          A curated, source-backed static dataset of known floating offshore wind
          projects. Coverage is representative rather than mathematically
          complete, and missing facts remain absent until verified.
        </p>
        <dl className="project-hero-stats" aria-label="Project dataset coverage">
          <div>
            <dt>Projects</dt>
            <dd>{getProjectCount()}</dd>
          </div>
          <div>
            <dt>Countries</dt>
            <dd>{countryCount}</dd>
          </div>
          <div>
            <dt>Regions</dt>
            <dd>{options.regions.length}</dd>
          </div>
        </dl>
      </section>

      <ProjectFilters
        projects={projects}
        regions={options.regions}
        countries={options.countries}
        statuses={options.statuses.map((status) => ({
          value: status,
          label: formatStatus(status),
        }))}
      />

      <section aria-labelledby="project-data-notice-heading">
        <h2 id="project-data-notice-heading">Data notice</h2>
        <p>
          Project records are static, source-backed JSON under
          `web/data/projects/`. The website does not run collection, scraping,
          scoring, AI summarisation, geospatial services, a backend, a database,
          or a CMS.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
