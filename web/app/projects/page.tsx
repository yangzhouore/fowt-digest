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
import { LocalizedCopy } from "../i18n/localized-copy";

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
    <main className="projects-page">
      <SiteHeader />

      <section className="project-hero" aria-labelledby="projects-heading">
        <p className="eyebrow"><LocalizedCopy en="Project Intelligence" zh="项目信息" /></p>
        <h1 id="projects-heading"><LocalizedCopy en="Global FOWT Projects" zh="全球浮式海上风电项目" /></h1>
        <p>
          <LocalizedCopy en="A curated, source-backed static dataset of known floating offshore wind projects. Coverage is representative rather than mathematically complete, and missing facts remain absent until verified." zh="经筛选且有来源依据的已知浮式海上风电项目静态数据集。覆盖具有代表性而非绝对完整；缺失事实将在核实前保持空缺。" />
        </p>
        <dl className="project-hero-stats" aria-label="Project dataset coverage">
          <div>
            <dt><LocalizedCopy en="Projects" zh="项目" /></dt>
            <dd>{getProjectCount()}</dd>
          </div>
          <div>
            <dt><LocalizedCopy en="Countries" zh="国家" /></dt>
            <dd>{countryCount}</dd>
          </div>
          <div>
            <dt><LocalizedCopy en="Regions" zh="地区" /></dt>
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
        <h2 id="project-data-notice-heading"><LocalizedCopy en="Data notice" zh="数据说明" /></h2>
        <p>
          <LocalizedCopy en="Project records are static, source-backed JSON under web/data/projects/. The website does not run collection, scraping, scoring, AI summarisation, geospatial services, a backend, a database, or a CMS." zh="项目记录是 web/data/projects/ 下有来源依据的静态 JSON。网站不运行采集、抓取、评分、AI 摘要、地理空间服务、后端、数据库或 CMS。" />
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
