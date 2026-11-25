"use client";

import { categories } from "../engineering-categories";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/language-context";

export type EngineeringArchiveBriefing = {
  slug: string;
  dateRange: string;
  sourceCount: number;
  candidateCount: number;
  candidateSourceCount: number;
  checkedResultCount: number;
  items: EngineeringArchiveNews[];
};

export type EngineeringArchiveNews = {
  id: string;
  title: string;
  oneLineSummary: string;
  category: string;
  region: string | null;
  engineeringTopics: string[];
  sourcePublishers: string[];
  sourceTitles: string[];
  sourceText: string[];
};

type EngineeringSearchProps = {
  briefings: EngineeringArchiveBriefing[];
};

const REGION_RULES = [
  {
    region: "Asia-Pacific",
    terms: ["asia-pacific", "japan", "japanese", "china", "korea", "taiwan", "australia", "nagasaki"],
  },
  {
    region: "North America",
    terms: ["north america", "united states", " u.s.", " us ", "california", "louisiana", "new york"],
  },
  {
    region: "Europe",
    terms: [
      "europe",
      "scotland",
      "scottish",
      "wales",
      "welsh",
      "france",
      "french",
      "spain",
      "norway",
      "denmark",
      "united kingdom",
      "north sea",
      "celtic sea",
      "moray firth",
      "marseille",
      "fos-sur-mer",
    ],
  },
];

export function EngineeringSearch({
  briefings,
}: EngineeringSearchProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const normalisedQuery = query.trim().toLowerCase();
  const hasRegionFilter = selectedRegion !== "All";
  const hasActiveFilter = Boolean(normalisedQuery) || hasRegionFilter || selectedCategory !== null;

  const enrichedBriefings = useMemo(
    () =>
      briefings.map((briefing) => ({
        ...briefing,
        items: briefing.items.map((item) => ({
          ...item,
          displayRegion: item.region ?? inferRegion(item) ?? "Unspecified",
        })),
      })),
    [briefings],
  );

  const allNews = enrichedBriefings.flatMap((briefing) => briefing.items);
  const regions = useMemo(
    () =>
      [
        "All",
        ...Array.from(new Set(allNews.map((item) => item.displayRegion))).sort(),
      ] as string[],
    [allNews],
  );

  const filteredBriefings = enrichedBriefings
    .map((briefing) => {
      const matchingItems = briefing.items.filter((item) => {
        const matchesQuery =
          !normalisedQuery ||
          `${searchText(item)} ${briefing.dateRange} ${briefing.slug}`
            .toLowerCase().includes(normalisedQuery);
        const matchesRegion =
          !hasRegionFilter || item.displayRegion === selectedRegion;
        return matchesQuery && matchesRegion && (selectedCategory === null || item.category === selectedCategory);
      });

      return {
        ...briefing,
        visibleItems: hasActiveFilter ? matchingItems : briefing.items,
      };
    })
    .filter((briefing) => briefing.visibleItems.length > 0);

  const visibleCount = filteredBriefings.reduce(
    (total, briefing) => total + briefing.visibleItems.length,
    0,
  );

  return (
    <>
      <section className="archive-search" aria-labelledby="engineering-search-heading">
        <div className="archive-search-heading">
          <h2 id="engineering-search-heading">{language === "zh" ? "搜索动态" : "Search news"}</h2>
          {hasActiveFilter ? (
            <p>
              {language === "zh" ? `${visibleCount} 条结果` : `${visibleCount} ${visibleCount === 1 ? "result" : "results"}`}
            </p>
          ) : null}
        </div>
        <label htmlFor="engineering-search-input">{language === "zh" ? "搜索工程简报往期" : "Search the engineering archive"}</label>
        <input
          id="engineering-search-input"
          name="engineering-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={language === "zh" ? "搜索项目、企业、地区、主题、来源或年份" : "Search project, company, region, topic, source, or year"}
          autoComplete="off"
        />

        <div className="engineering-region-filter" aria-labelledby="engineering-region-heading">
          <h3 id="engineering-region-heading">{language === "zh" ? "按地区筛选" : "Filter by region"}</h3>
          <div className="engineering-region-options">
            {regions.map((region) => (
              <button
                key={region}
                type="button"
                aria-pressed={selectedRegion === region}
                onClick={() => setSelectedRegion(region)}
              >
                {translateRegion(region, language)}
              </button>
            ))}
          </div>
        </div>
        <div className="engineering-region-filter" role="group" aria-labelledby="engineering-category-heading">
          <h3 id="engineering-category-heading">{language === "zh" ? "按类别筛选" : "Filter by category"}</h3>
          <div className="engineering-category-options">
            <button type="button" aria-pressed={selectedCategory === null} onClick={() => setSelectedCategory(null)}>
              {language === "zh" ? "全部类别" : "All categories"}
            </button>
            {Object.entries(categories).map(([category, label]) => (
              <button key={category} type="button" className="briefing-category" data-category={category}
                aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}>
                {label[language]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="engineering-archive-list-heading">
        <div className="section-heading-row">
          <h2 id="engineering-archive-list-heading">
            {language === "zh" ? (hasActiveFilter ? "按周显示匹配动态" : "简报期次") : (hasActiveFilter ? "Matching news by week" : "Briefing editions")}
          </h2>
        </div>

        {filteredBriefings.length > 0 ? (
          <ol className="engineering-briefing-editions">
            {filteredBriefings.map((briefing) => (
              <li key={briefing.slug}>
                <article className="engineering-briefing-card">
                  <div className="engineering-briefing-card-meta">
                    <p><Link className="archive-week-link" href={`/engineering/${briefing.slug}`}>{briefing.dateRange}</Link></p>
                  </div>
                  <ol className="engineering-top-news">
                    {briefing.visibleItems.map((item, index) => (
                      <li key={item.id}>
                        <span className="paper-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="engineering-news-copy">
                          <span>{item.oneLineSummary}</span>
                          {hasActiveFilter ? (
                            <p>{contextLine(item)}</p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <p className="archive-search-empty">
            {language === "zh" ? "工程简报往期中没有匹配动态。" : "No matching news in the engineering archive."}
          </p>
        )}
      </section>
    </>
  );
}

function translateRegion(region: string, language: "en" | "zh"): string {
  if (language === "en") return region;
  return ({ All: "全部", Europe: "欧洲", "Asia-Pacific": "亚太", "North America": "北美", Unspecified: "未指定" } as Record<string, string>)[region] ?? region;
}

function searchText(item: EngineeringArchiveNews & { displayRegion?: string | null }): string {
  return [
    item.title,
    item.oneLineSummary,
    item.category,
    item.displayRegion,
    item.engineeringTopics.join(" "),
    item.sourcePublishers.join(" "),
    item.sourceTitles.join(" "),
    item.sourceText.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function contextLine(item: EngineeringArchiveNews & { displayRegion?: string | null }): string {
  const parts = [
    formatCategory(item.category),
    item.displayRegion,
    item.engineeringTopics.slice(0, 3).join(" / "),
    item.sourcePublishers.slice(0, 2).join(" / "),
  ].filter(Boolean);

  return parts.join(" / ");
}

function inferRegion(item: EngineeringArchiveNews): string | null {
  const haystack = searchText(item);
  const match = REGION_RULES.find((rule) =>
    rule.terms.some((term) => haystack.includes(term)),
  );

  return match?.region ?? null;
}

function formatCategory(value: string): string {
  return value.replace(/_/g, " ");
}
