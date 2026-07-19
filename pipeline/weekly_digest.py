"""Weekly digest assembly helpers for selected ranked papers."""

from __future__ import annotations

from copy import deepcopy
from datetime import date, datetime
import os
from pathlib import Path
import tempfile
from typing import Any

from pipeline.run_storage import run_file_path, write_run_json

SCHEMA_VERSION = "pipeline-data-0.1"
PROCESSING_SUMMARY = "assembled_selected_ranked_records"

_WEEKLY_DIGEST_FILENAMES = (
    "weekly_digest.json",
    "weekly_digest_result.json",
)


def assemble_weekly_digest(
    ranked_payload: dict[str, Any],
    *,
    week_start: str,
    week_end: str,
    generated_at: str,
) -> dict[str, Any]:
    """Build deterministic weekly digest outputs from ranked_papers.json."""
    run_id, source_name, records = _validated_ranked_payload(ranked_payload)
    validated_week_start = _validated_date(week_start, "weekly digest requires valid weekStart")
    validated_week_end = _validated_date(week_end, "weekly digest requires valid weekEnd")
    if validated_week_start > validated_week_end:
        raise ValueError("weekly digest requires valid week range")
    validated_generated_at = _validated_datetime(generated_at)

    selected_papers = [deepcopy(record) for record in records if record["selected"] is True]
    selected_count = len(selected_papers)

    weekly_digest = {
        "schemaVersion": SCHEMA_VERSION,
        "runId": run_id,
        "sourceName": source_name,
        "weekStart": week_start,
        "weekEnd": week_end,
        "generatedAt": validated_generated_at,
        "selectedPapers": selected_papers,
    }
    weekly_digest_result = {
        "schemaVersion": SCHEMA_VERSION,
        "runId": run_id,
        "sourceName": source_name,
        "inputRankedCount": len(records),
        "selectedCount": selected_count,
        "digestPaperCount": selected_count,
        "weekStart": week_start,
        "weekEnd": week_end,
        "generatedAt": validated_generated_at,
        "processingSummary": PROCESSING_SUMMARY,
    }

    return {
        "weeklyDigest": weekly_digest,
        "weeklyDigestResult": weekly_digest_result,
    }


def write_weekly_digest_outputs(
    ranked_payload: dict[str, Any],
    *,
    run_directory: str | Path,
    week_start: str,
    week_end: str,
    generated_at: str,
) -> dict[str, Any]:
    """Write weekly_digest.json and weekly_digest_result.json."""
    outputs = assemble_weekly_digest(
        ranked_payload,
        week_start=week_start,
        week_end=week_end,
        generated_at=generated_at,
    )
    weekly_digest = outputs["weeklyDigest"]
    weekly_digest_result = outputs["weeklyDigestResult"]
    snapshots = _snapshot_output_files(run_directory)

    try:
        digest_path = write_run_json(run_directory, "weekly_digest.json", weekly_digest)
        result_path = write_run_json(run_directory, "weekly_digest_result.json", weekly_digest_result)
    except Exception:
        _restore_output_files(snapshots)
        raise

    return {
        "weeklyDigestPath": digest_path,
        "weeklyDigestResultPath": result_path,
        "inputRankedCount": weekly_digest_result["inputRankedCount"],
        "selectedCount": weekly_digest_result["selectedCount"],
        "digestPaperCount": weekly_digest_result["digestPaperCount"],
        "processingSummary": weekly_digest_result["processingSummary"],
    }


def _validated_ranked_payload(
    ranked_payload: dict[str, Any],
) -> tuple[str, str, list[dict[str, Any]]]:
    if not isinstance(ranked_payload, dict):
        raise ValueError("weekly digest requires ranked payload")

    run_id = _clean_string(ranked_payload.get("runId"))
    source_name = _clean_string(ranked_payload.get("sourceName"))
    records = ranked_payload.get("rankedRecords")
    if not run_id or not source_name or not isinstance(records, list):
        raise ValueError("weekly digest requires ranked records")

    for expected_rank, record in enumerate(records, start=1):
        _validate_ranked_record(
            record,
            expected_rank=expected_rank,
            run_id=run_id,
            source_name=source_name,
        )

    return run_id, source_name, records


def _validate_ranked_record(
    record: Any,
    *,
    expected_rank: int,
    run_id: str,
    source_name: str,
) -> None:
    if not isinstance(record, dict):
        raise ValueError("weekly digest requires valid ranked record")
    if record.get("runId") != run_id or record.get("sourceName") != source_name:
        raise ValueError("weekly digest requires valid ranked record")
    rank = record.get("rank")
    if isinstance(rank, bool) or not isinstance(rank, int) or rank != expected_rank:
        raise ValueError("weekly digest requires valid ranked record")
    if not isinstance(record.get("selected"), bool):
        raise ValueError("weekly digest requires valid ranked record")


def _validated_date(value: Any, message: str) -> date:
    if not isinstance(value, str):
        raise ValueError(message)
    try:
        return date.fromisoformat(value)
    except ValueError:
        raise ValueError(message) from None


def _validated_datetime(value: Any) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("weekly digest requires valid generatedAt")
    candidate = value.strip()
    try:
        datetime.fromisoformat(candidate.replace("Z", "+00:00"))
    except ValueError:
        raise ValueError("weekly digest requires valid generatedAt") from None
    return candidate


def _snapshot_output_files(run_directory: str | Path) -> dict[str, tuple[Path, bool, bytes | None]]:
    snapshots: dict[str, tuple[Path, bool, bytes | None]] = {}
    for filename in _WEEKLY_DIGEST_FILENAMES:
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
