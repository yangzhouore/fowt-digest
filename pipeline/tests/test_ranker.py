from __future__ import annotations

from copy import deepcopy
import json

import pytest

import pipeline.ranker as ranker
from pipeline.ranker import (
    SELECTION_REASON_BELOW_LIMIT,
    SELECTION_REASON_NOT_RELEVANT,
    SELECTION_REASON_SELECTED,
    rank_classified_papers,
    write_ranking_outputs,
)
from pipeline.relevance_classifier import NOT_RELEVANT, POSSIBLY_RELEVANT, RELEVANT


RUN_ID = "run_20260718_090000_openalex"
SOURCE_NAME = "openalex"


def test_rank_order_uses_classification_date_and_paper_id():
    payload = _payload([
        _record("paper_c", NOT_RELEVANT, "2026-07-20"),
        _record("paper_b", RELEVANT, "2026-07-18"),
        _record("paper_a", RELEVANT, "2026-07-18"),
        _record("paper_d", POSSIBLY_RELEVANT, "2026-07-21"),
        _record("paper_e", RELEVANT, "2026-07-19"),
    ])

    ranked = rank_classified_papers(payload, selection_limit=10)["rankedPayload"]["rankedRecords"]

    assert [(record["rank"], record["paperId"]) for record in ranked] == [
        (1, "paper_e"),
        (2, "paper_a"),
        (3, "paper_b"),
        (4, "paper_d"),
        (5, "paper_c"),
    ]


def test_every_input_receives_unique_continuous_global_rank():
    ranked = rank_classified_papers(
        _payload([
            _record("paper_3", POSSIBLY_RELEVANT, "2026-07-18"),
            _record("paper_1", RELEVANT, "2026-07-19"),
            _record("paper_2", NOT_RELEVANT, "2026-07-20"),
        ]),
        selection_limit=2,
    )["rankedPayload"]["rankedRecords"]

    assert [record["rank"] for record in ranked] == [1, 2, 3]
    assert len({record["rank"] for record in ranked}) == 3


def test_ranked_records_directly_extend_classified_records_without_paper_wrapper():
    original = _record("paper_1", RELEVANT, "2026-07-18")

    ranked = rank_classified_papers(_payload([original]), selection_limit=1)["rankedPayload"]["rankedRecords"][0]

    assert "paper" not in ranked
    for key, value in original.items():
        assert ranked[key] == value
    assert ranked["rank"] == 1
    assert ranked["selected"] is True
    assert ranked["selectionReason"] == SELECTION_REASON_SELECTED


def test_selection_is_separate_from_ranking_and_respects_limit():
    ranked = rank_classified_papers(
        _payload([
            _record("paper_1", RELEVANT, "2026-07-20"),
            _record("paper_2", RELEVANT, "2026-07-19"),
            _record("paper_3", POSSIBLY_RELEVANT, "2026-07-18"),
            _record("paper_4", NOT_RELEVANT, "2026-07-21"),
        ]),
        selection_limit=2,
    )["rankedPayload"]["rankedRecords"]

    assert [(record["paperId"], record["selected"], record["selectionReason"]) for record in ranked] == [
        ("paper_1", True, SELECTION_REASON_SELECTED),
        ("paper_2", True, SELECTION_REASON_SELECTED),
        ("paper_3", False, SELECTION_REASON_BELOW_LIMIT),
        ("paper_4", False, SELECTION_REASON_NOT_RELEVANT),
    ]


def test_not_relevant_is_never_selected_even_inside_limit():
    ranked = rank_classified_papers(
        _payload([_record("paper_1", NOT_RELEVANT, "2026-07-20")]),
        selection_limit=5,
    )["rankedPayload"]["rankedRecords"]

    assert ranked[0]["rank"] == 1
    assert ranked[0]["selected"] is False
    assert ranked[0]["selectionReason"] == SELECTION_REASON_NOT_RELEVANT


def test_zero_selection_limit_selects_no_eligible_records():
    ranked = rank_classified_papers(
        _payload([_record("paper_1", RELEVANT, "2026-07-20")]),
        selection_limit=0,
    )["rankedPayload"]["rankedRecords"]

    assert ranked[0]["selected"] is False
    assert ranked[0]["selectionReason"] == SELECTION_REASON_BELOW_LIMIT


def test_ranking_result_contains_aggregate_statistics_only():
    result = rank_classified_papers(
        _payload([
            _record("paper_1", RELEVANT, "2026-07-20"),
            _record("paper_2", POSSIBLY_RELEVANT, "2026-07-19"),
            _record("paper_3", NOT_RELEVANT, "2026-07-18"),
        ]),
        selection_limit=2,
    )["rankingResult"]

    assert result == {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "sourceName": SOURCE_NAME,
        "inputCount": 3,
        "rankedCount": 3,
        "selectedCount": 2,
        "selectionLimit": 2,
        "classificationCounts": {
            RELEVANT: 1,
            POSSIBLY_RELEVANT: 1,
            NOT_RELEVANT: 1,
        },
    }
    assert "rankedRecords" not in result
    assert "papers" not in result


def test_deterministic_output_for_identical_input():
    payload = _payload([
        _record("paper_b", RELEVANT, "2026-07-18"),
        _record("paper_a", RELEVANT, "2026-07-18"),
    ])

    assert rank_classified_papers(payload, selection_limit=1) == rank_classified_papers(payload, selection_limit=1)


def test_input_is_not_mutated():
    payload = _payload([_record("paper_1", RELEVANT, "2026-07-20")])
    before = deepcopy(payload)

    rank_classified_papers(payload, selection_limit=1)

    assert payload == before


