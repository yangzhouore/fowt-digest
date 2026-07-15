import json
from datetime import UTC, date, datetime

import pytest

from pipeline.ids import make_run_id
from pipeline.openalex_collector import collect_openalex_raw
from pipeline.openalex_query import FOWT_KEYWORD_GROUPS

STARTED_AT = datetime(2026, 8, 9, 9, 15, 0, tzinfo=UTC)
COMPLETED_AT = datetime(2026, 8, 9, 9, 15, 5, tzinfo=UTC)
FROM_DATE = date(2026, 8, 3)
TO_DATE = date(2026, 8, 9)


def test_successful_full_run_writes_raw_and_summary(tmp_path):
    raw_payload = {"meta": {"count": 1}, "results": [{"id": "https://openalex.org/W1"}]}

    def fake_fetch(url):
        return raw_payload

    result = collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    run_id = make_run_id(STARTED_AT)
    run_directory = tmp_path / run_id
    raw_output = _read_json(run_directory / "raw_openalex.json")
    summary = _read_json(run_directory / "run_summary.json")

    assert result == {
        "failedQueryCount": 0,
        "queryCount": 13,
        "runDirectory": str(run_directory),
        "runId": run_id,
        "status": "success",
        "successfulQueryCount": 13,
    }
    assert raw_output["runId"] == run_id
    assert raw_output["sourceName"] == "openalex"
    assert len(raw_output["queries"]) == 13
    assert raw_output["queries"][0]["rawResponse"] == raw_payload
    assert raw_output["queries"][0]["status"] == "success"
    assert summary == {
        "completedAt": "2026-08-09T09:15:05Z",
        "dateWindow": {
            "fromPublicationDate": "2026-08-03",
            "toPublicationDate": "2026-08-09",
        },
        "errors": [],
        "failedQueryCount": 0,
        "outputFiles": ["raw_openalex.json", "run_summary.json"],
        "queryCount": 13,
        "runId": run_id,
        "sourceName": "openalex",
        "startedAt": "2026-08-09T09:15:00Z",
        "status": "success",
        "successfulQueryCount": 13,
    }


def test_generates_one_query_per_contract_term_in_order(tmp_path):
    seen_urls = []

    def fake_fetch(url):
        seen_urls.append(url)
        return {"url": url}

    collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    raw_output = _read_json(tmp_path / make_run_id(STARTED_AT) / "raw_openalex.json")
    expected_terms = [
        term for _, terms in FOWT_KEYWORD_GROUPS for term in terms
    ]

    assert len(seen_urls) == len(expected_terms) == 13
    assert [query["queryTerm"] for query in raw_output["queries"]] == expected_terms


def test_raw_response_is_preserved_without_transformation(tmp_path):
    payload = {
        "meta": {"next_cursor": "abc"},
        "results": [
            {
                "display_name": "Floating wind \u03b1 control",
                "nested": {"values": [1, None, True]},
            }
        ],
    }

    collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=lambda url: payload,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    raw_output = _read_json(tmp_path / make_run_id(STARTED_AT) / "raw_openalex.json")

    assert raw_output["queries"][0]["rawResponse"] == payload


def test_partial_run_records_failure_and_preserves_successes(tmp_path):
    def fake_fetch(url):
        if "floating+wind+turbine" in url:
            raise RuntimeError("temporary API failure")
        return {"url": url}

    result = collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    run_directory = tmp_path / make_run_id(STARTED_AT)
    raw_output = _read_json(run_directory / "raw_openalex.json")
    summary = _read_json(run_directory / "run_summary.json")
    failed_queries = [
        query for query in raw_output["queries"] if query["status"] == "failed"
    ]

    assert result["status"] == "partial_success"
    assert summary["status"] == "partial_success"
    assert summary["successfulQueryCount"] == 12
    assert summary["failedQueryCount"] == 1
    assert len(summary["errors"]) == 1
    assert failed_queries == [
        {
            "error": {
                "message": "temporary API failure",
                "type": "RuntimeError",
            },
            "queryGroup": "core_fowt",
            "queryIndex": 1,
            "queryTerm": "floating wind turbine",
            "queryUrl": failed_queries[0]["queryUrl"],
            "sourceName": "openalex",
            "status": "failed",
        }
    ]
    assert all(
        "rawResponse" in query
        for query in raw_output["queries"]
        if query["status"] == "success"
    )


def test_total_failure_writes_failed_summary_and_raw_failures(tmp_path):
    def fake_fetch(url):
        raise RuntimeError("OpenAlex unavailable")

    result = collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    run_directory = tmp_path / make_run_id(STARTED_AT)
    raw_output = _read_json(run_directory / "raw_openalex.json")
    summary = _read_json(run_directory / "run_summary.json")

    assert result["status"] == "failed"
    assert summary["status"] == "failed"
    assert summary["successfulQueryCount"] == 0
    assert summary["failedQueryCount"] == 13
    assert len(summary["errors"]) == 13
    assert all(query["status"] == "failed" for query in raw_output["queries"])


def test_existing_run_directory_is_not_overwritten_and_no_fetch_occurs(tmp_path):
    run_directory = tmp_path / make_run_id(STARTED_AT)
    run_directory.mkdir()
    calls = []

    def fake_fetch(url):
        calls.append(url)
        return {}

    with pytest.raises(FileExistsError):
        collect_openalex_raw(
            from_publication_date=FROM_DATE,
            to_publication_date=TO_DATE,
            runs_root=tmp_path,
            fetch_json=fake_fetch,
            started_at=STARTED_AT,
            completed_at=COMPLETED_AT,
        )

    assert calls == []


def test_collector_writes_only_raw_and_summary_outputs(tmp_path):
    collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=lambda url: {"ok": True},
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    run_directory = tmp_path / make_run_id(STARTED_AT)

    assert sorted(path.name for path in run_directory.iterdir()) == [
        "raw_openalex.json",
        "run_summary.json",
    ]


def test_collector_uses_configured_runs_root(tmp_path):
    result = collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path / "custom-runs",
        fetch_json=lambda url: {"ok": True},
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    assert result["runDirectory"] == str(tmp_path / "custom-runs" / make_run_id(STARTED_AT))


def _read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))
