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
import { LocalizedCopy } from "../i18n/localized-copy";

export const metadata: Metadata = {
  title: "Digital & AI",
  description:
    "Understand how AI, wind, solar, storage, grids and computing connect, with dated evidence and conditional future pathways.",
};

export default function DigitalAiPage() {
  const signals = getAllDigitalAiSignals();
  const options = getDigitalAiOptions();

  return (
    <main className="digital-ai-page">
      <SiteHeader />

      <section className="digital-ai-hero" aria-labelledby="digital-ai-heading">
        <p className="eyebrow"><LocalizedCopy en="Digital & AI" zh="数字化与 AI" /></p>
        <h1 id="digital-ai-heading">AI <span aria-hidden="true">×</span> <LocalizedCopy en="Energy" zh="能源" /></h1>
        <p><LocalizedCopy en="Understand the system. Explore the work. Check the evidence." zh="理解系统，探索应用，查验证据。" /></p>
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
