from __future__ import annotations

from datetime import date, datetime, UTC
from pathlib import Path
import json

import pytest

import pipeline.orchestrator as orchestrator
from pipeline.orchestrator import run_weekly_pipeline


RUN_ID = "run_20260720_090000_openalex"
DISCOVERY_DATE = "2026-07-20"
CLASSIFIED_AT = "2026-07-20T09:10:00Z"
GENERATED_AT = "2026-07-20T09:20:00Z"
WEEK_START = "2026-07-13"
WEEK_END = "2026-07-19"


def test_orchestrator_runs_all_stages_once_in_required_order(tmp_path, monkeypatch):
    calls: list[str] = []
    _install_successful_stages(monkeypatch, tmp_path, calls)

    result = _run(tmp_path)

    assert calls == [
        "collection",
        "normalisation",
        "deduplication",
        "classification",
        "ranking",
        "weekly_digest",
    ]
    assert result["runId"] == RUN_ID
    assert result["runDirectory"] == tmp_path / RUN_ID
    assert result["status"] == "completed"
    assert list(result["stageResults"]) == [
        "collection",
        "normalisation",
        "deduplication",
        "classification",
        "ranking",
        "weeklyDigest",
    ]


def test_file_outputs_are_loaded_and_passed_to_next_stage(tmp_path, monkeypatch):
    calls: list[str] = []
    seen_payloads: dict[str, dict] = {}
    _install_successful_stages(monkeypatch, tmp_path, calls, seen_payloads=seen_payloads)

    _run(tmp_path)

    assert seen_payloads["normalisation"] == _raw_payload()
    assert seen_payloads["deduplication"] == _normalised_payload()
    assert seen_payloads["classification"] == _deduplicated_payload()
    assert seen_payloads["ranking"] == _classified_payload()
    assert seen_payloads["weekly_digest"] == _ranked_payload()


def test_normalised_json_is_used_not_normalised_papers_json(tmp_path, monkeypatch):
    calls: list[str] = []
    seen_payloads: dict[str, dict] = {}
    _install_successful_stages(monkeypatch, tmp_path, calls, seen_payloads=seen_payloads)

    def normalisation(raw_payload, *, run_directory, run_id, raw_source_path, discovery_date):
        calls.append("normalisation")
        _write_json(run_directory / "candidates.json", {"runId": RUN_ID, "sourceName": "openalex", "candidates": [], "rejectedCandidates": []})
        _write_json(run_directory / "normalised.json", _normalised_payload())
        _write_json(run_directory / "normalised_papers.json", {"wrong": True})
        return {"normalisedPath": run_directory / "normalised.json"}

    monkeypatch.setattr(orchestrator, "write_normalisation_outputs", normalisation)

    _run(tmp_path)

    assert seen_payloads["deduplication"] == _normalised_payload()


def test_final_return_contains_loaded_weekly_digest_payloads(tmp_path, monkeypatch):
    calls: list[str] = []
    _install_successful_stages(monkeypatch, tmp_path, calls)

    result = _run(tmp_path)

    assert result["weeklyDigest"] == _weekly_digest_payload()
    assert result["weeklyDigestResult"] == _weekly_digest_result_payload()
    assert result["stageResults"]["weeklyDigest"] == {
        "weeklyDigestPath": tmp_path / RUN_ID / "weekly_digest.json",
        "weeklyDigestResultPath": tmp_path / RUN_ID / "weekly_digest_result.json",
    }


def test_identical_mocked_inputs_produce_identical_return(tmp_path, monkeypatch):
    calls: list[str] = []
    _install_successful_stages(monkeypatch, tmp_path, calls)

    first = _run(tmp_path)
    calls.clear()
    _install_successful_stages(monkeypatch, tmp_path, calls)
    second = _run(tmp_path)

    assert first == second


