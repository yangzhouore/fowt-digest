import json
from datetime import UTC, date, datetime
from urllib.parse import parse_qs, urlparse

import pytest

from pipeline.ids import make_run_id
from pipeline.openalex_collector import RUN_RECORD_LIMIT, collect_openalex_raw
from pipeline.openalex_query import FOWT_KEYWORD_GROUPS

STARTED_AT = datetime(2026, 8, 9, 9, 15, 0, tzinfo=UTC)
COMPLETED_AT = datetime(2026, 8, 9, 9, 15, 5, tzinfo=UTC)
FROM_DATE = date(2026, 8, 3)
TO_DATE = date(2026, 8, 9)


def test_successful_single_page_run_writes_raw_pages_and_summary(tmp_path):
    raw_payload = {"meta": {}, "results": [{"id": "https://openalex.org/W1"}]}

    result = collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=lambda url: raw_payload,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    run_id = make_run_id(STARTED_AT)
    run_directory = tmp_path / run_id
    raw_output = _read_json(run_directory / "raw_openalex.json")
    summary = _read_json(run_directory / "run_summary.json")

    assert result == {
        "capReached": False,
        "failedPageCount": 0,
        "failedQueryCount": 0,
        "partialQueryCount": 0,
        "queryCount": 13,
        "rawRecordCount": 13,
        "runDirectory": str(run_directory),
        "runId": run_id,
        "status": "success",
        "successfulPageCount": 13,
        "successfulQueryCount": 13,
    }
    assert raw_output["runId"] == run_id
    assert raw_output["sourceName"] == "openalex"
    assert len(raw_output["queries"]) == 13
    first_page = raw_output["queries"][0]["pages"][0]
    assert first_page["rawResponse"] == raw_payload
    assert first_page["requestCursor"] == "*"
    assert first_page["nextCursor"] is None
    assert first_page["recordCount"] == 1
    assert summary == {
        "capReached": False,
        "completedAt": "2026-08-09T09:15:05Z",
        "dateWindow": {
            "fromPublicationDate": "2026-08-03",
            "toPublicationDate": "2026-08-09",
        },
        "errors": [],
        "failedPageCount": 0,
        "failedQueryCount": 0,
        "outputFiles": ["raw_openalex.json", "run_summary.json"],
        "pageSize": 50,
        "partialQueryCount": 0,
        "queryCount": 13,
        "rawRecordCount": 13,
        "runId": run_id,
        "runRecordLimit": 200,
        "sourceName": "openalex",
        "startedAt": "2026-08-09T09:15:00Z",
        "status": "success",
        "successfulPageCount": 13,
        "successfulQueryCount": 13,
    }


def test_generates_one_initial_query_per_contract_term_in_order(tmp_path):
    seen_urls = []

    def fake_fetch(url):
        seen_urls.append(url)
        return {"meta": {}, "results": []}

    collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    raw_output = _read_json(tmp_path / make_run_id(STARTED_AT) / "raw_openalex.json")
    expected_terms = [term for _, terms in FOWT_KEYWORD_GROUPS for term in terms]

    assert len(seen_urls) == len(expected_terms) == 13
    assert [query["queryTerm"] for query in raw_output["queries"]] == expected_terms
    assert [_cursor_from_url(url) for url in seen_urls] == ["*"] * 13


def test_multi_page_query_progresses_using_next_cursor(tmp_path):
    calls = []

    def fake_fetch(url):
        calls.append((url, _cursor_from_url(url)))
        if len(calls) == 1:
            return {"meta": {"next_cursor": "cursor-2"}, "results": [{"id": "W1"}]}
        return {"meta": {}, "results": [{"id": "W2"}]}

    collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    raw_output = _read_json(tmp_path / make_run_id(STARTED_AT) / "raw_openalex.json")
    first_query = raw_output["queries"][0]

    assert [cursor for _, cursor in calls[:2]] == ["*", "cursor-2"]
    assert first_query["pageCount"] == 2
    assert [page["requestCursor"] for page in first_query["pages"]] == ["*", "cursor-2"]
    assert [page["nextCursor"] for page in first_query["pages"]] == ["cursor-2", None]


def test_stop_when_next_cursor_is_missing_null_or_empty(tmp_path):
    for payload in (
        {"meta": {}, "results": [{"id": "W1"}]},
        {"meta": {"next_cursor": None}, "results": [{"id": "W1"}]},
        {"meta": {"next_cursor": ""}, "results": [{"id": "W1"}]},
    ):
        calls = []

        collect_openalex_raw(
            from_publication_date=FROM_DATE,
            to_publication_date=TO_DATE,
            runs_root=tmp_path / str(len(list(tmp_path.iterdir()))),
            fetch_json=lambda url, payload=payload: calls.append(url) or payload,
            started_at=STARTED_AT,
            completed_at=COMPLETED_AT,
        )

        assert len(calls) == 13


def test_stop_when_results_are_empty_even_with_next_cursor(tmp_path):
    calls = []

    def fake_fetch(url):
        calls.append(url)
        return {"meta": {"next_cursor": "cursor-2"}, "results": []}

    collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    assert len(calls) == 13
    raw_output = _read_json(tmp_path / make_run_id(STARTED_AT) / "raw_openalex.json")
    assert raw_output["queries"][0]["pageCount"] == 1
    assert raw_output["queries"][0]["pages"][0]["recordCount"] == 0