def test_validation_failures_are_deterministic():
    with pytest.raises(ValueError, match="ranking requires classified payload"):
        rank_classified_papers(None, selection_limit=1)

    with pytest.raises(ValueError, match="ranking requires classified records"):
        rank_classified_papers({"runId": RUN_ID, "sourceName": SOURCE_NAME}, selection_limit=1)

    with pytest.raises(ValueError, match="ranking requires valid selection limit"):
        rank_classified_papers(_payload([]), selection_limit=-1)

    with pytest.raises(ValueError, match="ranking requires valid selection limit"):
        rank_classified_papers(_payload([]), selection_limit=True)

    with pytest.raises(ValueError, match="ranking requires valid classified paper"):
        rank_classified_papers(_payload([{"paperId": "paper_incomplete"}]), selection_limit=1)


def test_invalid_classification_is_rejected():
    record = _record("paper_1", RELEVANT, "2026-07-20")
    record["relevanceAssessment"]["classification"] = "Maybe"

    with pytest.raises(ValueError, match="ranking requires valid relevance assessment"):
        rank_classified_papers(_payload([record]), selection_limit=1)


def test_missing_or_invalid_published_date_is_rejected():
    missing = _record("paper_1", RELEVANT, "2026-07-20")
    missing["publishedDate"] = ""
    invalid = _record("paper_2", RELEVANT, "2026-99-99")

    with pytest.raises(ValueError, match="ranking requires valid classified paper"):
        rank_classified_papers(_payload([missing]), selection_limit=1)

    with pytest.raises(ValueError, match="ranking requires valid classified paper"):
        rank_classified_papers(_payload([invalid]), selection_limit=1)


def test_writer_writes_only_required_files_and_returns_persisted_counts(tmp_path):
    payload = _payload([
        _record("paper_1", RELEVANT, "2026-07-20"),
        _record("paper_2", NOT_RELEVANT, "2026-07-19"),
    ])

    result = write_ranking_outputs(payload, run_directory=tmp_path, selection_limit=1)

    assert sorted(path.name for path in tmp_path.iterdir()) == [
        "ranked_papers.json",
        "ranking_result.json",
    ]
    ranked = json.loads(result["rankedPapersPath"].read_text(encoding="utf-8"))
    summary = json.loads(result["rankingResultPath"].read_text(encoding="utf-8"))
    assert result == {
        "rankedPapersPath": tmp_path / "ranked_papers.json",
        "rankingResultPath": tmp_path / "ranking_result.json",
        "inputCount": 2,
        "rankedCount": 2,
        "selectedCount": 1,
        "selectionLimit": 1,
        "classificationCounts": {RELEVANT: 1, POSSIBLY_RELEVANT: 0, NOT_RELEVANT: 1},
    }
    assert len(ranked["rankedRecords"]) == 2
    assert summary["rankedCount"] == 2


def test_second_write_failure_removes_new_first_output(tmp_path, monkeypatch):
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_ranking_outputs(_payload([_record("paper_1", RELEVANT, "2026-07-20")]), run_directory=tmp_path, selection_limit=1)

    assert list(tmp_path.iterdir()) == []


def test_second_write_failure_restores_preexisting_outputs(tmp_path, monkeypatch):
    first_path = tmp_path / "ranked_papers.json"
    second_path = tmp_path / "ranking_result.json"
    first_content = b'{"old":"ranked"}\n'
    second_content = b'{"old":"result"}\n'
    first_path.write_bytes(first_content)
    second_path.write_bytes(second_content)
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_ranking_outputs(_payload([_record("paper_1", RELEVANT, "2026-07-20")]), run_directory=tmp_path, selection_limit=1)

    assert first_path.read_bytes() == first_content
    assert second_path.read_bytes() == second_content


def _fail_second_write(monkeypatch):
    original_write_run_json = ranker.write_run_json

    def failing_write(run_directory, filename, data):
        if filename == "ranking_result.json":
            raise RuntimeError("forced second write failure")
        return original_write_run_json(run_directory, filename, data)

    monkeypatch.setattr(ranker, "write_run_json", failing_write)


def _payload(records):
    return {
        "runId": RUN_ID,
        "sourceName": SOURCE_NAME,
        "classifiedRecords": records,
    }


def _record(paper_id, classification, published_date):
    return {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "paperId": paper_id,
        "candidateIds": [f"candidate_{paper_id}"],
        "sourceName": SOURCE_NAME,
        "sourceIdentifiers": {
            "openalexId": f"https://openalex.org/{paper_id}",
            "doi": None,
        },
        "doi": None,
        "title": f"Title {paper_id}",
        "authors": ["Author"],
        "abstract": "Abstract",
        "publicationSource": "Journal",
        "publicationType": "journal",
        "publishedDate": published_date,
        "indexedDate": None,
        "sourceUrl": f"https://openalex.org/{paper_id}",
        "openAccessStatus": None,
        "fullTextAvailability": "abstract_only",
        "topicTags": ["Floating offshore wind"],
        "rawSources": [
            {
                "rawSourcePath": "pipeline/data/runs/run_20260718_090000_openalex/raw_openalex.json",
                "rawQueryIndex": 0,
                "rawPageIndex": 0,
                "rawResultIndex": 0,
                "queryGroup": "core_fowt",
                "queryTerm": "floating offshore wind",
            }
        ],
        "processingStatus": "classified",
        "relevanceAssessment": {
            "assessmentId": f"relevance_{paper_id}",
            "paperId": paper_id,
            "classification": classification,
            "confidence": 0.9,
            "reason": "test_reason",
            "topicTags": ["Floating offshore wind"],
            "evidenceBasis": ["title"],
            "modelName": None,
            "promptVersion": None,
            "generatedAt": "2026-07-18T09:00:00Z",
        },
    }
