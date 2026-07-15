import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import { archiveEditions } from "../../data/mock-papers";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Prototype archive of weekly floating offshore wind research digest editions.",
};

export default function ArchivePage() {
  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="archive-heading">
        <p className="eyebrow">Archive</p>
        <h1 id="archive-heading">Weekly editions in sequence.</h1>
        <p>
          A fictional chronological record for testing how FOWT digest editions
          will be browsed as the publication grows.
        </p>
      </section>

      <section aria-labelledby="archive-list-heading">
        <h2 id="archive-list-heading">Editions</h2>
        <ol className="archive-list">
          {archiveEditions.map((edition) => (
            <li key={edition.slug}>
              <article>
                <h3>
                  {edition.available ? (
                    <Link href={`/weekly/${edition.slug}`}>
                      {edition.dateRange}
                    </Link>
                  ) : (
                    edition.dateRange
                  )}
                </h3>
                <dl className="archive-meta">
                  <div>
                    <dt>Papers reviewed</dt>
                    <dd>{edition.papersReviewed}</dd>
                  </div>
                  <div>
                    <dt>Selected</dt>
                    <dd>{edition.papersSelected}</dd>
                  </div>
                  <div>
                    <dt>Reading time</dt>
                    <dd>{edition.readingTime}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{edition.available ? "Available" : "Prototype only"}</dd>
                  </div>
                </dl>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="archive-notice-heading">
        <h2 id="archive-notice-heading">Mock-data notice</h2>
        <p>
          Archive entries are fictional mock data for development only.
          Historical prototype editions are intentionally not linked.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
