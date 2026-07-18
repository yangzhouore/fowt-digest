"""Deterministic deduplication helpers for normalised paper records."""

from __future__ import annotations

from copy import deepcopy
import os
from pathlib import Path
import tempfile
from typing import Any

from pipeline.ids import normalise_doi, normalise_title
from pipeline.run_storage import run_file_path, write_run_json

SCHEMA_VERSION = "pipeline-data-0.1"
DEDUPLICATED_STATUS = "deduplicated"

_RULE_PRIORITY = {
    "doi_exact": 0,
    "openalex_id_exact": 1,
    "title_date_exact": 2,
}

_DEDUPLICATION_FILENAMES = (
    "deduplicated_papers.json",
    "deduplication_result.json",
)

_SCALAR_MERGE_FIELDS = (
    "doi",
    "title",
    "abstract",
    "publicationSource",
    "publicationType",
    "publishedDate",
    "indexedDate",
    "sourceUrl",
    "openAccessStatus",
    "fullTextAvailability",
)


def deduplicate_normalised_records(
    normalised_payload: dict[str, Any],
) -> dict[str, Any]:
    """Build deterministic deduplication outputs from normalised.json payload."""
    run_id, source_name, records = _validated_payload(normalised_payload)
    indexed_records = [(index, deepcopy(record)) for index, record in enumerate(records)]

    relationships = _exact_match_relationships(indexed_records)
    components = _connected_components(len(indexed_records), relationships)
    duplicate_components = [component for component in components if len(component) > 1]

    deduplicated_records: list[dict[str, Any]] = []
    duplicate_groups: list[dict[str, Any]] = []

    evidence_by_component = _evidence_by_component(duplicate_components, relationships)

    for component in components:
        component_records = [(index, indexed_records[index][1]) for index in component]
        if len(component) == 1:
            deduplicated_records.append(_deduplicated_singleton(component_records[0][1]))
            continue

        evidence = evidence_by_component[tuple(component)]
        _, canonical_record = _canonical_record(component_records)
        merged_record, conflicts = _merged_record(canonical_record, component_records)
        deduplicated_records.append(merged_record)
        duplicate_groups.append(
            {
                "canonicalPaperId": canonical_record["paperId"],
                "paperIds": _unique_values(
                    record["paperId"] for _, record in component_records
                ),
                "candidateIds": _merged_candidate_ids(component_records),
                "recordIndexes": component,
                "primaryMatchRule": _primary_match_rule(evidence),
                "matchedRules": _matched_rules(evidence),
                "matchEvidence": evidence,
                "confidence": "high",
                "conflicts": conflicts,
            }
        )

    duplicate_groups.sort(key=lambda group: group["recordIndexes"][0])

    deduplicated_payload = {
        "runId": run_id,
        "sourceName": source_name,
        "deduplicatedRecords": deduplicated_records,
    }
    deduplication_result = {
        "schemaVersion": SCHEMA_VERSION,
        "runId": run_id,
        "sourceName": source_name,
        "inputCount": len(records),
        "outputCount": len(deduplicated_records),
        "duplicateGroups": duplicate_groups,
        "uncertainMatches": [],
    }

    return {
        "deduplicatedPayload": deduplicated_payload,
        "deduplicationResult": deduplication_result,
    }


def write_deduplication_outputs(
    normalised_payload: dict[str, Any],
    *,
    run_directory: str | Path,
) -> dict[str, Any]:
    """Write deduplicated_papers.json and deduplication_result.json."""
    outputs = deduplicate_normalised_records(normalised_payload)
    deduplicated_payload = outputs["deduplicatedPayload"]
    deduplication_result = outputs["deduplicationResult"]
    snapshots = _snapshot_output_files(run_directory)

    try:
        deduplicated_path = write_run_json(
            run_directory, "deduplicated_papers.json", deduplicated_payload
        )
        result_path = write_run_json(
            run_directory, "deduplication_result.json", deduplication_result
        )
    except Exception:
        _restore_output_files(snapshots)
        raise

    return {
        "deduplicatedPapersPath": deduplicated_path,
        "deduplicationResultPath": result_path,
        "inputCount": deduplication_result["inputCount"],
        "outputCount": deduplication_result["outputCount"],
        "duplicateGroupCount": len(deduplication_result["duplicateGroups"]),
        "uncertainMatchCount": len(deduplication_result["uncertainMatches"]),
    }


def _snapshot_output_files(run_directory: str | Path) -> dict[str, tuple[Path, bool, bytes | None]]:
    snapshots: dict[str, tuple[Path, bool, bytes | None]] = {}
    for filename in _DEDUPLICATION_FILENAMES:
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


def _validated_payload(
    normalised_payload: dict[str, Any],
) -> tuple[str, str, list[dict[str, Any]]]:
    if not isinstance(normalised_payload, dict):
        raise ValueError("deduplication requires normalised payload")

    run_id = _clean_string(normalised_payload.get("runId"))
    source_name = _clean_string(normalised_payload.get("sourceName"))
    records = normalised_payload.get("normalisedRecords")
    if not run_id or not source_name or not isinstance(records, list):
        raise ValueError("deduplication requires normalised records")

    for record in records:
        _validate_record(record, run_id=run_id, source_name=source_name)

    return run_id, source_name, records


