import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../../site-header";
import { SiteFooter } from "../../../site-footer";
import {
  getAllEngineeringBriefings,
  getEngineeringBriefingBySlug,
} from "../../../../data/engineering-briefing-adapter";

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

  const selectedSourceIds = new Set(
    briefing.items.flatMap((item) => item.sourceRecords.map((source) => source.id)),
  );

  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="engineering-candidates-heading">
        <p className="eyebrow">Engineering selection transparency</p>
        <h1 id="engineering-candidates-heading">{briefing.dateRange}</h1>
        <p>
          This Engineering Briefing was manually curated from{" "}
          {briefing.sourceRecords.length} retained source records. The current
          Engineering workflow does not assign a deterministic numeric ranking score.
        </p>
      </section>

      <section className="edition-meta" aria-labelledby="engineering-candidate-meta-heading">
        <h2 id="engineering-candidate-meta-heading">Source metadata</h2>
        <dl>
          <div>
            <dt>Retained source records</dt>
            <dd>{briefing.sourceRecords.length}</dd>
          </div>
          <div>
            <dt>Published highlights</dt>
            <dd>{briefing.itemCount}</dd>
          </div>
          <div>
            <dt>Selection method</dt>
            <dd>Manual source-backed review</dd>
          </div>
          <div>
            <dt>Selection Score</dt>
            <dd>Not available</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="engineering-score-boundary-heading">
        <h2 id="engineering-score-boundary-heading">Why no score?</h2>
        <p>
          Engineering items are selected through manual source review. The JSON
          stores source records, item-source provenance, category, region and
          briefing copy, but it does not retain a ranked candidate list or
          deterministic scoring components. No numeric score is shown here
          because one would be unsupported.
        </p>
      </section>

      <section aria-labelledby="engineering-source-list-heading">
        <div className="section-heading-row">
          <h2 id="engineering-source-list-heading">Retained source records</h2>
          <p>{briefing.sourceRecords.length} records</p>
        </div>
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
                      {formatPublicationDate(source.publishedDate)} /{" "}
                      {source.publisher} / {source.sourceType.replace(/_/g, " ")}
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
      </section>

      <section aria-labelledby="engineering-candidate-boundary-heading">
        <h2 id="engineering-candidate-boundary-heading">Data boundary</h2>
        <p>
          These records are the retained public sources in the static Engineering
          Briefing file. They are not a scraped market database and should not be
          read as complete news coverage.
        </p>
        <p className="text-link-row">
          <Link href={`/engineering/${briefing.slug}`}>Back to engineering briefing</Link>
        </p>
      </section>

      <SiteFooter />
    </main>
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
