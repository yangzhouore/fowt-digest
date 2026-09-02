/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  validateStaticProjects,
} = require("./validate-static-projects.js");

test("valid project dataset fixture passes", () => {
  const fixture = createFixture();

  assert.deepEqual(runValidation(fixture), []);
});

test("duplicate project IDs fail", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.projects.push({ ...dataset.projects[0], slug: "other-slug" });
    },
  });

  assertHasError(fixture, "duplicate project id");
});

test("duplicate project slugs fail", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.projects.push({ ...dataset.projects[0], id: "other-project" });
    },
  });

  assertHasError(fixture, "duplicate project slug");
});

test("unsupported project status fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.projects[0].normalizedStatus = "nearly_ready";
    },
  });

  assertHasError(fixture, "normalizedStatus has unsupported value nearly_ready");
});

test("malformed source record fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      delete dataset.sources[0].publisher;
    },
  });

  assertHasError(fixture, "publisher must be a non-empty string");
});

test("relationship without provenance fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.projectCompanyRelationships[0].sourceIds = [];
    },
  });

  assertHasError(fixture, "sourceIds must contain at least one source ID");
});

test("timeline event without provenance fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.timelineEvents[0].factClaims = [];
    },
  });

  assertHasError(fixture, "factClaims must be a non-empty array");
});

test("project intelligence statement without provenance fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.projects[0].intelligence = validProjectIntelligence();
      dataset.projects[0].intelligence.confirmedFacts[0].sourceIds = [];
    },
  });

  assertHasError(fixture, "sourceIds must contain at least one source ID");
});

test("relationship referencing missing project fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.projectCompanyRelationships[0].projectId = "missing-project";
    },
  });

  assertHasError(fixture, "missing project missing-project");
});

test("invalid Industry Map company reference fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.projectCompanyRelationships[0].industryCompanyId = "not-in-industry-map";
    },
  });

  assertHasError(fixture, "unknown Industry Map company ID not-in-industry-map");
});

test("operational project without actual COD fails", () => {
  const fixture = createFixture({
    mutateDataset: (dataset) => {
      dataset.projects[0].actualCod = null;
    },
  });

  assertHasError(fixture, "operational projects must include actualCod");
});

function assertHasError(fixture, expected) {
  const errors = runValidation(fixture);
  assert.ok(
    errors.some((error) => error.includes(expected)),
    `Expected error containing ${JSON.stringify(expected)}. Actual errors:\n${errors.join("\n")}`,
  );
}

function runValidation(fixture) {
  return validateStaticProjects({
    dataPath: fixture.dataPath,
    industryMapPath: fixture.industryMapPath,
  });
}

function createFixture({ mutateDataset } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fowt-projects-"));
  const dataPath = path.join(root, "projects.json");
  const industryMapPath = path.join(root, "industry-map.ts");
  const dataset = validDataset();

  if (mutateDataset) {
    mutateDataset(dataset);
  }

  fs.writeFileSync(dataPath, JSON.stringify(dataset, null, 2));
  fs.writeFileSync(
    industryMapPath,
    [
      "export const industryCompanies = [",
      '  { id: "example-developer", name: "Example Developer" },',
      "];",
      "export const industryCompanyCount = industryCompanies.length;",
    ].join("\n"),
  );

  return { dataPath, industryMapPath };
}

function validProjectIntelligence() {
  return {
    currentAssessment: "Active / Pre-FID.",
    fidStatus: "FID status is UNKNOWN.",
    sourceIds: ["src-example"],
    confirmedFacts: [
      {
        text: "Example confirmed fact.",
        sourceIds: ["src-example"],
        confidence: "high",
      },
    ],
    editorialInferences: [
      {
        text: "Example sourced inference.",
        sourceIds: ["src-example"],
        confidence: "medium",
      },
    ],
    currentGates: ["FID"],
    watchpoints: ["FID announcement"],
    unresolvedUncertainties: ["FID date is UNKNOWN."],
  };
}

function validDataset() {
  return {
    schemaVersion: "fowt-projects.v1",
    generatedDate: "2026-08-20",
    sources: [
      {
        sourceId: "src-example",
        title: "Example official project source",
        publisher: "Example Developer",
        url: "https://example.com/project",
        sourceTier: 2,
        publishedDate: "2026-01-01",
        accessedDate: "2026-08-20",
        licenseNote: "Public webpage; factual extraction only.",
      },
    ],
    projects: [
      {
        id: "example-project",
        slug: "example-project",
        name: "Example Project",
        aliases: [],
        country: "Exampleland",
        region: "Europe",
        seaArea: null,
        locationDescription: "Offshore Exampleland",
        sourceStatus: "Operational",
        normalizedStatus: "operational",
        capacityMw: 10,
        turbineCount: 2,
        turbineRatingMw: 5,
        waterDepthM: null,
        distanceOffshore: null,
        expectedCod: null,
        actualCod: "2026",
        floatingTechnology: "Example floating technology",
        platformType: "semi_submersible",
        developerOwnerText: "Example Developer",
        sourceIds: ["src-example"],
        factClaims: [
          {
            path: "capacityMw",
            value: 10,
            sourceId: "src-example",
            note: null,
            confidence: "high",
          },
        ],
      },
    ],
    projectCompanyRelationships: [
      {
        id: "example-project-developer",
        projectId: "example-project",
        industryCompanyId: "example-developer",
        companyName: "Example Developer",
        role: "developer_owner",
        roleDetail: "Project developer",
        startDate: null,
        endDate: null,
        status: "active",
        sourceStatusText: null,
        sourceIds: ["src-example"],
        factClaims: [
          {
            path: "role",
            value: "developer_owner",
            sourceId: "src-example",
            note: null,
            confidence: "high",
          },
        ],
      },
    ],
    timelineEvents: [
      {
        id: "example-project-commercial-operation",
        projectId: "example-project",
        date: "2026",
        datePrecision: "year",
        eventType: "commercial_operation",
        title: "Commercial operation",
        description: "The project entered commercial operation.",
        companyNames: ["Example Developer"],
        sourceIds: ["src-example"],
        factClaims: [
          {
            path: "eventType",
            value: "commercial_operation",
            sourceId: "src-example",
            note: null,
            confidence: "high",
          },
        ],
      },
    ],
  };
}
