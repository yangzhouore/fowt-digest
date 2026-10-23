import type { Metadata } from "next";
import { CountryOverview } from "./country-overview";
import { CountryNavigation } from "./country-navigation";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import {
  getIndustryCompanies,
  getIndustryMap,
  industryCompanyCount,
  type IndustryCompany,
} from "../../data/industry/industry-map";
import { LocalizedCopy } from "../i18n/localized-copy";
import { CompanyProjectContext } from "../connected-project-context";
import { industryCompanyAnchor } from "../../data/context-navigation";

export const metadata: Metadata = {
  title: "Industry Map",
  description:
    "Compare the UK, Germany, Norway and China floating wind supply chains, project development, permissions, electricity and money, with a sourced international company directory.",
};

const industryMap = getIndustryMap();
const companies = getIndustryCompanies();
const canonicalCategoryByCompany = new Map<string, string>();
for (const stage of industryMap) {
  for (const category of stage.categories) {
    for (const company of category.companies) {
      if (!canonicalCategoryByCompany.has(company.id)) canonicalCategoryByCompany.set(company.id, category.id);
    }
  }
}
const roleCount = companies.reduce((total, company) => total + company.roles.length, 0);

const roleLabels: Record<string, string> = {
  "developer-owner": "Developer / Project Owner",
  utility: "Utility",
  "turbine-oem": "Wind Turbine OEM",
  "floating-platform": "Floating Platform",
  "platform-engineering": "Platform Engineering",
  "mooring-anchoring": "Mooring & Anchoring",
  "cable-systems": "Cable Systems",
  "offshore-electrical": "Offshore Electrical",
  "grid-technology": "Grid Technology",
  "epci-subsea": "EPCI / Subsea",
  "marine-installation": "Marine Installation",
  "certification-assurance": "Certification / Assurance",
  "engineering-consulting": "Engineering Consulting",
  "simulation-software": "Simulation Software",
};

const industryTaxonomyZh: Record<string, string> = {
  "Project side": "项目方", "Delivery chain": "交付链", "Develop & Own": "开发与持有", "Build The Floating System": "建造浮式系统",
  "Secure & Connect": "定位与连接", "Install & Deliver": "安装与交付", "Enable & Assure": "赋能与保障",
  "Developers / Project Owners / Utilities": "开发商 / 项目业主 / 公用事业企业", "Wind Turbine OEM": "风机 OEM",
  "Floating Foundation / Platform": "浮式基础 / 平台", "Mooring & Anchoring": "系泊与锚固", "Dynamic / Export Cable": "动态 / 送出海缆",
  "Offshore Electrical / Substation": "海上电气 / 升压站", "EPCI / Subsea Engineering": "EPCI / 水下工程",
  "Marine Installation / Vessels": "海上安装 / 船舶", "Grid Technology": "电网技术", "Certification / Assurance": "认证 / 保障",
  "Engineering / Simulation / Software": "工程 / 仿真 / 软件",
};

