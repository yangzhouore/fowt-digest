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
    title: "Filter",
    text: "Use title, abstract, and topic tags to label papers as Relevant, Possibly Relevant, or Not Relevant.",
  },
  {
    title: "Select",
    text: "Rank by relevance, newest date, then paper ID; select up to six Relevant or Possibly Relevant papers.",
  },
  {
    title: "Publish",
    text: "Copy selected records to static digest JSON; the website does not re-rank or rewrite them.",
  },
];

const engineeringMethod = [
  {
    title: "Source",
    text: "Use public, attributable floating wind engineering sources: authorities, standards, project releases, software notes, companies, and trade news.",
  },
  {
    title: "Filter",
    text: "Keep only concrete project, policy, technology, supply-chain, grid, vessel, cable, mooring, foundation, O&M, or software updates.",
  },
  {
    title: "Exclude",
    text: "Drop inaccessible, unattributed, duplicate, social-only, pure marketing, unverifiable opinion, and research-paper items.",
  },
  {
    title: "Trace",
    text: "Store URL, publisher, title, date, retrieval time, source type, excerpt, and collection method.",
  },
  {
    title: "Publish",
    text: "Write source-backed briefing items to static JSON; the website does not scrape, score, or automate news extraction.",
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
            A deterministic OpenAlex pipeline filters floating wind research and
            selects up to six papers per week.
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
            A separate source policy filters practical floating wind engineering
            updates into weekly briefing items.
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
