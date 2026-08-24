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
import { DigitalAiFilters } from "./signal-filters";

export const metadata: Metadata = {
  title: "Digital & AI Signals",
  description:
    "Source-backed Digital and AI signals relevant to offshore wind engineering, operations and energy infrastructure.",
};

export default function DigitalAiPage() {
  const signals = getAllDigitalAiSignals();
  const options = getDigitalAiOptions();

  return (
    <main>
      <SiteHeader />

      <section className="digital-ai-hero" aria-labelledby="digital-ai-heading">
        <p className="eyebrow">Digital & AI Signals</p>
        <h1 id="digital-ai-heading">Digital signals for offshore wind systems.</h1>
        <p>
          A small, source-backed static collection of AI, digital twin,
          autonomous inspection, industrial software, forecasting and energy
          infrastructure developments with a direct offshore wind or wind-energy
          systems connection.
        </p>
        <dl className="digital-ai-hero-stats" aria-label="Digital and AI signal coverage">
          <div>
            <dt>Signals</dt>
            <dd>{getDigitalAiSignalCount()}</dd>
          </div>
          <div>
            <dt>Topics</dt>
            <dd>{options.topics.length}</dd>
          </div>
          <div>
            <dt>Source classes</dt>
            <dd>{options.sourceClasses.length}</dd>
          </div>
        </dl>
      </section>

      <DigitalAiFilters
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

      <section aria-labelledby="digital-ai-data-notice-heading">
        <h2 id="digital-ai-data-notice-heading">Data notice</h2>
        <p>
          Digital & AI Signals are static, source-backed records under
          `web/data/digital-ai/`. The website does not run collection, AI
          scoring, semantic search, a backend, a database, a scheduler or a CMS.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
