/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const dataset = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "digital-ai", "signals.json"), "utf8"),
);

const useCaseDataset = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "data", "digital-ai", "use-cases.json"), "utf8",
));
const pathways = require("../data/digital-ai/pathways.json");
const readerNotes = require("../data/digital-ai/reader-notes.json");
const energyContext = require("../data/digital-ai/energy-context.json");
const { validateEnergyContext } = require("./validate-energy-context.js");

test("AI energy context preserves complete bilingual explanations and dated provenance", () => {
  assert.deepEqual(validateEnergyContext(energyContext, "2026-10-27"), []);
  assert.deepEqual(energyContext.fields.map((field) => field.id), ["compute", "weather", "wind", "hybrids", "grid", "floating", "procurement"]);
  assert.equal(energyContext.scenarioBasis, "editorial_conditional");
  assert.equal(energyContext.developments.find((item) => item.id === "iea-update").kind, "projection");
  assert.equal(energyContext.developments.find((item) => item.id === "google-contracts").kind, "company_contract");
});

for (const [name, mutate, expected] of [
  ["unsupported schema", (d) => d.schemaVersion = "other", /schema unsupported/],
  ["future review", (d) => d.reviewedOn = "2099-01-01", /review date invalid/],
  ["duplicate source", (d) => d.sources.push(d.sources[0]), /source ID missing\/duplicate/],
  ["credential URL", (d) => d.sources[0].url = "https://user:secret@example.com", /credential-free HTTPS/],
  ["impossible publication date", (d) => d.sources[0].publishedOn = "2026-02-30", /publication date invalid/],
  ["missing source scope", (d) => d.sources[0].scope = "", /scope required/],
  ["unknown source", (d) => d.fields[0].sourceIds = ["missing"], /unknown source/],
  ["missing Chinese explanation", (d) => d.fields[0].mechanism.zh = "", /bilingual text required/],
  ["missing developer context", (d) => delete d.fields[0].developer, /bilingual text required/],
  ["duplicate field ID", (d) => d.fields[1].id = d.fields[0].id, /invalid\/duplicate ID/],
  ["undated news", (d) => d.sources.find((s) => s.id === "edna-flex").publishedOn = null, /needs publication date/],
  ["unsupported news status", (d) => d.developments[0].kind = "proven_everywhere", /unsupported development kind/],
  ["scenario presented as forecast", (d) => d.scenarioBasis = "prediction", /must be editorial_conditional/],
  ["missing future condition", (d) => delete d.scenarios[0].requires, /bilingual text required/],
  ["broken application link", (d) => d.fields[1].relatedHref = "/digital-ai#missing", /invalid reading-context link/],
]) {
  test(`AI energy context rejects ${name}`, () => {
    const changed = structuredClone(energyContext);
    mutate(changed);
    assert.ok(validateEnergyContext(changed, "2026-10-27").some((error) => expected.test(error)));
  });
}

test("actual AI energy components render bilingual context, original sources and scenario limits", () => {
  for (const language of ["en", "zh"]) {
    const { EnergySystemOverview, EnergyOutlook } = readerLoader(language)("app/digital-ai/energy-system.tsx");
    const html = renderToStaticMarkup(React.createElement(React.Fragment, null,
      React.createElement(EnergySystemOverview), React.createElement(EnergyOutlook)));
    assert.ok(html.includes(language === "en" ? "AI uses energy." : "AI 消耗能源"));
    assert.ok(html.includes(language === "en" ? "not deployment forecasts" : "并非部署预测"));
    for (const source of energyContext.sources) assert.ok(html.includes(source.url));
    assert.ok(html.includes("950 TWh"));
    assert.ok(html.includes(language === "en" ? "not AI-only demand" : "不是 AI 单独用电量"));
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(ids.length, new Set(ids).size);
  }
});

// Load the actual static route/reader with framework shells substituted only.
function readerLoader(language = "en") {
  const cache = new Map();
  function load(file) {
    if (file.endsWith(".json")) return JSON.parse(fs.readFileSync(file, "utf8"));
    if (file.endsWith(".css")) return {};
    if (file.endsWith("/i18n/language-context.tsx")) return { useLanguage: () => ({ language }) };
    if (/\/site-(header|footer)\.tsx$/.test(file)) return { SiteHeader: () => null, SiteFooter: () => null };
    if (cache.has(file)) return cache.get(file);
    const context = { exports: {}, require: (name) => {
      if (name === "next/link") return function TestLink(props) { return React.createElement("a", props, props.children); };
      if (name === "next/navigation") return { notFound: () => { throw Error("not found"); } };
      if (!name.startsWith(".")) return require(name);
      let target = path.resolve(path.dirname(file), name).replaceAll("\\", "/");
      if (!path.extname(target)) target = [".ts", ".tsx", ".json"].map((ext) => target + ext).find(fs.existsSync);
      if (!target) throw Error(`Unresolved import ${name}`);
      return load(target);
    } };
    cache.set(file, context.exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, context, { filename: file });
    return context.exports;
  }
  return (relative) => load(path.resolve(__dirname, "..", relative).replaceAll("\\", "/"));
}

