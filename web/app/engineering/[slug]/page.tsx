import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../site-header";
import { SiteFooter } from "../../site-footer";
import {
  getAllEngineeringBriefings,
  getEngineeringBriefingBySlug,
} from "../../../data/engineering-briefing-adapter";

type EngineeringPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllEngineeringBriefings().map((briefing) => ({ slug: briefing.slug }));
}

export async function generateMetadata({
  params,
}: EngineeringPageProps): Promise<Metadata> {
  const { slug } = await params;
  const briefing = getEngineeringBriefingBySlug(slug);

  if (!briefing) {
    return {
      title: "Engineering briefing not found",
    };
  }

  return {
    title: `Engineering briefing: ${briefing.dateRange}`,
    description: "Source-backed floating offshore wind engineering highlights.",
  };
}

export default async function EngineeringBriefingPage({
  params,
}: EngineeringPageProps) {
  const { slug } = await params;
  const briefing = getEngineeringBriefingBySlug(slug);

  if (!briefing) {
    notFound();
  }

  return (
    <main>
      <SiteHeader />

      <section className="intro" aria-labelledby="engineering-heading">
        <p className="eyebrow">Engineering briefing</p>
        <h1 id="engineering-heading">{briefing.dateRange}</h1>
        <p>
          Manual source-backed engineering highlights for floating offshore wind.
          This prototype is independent from the deterministic Research Digest.
        </p>
      </section>

      <section className="edition-meta" aria-labelledby="engineering-meta-heading">
        <h2 id="engineering-meta-heading">Briefing metadata</h2>
        <dl>
          <div>
            <dt>Date range</dt>
            <dd>{briefing.dateRange}</dd>
          </div>
          <div>
            <dt>Highlights</dt>
            <dd>{briefing.itemCount}</dd>
          </div>
          <div>
            <dt>Source records</dt>
            <dd>{briefing.sourceRecords.length}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="engineering-items-heading">
        <h2 id="engineering-items-heading">Engineering highlights</h2>
        <ol className="engineering-list">
          {briefing.items.map((item) => (
            <li key={item.id}>
              <article className="engineering-item">
                <p className="paper-number">
                  {String(item.number).padStart(2, "0")}
                </p>
                <h3>{item.title}</h3>
                <p className="engineering-summary">{item.oneLineSummary}</p>
                <ul className="topic-list" aria-label="Engineering topics">
                  {item.engineeringTopics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
                <p>{item.explanation}</p>
                {item.whyItMatters ? (
                  <div className="engineering-note">
                    <h4>Why it matters</h4>
                    <p>{item.whyItMatters}</p>
                  </div>
                ) : null}
                <dl className="engineering-source-meta">
                  <div>
                    <dt>Source</dt>
                    <dd>{item.sourceRecords[0]?.publisher}</dd>
                  </div>
                  <div>
                    <dt>Source date</dt>
                    <dd>{formatPublicationDate(item.sourceRecords[0]?.publishedDate)}</dd>
                  </div>
                </dl>
                <p className="text-link-row">
                  <a href={item.sourceUrl}>Open source</a>
                </p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="engineering-boundary-heading">
        <h2 id="engineering-boundary-heading">Data boundary</h2>
        <p>
          Engineering Briefing source records and briefing copy are stored in a
          separate static data path from the OpenAlex Research Digest. No
          scraping, AI generation, backend, database, or scheduled collection is
          used in this prototype.
        </p>
        <p className="text-link-row">
          <Link href="/">Back to Homepage</Link>
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}

function formatPublicationDate(value: string | undefined): string {
  if (!value) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
