import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { currentDigest } from "../data/digest-adapter";

export const metadata: Metadata = {
  title: "Home",
  description:
    "A weekly floating offshore wind turbine research digest built from deterministic pipeline output.",
};

const HOMEPAGE_PAPER_LIMIT = 5;
const PREVIEW_CHARACTER_LIMIT = 170;
const BROAD_TOPIC_TAGS = new Set([
  "computer science",
  "engineering",
  "environmental science",
  "geology",
  "mathematics",
  "mechanics",
  "physics",
]);

const previewPapers = currentDigest.papers.slice(0, HOMEPAGE_PAPER_LIMIT);

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="intro-heading">
        <p className="eyebrow">FOWT research digest</p>
        <h1 id="intro-heading">A weekly reading path through floating wind research.</h1>
        <p>
          Scan selected Floating Offshore Wind Turbine papers from the current
          weekly digest, then open the full edition or a paper detail page for
          source metadata and available abstracts.
        </p>
      </section>

      <section className="edition-meta" aria-labelledby="edition-heading">
        <h2 id="edition-heading">Current weekly digest</h2>
        <dl>
          <div>
            <dt>Date range</dt>
            <dd>{currentDigest.dateRange}</dd>
          </div>
          <div>
            <dt>Selected papers</dt>
            <dd>{currentDigest.selectedPaperCount}</dd>
          </div>
        </dl>
        <p className="text-link-row">
          <Link href={`/weekly/${currentDigest.slug}`}>Read the weekly digest</Link>
        </p>
      </section>

      <section id="weekly" aria-labelledby="papers-heading">
        <h2 id="papers-heading">Editorial scan</h2>
        <p>
          Start with up to five selected papers from the current edition, shown in
          pipeline rank order with source-backed keywords and short abstract
          previews.
        </p>
        <ol className="homepage-paper-list">
          {previewPapers.map((paper) => {
            const keywords = homepageKeywords(paper.topicTags);

            return (
              <li key={paper.id}>
                <article className="homepage-paper-card">
                  <p className="paper-number">
                    {String(paper.number).padStart(2, "0")}
                  </p>
                  <h3>
                    <Link href={`/papers/${paper.slug}`}>{paper.title}</Link>
                  </h3>
                  {keywords.length > 0 ? (
                    <p className="homepage-keywords">{keywords.join(" · ")}</p>
                  ) : (
                    <p className="homepage-keywords">No concise source topic tags</p>
                  )}
                  <p className="homepage-preview">
                    {homepagePreview(paper.abstract)}
                  </p>
                  <p className="homepage-paper-action">
                    <Link href={`/papers/${paper.slug}`}>Read paper →</Link>
                  </p>
                </article>
              </li>
            );
          })}
        </ol>
        <p className="text-link-row">
          <Link href={`/weekly/${currentDigest.slug}`}>
            View all {currentDigest.selectedPaperCount} selected papers
          </Link>
        </p>
      </section>

      <section aria-labelledby="notice-heading">
        <h2 id="notice-heading">Data notice</h2>
        <p>
          This edition is a static website copy of deterministic pipeline
          output. The website does not run the pipeline or add AI-written
          summaries.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}

// Keep source topic tags in pipeline order; omit broad/noisy taxonomy labels for Homepage scanning only.
function homepageKeywords(topicTags: string[]): string[] {
  const selected: string[] = [];
  const seen = new Set<string>();

  for (const tag of topicTags) {
    const keyword = tag.trim();
    const key = keyword.toLowerCase();

    if (
      !keyword ||
      seen.has(key) ||
      BROAD_TOPIC_TAGS.has(key) ||
      keyword.includes("(") ||
      keyword.length > 34
    ) {
      continue;
    }

    selected.push(keyword);
    seen.add(key);

    if (selected.length === 3) {
      break;
    }
  }

  return selected;
}

function homepagePreview(abstract: string | null): string {
  if (!abstract) {
    return "No abstract available from the source metadata.";
  }

  const normalised = abstract.replace(/\s+/g, " ").trim();
  const firstSentence = normalised.match(/.*?[.!?](?:\s|$)/)?.[0]?.trim();
  const sourceText = firstSentence || normalised;

  if (sourceText.length <= PREVIEW_CHARACTER_LIMIT) {
    return sourceText;
  }

  const shortened = sourceText.slice(0, PREVIEW_CHARACTER_LIMIT + 1);
  const lastSpace = shortened.lastIndexOf(" ");
  const cutAt = lastSpace > 120 ? lastSpace : PREVIEW_CHARACTER_LIMIT;

  return `${sourceText.slice(0, cutAt).trim()}...`;
}
