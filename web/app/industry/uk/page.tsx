import { localizeServerContent } from "../../i18n/server-content";
import type { Metadata } from "next";
import { UKSystemGuide } from "../uk-system-guide";
import { CountryNavigation } from "../country-navigation";

export const metadata: Metadata = { title: "UK Floating Wind Industry Guide", description: "The UK floating offshore wind supply chain, project lifecycle, permissions, GB electricity and money flows." };
export default function UKIndustryPage() {
  return localizeServerContent(<main className="industry-page"><CountryNavigation active="uk" /><UKSystemGuide /></main>);
}
