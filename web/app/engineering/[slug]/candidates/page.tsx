import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../../site-header";
import { SiteFooter } from "../../../site-footer";
import {
  getAllEngineeringBriefings,
  getEngineeringBriefingBySlug,
} from "../../../../data/engineering-briefing-adapter";

const sourceTypeLabels = {
  government_announcement: "Government announcement",
  standards_update: "Standards update",
  software_release: "Software release",
  company_announcement: "Company announcement",
  trade_association: "Trade association",
  industry_news: "Industry news",
  conference_announcement: "Conference announcement",
};

type EngineeringCandidatesPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllEngineeringBriefings().map((briefing) => ({ slug: briefing.slug }));
}

export async function generateMetadata({
  params,
}: EngineeringCandidatesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const briefing = getEngineeringBriefingBySlug(slug);

  if (!briefing) {
    return {
      title: "Engineering candidate sources not found",
    };
  }

  return {
    title: `Engineering candidate sources: ${briefing.dateRange}`,
    description:
      "Source records considered for a weekly source-backed FOWT Engineering Briefing.",
  };
}

export default async function EngineeringCandidatesPage({
  params,
}: EngineeringCandidatesPageProps) {
  const { slug } = await params;
  const briefing = getEngineeringBriefingBySlug(slug);

  if (!briefing) {
    notFound();
  }

  const selectionModel = briefing.selectionModel;
  const hasScoredSelection = selectionModel !== null;
  const selectedCount = hasScoredSelection
    ? briefing.sourceCandidates.filter((candidate) => candidate.selected).length
    : briefing.itemCount;

  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="engineering-candidates-heading">
        <p className="eyebrow">Engineering selection transparency</p>
        <h1 id="engineering-candidates-heading">{briefing.dateRange}</h1>
        {hasScoredSelection ? (
          <p>
            The Engineering workflow scored {briefing.sourceCandidates.length} retained source
            records, ranked them by importance, then applied a small deterministic diversity
            layer to select {selectedCount} weekly highlights.
          </p>
        ) : (
          <p>
            This Engineering Briefing was manually curated from {briefing.sourceRecords.length}{" "}
            retained source records. This edition does not retain deterministic numeric scores.
          </p>
        )}
      </section>

      <section className="edition-meta" aria-labelledby="engineering-candidate-meta-heading">
        <h2 id="engineering-candidate-meta-heading">Source metadata</h2>
        <dl>
          <div>
            <dt>Candidate pool</dt>
            <dd>{hasScoredSelection ? briefing.sourceCandidates.length : briefing.sourceRecords.length}</dd>
          </div>
          <div>
            <dt>Published highlights</dt>
            <dd>{briefing.itemCount}</dd>
          </div>
          <div>
            <dt>Selection method</dt>
            <dd>{hasScoredSelection ? "Score plus diversity" : "Manual source-backed review"}</dd>
          </div>
          <div>
            <dt>Selection Score</dt>
            <dd>{hasScoredSelection ? selectionModel.label : "Not available"}</dd>
          </div>
        </dl>
      </section>

      {hasScoredSelection ? (
        <section aria-labelledby="engineering-score-model-heading">
          <h2 id="engineering-score-model-heading">Selection Score</h2>
          <p>
            {selectionModel.description} The score measures source-backed engineering
            importance. Diversity is applied after scoring so the final five avoid unnecessary
            duplication across source, project, topic and region where practical.
          </p>
          <div className="score-formula" aria-label="Engineering 100 point score formula">
            <dl>
              {selectionModel.components.map((component) => (
                <div key={component.componentId}>
                  <dt>{component.label}</dt>
                  <dd>{component.maxScore}</dd>
                </div>
              ))}
              <div className="score-total">
                <dt>Total</dt>
                <dd>100</dd>
              </div>
            </dl>
            <div className="score-component-copy">
              {selectionModel.diversityRules.map((rule) => (
                <p key={rule}>{rule}</p>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section aria-labelledby="engineering-score-boundary-heading">
          <h2 id="engineering-score-boundary-heading">Why no score?</h2>
          <p>
            Earlier Engineering editions store source records, item-source provenance, category,
            region and briefing copy, but not ranked candidate lists or deterministic scoring
            components. No numeric score is shown when one would be unsupported.
          </p>
        </section>
      )}

      <section aria-labelledby="engineering-source-list-heading">
        <div className="section-heading-row">
          <h2 id="engineering-source-list-heading">
            {hasScoredSelection ? "Ranked source candidates" : "Retained source records"}
          </h2>
          <p>
            {hasScoredSelection ? briefing.sourceCandidates.length : briefing.sourceRecords.length}{" "}
            records
          </p>
        </div>
        {hasScoredSelection ? (
          <ol className="candidate-list">
            {briefing.sourceCandidates.map((candidate) => {
              const selectedItem = briefing.items.find(
                (item) => item.id === candidate.selectedBriefingItemId,
              );

              return (
                <li key={candidate.id} className={candidate.selected ? "is-selected" : undefined}>
                  <article className="candidate-row engineering-candidate-row">
                    <div className="candidate-rank">
                      <span>{candidate.rawRank}</span>
                      {candidate.selected ? <strong>Selected</strong> : null}
                    </div>
                    <div className="candidate-copy">
                      <h3>{candidate.sourceRecord.title}</h3>
                      <p className="candidate-meta-line">
                        {formatPublicationDate(candidate.sourceRecord.publishedDate)} /{" "}
                        {candidate.sourceRecord.publisher} /{" "}
                        {sourceTypeLabels[candidate.sourceRecord.sourceType]}
                      </p>
                      <p className="candidate-meta-line">
                        {candidate.diversitySignals.regionHint} /{" "}
                        {candidate.diversitySignals.topicGroup.replace(/_/g, " ")} /{" "}
                        {candidate.selectionReason}
                      </p>
                      {selectedItem ? (
                        <p className="candidate-meta-line">Supports: {selectedItem.title}</p>
                      ) : null}
                      {candidate.diversityReason ? (
                        <p className="candidate-meta-line">Diversity: {candidate.diversityReason}</p>
                      ) : null}
                    </div>
                    <div className="candidate-score">
                      <span>Engineering Selection Score</span>
                      <strong>{candidate.score.total} / 100</strong>
                      <p>
                        Raw rank {candidate.rawRank}
                        {candidate.finalRank ? ` / Final ${candidate.finalRank}` : " / Not selected"}
                      </p>
                      <dl className="score-breakdown" aria-label="Score breakdown">
                        {candidate.score.components.map((component) => (
                          <div key={component.id}>
                            <dt>{component.label}</dt>
                            <dd>{component.score} / {component.maxScore}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <p className="candidate-source">
                      <a href={candidate.sourceRecord.sourceUrl}>Open source</a>
                    </p>
                  </article>
                </li>
              );
            })}
          </ol>
        ) : (
          <ManualSourceList briefing={briefing} />
        )}
      </section>

      <section aria-labelledby="engineering-candidate-boundary-heading">
        <h2 id="engineering-candidate-boundary-heading">Data boundary</h2>
        <p>
          These records are retained public sources in the static Engineering Briefing file. They
          are not a scraped market database and should not be read as complete news coverage.
        </p>
        <p className="text-link-row">
          <Link href={`/engineering/${briefing.slug}`}>Back to engineering briefing</Link>
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}

function ManualSourceList({
  briefing,
}: {
  briefing: NonNullable<ReturnType<typeof getEngineeringBriefingBySlug>>;
}) {
  const selectedSourceIds = new Set(
    briefing.items.flatMap((item) => item.sourceRecords.map((source) => source.id)),
  );

  return (
    <ol className="candidate-list">
      {briefing.sourceRecords.map((source, index) => {
        const selectedItems = briefing.items.filter((item) =>
          item.sourceRecords.some((itemSource) => itemSource.id === source.id),
        );
        const isSelected = selectedSourceIds.has(source.id);

        return (
          <li key={source.id} className={isSelected ? "is-selected" : undefined}>
            <article className="candidate-row engineering-candidate-row">
              <div className="candidate-rank">
                <span>{index + 1}</span>
                {isSelected ? <strong>Selected</strong> : null}
              </div>
              <div className="candidate-copy">
                <h3>{source.title}</h3>
                <p className="candidate-meta-line">
                  {formatPublicationDate(source.publishedDate)} / {source.publisher} /{" "}
                  {sourceTypeLabels[source.sourceType]}
                </p>
                {selectedItems.length > 0 ? (
                  <p className="candidate-meta-line">
                    Supports: {selectedItems.map((item) => item.title).join(" / ")}
                  </p>
                ) : null}
              </div>
              <div className="candidate-score candidate-score-unavailable">
                <span>Selection Score</span>
                <strong>Not available</strong>
                <p>Manual review</p>
              </div>
              <p className="candidate-source">
                <a href={source.sourceUrl}>Open source</a>
              </p>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

function formatPublicationDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
