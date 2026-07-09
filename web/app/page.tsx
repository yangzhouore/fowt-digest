import Link from "next/link";
import {
  currentEdition,
  mockPapers,
  recentEditions,
} from "../data/mock-papers";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link className="site-name" href="/">
          FOWT Research Digest
        </Link>
        <div className="header-actions">
          <nav aria-label="Primary navigation">
            <a href="#weekly">Weekly</a>
            <a href="#archive">Archive</a>
            <a href="#methodology">Methodology</a>
            <a href="#about">About</a>
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

      <section id="weekly" aria-labelledby="papers-heading">
        <h2 id="papers-heading">Selected papers</h2>
        <ol className="paper-list">
          {mockPapers.map((paper) => (
            <li key={paper.id}>
              <article>
                <p className="paper-number">
                  {String(paper.number).padStart(2, "0")}
                </p>
                <h3>{paper.title}</h3>
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
          {recentEditions.map((edition) => (
            <li key={edition.slug}>
              <a href={`/editions/${edition.slug}`}>{edition.dateRange}</a>
            </li>
          ))}
        </ul>
      </section>

      <section id="methodology" aria-labelledby="notice-heading">
        <h2 id="notice-heading">Mock-data notice</h2>
        <p>
          All displayed paper information is fictional and for development only.
          It does not describe real publications, real results, or real source
          links.
        </p>
      </section>

      <footer id="about">
        <p>
          FOWT Research Digest is a developing editorial reference for floating
          offshore wind turbine literature.
        </p>
        <p>Copyright 2026 FOWT Research Digest.</p>
      </footer>
    </main>
  );
}
