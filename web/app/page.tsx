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
const TITLE_CHARACTER_LIMIT = 100;
const PREVIEW_CHARACTER_LIMIT = 90;
const BROAD_TOPIC_TAGS = new Set([
  "computer science",
  "engineering",
  "environmental science",
  "geology",
  "mathematics",
  "mechanics",
  "physics",
]);
const PREFERRED_TOPIC_TERMS = [
  "aerodynamic",
  "cable",
  "cfd",
  "computational fluid dynamics",
  "control",
  "dynamic",
  "floating",
  "fluid dynamics",
  "hydrodynamic",
  "moor",
  "offshore wind",
  "openfast",
  "platform",
  "simulation",
  "structural",
  "turbine",
  "wake",
  "wave",
  "wind power",
  "wind speed",
];

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
            const preview = homepagePreview(paper.abstract);

            return (
              <li key={paper.id}>
                <article className="homepage-paper-card">
                  <p className="paper-number">
                    {String(paper.number).padStart(2, "0")}
                  </p>
                  <h3>
                    <Link href={`/papers/${paper.slug}`} title={paper.title}>
                      {homepageTitle(paper.title)}
                    </Link>
                  </h3>
                  {keywords.length > 0 ? (
                    <p className="homepage-keywords">{keywords.join(" / ")}</p>
                  ) : null}
                  {preview ? <p className="homepage-preview">{preview}</p> : null}
                  <p className="homepage-paper-action">
                    <Link href={`/papers/${paper.slug}`}>Read paper -&gt;</Link>
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

function homepageTitle(title: string): string {
  return truncateText(title.replace(/\s+/g, " ").trim(), TITLE_CHARACTER_LIMIT);
}

// Keep source topic tags in pipeline order; prefer concise FOWT-relevant source tags for Homepage scanning only.
function homepageKeywords(topicTags: string[]): string[] {
  const candidates = topicTags.map(normaliseTopicTag).filter(isDisplayTopicTag);
  const preferred = candidates.filter(isPreferredTopicTag);
  return uniqueFirst(preferred.length > 0 ? preferred : candidates, 3);
}

function normaliseTopicTag(tag: string): string {
  return tag.trim();
}

function isDisplayTopicTag(tag: string): boolean {
  const key = tag.toLowerCase();
  return Boolean(tag) && !BROAD_TOPIC_TAGS.has(key) && tag.length <= 34;
}

function isPreferredTopicTag(tag: string): boolean {
  const key = tag.toLowerCase();
  return PREFERRED_TOPIC_TERMS.some((term) => key.includes(term));
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

function homepagePreview(abstract: string | null): string | null {
  if (!abstract) {
    return null;
  }

  const normalised = abstract.replace(/\s+/g, " ").trim();
  return truncateText(normalised, PREVIEW_CHARACTER_LIMIT);
}

function truncateText(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }

  const shortened = value.slice(0, limit + 1);
  const lastSpace = shortened.lastIndexOf(" ");
  const cutAt = lastSpace > Math.floor(limit * 0.7) ? lastSpace : limit;

  return `${value.slice(0, cutAt).trim()}...`;
}
