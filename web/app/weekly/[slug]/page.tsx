import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../site-header";
import { SiteFooter } from "../../site-footer";
import { notFound } from "next/navigation";
import { currentEdition, mockPapers } from "../../../data/mock-papers";

type WeeklyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return [{ slug: currentEdition.slug }];
}

export async function generateMetadata({
  params,
}: WeeklyPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug !== currentEdition.slug) {
    return {
      title: "Weekly edition not found",
    };
  }

  return {
    title: currentEdition.dateRange,
    description: `Prototype weekly edition: ${currentEdition.introduction}`,
  };
}

export default async function WeeklyPage({ params }: WeeklyPageProps) {
  const { slug } = await params;

  if (slug !== currentEdition.slug) {
    notFound();
  }

  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="weekly-heading">
        <p className="eyebrow">Weekly edition</p>
        <h1 id="weekly-heading">{currentEdition.dateRange}</h1>
        <p>{currentEdition.introduction}</p>
      </section>

      <section className="edition-meta" aria-labelledby="edition-meta-heading">
        <h2 id="edition-meta-heading">Edition metadata</h2>
        <dl>
          <div>
            <dt>Date range</dt>
            <dd>{currentEdition.dateRange}</dd>
          </div>
          <div>
            <dt>Papers reviewed</dt>
            <dd>{currentEdition.papersReviewed}</dd>
          </div>
          <div>
            <dt>Selected</dt>
            <dd>{currentEdition.papersSelected}</dd>
          </div>
          <div>
            <dt>Reading time</dt>
            <dd>{currentEdition.readingTime}</dd>
          </div>
        </dl>
      </section>

      <section id="papers" aria-labelledby="selected-papers-heading">
        <h2 id="selected-papers-heading">Selected papers</h2>
        <ol className="paper-list">
          {mockPapers.map((paper) => (
            <li key={paper.id}>
              <article>
                <p className="paper-number">
                  {String(paper.number).padStart(2, "0")}
                </p>
                <h3>
                  <Link href={`/papers/${paper.slug}`}>{paper.title}</Link>
                </h3>
                <dl className="paper-meta">
                  <div>
                    <dt>Authors</dt>
                    <dd>{paper.authors.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>{paper.publicationSource}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{paper.publicationType}</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{paper.category}</dd>
                  </div>
                  <div>
                    <dt>Score</dt>
                    <dd className="paper-score">{paper.score}/10</dd>
                  </div>
                </dl>
                <p>{paper.editorialSummary}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="weekly-notice-heading">
        <h2 id="weekly-notice-heading">Mock-data notice</h2>
        <p>
          This edition and all listed paper information are fictional mock
          content for development only. No automated collection, scoring, or AI
          review has been used to produce this page.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
