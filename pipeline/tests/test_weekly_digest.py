from __future__ import annotations

from copy import deepcopy
import json

import pytest

import pipeline.weekly_digest as weekly_digest
from pipeline.weekly_digest import assemble_weekly_digest, write_weekly_digest_outputs


RUN_ID = "run_20260718_090000_openalex"
SOURCE_NAME = "openalex"
WEEK_START = "2026-07-13"
WEEK_END = "2026-07-19"
GENERATED_AT = "2026-07-19T09:00:00Z"


def test_weekly_digest_includes_only_selected_records_in_existing_order():
    payload = _payload([
        _record("paper_1", 1, True),
        _record("paper_2", 2, False),
        _record("paper_3", 3, True),
    ])

    digest = _assemble(payload)["weeklyDigest"]

    assert [record["paperId"] for record in digest["selectedPapers"]] == ["paper_1", "paper_3"]
    assert [record["rank"] for record in digest["selectedPapers"]] == [1, 3]
    assert digest["selectedPapers"][0] == payload["rankedRecords"][0]
    assert "paper" not in digest["selectedPapers"][0]


def test_weekly_digest_output_shape_is_exact():
    result = _assemble(_payload([_record("paper_1", 1, True)]))

    assert result["weeklyDigest"] == {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "sourceName": SOURCE_NAME,
        "weekStart": WEEK_START,
        "weekEnd": WEEK_END,
        "generatedAt": GENERATED_AT,
        "selectedPapers": [_record("paper_1", 1, True)],
    }


def test_weekly_digest_result_is_aggregate_only_and_counts_match():
    result = _assemble(_payload([
        _record("paper_1", 1, True),
        _record("paper_2", 2, False),
        _record("paper_3", 3, True),
    ]))["weeklyDigestResult"]

    assert result == {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "sourceName": SOURCE_NAME,
        "inputRankedCount": 3,
        "selectedCount": 2,
        "digestPaperCount": 2,
        "weekStart": WEEK_START,
        "weekEnd": WEEK_END,
        "generatedAt": GENERATED_AT,
        "processingSummary": "assembled_selected_ranked_records",
    }
    assert result["selectedCount"] == result["digestPaperCount"]
    assert "selectedPapers" not in result
    assert "rankedRecords" not in result
    assert "papers" not in result


def test_empty_selection_is_valid():
    result = _assemble(_payload([
        _record("paper_1", 1, False),
        _record("paper_2", 2, False),
    ]))

    assert result["weeklyDigest"]["selectedPapers"] == []
    assert result["weeklyDigestResult"]["selectedCount"] == 0
    assert result["weeklyDigestResult"]["digestPaperCount"] == 0


def test_input_is_not_mutated():
    payload = _payload([_record("paper_1", 1, True)])
    before = deepcopy(payload)

    _assemble(payload)

    assert payload == before


def test_deterministic_output_for_identical_input():
    payload = _payload([_record("paper_1", 1, True), _record("paper_2", 2, False)])

    assert _assemble(payload) == _assemble(payload)


def test_does_not_inspect_relevance_classification_or_reselect():
    selected = _record("paper_1", 1, True)
    selected.pop("relevanceAssessment")
    not_selected = _record("paper_2", 2, False)
    not_selected["relevanceAssessment"] = {"classification": "Relevant"}

    digest = _assemble(_payload([selected, not_selected]))["weeklyDigest"]

    assert digest["selectedPapers"] == [selected]


def test_ranked_records_must_be_ordered_by_ascending_rank():
    with pytest.raises(ValueError, match="weekly digest requires valid ranked record"):
        _assemble(_payload([_record("paper_1", 2, True), _record("paper_2", 1, True)]))


def test_ranks_must_be_integer_unique_and_continuous_from_one():
    with pytest.raises(ValueError, match="weekly digest requires valid ranked record"):
        _assemble(_payload([_record("paper_1", 1, True), _record("paper_2", 3, True)]))

    with pytest.raises(ValueError, match="weekly digest requires valid ranked record"):
        _assemble(_payload([_record("paper_1", 1, True), _record("paper_2", 1, True)]))

    invalid = _record("paper_1", 1, True)
    invalid["rank"] = True
    with pytest.raises(ValueError, match="weekly digest requires valid ranked record"):
        _assemble(_payload([invalid]))


def test_selected_must_be_boolean():
    invalid = _record("paper_1", 1, True)
    invalid["selected"] = "true"

    with pytest.raises(ValueError, match="weekly digest requires valid ranked record"):
        _assemble(_payload([invalid]))


def test_payload_validation_failures_are_deterministic():
    with pytest.raises(ValueError, match="weekly digest requires ranked payload"):
        assemble_weekly_digest(None, week_start=WEEK_START, week_end=WEEK_END, generated_at=GENERATED_AT)

    with pytest.raises(ValueError, match="weekly digest requires ranked records"):
        _assemble({"runId": RUN_ID, "sourceName": SOURCE_NAME})

    with pytest.raises(ValueError, match="weekly digest requires ranked records"):
        _assemble({"runId": RUN_ID, "sourceName": SOURCE_NAME, "rankedRecords": {}})

    bad_record = _record("paper_1", 1, True)
    bad_record["runId"] = "other_run"
    with pytest.raises(ValueError, match="weekly digest requires valid ranked record"):
        _assemble(_payload([bad_record]))