def _validate_record(record: Any, *, run_id: str, source_name: str) -> None:
    if not isinstance(record, dict):
        raise ValueError("deduplication requires valid paper metadata")

    required_strings = (
        "schemaVersion",
        "runId",
        "paperId",
        "sourceName",
        "title",
        "publicationType",
        "publishedDate",
        "fullTextAvailability",
        "processingStatus",
    )
    for field in required_strings:
        if not _clean_string(record.get(field)):
            raise ValueError("deduplication requires valid paper metadata")

    if record.get("runId") != run_id or record.get("sourceName") != source_name:
        raise ValueError("deduplication requires valid paper metadata")

    nullable_strings = (
        "doi",
        "abstract",
        "publicationSource",
        "indexedDate",
        "sourceUrl",
        "openAccessStatus",
    )
    for field in nullable_strings:
        value = record.get(field)
        if value is not None and not isinstance(value, str):
            raise ValueError("deduplication requires valid paper metadata")

    source_identifiers = record.get("sourceIdentifiers")
    if not isinstance(source_identifiers, dict):
        raise ValueError("deduplication requires valid paper metadata")
    for key in ("openalexId", "doi"):
        value = source_identifiers.get(key)
        if value is not None and not isinstance(value, str):
            raise ValueError("deduplication requires valid paper metadata")

    for field in ("candidateIds", "authors", "topicTags"):
        values = record.get(field)
        if not isinstance(values, list) or any(not isinstance(item, str) for item in values):
            raise ValueError("deduplication requires valid paper metadata")

    raw_sources = record.get("rawSources")
    if not isinstance(raw_sources, list) or not raw_sources:
        raise ValueError("deduplication requires valid paper metadata")
    for raw_source in raw_sources:
        if not _valid_raw_source(raw_source):
            raise ValueError("deduplication requires valid paper metadata")


def _valid_raw_source(raw_source: Any) -> bool:
    if not isinstance(raw_source, dict):
        return False
    string_fields = ("rawSourcePath", "queryGroup", "queryTerm")
    index_fields = ("rawQueryIndex", "rawPageIndex", "rawResultIndex")
    return all(isinstance(raw_source.get(field), str) for field in string_fields) and all(
        isinstance(raw_source.get(field), int) for field in index_fields
    )


def _exact_match_relationships(
    indexed_records: list[tuple[int, dict[str, Any]]],
) -> list[dict[str, Any]]:
    key_records: dict[tuple[str, str], list[int]] = {}

    for index, record in indexed_records:
        for rule, key in _record_keys(record):
            key_records.setdefault((rule, key), []).append(index)

    relationships: list[dict[str, Any]] = []
    for (rule, key), record_indexes in key_records.items():
        if len(record_indexes) < 2:
            continue
        relationships.append(
            {
                "rule": rule,
                "key": key,
                "recordIndexes": sorted(record_indexes),
            }
        )

    relationships.sort(
        key=lambda item: (
            _RULE_PRIORITY[item["rule"]],
            item["key"],
            item["recordIndexes"],
        )
    )
    return relationships


def _record_keys(record: dict[str, Any]) -> list[tuple[str, str]]:
    keys: list[tuple[str, str]] = []

    doi = normalise_doi(record.get("doi"))
    if doi:
        keys.append(("doi_exact", doi))

    source_identifiers = record.get("sourceIdentifiers")
    if isinstance(source_identifiers, dict):
        openalex_id = _clean_string(source_identifiers.get("openalexId"))
        if openalex_id:
            keys.append(("openalex_id_exact", openalex_id))

    title = normalise_title(record.get("title"))
    published_date = _clean_string(record.get("publishedDate"))
    if title and published_date:
        keys.append(("title_date_exact", f"{title}|{published_date}"))

    return keys


def _connected_components(
    record_count: int, relationships: list[dict[str, Any]]
) -> list[list[int]]:
    parents = list(range(record_count))

    def find(index: int) -> int:
        while parents[index] != index:
            parents[index] = parents[parents[index]]
            index = parents[index]
        return index

    def union(left: int, right: int) -> None:
        left_root = find(left)
        right_root = find(right)
        if left_root == right_root:
            return
        if left_root < right_root:
            parents[right_root] = left_root
        else:
            parents[left_root] = right_root

    for relationship in relationships:
        record_indexes = relationship["recordIndexes"]
        first = record_indexes[0]
        for index in record_indexes[1:]:
            union(first, index)

    components_by_root: dict[int, list[int]] = {}
    for index in range(record_count):
        components_by_root.setdefault(find(index), []).append(index)

    components = [sorted(component) for component in components_by_root.values()]
    components.sort(key=lambda component: component[0])
    return components


