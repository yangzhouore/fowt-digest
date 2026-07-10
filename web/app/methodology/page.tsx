import { SiteHeader } from "../site-header";

const discoverySources = [
  "OpenAlex",
  "Crossref",
  "arXiv",
  "selected conference and publication sources",
];

const scoringDimensions = [
  "FOWT relevance",
  "novelty",
  "technical rigour",
  "engineering value",
  "evidence quality",
  "information completeness",
];

export default function MethodologyPage() {
  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="methodology-heading">
        <p className="eyebrow">Methodology</p>
        <h1 id="methodology-heading">How the digest will be assembled.</h1>
        <p>
          This page describes the intended future editorial process. The website
          is currently a prototype, the displayed papers are fictional mock
          content, and the automated pipeline has not yet been implemented.
        </p>
      </section>

      <section className="process-list" aria-labelledby="process-heading">
        <h2 id="process-heading">Editorial process</h2>
        <ol>
          <li>
            <h3>Paper discovery</h3>
            <p>
              Future discovery may use {discoverySources.join(", ")} to find
              candidate papers related to floating offshore wind.
            </p>
          </li>
          <li>
            <h3>Initial filtering</h3>
            <p>
              Candidates will be filtered for direct FOWT relevance, journal,
              conference, and preprint coverage, and duplicate removal.
            </p>
          </li>
          <li>
            <h3>Scoring dimensions</h3>
            <p>{scoringDimensions.join(", ")} will guide editorial review.</p>
          </li>
          <li>
            <h3>Selection</h3>
            <p>
              Weekly selection will consider score, topic diversity, engineering
              significance, and the evidence available for review.
            </p>
          </li>
          <li>
            <h3>Editorial summary</h3>
            <p>
              Summaries will separate research problem, methodology, key
              findings, engineering relevance, and limitations.
            </p>
          </li>
          <li>
            <h3>Review and publication</h3>
            <p>
              Future publication requires factual review, unsupported-claim
              checking, and human approval before release.
            </p>
          </li>
        </ol>
      </section>

      <section aria-labelledby="methodology-limits-heading">
        <h2 id="methodology-limits-heading">Prototype limits</h2>
        <p>
          Abstract-only and full-text analysis must be clearly distinguished in
          future editions. Scores are editorial guidance, not objective measures
          of research quality. Current papers and analysis are fictional mock
          content for development only.
        </p>
      </section>
    </main>
  );
}