test("all existing Signals have static reader routes and unknown slugs are rejected", async () => {
  const route = readerLoader()("app/digital-ai/signals/[slug]/page.tsx");
  assert.equal(route.dynamicParams, false);
  assert.deepEqual(Array.from(route.generateStaticParams(), (item) => item.slug).sort(), dataset.signals.map((item) => item.slug).sort());
  for (const signal of dataset.signals) {
    const props = { params: Promise.resolve({ slug: signal.slug }) };
    assert.equal((await route.generateMetadata(props)).title, signal.title);
    const html = renderToStaticMarkup(await route.default(props));
    assert.ok(html.includes('id="signal-title"'));
    for (const id of signal.sourceIds) assert.ok(html.includes(dataset.sources.find((item) => item.sourceId === id).url));
  }
  await assert.rejects(() => route.default({ params: Promise.resolve({ slug: "unknown-signal" }) }), /not found/);
});

test("reader preserves record content and separates dates, editorial relevance and public-source boundaries in both languages", () => {
  const original = JSON.stringify(dataset);
  for (const language of ["en", "zh"]) {
    const { SignalReader } = readerLoader(language)("app/digital-ai/signal-reader.tsx");
    for (const signal of dataset.signals) {
      const sources = dataset.sources.filter((source) => signal.sourceIds.includes(source.sourceId));
      const html = renderToStaticMarkup(React.createElement(SignalReader, { signal: { ...signal, sources } }));
      const textMarkup = renderToStaticMarkup(React.createElement("span", null, signal.shortDescription)).slice(6, -7);
      assert.ok(html.includes(textMarkup), `${signal.id}: changed original summary`);
      assert.ok(html.includes(language === "zh" ? "已存编辑关联说明" : "Stored editorial relevance"));
      assert.ok(html.includes(language === "zh" ? "不提供论文全文" : "not full papers"));
      assert.ok(html.includes(language === "zh" ? "已存访问日期" : "Stored access date"));
      assert.ok(html.includes(language === "zh" ? "记录日期 / 时段" : "Record date / period"));
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
      assert.equal(new Set(ids).size, ids.length);
    }
  }
  assert.equal(JSON.stringify(dataset), original);
});

test("reader notes cover all 14 Signals without changing existing review provenance", () => {
  const notes = [...useCaseDataset.evidence, ...readerNotes.notes];
  assert.equal(new Set(notes.map((item) => item.signalId)).size, 14);
  assert.equal(notes.length, 14);
  for (const item of notes) {
    const signal = dataset.signals.find((record) => record.id === item.signalId);
    assert.ok(signal.sourceIds.includes(item.sourceId));
    assert.ok(item.claim.en && item.claim.zh);
  }
});

test("four pathways use bilingual design questions and collection-specific evidence coverage", () => {
  assert.equal(pathways.basis, "illustrative_comparison");
  assert.deepEqual(pathways.pathways.map((item) => item.id), ["land", "coastal", "offshore", "flexible"]);
  for (const item of pathways.pathways) {
    assert.equal(item.maturity, undefined);
    for (const field of ["title", "coverage", "location", "procurement", "continuity", "checks", "boundary"]) {
      assert.ok(item[field].en.trim());
      assert.match(item[field].zh, /[\u3400-\u9fff]/);
    }
    assert.equal(item.flow.length, 3);
    for (const step of item.flow) assert.ok(step.en && step.zh);
    for (const id of item.signalIds) {
      const context = pathways.context.find((entry) => entry.signalId === id);
      const signal = dataset.signals.find((entry) => entry.id === id);
      assert.ok(context && signal && signal.sourceIds.includes(context.sourceId));
    }
  }
  assert.deepEqual(pathways.pathways.filter((item) => !item.signalIds.length).map((item) => item.id), ["coastal", "offshore"]);
  assert.match(pathways.pathways.find((item) => item.id === "flexible").boundary.en, /Neither establishes a deployed/);
  assert.match(pathways.pathways.find((item) => item.id === "land").procurement.en, /different measures/);
});

