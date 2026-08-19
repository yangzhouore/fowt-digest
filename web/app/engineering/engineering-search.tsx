"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type EngineeringArchiveBriefing = {
  slug: string;
  dateRange: string;
  sourceCount: number;
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
  topNewsLimit: number;
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
  topNewsLimit,
}: EngineeringSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const normalisedQuery = query.trim().toLowerCase();
  const hasRegionFilter = selectedRegion !== "All";
  const hasActiveFilter = Boolean(normalisedQuery) || hasRegionFilter;

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
          !normalisedQuery || searchText(item).includes(normalisedQuery);
        const matchesRegion =
          !hasRegionFilter || item.displayRegion === selectedRegion;
        return matchesQuery && matchesRegion;
      });

      return {
        ...briefing,
        visibleItems: hasActiveFilter
          ? matchingItems
          : briefing.items.slice(0, topNewsLimit),
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
          <h2 id="engineering-search-heading">Search news</h2>
          {hasActiveFilter ? (
            <p>
              {visibleCount} {visibleCount === 1 ? "result" : "results"}
            </p>
          ) : null}
        </div>
        <label htmlFor="engineering-search-input">Search the engineering archive</label>
        <input
          id="engineering-search-input"
          name="engineering-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search project, company, region, topic, source, or year"
          autoComplete="off"
        />

        <div className="engineering-region-filter" aria-labelledby="engineering-region-heading">
          <h3 id="engineering-region-heading">Filter by region</h3>
          <div className="engineering-region-options">
            {regions.map((region) => (
              <button
                key={region}
                type="button"
                aria-pressed={selectedRegion === region}
                onClick={() => setSelectedRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="engineering-archive-list-heading">
        <div className="section-heading-row">
          <h2 id="engineering-archive-list-heading">
            {hasActiveFilter ? "Matching news by week" : "Briefing editions"}
          </h2>
          {hasActiveFilter ? (
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedRegion("All");
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>

        {filteredBriefings.length > 0 ? (
          <ol className="engineering-briefing-editions">
            {filteredBriefings.map((briefing) => (
              <li key={briefing.slug}>
                <article className="engineering-briefing-card">
                  <div className="engineering-briefing-card-meta">
                    <p>{briefing.dateRange}</p>
                    <p>Curated from {briefing.sourceCount} sources</p>
                  </div>
                  <ol className="engineering-top-news">
                    {briefing.visibleItems.map((item, index) => (
                      <li key={item.id}>
                        <span className="paper-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="engineering-news-copy">
                          <Link href={`/engineering/${briefing.slug}`}>
                            {item.oneLineSummary}
                          </Link>
                          {hasActiveFilter ? (
                            <p>{contextLine(item)}</p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="text-link-row">
                    <Link href={`/engineering/${briefing.slug}`}>
                      View more details for this week
                    </Link>
                  </p>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <p className="archive-search-empty">
            No matching news in the engineering archive.
          </p>
        )}
      </section>
    </>
  );
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
