import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyIndex, getCompanyIntelligence } from "../../../data/company-intelligence-adapter";
import { getIndustryEntryHref } from "../../../data/connected-context-adapter";
import { LocalizedCopy as Copy } from "../../i18n/localized-copy";
import { localizeServerContent } from "../../i18n/server-content";
import { CompanyTimeline } from "../company-filters";
import styles from "../companies.module.css";

type Props = { params: Promise<{ "company-id": string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getCompanyIndex().map(({ id }) => ({ "company-id": id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = getCompanyIntelligence((await params)["company-id"]);
  if (!record) notFound();
  return { title: `${record.company.name} | Company Intelligence` };
}

export default async function CompanyPage({ params }: Props) {
  const record = getCompanyIntelligence((await params)["company-id"]);
  if (!record) notFound();
  const { company, news, projects } = record;
  const latestDate = news[0]?.publishedDate;
  const industryHref = getIndustryEntryHref(company.id);

  return localizeServerContent(
    <main>
      <div className={styles.content}>
        <header className={styles.intro}>
          <nav className={styles.links} aria-label="Company navigation">
            <Link href="/companies"><Copy en="Company Intelligence" zh="企业动态" /></Link>
            {industryHref && <Link href={industryHref}><Copy en="Industry entry" zh="产业条目" /></Link>}
          </nav>
          <h1 translate="no">{company.name}</h1>
          <p className={styles.meta}>{company.companyType} · {company.countryRegion} · <a href={company.website}><Copy en="Company website" zh="企业网站" /></a></p>
          <dl className={styles.stats}>
            <div><dt><Copy en="Retained updates" zh="收录动态" /></dt><dd>{news.length}</dd></div>
            {latestDate && <div><dt><Copy en="Latest retained update" zh="最新收录动态" /></dt><dd><time dateTime={latestDate}>{latestDate}</time></dd></div>}
            {projects.length > 0 && <div><dt><Copy en="Related FOWT projects" zh="相关浮式海上风电项目" /></dt><dd>{projects.length}</dd></div>}
          </dl>
        </header>

        <CompanyTimeline news={news} />

        {projects.length > 0 && (
          <section className={styles.section} aria-labelledby="company-projects-heading">
            <h2 id="company-projects-heading"><Copy en="Related Projects" zh="相关项目" /></h2>
            <ul className={styles.rows}>
              {projects.map((project) => (
                <li key={project.id}>
                  <h3><Link href={`/projects/${project.slug}`} translate="no">{project.name}</Link></h3>
                  {project.roles.map((role) => (
                    <p className={styles.meta} key={role.id}>{role.roleLabel} · <Copy {...role.contextLabel} />{role.scope && <> · {role.scope}</>}</p>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>,
  );
}
