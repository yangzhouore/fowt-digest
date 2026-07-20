"""Thin orchestration for the deterministic weekly pipeline."""

from __future__ import annotations

from datetime import date, datetime
import json
from pathlib import Path
import time
from typing import Any, Callable

from pipeline.openalex_client import fetch_openalex_json
from pipeline.openalex_collector import (
    DEFAULT_REQUEST_DELAY_SECONDS,
    collect_openalex_raw,
)
from pipeline.normaliser import write_normalisation_outputs
from pipeline.deduplicator import write_deduplication_outputs
from pipeline.relevance_classifier import write_classification_outputs
from pipeline.ranker import write_ranking_outputs
from pipeline.run_storage import DEFAULT_RUNS_ROOT, run_file_path
from pipeline.weekly_digest import write_weekly_digest_outputs


def run_weekly_pipeline(
    *,
    from_publication_date: date,
    to_publication_date: date,
    discovery_date: str,
    classified_at: str,
    selection_limit: int,
    week_start: str,
    week_end: str,
    generated_at: str,
    runs_root: str | Path = DEFAULT_RUNS_ROOT,
    fetch_json: Callable[[str], Any] = fetch_openalex_json,
    sleep: Callable[[float], None] = time.sleep,
    request_delay_seconds: float = DEFAULT_REQUEST_DELAY_SECONDS,
    started_at: datetime | None = None,
    completed_at: datetime | None = None,
) -> dict[str, Any]:
    """Run the accepted deterministic stages in file-contract order."""
    collection_result = collect_openalex_raw(
        from_publication_date=from_publication_date,
        to_publication_date=to_publication_date,
        runs_root=runs_root,
        fetch_json=fetch_json,
        sleep=sleep,
        request_delay_seconds=request_delay_seconds,
        started_at=started_at,
        completed_at=completed_at,
    )
    run_id = collection_result["runId"]
    run_directory = Path(collection_result["runDirectory"])

    raw_path = run_file_path(run_directory, "raw_openalex.json")
    raw_payload = _read_json(raw_path)

    normalisation_result = write_normalisation_outputs(
        raw_payload,
        run_directory=run_directory,
        run_id=run_id,
        raw_source_path=str(raw_path),
        discovery_date=discovery_date,
    )
    normalised_payload = _read_json(run_file_path(run_directory, "normalised.json"))

    deduplication_result = write_deduplication_outputs(
        normalised_payload,
        run_directory=run_directory,
    )
    deduplicated_payload = _read_json(run_file_path(run_directory, "deduplicated_papers.json"))

    classification_result = write_classification_outputs(
        deduplicated_payload,
        run_directory=run_directory,
        classified_at=classified_at,
    )
    classified_payload = _read_json(run_file_path(run_directory, "classified_papers.json"))

    ranking_result = write_ranking_outputs(
        classified_payload,
        run_directory=run_directory,
        selection_limit=selection_limit,
    )
    ranked_payload = _read_json(run_file_path(run_directory, "ranked_papers.json"))

    weekly_digest_result = write_weekly_digest_outputs(
        ranked_payload,
        run_directory=run_directory,
        week_start=week_start,
        week_end=week_end,
        generated_at=generated_at,
    )
    weekly_digest_payload = _read_json(run_file_path(run_directory, "weekly_digest.json"))
    weekly_digest_result_payload = _read_json(
        run_file_path(run_directory, "weekly_digest_result.json")
    )

    return {
        "runId": run_id,
        "runDirectory": run_directory,
        "status": "completed",
        "stageResults": {
            "collection": collection_result,
            "normalisation": normalisation_result,
            "deduplication": deduplication_result,
            "classification": classification_result,
            "ranking": ranking_result,
            "weeklyDigest": weekly_digest_result,
        },
        "weeklyDigest": weekly_digest_payload,
        "weeklyDigestResult": weekly_digest_result_payload,
    }


def _read_json(path: str | Path) -> Any:
    with Path(path).open("r", encoding="utf-8") as file:
        return json.load(file)
