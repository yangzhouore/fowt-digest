import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import { getAllEngineeringBriefings } from "../../data/engineering-briefing-adapter";
import { EngineeringSearch } from "./engineering-search";

const ENGINEERING_ARCHIVE_TOP_NEWS_LIMIT = 3;

export const metadata: Metadata = {
  title: "Engineering Briefings",
  description:
    "Representative static archive of source-backed floating offshore wind engineering briefings.",
};

export default function EngineeringArchivePage() {
  const briefings = getAllEngineeringBriefings();
  const archiveBriefings = briefings.map((briefing) => ({
    slug: briefing.slug,
    dateRange: briefing.dateRange,
    sourceCount: briefing.sourceRecords.length,
    items: briefing.items.map((item) => ({
      id: item.id,
      title: item.title,
      oneLineSummary: item.oneLineSummary,
      category: item.category,
      region: item.region,
      engineeringTopics: item.engineeringTopics,
      sourcePublishers: item.sourceRecords.map((source) => source.publisher),
      sourceTitles: item.sourceRecords.map((source) => source.title),
      sourceText: item.sourceRecords.map((source) => source.sourceText),
    })),
  }));

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

      <EngineeringSearch
        briefings={archiveBriefings}
        topNewsLimit={ENGINEERING_ARCHIVE_TOP_NEWS_LIMIT}
      />

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
