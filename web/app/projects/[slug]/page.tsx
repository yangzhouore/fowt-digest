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
  type ProjectWithRelations,
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

  if (project.id === "green-volt" && project.intelligence) {
    return (
      <GreenVoltProjectDetailPage
        groupedRelationships={groupedRelationships}
        intelligence={project.intelligence}
        project={project}
      />
    );
  }

  if (project.intelligence) {
    return (
      <ProjectIntelligenceDetailPage
        groupedRelationships={groupedRelationships}
        intelligence={project.intelligence}
        project={project}
        technicalFacts={technicalFacts}
      />
    );
  }

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

function ProjectIntelligenceDetailPage({
  groupedRelationships,
  intelligence,
  project,
  technicalFacts,
}: {
  groupedRelationships: [string, ProjectCompanyRelationship[]][];
  intelligence: NonNullable<ProjectWithRelations["intelligence"]>;
  project: ProjectWithRelations;
  technicalFacts: { label: string; value: string | null }[];
}) {
  const headlineFacts = buildHeadlineFacts(project, intelligence);
  const readinessRows = parseReadinessRows(intelligence.currentGates);
  const progressGates = buildProgressGates(project, readinessRows, intelligence);
  const storySteps = buildStorySteps(project, intelligence);
  const watchpoints = intelligence.watchpoints.map(parseWatchpoint);

  return (
    <main>
      <SiteHeader />

      <article className="project-intel-detail">
        <section className="project-intel-hero" aria-labelledby="project-heading">
          <p className="eyebrow"><LocalizedCopy en="Project intelligence" zh="项目情报" /></p>
          <div className="project-intel-hero-grid">
            <div>
              <h1 id="project-heading">{project.name}</h1>
              <p className="project-intel-status-line">
                {formatStatus(project.normalizedStatus)} · {shortFidStatus(intelligence.fidStatus)}
              </p>
              <p className="project-intel-standfirst">{intelligence.currentAssessment}</p>
            </div>
            <dl className="project-intel-hero-facts" aria-label={`${project.name} key facts`}>
              {headlineFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="project-intel-section project-intel-progress-section" aria-labelledby="progress-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Project progress</p>
            <h2 id="progress-heading">Lifecycle gates</h2>
          </div>
          <ol className="project-intel-progress">
            {progressGates.map((gate) => (
              <li key={gate.label} className={`project-intel-state-${stateClass(gate.state)}`}>
                <p>{gate.label}</p>
                <strong>{gate.state}</strong>
                <span>{gate.note}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="project-intel-section project-intel-stands" aria-labelledby="stands-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Where the project stands</p>
            <h2 id="stands-heading">{whereStandsHeading(project, intelligence)}</h2>
          </div>
          <div className="project-intel-two-column">
            <article>
              <h3>Confirmed</h3>
              <ul>
                {intelligence.confirmedFacts.slice(0, 4).map((fact) => (
                  <li key={fact.text}>{fact.text}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Assessment</h3>
              <p>{intelligence.editorialInferences[0]?.text ?? intelligence.currentAssessment}</p>
              <p className="project-intel-fid-note">{intelligence.fidStatus}</p>
            </article>
          </div>
        </section>

        <section className="project-intel-section" aria-labelledby="story-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Why the story changed</p>
            <h2 id="story-heading">From original thesis to current gate</h2>
          </div>
          <ol className="project-intel-story-chain">
            {storySteps.map((step) => (
              <li key={step.label}>
                <span>{step.label}</span>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="project-intel-section" aria-labelledby="readiness-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Readiness</p>
            <h2 id="readiness-heading">What is secured, active, or still missing</h2>
          </div>
          <div className="project-intel-readiness" role="table" aria-label={`${project.name} readiness matrix`}>
            {readinessRows.map((row) => (
              <div key={row.area} role="row">
                <p role="cell">{row.area}</p>
                <strong className={`project-intel-state-pill project-intel-state-${stateClass(row.state)}`} role="cell">
                  {row.state}
                </strong>
                <span role="cell">{row.evidence}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="project-intel-section" aria-labelledby="watch-heading">
          <div className="project-section-copy">
            <p className="eyebrow">What to watch next</p>
            <h2 id="watch-heading">Signals that would change the assessment</h2>
          </div>
          <ol className="project-intel-watchpoints">
            {watchpoints.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.why}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="project-timeline-section project-intel-section project-intel-secondary" aria-labelledby="timeline-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Material timeline</p>
            <h2 id="timeline-heading">Source-backed milestones</h2>
          </div>
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
        </section>

        <section className="project-technical project-intel-section project-intel-secondary" aria-labelledby="technical-heading">
          <h2 id="technical-heading">Technical configuration</h2>
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

        <section className="project-ecosystem project-intel-section project-intel-secondary" aria-labelledby="ecosystem-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Companies</p>
            <h2 id="ecosystem-heading">Project relationships</h2>
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

        <section className="project-sources project-intel-section project-intel-secondary" aria-labelledby="sources-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Sources</p>
            <h2 id="sources-heading">Provenance</h2>
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

        <section className="project-intel-section project-intel-secondary" aria-labelledby="project-navigation-heading">
          <h2 id="project-navigation-heading">Project index</h2>
          <p className="text-link-row">
            <Link href="/projects">Back to all projects</Link>
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}

function GreenVoltProjectDetailPage({
  groupedRelationships,
  intelligence,
  project,
}: {
  groupedRelationships: [string, ProjectCompanyRelationship[]][];
  intelligence: NonNullable<ProjectWithRelations["intelligence"]>;
  project: ProjectWithRelations;
}) {
  const headlineFacts = [
    { label: "CfD", value: "400 MW" },
    { label: "Turbines", value: "Up to 35" },
    { label: "Distance", value: "~80 km offshore" },
    { label: "FID", value: "Not verified" },
    { label: "COD", value: "Unknown" },
  ];
  const progressGates = [
    {
      label: "Development",
      state: "SECURED",
      note: "INTOG option route established.",
    },
    {
      label: "Consent",
      state: "SECURED",
      note: "Onshore and offshore approvals granted.",
    },
    {
      label: "Revenue",
      state: "SECURED",
      note: "400 MW AR6 CfD; industrial offtake remains separate.",
    },
    {
      label: "FEED",
      state: "ACTIVE",
      note: "Onshore substation FEED and surveys continue.",
    },
    {
      label: "FID",
      state: "NOT VERIFIED",
      note: "No public financial close announcement verified.",
    },
    {
      label: "Procurement",
      state: "UNKNOWN",
      note: "Major turbine, floater, cable, mooring, and EPCI awards not verified.",
    },
    {
      label: "Construction",
      state: "NOT STARTED",
      note: "No construction-start evidence in the dataset.",
    },
    {
      label: "Operation",
      state: "NOT STARTED",
      note: "Committed COD is unknown.",
    },
  ];
  const storySteps = [
    {
      label: "Original thesis",
      text: "Use floating wind to supply oil-and-gas installations and export surplus power to the UK grid.",
    },
    {
      label: "De-risking",
      text: "Consent, an INTOG option agreement, and 400 MW of CfD support moved the project beyond early development.",
    },
    {
      label: "Turning point",
      text: "The reported Buzzard electrification setback weakened the original industrial offtake route.",
    },
    {
      label: "Current position",
      text: "Green Volt remains active and pre-construction, but FID, offtake, and procurement are still gating decisions.",
    },
  ];
  const readinessRows = [
    {
      area: "Permitting",
      state: "SECURED",
      evidence: "Onshore and offshore consent granted.",
    },
    {
      area: "Revenue",
      state: "SECURED",
      evidence: "400 MW AR6 CfD secured; oil-and-gas offtake is unresolved.",
    },
    {
      area: "Engineering",
      state: "ACTIVE",
      evidence: "Worley FEED and 2026 survey work support detailed design.",
    },
    {
      area: "Procurement",
      state: "UNKNOWN",
      evidence: "Major supply and EPCI awards are not verified.",
    },
    {
      area: "Financing / FID",
      state: "NOT VERIFIED",
      evidence: "No public FID or financial close announcement verified.",
    },
    {
      area: "Execution",
      state: "NOT STARTED",
      evidence: "No fabrication, construction, or installation start verified.",
    },
  ];
  const watchpoints = [
    {
      title: "FID / financial close",
      why: "Would convert the current pre-FID assessment into a committed construction case.",
    },
    {
      title: "Confirmed oil-and-gas offtake",
      why: "Would address the core INTOG commercial gate after the reported Buzzard setback.",
    },
    {
      title: "Crown Estate Scotland lease progression",
      why: "Would show Green Volt has stepped beyond its option agreement toward lease rights.",
    },
    {
      title: "Major turbine, floater, cable, mooring, or EPCI awards",
      why: "Would turn unresolved procurement into a traceable delivery chain.",
    },
    {
      title: "Fabrication or construction start",
      why: "Would mark the shift from active development into execution.",
    },
  ];

  return (
    <main>
      <SiteHeader />

      <article className="green-volt-detail">
        <section className="green-volt-hero" aria-labelledby="project-heading">
          <p className="eyebrow"><LocalizedCopy en="Project intelligence" zh="项目情报" /></p>
          <div className="green-volt-hero-grid">
            <div>
              <h1 id="project-heading">Green Volt</h1>
              <p className="green-volt-status-line">Active · Pre-FID</p>
              <p className="green-volt-standfirst">
                A consented 560 MW floating wind project with government-backed
                CfD support, active engineering work, and unresolved FID,
                industrial offtake, and procurement gates.
              </p>
            </div>
            <dl className="green-volt-hero-facts" aria-label="Green Volt key facts">
              {headlineFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="green-volt-section green-volt-progress-section" aria-labelledby="progress-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Project progress</p>
            <h2 id="progress-heading">Lifecycle gates</h2>
          </div>
          <ol className="green-volt-progress">
            {progressGates.map((gate) => (
              <li key={gate.label} className={`green-volt-state-${stateClass(gate.state)}`}>
                <p>{gate.label}</p>
                <strong>{gate.state}</strong>
                <span>{gate.note}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="green-volt-section green-volt-stands" aria-labelledby="stands-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Where the project stands</p>
            <h2 id="stands-heading">De-risked, but not committed to construction</h2>
          </div>
          <div className="green-volt-two-column">
            <article>
              <h3>Confirmed</h3>
              <ul>
                <li>Onshore and offshore consent is secured.</li>
                <li>Green Volt holds a Crown Estate Scotland option agreement.</li>
                <li>DESNZ awarded 400 MW of AR6 CfD support.</li>
                <li>Worley FEED and 2026 survey work show ongoing development.</li>
              </ul>
            </article>
            <article>
              <h3>Assessment</h3>
              <p>{intelligence.currentAssessment}</p>
              <p className="green-volt-fid-note">{intelligence.fidStatus}</p>
            </article>
          </div>
        </section>

        <section className="green-volt-section" aria-labelledby="story-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Why the story changed</p>
            <h2 id="story-heading">From route to market to gating decisions</h2>
          </div>
          <ol className="green-volt-story-chain">
            {storySteps.map((step) => (
              <li key={step.label}>
                <span>{step.label}</span>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="green-volt-section" aria-labelledby="readiness-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Readiness</p>
            <h2 id="readiness-heading">What is secured, active, or still missing</h2>
          </div>
          <div className="green-volt-readiness" role="table" aria-label="Green Volt readiness matrix">
            {readinessRows.map((row) => (
              <div key={row.area} role="row">
                <p role="cell">{row.area}</p>
                <strong className={`green-volt-state-pill green-volt-state-${stateClass(row.state)}`} role="cell">
                  {row.state}
                </strong>
                <span role="cell">{row.evidence}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="green-volt-section" aria-labelledby="watch-heading">
          <div className="project-section-copy">
            <p className="eyebrow">What to watch next</p>
            <h2 id="watch-heading">Signals that would change the assessment</h2>
          </div>
          <ol className="green-volt-watchpoints">
            {watchpoints.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.why}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="project-timeline-section green-volt-section green-volt-secondary" aria-labelledby="timeline-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Material timeline</p>
            <h2 id="timeline-heading">Source-backed milestones</h2>
          </div>
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
        </section>

        <section className="project-ecosystem green-volt-section green-volt-secondary" aria-labelledby="ecosystem-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Companies</p>
            <h2 id="ecosystem-heading">Project relationships</h2>
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

        <section className="project-sources green-volt-section green-volt-secondary" aria-labelledby="sources-heading">
          <div className="project-section-copy">
            <p className="eyebrow">Sources</p>
            <h2 id="sources-heading">Provenance</h2>
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

        <section className="green-volt-section green-volt-secondary" aria-labelledby="project-navigation-heading">
          <h2 id="project-navigation-heading">Project index</h2>
          <p className="text-link-row">
            <Link href="/projects">Back to all projects</Link>
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}

function stateClass(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type ReadinessRow = {
  area: string;
  state: string;
  evidence: string;
};

function buildHeadlineFacts(
  project: ProjectWithRelations,
  intelligence: NonNullable<ProjectWithRelations["intelligence"]>,
) {
  const turbines =
    project.turbineCount === null
      ? null
      : project.turbineRatingMw === null
        ? String(project.turbineCount)
        : `${project.turbineCount} x ${project.turbineRatingMw} MW`;
  const cod = project.actualCod ?? project.expectedCod ?? "Unknown";

  return [
    { label: "Capacity", value: formatCapacity(project.capacityMw) ?? "Unknown" },
    { label: "Turbines", value: turbines ?? "Unknown" },
    { label: "Distance", value: project.distanceOffshore ?? "Unknown" },
    {
      label: "FID",
      value: shortFidStatus(intelligence.fidStatus).replace(/^FID /, ""),
    },
    { label: "COD", value: cod },
  ];
}

function parseReadinessRows(items: string[]): ReadinessRow[] {
  return items.map((item) => {
    const match = item.match(/^(.+?)\s+-\s+([A-Z /]+):\s+(.+)$/);
    if (!match) {
      return {
        area: item,
        state: "UNKNOWN",
        evidence: "No structured gate evidence is available.",
      };
    }

    return {
      area: match[1],
      state: match[2],
      evidence: match[3],
    };
  });
}

function buildProgressGates(
  project: ProjectWithRelations,
  readinessRows: ReadinessRow[],
  intelligence: NonNullable<ProjectWithRelations["intelligence"]>,
) {
  const stateFor = (area: string) =>
    readinessRows.find((row) => row.area === area)?.state ?? "UNKNOWN";
  const noteFor = (area: string) =>
    readinessRows.find((row) => row.area === area)?.evidence ?? "Evidence not verified.";

  return [
    {
      label: "Development",
      state: project.normalizedStatus === "concept_early_development" ? "ACTIVE" : "SECURED",
      note: project.sourceStatus,
    },
    { label: "Consent", state: stateFor("Permitting"), note: noteFor("Permitting") },
    { label: "Revenue", state: stateFor("Revenue"), note: noteFor("Revenue") },
    { label: "FEED", state: stateFor("Engineering"), note: noteFor("Engineering") },
    {
      label: "FID",
      state: stateFor("Financing / FID"),
      note: intelligence.fidStatus,
    },
    { label: "Procurement", state: stateFor("Procurement"), note: noteFor("Procurement") },
    { label: "Construction", state: executionState(project), note: noteFor("Execution") },
    {
      label: "Operation",
      state: project.normalizedStatus === "operational" ? "SECURED" : "NOT STARTED",
      note:
        project.actualCod === null
          ? "No actual COD is verified."
          : `Actual COD: ${project.actualCod}.`,
    },
  ];
}

function buildStorySteps(
  project: ProjectWithRelations,
  intelligence: NonNullable<ProjectWithRelations["intelligence"]>,
) {
  return [
    {
      label: "Original thesis",
      text: project.sourceStatus,
    },
    {
      label: "Major de-risking",
      text: intelligence.confirmedFacts[0]?.text ?? "Material source-backed facts are recorded.",
    },
    {
      label: "Turning point",
      text:
        intelligence.editorialInferences[0]?.text ??
        "Current assessment follows from the verified milestones.",
    },
    {
      label: "Current state",
      text: intelligence.currentAssessment,
    },
  ];
}

function parseWatchpoint(item: string) {
  const [title, ...rest] = item.split(":");
  return {
    title: title.trim(),
    why: rest.join(":").trim() || "Would materially change the project assessment.",
  };
}

function shortFidStatus(value: string): string {
  if (value.startsWith("FID confirmed")) {
    return "FID confirmed";
  }
  if (value.startsWith("FID not verified")) {
    return "FID not verified";
  }
  if (value.startsWith("FID not reached")) {
    return "FID not reached";
  }
  return "FID UNKNOWN";
}

function whereStandsHeading(
  project: ProjectWithRelations,
  intelligence: NonNullable<ProjectWithRelations["intelligence"]>,
) {
  if (project.normalizedStatus === "operational") {
    return "Operating asset; remaining questions are evidence gaps";
  }
  if (intelligence.fidStatus.startsWith("FID not verified")) {
    return "De-risked, but not committed to construction";
  }
  if (intelligence.fidStatus.startsWith("FID not reached")) {
    return "Early stage; execution is not yet committed";
  }
  return "Current evidence defines the next gate";
}

function executionState(project: ProjectWithRelations): string {
  if (["operational", "commissioning"].includes(project.normalizedStatus)) {
    return "SECURED";
  }
  if (project.normalizedStatus === "under_construction") {
    return "ACTIVE";
  }
  return "NOT STARTED";
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
