import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { countryGuides } from "../../../data/industry/country-guides";
import { SiteHeader } from "../../site-header";
import { SiteFooter } from "../../site-footer";
import { CountryNavigation } from "../country-navigation";
import { CountrySystemGuide } from "../country-system-guide";

export const dynamicParams = false;
export function generateStaticParams() { return countryGuides.map((g) => ({ country: g.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params; const guide = countryGuides.find((g) => g.slug === country);
  return guide ? { title: `${guide.name.en} Floating Wind Industry Guide`, description: guide.summary.en } : {};
}
export default async function CountryIndustryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params; const guide = countryGuides.find((g) => g.slug === country);
  if (!guide) notFound();
  return <main className="industry-page"><SiteHeader /><CountryNavigation active={country} /><CountrySystemGuide guide={guide} /><SiteFooter /></main>;
}
