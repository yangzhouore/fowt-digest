/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { loadStaticAdapter } = require("./validate-company-intelligence");

const { getBriefingWeeks, getBriefingWeekPreviews } = loadStaticAdapter("../app/briefing-weeks.ts");

const earlier = "2026-11-08";
const latest = "2026-11-15";
const dateRange = "9 November 2026 - 15 November 2026";

function engineering(slug, ids) {
  return {
    slug, dateRange,
    items: ids.map((id) => ({
      id, title: `Headline ${id}`, engineeringTopics: ["Floating foundations", "Technology demonstration", "Supply chain", "Policy cooperation"], category: "policy",
      sourceUrl: `https://example.org/${id}`,
      sourceRecords: [
        { publisher: "Supporting source", publishedDate: "2026-11-09", sourceUrl: `https://example.org/support/${id}` },
        { publisher: "Item source", publishedDate: "2026-11-10", sourceUrl: `https://example.org/${id}` },
      ],
    })),
  };
}

function research(slug, ids) {
  return {
    slug, dateRange,
    papers: ids.map((id) => ({ id: `paper-${id}`, slug: id, title: `Paper ${id}`, publicationSource: `Journal ${id}`, publicationDate: latest, sourceUrl: `https://example.org/papers/${id}`, topicTags: ["Floating wind"] })),
  };
}

test("weekly previews keep all selected Engineering and Research records in order", () => {
  const itemIds = ["b", "d", "a", "c"];
  const [preview] = getBriefingWeekPreviews(
    [engineering(earlier, ["old"]), engineering(latest, itemIds)],
    [research(latest, itemIds), research(earlier, ["old"])],
  );

  assert.deepEqual(preview, {
    slug: latest, dateRange,
    engineering: {
      href: `/engineering/${latest}`,

      items: itemIds.map((id) => ({
        id, href: `/engineering/${latest}#item-${id}`, title: `Headline ${id}`, keywords: ["Floating foundations", "Technology demonstration", "Supply chain"],
        category: "policy",
        source: { publisher: "Item source", publishedDate: "2026-11-10", href: `https://example.org/${id}` },
      })),
    },
    research: {
      href: `/weekly/${latest}`,

      papers: itemIds.map((id) => ({
        id: `paper-${id}`, href: `/papers/${id}`, title: `Paper ${id}`, publicationSource: `Journal ${id}`,
        publicationDate: latest, sourceUrl: `https://example.org/papers/${id}`, topicTags: ["Floating wind"],
      })),
    },
  });
});

test("weekly news groups categories in first appearance order and retains editorial order within each group", () => {
  const edition = engineering(latest, ["first", "second", "third"]);
  edition.items[1].category = "technology";
  const [preview] = getBriefingWeekPreviews([edition], []);
  assert.deepEqual(preview.engineering.items.map(({ id }) => id), ["first", "third", "second"]);
});

test("lead attribution stays absent when its canonical source URL does not match a retained record", () => {
  const edition = engineering(latest, ["one"]);
  edition.items[0].sourceUrl = "https://example.org/unmatched";
  const [preview] = getBriefingWeekPreviews([edition], []);
  assert.equal(preview.engineering.items[0].source, null);
});

test("a latest Engineering-only week stays sparse without borrowing older Research", () => {
  const [preview] = getBriefingWeekPreviews(
    [engineering(earlier, ["old"]), engineering(latest, ["one", "two"])],
    [research(earlier, ["old"])],
  );
  assert.equal(preview.slug, latest);
  assert.equal(preview.engineering.items.length, 2);
  assert.equal(preview.research, null);
});

test("a latest Research-only week stays sparse without borrowing older Engineering", () => {
  const [preview] = getBriefingWeekPreviews(
    [engineering(earlier, ["old"])],
    [research(latest, ["one"]), research(earlier, ["old"])],
  );
  assert.equal(preview.slug, latest);
  assert.equal(preview.research.papers.length, 1);
  assert.equal(preview.engineering, null);
  assert.deepEqual(getBriefingWeekPreviews([], []), []);
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
