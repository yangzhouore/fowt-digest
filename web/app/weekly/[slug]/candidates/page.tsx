import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../../site-header";
import { SiteFooter } from "../../../site-footer";
import {
  getAllResearchCandidatePools,
  getResearchCandidatePoolBySlug,
} from "../../../../data/research-candidate-adapter";
import { getDigestBySlug } from "../../../../data/digest-adapter";

type ResearchCandidatesPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllResearchCandidatePools().map((pool) => ({ slug: pool.slug }));
}

export async function generateMetadata({
  params,
}: ResearchCandidatesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pool = getResearchCandidatePoolBySlug(slug);

  if (!pool) {
    return {
      title: "Research candidates not found",
    };
  }

  return {
    title: `Research candidate pool: ${pool.dateRange}`,
    description: "Deterministic ranked candidate pool for a weekly FOWT Research Digest.",
  };
}

export default async function ResearchCandidatesPage({
  params,
}: ResearchCandidatesPageProps) {
  const { slug } = await params;
  const pool = getResearchCandidatePoolBySlug(slug);
  const digest = getDigestBySlug(slug);

  if (!pool || !digest) {
    notFound();
  }

  const selectedCount = pool.candidates.filter((candidate) => candidate.selected).length;

  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="research-candidates-heading">
        <p className="eyebrow">Research selection transparency</p>
        <h1 id="research-candidates-heading">{pool.dateRange}</h1>
        <p>
          The deterministic Research pipeline ranked {pool.candidateCount} OpenAlex
          candidates and selected {selectedCount} papers for the weekly digest.
        </p>
      </section>

      <section className="edition-meta" aria-labelledby="candidate-meta-heading">
        <h2 id="candidate-meta-heading">Candidate metadata</h2>
        <dl>
          <div>
            <dt>Candidate pool</dt>
            <dd>{pool.candidateCount}</dd>
          </div>
          <div>
            <dt>Selected</dt>
            <dd>{selectedCount}</dd>
          </div>
          <div>
            <dt>Selection limit</dt>
            <dd>{pool.selectionLimit}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{pool.sourceName}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="score-model-heading">
        <h2 id="score-model-heading">Selection Score</h2>
        <p>
          {pool.scoreModel.description} The underlying ranking order is
          deterministic: Selection Score first, then relevance classification,
          publication date, and paper ID as stable tie-breakers.
        </p>
      </section>

      <section aria-labelledby="candidate-list-heading">
        <div className="section-heading-row">
          <h2 id="candidate-list-heading">Ranked candidates</h2>
          <p>{pool.candidateCount} records</p>
        </div>
        <ol className="candidate-list">
          {pool.candidates.map((candidate) => (
            <li key={candidate.id} className={candidate.selected ? "is-selected" : undefined}>
              <article className="candidate-row">
                <div className="candidate-rank">
                  <span>{candidate.rank}</span>
                  {candidate.selected ? <strong>Selected</strong> : null}
                </div>
                <div className="candidate-copy">
                  <h3>{candidate.title}</h3>
                  <p className="candidate-meta-line">
                    {formatPublicationDate(candidate.publicationDate)} /{" "}
                    {candidate.publicationSource} / {candidate.publicationType}
                  </p>
                  <p className="candidate-meta-line">
                    {candidate.classification ?? "Unclassified"} /{" "}
                    {candidate.classificationReason ?? "No classifier reason"} /{" "}
                    {candidate.selectionReason}
                  </p>
                  {candidate.topicTags.length > 0 ? (
                    <ul className="candidate-topic-list" aria-label="Topic tags">
                      {candidate.topicTags.slice(0, 4).map((topic) => (
                        <li key={topic}>{topic}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="candidate-score">
                  <span>Selection Score</span>
                  <strong>{candidate.selectionScore} / 100</strong>
                  <p>Rank {candidate.rank} of {pool.candidateCount}</p>
                  <dl className="score-breakdown" aria-label="Score breakdown">
                    {candidate.scoreComponents.map((component) => (
                      <div key={component.id}>
                        <dt>{component.label}</dt>
                        <dd>{component.score} / {component.maxScore}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <p className="candidate-source">
                  {candidate.sourceUrl ? (
                    <a href={candidate.sourceUrl}>Open source</a>
                  ) : (
                    "No source link"
                  )}
                </p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="candidate-boundary-heading">
        <h2 id="candidate-boundary-heading">Data boundary</h2>
        <p>
          Candidate pools are shown only for editions where ranked candidate data
          was retained. Historical weekly editions without retained ranked
          candidates are not reconstructed from guesses.
        </p>
        <p className="text-link-row">
          <Link href={`/weekly/${digest.slug}`}>Back to weekly digest</Link>
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