function companyInitials(name: string) {
  return name
    .replace(/\/.*/, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function conciseRegion(countryRegion: string) {
  return countryRegion.split("/")[0].trim();
}

function conciseRole(company: IndustryCompany) {
  return roleLabels[company.roles[0]] ?? company.companyType;
}

function companyLogoUrl(company: IndustryCompany) {
  const domain = new URL(company.website).hostname;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export default function IndustryPage() {
  return (
    <main className="industry-page">
      <SiteHeader />

      <CountryNavigation />
      <CountryOverview />

      <section className="industry-hero" id="industry-catalogue" aria-labelledby="industry-heading">
        <p className="eyebrow"><LocalizedCopy en="International company reference" zh="国际企业参考目录" /></p>
        <h2 id="industry-heading"><LocalizedCopy en="Explore the delivery ecosystem" zh="探索交付生态" /></h2>
        <p><LocalizedCopy en="This international catalogue complements the four country guides. A listing does not prove local manufacturing, current procurement or a contract on a particular project. Expand a company for its recorded project roles and evidence." zh="此国际目录补充四国指南。收录不代表本地制造、当前采购或某项目合同。展开企业可查看记录的项目角色与证据。" /></p>
        <dl className="industry-stats" aria-label="International catalogue coverage">
          <div><dt><LocalizedCopy en="Companies in this catalogue" zh="目录内企业" /></dt><dd>{industryCompanyCount}</dd></div>
          <div><dt><LocalizedCopy en="Catalogue stages" zh="目录阶段" /></dt><dd>{industryMap.length}</dd></div>
          <div><dt><LocalizedCopy en="Recorded catalogue roles" zh="目录角色记录" /></dt><dd>{roleCount}</dd></div>
        </dl>
      </section>

      <section className="industry-map" aria-label="Floating offshore wind value chain">
        {industryMap.map((stage, index) => (
          <section className="industry-stage" key={stage.id}>
            <div className="industry-stage-header">
              <p className="industry-stage-number">{stage.number}</p>
              <div>
                <p className="industry-stage-side"><LocalizedCopy en={stage.side} zh={industryTaxonomyZh[stage.side] ?? stage.side} /></p>
                <h2><LocalizedCopy en={stage.title} zh={industryTaxonomyZh[stage.title] ?? stage.title} /></h2>
                <p>{stage.summary}</p>
              </div>
            </div>

            <div className="industry-categories">
              {stage.categories.map((category) => (
                <article className="industry-category" key={category.id}>
                  <div className="industry-category-copy">
                    <h3><LocalizedCopy en={category.title} zh={industryTaxonomyZh[category.title] ?? category.title} /></h3>
                    <p>{category.description}</p>
                  </div>
                  <ul className="industry-company-list">
                    {category.companies.map((company) => (
                      <li className="industry-company" key={`${category.id}-${company.id}`} id={canonicalCategoryByCompany.get(company.id) === category.id ? industryCompanyAnchor(company.id) : undefined} data-industry-company={company.id}>
                        <details id={`industry-${category.id}-${company.id}`}>
                          <summary>
                            <span className="industry-company-mark" aria-hidden="true">
                              {companyInitials(company.name)}
                            </span>
                            <Image
                              className="industry-company-logo"
                              src={companyLogoUrl(company)}
                              alt=""
                              width={28}
                              height={28}
                              unoptimized
                              aria-hidden="true"
                            />
                            <span className="industry-company-summary-copy">
                              <span className="industry-company-name">
                                <Link href={company.website}>{company.name}</Link>
                              </span>
                              <span className="industry-company-meta">
                                {conciseRegion(company.countryRegion)} - {conciseRole(company)}
                              </span>
                            </span>
                          </summary>
                          <div className="industry-company-detail">
                            <p>{company.description}</p>
                            <dl>
                              <div>
                                <dt><LocalizedCopy en="Region" zh="地区" /></dt>
                                <dd>{company.countryRegion}</dd>
                              </div>
                              <div>
                                <dt><LocalizedCopy en="Type" zh="类型" /></dt>
                                <dd>{company.companyType}</dd>
                              </div>
                              <div>
                                <dt><LocalizedCopy en="Involvement" zh="参与情况" /></dt>
                                <dd>{company.representativeInvolvement}</dd>
                              </div>
                            </dl>
                            <Link className="industry-source-link" href={company.sourceUrl}>
                              <LocalizedCopy en="Source" zh="来源" />
                            </Link>
                            <CompanyProjectContext companyId={company.id} instanceId={`${category.id}-${company.id}`} />
                          </div>
                        </details>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            {index < industryMap.length - 1 ? (
              <div className="industry-flow-arrow" aria-hidden="true">v</div>
            ) : null}
          </section>
        ))}
      </section>

      <section className="industry-world-map" aria-labelledby="industry-world-map-heading">
        <h2 id="industry-world-map-heading"><LocalizedCopy en="Further geographic reference" zh="更多地理参考" /></h2>
        <p><LocalizedCopy en="The external TGS4C map covers global offshore wind. It is separate from these country investigations and their dated evidence." zh="外部 TGS4C 地图覆盖全球海上风电，与各国调查及其有日期的证据分开。" /></p>
        <Link href="https://map.tgs4c.com/offshorewind/"><LocalizedCopy en="Open the global TGS4C map" zh="打开 TGS4C 全球地图" /></Link>
      </section>

      <SiteFooter />
    </main>
  );
}
