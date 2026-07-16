"""OpenAlex collection orchestration for raw response storage."""

from __future__ import annotations

import time
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any, Callable

from pipeline.ids import make_run_id
from pipeline.openalex_client import fetch_openalex_json
from pipeline.openalex_query import (
    DEFAULT_CURSOR,
    DEFAULT_PER_PAGE,
    build_query_url,
    build_search_params,
    iter_keyword_queries,
)
from pipeline.run_storage import DEFAULT_RUNS_ROOT, create_run_directory, write_run_json

SOURCE_NAME = "openalex"
SUCCESS_STATUS = "success"
PARTIAL_STATUS = "partial"
PARTIAL_SUCCESS_STATUS = "partial_success"
FAILED_STATUS = "failed"
RUN_RECORD_LIMIT = 200
DEFAULT_REQUEST_DELAY_SECONDS = 1.0


def collect_openalex_raw(
    *,
    from_publication_date: date,
    to_publication_date: date,
    runs_root: str | Path = DEFAULT_RUNS_ROOT,
    fetch_json: Callable[[str], Any] = fetch_openalex_json,
    sleep: Callable[[float], None] = time.sleep,
    request_delay_seconds: float = DEFAULT_REQUEST_DELAY_SECONDS,
    started_at: datetime | None = None,
    completed_at: datetime | None = None,
) -> dict[str, Any]:
    """Run one raw OpenAlex collection pass and write contract output files."""
    if request_delay_seconds < DEFAULT_REQUEST_DELAY_SECONDS:
        raise ValueError("request_delay_seconds must be at least 1.0")

    started = _normalise_utc(started_at or datetime.now(UTC))
    run_id = make_run_id(started)
    run_directory = create_run_directory(run_id, runs_root=runs_root)

    queries = iter_keyword_queries(
        from_publication_date=from_publication_date,
        to_publication_date=to_publication_date,
    )

    raw_queries: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    raw_record_count = 0
    cap_reached = False
    has_made_request = False

    for query_index, query in enumerate(queries):
        if cap_reached:
            break

        (
            query_record,
            query_errors,
            query_record_count,
            query_capped,
            has_made_request,
        ) = _collect_query_pages(
            query_group=str(query["group"]),
            query_index=query_index,
            query_term=str(query["term"]),
            from_publication_date=from_publication_date,
            to_publication_date=to_publication_date,
            fetch_json=fetch_json,
            sleep=sleep,
            request_delay_seconds=request_delay_seconds,
            raw_record_count=raw_record_count,
            has_made_request=has_made_request,
        )
        raw_queries.append(query_record)
        errors.extend(query_errors)
        raw_record_count += query_record_count
        cap_reached = query_capped

    successful_query_count = sum(
        1 for query in raw_queries if query["status"] == SUCCESS_STATUS
    )
    failed_query_count = sum(1 for query in raw_queries if query["status"] == FAILED_STATUS)
    partial_query_count = sum(1 for query in raw_queries if query["status"] == PARTIAL_STATUS)
    failed_or_partial_query_count = failed_query_count + partial_query_count
    successful_page_count = sum(
        1
        for query in raw_queries
        for page in query["pages"]
        if page["status"] == SUCCESS_STATUS
    )
    failed_page_count = sum(
        1
        for query in raw_queries
        for page in query["pages"]
        if page["status"] == FAILED_STATUS
    )
    status = _run_status(successful_page_count, failed_or_partial_query_count)
    completed = _normalise_utc(completed_at or datetime.now(UTC))

    raw_output = {
        "queries": raw_queries,
        "runId": run_id,
        "sourceName": SOURCE_NAME,
    }
    run_summary = {
        "capReached": cap_reached,
        "completedAt": _utc_isoformat(completed),
        "dateWindow": {
            "fromPublicationDate": from_publication_date.isoformat(),
            "toPublicationDate": to_publication_date.isoformat(),
        },
        "errors": errors,
        "failedPageCount": failed_page_count,
        "failedQueryCount": failed_query_count,
        "outputFiles": ["raw_openalex.json", "run_summary.json"],
        "pageSize": DEFAULT_PER_PAGE,
        "partialQueryCount": partial_query_count,
        "queryCount": len(raw_queries),
        "rawRecordCount": raw_record_count,
        "runId": run_id,
        "runRecordLimit": RUN_RECORD_LIMIT,
        "sourceName": SOURCE_NAME,
        "startedAt": _utc_isoformat(started),
        "status": status,
        "successfulPageCount": successful_page_count,
        "successfulQueryCount": successful_query_count,
    }

    write_run_json(run_directory, "raw_openalex.json", raw_output)
    write_run_json(run_directory, "run_summary.json", run_summary)

    return {
        "capReached": cap_reached,
        "failedPageCount": failed_page_count,
        "failedQueryCount": failed_query_count,
        "partialQueryCount": partial_query_count,
        "queryCount": len(raw_queries),
        "rawRecordCount": raw_record_count,
        "runDirectory": str(run_directory),
        "runId": run_id,
        "status": status,
        "successfulPageCount": successful_page_count,
        "successfulQueryCount": successful_query_count,
    }


