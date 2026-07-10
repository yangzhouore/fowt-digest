"""Run directory and JSON file storage for the collector pipeline."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

RUN_FILE_NAMES = {
    "run_summary": "run_summary.json",
    "raw_openalex": "raw_openalex.json",
    "candidates": "candidates.json",
    "normalised": "normalised.json",
    "deduplication_result": "deduplication_result.json",
    "deduplicated_papers": "deduplicated_papers.json",
}


def create_run_directory(run_id: str, base_dir: Path | str = Path("pipeline/data/runs")) -> Path:
    """Create and return pipeline/data/runs/<runId>/ without overwriting a run."""
    if not run_id or not run_id.strip():
        raise ValueError("run_id is required")

    run_dir = Path(base_dir) / run_id
    run_dir.mkdir(parents=True, exist_ok=False)
    return run_dir


def write_run_json(run_dir: Path | str, file_key: str, data: Any) -> Path:
    """Write one contract-defined JSON file with stable formatting and UTF-8."""
    if file_key not in RUN_FILE_NAMES:
        allowed = ", ".join(sorted(RUN_FILE_NAMES))
        raise ValueError(f"unknown run file key '{file_key}'. Allowed keys: {allowed}")

    target = Path(run_dir) / RUN_FILE_NAMES[file_key]
    target.parent.mkdir(parents=True, exist_ok=True)
    temp_path = target.with_name(f".{target.name}.tmp")

    try:
        with temp_path.open("w", encoding="utf-8", newline="\n") as file:
            json.dump(data, file, ensure_ascii=False, indent=2, sort_keys=True)
            file.write("\n")
        os.replace(temp_path, target)
    finally:
        if temp_path.exists():
            temp_path.unlink()

    return target