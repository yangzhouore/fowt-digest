"""Deterministic scoring, ranking and selection helpers for classified papers."""

from __future__ import annotations

from copy import deepcopy
from datetime import date
import os
from pathlib import Path
import re
import tempfile
from typing import Any

from pipeline.relevance_classifier import NOT_RELEVANT, POSSIBLY_RELEVANT, RELEVANT
from pipeline.run_storage import run_file_path, write_run_json

SCHEMA_VERSION = "pipeline-data-0.1"

SELECTION_REASON_SELECTED = "selected_within_limit"
SELECTION_REASON_BELOW_LIMIT = "not_selected_below_limit"
SELECTION_REASON_NOT_RELEVANT = "not_selected_not_relevant"

SCORE_MODEL_ID = "research_selection_score_v1"
SCORE_COMPONENTS = (
    ("fowt_relevance", "FOWT relevance", 35),
    ("technical_specificity", "Technical specificity", 25),
    ("research_value", "Research value", 15),
    ("venue_quality", "Venue quality", 10),
    ("metadata_quality", "Metadata quality", 10),
    ("recency", "Recency", 5),
)

_CLASSIFICATION_PRIORITY = {
    RELEVANT: 0,
    POSSIBLY_RELEVANT: 1,
    NOT_RELEVANT: 2,
}

_STRONG_FOWT_PHRASES = (
    "floating offshore wind",
    "floating wind turbine",
    "floating wind turbines",
    "floating wind farm",
    "floating wind farms",
    "fowt",
    "fowfs",
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
    "semi-submersible",
    "semisubmersible",
    "spar",
    "tension leg platform",
    "tension-leg platform",
    "tlp",
    "mooring",
    "dynamic cable",
    "substructure",
)

_TECHNICAL_SIGNAL_GROUPS = {
    "aerodynamics": ("aerodynamic", "aerodynamics", "wake", "stall", "blade", "inflow"),
    "hydrodynamics": ("hydrodynamic", "wave", "waves", "seakeeping", "diffraction"),
    "station_keeping": ("mooring", "anchor", "anchoring", "catenary", "tension leg", "tlp"),
    "structures": ("structural", "fatigue", "load", "loads", "vibration", "tower"),
    "controls": ("control", "controller", "pitch", "yaw", "derating", "wake steering"),
    "platform": ("platform", "substructure", "semi submersible", "spar", "barge"),
    "electrical": ("dynamic cable", "cable", "grid", "hvdc", "export cable"),
    "numerical_methods": ("cfd", "simulation", "model", "openfast", "floris", "benchmark"),
    "economics": ("lcoe", "cost", "economic", "optimization", "optimisation"),
}

_RESEARCH_VALUE_GROUPS = {
    "validation": ("validation", "validated", "benchmark", "comparison", "experimental"),
    "dataset": ("dataset", "data", "code", "reproducible", "open source"),
    "modelling": ("model", "simulation", "numerical", "cfd", "openfast", "floris"),
    "optimization": ("optimization", "optimisation", "control", "framework", "algorithm"),
    "design": ("design", "fatigue", "loads", "performance", "stability"),
}

_TECHNICAL_VENUE_TERMS = (
    "wind energy",
    "ocean engineering",
    "energy conversion",
    "renewable energy",
    "marine engineering",
    "journal",
    "proceedings",
    "science",
    "engineering",
)

_REPOSITORY_VENUE_TERMS = (
    "zenodo",
    "repository",
    "research data",
    "publications and research data",
)

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
    latest_publication_date = max((_published_date(record) for record in records), default=None)

    scored_records = [
        (index, _record_with_selection_score(record, latest_publication_date))
        for index, record in enumerate(records)
    ]
    sorted_records = sorted(scored_records, key=_sort_key)
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
        "scoreModel": _score_model_metadata(),
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
        "scoreModelId": SCORE_MODEL_ID,
        "classificationCounts": counts,
    }

    return {
        "rankedPayload": ranked_payload,
        "rankingResult": ranking_result,
    }


def score_classified_paper(
    record: dict[str, Any],
    *,
    latest_publication_date: date | None = None,
) -> dict[str, Any]:
    """Compute the deterministic Research Selection Score for one classified paper."""
    if latest_publication_date is None:
        latest_publication_date = _published_date(record)

    components = [
        _fowt_relevance_component(record),
        _technical_specificity_component(record),
        _research_value_component(record),
        _venue_quality_component(record),
        _metadata_quality_component(record),
        _recency_component(record, latest_publication_date),
    ]
    total = sum(component["score"] for component in components)
    max_total = sum(component["maxScore"] for component in components)

    return {
        "modelId": SCORE_MODEL_ID,
        "total": total,
        "maxScore": max_total,
        "components": components,
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
        "scoreModelId": ranking_result["scoreModelId"],
        "classificationCounts": ranking_result["classificationCounts"],
    }


def _record_with_selection_score(
    record: dict[str, Any],
    latest_publication_date: date | None,
) -> dict[str, Any]:
    scored_record = deepcopy(record)
    scored_record["selectionScore"] = score_classified_paper(
        scored_record,
        latest_publication_date=latest_publication_date,
    )
    return scored_record


def _score_model_metadata() -> dict[str, Any]:
    return {
        "id": SCORE_MODEL_ID,
        "label": "Research Selection Score",
        "description": (
            "Deterministic 100-point score computed before ranking from FOWT relevance, "
            "technical specificity, research value, venue proxy, metadata completeness and recency."
        ),
        "components": [
            {"componentId": component_id, "label": label, "maxScore": max_score}
            for component_id, label, max_score in SCORE_COMPONENTS
        ],
    }


