import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import { getAllEngineeringBriefings } from "../../data/engineering-briefing-adapter";
import { EngineeringSearch } from "./engineering-search";
import { LocalizedCopy } from "../i18n/localized-copy";


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
    candidateCount: briefing.sourceCandidates.length,
    candidateSourceCount: briefing.candidateSourceCount,
    checkedResultCount: briefing.checkedResultCount,
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
    <main className="engineering-archive-page">
      <SiteHeader />

      <section className="intro" aria-labelledby="engineering-archive-heading">
        <p className="eyebrow"><LocalizedCopy en="Engineering archive" zh="工程简报往期" /></p>
        <h1 id="engineering-archive-heading"><LocalizedCopy en="Representative engineering briefings." zh="具有代表性的工程简报。" /></h1>
        <p>
          <LocalizedCopy en="Browse selected source-backed floating offshore wind engineering briefings. This archive is representative static coverage, not a complete historical record." zh="浏览经筛选且有来源依据的浮式海上风电工程简报。本往期内容为具有代表性的静态覆盖，并非完整历史记录。" />
        </p>
      </section>

      <EngineeringSearch briefings={archiveBriefings} />

      <section aria-labelledby="engineering-archive-notice-heading">
        <h2 id="engineering-archive-notice-heading"><LocalizedCopy en="Data notice" zh="数据说明" /></h2>
        <p>
          <LocalizedCopy en="Engineering briefings use independent static JSON files under web/data/briefings/. They do not use the OpenAlex Research Digest pipeline, scraping automation, source APIs, AI generation, a backend, a database, or a CMS." zh="工程简报使用 web/data/briefings/ 下独立的静态 JSON 文件，不使用 OpenAlex 研究摘要流水线、自动抓取、来源 API、AI 生成、后端、数据库或 CMS。" />
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
