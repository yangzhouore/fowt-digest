import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";

const researchMethod = [
  {
    title: "Source",
    text: "Collect OpenAlex records inside the weekly publication window.",
  },
  {
    title: "Clean",
    text: "Normalise metadata, reject malformed records, and merge exact duplicates.",
  },
  {
    title: "Classify",
    text: "Use deterministic title, abstract, and topic-tag signals to label papers as Relevant, Possibly Relevant, or Not Relevant.",
  },
  {
    title: "Score",
    text: "Compute research_selection_score_v1 before ranking. No LLM subjective scoring is used.",
  },
  {
    title: "Rank",
    text: "Order by Selection Score, then classification, publication date, and paper ID as stable tie-breakers.",
  },
  {
    title: "Publish",
    text: "Select the first five eligible papers and copy them to static digest JSON; the website does not re-rank or rewrite them.",
  },
];

const researchFlow = [
  "OpenAlex candidates",
  "normalize / deduplicate",
  "FOWT classification",
  "research_selection_score_v1",
  "deterministic ranking",
  "Top 5 Research Digest",
];

const researchScoreComponents = [
  {
    label: "FOWT relevance",
    points: 35,
    text: "Classifier outcome, explicit floating-offshore-wind phrases, combined floating and wind terms, and classifier confidence.",
  },
  {
    label: "Technical specificity",
    points: 25,
    text: "Matched technical keyword groups in title, topics, and abstract: aerodynamics, hydrodynamics, mooring, structures, controls, platforms, cables/grid, modelling, and economics.",
  },
  {
    label: "Research value",
    points: 15,
    text: "Deterministic signals for validation, datasets, modelling, optimization, design, and available abstract evidence.",
  },
  {
    label: "Venue quality",
    points: 10,
    text: "OpenAlex source metadata, publication type, technical venue terms, and repository or dataset source signals. Journal impact factor is not used.",
  },
  {
    label: "Metadata quality",
    points: 10,
    text: "DOI, source URL, authors, source title, abstract, topic tags, and full-text or abstract availability.",
  },
  {
    label: "Recency",
    points: 5,
    text: "Publication date relative to the newest candidate in the same weekly pool.",
  },
];

const engineeringMethod = [
  {
    title: "Source",
    text: "Collect public, attributable floating wind engineering candidates from approved source classes: authorities, standards, project releases, software notes, companies, and trade news.",
  },
  {
    title: "Score",
    text: "Normalize, deduplicate, filter for basic FOWT relevance, then compute engineering_selection_score_v1 from source metadata and source-backed evidence text before ranking.",
  },
  {
    title: "Rank",
    text: "Order candidates by Engineering Selection Score, with source record ID as a deterministic tie-breaker.",
  },
  {
    title: "Diversify",
    text: "Apply a small deterministic diversity layer so one project, publisher or topic does not crowd out the weekly briefing when suitable alternatives exist.",
  },
  {
    title: "Publish",
    text: "Select five source-backed highlights. The website renders committed static JSON and does not collect or score news at runtime.",
  },
];

const engineeringFlow = [
  "Approved engineering sources",
  "collect weekly items",
  "normalize / deduplicate",
  "FOWT relevance filter",
  "engineering_selection_score_v1",
  "importance ranking",
  "source/topic diversity",
  "5 Engineering highlights",
];

const engineeringScoreComponents = [
  {
    label: "Engineering relevance",
    points: 30,
    text: "Explicit floating-wind, offshore-wind and engineering terms such as ports, installation, fabrication, cables, moorings, grid, vessels and consenting.",
  },
  {
    label: "Project / company",
    points: 25,
    text: "Named project, port, government, developer or supply-chain entities plus concrete events such as tenders, selections, support, partnerships or study groups.",
  },
  {
    label: "Technology",
    points: 20,
    text: "Controlled topic groups for ports, floating platforms, cables, installation, fabrication and digital engineering signals.",
  },
  {
    label: "Policy / market",
    points: 15,
    text: "Government, procurement, state-support, consenting, regulation, supply-chain, leasing and market signals, with small source-type additions.",
  },
  {
    label: "Source quality",
    points: 10,
    text: "Source-type proxy that favors government and standards sources, then company/trade sources, with reputable industry news below primary sources.",
  },
];

