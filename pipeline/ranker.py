"""Deterministic ranking and selection helpers for classified papers."""

from __future__ import annotations

from copy import deepcopy
from datetime import date
import os
from pathlib import Path
import tempfile
from typing import Any

from pipeline.relevance_classifier import NOT_RELEVANT, POSSIBLY_RELEVANT, RELEVANT
from pipeline.run_storage import run_file_path, write_run_json

SCHEMA_VERSION = "pipeline-data-0.1"

SELECTION_REASON_SELECTED = "selected_within_limit"
SELECTION_REASON_BELOW_LIMIT = "not_selected_below_limit"
SELECTION_REASON_NOT_RELEVANT = "not_selected_not_relevant"

_CLASSIFICATION_PRIORITY = {
    RELEVANT: 0,
    POSSIBLY_RELEVANT: 1,
    NOT_RELEVANT: 2,
}

_RANKING_FILENAMES = (
    "ranked_papers.json",
    "ranking_result.json",
)


def rank_classified_papers(
    classified_payload: dict[str, Any],
    *,
    selection_limit: int,
) -> dict[str, Any]:
    """Build deterministic ranking outputs from classified_papers.json."""
    limit = _validated_selection_limit(selection_limit)
    run_id, source_name, records = _validated_payload(classified_payload)

    indexed_records = [(index, deepcopy(record)) for index, record in enumerate(records)]
    sorted_records = sorted(indexed_records, key=_sort_key)
    counts = {classification: 0 for classification in _CLASSIFICATION_PRIORITY}
    ranked_records: list[dict[str, Any]] = []
    selected_count = 0

    for rank, (_, record) in enumerate(sorted_records, start=1):
        classification = record["relevanceAssessment"]["classification"]
        counts[classification] += 1
        selected, reason = _selection(classification, selected_count, limit)
        if selected:
            selected_count += 1

        ranked_record = deepcopy(record)
        ranked_record["rank"] = rank
        ranked_record["selected"] = selected
        ranked_record["selectionReason"] = reason
        ranked_records.append(ranked_record)

    ranked_payload = {
        "runId": run_id,
        "sourceName": source_name,
        "selectionLimit": limit,
        "rankedRecords": ranked_records,
    }
    ranking_result = {
        "schemaVersion": SCHEMA_VERSION,
        "runId": run_id,
        "sourceName": source_name,
        "inputCount": len(records),
        "rankedCount": len(ranked_records),
        "selectedCount": selected_count,
        "selectionLimit": limit,
        "classificationCounts": counts,
    }

    return {
        "rankedPayload": ranked_payload,
        "rankingResult": ranking_result,
    }


def write_ranking_outputs(
    classified_payload: dict[str, Any],
    *,
    run_directory: str | Path,
    selection_limit: int,
) -> dict[str, Any]:
    """Write ranked_papers.json and ranking_result.json."""
    outputs = rank_classified_papers(classified_payload, selection_limit=selection_limit)
    ranked_payload = outputs["rankedPayload"]
    ranking_result = outputs["rankingResult"]
    snapshots = _snapshot_output_files(run_directory)

    try:
        ranked_path = write_run_json(run_directory, "ranked_papers.json", ranked_payload)
        result_path = write_run_json(run_directory, "ranking_result.json", ranking_result)
    except Exception:
        _restore_output_files(snapshots)
        raise

    return {
        "rankedPapersPath": ranked_path,
        "rankingResultPath": result_path,
        "inputCount": ranking_result["inputCount"],
        "rankedCount": ranking_result["rankedCount"],
        "selectedCount": ranking_result["selectedCount"],
        "selectionLimit": ranking_result["selectionLimit"],
        "classificationCounts": ranking_result["classificationCounts"],
    }


def _validated_selection_limit(selection_limit: Any) -> int:
    if isinstance(selection_limit, bool) or not isinstance(selection_limit, int):
        raise ValueError("ranking requires valid selection limit")
    if selection_limit < 0:
        raise ValueError("ranking requires valid selection limit")
    return selection_limit


def _validated_payload(
    classified_payload: dict[str, Any],
) -> tuple[str, str, list[dict[str, Any]]]:
    if not isinstance(classified_payload, dict):
        raise ValueError("ranking requires classified payload")

    run_id = _clean_string(classified_payload.get("runId"))
    source_name = _clean_string(classified_payload.get("sourceName"))
    records = classified_payload.get("classifiedRecords")
    if not run_id or not source_name or not isinstance(records, list):
        raise ValueError("ranking requires classified records")

    for record in records:
        _validate_record(record, run_id=run_id, source_name=source_name)

    return run_id, source_name, records


def _validate_record(record: Any, *, run_id: str, source_name: str) -> None:
    if not isinstance(record, dict):
        raise ValueError("ranking requires valid classified paper")

    for field in ("paperId", "runId", "sourceName", "title", "publishedDate"):
        if not _clean_string(record.get(field)):
            raise ValueError("ranking requires valid classified paper")

    if record.get("runId") != run_id or record.get("sourceName") != source_name:
        raise ValueError("ranking requires valid classified paper")

    _published_date(record)

    assessment = record.get("relevanceAssessment")
    if not isinstance(assessment, dict):
        raise ValueError("ranking requires valid relevance assessment")

    classification = assessment.get("classification")
    if classification not in _CLASSIFICATION_PRIORITY:
        raise ValueError("ranking requires valid relevance assessment")


def _sort_key(indexed_record: tuple[int, dict[str, Any]]) -> tuple[int, int, str]:
    _, record = indexed_record
    classification = record["relevanceAssessment"]["classification"]
    return (
        _CLASSIFICATION_PRIORITY[classification],
        -_published_date(record).toordinal(),
        record["paperId"],
    )


def _selection(classification: str, selected_count: int, selection_limit: int) -> tuple[bool, str]:
    if classification == NOT_RELEVANT:
        return False, SELECTION_REASON_NOT_RELEVANT
    if selected_count < selection_limit:
        return True, SELECTION_REASON_SELECTED
    return False, SELECTION_REASON_BELOW_LIMIT


def _published_date(record: dict[str, Any]) -> date:
    try:
        return date.fromisoformat(record["publishedDate"])
    except (TypeError, ValueError):
        raise ValueError("ranking requires valid classified paper") from None


def _snapshot_output_files(run_directory: str | Path) -> dict[str, tuple[Path, bool, bytes | None]]:
    snapshots: dict[str, tuple[Path, bool, bytes | None]] = {}
    for filename in _RANKING_FILENAMES:
        path = run_file_path(run_directory, filename)
        exists = path.exists()
        snapshots[filename] = (path, exists, path.read_bytes() if exists else None)
    return snapshots


def _restore_output_files(snapshots: dict[str, tuple[Path, bool, bytes | None]]) -> None:
    for path, existed, content in snapshots.values():
        if existed:
            _replace_bytes(path, content or b"")
        else:
            path.unlink(missing_ok=True)


def _replace_bytes(path: Path, content: bytes) -> None:
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            "wb",
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".rollback.tmp",
            delete=False,
        ) as temp_file:
            temp_path = Path(temp_file.name)
            temp_file.write(content)
            temp_file.flush()
            os.fsync(temp_file.fileno())
        os.replace(temp_path, path)
    except Exception:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
        raise


def _clean_string(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    value = value.strip()
    return value or None
