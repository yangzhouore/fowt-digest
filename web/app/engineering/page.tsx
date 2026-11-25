import type { Metadata } from "next";
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

      <section className="intro" aria-labelledby="engineering-archive-heading">
        <h1 id="engineering-archive-heading"><LocalizedCopy en="All Engineering Briefings" zh="全部工程简报" /></h1>
        <p>
          <LocalizedCopy en="Explore selected floating offshore wind engineering news, with links to the original sources." zh="浏览精选浮式海上风电工程新闻，查看原始来源。" />
        </p>
      </section>

      <EngineeringSearch briefings={archiveBriefings} />

      <section aria-labelledby="engineering-archive-notice-heading">
        <h2 id="engineering-archive-notice-heading"><LocalizedCopy en="Data notice" zh="数据说明" /></h2>
        <p>
          <LocalizedCopy en="Engineering briefings use independent static JSON files under web/data/briefings/. They do not use the OpenAlex Research Digest pipeline, scraping automation, source APIs, AI generation, a backend, a database, or a CMS." zh="工程简报使用 web/data/briefings/ 下独立的静态 JSON 文件，不使用 OpenAlex 研究摘要流水线、自动抓取、来源 API、AI 生成、后端、数据库或 CMS。" />
        </p>
      </section>

    </main>
  );
}
