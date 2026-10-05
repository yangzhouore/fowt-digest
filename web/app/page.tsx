import type { Metadata } from "next";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { HomepageWeeklyBriefing } from "./homepage-weekly-briefing";
import { getAllDigests } from "../data/digest-adapter";
import { getAllEngineeringBriefings } from "../data/engineering-briefing-adapter";

export const metadata: Metadata = {
  title: "Home",
  description:
    "A weekly floating offshore wind briefing and research digest built from static source-backed data.",
};

export default function Home() {
  const digest = getAllDigests()[0];
  const engineeringBriefing = getAllEngineeringBriefings()[0];
  const homepageEditions = digest && engineeringBriefing
    ? [{ digest, engineeringBriefing }]
    : [];

  return (
    <main>
      <SiteHeader />

      <HomepageWeeklyBriefing editions={homepageEditions} />

      <SiteFooter />
    </main>
  );
}
