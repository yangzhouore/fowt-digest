import Link from "next/link";
import { notFound } from "next/navigation";
import { currentEdition, mockPapers } from "../../../data/mock-papers";

type PaperPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PaperPage({ params }: PaperPageProps) {
  const { slug } = await params;
  const paper = mockPapers.find((item) => item.slug === slug);

  if (!paper) {
    notFound();
  }

  return (
    <main>
      <header className="site-header">
        <Link className="site-name" href="/">
          FOWT Research Digest
        </Link>
        <div className="header-actions">
          <nav aria-label="Primary navigation">
            <Link href={`/weekly/${currentEdition.slug}`}>Weekly edition</Link>
            <Link href="/">Home</Link>
          </nav>
          <fieldset className="theme-toggle" aria-label="Theme mode">
            <legend>Theme</legend>
            <input id="theme-light" name="theme" type="radio" defaultChecked />
            <label htmlFor="theme-light">Light</label>
            <input id="theme-dark" name="theme" type="radio" />
            <label htmlFor="theme-dark">Dark</label>
          </fieldset>
        </div>
      </header>

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
            content for development only. No DOI or external publication link is
            provided because this is not a real publication.
          </p>
          <p className="text-link-row">
            <Link href={`/weekly/${currentEdition.slug}`}>
              Back to the weekly edition
            </Link>
          </p>
        </section>
      </article>
    </main>
  );
}
