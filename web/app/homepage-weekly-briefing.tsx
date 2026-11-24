import Link from "next/link";
import { BriefingVisual } from "./briefing-visual";
import type { getLatestBriefingPreview } from "./briefing-weeks";
import { EditorialImageFigure } from "./editorial-image-figure";
import { getEditorialImage, type EditorialImage } from "./editorial-images";
import { formatPublicationDate } from "./format-publication-date";
import { LocalizedCopy } from "./i18n/localized-copy";

type Preview = ReturnType<typeof getLatestBriefingPreview>;
type EngineeringPreview = NonNullable<NonNullable<Preview>["engineering"]>["previewItems"][number];

const categories: Record<EngineeringPreview["category"], { en: string; zh: string }> = {
  project: { en: "Project", zh: "项目" },
  policy: { en: "Policy", zh: "政策" },
  technology: { en: "Technology", zh: "技术" },
  software: { en: "Software", zh: "软件" },
  standards: { en: "Standards", zh: "标准" },
  supply_chain: { en: "Supply chain", zh: "供应链" },
  event: { en: "Event", zh: "活动" },
};

function EngineeringLead({ item, image }: { item: EngineeringPreview; image?: EditorialImage }) {
  return (
    <article className="briefing-lead" aria-labelledby="briefing-lead-title">
      {image && <EditorialImageFigure image={image} />}
      <div className="briefing-lead-body">
        <p className="briefing-meta briefing-lead-meta">
          <span><LocalizedCopy {...categories[item.category]} /></span>
          {item.source && (
            <time dateTime={item.source.publishedDate} translate="no">{formatPublicationDate(item.source.publishedDate)}</time>
          )}
        </p>
        <h3 id="briefing-lead-title"><Link className="briefing-headline" href={item.href} translate="no">{item.title}</Link></h3>
        <p className="briefing-lead-summary" translate="no">{item.summary}</p>
        <div className="briefing-lead-actions">
          {item.source && (
            <p className="briefing-meta">
              <LocalizedCopy en="Source" zh="来源" />{" "}
              <a href={item.source.href} translate="no">{item.source.publisher}</a>
            </p>
          )}
          <Link className="briefing-read-action" href={item.href} aria-labelledby="briefing-lead-read briefing-lead-title">
            <span id="briefing-lead-read"><LocalizedCopy en="Read briefing item" zh="阅读简报条目" /></span>
            {" "}<span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function HomepageWeeklyBriefing({ preview }: { preview: Preview }) {
  const engineeringCount = preview?.engineering?.selectedCount ?? 0;
  const researchCount = preview?.research?.selectedCount ?? 0;
  const lead = preview?.engineering?.previewItems[0];
  const leadImage = preview && lead ? getEditorialImage(preview.slug, lead.id) : undefined;

  return (
    <div className="homepage-briefing">
      <section className="briefing-masthead" aria-labelledby="intro-heading">
        <div className="briefing-masthead-copy">
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
        </div>
        {!leadImage && <BriefingVisual />}
      </section>

      {preview && (
        <>
          <section className="briefing-track" aria-labelledby="engineering-briefing-heading">
            <h2 id="engineering-briefing-heading"><LocalizedCopy en="Engineering" zh="工程" /></h2>
            {preview.engineering ? (
              <>
                <ol className="briefing-story-list briefing-engineering-list">
                  {preview.engineering.previewItems.map((item, index) => (
                    <li key={item.id}>
                      {index === 0 ? <EngineeringLead item={item} image={leadImage} /> : (
                        <article className="briefing-compact-story" aria-labelledby={`home-${item.id}`}>
                          <p className="briefing-meta briefing-story-category"><LocalizedCopy {...categories[item.category]} /></p>
                          <h3 id={`home-${item.id}`}><Link className="briefing-headline briefing-arrow-link" href={item.href} translate="no">{item.title}</Link></h3>
                          <p className="briefing-compact-summary" translate="no">{item.summary}</p>
                        </article>
                      )}
                    </li>
                  ))}
                </ol>
                <p className="briefing-track-action"><Link href={preview.engineering.href}><LocalizedCopy en="Read the full Engineering briefing" zh="阅读完整工程简报" /></Link></p>
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
                <ol className="briefing-story-list briefing-research-list" aria-labelledby="papers-heading">
                  {preview.research.previewPapers.map(({ href, title, publicationSource }) => (
                    <li key={href} translate="no">
                      <h3><Link className="briefing-headline briefing-arrow-link" href={href}>{title}</Link></h3>
                      {publicationSource && <p className="briefing-meta">{publicationSource}</p>}
                    </li>
                  ))}
                </ol>
                <p className="briefing-track-action"><Link href={preview.research.href}><LocalizedCopy en="Read the full Research digest" zh="阅读完整研究摘要" /></Link></p>
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
        <Link className="briefing-subscribe" href="/subscribe" prefetch={false}><LocalizedCopy en="Subscribe" zh="订阅" /></Link>
      </p>
    </div>
  );
}
