import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { currentDigest } from "../data/digest-adapter";

export const metadata: Metadata = {
  title: "Home",
  description:
    "A weekly floating offshore wind turbine research digest generated from deterministic pipeline output.",
};

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="intro-heading">
        <p className="eyebrow">Field notes for floating wind</p>
        <h1 id="intro-heading">Fresh FOWT literature, distilled.</h1>
        <p>
          A prototype editorial website for scanning floating offshore wind
          turbine research. This edition displays one static output from the
          deterministic pipeline.
        </p>
      </section>

      <section className="edition-meta" aria-labelledby="edition-heading">
        <h2 id="edition-heading">Current pipeline edition</h2>
        <dl>
          <div>
            <dt>Date range</dt>
            <dd>
              <Link href={`/weekly/${currentDigest.slug}`}>
                {currentDigest.dateRange}
              </Link>
            </dd>
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

      <section id="weekly" aria-labelledby="papers-heading">
        <h2 id="papers-heading">Selected papers</h2>
        <ol className="paper-list">
          {currentDigest.papers.map((paper) => (
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
                    <dt>Classification</dt>
                    <dd>{paper.classification ?? "Not classified"}</dd>
                  </div>
                </dl>
                <p>{paper.summary}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section id="archive" aria-labelledby="recent-editions-heading">
        <h2 id="recent-editions-heading">Weekly digest</h2>
        <p>
          View the selected papers from the current deterministic pipeline
          output.
        </p>
        <p className="text-link-row">
          <Link href={`/weekly/${currentDigest.slug}`}>Read weekly digest</Link>
        </p>
      </section>

      <section aria-labelledby="notice-heading">
        <h2 id="notice-heading">Pipeline-data notice</h2>
        <p>
          This page displays a static local copy of one pipeline output file.
          The website does not run the pipeline, use AI writing, or publish
          automatically.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
