/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  validateStaticDigests,
} = require("./validate-static-digests.js");

test("valid fixture passes", () => {
  const fixture = createFixture();

  assert.deepEqual(runValidation(fixture), []);
});

test("malformed JSON fails", () => {
  const fixture = createFixture();
  fs.writeFileSync(path.join(fixture.digestDir, "2026-01-04.json"), "{");

  assertHasError(fixture, "2026-01-04.json: malformed JSON");
});

test("non-object digest fails", () => {
  const fixture = createFixture({
    digest: [],
  });

  assertHasError(fixture, "2026-01-04.json: digest must be an object");
});

test("missing required digest field fails", () => {
  const fixture = createFixture({
    mutateDigest: (digest) => {
      delete digest.schemaVersion;
    },
  });

  assertHasError(fixture, "schemaVersion must be a non-empty string");
});

test("invalid weekStart fails", () => {
  const fixture = createFixture({
    mutateDigest: (digest) => {
      digest.weekStart = "2026-99-01";
    },
  });

  assertHasError(fixture, "weekStart must be a valid YYYY-MM-DD date");
});

test("invalid weekEnd fails", () => {
  const fixture = createFixture({
    mutateDigest: (digest) => {
      digest.weekEnd = "not-a-date";
    },
  });

  assertHasError(fixture, "weekEnd must be a strict YYYY-MM-DD date");
});

test("weekStart later than weekEnd fails", () => {
  const fixture = createFixture({
    mutateDigest: (digest) => {
      digest.weekStart = "2026-01-05";
    },
  });

  assertHasError(fixture, "weekStart must not be later than weekEnd");
});

test("invalid generatedAt fails", () => {
  const fixture = createFixture({
    mutateDigest: (digest) => {
      digest.generatedAt = "2026-01-05";
    },
  });

  assertHasError(fixture, "generatedAt must be a valid ISO datetime string");
});

test("filename and weekEnd mismatch fails", () => {
  const fixture = createFixture({
    fileName: "2026-01-05.json",
  });

  assertHasError(fixture, "filename must match weekEnd 2026-01-04.json");
});

test("duplicate edition weekEnd fails", () => {
  const fixture = createFixture();
  writeDigest(fixture.digestDir, "2026-01-05.json", validDigest());
  fs.writeFileSync(
    fixture.adapterPath,
    adapterSource([
      ["digest20260104Json", "2026-01-04.json"],
      ["digest20260105Json", "2026-01-05.json"],
    ]),
  );

  assertHasError(fixture, "duplicate edition weekEnd");
});

test("missing required paper field fails", () => {
  const fixture = createFixture({
    mutatePaper: (paper) => {
      delete paper.title;
    },
  });

  assertHasError(fixture, "title must be a non-empty string");
});

test("invalid publishedDate fails", () => {
  const fixture = createFixture({
    mutatePaper: (paper) => {
      paper.publishedDate = "2026-02-31";
    },
  });

  assertHasError(fixture, "publishedDate must be a valid YYYY-MM-DD date");
});

test("non-string author fails", () => {
  const fixture = createFixture({
    mutatePaper: (paper) => {
      paper.authors = ["Alice Example", 42];
    },
  });

  assertHasError(fixture, "authors[1] must be a string");
});

test("non-string topic tag fails", () => {
  const fixture = createFixture({
    mutatePaper: (paper) => {
      paper.topicTags = ["Mooring", false];
    },
  });

  assertHasError(fixture, "topicTags[1] must be a string");
});

test("non-positive rank fails", () => {
  const fixture = createFixture({
    mutatePaper: (paper) => {
      paper.rank = 0;
    },
  });

  assertHasError(fixture, "rank must be a positive integer");
});

test("duplicate rank fails", () => {
  const fixture = createFixture({
    mutateDigest: (digest) => {
      digest.selectedPapers.push(validPaper({ paperId: "paper_doi_two", rank: 1 }));
    },
  });

  assertHasError(fixture, "duplicate rank 1");
});

test("non-contiguous ranks fail", () => {
  const fixture = createFixture({
    mutateDigest: (digest) => {
      digest.selectedPapers.push(validPaper({ paperId: "paper_doi_two", rank: 3 }));
    },
  });

  assertHasError(fixture, "ranks must be contiguous from 1 to 2");
});

test("array order and rank mismatch fails", () => {
  const fixture = createFixture({
    mutateDigest: (digest) => {
      digest.selectedPapers = [
        validPaper({ paperId: "paper_doi_two", rank: 2 }),
        validPaper({ paperId: "paper_doi_one", rank: 1 }),
      ];
    },
  });

  assertHasError(fixture, "array order must agree with rank 2");
});

test("duplicate paperId within an edition fails", () => {
  const fixture = createFixture({
    mutateDigest: (digest) => {
      digest.selectedPapers.push(validPaper({ paperId: "paper_doi_one", rank: 2 }));
    },
  });

  assertHasError(fixture, "duplicate paperId paper_doi_one");
});

test("empty generated paper slug fails", () => {
  const fixture = createFixture({
    mutatePaper: (paper) => {
      paper.paperId = "___";
    },
  });

  assertHasError(fixture, "generated paper slug must be non-empty");
});

