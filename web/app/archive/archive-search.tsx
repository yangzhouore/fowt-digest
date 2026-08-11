"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
        <h2 id="archive-search-heading">Search papers</h2>
        {normalisedQuery ? (
          <p>
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
        ) : null}
      </div>
      <label htmlFor="archive-search-input">Search the static archive</label>
      <input
        id="archive-search-input"
        name="archive-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search title, author, source, topic, or year"
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
                      View weekly digest
                    </Link>
                  </p>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <p className="archive-search-empty">
            No matching papers in the static archive.
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
