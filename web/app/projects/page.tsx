import type { Metadata } from "next";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import {
  formatStatus,
  getProjectCount,
  getProjectIndexItems,
  getProjectOptions,
  readinessAreas,
  readinessStates,
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
          <LocalizedCopy en="Compare lifecycle, FID evidence, readiness and next observable signals across floating offshore wind projects. Curated coverage is representative; assessments follow the evidence stored in each project profile." zh="比较浮式海上风电项目的生命周期、FID 证据、准备度及下一步可观察信号。精选项目具有代表性；评估依据各项目档案中记录的证据。" />
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
        readinessAreas={readinessAreas}
        readinessStates={readinessStates}
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
          <LocalizedCopy en="This is a curated snapshot, not live project monitoring. Capacity may describe a proposed envelope rather than installed capacity; read each profile for its scope and sources. Consent, support awards and FEED do not prove FID. UNKNOWN and NOT VERIFIED identify evidence boundaries." zh="这是精选项目的静态快照，并非实时监测。容量可能表示拟建规模而非已安装容量；各档案列明范围和来源。许可、支持奖励和 FEED 并不能证明 FID。UNKNOWN（未知）和 NOT VERIFIED（未核实）明确标示证据边界。" />
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
