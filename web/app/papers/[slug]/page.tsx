import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../site-header";
import { SiteFooter } from "../../site-footer";
import { LocalizedCopy } from "../../i18n/localized-copy";
import { notFound } from "next/navigation";
import {
  getAllDigests,
  getDigestPaperWithEditionBySlug,
} from "../../../data/digest-adapter";
import { hasResearchCandidatePool } from "../../../data/research-candidate-adapter";

type PaperPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  const slugs = new Set<string>();

  for (const digest of getAllDigests()) {
    for (const paper of digest.papers) {
      slugs.add(paper.slug);
    }
  }

  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PaperPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = getDigestPaperWithEditionBySlug(slug);

  if (!result) {
    return {
      title: "Paper not found",
    };
  }

  return {
    title: result.paper.title,
    description: "Pipeline paper metadata from a static weekly digest snapshot.",
  };
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { slug } = await params;
  const result = getDigestPaperWithEditionBySlug(slug);

  if (!result) {
    notFound();
  }

  const { edition, paper } = result;
  const hasCandidatePool = hasResearchCandidatePool(edition.slug);

  return (
    <main>
      <SiteHeader />

      <article>
        <section className="intro" aria-labelledby="paper-heading">
          <p className="eyebrow"><LocalizedCopy en="Pipeline paper detail" zh="流水线论文详情" /></p>
          <h1 id="paper-heading">{paper.title}</h1>
          <p className="paper-authors">
            {paper.authors.join(", ") || "No authors listed"}
          </p>
          <p className="paper-source-line">
            Rank {paper.number} / {formatPublicationDate(paper.publicationDate)} /{" "}
            {paper.publicationSource} / {paper.publicationType}
          </p>
          <p>
            Selected from the deterministic weekly digest for {edition.dateRange}.
          </p>
          {paper.selectionScore !== null ? (
            <p className="selection-score-inline">
              Selection Score {paper.selectionScore} / 100
            </p>
          ) : null}
          {paper.sourceUrl || paper.doi ? (
            <p className="paper-action-row">
              {paper.sourceUrl ? <a href={paper.sourceUrl}><LocalizedCopy en="View source" zh="查看来源" /></a> : null}
              {paper.sourceUrl && paper.doi ? " / " : null}
              {paper.doi ? <a href={paper.doi}>Open DOI</a> : null}
            </p>
          ) : null}
        </section>

        <section className="paper-abstract" aria-labelledby="abstract-heading">
          <h2 id="abstract-heading"><LocalizedCopy en="Abstract" zh="摘要" /></h2>
          <p>{paper.abstract ?? "No abstract available."}</p>
        </section>

        <section className="paper-detail-meta" aria-labelledby="paper-meta-heading">
          <h2 id="paper-meta-heading"><LocalizedCopy en="Supporting metadata" zh="辅助元数据" /></h2>
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
              <dt><LocalizedCopy en="Source" zh="来源" /></dt>
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
            {paper.classificationReason ? (
              <div>
                <dt>Classifier signal</dt>
                <dd>{paper.classificationReason}</dd>
              </div>
            ) : null}
            {paper.classificationConfidence !== null ? (
              <div>
                <dt>Classifier confidence</dt>
                <dd>{Math.round(paper.classificationConfidence * 100)} / 100</dd>
              </div>
            ) : null}
            {paper.selectionScore !== null ? (
              <div>
                <dt>Selection Score</dt>
                <dd>{paper.selectionScore} / 100</dd>
              </div>
            ) : null}
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

        {paper.selectionScoreComponents.length > 0 ? (
          <section aria-labelledby="selection-breakdown-heading">
            <h2 id="selection-breakdown-heading"><LocalizedCopy en="Selection score breakdown" zh="筛选评分明细" /></h2>
            <dl className="score-breakdown paper-score-breakdown">
              {paper.selectionScoreComponents.map((component) => (
                <div key={component.id}>
                  <dt>{component.label}</dt>
                  <dd>{component.score} / {component.maxScore}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section aria-labelledby="pipeline-notice-heading">
          <h2 id="pipeline-notice-heading"><LocalizedCopy en="Pipeline-data notice" zh="流水线数据说明" /></h2>
          <p>
            This page uses a static local copy of one selected historical
            demonstration edition from the deterministic pipeline. It does not
            include AI-written summaries or editorial analysis.
          </p>
          <p className="text-link-row">
            <Link href={`/weekly/${edition.slug}`}><LocalizedCopy en="Back to the weekly digest" zh="返回每周研究摘要" /></Link>
            {hasCandidatePool ? (
              <>
                {" / "}
                <Link href={`/weekly/${edition.slug}/candidates`}>
                  View candidate pool
                </Link>
              </>
            ) : null}
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
