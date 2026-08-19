import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";

const sellingPoints = [
  {
    title: "Fast weekly scan",
    text: "Five engineering updates and five research papers give readers the main floating wind signals in minutes.",
  },
  {
    title: "Research and engineering separated",
    text: "Papers, project news, policy, supply chain, software, and industry roles are kept in distinct sections.",
  },
  {
    title: "Source-backed content",
    text: "Each selected item is tied to static source records, so readers can open the original source for detail.",
  },
  {
    title: "Built for technical readers",
    text: "Coverage focuses on FOWT systems: turbine, platform, mooring, cables, grid, installation, control, and simulation.",
  },
];

const readerGroups = [
  "researchers tracking new papers",
  "engineers scanning project and technology updates",
  "students learning the FOWT system",
  "offshore wind professionals watching the supply chain",
];

const currentScope = [
  "Static website, not a live news platform.",
  "Research selection comes from deterministic local pipeline output.",
  "Engineering briefings are source-backed static records.",
  "Historical editions are representative, not complete weekly coverage.",
  "The website does not run scraping, scoring, summarisation, or publication automation.",
];

export const metadata: Metadata = {
  title: "About",
  description:
    "About Floating Wind Digest and its source-backed research, engineering, and industry coverage.",
};

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="about-heading">
        <p className="eyebrow">About</p>
        <h1 id="about-heading">A weekly digest for floating wind decisions.</h1>
        <p>
          Floating Wind Digest helps technical readers scan floating offshore
          wind research, engineering news, and industry structure without
          reading every source from scratch.
        </p>
      </section>

      <section className="methodology-sectors" aria-label="Website selling points">
        {sellingPoints.map((point) => (
          <article className="methodology-sector" key={point.title}>
            <h2>{point.title}</h2>
            <p>{point.text}</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="readers-heading">
        <h2 id="readers-heading">Who it is for</h2>
        <ul className="text-list">
          {readerGroups.map((reader) => (
            <li key={reader}>{reader}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-prototype-heading">
        <h2 id="about-prototype-heading">Current scope</h2>
        <ul className="text-list">
          {currentScope.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}
