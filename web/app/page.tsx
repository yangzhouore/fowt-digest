import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import {
  archiveEditions,
  currentEdition,
  mockPapers,
} from "../data/mock-papers";

export const metadata: Metadata = {
  title: "Home",
  description:
    "A prototype weekly digest for floating offshore wind turbine research.",
};

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="intro-heading">
        <p className="eyebrow">Field notes for floating wind</p>
        <h1 id="intro-heading">Fresh FOWT literature, distilled.</h1>
        <p>
          A weekly scan of academic and conference work for engineers who need
          the signal without the noise.
        </p>
      </section>

      <section className="edition-meta" aria-labelledby="edition-heading">
        <h2 id="edition-heading">Current edition</h2>
        <dl>
          <div>
            <dt>Date range</dt>
            <dd>
              <Link href={`/weekly/${currentEdition.slug}`}>
                {currentEdition.dateRange}
              </Link>
            </dd>
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

      <section id="weekly" aria-labelledby="papers-heading">
        <h2 id="papers-heading">Selected papers</h2>
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

      <section id="archive" aria-labelledby="recent-editions-heading">
        <h2 id="recent-editions-heading">Recent editions</h2>
        <ul className="edition-list">
          {archiveEditions.slice(0, 3).map((edition) => (
            <li key={edition.slug}>
              {edition.available ? (
                <Link href={`/weekly/${edition.slug}`}>{edition.dateRange}</Link>
              ) : (
                <span>{edition.dateRange}</span>
              )}
            </li>
          ))}
        </ul>
        <p className="text-link-row">
          <Link href="/archive">View archive</Link>
        </p>
      </section>

      <section aria-labelledby="notice-heading">
        <h2 id="notice-heading">Mock-data notice</h2>
        <p>
          All displayed paper information is fictional and for development only.
          It does not describe real publications, real results, or real source
          links.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
