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
          <h2 id="industry-system-heading">From project owner to grid connection.</h2>
          <p>
            The physical system is not a straight supplier chain: the floating
            platform carries the turbine, moorings hold station, dynamic cables
            move with the asset, and assurance and engineering roles surround
            the delivery path.
          </p>
        </div>

        <div className="industry-schematic" aria-label="Floating offshore wind system schematic">
          <div className="schematic-node schematic-owner">Project Owner / Developer</div>
          <div className="schematic-arrow">v</div>
          <div className="schematic-node schematic-turbine">Wind Turbine</div>
          <div className="schematic-arrow">v</div>
          <div className="schematic-node schematic-platform">Floating Platform</div>
          <div className="schematic-branch">
            <div className="schematic-node">Mooring</div>
            <div className="schematic-node">Dynamic / Export Cable</div>
          </div>
          <div className="schematic-arrow">v</div>
          <div className="schematic-node schematic-electrical">
            Offshore Electrical / Substation
          </div>
          <div className="schematic-arrow">v</div>
          <div className="schematic-node schematic-grid">Grid</div>
          <div className="schematic-support schematic-support-left">
            EPCI / Subsea Engineering
          </div>
          <div className="schematic-support schematic-support-right">
            Marine Installation / Vessels
          </div>
          <div className="schematic-support schematic-support-bottom">
            Certification / Assurance + Engineering / Simulation
          </div>
        </div>
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

      <section className="industry-note" aria-label="Industry map notes">
        <h2>Static map, not a market page</h2>
        <p>
          This first version is a curated editorial model. It keeps Industry
          data separate from Engineering Briefing and Research Digest data, and
          does not include share prices, market capitalisation, financial APIs,
          automated company discovery, or company detail pages.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
