/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { loadStaticAdapter } = require("./validate-company-intelligence");

const { getBriefingWeeks, getLatestBriefingPreview } = loadStaticAdapter("../app/briefing-weeks.ts");

const earlier = "2026-11-08";
const latest = "2026-11-15";
const dateRange = "9 November 2026 - 15 November 2026";

function engineering(slug, ids) {
  return {
    slug, dateRange,
    items: ids.map((id) => ({ id, title: `Headline ${id}`, oneLineSummary: `Summary ${id}`, sourceRecords: ["evidence"] })),
  };
}

function research(slug, ids) {
  return {
    slug, dateRange,
    papers: ids.map((id) => ({ slug: id, title: `Paper ${id}`, publicationSource: "Journal", abstract: "Full text" })),
  };
}

test("latest paired previews retain selection order and canonical links, with at most three per track", () => {
  const itemIds = ["b", "d", "a", "c"];
  const preview = getLatestBriefingPreview(
    [engineering(earlier, ["old"]), engineering(latest, itemIds)],
    [research(latest, itemIds), research(earlier, ["old"])],
  );

  assert.deepEqual(preview, {
    slug: latest, dateRange,
    engineering: {
      href: `/engineering/${latest}`,
      items: itemIds.slice(0, 3).map((id) => ({
        href: `/engineering/${latest}#item-${id}`, title: `Headline ${id}`, summary: `Summary ${id}`,
      })),
    },
    research: {
      href: `/weekly/${latest}`,
      papers: itemIds.slice(0, 3).map((id) => ({ href: `/papers/${id}`, title: `Paper ${id}`, publicationSource: "Journal" })),
    },
  });
});

test("a latest Engineering-only week stays sparse without borrowing older Research", () => {
  const preview = getLatestBriefingPreview(
    [engineering(earlier, ["old"]), engineering(latest, ["one", "two"])],
    [research(earlier, ["old"])],
  );
  assert.equal(preview.slug, latest);
  assert.equal(preview.engineering.items.length, 2);
  assert.equal(preview.research, null);
});

test("a latest Research-only week stays sparse without borrowing older Engineering", () => {
  const preview = getLatestBriefingPreview(
    [engineering(earlier, ["old"])],
    [research(latest, ["one"]), research(earlier, ["old"])],
  );
  assert.equal(preview.slug, latest);
  assert.equal(preview.research.papers.length, 1);
  assert.equal(preview.engineering, null);
  assert.equal(getLatestBriefingPreview([], []), null);
});

test("the chronological index orders the union newest first and retains single-track and paired editions", () => {
  const oldest = "2026-11-01";
  const weeks = getBriefingWeeks(
    [engineering(earlier, []), engineering(oldest, [])],
    [research(latest, []), research(earlier, [])],
  );
  assert.deepEqual(weeks.map(({ slug, engineering, research }) => [slug, engineering?.slug, research?.slug]), [
    [latest, undefined, latest],
    [earlier, earlier, earlier],
    [oldest, oldest, undefined],
  ]);
});
