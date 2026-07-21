import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../site-header";
import { SiteFooter } from "../../site-footer";
import { notFound } from "next/navigation";
import { currentDigest } from "../../../data/digest-adapter";

const ABSTRACT_PREVIEW_LENGTH = 280;

type WeeklyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return [{ slug: currentDigest.slug }];
}

export async function generateMetadata({
  params,
}: WeeklyPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug !== currentDigest.slug) {
    return {
      title: "Weekly edition not found",
    };
  }

  return {
    title: currentDigest.dateRange,
    description: `Pipeline weekly digest: ${currentDigest.introduction}`,
  };
}

export default async function WeeklyPage({ params }: WeeklyPageProps) {
  const { slug } = await params;

  if (slug !== currentDigest.slug) {
    notFound();
  }

  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="weekly-heading">
        <p className="eyebrow">Weekly digest</p>
        <h1 id="weekly-heading">{currentDigest.dateRange}</h1>
        <p>{currentDigest.introduction}</p>
      </section>

      <section className="edition-meta" aria-labelledby="edition-meta-heading">
        <h2 id="edition-meta-heading">Digest metadata</h2>
        <dl>
          <div>
            <dt>Date range</dt>
            <dd>{currentDigest.dateRange}</dd>
          </div>
          <div>
            <dt>Selected</dt>
            <dd>{currentDigest.selectedPaperCount}</dd>
          </div>
          <div>
            <dt>Generated</dt>
            <dd>{currentDigest.generatedAt}</dd>
          </div>
        </dl>
      </section>

      <section id="papers" aria-labelledby="selected-papers-heading">
        <h2 id="selected-papers-heading">Selected papers</h2>
        <ol className="paper-list">
          {currentDigest.papers.map((paper) => (
            <li key={paper.id}>
              <article>
                <p className="paper-number">
                  {String(paper.number).padStart(2, "0")}
                </p>
                <h3>
                  <Link href={`/papers/${paper.slug}`}>{paper.title}</Link>
                </h3>
                <p className="paper-authors">
                  {paper.authors.join(", ") || "No authors listed"}
                </p>
                <p className="paper-source-line">
                  {formatPublicationDate(paper.publicationDate)} /{" "}
                  {paper.publicationSource} / {paper.publicationType}
                </p>
                {paper.topicTags.length > 0 ? (
                  <ul className="topic-list" aria-label="Topic tags">
                    {paper.topicTags.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="paper-source-line">No topic tags</p>
                )}
                <p>{abstractPreview(paper.abstract)}</p>
                {paper.sourceUrl ? (
                  <p className="text-link-row">
                    <a href={paper.sourceUrl}>View source</a>
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="weekly-notice-heading">
        <h2 id="weekly-notice-heading">Pipeline-data notice</h2>
        <p>
          This page displays a static local copy of one deterministic pipeline
          output. It does not include AI-written summaries, editorial analysis,
          or automatic publication.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}

function abstractPreview(abstract: string | null): string {
  if (!abstract) {
    return "No abstract available.";
  }

  if (abstract.length <= ABSTRACT_PREVIEW_LENGTH) {
    return abstract;
  }

  return `${abstract.slice(0, ABSTRACT_PREVIEW_LENGTH)}...`;
}

function formatPublicationDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
