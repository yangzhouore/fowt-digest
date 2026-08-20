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

test("project index loads accepted M10C project count", () => {
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
