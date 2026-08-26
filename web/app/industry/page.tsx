import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Industry Map",
  description:
    "A static editorial map of the floating offshore wind value chain, from project owners to turbines, platforms, moorings, cables, installation, grid, certification, and engineering support.",
};

const industryMap = getIndustryMap();
const companies = getIndustryCompanies();
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

      <section className="industry-hero" aria-labelledby="industry-heading">
        <p className="eyebrow"><LocalizedCopy en="Industry Map" zh="产业图谱" /></p>
        <h1 id="industry-heading"><LocalizedCopy en="Who builds floating offshore wind?" zh="谁在建设浮式海上风电？" /></h1>
        <p>
          <LocalizedCopy en="A static value-chain map for reading floating offshore wind as a project delivery system: clients first, then turbines, floating platforms, station keeping, electrical connection, installation, assurance, and engineering tools." zh="以项目交付体系呈现浮式海上风电的静态价值链图谱：从客户开始，依次涵盖风机、浮式平台、定位保持、电气连接、安装、认证保障和工程工具。" />
        </p>
        <dl className="industry-stats" aria-label="Industry map coverage">
          <div>
            <dt><LocalizedCopy en="Companies" zh="企业" /></dt>
            <dd>{industryCompanyCount}</dd>
          </div>
          <div>
            <dt><LocalizedCopy en="Value-chain stages" zh="价值链环节" /></dt>
            <dd>{industryMap.length}</dd>
          </div>
          <div>
            <dt><LocalizedCopy en="Verified role links" zh="已核实角色关联" /></dt>
            <dd>{roleCount}</dd>
          </div>
        </dl>
      </section>

      <section className="industry-system" aria-labelledby="industry-system-heading">
        <div className="industry-system-copy">
          <p className="eyebrow"><LocalizedCopy en="FOWT System" zh="浮式海上风电系统" /></p>
          <h2 id="industry-system-heading"><LocalizedCopy en="Components first, supply chain second." zh="先看系统组件，再看供应链。" /></h2>
          <p>
            <LocalizedCopy en="The physical floating wind asset and the organisations that deliver it are related, but they are easier to read as two separate sectors: one for the offshore system components, and one for the delivery chain behind those components." zh="浮式风电实体资产与交付这些资产的机构相互关联，但分为两个部分更易理解：海上系统组件，以及组件背后的交付链。" />
          </p>
        </div>

        <div className="industry-system-maps">
          <div className="industry-map-panel" aria-label="Floating offshore wind system component sector">
            <div className="industry-map-panel-copy">
              <h3><LocalizedCopy en="Floating offshore wind system components" zh="浮式海上风电系统组件" /></h3>
              <p>
                <LocalizedCopy en="The platform is the offshore interface. It carries the turbine, connects to station-keeping hardware, and routes electrical export through dynamic cable and grid connection subsystems." zh="平台是海上接口，承载风机、连接定位保持装置，并通过动态海缆和并网子系统输送电力。" />
              </p>
            </div>
            <div className="fowt-component-map">
              <div className="industry-map-node industry-chain-owner">
                Wind Turbine
                <span>Turbine aerodynamics / control</span>
              </div>
              <div className="industry-map-arrow" aria-hidden="true">v</div>
              <div className="industry-map-node industry-platform-node">
                Floating Platform
                <span>Floater hydrodynamics / stability</span>
              </div>
              <div className="industry-subsystem-row" aria-label="Floating platform subsystems">
                <div className="industry-subsystem">
                  <p>Station Keeping Subsystem</p>
                  <div className="industry-map-node">
                    Mooring & Anchoring
                    <span>Mooring dynamics / soil interaction</span>
                  </div>
                </div>
                <div className="industry-subsystem">
                  <p>Electrical Export Subsystem</p>
                  <div className="industry-map-node">
                    Dynamic Cable
                    <span>Cable fatigue / motion response</span>
                  </div>
                  <div className="industry-map-arrow" aria-hidden="true">v</div>
                  <div className="industry-map-node">
                    Offshore Electrical / Grid
                    <span>Grid integration / power systems</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="industry-map-panel" aria-label="Floating offshore wind supply chain sector">
            <div className="industry-map-panel-copy">
              <h3><LocalizedCopy en="Supply chain and industry roles" zh="供应链与产业角色" /></h3>
              <p>
                <LocalizedCopy en="The delivery chain starts with project ownership and major equipment, then moves through platform-led subsystems, installation, grid connection, and assurance support." zh="交付链始于项目所有权和主要设备，随后延伸至平台相关子系统、安装、并网和认证保障支持。" />
              </p>
            </div>
            <div className="industry-chain-map">
              <div className="industry-map-node industry-chain-owner">
                Project Owner / Developer
              </div>
              <div className="industry-map-arrow" aria-hidden="true">v</div>
              <div className="industry-chain-row">
                <div className="industry-map-node">Wind Turbine OEM</div>
                <div className="industry-map-node industry-platform-node">
                  Floating Platform
                </div>
              </div>
              <div className="industry-map-arrow" aria-hidden="true">v</div>
              <div className="industry-subsystem-row" aria-label="Platform-led supply chain subsystems">
                <div className="industry-subsystem">
                  <p>Station Keeping Subsystem</p>
                  <div className="industry-map-node">Mooring & Anchoring</div>
                  <div className="industry-map-node">Marine Installation</div>
                </div>
                <div className="industry-subsystem">
                  <p>Electrical Export Subsystem</p>
                  <div className="industry-map-node">Cable Systems</div>
                  <div className="industry-map-arrow" aria-hidden="true">v</div>
                  <div className="industry-map-node">Grid Technology</div>
                </div>
              </div>
              <div className="industry-map-arrow" aria-hidden="true">v</div>
              <div className="industry-chain-row">
                <div className="industry-map-node">EPCI / Subsea</div>
                <div className="industry-map-node">Offshore Electrical</div>
                <div className="industry-map-node">Certification / Assurance</div>
                <div className="industry-map-node">Engineering / Simulation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="industry-world-map" aria-labelledby="industry-world-map-heading">
        <p className="eyebrow"><LocalizedCopy en="Offshore Wind Map" zh="海上风电地图" /></p>
        <h2 id="industry-world-map-heading"><LocalizedCopy en="Offshore wind around the world" zh="全球海上风电" /></h2>
        <p>
          <LocalizedCopy en="Scan global offshore wind project locations and market geography." zh="浏览全球海上风电项目位置与市场分布。" />
        </p>
        <p className="text-link-row">
          <Link href="https://map.tgs4c.com/offshorewind/">
            <LocalizedCopy en="Open TGS4C offshore wind map" zh="打开 TGS4C 海上风电地图" /> -&gt;
          </Link>
        </p>
        <p className="industry-source-note">Source: TGS4C.</p>
      </section>

      <section className="industry-orientation" aria-label="How to read the map">
        <div>
          <p className="eyebrow"><LocalizedCopy en="Project Side / Clients" zh="项目方 / 客户" /></p>
          <h2><LocalizedCopy en="Who owns the project?" zh="谁拥有项目？" /></h2>
          <p>
            <LocalizedCopy en="Developers, project owners, utilities, and infrastructure sponsors originate the project and procure the technical delivery chain." zh="开发商、项目业主、公用事业企业和基础设施投资方发起项目，并采购技术交付链。" />
          </p>
        </div>
        <div>
          <p className="eyebrow"><LocalizedCopy en="Delivery / Supply Chain" zh="交付 / 供应链" /></p>
          <h2><LocalizedCopy en="Who delivers the system?" zh="谁交付系统？" /></h2>
          <p>
            <LocalizedCopy en="OEMs, platform designers, mooring and cable suppliers, offshore contractors, grid specialists, certifiers, and engineering tool providers turn the lease into an operating floating wind asset." zh="OEM、平台设计方、系泊与海缆供应商、海上承包商、电网专家、认证机构和工程工具提供商共同将租赁海域转化为运行中的浮式风电资产。" />
          </p>
        </div>
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
                      <li className="industry-company" key={`${category.id}-${company.id}`}>
                        <details>
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

      <SiteFooter />
    </main>
  );
}
