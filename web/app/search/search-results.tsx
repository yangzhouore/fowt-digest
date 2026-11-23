"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { diversifySearchResults, normalizeSearchText, searchDocuments, searchResultLimit, searchTypes, type SearchDocument, type SearchType } from "../../data/global-search";
import { useLanguage } from "../i18n/language-context";
import styles from "./search.module.css";

const resultTypes = {
  all: { en: "All", zh: "全部" },
  company: { en: "Companies", zh: "企业" },
  project: { en: "Projects", zh: "项目" },
  event: { en: "Company Intelligence", zh: "企业情报" },
  engineering: { en: "Engineering", zh: "工程" },
  research: { en: "Research", zh: "研究" },
  digitalAi: { en: "Digital & AI", zh: "数字化与 AI" },
};

export function GlobalSearch({ documents }: { documents: SearchDocument[] }) {
  const query = useSearchParams().get("q") ?? "";
  return <SearchResults key={query} query={query} documents={documents} />;
}

function SearchResults({ query, documents }: { query: string; documents: SearchDocument[] }) {
  const { language, t } = useLanguage();
  const zh = language === "zh";
  const [type, setType] = useState<SearchType | "all">("all");
  const active = Boolean(normalizeSearchText(query));
  const results = useMemo(() => searchDocuments(documents, query), [documents, query]);
  const counts = new Map<SearchType, number>();
  for (const result of results) counts.set(result.type, (counts.get(result.type) ?? 0) + 1);
  const matching = type === "all" ? results : results.filter((result) => result.type === type);
  const visible = type === "all" ? diversifySearchResults(matching) : matching.slice(0, searchResultLimit);

  return (
    <>
      <form
        method="get"
        action="/search"
        role="search"
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          const next = String(new FormData(event.currentTarget).get("q") ?? "").trim().replace(/\s+/g, " ");
          const href = next ? `/search?${new URLSearchParams({ q: next })}` : "/search";
          if (href !== window.location.pathname + window.location.search) window.history.pushState(null, "", href);
        }}
      >
        <label htmlFor="global-search-input">{zh ? "搜索全站" : "Search the site"}</label>
        <div className={styles.inputRow}>
          <input type="search" name="q" id="global-search-input" defaultValue={query} autoComplete="off" />
          <button type="submit">{t("search")}</button>
        </div>
      </form>

      {!active ? (
        <p className={styles.status}>{zh ? "输入企业、项目、主题或关键词。" : "Enter a company, project, topic, or keyword."}</p>
      ) : (
        <section aria-label={zh ? "搜索结果" : "Search results"}>
          <div className={styles.filters} role="group" aria-label={zh ? "按结果类型筛选" : "Filter by result type"}>
            {(["all", ...searchTypes] as const).map((key) => (
              <button key={key} type="button" aria-pressed={key === type} onClick={() => setType(key)}>
                {resultTypes[key][language]} ({key === "all" ? results.length : counts.get(key) ?? 0})
              </button>
            ))}
          </div>
          <p className={styles.status} role="status">
            {matching.length === 0
              ? zh ? "没有匹配的结果。" : "No matching results."
              : resultCount(matching.length, zh)}
          </p>
          <ol className={styles.results}>
            {visible.map((result) => (
              <li key={`${result.type}:${result.id}`}>
                <p className={styles.meta}>
                  {resultTypes[result.type][language]}
                  {result.dateLabel ? <> · {result.dateLabel}</> : result.date && <> · <time dateTime={result.date}>{result.date}</time></>}
                </p>
                <h2><Link href={result.href} prefetch={false} translate="no">{result.title}</Link></h2>
                {result.summary && <p translate="no">{result.summary}</p>}
                {(result.context || result.updateCount !== undefined) && (
                  <p className={styles.meta}>
                    {result.context && <span translate="no">{result.context}</span>}
                    {result.updateCount !== undefined && <>
                      {result.context && " · "}
                      {zh ? `${result.updateCount} 条收录动态` : `${result.updateCount} retained ${result.updateCount === 1 ? "update" : "updates"}`}
                    </>}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}

function resultCount(count: number, zh: boolean) {
  if (count > searchResultLimit) {
    return zh ? `共 ${count} 条结果，显示 ${searchResultLimit} 条。` : `Showing ${searchResultLimit} of ${count} results.`;
  }
  return zh ? `${count} 条结果` : `${count} ${count === 1 ? "result" : "results"}`;
}
