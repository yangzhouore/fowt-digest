import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import {
  getIndustryCompanies,
  getIndustryMap,
  industryCompanyCount,
  type IndustryCompany,
} from "../../data/industry/industry-map";

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
    <main>
      <SiteHeader />

      <section className="industry-hero" aria-labelledby="industry-heading">
        <p className="eyebrow">Industry Map</p>
        <h1 id="industry-heading">Who builds floating offshore wind?</h1>
        <p>
          A static value-chain map for reading floating offshore wind as a
          project delivery system: clients first, then turbines, floating
          platforms, station keeping, electrical connection, installation,
          assurance, and engineering tools.
        </p>
        <dl className="industry-stats" aria-label="Industry map coverage">
          <div>
            <dt>Companies</dt>
            <dd>{industryCompanyCount}</dd>
          </div>
          <div>
            <dt>Value-chain stages</dt>
            <dd>{industryMap.length}</dd>
          </div>
          <div>
            <dt>Verified role links</dt>
            <dd>{roleCount}</dd>
          </div>
        </dl>
      </section>

      <section className="industry-system" aria-labelledby="industry-system-heading">
        <div className="industry-system-copy">
          <p className="eyebrow">FOWT System</p>
          <h2 id="industry-system-heading">Components first, supply chain second.</h2>
          <p>
            The physical floating wind asset and the organisations that deliver
            it are related, but they are easier to read as two separate sectors:
            one for the offshore system components, and one for the delivery
            chain behind those components.
          </p>
        </div>

        <div className="industry-system-maps">
          <div className="industry-map-panel" aria-label="Floating offshore wind system component sector">
            <div className="industry-map-panel-copy">
              <h3>Floating offshore wind system components</h3>
              <p>
                The platform is the offshore interface. It carries the turbine,
                connects to station-keeping hardware, and routes electrical
                export through dynamic cable and grid connection subsystems.
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
              <h3>Supply chain and industry roles</h3>
              <p>
                The delivery chain starts with project ownership and major
                equipment, then moves through platform-led subsystems,
                installation, grid connection, and assurance support.
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
        <p className="eyebrow">Offshore Wind Map</p>
        <h2 id="industry-world-map-heading">Offshore wind around the world</h2>
        <p>
          Scan global offshore wind project locations and market geography.
        </p>
        <p className="text-link-row">
          <Link href="https://map.tgs4c.com/offshorewind/">
            Open TGS4C offshore wind map -&gt;
          </Link>
        </p>
        <p className="industry-source-note">Source: TGS4C.</p>
      </section>

      <section className="industry-orientation" aria-label="How to read the map">
        <div>
          <p className="eyebrow">Project Side / Clients</p>
          <h2>Who owns the project?</h2>
          <p>
            Developers, project owners, utilities, and infrastructure sponsors
            originate the project and procure the technical delivery chain.
          </p>
        </div>
        <div>
          <p className="eyebrow">Delivery / Supply Chain</p>
          <h2>Who delivers the system?</h2>
          <p>
            OEMs, platform designers, mooring and cable suppliers, offshore
            contractors, grid specialists, certifiers, and engineering tool
            providers turn the lease into an operating floating wind asset.
          </p>
        </div>
      </section>

      <section className="industry-map" aria-label="Floating offshore wind value chain">
        {industryMap.map((stage, index) => (
          <section className="industry-stage" key={stage.id}>
            <div className="industry-stage-header">
              <p className="industry-stage-number">{stage.number}</p>
              <div>
                <p className="industry-stage-side">{stage.side}</p>
                <h2>{stage.title}</h2>
                <p>{stage.summary}</p>
              </div>
            </div>

            <div className="industry-categories">
              {stage.categories.map((category) => (
                <article className="industry-category" key={category.id}>
                  <div className="industry-category-copy">
                    <h3>{category.title}</h3>
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
                            <img
                              className="industry-company-logo"
                              src={companyLogoUrl(company)}
                              alt=""
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
                                <dt>Region</dt>
                                <dd>{company.countryRegion}</dd>
                              </div>
                              <div>
                                <dt>Type</dt>
                                <dd>{company.companyType}</dd>
                              </div>
                              <div>
                                <dt>Involvement</dt>
                                <dd>{company.representativeInvolvement}</dd>
                              </div>
                            </dl>
                            <Link className="industry-source-link" href={company.sourceUrl}>
                              Source
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
