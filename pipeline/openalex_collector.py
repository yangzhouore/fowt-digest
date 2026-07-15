"""OpenAlex collection orchestration for raw response storage."""

from __future__ import annotations

from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any, Callable

from pipeline.ids import make_run_id
from pipeline.openalex_client import fetch_openalex_json
from pipeline.openalex_query import iter_keyword_queries
from pipeline.run_storage import DEFAULT_RUNS_ROOT, create_run_directory, write_run_json

SOURCE_NAME = "openalex"
SUCCESS_STATUS = "success"
PARTIAL_SUCCESS_STATUS = "partial_success"
FAILED_STATUS = "failed"


def collect_openalex_raw(
    *,
    from_publication_date: date,
    to_publication_date: date,
    runs_root: str | Path = DEFAULT_RUNS_ROOT,
    fetch_json: Callable[[str], Any] = fetch_openalex_json,
    started_at: datetime | None = None,
    completed_at: datetime | None = None,
) -> dict[str, Any]:
    """Run one raw OpenAlex collection pass and write contract output files."""
    started = _normalise_utc(started_at or datetime.now(UTC))
    run_id = make_run_id(started)
    run_directory = create_run_directory(run_id, runs_root=runs_root)

    queries = iter_keyword_queries(
        from_publication_date=from_publication_date,
        to_publication_date=to_publication_date,
    )

    raw_queries: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []

    for index, query in enumerate(queries):
        query_record: dict[str, Any] = {
            "queryGroup": query["group"],
            "queryIndex": index,
            "queryTerm": query["term"],
            "queryUrl": query["url"],
            "sourceName": SOURCE_NAME,
        }

        try:
            query_record["rawResponse"] = fetch_json(str(query["url"]))
            query_record["status"] = SUCCESS_STATUS
        except Exception as error:
            error_record = _error_record(query_record, error)
            query_record["error"] = error_record["error"]
            query_record["status"] = FAILED_STATUS
            errors.append(error_record)

        raw_queries.append(query_record)

    successful_query_count = sum(
        1 for query in raw_queries if query["status"] == SUCCESS_STATUS
    )
    failed_query_count = len(raw_queries) - successful_query_count
    status = _run_status(successful_query_count, failed_query_count)
    completed = _normalise_utc(completed_at or datetime.now(UTC))

    raw_output = {
        "queries": raw_queries,
        "runId": run_id,
        "sourceName": SOURCE_NAME,
    }
    run_summary = {
        "completedAt": _utc_isoformat(completed),
        "dateWindow": {
            "fromPublicationDate": from_publication_date.isoformat(),
            "toPublicationDate": to_publication_date.isoformat(),
        },
        "errors": errors,
        "failedQueryCount": failed_query_count,
        "outputFiles": ["raw_openalex.json", "run_summary.json"],
        "queryCount": len(raw_queries),
        "runId": run_id,
        "sourceName": SOURCE_NAME,
        "startedAt": _utc_isoformat(started),
        "status": status,
        "successfulQueryCount": successful_query_count,
    }

    write_run_json(run_directory, "raw_openalex.json", raw_output)
    write_run_json(run_directory, "run_summary.json", run_summary)

    return {
        "failedQueryCount": failed_query_count,
        "queryCount": len(raw_queries),
        "runDirectory": str(run_directory),
        "runId": run_id,
        "status": status,
        "successfulQueryCount": successful_query_count,
    }


def _error_record(query_record: dict[str, Any], error: Exception) -> dict[str, Any]:
    return {
        "error": {
            "message": str(error),
            "type": error.__class__.__name__,
        },
        "queryGroup": query_record["queryGroup"],
        "queryIndex": query_record["queryIndex"],
        "queryTerm": query_record["queryTerm"],
        "queryUrl": query_record["queryUrl"],
    }


def _run_status(successful_query_count: int, failed_query_count: int) -> str:
    if failed_query_count == 0:
        return SUCCESS_STATUS
    if successful_query_count == 0:
        return FAILED_STATUS
    return PARTIAL_SUCCESS_STATUS


def _normalise_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _utc_isoformat(value: datetime) -> str:
    return value.isoformat().replace("+00:00", "Z")
