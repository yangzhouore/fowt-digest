import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import { getAllDigests } from "../../data/digest-adapter";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Archive of available floating offshore wind research digest editions.",
};

export default function ArchivePage() {
  const digests = getAllDigests();

  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="archive-heading">
        <p className="eyebrow">Archive</p>
        <h1 id="archive-heading">Weekly editions in sequence.</h1>
        <p>
          Browse available static pipeline digest snapshots. The archive
          currently lists the single real digest copied into the website.
        </p>
      </section>

      <section aria-labelledby="archive-list-heading">
        <h2 id="archive-list-heading">Editions</h2>
        <ol className="archive-list">
          {digests.map((digest) => (
            <li key={digest.slug}>
              <article>
                <h3>
                  <Link href={`/weekly/${digest.slug}`}>
                    {digest.dateRange}
                  </Link>
                </h3>
                <dl className="archive-meta">
                  <div>
                    <dt>Selected papers</dt>
                    <dd>{digest.selectedPaperCount}</dd>
                  </div>
                  <div>
                    <dt>Generated</dt>
                    <dd>{digest.generatedAt}</dd>
                  </div>
                </dl>
                <p className="text-link-row">
                  <Link href={`/weekly/${digest.slug}`}>View weekly digest</Link>
                </p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="archive-notice-heading">
        <h2 id="archive-notice-heading">Pipeline-data notice</h2>
        <p>
          Archive entries are static local copies of deterministic pipeline
          digest outputs. The website does not run the pipeline or generate
          historical entries automatically.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
