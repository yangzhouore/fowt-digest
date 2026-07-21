import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../site-header";
import { SiteFooter } from "../../site-footer";
import { notFound } from "next/navigation";
import { currentDigest, getDigestPaperBySlug } from "../../../data/digest-adapter";

type PaperPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return currentDigest.papers.map((paper) => ({
    slug: paper.slug,
  }));
}

export async function generateMetadata({
  params,
}: PaperPageProps): Promise<Metadata> {
  const { slug } = await params;
  const paper = getDigestPaperBySlug(slug);

  if (!paper) {
    return {
      title: "Paper not found",
    };
  }

  return {
    title: paper.title,
    description: "Pipeline paper metadata from the static weekly digest snapshot.",
  };
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { slug } = await params;
  const paper = getDigestPaperBySlug(slug);

  if (!paper) {
    notFound();
  }

  return (
    <main>
      <SiteHeader />

      <article>
        <section className="intro" aria-labelledby="paper-heading">
          <p className="eyebrow">Pipeline paper detail</p>
          <h1 id="paper-heading">{paper.title}</h1>
          <p className="paper-authors">
            {paper.authors.join(", ") || "No authors listed"}
          </p>
          <p className="paper-source-line">
            Rank {paper.number} / {formatPublicationDate(paper.publicationDate)} /{" "}
            {paper.publicationSource} / {paper.publicationType}
          </p>
          <p>
            Selected from the deterministic weekly digest for{" "}
            {currentDigest.dateRange}.
          </p>
          {paper.sourceUrl || paper.doi ? (
            <p className="paper-action-row">
              {paper.sourceUrl ? <a href={paper.sourceUrl}>View source</a> : null}
              {paper.sourceUrl && paper.doi ? " / " : null}
              {paper.doi ? <a href={paper.doi}>Open DOI</a> : null}
            </p>
          ) : null}
        </section>

        <section className="paper-abstract" aria-labelledby="abstract-heading">
          <h2 id="abstract-heading">Abstract</h2>
          <p>{paper.abstract ?? "No abstract available."}</p>
        </section>

        <section className="paper-detail-meta" aria-labelledby="paper-meta-heading">
          <h2 id="paper-meta-heading">Supporting metadata</h2>
          <dl>
            <div>
              <dt>Rank</dt>
              <dd>{paper.number}</dd>
            </div>
            <div>
              <dt>Publication date</dt>
              <dd>{formatPublicationDate(paper.publicationDate)}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{paper.publicationSource}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{paper.publicationType}</dd>
            </div>
            {paper.doi ? (
              <div>
                <dt>DOI</dt>
                <dd>
                  <a href={paper.doi}>{paper.doi}</a>
                </dd>
              </div>
            ) : null}
            {paper.classification ? (
              <div>
                <dt>Classification</dt>
                <dd>{paper.classification}</dd>
              </div>
            ) : null}
            <div>
              <dt>Selection reason</dt>
              <dd>{paper.selectionReason}</dd>
            </div>
            {paper.openAccessStatus ? (
              <div>
                <dt>Open access</dt>
                <dd>{paper.openAccessStatus}</dd>
              </div>
            ) : null}
            <div>
              <dt>Full text</dt>
              <dd>{paper.fullTextAvailability}</dd>
            </div>
          </dl>
          {paper.topicTags.length > 0 ? (
            <ul className="topic-list" aria-label="Topic tags">
              {paper.topicTags.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          ) : (
            <p className="paper-source-line">No topic tags</p>
          )}
        </section>

        <section aria-labelledby="pipeline-notice-heading">
          <h2 id="pipeline-notice-heading">Pipeline-data notice</h2>
          <p>
            This page uses a static local copy of one deterministic pipeline
            digest snapshot. It does not include AI-written summaries or
            editorial analysis.
          </p>
          <p className="text-link-row">
            <Link href={`/weekly/${currentDigest.slug}`}>
              Back to the weekly digest
            </Link>
          </p>
        </section>
      </article>

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
