import type { Metadata } from "next";
import { Suspense } from "react";
import { getGlobalSearchDocuments } from "../../data/global-search-adapter";
import { LocalizedCopy } from "../i18n/localized-copy";
import { GlobalSearch } from "./search-results";
import styles from "./search.module.css";

export const metadata: Metadata = {
  title: "Search",
  description: "Search companies, projects, company intelligence, engineering, research, and Digital & AI.",
};

export default function SearchPage() {
  return (
    <main>
      <div className={styles.content}>
        <section className="intro" aria-labelledby="global-search-heading">
          <h1 id="global-search-heading"><LocalizedCopy en="Search Floating Wind Digest" zh="搜索浮式风电摘要" /></h1>
        </section>
        <Suspense fallback={<p role="status"><LocalizedCopy en="Loading search…" zh="正在加载搜索…" /></p>}>
          <GlobalSearch documents={getGlobalSearchDocuments()} />
        </Suspense>
      </div>
    </main>
  );
}
