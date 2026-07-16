import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";

const readers = [
  "researchers",
  "engineers",
  "students",
  "offshore wind professionals",
];

const topics = [
  "hydrodynamics",
  "aerodynamics and wakes",
  "mooring systems",
  "dynamic power cables",
  "control",
  "coupled simulation",
  "installation and operations",
  "reliability and fatigue",
  "floating wind farm analysis",
];

export const metadata: Metadata = {
  title: "About",
  description:
    "About the FOWT Research Digest prototype and its intended technical readers.",
};

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="about-heading">
        <p className="eyebrow">About</p>
        <h1 id="about-heading">A focused digest for floating wind research.</h1>
        <p>
          FOWT Research Digest is a static MVP for an editorial publication that
          will help technical readers scan recent floating offshore wind
          literature and identify papers worth deeper review.
        </p>
      </section>

      <section aria-labelledby="readers-heading">
        <h2 id="readers-heading">Intended readers</h2>
        <p>The digest is designed for {readers.join(", ")}.</p>
      </section>

      <section aria-labelledby="topics-heading">
        <h2 id="topics-heading">Covered topics</h2>
        <ul className="text-list">
          {topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-prototype-heading">
        <h2 id="about-prototype-heading">Prototype status</h2>
        <p>
          This project is an early prototype. The current website contains one
          fictional weekly edition and fictional paper analysis. It does not yet
          publish real research, connect to the Python pipeline, or run AI
          review.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
