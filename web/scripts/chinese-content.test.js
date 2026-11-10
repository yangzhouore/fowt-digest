/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const test = require("node:test");
const ts = require("typescript");
const { createElement } = require("react");

const sourcePath = path.resolve(__dirname, "../app/i18n/render-content.tsx");
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
new Function("require", "exports", "module", compiled)(createRequire(sourcePath), loaded.exports, loaded);
const { localizeContent, translateContentText } = loaded.exports;

test("Chinese presentation preserves controlled values, callbacks and React keys", () => {
  const onChange = () => {};
  const original = createElement("select", { value: "United Kingdom", onChange, key: "country" },
    createElement("option", { value: "United Kingdom", key: "uk" }, "United Kingdom"));
  const rendered = localizeContent(original, "zh");
  assert.equal(rendered.props.value, "United Kingdom");
  assert.equal(rendered.props.onChange, onChange);
  assert.equal(rendered.key, original.key);
  assert.equal(rendered.props.children.props.value, "United Kingdom");
  assert.equal(rendered.props.children.props.children, "英国");
  assert.equal(localizeContent(original, "en").props.children.props.children, "United Kingdom");
});

test("original news, paper content, source citations and explicit exclusions stay unchanged", () => {
  for (const props of [
    { className: "homepage-paper-list" }, { className: "engineering-highlight-list" },
    { className: "context-stored-excerpt" }, { translate: "no" },
    { href: "https://example.com/source" },
  ]) {
    const original = createElement(props.href ? "a" : "p", props, "Current assessment");
    assert.equal(localizeContent(original, "zh"), original);
  }
});

test("translation keeps uncertainty, unknown labels and source whitespace", () => {
  assert.equal(translateContentText("\n Capacity ", "zh"), "\n 容量 ");
  assert.equal(translateContentText("NOT VERIFIED", "zh"), "未核实");
  assert.equal(translateContentText("UNKNOWN", "zh"), "未知");
  assert.match(translateContentText("Baseline surveys and scoping are underway, while final design is not verified.", "zh"), /尚未核实/);
  assert.match(translateContentText("Historical package awards: Kværner foundations/marine, Siemens Gamesa turbines/service, UK JDR cables, Subsea 7 cable installation. Historic service term is not assumed still active.", "zh"), /不能据此假定.*仍然有效/);
  assert.equal(translateContentText("a-new-source-identifier", "zh"), "a-new-source-identifier");
});

test("stored Chinese copy has no unresolved draft markers", () => {
  const dictionary = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../app/i18n/content-zh.json"), "utf8"));
  for (const [english, chinese] of Object.entries(dictionary)) {
    assert.ok(english.trim() && typeof chinese === "string" && chinese.trim());
    assert.doesNotMatch(chinese, /ZXQ\d+QXZ|\[\[\[\d+\]\]\]/);
  }
});

test("all current Project assessments and Digital evidence narratives have stored Chinese copy", () => {
  const dictionary = require("../app/i18n/content-zh.json");
  const projects = require("../data/projects/projects.json");
  const signals = require("../data/digital-ai/signals.json");
  for (const project of projects.projects) {
    const text = project.intelligence?.currentAssessment;
    if (text) assert.match(dictionary[text] ?? "", /[\u3400-\u9fff]/, project.id);
  }
  for (const signal of signals.signals) {
    for (const field of ["shortDescription", "connectionToFowt", "whyItMatters"]) {
      assert.match(dictionary[signal[field]] ?? "", /[\u3400-\u9fff]/, `${signal.id}: ${field}`);
    }
  }
});