@pytest.mark.parametrize(
    "failing_stage,expected_calls",
    [
        ("collection", ["collection"]),
        ("normalisation", ["collection", "normalisation"]),
        ("deduplication", ["collection", "normalisation", "deduplication"]),
        ("classification", ["collection", "normalisation", "deduplication", "classification"]),
        ("ranking", ["collection", "normalisation", "deduplication", "classification", "ranking"]),
        ("weekly_digest", ["collection", "normalisation", "deduplication", "classification", "ranking", "weekly_digest"]),
    ],
)
def test_failure_stops_immediately_and_does_not_retry(tmp_path, monkeypatch, failing_stage, expected_calls):
    calls: list[str] = []
    _install_successful_stages(monkeypatch, tmp_path, calls, failing_stage=failing_stage)

    with pytest.raises(RuntimeError, match=f"{failing_stage} failed"):
        _run(tmp_path)

    assert calls == expected_calls
    assert calls.count(failing_stage) == 1


def test_original_exception_propagates(tmp_path, monkeypatch):
    calls: list[str] = []
    original_error = RuntimeError("ranking failed")
    _install_successful_stages(monkeypatch, tmp_path, calls, failing_stage="ranking", error=original_error)

    with pytest.raises(RuntimeError) as exc_info:
        _run(tmp_path)

    assert exc_info.value is original_error


def test_invalid_intermediate_payload_is_not_repaired(tmp_path, monkeypatch):
    calls: list[str] = []
    _install_successful_stages(monkeypatch, tmp_path, calls)

    def collection(**kwargs):
        calls.append("collection")
        run_directory = tmp_path / RUN_ID
        run_directory.mkdir(exist_ok=True)
        _write_json(run_directory / "raw_openalex.json", {"malformed": True})
        _write_json(run_directory / "run_summary.json", {"runId": RUN_ID})
        return {"runId": RUN_ID, "runDirectory": str(run_directory), "status": "success"}

    def normalisation(raw_payload, **kwargs):
        calls.append("normalisation")
        assert raw_payload == {"malformed": True}
        raise ValueError("normalisation requires raw OpenAlex output")

    monkeypatch.setattr(orchestrator, "collect_openalex_raw", collection)
    monkeypatch.setattr(orchestrator, "write_normalisation_outputs", normalisation)

    with pytest.raises(ValueError, match="normalisation requires raw OpenAlex output"):
        _run(tmp_path)

    assert calls == ["collection", "normalisation"]


def test_prior_successful_outputs_remain_after_later_stage_failure(tmp_path, monkeypatch):
    calls: list[str] = []
    _install_successful_stages(monkeypatch, tmp_path, calls, failing_stage="classification")

    with pytest.raises(RuntimeError, match="classification failed"):
        _run(tmp_path)

    run_directory = tmp_path / RUN_ID
    assert (run_directory / "raw_openalex.json").exists()
    assert (run_directory / "normalised.json").exists()
    assert (run_directory / "deduplicated_papers.json").exists()
    assert not (run_directory / "classified_papers.json").exists()
    assert not (run_directory / "ranked_papers.json").exists()


def test_orchestrator_does_not_write_new_output_filenames(tmp_path, monkeypatch):
    calls: list[str] = []
    _install_successful_stages(monkeypatch, tmp_path, calls)

    _run(tmp_path)

    assert sorted(path.name for path in (tmp_path / RUN_ID).iterdir()) == [
        "candidates.json",
        "classification_result.json",
        "classified_papers.json",
        "deduplicated_papers.json",
        "deduplication_result.json",
        "normalised.json",
        "ranked_papers.json",
        "ranking_result.json",
        "raw_openalex.json",
        "run_summary.json",
        "weekly_digest.json",
        "weekly_digest_result.json",
    ]


def test_fetch_json_and_sleep_injections_reach_collection_stage(tmp_path, monkeypatch):
    calls: list[str] = []
    captured: dict[str, object] = {}
    _install_successful_stages(monkeypatch, tmp_path, calls, captured_collection_kwargs=captured)

    def fake_fetch(url):
        return {"url": url}

    def fake_sleep(seconds):
        return None

    _run(tmp_path, fetch_json=fake_fetch, sleep=fake_sleep, request_delay_seconds=1.5)

    assert captured["fetch_json"] is fake_fetch
    assert captured["sleep"] is fake_sleep
    assert captured["request_delay_seconds"] == 1.5


