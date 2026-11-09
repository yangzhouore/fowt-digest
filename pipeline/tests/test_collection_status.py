"""Collection completeness must gate both orchestration and publication."""

from datetime import date, datetime, UTC
import json

import pytest

from pipeline.orchestrator import run_weekly_pipeline
from pipeline.website_publisher import publish_weekly_digest
from tools.publication_workflow import run_publication_workflow


def _work():
    return {
        "id": "https://openalex.org/W1",
        "title": "Floating offshore wind turbine mooring model",
        "publication_date": "2026-11-01",
        "type": "article",
        "primary_location": {"source": {"type": "journal", "display_name": "Test journal"}},
    }


def _run(root, fetcher, **kwargs):
    return run_weekly_pipeline(
        from_publication_date=date(2026, 10, 26),
        to_publication_date=date(2026, 11, 1),
        discovery_date="2026-11-02", classified_at="2026-11-02T00:00:00Z",
        selection_limit=5, week_start="2026-10-26", week_end="2026-11-01",
        generated_at="2026-11-02T00:00:00Z", runs_root=root,
        fetch_json=fetcher, sleep=lambda _: None,
        started_at=datetime(2026, 11, 2, tzinfo=UTC),
        completed_at=datetime(2026, 11, 2, tzinfo=UTC),
        **kwargs,
    )


def _read(run, name):
    return json.loads((run["runDirectory"] / name).read_text(encoding="utf-8"))


@pytest.mark.parametrize("works", [[], [_work()]])
def test_complete_collection_generates_publishable_digest(tmp_path, works):
    run = _run(tmp_path / "runs", lambda _: {"results": works, "meta": {"next_cursor": None}})
    assert run["status"] == "completed"
    assert run["publishable"] is True
    assert len(run["weeklyDigest"]["selectedPapers"]) == len(works)
    assert "ranking" in run["stageResults"]
    assert _read(run, "run_summary.json")["status"] == "success"
    web = tmp_path / "web"
    (web / "data").mkdir(parents=True)
    (web / "data/digest-adapter.ts").write_text("const digestJsonFiles = [];\n", encoding="utf-8")
    published = publish_weekly_digest(run_directory=run["runDirectory"], web_root=web)
    assert published.digest_destination_path.read_bytes() == published.digest_source_path.read_bytes()


@pytest.mark.parametrize("mode, expected", [("failed", "failed"), ("partial", "partial_success"), ("capped", "partial_success")])
def test_unsuccessful_collection_stops_before_digest_and_preserves_diagnostics(tmp_path, mode, expected):
    calls = 0

    def fetch(_):
        nonlocal calls
        calls += 1
        if mode == "failed" or (mode == "partial" and calls == 1):
            raise RuntimeError("controlled API failure")
        return {"results": [_work()] * (50 if mode == "capped" else 1),
                "meta": {"next_cursor": "more" if mode == "capped" else None}}

    run = _run(tmp_path / "runs", fetch)
    assert run["status"] == expected
    assert run["publishable"] is False
    assert run["weeklyDigest"] is None
    assert run["weeklyDigestResult"] is None
    assert list(run["stageResults"]) == ["collection"]
    assert {p.name for p in run["runDirectory"].iterdir()} == {"raw_openalex.json", "run_summary.json"}
    summary = _read(run, "run_summary.json")
    assert summary["status"] == expected
    assert summary["capReached"] is (mode == "capped")
    assert bool(summary["errors"]) is (mode != "capped")
    assert summary["rawRecordCount"] == (0 if mode == "failed" else 200 if mode == "capped" else 12)
    assert _read(run, "raw_openalex.json")["queries"]


def test_explicit_diagnostic_cap_is_not_production_complete(tmp_path):
    run = _run(tmp_path, lambda _: {"results": [_work()], "meta": {}}, run_record_limit=1)
    assert run["status"] == "partial_success"
    assert run["publishable"] is False
    assert _read(run, "run_summary.json")["runRecordLimit"] == 1


def test_raised_limit_completes_all_queries_and_deduplicates(tmp_path):
    def fetch(url):
        # 20 raw records per query; 260 total exceeds the old diagnostic cap.
        return {"results": [_work()] * 20, "meta": {"next_cursor": None}}

    run = _run(tmp_path, fetch, run_record_limit=1000)
    summary = _read(run, "run_summary.json")
    assert summary["rawRecordCount"] == 260
    assert summary["queryCount"] == summary["successfulQueryCount"] == 13
    assert summary["runRecordLimit"] == 1000
    assert summary["capReached"] is False
    assert run["publishable"] is True
    assert len(run["weeklyDigest"]["selectedPapers"]) == 1


@pytest.mark.parametrize("limit", [0, -1, True, 1.5, "1000"])
def test_invalid_limit_rejected_before_collection(tmp_path, limit):
    with pytest.raises(ValueError, match="positive integer"):
        _run(tmp_path, lambda _: pytest.fail("network called"), run_record_limit=limit)


@pytest.mark.parametrize("response", [None, [], {}, {"error": "bad request"}, {"results": None}])
def test_malformed_response_is_not_valid_empty_success(tmp_path, response):
    run = _run(tmp_path, lambda _: response)
    assert run["status"] == "failed"
    assert run["weeklyDigest"] is None
    raw = _read(run, "raw_openalex.json")
    assert raw["queries"][0]["pages"][0]["rawResponse"] == response


@pytest.mark.parametrize("problem", ["failed", "partial_success", "legacy_cap", "missing", "malformed", "mismatch", "errors"])
def test_publisher_rejects_unsafe_old_digest_without_overwriting(tmp_path, problem):
    run = _run(tmp_path / "runs", lambda _: {"results": [], "meta": {}})
    summary = _read(run, "run_summary.json")
    path = run["runDirectory"] / "run_summary.json"
    if problem in ("failed", "partial_success"):
        summary["status"] = problem
    elif problem == "legacy_cap":
        summary["capReached"] = True
    elif problem == "mismatch":
        summary["runId"] = "another-run"
    elif problem == "errors":
        summary["failedPageCount"] = 1
    path.write_text(json.dumps(summary), encoding="utf-8")
    if problem == "missing":
        path.unlink()
    elif problem == "malformed":
        path.write_text("{", encoding="utf-8")
    data = tmp_path / "web/data"
    (data / "digests").mkdir(parents=True)
    destination = data / "digests/2026-11-01.json"
    destination.write_bytes(b"existing valid edition")
    adapter = data / "digest-adapter.ts"
    adapter.write_bytes(b"existing adapter")
    calls = []
    with pytest.raises(ValueError, match="complete successful collection summary"):
        run_publication_workflow(run_directory=run["runDirectory"], repo_root=tmp_path,
                                 overwrite=True, runner=lambda *a, **k: calls.append(a))
    assert calls == []
    assert destination.read_bytes() == b"existing valid edition"
    assert adapter.read_bytes() == b"existing adapter"


def test_successful_outputs_remain_deterministic(tmp_path):
    def fetch(_):
        return {"results": [_work()], "meta": {}}
    runs = [_run(tmp_path / name, fetch) for name in ("first", "second")]
    outputs = []
    for run in runs:
        directory = run["runDirectory"]
        outputs.append({p.name: p.read_text(encoding="utf-8").replace(
            str(directory).replace("\\", "\\\\"), "<run>") for p in directory.glob("*.json")})
    assert outputs[0] == outputs[1]
