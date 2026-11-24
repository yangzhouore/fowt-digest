import Link from "next/link";
import type { getLatestBriefingPreview } from "./briefing-weeks";
import { LocalizedCopy } from "./i18n/localized-copy";

type Preview = ReturnType<typeof getLatestBriefingPreview>;

export function HomepageWeeklyBriefing({ preview }: { preview: Preview }) {
  const engineeringCount = preview?.engineering?.items.length ?? 0;
  const researchCount = preview?.research?.papers.length ?? 0;

  return (
    <div className="briefing-reading-column">
      <section className="briefing-masthead" aria-labelledby="intro-heading">
        <h1 id="intro-heading"><LocalizedCopy en="Latest briefing" zh="最新简报" /></h1>
        {preview ? (
          <>
            <p className="briefing-date"><time dateTime={preview.slug}>{preview.dateRange}</time></p>
            <p className="briefing-meta">
              <LocalizedCopy
                en={`${engineeringCount} Engineering ${engineeringCount === 1 ? "update" : "updates"} · ${researchCount} Research ${researchCount === 1 ? "pick" : "picks"}`}
                zh={`${engineeringCount} 条工程动态 · ${researchCount} 篇精选论文`}
              />
            </p>
          </>
        ) : <p><LocalizedCopy en="No editions are available yet." zh="暂无已发布的简报。" /></p>}
      </section>

      {preview && (
        <>
          <section className="briefing-track" aria-labelledby="engineering-briefing-heading">
            <h2 id="engineering-briefing-heading"><LocalizedCopy en="Engineering" zh="工程" /></h2>
            {preview.engineering ? (
              <>
                <ol className="briefing-story-list">
                  {preview.engineering.items.map(({ href, title, summary }) => (
                    <li key={href} translate="no">
                      <h3><Link href={href}>{title}</Link></h3>
                      <p>{summary}</p>
                    </li>
                  ))}
                </ol>
                <p><Link href={preview.engineering.href}><LocalizedCopy en="Read the full Engineering briefing" zh="阅读完整工程简报" /></Link></p>
              </>
            ) : (
              <p><LocalizedCopy en="No Engineering edition was published for this date." zh="该日期暂无已发布的工程简报。" />{" "}
                <Link href="/engineering"><LocalizedCopy en="Engineering archive" zh="工程往期" /></Link>
              </p>
            )}
          </section>

          <section id="weekly" className="briefing-track" aria-labelledby="papers-heading">
            <h2 id="papers-heading"><LocalizedCopy en="Research" zh="研究" /></h2>
            {preview.research ? (
              <>
                <ol className="briefing-story-list">
                  {preview.research.papers.map(({ href, title, publicationSource }) => (
                    <li key={href} translate="no">
                      <h3><Link href={href}>{title}</Link></h3>
                      {publicationSource && <p className="briefing-meta">{publicationSource}</p>}
                    </li>
                  ))}
                </ol>
                <p><Link href={preview.research.href}><LocalizedCopy en="Read the full Research digest" zh="阅读完整研究摘要" /></Link></p>
              </>
            ) : (
              <p><LocalizedCopy en="No Research edition was published for this date." zh="该日期暂无已发布的研究摘要。" />{" "}
                <Link href="/archive"><LocalizedCopy en="Research archive" zh="研究往期" /></Link>
              </p>
            )}
          </section>
        </>
      )}

      <p className="briefing-links briefing-continuation">
        <Link href="/briefings"><LocalizedCopy en="Past briefings" zh="往期简报" /></Link>
        <Link href="/subscribe" prefetch={false}><LocalizedCopy en="Subscribe" zh="订阅" /></Link>
      </p>
    </div>
  );
}
