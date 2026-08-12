import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import {
  getIndustryCompanies,
  getIndustryMap,
  industryCompanyCount,
} from "../../data/industry/industry-map";

export const metadata: Metadata = {
  title: "Industry Map",
  description:
    "A static editorial map of the floating offshore wind value chain, from project owners to turbines, platforms, moorings, cables, installation, grid, certification, and engineering support.",
};

const industryMap = getIndustryMap();
const companies = getIndustryCompanies();
const roleCount = companies.reduce((total, company) => total + company.roles.length, 0);

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
                        <div>
                          <h4>
                            <Link href={company.website}>{company.name}</Link>
                          </h4>
                          <p className="industry-company-meta">
                            {company.countryRegion} - {company.companyType}
                          </p>
                        </div>
                        <p>{company.description}</p>
                        <p className="industry-company-involvement">
                          {company.representativeInvolvement}
                        </p>
                        <Link className="industry-source-link" href={company.sourceUrl}>
                          Source
                        </Link>
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