test("duplicate global paper slug fails", () => {
  const fixture = createFixture({
    mutateDigest: (digest) => {
      digest.selectedPapers.push(validPaper({ paperId: "paper doi one", rank: 2 }));
    },
  });

  assertHasError(fixture, "duplicate global paper slug paper-doi-one");
});

test("unregistered JSON file fails", () => {
  const fixture = createFixture();
  writeDigest(
    fixture.digestDir,
    "2026-01-11.json",
    validDigest({
      weekStart: "2026-01-05",
      weekEnd: "2026-01-11",
      paperId: "paper_doi_two",
    }),
  );

  assertHasError(fixture, "2026-01-11.json: JSON file is not imported");
});

test("imported missing JSON file fails", () => {
  const fixture = createFixture({
    adapterSource: adapterSource([["digest20260104Json", "2026-01-04.json"]], {
      imports: [["digest20260111Json", "2026-01-11.json"]],
    }),
  });

  assertHasError(fixture, "2026-01-11.json: imported JSON file does not exist");
});

test("imported digest omitted from digestJsonFiles fails", () => {
  const fixture = createFixture({
    adapterSource: adapterSource([["digest20260104Json", "2026-01-04.json"]], {
      imports: [["digest20260111Json", "2026-01-11.json"]],
    }),
  });
  writeDigest(
    fixture.digestDir,
    "2026-01-11.json",
    validDigest({
      weekStart: "2026-01-05",
      weekEnd: "2026-01-11",
      paperId: "paper_doi_two",
    }),
  );

  assertHasError(fixture, "digest20260111Json is omitted from digestJsonFiles");
});

test("duplicate import target fails", () => {
  const fixture = createFixture({
    adapterSource: [
      'import digestAJson from "./digests/2026-01-04.json";',
      'import digestBJson from "./digests/2026-01-04.json";',
      "",
      "const digestJsonFiles = [",
      "  digestAJson,",
      "  digestBJson,",
      "];",
    ].join("\n"),
  });

  assertHasError(fixture, "duplicate JSON import target 2026-01-04.json");
});

test("duplicate digestJsonFiles registration fails", () => {
  const fixture = createFixture({
    adapterSource: [
      'import digest20260104Json from "./digests/2026-01-04.json";',
      "",
      "const digestJsonFiles = [",
      "  digest20260104Json,",
      "  digest20260104Json,",
      "];",
    ].join("\n"),
  });

  assertHasError(fixture, "duplicate registration digest20260104Json");
});

function assertHasError(fixture, expected) {
  const errors = runValidation(fixture);
  assert.ok(
    errors.some((error) => error.includes(expected)),
    `Expected error containing ${JSON.stringify(expected)}. Actual errors:\n${errors.join("\n")}`,
  );
}

function runValidation(fixture) {
  return validateStaticDigests({
    digestDir: fixture.digestDir,
    adapterPath: fixture.adapterPath,
  });
}

function createFixture({
  digest = validDigest(),
  fileName = "2026-01-04.json",
  mutateDigest,
  mutatePaper,
  adapterSource: customAdapterSource,
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fowt-digest-"));
  const digestDir = path.join(root, "digests");
  fs.mkdirSync(digestDir);
  const adapterPath = path.join(root, "digest-adapter.ts");

  if (isObject(digest)) {
    if (mutatePaper) {
      mutatePaper(digest.selectedPapers[0]);
    }
    if (mutateDigest) {
      mutateDigest(digest);
    }
  }

  writeDigest(digestDir, fileName, digest);
  fs.writeFileSync(
    adapterPath,
    customAdapterSource ??
      adapterSource([["digest20260104Json", "2026-01-04.json"]]),
  );

  return {
    adapterPath,
    digestDir,
  };
}

function writeDigest(digestDir, fileName, digest) {
  fs.writeFileSync(path.join(digestDir, fileName), JSON.stringify(digest, null, 2));
}

function adapterSource(registrations, { imports = [] } = {}) {
  const allImports = [...registrations, ...imports];
  return [
    ...allImports.map(
      ([variableName, target]) =>
        `import ${variableName} from "./digests/${target}";`,
    ),
    "",
    "const digestJsonFiles = [",
    ...registrations.map(([variableName]) => `  ${variableName},`),
    "];",
  ].join("\n");
}

function validDigest({
  weekStart = "2025-12-29",
  weekEnd = "2026-01-04",
  paperId = "paper_doi_one",
} = {}) {
  return {
    schemaVersion: "pipeline-data-0.1",
    runId: "run_20260104_090000_openalex",
    sourceName: "openalex",
    weekStart,
    weekEnd,
    generatedAt: "2026-01-04T09:00:00Z",
    selectedPapers: [validPaper({ paperId, rank: 1 })],
  };
}

function validPaper({ paperId, rank }) {
  return {
    paperId,
    title: "Example floating offshore wind paper",
    authors: ["Alice Example"],
    abstract: null,
    publicationSource: "Example Journal",
    publicationType: "journal",
    publishedDate: "2026-01-03",
    indexedDate: null,
    doi: null,
    sourceUrl: null,
    openAccessStatus: null,
    fullTextAvailability: "abstract_only",
    topicTags: ["Floating offshore wind"],
    rank,
    selectionReason: "selected_within_limit",
  };
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}