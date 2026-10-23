/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const data = require("./uk-system-guide.json");
const moduleExports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "uk-guide-validator.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: moduleExports, URL });
const validate = (value) => moduleExports.validateUKGuide(value, "2026-10-22");
const clone = () => JSON.parse(JSON.stringify(data));

test("accepted bilingual guide retains all topics, staged decisions and source scopes", () => {
  assert.deepEqual(Array.from(validate(data)), []);
  for (const language of ["en", "zh"]) {
    assert.equal(data.topics[0].content[language].find((b) => b.type === "table").rows.length, 9);
    assert.equal(data.topics[2].content[language].find((b) => b.type === "table").rows.length, 17);
    assert.equal(data.topics[18].content[language].find((b) => b.type === "table").rows.length, 23);
  }
});

for (const [name, mutate, expected] of [
  ["missing topic", (d) => d.topics.pop(), /topics 1–22/],
  ["duplicate topic", (d) => d.topics[1] = d.topics[0], /topics 1–22/],
  ["missing Chinese explanation", (d) => d.topics[6].content.zh = [], /bilingual content/],
  ["unknown evidence label", (d) => d.topics[3].kinds = ["confirmed-supply-contract"], /evidence label/],
  ["source-free claim", (d) => d.topics[17].sourceIds = [], /Source-free/],
  ["broken source reference", (d) => d.topics[17].sourceIds.push("unknown"), /Missing source/],
  ["unsupported source scope", (d) => d.sources[0].supportsTopics = [], /claim scope/],
  ["missing supported claim", (d) => d.sources[0].claimScope = "", /claimScope/],
  ["duplicate source", (d) => d.sources.push(d.sources[0]), /Duplicate source/],
  ["credential-bearing URL", (d) => d.sources[0].url = "https://user:password@example.com/", /credential-free/],
  ["insecure source URL", (d) => d.sources[0].url = "http://example.com/", /HTTPS/],
  ["invalid document date", (d) => d.sources[0].documentDate = "2026-02-30", /document date/],
  ["future review", (d) => d.reviewedOn = "2099-01-01", /future/],
  ["lost lifecycle stage", (d) => d.topics[2].content.en.find((b) => b.type === "table").rows.pop(), /17 stages/],
  ["lost lifecycle decision field", (d) => d.topics[2].content.en.find((b) => b.type === "table").headers.pop(), /decision fields/],
  ["lost power route", (d) => d.topics[5].content.zh = d.topics[5].content.zh.filter((b) => b.type !== "table"), /physical power route/],
  ["lost analysis question", (d) => d.topics[21].content.zh.find((b) => b.type === "list").items.pop(), /15 analysis questions/],
  ["unregistered inline citation", (d) => d.topics[0].content.en.find((b) => b.type === "table").rows[0][4] += " [Unreviewed](https://example.com)", /Inline source/],
  ["unknown block", (d) => d.topics[0].content.en.push({ type: "raw-html", text: "<script>bad</script>" }), /Unknown block/],
  ["damaged Chinese encoding", (d) => d.topics[0].content.zh[0].text = "?????", /Corrupted content encoding/],
  ["missing organisation evidence", (d) => d.organisationEvidence[0].sourceIds = [], /Organisation requires/],
  ["invented contract label", (d) => d.organisationEvidence[0].kind = "current-contracted-supplier", /organisation evidence kind/],
  ["reordered organisation claims", (d) => d.topics[18].content.en.find((b) => b.type === "table").rows.reverse(), /row and evidence identity/],
]) test(`guide rejects ${name}`, () => { const d = clone(); mutate(d); assert.match(validate(d).join("\n"), expected); });

test("source dates are not substituted for project assessment dates", () => {
  const undated = data.sources.filter((source) => source.documentDate === null);
  assert.ok(undated.length > 0);
  assert.ok(undated.every((source) => source.reviewedOn === "2026-10-22"));
  assert.ok(data.sources.some((source) => source.documentDate === "2026-10-19" && source.publisher === "Sumitomo Electric"));
  assert.equal(Object.hasOwn(data, "assessmentReviewedOn"), false);
});

test("Industry copy contains no encoding replacement or question-mark placeholders", () => {
  for (const file of ["page.tsx", "uk-system-guide.tsx"]) {
    const source = fs.readFileSync(path.join(__dirname, "../../app/industry", file), "utf8");
    assert.doesNotMatch(source, /\?{3,}|\uFFFD/);
  }
});
