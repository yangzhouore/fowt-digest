"use client";

import { useMemo, useState } from "react";
import type {
  DigitalAiMaturity,
  DigitalAiSignalWithSources,
  DigitalAiTopic,
} from "../../data/digital-ai-adapter";

type SignalListItem = DigitalAiSignalWithSources & {
  topicLabel: string;
  maturityLabel: string;
};

type Option<T extends string> = {
  value: T;
  label: string;
};

type DigitalAiFiltersProps = {
  signals: SignalListItem[];
  topics: Option<DigitalAiTopic>[];
  maturities: Option<DigitalAiMaturity>[];
  regions: string[];
};

export function DigitalAiFilters({
  signals,
  topics,
  maturities,
  regions,
}: DigitalAiFiltersProps) {
  const [topic, setTopic] = useState("All");
  const [maturity, setMaturity] = useState("All");
  const [region, setRegion] = useState("All");

  const filteredSignals = useMemo(
    () =>
      signals.filter((signal) => {
        return (
          (topic === "All" || signal.topic === topic) &&
          (maturity === "All" || signal.maturity === maturity) &&
          (region === "All" || signal.region === region)
        );
      }),
    [maturity, region, signals, topic],
  );

  const hasFilters = topic !== "All" || maturity !== "All" || region !== "All";

  return (
    <>
      <section className="digital-ai-filter-band" aria-labelledby="digital-ai-filter-heading">
        <div className="digital-ai-filter-heading">
          <h2 id="digital-ai-filter-heading">Browse signals</h2>
          <p>
            {filteredSignals.length} {filteredSignals.length === 1 ? "signal" : "signals"}
          </p>
        </div>
        <div className="digital-ai-filter-controls">
          <label>
            <span>Topic</span>
            <select value={topic} onChange={(event) => setTopic(event.target.value)}>
              <option value="All">All</option>
              {topics.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Maturity</span>
            <select value={maturity} onChange={(event) => setMaturity(event.target.value)}>
              <option value="All">All</option>
              {maturities.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              <option>All</option>
              {regions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        {hasFilters ? (
          <button
            className="text-button digital-ai-clear-filters"
            type="button"
            onClick={() => {
              setTopic("All");
              setMaturity("All");
              setRegion("All");
            }}
          >
            Clear filters
          </button>
        ) : null}
      </section>

      <section aria-labelledby="digital-ai-list-heading">
        <h2 id="digital-ai-list-heading">Signal records</h2>
        {filteredSignals.length > 0 ? (
          <ol className="digital-ai-list">
            {filteredSignals.map((signal) => (
              <li key={signal.id}>
                <article className="digital-ai-signal">
                  <div className="digital-ai-signal-heading">
                    <p className="digital-ai-kicker">
                      {signal.topicLabel} / {signal.maturityLabel}
                    </p>
                    <h3>{signal.title}</h3>
                    <p className="digital-ai-meta">
                      {signal.dateLabel} / {signal.country} / {signal.region}
                    </p>
                  </div>

                  <div className="digital-ai-signal-copy">
                    <p>{signal.shortDescription}</p>
                    <dl className="digital-ai-explainers">
                      <div>
                        <dt>FOWT connection</dt>
                        <dd>{signal.connectionToFowt}</dd>
                      </div>
                      <div>
                        <dt>Why it matters</dt>
                        <dd>{signal.whyItMatters}</dd>
                      </div>
                    </dl>
                    <ul className="digital-ai-tags" aria-label="Technology tags">
                      {signal.technologyTags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="digital-ai-source-block">
                    <p>{signal.sources.map((source) => source.publisher).join(" / ")}</p>
                    {signal.sources.map((source) => (
                      <a key={source.sourceId} href={source.url}>
                        Original source
                      </a>
                    ))}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <p className="archive-search-empty">No signals match these filters.</p>
        )}
      </section>
    </>
  );
}
