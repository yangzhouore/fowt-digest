import type { Metadata } from "next";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import { LocalizedCopy } from "../i18n/localized-copy";

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
        <p className="eyebrow"><LocalizedCopy en="About" zh="关于" /></p>
        <h1 id="about-heading"><LocalizedCopy en="A weekly digest for floating wind decisions." zh="服务浮式风电决策的每周摘要。" /></h1>
        <p>
          <LocalizedCopy en="Floating Wind Digest helps technical readers scan floating offshore wind research, engineering news, and industry structure without reading every source from scratch." zh="Floating Wind Digest 帮助技术读者快速浏览浮式海上风电研究、工程动态和产业结构，无需从头阅读每个来源。" />
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
        <h2 id="readers-heading"><LocalizedCopy en="Who it is for" zh="面向人群" /></h2>
        <ul className="text-list">
          {readerGroups.map((reader) => (
            <li key={reader}>{reader}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-prototype-heading">
        <h2 id="about-prototype-heading"><LocalizedCopy en="Current scope" zh="当前范围" /></h2>
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
