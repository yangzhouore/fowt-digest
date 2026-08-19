import type { Metadata } from "next";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { HomepageWeeklyBriefing } from "./homepage-weekly-briefing";
import { getAllDigests } from "../data/digest-adapter";
import { getAllEngineeringBriefings } from "../data/engineering-briefing-adapter";
import { industryCompanyCount, industryStages } from "../data/industry/industry-map";

export const metadata: Metadata = {
  title: "Home",
  description:
    "A weekly floating offshore wind briefing and research digest built from static source-backed data.",
};

export default function Home() {
  const engineeringBriefings = getAllEngineeringBriefings();
  const engineeringBySlug = new Map(
    engineeringBriefings.map((briefing) => [briefing.slug, briefing]),
  );
  const homepageEditions = getAllDigests().flatMap((digest) => {
    const engineeringBriefing = engineeringBySlug.get(digest.slug);
    if (!engineeringBriefing) {
      return [];
    }

    return [{ digest, engineeringBriefing }];
  });

  return (
    <main>
      <SiteHeader />

      <HomepageWeeklyBriefing
        editions={homepageEditions}
        industryCompanyCount={industryCompanyCount}
        industryStageCount={industryStages.length}
      />

      <SiteFooter />
    </main>
  );
}
