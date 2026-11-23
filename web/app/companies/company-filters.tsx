"use client";

import Link from "next/link";
import { useState } from "react";
import type { CompanyNewsRecord, getCompanyIndex } from "../../data/company-intelligence-adapter";
import { companyNewsCategories } from "../../data/company-news-categories";
import { companyEventAnchor } from "../../data/context-navigation";
import { useLanguage } from "../i18n/language-context";
import { LocalizedCopy as Copy } from "../i18n/localized-copy";
import { translateContentText } from "../i18n/render-content";
import styles from "./companies.module.css";

export function CompanyDirectory({ companies }: { companies: ReturnType<typeof getCompanyIndex> }) {
  const [query, setQuery] = useState("");
  const { language } = useLanguage();
  const matching = companies.filter((company) => company.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <section aria-label={language === "zh" ? "企业目录" : "Company directory"}>
      <label className={styles.filter}>
        <span><Copy en="Search by company name" zh="按企业名称搜索" /></span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {matching.length ? (
        <ul className={styles.rows}>
          {matching.map((company) => (
            <li key={company.id}>
              <h2><Link href={`/companies/${company.id}`} translate="no">{company.name}</Link></h2>
              <p className={styles.meta}>{translateContentText(company.companyType, language)} · {translateContentText(company.countryRegion, language)}</p>
              <p className={styles.meta}>
                <Copy en={`${company.updateCount} retained ${company.updateCount === 1 ? "update" : "updates"}`} zh={`${company.updateCount} 条收录动态`} />
                {company.latestDate && <> · <Copy en="Latest" zh="最新" /> <time dateTime={company.latestDate}>{company.latestDate}</time></>}
              </p>
            </li>
          ))}
        </ul>
      ) : <p role="status"><Copy en="No companies match this search." zh="没有符合搜索条件的企业。" /></p>}
    </section>
  );
}

export function CompanyTimeline({ news }: { news: CompanyNewsRecord[] }) {
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const { language } = useLanguage();
  const years = [...new Set(news.map((record) => record.publishedDate.slice(0, 4)))];
  const matching = news.filter((record) =>
    (!category || record.category === category) && (!year || record.publishedDate.slice(0, 4) === year));
  const hasMhiHistory = news.some((record) => record.historicalSubjects.includes("MHI Vestas Offshore Wind"));
  return (
    <section className={styles.section} aria-labelledby="company-timeline-heading">
      <h2 id="company-timeline-heading"><Copy en="Company Timeline" zh="企业动态时间线" /></h2>
      <p className={styles.scope}><Copy en="FOWT Digest retains source-backed developments relevant to offshore and floating wind. This timeline covers only reviewed records in the Digest archive." zh="FOWT Digest 收录有来源依据的海上风电与浮式风电相关动态。此时间线仅涵盖档案中已审核的记录。" /></p>
      {hasMhiHistory && <p className={styles.scope}><Copy en="MHI Vestas Offshore Wind was a joint venture between Mitsubishi Heavy Industries and Vestas. Vestas acquired MHI’s share in December 2020. The timeline identifies developments involving the former joint venture." zh="MHI Vestas Offshore Wind 曾是三菱重工与维斯塔斯的合资企业。维斯塔斯于 2020 年 12 月收购三菱重工所持股权。时间线标明涉及原合资企业的动态。" /></p>}
      {news.length > 0 && (
        <div className={styles.timelineFilters}>
          <label className={styles.filter}>
            <span><Copy en="Filter by category" zh="按类别筛选" /></span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">{language === "zh" ? "所有类别" : "All categories"}</option>
              {Object.entries(companyNewsCategories).map(([id, labels]) => (
                <option key={id} value={id}>{labels[language]}</option>
              ))}
            </select>
          </label>
          {years.length > 1 && <label className={styles.filter}>
            <span><Copy en="Filter by year" zh="按年份筛选" /></span>
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="">{language === "zh" ? "所有年份" : "All years"}</option>
              {years.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>}
        </div>
      )}
      {matching.length ? (
        <ol className={styles.rows}>
          {matching.map((record) => (
            <li key={record.id} id={companyEventAnchor(record.id)} className={styles.timelineEvent}>
              <p className={styles.meta}><time dateTime={record.publishedDate}>{record.publishedDate}</time> · <Copy {...companyNewsCategories[record.category]} /></p>
              {record.historicalSubjects.filter((name) => name !== record.publisher).map((name) =>
                <p className={styles.meta} key={name} translate="no">{name}</p>)}
              <h3 translate="no">{record.title}</h3>
              <p translate="no">{record.summary}</p>
              <p className={styles.links}>
                <a href={record.url}><Copy en={`Original source · ${record.publisher}`} zh={`原始来源 · ${record.publisher}`} /></a>
                {record.projects.map((project) => <Link href={`/projects/${project.slug}`} key={project.slug}><Copy en="Project" zh="项目" /> <span translate="no">{project.name}</span></Link>)}
              </p>
            </li>
          ))}
        </ol>
      ) : news.length ? (
        <p role="status"><Copy en="No retained developments match these filters." zh="没有符合筛选条件的已收录动态。" /></p>
      ) : (
        <p><Copy en="No reviewed developments have been linked to this company yet." zh="该企业暂未关联经审核的动态。" /></p>
      )}
    </section>
  );
}
