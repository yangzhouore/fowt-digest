import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";

const pipelineStages = [
  "OpenAlex",
  "Collection",
  "Normalisation",
  "Deduplication",
  "Classification",
  "Ranking",
  "Weekly Digest",
  "Website",
];

const stageNotes = [
  {
    title: "Collection",
    text: "OpenAlex work records are collected for a weekly publication-date window.",
  },
  {
    title: "Normalisation",
    text: "Source metadata is converted into the repository's internal paper fields.",
  },
  {
    title: "Deduplication",
    text: "Deterministic identifier and title rules merge repeated records conservatively.",
  },
  {
    title: "Classification",
    text: "Rule-based checks label papers by floating offshore wind relevance.",
  },
  {
    title: "Ranking",
    text: "Relevant papers are ordered deterministically and up to six are selected.",
  },
  {
    title: "Weekly Digest",
    text: "Selected records are assembled into static digest JSON for the website.",
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
];

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How the deterministic FOWT Research Digest pipeline moves papers from OpenAlex to the website.",
};

export default function MethodologyPage() {
  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="methodology-heading">
        <p className="eyebrow">Methodology</p>
        <h1 id="methodology-heading">How papers move from OpenAlex to the website.</h1>
        <p>
          FOWT Research Digest presents selected weekly research outputs for
          Floating Offshore Wind Turbines. The website reads static digest data
          produced by a deterministic local pipeline.
        </p>
      </section>

      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading">Overview</h2>
        <p>
          The pipeline collects source metadata, validates each stage, removes
          duplicates, classifies relevance with deterministic rules, ranks the
          candidates, and publishes selected records as weekly digest JSON. The
          website formats that output without rewriting paper content.
        </p>
      </section>

      <section aria-labelledby="pipeline-diagram-heading">
        <h2 id="pipeline-diagram-heading">Pipeline diagram</h2>
        <ol className="pipeline-diagram" aria-label="Pipeline stages">
          {pipelineStages.map((stage) => (
            <li key={stage}>{stage}</li>
          ))}
        </ol>
      </section>

      <section className="process-list" aria-labelledby="stage-heading">
        <h2 id="stage-heading">Stage notes</h2>
        <ol>
          {stageNotes.map((stage) => (
            <li key={stage.title}>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="selection-heading">
        <h2 id="selection-heading">Why deterministic selection</h2>
        <p>
          Deterministic selection keeps each weekly edition auditable. A reader
          can trace selected papers back to source metadata and understand that
          the website has not generated summaries, rankings, or claims beyond
          the pipeline output.
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