def _component(component_id: str, score: int, evidence: list[str]) -> dict[str, Any]:
    metadata = next(item for item in SCORE_COMPONENTS if item[0] == component_id)
    _, label, max_score = metadata
    bounded_score = max(0, min(max_score, score))
    return {
        "componentId": component_id,
        "label": label,
        "score": bounded_score,
        "maxScore": max_score,
        "evidence": evidence,
    }


def _fowt_relevance_component(record: dict[str, Any]) -> dict[str, Any]:
    assessment = record["relevanceAssessment"]
    classification = assessment["classification"]
    confidence = assessment.get("confidence")
    fields = _normalised_fields(record)
    score = {RELEVANT: 18, POSSIBLY_RELEVANT: 9, NOT_RELEVANT: 0}[classification]
    evidence = [f"classification: {classification}"]

    if _has_any(fields["title"], _STRONG_FOWT_PHRASES):
        score += 8
        evidence.append("direct FOWT phrase in title")
    if _has_any(fields["topicTags"], _STRONG_FOWT_PHRASES):
        score += 5
        evidence.append("direct FOWT phrase in topic tags")
    if _has_any(fields["abstract"], _STRONG_FOWT_PHRASES):
        score += 3
        evidence.append("direct FOWT phrase in abstract")
    if _has_any(fields["title"], _WIND_TERMS) and _has_any(fields["title"], _FLOATING_TERMS):
        score += 4
        evidence.append("floating and wind terms in title")
    if _has_any(" ".join(fields.values()), _WIND_TERMS) and _has_any(" ".join(fields.values()), _FLOATING_TERMS):
        score += 2
        evidence.append("floating and wind terms across metadata")
    if isinstance(confidence, int | float):
        score += round(max(0, min(1, float(confidence))) * 3)
        evidence.append(f"classifier confidence {confidence}")

    return _component("fowt_relevance", score, evidence)


def _technical_specificity_component(record: dict[str, Any]) -> dict[str, Any]:
    text = _combined_text(record)
    matched = [
        group
        for group, terms in _TECHNICAL_SIGNAL_GROUPS.items()
        if _has_any(text, terms)
    ]
    score = min(len(matched) * 5, 25)
    evidence = [f"technical signal: {group.replace('_', ' ')}" for group in matched[:5]]
    return _component("technical_specificity", score, evidence)


def _research_value_component(record: dict[str, Any]) -> dict[str, Any]:
    text = _combined_text(record)
    matched = [
        group
        for group, terms in _RESEARCH_VALUE_GROUPS.items()
        if _has_any(text, terms)
    ]
    score = min(len(matched) * 3, 12)
    evidence = [f"research signal: {group}" for group in matched[:4]]
    if _clean_string(record.get("abstract")):
        score += 3
        evidence.append("abstract available")
    return _component("research_value", score, evidence)


def _venue_quality_component(record: dict[str, Any]) -> dict[str, Any]:
    source = _normalise_text(record.get("publicationSource"))
    publication_type = _normalise_text(record.get("publicationType"))
    score = 0
    evidence: list[str] = []

    if source:
        score += 3
        evidence.append("venue/source present")
    if publication_type == "journal":
        score += 4
        evidence.append("journal publication type")
    elif publication_type == "conference":
        score += 3
        evidence.append("conference publication type")
    elif publication_type == "preprint":
        score += 2
        evidence.append("preprint publication type")
    elif publication_type:
        score += 1
        evidence.append(f"publication type: {record.get('publicationType')}")

    if _has_any(source, _TECHNICAL_VENUE_TERMS):
        score += 2
        evidence.append("technical venue/source proxy")
    if _has_any(source, _REPOSITORY_VENUE_TERMS):
        score += 2
        evidence.append("research repository or dataset source")

    return _component("venue_quality", score, evidence)


def _metadata_quality_component(record: dict[str, Any]) -> dict[str, Any]:
    score = 0
    evidence: list[str] = []
    checks = [
        ("DOI present", 2, _clean_string(record.get("doi"))),
        ("source URL present", 2, _clean_string(record.get("sourceUrl"))),
        ("authors present", 1, bool(record.get("authors"))),
        ("publication source present", 1, _clean_string(record.get("publicationSource"))),
        ("abstract present", 2, _clean_string(record.get("abstract"))),
        ("topic tags present", 1, bool(record.get("topicTags"))),
        (
            "full text or abstract available",
            1,
            record.get("fullTextAvailability") in {"full_text_available", "abstract_only"},
        ),
    ]
    for label, points, present in checks:
        if present:
            score += points
            evidence.append(label)
    return _component("metadata_quality", score, evidence)


def _recency_component(record: dict[str, Any], latest_publication_date: date) -> dict[str, Any]:
    age_days = (latest_publication_date - _published_date(record)).days
    score = max(0, 5 - max(0, age_days))
    return _component("recency", score, [f"{max(0, age_days)} days behind newest candidate"])


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


def _sort_key(indexed_record: tuple[int, dict[str, Any]]) -> tuple[int, int, int, str]:
    _, record = indexed_record
    classification = record["relevanceAssessment"]["classification"]
    return (
        -record["selectionScore"]["total"],
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


def _normalised_fields(record: dict[str, Any]) -> dict[str, str]:
    return {
        "title": _normalise_text(record.get("title")),
        "abstract": _normalise_text(record.get("abstract")),
        "topicTags": _normalise_text(" ".join(record.get("topicTags", []))),
    }


def _combined_text(record: dict[str, Any]) -> str:
    fields = _normalised_fields(record)
    return " ".join(fields.values())


def _normalise_text(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", value.casefold())).strip()


def _has_any(text: str, terms: tuple[str, ...]) -> bool:
    padded = f" {text} "
    return any(f" {_normalise_text(term)} " in padded for term in terms)


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