const projectLinks = [
  {
    href: "https://github.com/yangzhouore/fowt-digest",
    label: "GitHub repository",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/docs/PIPELINE_ARCHITECTURE.md",
    label: "Pipeline Architecture",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/docs/PIPELINE_DATA_MODEL.md",
    label: "Pipeline Data Model",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/docs/ENGINEERING_SOURCE_POLICY.md",
    label: "Engineering Source Policy",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/docs/ENGINEERING_BRIEFING_DATA_MODEL.md",
    label: "Engineering Briefing Data Model",
  },
];

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Floating Wind Digest selects research papers and engineering news.",
};

export default function MethodologyPage() {
  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="methodology-heading">
        <p className="eyebrow">Methodology</p>
        <h1 id="methodology-heading">How we select papers and engineering news.</h1>
        <p>
          Floating Wind Digest keeps research papers and engineering news in
          separate source-backed workflows. Both publish static data, and the
          website only formats what has already been selected.
        </p>
      </section>

      <section className="methodology-sectors" aria-label="Selection methods">
        <article className="methodology-sector" aria-labelledby="research-method-heading">
          <p className="eyebrow">Research</p>
          <h2 id="research-method-heading">Paper selection</h2>
          <p>
            A deterministic OpenAlex pipeline scores each weekly candidate
            before ranking and selects the first five eligible papers per week.
          </p>
          <ol className="methodology-step-list">
            {researchMethod.map((step) => (
              <li key={step.title}>
                <span>{step.title}</span>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </article>

        <article className="methodology-sector" aria-labelledby="engineering-method-heading">
          <p className="eyebrow">Engineering</p>
          <h2 id="engineering-method-heading">News selection</h2>
          <p>
            Engineering selection now starts from an approved-source weekly
            candidate collection, scores retained candidates, then applies a
            small diversity layer so the final five remain useful as a briefing
            rather than a duplicate-heavy ranked list.
          </p>
          <ol className="methodology-step-list">
            {engineeringMethod.map((step) => (
              <li key={step.title}>
                <span>{step.title}</span>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="research-selection-visual" aria-labelledby="research-selection-heading">
        <p className="eyebrow">Research Selection Score</p>
        <h2 id="research-selection-heading">How candidates become the Top 5</h2>
        <ol className="research-flow" aria-label="Research selection flow">
          {researchFlow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <ScoreFormula components={researchScoreComponents} label="Research 100 point score formula" />
        <p>
          The score is computed before ranking. Ranking uses the score first,
          then classification, publication date, and paper ID for deterministic
          tie-breaking.
        </p>
        <p>
          Candidate-pool pages are labeled as retained when the historical run
          artifacts were already available, and reconstructed when the same
          weekly window was recollected later with the current pipeline. A
          reconstructed pool may differ from what OpenAlex would have returned
          at the original publication date because upstream metadata can change.
        </p>
      </section>

      <section className="research-selection-visual" aria-labelledby="engineering-selection-heading">
        <p className="eyebrow">Engineering Selection Score</p>
<h2 id="engineering-selection-heading">How candidates become the weekly briefing</h2>
        <ol className="research-flow" aria-label="Engineering selection flow">
          {engineeringFlow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <ScoreFormula components={engineeringScoreComponents} label="Engineering 100 point score formula" />
        <p>
          The score is computed before ranking and uses deterministic, controlled
          signal groups in candidate metadata and source-backed evidence text. No
          LLM subjective scoring is used. Diversity is separate from importance:
          it can defer a high-scoring duplicate project or topic when another
          source-backed candidate gives the weekly briefing broader coverage.
          Historical Engineering pools are labeled as retained-source
          reconstructions when no original full candidate artifact was stored.
        </p>
      </section>

      <section aria-labelledby="audit-heading">
        <h2 id="audit-heading">What the website does not do</h2>
        <p>
          The website does not run collection, summarisation, ranking,
          scraping, scheduling, or publication automation. It reads committed
          static JSON so every paper and news item can be traced back to source
          data.
        </p>
      </section>

      <section aria-labelledby="project-links-heading">
        <h2 id="project-links-heading">Project links</h2>
        <ul className="project-link-list">
          {projectLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}

function ScoreFormula({
  components,
  label,
}: {
  components: Array<{ label: string; points: number; text: string }>;
  label: string;
}) {
  return (
    <div className="score-formula" aria-label={label}>
      <dl>
        {components.map((component) => (
          <div key={component.label}>
            <dt>{component.label}</dt>
            <dd>{component.points}</dd>
          </div>
        ))}
        <div className="score-total">
          <dt>Total</dt>
          <dd>100</dd>
        </div>
      </dl>
      <div className="score-component-copy">
        {components.map((component) => (
          <p key={component.label}>
            <strong>{component.label}:</strong> {component.text}
          </p>
        ))}
      </div>
    </div>
  );
}
