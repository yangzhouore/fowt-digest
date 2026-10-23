import type { Metadata } from "next";
import { SiteHeader } from "../../site-header";
import { SiteFooter } from "../../site-footer";
import { UKSystemGuide } from "../uk-system-guide";
import { CountryNavigation } from "../country-navigation";

export const metadata: Metadata = { title: "UK Floating Wind Industry Guide", description: "The UK floating offshore wind supply chain, project lifecycle, permissions, GB electricity and money flows." };
export default function UKIndustryPage() {
  return <main className="industry-page"><SiteHeader /><CountryNavigation active="uk" /><UKSystemGuide /><SiteFooter /></main>;
}
