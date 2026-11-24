import type { Metadata } from "next";
import { HomepageWeeklyBriefing } from "./homepage-weekly-briefing";
import { getLatestBriefingPreview } from "./briefing-weeks";
import { getAllDigests } from "../data/digest-adapter";
import { getAllEngineeringBriefings } from "../data/engineering-briefing-adapter";

export const metadata: Metadata = {
  title: "Home",
  description:
    "A weekly floating offshore wind briefing and research digest built from static source-backed data.",
};

export default function Home() {
  const preview = getLatestBriefingPreview(getAllEngineeringBriefings(), getAllDigests());
  return (
    <main>

      <HomepageWeeklyBriefing preview={preview} />

    </main>
  );
}
