import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { currentDigest } from "../data/digest-adapter";

export const metadata: Metadata = {
  title: "Home",
  description:
    "A weekly floating offshore wind turbine research digest built from deterministic pipeline output.",
};

const previewPapers = currentDigest.papers.slice(0, 3);

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="intro-heading">
        <p className="eyebrow">FOWT research digest</p>
        <h1 id="intro-heading">A weekly reading path through floating wind research.</h1>
        <p>
          Scan selected Floating Offshore Wind Turbine papers from the current
          weekly digest, then open the full edition or a paper detail page for
          source metadata and available abstracts.
        </p>
      </section>

      <section className="edition-meta" aria-labelledby="edition-heading">
        <h2 id="edition-heading">Current weekly digest</h2>
        <dl>
          <div>
            <dt>Date range</dt>
            <dd>{currentDigest.dateRange}</dd>
          </div>
          <div>
            <dt>Selected papers</dt>
            <dd>{currentDigest.selectedPaperCount}</dd>
          </div>
          <div>
            <dt>Generated</dt>
            <dd>{currentDigest.generatedAt}</dd>
          </div>
        </dl>
        <p className="text-link-row">
          <Link href={`/weekly/${currentDigest.slug}`}>Read the weekly digest</Link>
        </p>
      </section>

      <section id="weekly" aria-labelledby="papers-heading">
        <h2 id="papers-heading">Paper preview</h2>
        <p>
          Start with three selected papers from the current edition, shown in
          pipeline rank order.
        </p>
        <ol className="paper-list">
          {previewPapers.map((paper) => (
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
                    <dd>{paper.authors.join(", ") || "No authors listed"}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>{paper.publicationSource}</dd>
                  </div>
                  <div>
                    <dt>Classification</dt>
                    <dd>{paper.classification ?? "Not classified"}</dd>
                  </div>
                </dl>
              </article>
            </li>
          ))}
        </ol>
        <p className="text-link-row">
          <Link href={`/weekly/${currentDigest.slug}`}>
            View all {currentDigest.selectedPaperCount} selected papers
          </Link>
        </p>
      </section>

      <section aria-labelledby="notice-heading">
        <h2 id="notice-heading">Data notice</h2>
        <p>
          This edition is a static website copy of deterministic pipeline
          output. The website does not run the pipeline or add AI-written
          summaries.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