def test_no_cli_web_database_api_ai_scheduler_or_logging_framework_imports():
    module_path = Path(orchestrator.__file__)
    source = module_path.read_text(encoding="utf-8")

    forbidden = [
        "argparse",
        "click",
        "FastAPI",
        "sqlite3",
        "sqlalchemy",
        "openai",
        "web/",
        "schedule",
        "cron",
        "logging",
    ]
    for term in forbidden:
        assert term not in source


def _install_successful_stages(
    monkeypatch,
    tmp_path,
    calls,
    *,
    seen_payloads=None,
    failing_stage=None,
    error=None,
    captured_collection_kwargs=None,
):
    seen_payloads = seen_payloads if seen_payloads is not None else {}

    def maybe_fail(stage):
        if stage == failing_stage:
            raise error or RuntimeError(f"{stage} failed")

    def collection(**kwargs):
        calls.append("collection")
        maybe_fail("collection")
        if captured_collection_kwargs is not None:
            captured_collection_kwargs.update(kwargs)
        run_directory = tmp_path / RUN_ID
        run_directory.mkdir(exist_ok=True)
        _write_json(run_directory / "raw_openalex.json", _raw_payload())
        _write_json(run_directory / "run_summary.json", {"runId": RUN_ID, "status": "success"})
        return {"runId": RUN_ID, "runDirectory": str(run_directory), "status": "success"}

    def normalisation(raw_payload, *, run_directory, run_id, raw_source_path, discovery_date):
        calls.append("normalisation")
        maybe_fail("normalisation")
        seen_payloads["normalisation"] = raw_payload
        assert run_id == RUN_ID
        assert raw_source_path == str(run_directory / "raw_openalex.json")
        assert discovery_date == DISCOVERY_DATE
        _write_json(run_directory / "candidates.json", {"runId": RUN_ID, "sourceName": "openalex", "candidates": [], "rejectedCandidates": []})
        _write_json(run_directory / "normalised.json", _normalised_payload())
        return {"candidatesPath": run_directory / "candidates.json", "normalisedPath": run_directory / "normalised.json"}

    def deduplication(normalised_payload, *, run_directory):
        calls.append("deduplication")
        maybe_fail("deduplication")
        seen_payloads["deduplication"] = normalised_payload
        _write_json(run_directory / "deduplicated_papers.json", _deduplicated_payload())
        _write_json(run_directory / "deduplication_result.json", {"runId": RUN_ID, "inputCount": 1, "outputCount": 1})
        return {"deduplicatedPapersPath": run_directory / "deduplicated_papers.json"}

    def classification(deduplicated_payload, *, run_directory, classified_at):
        calls.append("classification")
        maybe_fail("classification")
        seen_payloads["classification"] = deduplicated_payload
        assert classified_at == CLASSIFIED_AT
        _write_json(run_directory / "classified_papers.json", _classified_payload())
        _write_json(run_directory / "classification_result.json", {"runId": RUN_ID, "classifiedCount": 1})
        return {"classifiedPapersPath": run_directory / "classified_papers.json"}

    def ranking(classified_payload, *, run_directory, selection_limit):
        calls.append("ranking")
        maybe_fail("ranking")
        seen_payloads["ranking"] = classified_payload
        assert selection_limit == 6
        _write_json(run_directory / "ranked_papers.json", _ranked_payload())
        _write_json(run_directory / "ranking_result.json", {"runId": RUN_ID, "rankedCount": 1})
        return {"rankedPapersPath": run_directory / "ranked_papers.json"}

    def weekly_digest(ranked_payload, *, run_directory, week_start, week_end, generated_at):
        calls.append("weekly_digest")
        maybe_fail("weekly_digest")
        seen_payloads["weekly_digest"] = ranked_payload
        assert week_start == WEEK_START
        assert week_end == WEEK_END
        assert generated_at == GENERATED_AT
        _write_json(run_directory / "weekly_digest.json", _weekly_digest_payload())
        _write_json(run_directory / "weekly_digest_result.json", _weekly_digest_result_payload())
        return {
            "weeklyDigestPath": run_directory / "weekly_digest.json",
            "weeklyDigestResultPath": run_directory / "weekly_digest_result.json",
        }

    monkeypatch.setattr(orchestrator, "collect_openalex_raw", collection)
    monkeypatch.setattr(orchestrator, "write_normalisation_outputs", normalisation)
    monkeypatch.setattr(orchestrator, "write_deduplication_outputs", deduplication)
    monkeypatch.setattr(orchestrator, "write_classification_outputs", classification)
    monkeypatch.setattr(orchestrator, "write_ranking_outputs", ranking)
    monkeypatch.setattr(orchestrator, "write_weekly_digest_outputs", weekly_digest)


