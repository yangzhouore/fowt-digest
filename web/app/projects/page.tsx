import { localizeServerContent } from "../i18n/server-content";
import type { Metadata } from "next";
import {
  formatStatus,
  getProjectIndexItems,
  getProjectOptions,
  readinessAreas,
  readinessStates,
} from "../../data/project-adapter";
import { ProjectFilters } from "./project-filters";
import { LocalizedCopy } from "../i18n/localized-copy";
import { getProjectReviewSummary } from "../../data/project-public-evidence-adapter";
import { connectProjectIndexItem } from "../../data/connected-context-adapter";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Static project intelligence for source-backed floating offshore wind projects.",
};

export default function ProjectsPage() {
  const projects = getProjectIndexItems().map((project) => ({ ...connectProjectIndexItem(project), ...getProjectReviewSummary(project.id) }));
  const options = getProjectOptions();

  return localizeServerContent((
    <main className="projects-page">

      <section className="project-hero" aria-labelledby="projects-heading">
        <h1 id="projects-heading"><LocalizedCopy en="Floating Wind Projects" zh="浮式海上风电项目" /></h1>
        <p>
          <LocalizedCopy en="Compare project stages, investment decisions and readiness by region." zh="按地区比较项目阶段、投资决策和建设准备情况。" />
        </p>
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

    </main>
  ));
}
