"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/language-context";

export type ArchiveSearchPaper = {
  editionSlug: string;
  editionDateRange: string;
  paperSlug: string;
  title: string;
  authors: string[];
  publicationSource: string;
  topicTags: string[];
};

type ArchiveSearchProps = {
  papers: ArchiveSearchPaper[];
};

export function ArchiveSearch({ papers }: ArchiveSearchProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const normalisedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalisedQuery) {
      return [];
    }

    return papers.filter((paper) =>
      searchText(paper).includes(normalisedQuery),
    );
  }, [normalisedQuery, papers]);

  return (
    <section className="archive-search" aria-labelledby="archive-search-heading">
      <div className="archive-search-heading">
        <h2 id="archive-search-heading">{language === "zh" ? "搜索论文" : "Search papers"}</h2>
        {normalisedQuery ? (
          <p>
            {language === "zh" ? `${results.length} 条结果` : `${results.length} ${results.length === 1 ? "result" : "results"}`}
          </p>
        ) : null}
      </div>
      <label htmlFor="archive-search-input">{language === "zh" ? "搜索静态往期" : "Search the static archive"}</label>
      <input
        id="archive-search-input"
        name="archive-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={language === "zh" ? "搜索标题、作者、来源、主题或年份" : "Search title, author, source, topic, or year"}
        autoComplete="off"
      />

      {normalisedQuery ? (
        results.length > 0 ? (
          <ol className="archive-search-results">
            {results.map((result) => (
              <li key={`${result.editionSlug}-${result.paperSlug}`}>
                <article>
                  <p className="paper-source-line">
                    {result.editionDateRange}
                  </p>
                  <h3>
                    <Link href={`/papers/${result.paperSlug}`}>
                      {result.title}
                    </Link>
                  </h3>
                  <p className="archive-search-context">
                    {contextLine(result)}
                  </p>
                  <p className="text-link-row">
                    <Link href={`/weekly/${result.editionSlug}`}>
                      {language === "zh" ? "查看本周研究摘要" : "View weekly digest"}
                    </Link>
                  </p>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <p className="archive-search-empty">
            {language === "zh" ? "静态往期中没有匹配论文。" : "No matching papers in the static archive."}
          </p>
        )
      ) : null}
    </section>
  );
}

function searchText(paper: ArchiveSearchPaper): string {
  return [
    paper.title,
    paper.authors.join(" "),
    paper.publicationSource,
    paper.topicTags.join(" "),
    paper.editionDateRange,
    paper.editionSlug.slice(0, 4),
  ]
    .join(" ")
    .toLowerCase();
}

function contextLine(paper: ArchiveSearchPaper): string {
  const authors = paper.authors.slice(0, 3).join(", ");
  const topics = paper.topicTags.slice(0, 3).join(" / ");
  const parts = [authors, paper.publicationSource, topics].filter(Boolean);
  return parts.join(" / ");
}
