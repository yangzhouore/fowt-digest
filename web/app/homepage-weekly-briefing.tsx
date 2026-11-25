"use client";

import { categories } from "./engineering-categories";
import Link from "next/link";
import { useState } from "react";
import type { getBriefingWeekPreviews } from "./briefing-weeks";
import { EditorialImageFigure } from "./editorial-image-figure";
import { getEditorialImage, type EditorialImage } from "./editorial-images";
import { formatPublicationDate } from "./format-publication-date";
import { LocalizedCopy } from "./i18n/localized-copy";

type WeekPreview = ReturnType<typeof getBriefingWeekPreviews>[number];
type EngineeringPreview = NonNullable<WeekPreview["engineering"]>["items"][number];

const paperKeywords: Partial<Record<string, readonly string[]>> = {
  paper_doi_0fdbd893655a9cdc: ["Fatigue loads", "FAST simulations", "Damage equivalent loads"],
  paper_doi_7c215e99933870d2: ["Hydrodynamic models", "Time-domain simulation", "VolturnUS-S platform"],
  paper_openalex_28dd392021cd8142: ["Dynamic reconfiguration", "Vertical axis wind turbine", "Mooring stiffness degradation"],
  paper_doi_0e278c4206ea65f8: ["GRU sensor reconstruction", "Floating offshore wind turbine", "False-data injection"],
  paper_doi_912c60bbd0e5194b: ["Economic viability", "Market conditions", "Financial support mechanisms"],
};

type BriefingStoryProps = {
  id: string;
  title: string;
  href: string;
  publishedDate?: string;
  category?: EngineeringPreview["category"];
  keywords: readonly string[];
  source?: { publisher: string; href: string | null } | null;
  image?: EditorialImage;
};

function BriefingStory({ id, title, href, publishedDate, category, keywords, source, image }: BriefingStoryProps) {
  const titleId = "home-" + id;

  return (
    <article className="briefing-story" aria-labelledby={titleId}>
      {image && <EditorialImageFigure image={image} />}
      <div className="briefing-story-body">
        <p className="briefing-meta briefing-story-meta">
          {publishedDate && (
            <time dateTime={publishedDate} translate="no">{formatPublicationDate(publishedDate)}</time>
          )}
          {category && (
            <span className="briefing-category" data-category={category}>
              <LocalizedCopy {...categories[category]} />
            </span>
          )}
        </p>
        <h3 id={titleId}><Link className="briefing-headline" href={href} translate="no">{title}</Link></h3>
        {keywords.length > 0 && (
          <p className="briefing-story-keywords" translate="no">
            {keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
          </p>
        )}
        {source && (
          <p className="briefing-meta briefing-story-source">
            <LocalizedCopy en="Source" zh="来源" />{" "}
            {source.href ? <a href={source.href} translate="no">{source.publisher}</a> : <span translate="no">{source.publisher}</span>}
          </p>
        )}
      </div>
    </article>
  );
}

export function HomepageWeeklyBriefing({ weeks }: { weeks: readonly WeekPreview[] }) {
  const [selectedSlug, setSelectedSlug] = useState(weeks[0]?.slug);
  const preview = weeks.find(({ slug }) => slug === selectedSlug) ?? weeks[0];
  const lead = preview?.engineering?.items[0];
  const leadImage = preview && lead ? getEditorialImage(preview.slug, lead.id) : undefined;

  return (
    <div className="homepage-briefing">
      <h1 className="context-sr-only"><LocalizedCopy en="Latest briefing" zh="最新简报" /></h1>
      {weeks.length > 0 && (
        <fieldset className="briefing-week-picker">
          <legend><LocalizedCopy en="Select a week" zh="选择周次" /></legend>
          <div className="briefing-week-strip">
            {weeks.map(({ slug, dateRange }) => (
              <label className="briefing-week-option" key={slug} title={dateRange}>
                <input type="radio" name="briefing-week" value={slug} checked={slug === preview?.slug}
                  onChange={() => setSelectedSlug(slug)} aria-label={dateRange} />
                <time dateTime={slug} translate="no">{formatPublicationDate(slug)}</time>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {!preview && <p><LocalizedCopy en="No editions are available yet." zh="暂无已发布的简报。" /></p>}

      {preview && (
        <>
          <section className="briefing-track" aria-labelledby="engineering-briefing-heading">
            <h2 id="engineering-briefing-heading"><LocalizedCopy en="Engineering News" zh="工程新闻" /></h2>
            {preview.engineering ? (
              <>
                <ol className="briefing-story-list">
                  {preview.engineering.items.map((item, index) => (
                    <li key={item.id}>
                      <BriefingStory
                        {...item}
                        publishedDate={item.source?.publishedDate}
                        image={index === 0 ? leadImage : undefined}
                      />
                    </li>
                  ))}
                </ol>
                <p className="briefing-track-action"><Link href="/engineering"><LocalizedCopy en="Browse all engineering news" zh="浏览全部工程新闻" /></Link></p>
              </>
            ) : (
              <p><LocalizedCopy en="No Engineering edition was published for this date." zh="该日期暂无已发布的工程简报。" />{" "}
                <Link href="/engineering"><LocalizedCopy en="Engineering archive" zh="工程往期" /></Link>
              </p>
            )}
          </section>

          <section id="weekly" className="briefing-track" aria-labelledby="papers-heading">
            <h2 id="papers-heading"><LocalizedCopy en="Research Papers" zh="研究论文" /></h2>
            {preview.research ? (
              <>
                <ol className="briefing-story-list" aria-labelledby="papers-heading">
                  {preview.research.papers.map((paper) => (
                    <li key={paper.id}>
                      <BriefingStory
                        id={"research-" + paper.id}
                        title={paper.title}
                        href={paper.href}
                        publishedDate={paper.publicationDate}
                        keywords={paperKeywords[paper.id] ?? paper.topicTags}
                        source={{ publisher: paper.publicationSource, href: paper.sourceUrl }}
                      />
                    </li>
                  ))}
                </ol>
                <p className="briefing-track-action"><Link href="/archive"><LocalizedCopy en="Browse all research papers" zh="浏览全部研究论文" /></Link></p>
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
        <Link className="briefing-subscribe" href="/subscribe" prefetch={false}><LocalizedCopy en="Subscribe" zh="订阅" /></Link>
      </p>
    </div>
  );
}
