"""Local run-directory storage helpers for the collector pipeline."""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from typing import Any

DEFAULT_RUNS_ROOT = Path("pipeline/data/runs")

SUPPORTED_RUN_FILENAMES = (
    "run_summary.json",
    "raw_openalex.json",
    "candidates.json",
    "normalised.json",
    "deduplication_result.json",
    "deduplicated_papers.json",
    "classified_papers.json",
    "classification_result.json",
    "ranked_papers.json",
    "ranking_result.json",
)


def create_run_directory(
    run_id: str, *, runs_root: str | Path = DEFAULT_RUNS_ROOT
) -> Path:
    """Create and return the contract run directory for a new pipeline run."""
    run_directory = Path(runs_root) / run_id
    run_directory.mkdir(parents=True, exist_ok=False)
    return run_directory


def run_file_path(run_directory: str | Path, filename: str) -> Path:
    """Return the path for a supported run output filename."""
    _validate_supported_filename(filename)
    return Path(run_directory) / filename


def write_run_json(run_directory: str | Path, filename: str, data: Any) -> Path:
    """Write supported run JSON using UTF-8 and atomic replacement."""
    destination = run_file_path(run_directory, filename)
    temp_path: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding="utf-8",
            newline="\n",
            dir=destination.parent,
            prefix=f".{destination.name}.",
            suffix=".tmp",
            delete=False,
        ) as temp_file:
            temp_path = Path(temp_file.name)
            json.dump(data, temp_file, ensure_ascii=False, indent=2, sort_keys=True)
            temp_file.write("\n")
            temp_file.flush()
            os.fsync(temp_file.fileno())

        os.replace(temp_path, destination)
        return destination
    except Exception:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
        raise


def _validate_supported_filename(filename: str) -> None:
    if filename not in SUPPORTED_RUN_FILENAMES:
        raise ValueError(f"unsupported run output filename: {filename}")
