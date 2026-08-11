import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import { getAllEngineeringBriefings } from "../../data/engineering-briefing-adapter";

export const metadata: Metadata = {
  title: "Engineering Briefings",
  description:
    "Representative static archive of source-backed floating offshore wind engineering briefings.",
};

export default function EngineeringArchivePage() {
  const briefings = getAllEngineeringBriefings();

  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="engineering-archive-heading">
        <p className="eyebrow">Engineering archive</p>
        <h1 id="engineering-archive-heading">Representative engineering briefings.</h1>
        <p>
          Browse selected source-backed floating offshore wind engineering
          briefings. This archive is representative static coverage, not a
          complete historical record.
        </p>
      </section>

      <section aria-labelledby="engineering-archive-list-heading">
        <h2 id="engineering-archive-list-heading">Briefing editions</h2>
        <ol className="archive-list">
          {briefings.map((briefing) => (
            <li key={briefing.slug}>
              <article>
                <h3>
                  <Link href={`/engineering/${briefing.slug}`}>
                    {briefing.dateRange}
                  </Link>
                </h3>
                <dl className="archive-meta">
                  <div>
                    <dt>Highlights</dt>
                    <dd>{briefing.itemCount}</dd>
                  </div>
                  <div>
                    <dt>Source records</dt>
                    <dd>{briefing.sourceRecords.length}</dd>
                  </div>
                </dl>
                <p className="text-link-row">
                  <Link href={`/engineering/${briefing.slug}`}>
                    View engineering briefing
                  </Link>
                </p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="engineering-archive-notice-heading">
        <h2 id="engineering-archive-notice-heading">Data notice</h2>
        <p>
          Engineering briefings use independent static JSON files under
          `web/data/briefings/`. They do not use the OpenAlex Research Digest
          pipeline, scraping automation, source APIs, AI generation, a backend,
          a database, or a CMS.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
