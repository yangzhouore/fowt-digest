"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { IndustryCategory } from "../../data/industry/industry-map";
import type { CompanyNewsRecord, getCompanyIndex } from "../../data/company-intelligence-adapter";
import { companyNewsCategories } from "../../data/company-news-categories";
import { companyEventAnchor } from "../../data/context-navigation";
import { useLanguage } from "../i18n/language-context";
import { LocalizedCopy as Copy } from "../i18n/localized-copy";
import { translateContentText } from "../i18n/render-content";
import styles from "./companies.module.css";

const countryFlags = {
  Australia: "au", Austria: "at", Canada: "ca", Luxembourg: "lu", Sweden: "se", "United Arab Emirates": "ae",
  Belgium: "be", China: "cn", Denmark: "dk", France: "fr", Germany: "de",
  Ireland: "ie", Italy: "it", Japan: "jp", Netherlands: "nl", Norway: "no",
  Portugal: "pt", "South Korea": "kr", Spain: "es", Switzerland: "ch",
  "United Kingdom": "gb", "United States": "us",
};

const categoryColors: Record<string, string> = {
  "developers-owners-utilities": "project",
  "wind-turbine-oem": "technology",
  "floating-foundation-platform": "policy",
  "mooring-anchoring": "supply_chain",
  "dynamic-export-cable": "software",
  "offshore-electrical-substation": "standards",
  "epci-subsea-engineering": "event",
  fabrication: "fabrication",
  "marine-installation-vessels": "marine",
  "grid-technology": "grid",
  "certification-assurance": "assurance",
  "research-public-body": "research",
  "engineering-simulation-software": "engineering",
};

const categoryNamesZh: Record<string, string> = {
  "developers-owners-utilities": "开发商 / 业主 / 公用事业",
  "wind-turbine-oem": "风机整机厂",
  "floating-foundation-platform": "浮式基础 / 平台",
  "mooring-anchoring": "系泊与锚固",
  "dynamic-export-cable": "动态 / 送出海缆",
  "offshore-electrical-substation": "海上电气 / 升压站",
  "epci-subsea-engineering": "EPCI / 水下工程",
  fabrication: "制造",
  "marine-installation-vessels": "海上安装 / 船舶",
  "grid-technology": "电网技术",
  "certification-assurance": "认证 / 保障",
  "research-public-body": "研究 / 公共机构",
  "engineering-simulation-software": "工程 / 仿真 / 软件",
};

type CompanyCategory = Pick<IndustryCategory, "id" | "title" | "roles">;

export function CompanyDirectory({ companies, categories }: {
  companies: ReturnType<typeof getCompanyIndex>;
  categories: CompanyCategory[];
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const { language } = useLanguage();
  const { rows, countryOptions, categoryCounts } = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    const countryCounts = new Map<string, number>();
    const flagCodes = new Map(Object.entries(countryFlags));
    const rows = companies.map((company) => {
      const categoryIds = categories.filter(({ roles }) => roles.some((role) => company.roles.includes(role))).map(({ id }) => id);
      const recordedCountries = company.countryRegion.split("/").map((region) => flagCodes.get(region.trim())).filter((code) => code !== undefined);
      const countries = recordedCountries.length ? [...new Set(recordedCountries)] : ["unknown"];
      for (const id of categoryIds) categoryCounts.set(id, (categoryCounts.get(id) ?? 0) + 1);
      for (const code of countries) countryCounts.set(code, (countryCounts.get(code) ?? 0) + 1);
      return { company, categoryIds, countries };
    });
    const countryOptions = Object.entries(countryFlags)
      .filter(([, code]) => countryCounts.has(code))
      .map(([name, code]) => ({ name, code, count: countryCounts.get(code) ?? 0 }))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
    const unknownCount = countryCounts.get("unknown");
    if (unknownCount) countryOptions.push({ name: "Country not recorded", code: "unknown", count: unknownCount });
    return { rows, countryOptions, categoryCounts };
  }, [companies, categories]);
  const search = query.trim().toLowerCase();
  const matching = rows.filter(({ company, categoryIds, countries }) =>
    company.name.toLowerCase().includes(search) &&
    (!categoryId || categoryIds.includes(categoryId)) &&
    (!countryCode || countries.includes(countryCode))
  ).map(({ company }) => company);
  return (
    <section aria-label={language === "zh" ? "企业目录" : "Company directory"}>
      <fieldset className={styles.directoryFilters}>
        <legend><Copy en="Company categories" zh="企业类别" /></legend>
        <div className="engineering-category-options">
          <button type="button" aria-pressed={!categoryId} onClick={() => setCategoryId("")}>
            <Copy en="All categories" zh="全部类别" /> <strong>{companies.length}</strong>
          </button>
          {categories.map(({ id, title }) => (
            <button key={id} type="button" className={`briefing-category ${styles.categoryCard}`}
              data-category={categoryColors[id]} aria-pressed={categoryId === id}
              onClick={() => setCategoryId(categoryId === id ? "" : id)}>
              <Copy en={title} zh={categoryNamesZh[id] ?? title} /> <strong>{categoryCounts.get(id) ?? 0}</strong>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.directoryFilters}>
        <legend><Copy en="Countries" zh="国家" /></legend>
        <div className={`engineering-category-options ${styles.countryCards}`}>
          <button type="button" aria-pressed={!countryCode} onClick={() => setCountryCode("")}>
            <Copy en="All countries" zh="全部国家" />
          </button>
          {countryOptions.map(({ name, code, count }) => (
            <button key={code} type="button" aria-pressed={countryCode === code}
              onClick={() => setCountryCode(countryCode === code ? "" : code)}>
              {code !== "unknown" && <Image src={`/flags/${code}.svg`} alt="" width={20} height={15} />}
              {code === "unknown" ? <Copy en={name} zh="未记录国家" /> : translateContentText(name, language)}
              <strong>{count}</strong>
            </button>
          ))}
        </div>
      </fieldset>
      <label className={styles.filter}>
        <span><Copy en="Search by company name" zh="按企业名称搜索" /></span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <p className={styles.meta} aria-live="polite"><Copy en={`${matching.length} of ${companies.length} companies`} zh={`${matching.length} / ${companies.length} 家企业`} /></p>
      {matching.length ? (
        <ul className={styles.rows}>
          {matching.map((company) => (
            <li key={company.id}>
              <h2 className={styles.directoryCompany}>
                {company.logo
                  ? <Image className={styles.directoryLogo} src={`/editorial/company-logos/${company.logo.file}`} alt=""
                      width={company.logo.width} height={company.logo.height} unoptimized
                      style={company.logo.file.endsWith(".svg") ? undefined : {
                        maxInlineSize: `min(7rem, 24vw, ${company.logo.width / 2}px)`,
                      }} />
                  : <span className={styles.directoryInitials} aria-hidden="true">{company.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}</span>}
                <Link href={`/companies/${company.id}`} translate="no">{company.name}</Link>
              </h2>
              <p className={styles.meta}>{translateContentText(company.companyType, language)}{company.countryRegion && <> · {translateContentText(company.countryRegion, language)}</>}</p>
              {(!company.profilePending || company.updateCount > 0) && <p className={styles.meta}>
                <Copy en={`${company.updateCount} retained ${company.updateCount === 1 ? "update" : "updates"}`} zh={`${company.updateCount} 条收录动态`} />
                {company.latestDate && <> · <Copy en="Latest" zh="最新" /> <time dateTime={company.latestDate}>{company.latestDate}</time></>}
              </p>}
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
