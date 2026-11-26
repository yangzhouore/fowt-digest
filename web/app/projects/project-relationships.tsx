import Image from "next/image";
import { IndustryEntryLink } from "../connected-project-context";
import { LocalizedCopy } from "../i18n/localized-copy";
import { industryCompanies, resolveProjectCompanyId } from "../../data/industry/industry-map";
import { formatRole, relationshipContextLabel, type ProjectCompanyRelationship } from "../../data/project-adapter";
import companyWebsites from "../../data/projects/company-websites.json";
import companyLogos from "../../data/projects/company-logos.json";

const websites: Record<string, string> = companyWebsites;
const logos: Record<string, { file: string; source: string }> = companyLogos;
const industryWebsites = new Map(industryCompanies.map(({ id, website }) => [id, website]));

function CompanyName({ relationship }: { relationship: ProjectCompanyRelationship }) {
  const { companyName, industryCompanyId } = relationship;
  const website = websites[companyName] ?? industryWebsites.get(industryCompanyId ?? "");
  const logo = website ? logos[new URL(website).hostname] : undefined;
  const initials = companyName.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

  return (
    <div className="project-company-name">
      {logo
        ? <Image className="project-company-logo" src={`/editorial/company-logos/${logo.file}`} alt="" width={44} height={28} unoptimized />
        : <div className="project-company-initials" aria-hidden="true">{initials}</div>}
      <p>{website ? <a href={website}>{companyName}</a> : companyName}</p>
    </div>
  );
}

export function ProjectRelationships({ groups }: { groups: [string, ProjectCompanyRelationship[]][] }) {
  return (
    <section className="project-ecosystem project-intel-section" aria-labelledby="ecosystem-heading">
      <div className="project-section-copy">
        <h2 id="ecosystem-heading"><LocalizedCopy en="Project relationships" zh="项目关系" /></h2>
      </div>
      {groups.length ? (
        <div className="project-ecosystem-grid">
          {groups.map(([role, relationships]) => (
            <section className="project-role-group" key={role}>
              <h3>{formatRole(role)}</h3>
              <ul>
                {relationships.map((relationship) => (
                  <li key={relationship.id}>
                    <CompanyName relationship={relationship} />
                    <IndustryEntryLink companyId={resolveProjectCompanyId(relationship.id, relationship.industryCompanyId)} companyName={relationship.companyName} />
                    <span><LocalizedCopy {...relationshipContextLabel(relationship)} /></span>
                    {relationship.sourceStatusText && <span>{relationship.sourceStatusText}</span>}
                    {relationship.roleDetail && <span>{relationship.roleDetail}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : <p><LocalizedCopy en="No company relationships are recorded." zh="暂无已记录的公司关系。" /></p>}
    </section>
  );
}
