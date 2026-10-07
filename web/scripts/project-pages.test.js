/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectDataset = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "projects", "projects.json"), "utf8"),
);

const PROJECT_STATUSES = new Set([
  "concept_early_development",
  "lease_or_area_awarded",
  "development",
  "consented",
  "pre_construction",
  "under_construction",
  "commissioning",
  "operational",
  "paused",
  "cancelled",
  "decommissioned",
]);

test("project dataset retains the accepted 48-project baseline", () => {
  assert.equal(projectDataset.projects.length, 48);
});

test("project slugs are unique and route-safe", () => {
  const slugs = projectDataset.projects.map((project) => project.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
});

test("project lifecycle values are supported by the page taxonomy", () => {
  const statuses = new Set(
    projectDataset.projects.map((project) => project.normalizedStatus),
  );
  for (const status of statuses) {
    assert.ok(PROJECT_STATUSES.has(status), `unsupported project status ${status}`);
  }
  assert.ok(statuses.has("operational"));
  assert.ok(statuses.has("development"));
  assert.ok(statuses.has("lease_or_area_awarded"));
  assert.ok(statuses.has("cancelled"));
});

test("representative detail routes have relationships and sources", () => {
  const sampleSlugs = [
    "hywind-tampen",
    "green-volt",
    "canopy-offshore-wind-ocs-p-0561",
    "haiyou-guanlan",
    "goto-offshore-wind-farm",
    "campionwind",
  ];

  for (const slug of sampleSlugs) {
    const project = projectDataset.projects.find((item) => item.slug === slug);
    assert.ok(project, `missing project ${slug}`);
    assert.ok(project.sourceIds.length > 0, `${slug} missing project sources`);
    assert.ok(
      projectDataset.projectCompanyRelationships.some(
        (relationship) => relationship.projectId === project.id,
      ),
      `${slug} missing project-company relationships`,
    );
  }
});

test("project filters have meaningful region country and status dimensions", () => {
  const regions = new Set(projectDataset.projects.map((project) => project.region));
  const countries = new Set(projectDataset.projects.map((project) => project.country));
  const statuses = new Set(
    projectDataset.projects.map((project) => project.normalizedStatus),
  );

  assert.ok(regions.size >= 3);
  assert.ok(countries.size >= 10);
  assert.ok(statuses.size >= 6);
});

function loadProjectAdapter(dataset = projectDataset) {
  const ts = require("typescript");
  const vm = require("node:vm");
  const { createRequire } = require("node:module");
  const adapterPath = path.join(__dirname, "..", "data", "project-adapter.ts");
  const compiled = ts.transpileModule(fs.readFileSync(adapterPath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const adapterRequire = createRequire(adapterPath);
  const context = {
    exports: {},
    require: (name) => name === "./projects/projects.json" ? dataset : adapterRequire(name),
  };
  vm.runInNewContext(compiled.outputText, context);
  return context.exports;
}

const overviewAdapter = loadProjectAdapter();

test("overview preserves every project and its original assessment, watchpoints and latest recorded event", () => {
  const overview = overviewAdapter.getProjectIndexItems();
  assert.equal(overview.length, projectDataset.projects.length);
  for (const item of overview) {
    const original = projectDataset.projects.find((p) => p.id === item.id);
    assert.equal(item.normalizedStatus, original.normalizedStatus);
    assert.equal(item.capacityMw, original.capacityMw);
    assert.equal(item.assessment, original.intelligence.currentAssessment);
    assert.equal(JSON.stringify(item.watchpoints), JSON.stringify(original.intelligence.watchpoints));
    assert.equal(item.nextSignal, original.intelligence.watchpoints[0].split(":")[0]);
    const events = projectDataset.timelineEvents.filter((e) => e.projectId === item.id).sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
    assert.equal(item.latestMilestone?.title, events.at(-1)?.title);
    assert.equal(item.latestMilestone?.date, events.at(-1)?.date);
  }
});

test("overview keeps explicit FID evidence independent of operational or pre-construction lifecycle", () => {
  const items = overviewAdapter.getProjectIndexItems();
  assert.equal(items.find((p) => p.id === "hywind-tampen").fid, "confirmed");
  assert.equal(items.find((p) => p.id === "hywind-scotland").fid, "not_verified");
  assert.equal(items.find((p) => p.id === "green-volt").fid, "not_verified");
  assert.equal(items.find((p) => p.id === "campionwind").fid, "not_reached");
});

test("overview readiness covers six gates without changing recorded qualitative states", () => {
  for (const item of overviewAdapter.getProjectIndexItems()) {
    assert.equal(item.readiness.length, 6);
    const original = projectDataset.projects.find((p) => p.id === item.id);
    for (const gate of item.readiness) {
      assert.ok(overviewAdapter.readinessStates.includes(gate.state));
      if (item.id !== "green-volt") {
        const recorded = original.intelligence.currentGates.find((g) => g.startsWith(`${gate.area} - `));
        assert.equal(recorded, `${gate.area} - ${gate.state}: ${gate.evidence}`);
      }
    }
  }
  const greenVolt = overviewAdapter.getProjectIndexItems().find((p) => p.id === "green-volt");
  assert.equal(greenVolt.readiness.find((g) => g.area === "Procurement").state, "UNKNOWN");
  assert.match(greenVolt.readiness.find((g) => g.area === "Revenue").evidence, /offtake is unresolved/);
  assert.equal(JSON.stringify(greenVolt.unstructuredGates), JSON.stringify(projectDataset.projects.find((p) => p.id === "green-volt").intelligence.currentGates));
});

test("construction and commissioning without intelligence retain unknown evidence instead of inferred FID", () => {
  const projects = ["under_construction", "commissioning"].map((status) => ({
    ...projectDataset.projects[0], id: status, slug: status, normalizedStatus: status, intelligence: undefined,
  }));
  const adapter = loadProjectAdapter({ sources: [], projects, projectCompanyRelationships: [], timelineEvents: [] });
  for (const item of adapter.getProjectIndexItems()) {
    assert.equal(item.fid, "unknown");
    assert.equal(item.nextSignal, null);
    assert.equal(item.latestMilestone, null);
    assert.ok(item.readiness.every((gate) => gate.state === "UNKNOWN"));
  }
});

test("all 48 supply chains retain six categories, cable and anchor sub-roles, and valid provenance", () => {
  const sources = new Map(projectDataset.sources.map((s) => [s.sourceId, s]));
  for (const project of overviewAdapter.getProjectIndexItems()) {
    assert.equal(project.supplyChain.map((c) => c.key).join(","), "owner,turbine,platform,cable,mooring,installation");
    assert.equal(project.supplyChain.find((c) => c.key === "cable").groups.map((g) => g.label).join(","), "Dynamic Cable,Inter-array Cable,Export Cable");
    assert.equal(project.supplyChain.find((c) => c.key === "mooring").groups.length, 2);
    for (const category of project.supplyChain) for (const group of category.groups) for (const entry of group.entries) {
      const original = projectDataset.projectCompanyRelationships.find((r) => r.id === entry.id);
      assert.equal(entry.status, original.status);
      assert.equal(entry.detail, original.roleDetail);
      assert.equal(entry.scope, original.sourceStatusText);
      assert.ok(entry.sources.length);
      for (const source of entry.sources) assert.equal(source.url, sources.get(source.sourceId).url);
    }
  }
});

test("role context preserves ownership history without turning relationship status into a procurement stage", () => {
  const label = (role, status) => overviewAdapter.relationshipContextLabel({ role, status }).en;
  assert.equal(label("developer_owner", "active"), "Current owner / developer");
  assert.equal(label("developer_owner", "past"), "Former / historical owner or developer");
  for (const role of ["wind_turbine_oem", "floating_platform_technology_provider", "fabrication", "mooring", "feed", "platform_engineering"]) {
    assert.equal(label(role, "announced"), "Announced role");
    assert.equal(label(role, "active"), "Recorded role");
    assert.equal(label(role, "past"), "Historical role");
    assert.equal(label(role, "unknown"), "Relationship status unknown");
  }
});

test("representative role renders keep selected, contracted, installed and historical engineering scopes distinct", () => {
  const html = renderOverview("en");
  const row = (id) => {
    const start = html.indexOf(`aria-labelledby="name-${id}"`);
    assert.ok(start > 0);
    return html.slice(start, html.indexOf("</article>", start));
  };
  assert.match(row("hywind-tampen"), /Installed configuration; original model source retained/);
  assert.match(row("hywind-tampen"), /Historical awarded scope; not an ongoing installation claim/);
  assert.match(row("windfloat-atlantic"), /WindFloat T design, TEAM execution support and O&amp;M services/);
  assert.match(row("pentland-floating-offshore-wind-farm"), /Selected technology/);
  assert.match(row("pentland-floating-offshore-wind-farm"), /manufacturing award not verified/);
  assert.match(row("marramwind"), /Current owner \/ developer/);
  assert.match(row("marramwind"), /Former \/ historical owner or developer/);
  for (const id of ["canopy-offshore-wind-ocs-p-0561", "firefly-floating-wind"]) {
    assert.match(row(id), /Current: N\/A — not verified/);
    assert.doesNotMatch(row(id), /Current owner \/ developer/);
  }
  const green = row("green-volt").split("Verified Project Roles")[1];
  assert.doesNotMatch(green, /<strong>Worley<\/strong>/); // FEED source citations do not create a component supplier entry.
  assert.match(green, /N\/A — not verified/);
  assert.match(row("hibiki-floating-demonstrator"), /Installed turbine technology; manufacturing contract not verified/);
  assert.match(row("med-wind"), /Historical FEED only; current supply decision not verified/);
  assert.match(row("culzean-demo-floating-wind"), /Contracted foundation delivery; completion not verified/);
  assert.match(row("golden-state-wind-ocs-p-0564"), /Current owner \/ developer/);
  assert.match(row("golden-state-wind-ocs-p-0564"), /cancellation remains conditional/);
});

test("supply-chain view does not infer roles from project facts, generic EPCI, FEED or invalid evidence", () => {
  const original = projectDataset.projectCompanyRelationships[0];
  const relationships = ["epci", "feed", "marine_installation"].map((role) => ({ ...original, role, sourceIds: role === "marine_installation" ? ["invalid"] : original.sourceIds }));
  const view = overviewAdapter.buildSupplyChain(relationships);
  assert.ok(view.every((category) => category.groups.every((group) => group.entries.length === 0)));
  const projects = overviewAdapter.getProjectIndexItems();
  assert.ok(projects.find((p) => p.id === "muir-mhor").developers.every((name) => name !== "Vattenfall"));
  assert.ok(projects.find((p) => p.id === "stromar-offshore-wind").developers.every((name) => !["Orsted", "BlueFloat Energy"].includes(name)));
  assert.equal(projects.find((p) => p.id === "canopy-offshore-wind-ocs-p-0561").developers.length, 0);
});

function renderOverview(language) {
  const ts = require("typescript");
  const vm = require("node:vm");
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const file = path.join(__dirname, "..", "app", "projects", "project-filters.tsx");
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const context = { exports: {}, require: (name) => {
    if (name === "../i18n/language-context") return { useLanguage: () => ({ language }) };
    if (name === "next/link") return function MockLink(props) { return React.createElement("a", props, props.children); };
    return require(name);
  } };
  vm.runInNewContext(compiled.outputText, context);
  const options = overviewAdapter.getProjectOptions();
  return renderToStaticMarkup(React.createElement(context.exports.ProjectFilters, {
    projects: overviewAdapter.getProjectIndexItems(), ...options,
    statuses: options.statuses.map((value) => ({ value, label: overviewAdapter.formatStatus(value) })),
    readinessAreas: overviewAdapter.readinessAreas, readinessStates: overviewAdapter.readinessStates,
  }));
}

test("English and Chinese overview render all supply categories, missing roles, historical labels and project links", () => {
  for (const language of ["en", "zh"]) {
    const html = renderOverview(language);
    assert.equal((html.match(/data-supply-category=/g) ?? []).length, 48 * 6);
    assert.match(html, language === "en" ? /N\/A — not verified/ : /N\/A — 未核实/);
    assert.match(html, language === "en" ? /Verified Project Roles/ : /已核实的项目角色/);
    assert.match(html, language === "en" ? /Former \/ historical owner or developer/ : /前任 \/ 历史业主或开发商/);
    assert.match(html, /data-relationship-status="past"/);
    for (const project of projectDataset.projects) assert.ok(html.includes(`href="/projects/${project.slug}"`));
    assert.ok(html.includes("https://www.smfl.co.jp/news/assets/250422.pdf"));
    const canopy = html.slice(html.indexOf('aria-labelledby="name-canopy-'), html.indexOf('aria-labelledby="name-celtic-', html.indexOf('aria-labelledby="name-canopy-')));
    assert.ok(canopy.includes(language === "en" ? "Current: N/A — not verified" : "当前: N/A — 未核实"));
  }
});