test("practical cards cover all ten applications with complete bilingual workflows", () => {
  assert.equal(useCaseDataset.workflowBasis, "illustrative");
  const ids = useCaseDataset.cases.map((item) => item.id);
  assert.equal(new Set(ids).size, 10);
  assert.deepEqual([...ids].sort(), ["forecasting", "engineering", "vision", "planning", "control", "twin", "predictive", "autonomy", "cable", "grid"].sort());
  for (const item of useCaseDataset.cases) {
    for (const field of ["title", "problem", "user", "inputs", "method", "output", "decision", "limitation", "unknown"]) {
      for (const language of ["en", "zh"]) {
        assert.ok(item[field][language].trim().length > 0, `${item.id}.${field}.${language} missing`);
        if (language === "zh") assert.match(item[field][language], /[\u3400-\u9fff]/, `${item.id}.${field} needs Chinese copy`);
      }
    }
    assert.equal(item.maturity, undefined, "maturity belongs to dated evidence, not an application");
  }
});

test("card evidence resolves to the cited source of each existing Signal", () => {
  const evidence = new Map(useCaseDataset.evidence.map((entry) => [entry.signalId, entry]));
  assert.equal(evidence.size, useCaseDataset.evidence.length);
  const referenced = new Set();
  for (const item of useCaseDataset.cases) {
    assert.equal(new Set(item.signalIds).size, item.signalIds.length);
    if (item.featuredSignalId) assert.ok(item.signalIds.includes(item.featuredSignalId));
    for (const id of item.signalIds) {
      referenced.add(id);
      const record = evidence.get(id);
      assert.ok(record, `${item.id}: missing evidence ${id}`);
      const signal = dataset.signals.find((entry) => entry.id === id);
      assert.ok(signal, `unknown Signal ${id}`);
      assert.ok(signal.sourceIds.includes(record.sourceId), `${id}: unrelated source`);
      assert.ok(dataset.sources.some((source) => source.sourceId === record.sourceId));
      for (const language of ["en", "zh"]) assert.ok(record.claim[language].length > 20);
      assert.ok(["public_source", "stored_context"].includes(record.basis));
      if (record.basis === "public_source") assert.match(record.reviewedDate, /^\d{4}-\d{2}-\d{2}$/);
      else assert.equal(record.reviewedDate, null, "inaccessible sources cannot claim a fresh review");
    }
  }
  assert.deepEqual([...referenced].sort(), [...evidence.keys()].sort());
});

test("unsupported areas remain empty and EPROA retains its verification boundary", () => {
  assert.deepEqual(useCaseDataset.cases.filter((item) => !item.signalIds.length).map((item) => item.id).sort(), ["planning", "vision"]);
  for (const item of useCaseDataset.cases.filter((item) => !item.signalIds.length)) assert.equal(item.featuredSignalId, null);
  const eproa = useCaseDataset.evidence.find((entry) => entry.signalId === "eproa-ai-digital-platform-floating-wind-om");
  assert.equal(eproa.basis, "stored_context");
  assert.match(eproa.claim.en, /could not be rechecked/);
  assert.match(useCaseDataset.cases.find((item) => item.id === "predictive").limitation.en, /does not establish remaining life/);
});

const TOPICS = new Set([
  "ai_for_engineering",
  "digital_twin",
  "autonomous_om_robotics",
  "industrial_software_digital_engineering",
  "smart_grid_forecasting",
  "ai_infrastructure_data_centres",
]);

test("Digital and AI MVP has a small source-backed signal set", () => {
  assert.ok(dataset.signals.length >= 12);
  assert.ok(dataset.signals.length <= 20);
  assert.equal(dataset.sources.length, dataset.signals.length);
});

test("Digital and AI signals cover accepted taxonomy and source diversity", () => {
  const topics = new Set(dataset.signals.map((signal) => signal.topic));
  const sourceClasses = new Set(dataset.sources.map((source) => source.sourceClass));
  assert.ok(topics.size >= 4);
  assert.ok(sourceClasses.size >= 3);
  for (const topic of topics) {
    assert.ok(TOPICS.has(topic), `unsupported topic ${topic}`);
  }
});

test("Digital and AI slugs are unique and route-safe", () => {
  const slugs = dataset.signals.map((signal) => signal.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
});

test("Digital and AI source links resolve through stored source IDs", () => {
  const sourceIds = new Set(dataset.sources.map((source) => source.sourceId));
  for (const signal of dataset.signals) {
    assert.ok(signal.sourceIds.length > 0, `${signal.id} missing sources`);
    for (const sourceId of signal.sourceIds) {
      assert.ok(sourceIds.has(sourceId), `${signal.id} references missing ${sourceId}`);
    }
  }
});

test("Digital and AI signals state a direct sector connection", () => {
  for (const signal of dataset.signals) {
    assert.ok(signal.connectionToFowt.length > 40, `${signal.id} has weak connection text`);
    assert.doesNotMatch(signal.connectionToFowt.toLowerCase(), /generic ai news/);
  }
});