def _collect_query_pages(
    *,
    query_group: str,
    query_index: int,
    query_term: str,
    from_publication_date: date,
    to_publication_date: date,
    fetch_json: Callable[[str], Any],
    sleep: Callable[[float], None],
    request_delay_seconds: float,
    raw_record_count: int,
    has_made_request: bool,
) -> tuple[dict[str, Any], list[dict[str, Any]], int, bool, bool]:
    pages: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    query_record_count = 0
    request_cursor = DEFAULT_CURSOR
    page_index = 0
    cap_reached = False

    while True:
        query_url = _query_url(
            query_term=query_term,
            from_publication_date=from_publication_date,
            to_publication_date=to_publication_date,
            cursor=request_cursor,
        )
        page_record: dict[str, Any] = {
            "pageIndex": page_index,
            "queryGroup": query_group,
            "queryIndex": query_index,
            "queryTerm": query_term,
            "queryUrl": query_url,
            "requestCursor": request_cursor,
            "sourceName": SOURCE_NAME,
        }

        try:
            if has_made_request:
                sleep(request_delay_seconds)
            has_made_request = True
            raw_response = fetch_json(query_url)
        except Exception as error:
            error_record = _error_record(page_record, error)
            page_record["error"] = error_record["error"]
            page_record["status"] = FAILED_STATUS
            pages.append(page_record)
            errors.append(error_record)
            break

        results_count = _results_count(raw_response)
        next_cursor = _next_cursor(raw_response)
        page_record["nextCursor"] = next_cursor
        page_record["rawResponse"] = raw_response
        page_record["recordCount"] = results_count
        page_record["status"] = SUCCESS_STATUS
        pages.append(page_record)
        query_record_count += results_count

        if raw_record_count + query_record_count >= RUN_RECORD_LIMIT:
            cap_reached = True
            break
        if results_count == 0:
            break
        if not next_cursor:
            break

        request_cursor = next_cursor
        page_index += 1

    query_record = {
        "pageCount": len(pages),
        "pages": pages,
        "queryGroup": query_group,
        "queryIndex": query_index,
        "queryTerm": query_term,
        "recordCount": query_record_count,
        "sourceName": SOURCE_NAME,
        "status": _query_status(pages),
    }
    return query_record, errors, query_record_count, cap_reached, has_made_request


def _query_url(
    *,
    query_term: str,
    from_publication_date: date,
    to_publication_date: date,
    cursor: str,
) -> str:
    params = build_search_params(
        query_term,
        from_publication_date=from_publication_date,
        to_publication_date=to_publication_date,
        per_page=DEFAULT_PER_PAGE,
        cursor=cursor,
    )
    return build_query_url(params)


def _next_cursor(raw_response: Any) -> str | None:
    if not isinstance(raw_response, dict):
        return None
    meta = raw_response.get("meta")
    if not isinstance(meta, dict):
        return None
    next_cursor = meta.get("next_cursor")
    if next_cursor is None:
        return None
    if not isinstance(next_cursor, str):
        return str(next_cursor)
    return next_cursor


def _results_count(raw_response: Any) -> int:
    if not isinstance(raw_response, dict):
        return 0
    results = raw_response.get("results")
    if not isinstance(results, list):
        return 0
    return len(results)


def _query_status(pages: list[dict[str, Any]]) -> str:
    successful_page_count = sum(1 for page in pages if page["status"] == SUCCESS_STATUS)
    failed_page_count = sum(1 for page in pages if page["status"] == FAILED_STATUS)
    if failed_page_count == 0:
        return SUCCESS_STATUS
    if successful_page_count == 0:
        return FAILED_STATUS
    return PARTIAL_STATUS


def _error_record(page_record: dict[str, Any], error: Exception) -> dict[str, Any]:
    return {
        "error": {
            "message": str(error),
            "type": error.__class__.__name__,
        },
        "pageIndex": page_record["pageIndex"],
        "queryGroup": page_record["queryGroup"],
        "queryIndex": page_record["queryIndex"],
        "queryTerm": page_record["queryTerm"],
        "queryUrl": page_record["queryUrl"],
        "requestCursor": page_record["requestCursor"],
    }


def _run_status(successful_page_count: int, failed_or_partial_query_count: int) -> str:
    if failed_or_partial_query_count == 0:
        return SUCCESS_STATUS
    if successful_page_count == 0:
        return FAILED_STATUS
    return PARTIAL_SUCCESS_STATUS


def _normalise_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _utc_isoformat(value: datetime) -> str:
    return value.isoformat().replace("+00:00", "Z")
