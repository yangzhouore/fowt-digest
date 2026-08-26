import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../site-footer";
import { SiteHeader } from "../../site-header";
import { LocalizedCopy } from "../../i18n/localized-copy";
import {
  formatCapacity,
  formatDate,
  formatEventType,
  formatRole,
  formatStatus,
  getAllProjects,
  getProjectBySlug,
  type ProjectCompanyRelationship,
} from "../../../data/project-adapter";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project not found",
    };
  }

  return {
    title: project.name,
    description: `${project.country} floating offshore wind project: ${formatStatus(project.normalizedStatus)}.`,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const groupedRelationships = groupRelationships(project.relationships);
  const technicalFacts = [
    { label: "Floating technology", value: project.floatingTechnology },
    { label: "Platform type", value: formatPlatformType(project.platformType) },
    {
      label: "Turbine OEM",
      value: relationshipNames(project.relationships, "wind_turbine_oem"),
    },
    {
      label: "Turbine count",
      value: project.turbineCount === null ? null : String(project.turbineCount),
    },
    {
      label: "Turbine rating",
      value:
        project.turbineRatingMw === null
          ? null
          : `${project.turbineRatingMw} MW`,
    },
    { label: "Water depth", value: project.waterDepthM },
    { label: "Distance offshore", value: project.distanceOffshore },
    { label: "Expected COD", value: project.expectedCod },
    { label: "Actual COD", value: project.actualCod },
  ].filter((fact) => fact.value);

  return (
    <main>
      <SiteHeader />

      <article>
        <section className="project-detail-hero" aria-labelledby="project-heading">
          <p className="eyebrow"><LocalizedCopy en="Project profile" zh="项目档案" /></p>
          <h1 id="project-heading">{project.name}</h1>
          <p>
            {project.locationDescription ?? project.seaArea ?? project.country}
          </p>
          <dl className="project-identity-grid" aria-label="Project identity">
            <div>
              <dt>Country</dt>
              <dd>{project.country}</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>{project.region}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`project-status project-status-${project.normalizedStatus}`}>
                  {formatStatus(project.normalizedStatus)}
                </span>
              </dd>
            </div>
            {formatCapacity(project.capacityMw) ? (
              <div>
                <dt>Capacity</dt>
                <dd>{formatCapacity(project.capacityMw)}</dd>
              </div>
            ) : null}
          </dl>
          {project.sourceStatus ? (
            <p className="project-source-status">
              Source terminology: {project.sourceStatus}
            </p>
          ) : null}
        </section>

        <section className="project-technical" aria-labelledby="technical-heading">
          <h2 id="technical-heading"><LocalizedCopy en="Technical configuration" zh="技术配置" /></h2>
          {technicalFacts.length > 0 ? (
            <dl className="project-fact-grid">
              {technicalFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="project-muted-note">
              No additional technical configuration facts are verified in the
              current dataset.
            </p>
          )}
        </section>

        <section className="project-ecosystem" aria-labelledby="ecosystem-heading">
          <div className="project-section-copy">
            <p className="eyebrow"><LocalizedCopy en="Project ecosystem" zh="项目生态" /></p>
            <h2 id="ecosystem-heading"><LocalizedCopy en="Who is involved, and what are they doing?" zh="有哪些参与方，各自承担什么工作？" /></h2>
          </div>
          <div className="project-ecosystem-grid">
            {groupedRelationships.map(([role, relationships]) => (
              <section className="project-role-group" key={role}>
                <h3>{formatRole(role)}</h3>
                <ul>
                  {relationships.map((relationship) => (
                    <li key={relationship.id}>
                      <p>{relationship.companyName}</p>
                      {relationship.roleDetail ? (
                        <span>{relationship.roleDetail}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section className="project-timeline-section" aria-labelledby="timeline-heading">
          <div className="project-section-copy">
            <p className="eyebrow"><LocalizedCopy en="Timeline" zh="时间线" /></p>
            <h2 id="timeline-heading"><LocalizedCopy en="Source-backed milestones" zh="有来源依据的里程碑" /></h2>
          </div>
          {project.timelineEvents.length > 0 ? (
            <ol className="project-timeline">
              {project.timelineEvents.map((event) => (
                <li key={event.id}>
                  <time dateTime={event.date}>
                    {formatDate(event.date, event.datePrecision)}
                  </time>
                  <div>
                    <p className="project-timeline-type">
                      {formatEventType(event.eventType)}
                    </p>
                    <h3>{event.title}</h3>
                    {event.companyNames.length > 0 ? (
                      <p className="project-timeline-companies">
                        {event.companyNames.join(" / ")}
                      </p>
                    ) : null}
                    <p>{event.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="project-muted-note">
              No dated timeline milestones are verified in the current dataset.
            </p>
          )}
        </section>

        <section className="project-sources" aria-labelledby="sources-heading">
          <div className="project-section-copy">
            <p className="eyebrow"><LocalizedCopy en="Provenance" zh="溯源" /></p>
            <h2 id="sources-heading"><LocalizedCopy en="Sources supporting this profile" zh="支持本档案的来源" /></h2>
          </div>
          <ol className="project-source-list">
            {project.sources.map((source) => (
              <li key={source.sourceId}>
                <article>
                  <p className="project-source-tier">Tier {source.sourceTier}</p>
                  <h3>
                    <a href={source.url}>{source.title}</a>
                  </h3>
                  <p>
                    {source.publisher} / accessed {source.accessedDate}
                  </p>
                  <p>{source.licenseNote}</p>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="project-navigation-heading">
          <h2 id="project-navigation-heading"><LocalizedCopy en="Project index" zh="项目索引" /></h2>
          <p className="text-link-row">
            <Link href="/projects"><LocalizedCopy en="Back to all projects" zh="返回全部项目" /></Link>
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}

function groupRelationships(
  relationships: ProjectCompanyRelationship[],
): [string, ProjectCompanyRelationship[]][] {
  const grouped = new Map<string, ProjectCompanyRelationship[]>();
  for (const relationship of relationships) {
    const values = grouped.get(relationship.role) ?? [];
    values.push(relationship);
    grouped.set(relationship.role, values);
  }
  return Array.from(grouped.entries());
}

function relationshipNames(
  relationships: ProjectCompanyRelationship[],
  role: string,
): string | null {
  const names = relationships
    .filter((relationship) => relationship.role === role)
    .map((relationship) => relationship.companyName);

  return names.length > 0 ? names.join(" / ") : null;
}

function formatPlatformType(value: string): string | null {
  if (value === "unknown") {
    return null;
  }
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
