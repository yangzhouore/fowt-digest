import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import {
  getAllDigestPaperResults,
  getAllDigests,
} from "../../data/digest-adapter";
import { ArchiveSearch, type ArchiveSearchPaper } from "./archive-search";
import { hasResearchCandidatePool } from "../../data/research-candidate-adapter";
import { LocalizedCopy } from "../i18n/localized-copy";

const RESEARCH_ARCHIVE_TOP_PAPER_LIMIT = 3;
const BROAD_RESEARCH_TAGS = new Set([
  "computer science",
  "engineering",
  "environmental science",
  "geology",
  "mathematics",
  "mechanics",
  "physics",
]);
const RESEARCH_ARCHIVE_CONCEPTS = [
  { label: "OpenFAST", terms: ["openfast"] },
  { label: "Turbine aerodynamics", terms: ["aerodynamic", "aerodynamics"] },
  { label: "Control", terms: ["control", "controller", "yawed"] },
  { label: "Fatigue", terms: ["fatigue"] },
  { label: "CFD", terms: ["cfd", "computational fluid dynamics"] },
  { label: "Mooring", terms: ["mooring", "moorings", "moored"] },
  { label: "Hydrodynamics", terms: ["hydrodynamic", "hydroelastic", "wave"] },
  { label: "Structural dynamics", terms: ["dynamic response", "vibration"] },
  { label: "Floating platform", terms: ["floating platform", "semisubmersible"] },
  { label: "Dynamic cable", terms: ["dynamic cable", "cable"] },
  { label: "Power systems", terms: ["grid", "power", "electrical"] },
  { label: "Optimisation", terms: ["optimization", "optimisation", "layout"] },
  { label: "Wake", terms: ["wake", "wake loss"] },
  { label: "Simulation", terms: ["simulation", "benchmark", "dataset"] },
];

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Archive of available floating offshore wind research digest editions.",
};

export default function ArchivePage() {
  const digests = getAllDigests();
  const searchPapers: ArchiveSearchPaper[] = getAllDigestPaperResults().map(
    ({ edition, paper }) => ({
      editionSlug: edition.slug,
      editionDateRange: edition.dateRange,
      paperSlug: paper.slug,
      title: paper.title,
      authors: paper.authors,
      publicationSource: paper.publicationSource,
      topicTags: paper.topicTags,
    }),
  );

  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="archive-heading">
        <p className="eyebrow"><LocalizedCopy en="Archive" zh="研究往期" /></p>
        <h1 id="archive-heading"><LocalizedCopy en="Weekly editions in sequence." zh="按周查看研究摘要。" /></h1>
        <p>
          <LocalizedCopy en="Browse selected historical demonstration editions generated from static deterministic pipeline outputs. This archive is not complete weekly historical coverage." zh="浏览由静态确定性流水线输出生成的精选历史演示期次。本往期并非完整的逐周历史覆盖。" />
        </p>
      </section>

      <ArchiveSearch papers={searchPapers} />

      <section aria-labelledby="archive-list-heading">
        <h2 id="archive-list-heading"><LocalizedCopy en="Editions" zh="期次" /></h2>
        <ol className="engineering-briefing-editions research-edition-cards">
          {digests.map((digest) => (
            <li key={digest.slug}>
              <article className="engineering-briefing-card">
                <div className="engineering-briefing-card-meta">
                  <p>{digest.dateRange}</p>
                  <p>{hasResearchCandidatePool(digest.slug) ? (<Link href={`/weekly/${digest.slug}/candidates`}>Curated from {digest.checkedResultCount} results -&gt;</Link>) : (`Curated from ${digest.checkedResultCount} results`)}</p>
                </div>
                <ol className="engineering-top-news">
                  {digest.papers
                    .slice(0, RESEARCH_ARCHIVE_TOP_PAPER_LIMIT)
                    .map((paper, index) => (
                      <li key={paper.id}>
                        <span className="paper-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="research-archive-item-copy">
                          <Link href={`/papers/${paper.slug}`}>{paper.title}</Link>
                          <p className="research-archive-source">
                            {paper.publicationSource}
                          </p>
                          <ul
                            className="research-archive-sectors"
                            aria-label="Related sectors"
                          >
                            {researchArchiveHighlights(
                              paper.title,
                              paper.summary,
                              paper.topicTags,
                            ).map((sector) => (
                              <li key={sector}>{sector}</li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    ))}
                </ol>
                <p className="text-link-row">
                  <Link href={`/weekly/${digest.slug}`}><LocalizedCopy en="View weekly digest" zh="查看本周研究摘要" /></Link>
                </p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="archive-notice-heading">
        <h2 id="archive-notice-heading"><LocalizedCopy en="Pipeline-data notice" zh="流水线数据说明" /></h2>
        <p>
          <LocalizedCopy en="Archive entries are static local copies of selected deterministic pipeline digest outputs prepared for demonstration. The website does not run the pipeline, generate historical entries automatically, or claim complete weekly historical coverage." zh="往期条目是为演示准备的确定性流水线精选摘要输出的本地静态副本。网站不运行流水线、不自动生成历史条目，也不声称提供完整的逐周历史覆盖。" />
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}

function researchArchiveHighlights(
  title: string,
  summary: string,
  topicTags: string[],
): string[] {
  const sourceText = `${title} ${summary} ${topicTags.join(" ")}`.toLowerCase();
  const concepts = RESEARCH_ARCHIVE_CONCEPTS
    .filter((concept) => concept.terms.some((term) => sourceText.includes(term)))
    .map((concept) => concept.label);

  if (concepts.length > 0) {
    return uniqueFirst(concepts, 3);
  }

  const sourceTags = topicTags
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = tag.toLowerCase();
      return Boolean(tag) && !BROAD_RESEARCH_TAGS.has(key) && tag.length <= 34;
    });

  return uniqueFirst(sourceTags, 3);
}

function uniqueFirst(values: string[], limit: number): string[] {
  const selected: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    selected.push(value);
    seen.add(key);
    if (selected.length === limit) {
      break;
    }
  }

  return selected;
}