def _run(tmp_path, **overrides):
    kwargs = {
        "from_publication_date": date(2026, 7, 13),
        "to_publication_date": date(2026, 7, 19),
        "runs_root": tmp_path,
        "discovery_date": DISCOVERY_DATE,
        "classified_at": CLASSIFIED_AT,
        "selection_limit": 6,
        "week_start": WEEK_START,
        "week_end": WEEK_END,
        "generated_at": GENERATED_AT,
        "fetch_json": lambda url: {"url": url},
        "sleep": lambda seconds: None,
        "request_delay_seconds": 1.0,
        "started_at": datetime(2026, 7, 20, 9, 0, tzinfo=UTC),
        "completed_at": datetime(2026, 7, 20, 9, 5, tzinfo=UTC),
    }
    kwargs.update(overrides)
    return run_weekly_pipeline(**kwargs)


def _write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, sort_keys=True), encoding="utf-8")


def _raw_payload():
    return {"runId": RUN_ID, "sourceName": "openalex", "queries": []}


def _normalised_payload():
    return {"runId": RUN_ID, "sourceName": "openalex", "normalisedRecords": [_paper("normalised")], "rejectedRecords": []}


def _deduplicated_payload():
    paper = _paper("deduplicated")
    paper["processingStatus"] = "deduplicated"
    return {"runId": RUN_ID, "sourceName": "openalex", "deduplicatedRecords": [paper]}


def _classified_payload():
    paper = _paper("classified")
    paper["processingStatus"] = "classified"
    paper["relevanceAssessment"] = {"classification": "Relevant"}
    return {"runId": RUN_ID, "sourceName": "openalex", "classifiedRecords": [paper]}


def _ranked_payload():
    paper = _paper("ranked")
    paper["processingStatus"] = "classified"
    paper["relevanceAssessment"] = {"classification": "Relevant"}
    paper["rank"] = 1
    paper["selected"] = True
    paper["selectionReason"] = "selected_within_limit"
    return {"runId": RUN_ID, "sourceName": "openalex", "selectionLimit": 6, "rankedRecords": [paper]}


def _weekly_digest_payload():
    return {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "sourceName": "openalex",
        "weekStart": WEEK_START,
        "weekEnd": WEEK_END,
        "generatedAt": GENERATED_AT,
        "selectedPapers": _ranked_payload()["rankedRecords"],
    }


def _weekly_digest_result_payload():
    return {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "sourceName": "openalex",
        "inputRankedCount": 1,
        "selectedCount": 1,
        "digestPaperCount": 1,
        "weekStart": WEEK_START,
        "weekEnd": WEEK_END,
        "generatedAt": GENERATED_AT,
        "processingSummary": "assembled_selected_ranked_records",
    }


def _paper(status):
    return {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "paperId": "paper_1",
        "candidateIds": ["candidate_1"],
        "sourceName": "openalex",
        "sourceIdentifiers": {"openalexId": "https://openalex.org/W1", "doi": None},
        "doi": None,
        "title": "Floating offshore wind paper",
        "authors": ["Author"],
        "abstract": "Abstract",
        "publicationSource": "Journal",
        "publicationType": "journal",
        "publishedDate": "2026-07-18",
        "indexedDate": None,
        "sourceUrl": "https://openalex.org/W1",
        "openAccessStatus": None,
        "fullTextAvailability": "abstract_only",
        "topicTags": ["Floating offshore wind"],
        "rawSources": [],
        "processingStatus": status,
    }
