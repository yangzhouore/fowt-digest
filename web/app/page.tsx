import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { currentDigest } from "../data/digest-adapter";
import { currentEngineeringBriefing } from "../data/engineering-briefing-adapter";

export const metadata: Metadata = {
  title: "Home",
  description:
    "A weekly floating offshore wind briefing and research digest built from static source-backed data.",
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
const engineeringHighlights = currentEngineeringBriefing.items.slice(0, 5);
const homepageHighlightCount = engineeringHighlights.length + previewPapers.length;

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="homepage-masthead" aria-labelledby="intro-heading">
        <p className="eyebrow">FOWT Weekly Briefing</p>
        <h1 id="intro-heading">Engineering &amp; Research Highlights</h1>
        <p className="homepage-week">Week of {currentEngineeringBriefing.dateRange}</p>
        <p>{homepageHighlightCount} curated highlights. Read in under 5 minutes.</p>
      </section>

      <section className="homepage-front" aria-label="This week's highlights">
        <section aria-labelledby="engineering-briefing-heading">
          <div className="section-heading-row">
            <h2 id="engineering-briefing-heading">Engineering Briefing</h2>
            <p>{currentEngineeringBriefing.dateRange}</p>
          </div>
          <ol className="engineering-highlight-list">
            {engineeringHighlights.map((item) => (
              <li key={item.id}>
                <article className="engineering-highlight-card">
                  <p className="paper-number">
                    {String(item.number).padStart(2, "0")}
                  </p>
                  <h3>{item.title}</h3>
                  <p className="homepage-preview">{item.oneLineSummary}</p>
                </article>
              </li>
            ))}
          </ol>
          <p className="text-link-row">
            <Link href={`/engineering/${currentEngineeringBriefing.slug}`}>
              View all -&gt;
            </Link>
          </p>
        </section>

        <section id="weekly" aria-labelledby="papers-heading">
          <div className="section-heading-row">
            <h2 id="papers-heading">Research Digest</h2>
            <p>{currentDigest.dateRange}</p>
          </div>
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
                  </article>
                </li>
              );
            })}
          </ol>
          <p className="text-link-row">
            <Link href={`/weekly/${currentDigest.slug}`}>View all -&gt;</Link>
          </p>
        </section>
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
