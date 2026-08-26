import type { Metadata } from "next";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import {
  formatDigitalAiMaturity,
  formatDigitalAiTopic,
  getAllDigitalAiSignals,
  getDigitalAiOptions,
  getDigitalAiSignalCount,
} from "../../data/digital-ai-adapter";
import { DigitalAiExperience } from "./signal-filters";

export const metadata: Metadata = {
  title: "Digital & AI",
  description:
    "How AI could change offshore wind, and how offshore wind could power AI infrastructure.",
};

export default function DigitalAiPage() {
  const signals = getAllDigitalAiSignals();
  const options = getDigitalAiOptions();

  return (
    <main>
      <SiteHeader />

      <section className="digital-ai-hero" aria-labelledby="digital-ai-heading">
        <p className="eyebrow">Digital & AI</p>
        <h1 id="digital-ai-heading">AI <span aria-hidden="true">×</span> Offshore Wind</h1>
        <p>Two forces reshaping each other.</p>
      </section>

      <DigitalAiExperience
        signalCount={getDigitalAiSignalCount()}
        signals={signals.map((signal) => ({
          ...signal,
          topicLabel: formatDigitalAiTopic(signal.topic),
          maturityLabel: formatDigitalAiMaturity(signal.maturity),
        }))}
        topics={options.topics.map((topic) => ({
          value: topic,
          label: formatDigitalAiTopic(topic),
        }))}
        maturities={options.maturities.map((maturity) => ({
          value: maturity,
          label: formatDigitalAiMaturity(maturity),
        }))}
        regions={options.regions}
      />

      <SiteFooter />
    </main>
  );
}
