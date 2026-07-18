"""Deterministic FOWT relevance classification helpers."""

from __future__ import annotations

from copy import deepcopy
import os
from pathlib import Path
import re
import tempfile
from typing import Any

from pipeline.run_storage import run_file_path, write_run_json

SCHEMA_VERSION = "pipeline-data-0.1"
CLASSIFIED_STATUS = "classified"

RELEVANT = "Relevant"
POSSIBLY_RELEVANT = "Possibly Relevant"
NOT_RELEVANT = "Not Relevant"

_CLASSIFICATION_FILENAMES = (
    "classified_papers.json",
    "classification_result.json",
)

_CLASSIFICATION_ORDER = (RELEVANT, POSSIBLY_RELEVANT, NOT_RELEVANT)

_STRONG_FOWT_PHRASES = (
    "floating offshore wind",
    "floating wind turbine",
    "floating wind turbines",
    "floating wind farm",
    "floating wind farms",
    "fowt",
)

_WIND_TERMS = (
    "offshore wind",
    "wind turbine",
    "wind turbines",
    "wind farm",
    "wind farms",
    "wind energy",
    "wind power",
)

_FLOATING_TERMS = (
    "floating",
    "floating platform",
    "semi submersible",
    "semisubmersible",
    "spar",
    "tension leg platform",
    "tlp",
    "mooring",
    "dynamic cable",
    "substructure",
)

_FIELD_ORDER = ("title", "abstract", "topicTags")


def classify_deduplicated_papers(
    deduplicated_payload: dict[str, Any],
    *,
    classified_at: str,
) -> dict[str, Any]:
    """Build deterministic classification outputs from deduplicated_papers.json."""
    run_id, source_name, records = _validated_payload(deduplicated_payload)
    generated_at = _required_string(classified_at, "classification requires generated timestamp")

    classified_records: list[dict[str, Any]] = []
    counts = {classification: 0 for classification in _CLASSIFICATION_ORDER}

    for record in records:
        classification = _classify_record(record)
        counts[classification["classification"]] += 1

        classified_record = deepcopy(record)
        classified_record["processingStatus"] = CLASSIFIED_STATUS
        classified_record["relevanceAssessment"] = {
            "assessmentId": f"relevance_{record['paperId']}",
            "paperId": record["paperId"],
            "classification": classification["classification"],
            "confidence": classification["confidence"],
            "reason": classification["reason"],
            "topicTags": list(record.get("topicTags", [])),
            "evidenceBasis": classification["evidenceBasis"],
            "modelName": None,
            "promptVersion": None,
            "generatedAt": generated_at,
        }
        classified_records.append(classified_record)

    classified_payload = {
        "runId": run_id,
        "sourceName": source_name,
        "classifiedRecords": classified_records,
    }
    classification_result = {
        "schemaVersion": SCHEMA_VERSION,
        "runId": run_id,
        "sourceName": source_name,
        "inputCount": len(records),
        "classifiedCount": len(classified_records),
        "classificationCounts": counts,
    }

    return {
        "classifiedPayload": classified_payload,
        "classificationResult": classification_result,
    }


def write_classification_outputs(
    deduplicated_payload: dict[str, Any],
    *,
    run_directory: str | Path,
    classified_at: str,
) -> dict[str, Any]:
    """Write classified_papers.json and classification_result.json."""
    outputs = classify_deduplicated_papers(
        deduplicated_payload, classified_at=classified_at
    )
    classified_payload = outputs["classifiedPayload"]
    classification_result = outputs["classificationResult"]
    snapshots = _snapshot_output_files(run_directory)

    try:
        classified_path = write_run_json(
            run_directory, "classified_papers.json", classified_payload
        )
        result_path = write_run_json(
            run_directory, "classification_result.json", classification_result
        )
    except Exception:
        _restore_output_files(snapshots)
        raise

    return {
        "classifiedPapersPath": classified_path,
        "classificationResultPath": result_path,
        "inputCount": classification_result["inputCount"],
        "classifiedCount": classification_result["classifiedCount"],
        "classificationCounts": classification_result["classificationCounts"],
    }