def test_week_metadata_validation_failures_are_deterministic():
    payload = _payload([_record("paper_1", 1, True)])

    with pytest.raises(ValueError, match="weekly digest requires valid weekStart"):
        assemble_weekly_digest(payload, week_start="2026-99-99", week_end=WEEK_END, generated_at=GENERATED_AT)

    with pytest.raises(ValueError, match="weekly digest requires valid weekEnd"):
        assemble_weekly_digest(payload, week_start=WEEK_START, week_end="2026-99-99", generated_at=GENERATED_AT)

    with pytest.raises(ValueError, match="weekly digest requires valid week range"):
        assemble_weekly_digest(payload, week_start=WEEK_END, week_end=WEEK_START, generated_at=GENERATED_AT)

    with pytest.raises(ValueError, match="weekly digest requires valid generatedAt"):
        assemble_weekly_digest(payload, week_start=WEEK_START, week_end=WEEK_END, generated_at="not-a-date")


def test_writer_writes_only_required_files_and_returns_persisted_counts(tmp_path):
    payload = _payload([_record("paper_1", 1, True), _record("paper_2", 2, False)])

    result = write_weekly_digest_outputs(
        payload,
        run_directory=tmp_path,
        week_start=WEEK_START,
        week_end=WEEK_END,
        generated_at=GENERATED_AT,
    )

    assert sorted(path.name for path in tmp_path.iterdir()) == [
        "weekly_digest.json",
        "weekly_digest_result.json",
    ]
    digest = json.loads(result["weeklyDigestPath"].read_text(encoding="utf-8"))
    summary = json.loads(result["weeklyDigestResultPath"].read_text(encoding="utf-8"))
    assert result == {
        "weeklyDigestPath": tmp_path / "weekly_digest.json",
        "weeklyDigestResultPath": tmp_path / "weekly_digest_result.json",
        "inputRankedCount": 2,
        "selectedCount": 1,
        "digestPaperCount": 1,
        "processingSummary": "assembled_selected_ranked_records",
    }
    assert digest["selectedPapers"] == [_record("paper_1", 1, True)]
    assert summary["inputRankedCount"] == 2
    assert summary["selectedCount"] == summary["digestPaperCount"] == 1


def test_second_write_failure_removes_new_first_output(tmp_path, monkeypatch):
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_weekly_digest_outputs(
            _payload([_record("paper_1", 1, True)]),
            run_directory=tmp_path,
            week_start=WEEK_START,
            week_end=WEEK_END,
            generated_at=GENERATED_AT,
        )

    assert list(tmp_path.iterdir()) == []


def test_second_write_failure_restores_preexisting_outputs(tmp_path, monkeypatch):
    first_path = tmp_path / "weekly_digest.json"
    second_path = tmp_path / "weekly_digest_result.json"
    first_content = b'{"old":"digest"}\n'
    second_content = b'{"old":"result"}\n'
    first_path.write_bytes(first_content)
    second_path.write_bytes(second_content)
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_weekly_digest_outputs(
            _payload([_record("paper_1", 1, True)]),
            run_directory=tmp_path,
            week_start=WEEK_START,
            week_end=WEEK_END,
            generated_at=GENERATED_AT,
        )

    assert first_path.read_bytes() == first_content
    assert second_path.read_bytes() == second_content


def _fail_second_write(monkeypatch):
    original_write_run_json = weekly_digest.write_run_json

    def failing_write(run_directory, filename, data):
        if filename == "weekly_digest_result.json":
            raise RuntimeError("forced second write failure")
        return original_write_run_json(run_directory, filename, data)

    monkeypatch.setattr(weekly_digest, "write_run_json", failing_write)


def _assemble(payload):
    return assemble_weekly_digest(
        payload,
        week_start=WEEK_START,
        week_end=WEEK_END,
        generated_at=GENERATED_AT,
    )


def _payload(records):
    return {
        "runId": RUN_ID,
        "sourceName": SOURCE_NAME,
        "selectionLimit": 6,
        "rankedRecords": records,
    }


def _record(paper_id, rank, selected):
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
        "publishedDate": "2026-07-18",
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
            "classification": "Relevant",
            "confidence": 0.9,
            "reason": "test_reason",
            "topicTags": ["Floating offshore wind"],
            "evidenceBasis": ["title"],
            "modelName": None,
            "promptVersion": None,
            "generatedAt": "2026-07-18T09:00:00Z",
        },
        "rank": rank,
        "selected": selected,
        "selectionReason": "selected_within_limit" if selected else "not_selected_below_limit",
    }
