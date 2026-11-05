"""Current OpenAlex metadata must reach the existing venue score unchanged."""

from copy import deepcopy

import pytest

from pipeline.normaliser import map_openalex_work_to_candidate, map_openalex_work_to_metadata
from pipeline.ranker import rank_classified_papers, score_classified_paper
from pipeline.relevance_classifier import classify_deduplicated_papers


def _metadata(work_type, source_type, work_id="W1"):
    # Source-shaped synthetic metadata; the name deliberately gives no venue hint.
    work = {
        "id": f"https://openalex.org/{work_id}",
        "type": work_type,
        "title": "Floating offshore wind turbine mooring model",
        "publication_date": "2026-11-01",
        "authorships": [{"author": {"display_name": "Example Author"}}],
        "primary_location": {
            "landing_page_url": f"https://example.org/{work_id}",
            "source": {"display_name": "Example publication", "type": source_type},
        },
    }
    return _normalise(work)


def _normalise(work):
    extracted = {"work": work, "provenance": {"rawQueryIndex": 0, "rawPageIndex": 0, "rawResultIndex": 0}}
    candidate = map_openalex_work_to_candidate(
        extracted, run_id="publication-types-test", raw_source_path="raw_openalex.json", discovery_date="2026-11-02"
    )
    return map_openalex_work_to_metadata(extracted, candidate)


@pytest.mark.parametrize(
    ("work_type", "source_type", "expected_type", "venue_score"),
    [
        ("article", "journal", "journal", 7),
        ("article", "conference", "conference", 6),
        ("article", "repository", "unknown", 4),
        ("article", None, "unknown", 4),
        ("review", "journal", "journal", 7),
        ("review", "conference", "unknown", 4),
        ("data-paper", "journal", "journal", 7),
        ("software-paper", "journal", "journal", 7),
        ("conference-paper", "book series", "conference", 6),
        ("conference-paper", "ebook platform", "conference", 6),
        ("conference-paper", None, "conference", 6),
        ("conference-abstract", "conference", "unknown", 4),
        ("preprint", "repository", "preprint", 5),
        ("preprint", "journal", "preprint", 5),
        ("dataset", "journal", "unknown", 4),
        ("dissertation", "repository", "unknown", 4),
        ("other", "journal", "unknown", 4),
        ("new-unrecognised-type", "journal", "unknown", 4),
        (None, "journal", "unknown", 4),
        ("journal-article", None, "journal", 7),
        ("proceedings-article", None, "conference", 6),
    ],
)
def test_source_metadata_reaches_existing_venue_scoring(work_type, source_type, expected_type, venue_score):
    metadata = _metadata(work_type, source_type)
    assert metadata["publicationType"] == expected_type

    classified = classify_deduplicated_papers(
        {"runId": "publication-types-test", "sourceName": "openalex", "deduplicatedRecords": [metadata]},
        classified_at="2026-11-02T00:00:00Z",
    )["classifiedPayload"]["classifiedRecords"][0]
    score = score_classified_paper(classified)
    unknown = deepcopy(classified)
    unknown["publicationType"] = "unknown"
    unknown_score = score_classified_paper(unknown)

    assert score["modelId"] == "research_selection_score_v1"
    assert score["maxScore"] == 100
    assert next(c for c in score["components"] if c["componentId"] == "venue_quality")["score"] == venue_score
    assert score["total"] - unknown_score["total"] == venue_score - 4
    assert [c for c in score["components"] if c["componentId"] != "venue_quality"] == [
        c for c in unknown_score["components"] if c["componentId"] != "venue_quality"
    ]


@pytest.mark.parametrize("location", [None, [], "journal", {}, {"source": None}, {"source": []}])
def test_article_with_missing_or_malformed_primary_venue_stays_unknown(location):
    work = {
        "id": "https://openalex.org/W1", "type": "article", "publication_date": "2026-11-01",
        "title": "Journal conference proceedings floating offshore wind turbine study",
        "primary_location": location,
        "locations": [{"source": {"type": "journal"}}],
    }
    assert _normalise(work)["publicationType"] == "unknown"


def test_venue_name_cannot_turn_ambiguous_article_or_nonpaper_into_journal():
    for work_type in ("article", "dataset", "conference-abstract"):
        work = {
            "id": "https://openalex.org/W1", "type": work_type, "publication_date": "2026-11-01",
            "title": "Floating offshore wind turbine study",
            "primary_location": {"source": {"display_name": "Journal of Conference Proceedings"}},
        }
        assert _normalise(work)["publicationType"] == "unknown"


def test_current_and_legacy_types_get_equal_scores_and_stable_tie_order():
    metadata = [
        _metadata("article", "journal", "W2"),
        _metadata("journal-article", "journal", "W1"),
        _metadata("conference-paper", "conference", "W4"),
        _metadata("proceedings-article", "conference", "W3"),
        _metadata("preprint", "repository", "W5"),
        _metadata("dataset", "repository", "W6"),
    ]
    classified = classify_deduplicated_papers(
        {"runId": "publication-types-test", "sourceName": "openalex", "deduplicatedRecords": metadata},
        classified_at="2026-11-02T00:00:00Z",
    )["classifiedPayload"]
    ranked = rank_classified_papers(classified, selection_limit=5)["rankedPayload"]
    reversed_pool = deepcopy(classified)
    reversed_pool["classifiedRecords"].reverse()
    assert rank_classified_papers(reversed_pool, selection_limit=5)["rankedPayload"] == ranked

    records = ranked["rankedRecords"]
    assert [r["publicationType"] for r in records] == ["journal", "journal", "conference", "conference", "preprint", "unknown"]
    for start in (0, 2):
        assert records[start]["selectionScore"] == records[start + 1]["selectionScore"]
        assert records[start]["paperId"] < records[start + 1]["paperId"]
    assert [r["selected"] for r in records] == [True, True, True, True, True, False]