def _validated_payload(
    deduplicated_payload: dict[str, Any],
) -> tuple[str, str, list[dict[str, Any]]]:
    if not isinstance(deduplicated_payload, dict):
        raise ValueError("classification requires deduplicated payload")

    run_id = _clean_string(deduplicated_payload.get("runId"))
    source_name = _clean_string(deduplicated_payload.get("sourceName"))
    records = deduplicated_payload.get("deduplicatedRecords")
    if not run_id or not source_name or not isinstance(records, list):
        raise ValueError("classification requires deduplicated records")

    for record in records:
        _validate_record(record, run_id=run_id, source_name=source_name)

    return run_id, source_name, records


def _validate_record(record: Any, *, run_id: str, source_name: str) -> None:
    if not isinstance(record, dict):
        raise ValueError("classification requires valid paper metadata")

    for field in ("paperId", "runId", "sourceName", "title", "processingStatus"):
        if not _clean_string(record.get(field)):
            raise ValueError("classification requires valid paper metadata")

    if record.get("runId") != run_id or record.get("sourceName") != source_name:
        raise ValueError("classification requires valid paper metadata")

    abstract = record.get("abstract")
    if abstract is not None and not isinstance(abstract, str):
        raise ValueError("classification requires valid paper metadata")

    topic_tags = record.get("topicTags")
    if not isinstance(topic_tags, list) or any(
        not isinstance(tag, str) for tag in topic_tags
    ):
        raise ValueError("classification requires valid paper metadata")


def _classify_record(record: dict[str, Any]) -> dict[str, Any]:
    fields = _normalised_fields(record)

    if _has_any(fields["title"], _STRONG_FOWT_PHRASES):
        return _classification(RELEVANT, 0.9, "relevant_title_fowt_phrase", ["title"])

    if _has_any(fields["topicTags"], _STRONG_FOWT_PHRASES):
        return _classification(
            RELEVANT, 0.86, "relevant_topic_fowt_phrase", ["topicTags"]
        )

    if _has_any(fields["title"], _WIND_TERMS) and _has_any(
        fields["title"], _FLOATING_TERMS
    ):
        return _classification(
            RELEVANT, 0.84, "relevant_title_combined_fowt_signals", ["title"]
        )

    if _has_any(fields["abstract"], _STRONG_FOWT_PHRASES):
        return _classification(
            POSSIBLY_RELEVANT,
            0.6,
            "possibly_relevant_abstract_only_fowt_phrase",
            ["abstract"],
        )

    combined = " ".join(fields[field] for field in _FIELD_ORDER)
    if _has_any(combined, _WIND_TERMS) and _has_any(combined, _FLOATING_TERMS):
        return _classification(
            POSSIBLY_RELEVANT,
            0.55,
            "possibly_relevant_combined_weak_signals",
            _evidence_basis(fields, _WIND_TERMS + _FLOATING_TERMS),
        )

    if _has_any(combined, ("offshore wind",)):
        return _classification(
            POSSIBLY_RELEVANT,
            0.45,
            "possibly_relevant_offshore_wind_only",
            _evidence_basis(fields, ("offshore wind",)),
        )

    return _classification(NOT_RELEVANT, 0.1, "not_relevant_no_fowt_signals", [])


def _classification(
    label: str, confidence: float, reason: str, evidence_basis: list[str]
) -> dict[str, Any]:
    return {
        "classification": label,
        "confidence": confidence,
        "reason": reason,
        "evidenceBasis": evidence_basis,
    }


def _normalised_fields(record: dict[str, Any]) -> dict[str, str]:
    return {
        "title": _normalise_text(record.get("title")),
        "abstract": _normalise_text(record.get("abstract")),
        "topicTags": _normalise_text(" ".join(record.get("topicTags", []))),
    }


def _normalise_text(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", value.casefold())).strip()


def _has_any(text: str, terms: tuple[str, ...]) -> bool:
    padded = f" {text} "
    return any(f" {_normalise_text(term)} " in padded for term in terms)


def _evidence_basis(fields: dict[str, str], terms: tuple[str, ...]) -> list[str]:
    return [field for field in _FIELD_ORDER if _has_any(fields[field], terms)]


def _snapshot_output_files(run_directory: str | Path) -> dict[str, tuple[Path, bool, bytes | None]]:
    snapshots: dict[str, tuple[Path, bool, bytes | None]] = {}
    for filename in _CLASSIFICATION_FILENAMES:
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


def _required_string(value: Any, message: str) -> str:
    cleaned = _clean_string(value)
    if not cleaned:
        raise ValueError(message)
    return cleaned


def _clean_string(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    value = value.strip()
    return value or None
