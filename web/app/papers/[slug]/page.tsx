import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../site-header";
import { SiteFooter } from "../../site-footer";
import { notFound } from "next/navigation";
import { currentEdition, mockPapers } from "../../../data/mock-papers";

type PaperPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return mockPapers.map((paper) => ({
    slug: paper.slug,
  }));
}

export async function generateMetadata({
  params,
}: PaperPageProps): Promise<Metadata> {
  const { slug } = await params;
  const paper = mockPapers.find((item) => item.slug === slug);

  if (!paper) {
    return {
      title: "Paper not found",
    };
  }

  return {
    title: paper.title,
    description: `Fictional mock paper detail: ${paper.editorialSummary}`,
  };
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { slug } = await params;
  const paper = mockPapers.find((item) => item.slug === slug);

  if (!paper) {
    notFound();
  }

  return (
    <main>
      <SiteHeader />

      <article>
        <section className="intro" aria-labelledby="paper-heading">
          <p className="eyebrow">Fictional paper detail</p>
          <h1 id="paper-heading">{paper.title}</h1>
          <p>{paper.editorialSummary}</p>
        </section>

        <section className="paper-detail-meta" aria-labelledby="paper-meta-heading">
          <h2 id="paper-meta-heading">Paper metadata</h2>
          <dl>
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
              <dt>Publication date</dt>
              <dd>{paper.publicationDate}</dd>
            </div>
            <div>
              <dt>Categories</dt>
              <dd>{paper.categories.join(", ")}</dd>
            </div>
            <div>
              <dt>Score</dt>
              <dd className="paper-score">{paper.score}/10</dd>
            </div>
            <div>
              <dt>Analysis level</dt>
              <dd>{paper.analysisLevel}</dd>
            </div>
          </dl>
        </section>

        <section className="analysis-sections" aria-labelledby="analysis-heading">
          <h2 id="analysis-heading">Analysis</h2>
          <section>
            <h3>Research problem</h3>
            <p>{paper.researchProblem}</p>
          </section>
          <section>
            <h3>Methodology</h3>
            <p>{paper.methodology}</p>
          </section>
          <section>
            <h3>Key findings</h3>
            <p>{paper.keyFindings}</p>
          </section>
          <section>
            <h3>Engineering relevance</h3>
            <p>{paper.engineeringRelevance}</p>
          </section>
          <section>
            <h3>Limitations</h3>
            <p>{paper.limitations}</p>
          </section>
        </section>

        <section aria-labelledby="fictional-notice-heading">
          <h2 id="fictional-notice-heading">Fictional mock content</h2>
          <p>
            This paper, its metadata, and the analysis above are fictional mock
            content for development only. It is included to test how a future
            digest entry may present metadata, summaries, relevance, and
            limitations. No DOI or external publication link is provided because
            this is not a real publication.
          </p>
          <p className="text-link-row">
            <Link href={`/weekly/${currentEdition.slug}`}>
              Back to the weekly edition
            </Link>
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
