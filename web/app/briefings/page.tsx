import type { Metadata } from "next";
import Link from "next/link";
import { getAllDigests } from "../../data/digest-adapter";
import { getAllEngineeringBriefings } from "../../data/engineering-briefing-adapter";
import { getBriefingWeeks } from "../briefing-weeks";
import { LocalizedCopy } from "../i18n/localized-copy";

export const metadata: Metadata = {
  title: "Past briefings",
  description: "Browse published Engineering and Research editions by week.",
};

export default function BriefingsPage() {
  const weeks = getBriefingWeeks(getAllEngineeringBriefings(), getAllDigests());
  const years = Map.groupBy(weeks, (week) => week.slug.slice(0, 4));

  return (
    <main>
      <div className="briefing-reading-column">
        <section className="intro" aria-labelledby="briefings-heading">
          <h1 id="briefings-heading"><LocalizedCopy en="Past briefings" zh="往期简报" /></h1>
          <p><LocalizedCopy en="Browse the Engineering and Research editions published each week." zh="按周浏览已发布的工程简报和研究摘要。" /></p>
          {weeks.length === 0 && <p><LocalizedCopy en="No editions are available yet." zh="暂无已发布的简报。" /></p>}
        </section>
        {[...years].map(([year, editions]) => (
          <section key={year} aria-labelledby={`briefings-${year}`} className="briefings-year">
            <h2 id={`briefings-${year}`}>{year}</h2>
            <ol className="briefings-list">
              {editions.map(({ slug, dateRange, engineering, research }) => (
                <li key={slug}>
                  <h3><time dateTime={slug}>{dateRange}</time></h3>
                  <p className="briefing-links">
                    {engineering && <Link href={`/engineering/${slug}`}><LocalizedCopy en="Engineering" zh="工程" /></Link>}
                    {research && <Link href={`/weekly/${slug}`}><LocalizedCopy en="Research" zh="研究" /></Link>}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