def test_run_level_cap_preserves_full_page_and_stops_later_terms(tmp_path):
    calls = []

    def fake_fetch(url):
        calls.append(url)
        return {
            "meta": {"next_cursor": f"cursor-{len(calls)}"},
            "results": [{"id": f"W{len(calls)}-{index}"} for index in range(50)],
        }

    result = collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    raw_output = _read_json(tmp_path / make_run_id(STARTED_AT) / "raw_openalex.json")
    summary = _read_json(tmp_path / make_run_id(STARTED_AT) / "run_summary.json")

    assert len(calls) == 4
    assert result["capReached"] is True
    assert summary["capReached"] is True
    assert summary["rawRecordCount"] == RUN_RECORD_LIMIT
    assert len(raw_output["queries"]) == 1
    assert raw_output["queries"][0]["pageCount"] == 4
    assert all(len(page["rawResponse"]["results"]) == 50 for page in raw_output["queries"][0]["pages"])


def test_full_page_is_preserved_when_cap_is_crossed(tmp_path):
    def fake_fetch(url):
        return {
            "meta": {"next_cursor": "next"},
            "results": [{"id": f"W{index}"} for index in range(75)],
        }

    collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    raw_output = _read_json(tmp_path / make_run_id(STARTED_AT) / "raw_openalex.json")
    summary = _read_json(tmp_path / make_run_id(STARTED_AT) / "run_summary.json")

    assert summary["rawRecordCount"] == 225
    assert summary["capReached"] is True
    assert raw_output["queries"][0]["pageCount"] == 3
    assert len(raw_output["queries"][0]["pages"][-1]["rawResponse"]["results"]) == 75


def test_later_page_failure_preserves_earlier_pages_and_later_terms_continue(tmp_path):
    calls = []

    def fake_fetch(url):
        cursor = _cursor_from_url(url)
        calls.append((url, cursor))
        if len(calls) == 1:
            return {"meta": {"next_cursor": "cursor-2"}, "results": [{"id": "W1"}]}
        if len(calls) == 2:
            raise RuntimeError("page failed")
        return {"meta": {}, "results": [{"id": "later"}]}

    result = collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    raw_output = _read_json(tmp_path / make_run_id(STARTED_AT) / "raw_openalex.json")
    summary = _read_json(tmp_path / make_run_id(STARTED_AT) / "run_summary.json")
    first_query = raw_output["queries"][0]

    assert result["status"] == "partial_success"
    assert first_query["status"] == "partial"
    assert first_query["pages"][0]["rawResponse"] == {"meta": {"next_cursor": "cursor-2"}, "results": [{"id": "W1"}]}
    assert first_query["pages"][1]["status"] == "failed"
    assert first_query["pages"][1]["requestCursor"] == "cursor-2"
    assert len(raw_output["queries"]) == 13
    assert raw_output["queries"][1]["status"] == "success"
    assert summary["partialQueryCount"] == 1
    assert summary["failedPageCount"] == 1
    assert summary["errors"][0]["pageIndex"] == 1


def test_failed_first_page_records_failure_and_later_terms_continue(tmp_path):
    calls = []

    def fake_fetch(url):
        calls.append(url)
        if len(calls) == 1:
            raise RuntimeError("first page failed")
        return {"meta": {}, "results": [{"id": "later"}]}

    result = collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=fake_fetch,
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    raw_output = _read_json(tmp_path / make_run_id(STARTED_AT) / "raw_openalex.json")
    summary = _read_json(tmp_path / make_run_id(STARTED_AT) / "run_summary.json")

    assert result["status"] == "partial_success"
    assert raw_output["queries"][0]["status"] == "failed"
    assert raw_output["queries"][0]["pages"][0]["status"] == "failed"
    assert raw_output["queries"][1]["status"] == "success"
    assert summary["failedQueryCount"] == 1
    assert summary["failedPageCount"] == 1


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
    assert summary["successfulPageCount"] == 0
    assert summary["failedQueryCount"] == 13
    assert summary["failedPageCount"] == 13
    assert len(summary["errors"]) == 13
    assert all(query["status"] == "failed" for query in raw_output["queries"])


def test_page_and_cursor_metadata_is_written(tmp_path):
    collect_openalex_raw(
        from_publication_date=FROM_DATE,
        to_publication_date=TO_DATE,
        runs_root=tmp_path,
        fetch_json=lambda url: {"meta": {}, "results": [{"id": "W1"}]},
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    raw_output = _read_json(tmp_path / make_run_id(STARTED_AT) / "raw_openalex.json")
    page = raw_output["queries"][0]["pages"][0]

    assert page["queryGroup"] == "core_fowt"
    assert page["queryTerm"] == "floating offshore wind"
    assert page["queryIndex"] == 0
    assert page["pageIndex"] == 0
    assert page["requestCursor"] == "*"
    assert page["nextCursor"] is None
    assert page["status"] == "success"
    assert _per_page_from_url(page["queryUrl"]) == "50"


def test_raw_response_is_preserved_without_transformation(tmp_path):
    payload = {
        "meta": {"next_cursor": None},
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

    assert raw_output["queries"][0]["pages"][0]["rawResponse"] == payload


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
        fetch_json=lambda url: {"meta": {}, "results": []},
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
        fetch_json=lambda url: {"meta": {}, "results": []},
        started_at=STARTED_AT,
        completed_at=COMPLETED_AT,
    )

    assert result["runDirectory"] == str(tmp_path / "custom-runs" / make_run_id(STARTED_AT))


def _cursor_from_url(url):
    return parse_qs(urlparse(url).query)["cursor"][0]


def _per_page_from_url(url):
    return parse_qs(urlparse(url).query)["per-page"][0]


def _read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))
