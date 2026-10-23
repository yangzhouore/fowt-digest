import Link from "next/link";
import { LocalizedCopy as Copy } from "../i18n/localized-copy";
import { internationalStyles } from "./international-styles";

export function CountryNavigation({ active = "overview" }: { active?: string }) {
  return <div className="industry-international"><style>{internationalStyles}</style><nav className="country-nav" aria-label="Industry country guides">
    <Link href="/industry" aria-current={active === "overview" ? "page" : undefined}><Copy en="Compare countries" zh="国家比较" /></Link>
    {[["uk", "United Kingdom", "英国"], ["germany", "Germany", "德国"], ["norway", "Norway", "挪威"], ["china", "China", "中国"]].map(([slug, en, zh]) => <Link key={slug} href={`/industry/${slug}`} aria-current={active === slug ? "page" : undefined}><Copy en={en} zh={zh} /></Link>)}
    <Link href="/industry#industry-catalogue"><Copy en="Company directory" zh="企业目录" /></Link>
  </nav></div>;
}