def _evidence_by_component(
    duplicate_components: list[list[int]],
    relationships: list[dict[str, Any]],
) -> dict[tuple[int, ...], list[dict[str, Any]]]:
    evidence_by_component: dict[tuple[int, ...], list[dict[str, Any]]] = {}
    for component in duplicate_components:
        component_set = set(component)
        evidence = [
            deepcopy(relationship)
            for relationship in relationships
            if set(relationship["recordIndexes"]).issubset(component_set)
        ]
        evidence.sort(
            key=lambda item: (
                _RULE_PRIORITY[item["rule"]],
                item["key"],
                item["recordIndexes"],
            )
        )
        evidence_by_component[tuple(component)] = evidence
    return evidence_by_component


def _canonical_record(
    component_records: list[tuple[int, dict[str, Any]]],
) -> tuple[int, dict[str, Any]]:
    return min(
        component_records,
        key=lambda item: (
            not bool(normalise_doi(item[1].get("doi"))),
            not bool(item[1].get("abstract")),
            not bool(item[1].get("publicationSource")),
            -len(item[1].get("authors", [])),
            item[0],
        ),
    )


def _deduplicated_singleton(record: dict[str, Any]) -> dict[str, Any]:
    deduplicated = deepcopy(record)
    deduplicated["processingStatus"] = DEDUPLICATED_STATUS
    return deduplicated


def _merged_record(
    canonical_record: dict[str, Any],
    component_records: list[tuple[int, dict[str, Any]]],
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    merged = deepcopy(canonical_record)
    conflicts: list[dict[str, Any]] = []

    for field in _SCALAR_MERGE_FIELDS:
        canonical_value = merged.get(field)
        values = _non_null_values(record.get(field) for _, record in component_records)
        if canonical_value is None and values:
            merged[field] = values[0]
            canonical_value = values[0]
        conflicts.extend(_scalar_conflicts(field, canonical_value, values))

    source_identifiers, identifier_conflicts = _merged_source_identifiers(
        merged.get("sourceIdentifiers"), component_records
    )
    merged["sourceIdentifiers"] = source_identifiers
    conflicts.extend(identifier_conflicts)

    if not merged.get("authors"):
        for _, record in component_records:
            if record.get("authors"):
                merged["authors"] = deepcopy(record["authors"])
                break

    merged["candidateIds"] = _merged_candidate_ids(component_records)
    merged["rawSources"] = _merged_raw_sources(component_records)
    merged["topicTags"] = sorted(
        {tag for _, record in component_records for tag in record.get("topicTags", [])}
    )
    merged["processingStatus"] = DEDUPLICATED_STATUS
    return merged, conflicts


def _merged_source_identifiers(
    canonical_identifiers: Any,
    component_records: list[tuple[int, dict[str, Any]]],
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    if not isinstance(canonical_identifiers, dict):
        canonical_identifiers = {}

    merged = {
        "openalexId": canonical_identifiers.get("openalexId"),
        "doi": canonical_identifiers.get("doi"),
    }
    conflicts: list[dict[str, Any]] = []

    for key in ("openalexId", "doi"):
        values = _non_null_values(
            record.get("sourceIdentifiers", {}).get(key)
            for _, record in component_records
            if isinstance(record.get("sourceIdentifiers"), dict)
        )
        if merged[key] is None and values:
            merged[key] = values[0]
        conflicts.extend(_scalar_conflicts(f"sourceIdentifiers.{key}", merged[key], values))

    return merged, conflicts


def _scalar_conflicts(
    field: str, canonical_value: Any, values: list[Any]
) -> list[dict[str, Any]]:
    if canonical_value is None:
        return []
    discarded_values = [
        value for value in _unique_values(values) if value != canonical_value
    ]
    if not discarded_values:
        return []
    return [
        {
            "field": field,
            "canonicalValue": canonical_value,
            "discardedValues": discarded_values,
        }
    ]


def _merged_candidate_ids(
    component_records: list[tuple[int, dict[str, Any]]],
) -> list[str]:
    return _unique_values(
        candidate_id
        for _, record in component_records
        for candidate_id in record.get("candidateIds", [])
    )


def _merged_raw_sources(
    component_records: list[tuple[int, dict[str, Any]]],
) -> list[dict[str, Any]]:
    seen: set[tuple[tuple[str, Any], ...]] = set()
    raw_sources: list[dict[str, Any]] = []
    for _, record in component_records:
        for raw_source in record.get("rawSources", []):
            key = tuple(sorted(raw_source.items()))
            if key in seen:
                continue
            seen.add(key)
            raw_sources.append(deepcopy(raw_source))
    return raw_sources


def _primary_match_rule(evidence: list[dict[str, Any]]) -> str:
    return min(evidence, key=lambda item: _RULE_PRIORITY[item["rule"]])["rule"]


def _matched_rules(evidence: list[dict[str, Any]]) -> list[str]:
    rules = {item["rule"] for item in evidence}
    return sorted(rules, key=lambda rule: _RULE_PRIORITY[rule])


def _non_null_values(values: Any) -> list[Any]:
    result: list[Any] = []
    for value in values:
        if value is None:
            continue
        if isinstance(value, str) and not value:
            continue
        result.append(value)
    return result


def _unique_values(values: Any) -> list[Any]:
    seen: set[Any] = set()
    unique: list[Any] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        unique.append(value)
    return unique


def _clean_string(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    value = value.strip()
    return value or None
