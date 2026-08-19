"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DigestEdition } from "../data/digest-adapter";
import type { EngineeringBriefing } from "../data/engineering-briefing-adapter";

const HOMEPAGE_PAPER_LIMIT = 5;
const BROAD_TOPIC_TAGS = new Set([
  "computer science",
  "engineering",
  "environmental science",
  "geology",
  "mathematics",
  "mechanics",
  "physics",
]);
const RESEARCH_CONCEPTS = [
  { label: "OpenFAST", terms: ["openfast"] },
  { label: "Mooring", terms: ["mooring", "moorings", "moored"] },
  { label: "Control", terms: ["control", "controller"] },
  {
    label: "Hydrodynamics",
    terms: ["hydrodynamic", "hydroelastic", "wave", "waves"],
  },
  { label: "CFD", terms: ["cfd", "computational fluid dynamics"] },
  {
    label: "Floating platform",
    terms: [
      "floating platform",
      "floating wind turbine",
      "semisubmersible",
      "semi-submersible",
      "tension-leg",
    ],
  },
  { label: "Dynamic cable", terms: ["dynamic cable", "cable"] },
  {
    label: "Structural dynamics",
    terms: [
      "structural dynamics",
      "dynamic response",
      "vibration",
      "structural engineering",
    ],
  },
  { label: "Wake", terms: ["wake", "wake loss"] },
  { label: "Wind farm layout", terms: ["wind farm layout", "array layout", "layout"] },
  { label: "Simulation", terms: ["simulation", "benchmark", "dataset"] },
];

type HomepageEdition = {
  digest: DigestEdition;
  engineeringBriefing: EngineeringBriefing;
};

type HomepageWeeklyBriefingProps = {
  editions: HomepageEdition[];
  industryCompanyCount: number;
  industryStageCount: number;
};

export function HomepageWeeklyBriefing({
  editions,
  industryCompanyCount,
  industryStageCount,
}: HomepageWeeklyBriefingProps) {
  const [selectedSlug, setSelectedSlug] = useState(editions[0]?.digest.slug ?? "");
  const selectedEdition = useMemo(
    () => editions.find((edition) => edition.digest.slug === selectedSlug) ?? editions[0],
    [editions, selectedSlug],
  );

  if (!selectedEdition) {
    return null;
  }

  const previewPapers = selectedEdition.digest.papers.slice(0, HOMEPAGE_PAPER_LIMIT);
  const engineeringHighlights = selectedEdition.engineeringBriefing.items.slice(0, 5);
  const homepageMetrics = `${engineeringHighlights.length} news and ${previewPapers.length} papers per week in 5 minutes`;

  return (
    <>
      <section className="homepage-masthead" aria-labelledby="intro-heading">
        <h1 id="intro-heading">Floating Wind, Curated.</h1>
        <p className="homepage-metrics">{homepageMetrics}</p>
        <label className="homepage-week-picker">
          <span>Week</span>
          <select
            value={selectedEdition.digest.slug}
            onChange={(event) => setSelectedSlug(event.target.value)}
          >
            {editions.map((edition) => (
              <option key={edition.digest.slug} value={edition.digest.slug}>
                {compactDateRange(edition.engineeringBriefing.dateRange)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="homepage-front" aria-label="This week's briefing">
        <section aria-labelledby="engineering-briefing-heading">
          <div className="section-heading-row">
            <h2 id="engineering-briefing-heading">Engineering</h2>
          </div>
          <ol className="engineering-highlight-list">
            {engineeringHighlights.map((item) => (
              <li key={item.id}>
                <Link
                  className="homepage-card-link"
                  href={`/engineering/${selectedEdition.engineeringBriefing.slug}`}
                >
                  <article className="engineering-highlight-card">
                    <p className="paper-number">
                      {String(item.number).padStart(2, "0")}
                    </p>
                    <p className="homepage-item-kicker">
                      {item.region ? `${item.region.toUpperCase()} - ` : ""}
                      {item.category.toUpperCase()}
                    </p>
                    <h3>{item.title}</h3>
                    <p className="homepage-preview">{item.oneLineSummary}</p>
                  </article>
                </Link>
              </li>
            ))}
          </ol>
          <p className="text-link-row">
            <Link href={`/engineering/${selectedEdition.engineeringBriefing.slug}`}>
              Explore Engineering -&gt;
            </Link>
          </p>
        </section>

        <section id="weekly" aria-labelledby="papers-heading">
          <div className="section-heading-row">
            <h2 id="papers-heading">Research</h2>
          </div>
          <ol className="homepage-paper-list">
            {previewPapers.map((paper) => {
              const keywords = homepageKeywords(paper.title, paper.topicTags);

              return (
                <li key={paper.id}>
                  <Link className="homepage-card-link" href={`/papers/${paper.slug}`}>
                    <article className="homepage-paper-card">
                      <p className="paper-number">
                        {String(paper.number).padStart(2, "0")}
                      </p>
                      {keywords.length > 0 ? (
                        <p className="homepage-keywords">{keywords.join(" / ")}</p>
                      ) : null}
                      <h3>{paper.title}</h3>
                      <p className="homepage-paper-source">
                        {paper.publicationSource}
                      </p>
                    </article>
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="text-link-row">
            <Link href={`/weekly/${selectedEdition.digest.slug}`}>
              Explore Research -&gt;
            </Link>
          </p>
        </section>
      </section>

      <section className="homepage-industry" aria-labelledby="industry-heading">
        <div>
          <p className="eyebrow">Industry</p>
          <h2 id="industry-heading">Who builds floating wind?</h2>
          <p>
            {industryCompanyCount} companies - {industryStageCount} value-chain stages
          </p>
        </div>
        <Link href="/industry">Explore Industry Map -&gt;</Link>
      </section>
    </>
  );
}

// Prefer deterministic FOWT concepts for Homepage scanning; fall back to concise source topic tags.
function homepageKeywords(title: string, topicTags: string[]): string[] {
  const sourceText = `${title} ${topicTags.join(" ")}`.toLowerCase();
  const concepts = RESEARCH_CONCEPTS
    .filter((concept) => concept.terms.some((term) => sourceText.includes(term)))
    .map((concept) => concept.label);

  if (concepts.length > 0) {
    return uniqueFirst(concepts, 3);
  }

  return uniqueFirst(topicTags.map(normaliseTopicTag).filter(isDisplayTopicTag), 3);
}

function normaliseTopicTag(tag: string): string {
  return tag.trim();
}

function isDisplayTopicTag(tag: string): boolean {
  const key = tag.toLowerCase();
  return Boolean(tag) && !BROAD_TOPIC_TAGS.has(key) && tag.length <= 34;
}

function compactDateRange(dateRange: string): string {
  const [start, end] = dateRange.split(" - ");
  if (!start || !end) {
    return dateRange;
  }

  const startParts = start.split(" ");
  const endParts = end.split(" ");
  if (startParts.length === 3 && endParts.length === 3) {
    const [startDay, startMonth, startYear] = startParts;
    const [endDay, endMonth, endYear] = endParts;
    if (startMonth === endMonth && startYear === endYear) {
      return `${startDay}-${endDay} ${endMonth} ${endYear}`;
    }
  }

  return dateRange;
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
