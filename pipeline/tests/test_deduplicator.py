from __future__ import annotations

from copy import deepcopy
import json

import pytest

import pipeline.deduplicator as deduplicator
from pipeline.deduplicator import (
    deduplicate_normalised_records,
    write_deduplication_outputs,
)


RUN_ID = "run_20260718_090000_openalex"
SOURCE_NAME = "openalex"


def test_no_duplicates_preserves_records_and_reports_empty_groups():
    payload = _payload([
        _record(0, doi="10.123/a", title="Floating Wind A"),
        _record(1, doi="10.123/b", title="Floating Wind B"),
    ])

    result = deduplicate_normalised_records(payload)

    deduplicated = result["deduplicatedPayload"]
    report = result["deduplicationResult"]
    assert [record["paperId"] for record in deduplicated["deduplicatedRecords"]] == [
        "paper_0",
        "paper_1",
    ]
    assert [record["processingStatus"] for record in deduplicated["deduplicatedRecords"]] == [
        "deduplicated",
        "deduplicated",
    ]
    assert report["inputCount"] == 2
    assert report["outputCount"] == 2
    assert report["duplicateGroups"] == []
    assert report["uncertainMatches"] == []


def test_doi_duplicate_merges_with_doi_evidence():
    payload = _payload([
        _record(0, doi="https://doi.org/10.123/Example", title="First"),
        _record(1, doi="10.123/example", title="Second"),
    ])

    result = deduplicate_normalised_records(payload)

    records = result["deduplicatedPayload"]["deduplicatedRecords"]
    groups = result["deduplicationResult"]["duplicateGroups"]
    assert len(records) == 1
    assert records[0]["candidateIds"] == ["candidate_0", "candidate_1"]
    assert groups[0]["primaryMatchRule"] == "doi_exact"
    assert groups[0]["matchedRules"] == ["doi_exact"]
    assert groups[0]["matchEvidence"] == [
        {"rule": "doi_exact", "key": "10.123/example", "recordIndexes": [0, 1]}
    ]


def test_openalex_id_duplicate_merges_when_doi_is_missing():
    payload = _payload([
        _record(0, doi=None, openalex_id="https://openalex.org/W1", title="First"),
        _record(1, doi=None, openalex_id="https://openalex.org/W1", title="Second"),
    ])

    group = deduplicate_normalised_records(payload)["deduplicationResult"]["duplicateGroups"][0]

    assert group["primaryMatchRule"] == "openalex_id_exact"
    assert group["matchedRules"] == ["openalex_id_exact"]
    assert group["recordIndexes"] == [0, 1]


def test_title_date_duplicate_uses_normalised_title_and_date():
    payload = _payload([
        _record(0, doi=None, openalex_id=None, title="Floating: Wind! Mooring", date="2026-07-01"),
        _record(1, doi=None, openalex_id=None, title=" floating wind mooring ", date="2026-07-01"),
    ])

    group = deduplicate_normalised_records(payload)["deduplicationResult"]["duplicateGroups"][0]

    assert group["primaryMatchRule"] == "title_date_exact"
    assert group["matchEvidence"] == [
        {
            "rule": "title_date_exact",
            "key": "floating wind mooring|2026-07-01",
            "recordIndexes": [0, 1],
        }
    ]


def test_transitive_duplicate_chain_forms_one_component():
    payload = _payload([
        _record(0, doi="10.123/chain", openalex_id="https://openalex.org/WA", title="A"),
        _record(1, doi="10.123/CHAIN", openalex_id="https://openalex.org/WB", title="B"),
        _record(2, doi=None, openalex_id="https://openalex.org/WB", title="C"),
    ])

    result = deduplicate_normalised_records(payload)

    groups = result["deduplicationResult"]["duplicateGroups"]
    assert len(groups) == 1
    assert groups[0]["recordIndexes"] == [0, 1, 2]
    assert groups[0]["matchedRules"] == ["doi_exact", "openalex_id_exact"]
    assert groups[0]["matchEvidence"] == [
        {"rule": "doi_exact", "key": "10.123/chain", "recordIndexes": [0, 1]},
        {
            "rule": "openalex_id_exact",
            "key": "https://openalex.org/WB",
            "recordIndexes": [1, 2],
        },
    ]


def test_component_connected_by_multiple_rules_reports_all_evidence():
    payload = _payload([
        _record(0, doi="10.123/multi", openalex_id="https://openalex.org/W1", title="Shared Title"),
        _record(1, doi="10.123/multi", openalex_id="https://openalex.org/W1", title="Shared Title"),
    ])

    group = deduplicate_normalised_records(payload)["deduplicationResult"]["duplicateGroups"][0]

    assert group["primaryMatchRule"] == "doi_exact"
    assert group["matchedRules"] == ["doi_exact", "openalex_id_exact", "title_date_exact"]
    assert group["matchEvidence"] == [
        {"rule": "doi_exact", "key": "10.123/multi", "recordIndexes": [0, 1]},
        {
            "rule": "openalex_id_exact",
            "key": "https://openalex.org/W1",
            "recordIndexes": [0, 1],
        },
        {
            "rule": "title_date_exact",
            "key": "shared title|2026-07-01",
            "recordIndexes": [0, 1],
        },
    ]


def test_priority_affects_reporting_only_not_relationship_discovery():
    payload = _payload([
        _record(0, doi=None, openalex_id=None, title="Shared Title"),
        _record(1, doi="10.123/priority", openalex_id=None, title="Shared Title"),
        _record(2, doi="10.123/priority", openalex_id=None, title="Other Title"),
    ])

    group = deduplicate_normalised_records(payload)["deduplicationResult"]["duplicateGroups"][0]

    assert group["recordIndexes"] == [0, 1, 2]
    assert group["primaryMatchRule"] == "doi_exact"
    assert group["matchedRules"] == ["doi_exact", "title_date_exact"]


def test_missing_values_do_not_create_match_keys():
    payload = _payload([
        _record(0, doi=None, openalex_id=None, title="Floating Wind A", date="2026-07-01"),
        _record(1, doi=None, openalex_id=None, title="Floating Wind B", date="2026-07-01"),
        _record(2, doi=None, openalex_id=None, title="Floating Wind A", date="2026-07-02"),
    ])

    report = deduplicate_normalised_records(payload)["deduplicationResult"]

    assert report["duplicateGroups"] == []


def test_missing_date_is_rejected_before_any_match_is_written(tmp_path):
    payload = _payload([
        _record(0, doi=None, openalex_id=None, title="Floating Wind A", date=""),
        _record(1, doi=None, openalex_id=None, title="Floating Wind A", date=""),
    ])

    with pytest.raises(ValueError, match="deduplication requires valid paper metadata"):
        write_deduplication_outputs(payload, run_directory=tmp_path)

    assert list(tmp_path.iterdir()) == []


def test_canonical_selection_uses_documented_tie_breakers():
    payload = _payload([
        _record(0, doi=None, openalex_id="https://openalex.org/W1", abstract="Abstract", source="Journal", authors=["A", "B"]),
        _record(1, doi="10.123/canonical", openalex_id="https://openalex.org/W1", abstract=None, source=None, authors=["A"]),
        _record(2, doi=None, openalex_id="https://openalex.org/W1", abstract="Abstract", source="Journal", authors=["A", "B", "C"]),
    ])

    record = deduplicate_normalised_records(payload)["deduplicatedPayload"]["deduplicatedRecords"][0]

    assert record["paperId"] == "paper_1"
    assert record["doi"] == "10.123/canonical"
    assert record["abstract"] == "Abstract"
    assert record["publicationSource"] == "Journal"


def test_metadata_merging_and_conflict_reporting():
    payload = _payload([
        _record(0, doi="10.123/conflict", openalex_id="https://openalex.org/WC", title="Canonical Title", abstract=None, source=None, tags=["B", "A"], authors=[]),
        _record(1, doi=None, openalex_id="https://openalex.org/WC", title="Different Title", abstract="Filled abstract", source="Filled Journal", tags=["A", "C"], authors=["Author"]),
    ])

    result = deduplicate_normalised_records(payload)

    record = result["deduplicatedPayload"]["deduplicatedRecords"][0]
    group = result["deduplicationResult"]["duplicateGroups"][0]
    assert record["title"] == "Canonical Title"
    assert record["abstract"] == "Filled abstract"
    assert record["publicationSource"] == "Filled Journal"
    assert record["authors"] == ["Author"]
    assert record["topicTags"] == ["A", "B", "C"]
    assert record["rawSources"] == [_raw_source(0), _raw_source(1)]
    assert {
        "field": "title",
        "canonicalValue": "Canonical Title",
        "discardedValues": ["Different Title"],
    } in group["conflicts"]


def test_stable_component_membership_when_input_order_changes():
    first_payload = _payload([
        _record(0, doi="10.123/group", openalex_id="https://openalex.org/WA"),
        _record(1, doi="10.123/group", openalex_id="https://openalex.org/WB"),
        _record(2, doi=None, openalex_id="https://openalex.org/WB"),
    ])
    second_payload = _payload([
        _record(2, doi=None, openalex_id="https://openalex.org/WB"),
        _record(0, doi="10.123/group", openalex_id="https://openalex.org/WA"),
        _record(1, doi="10.123/group", openalex_id="https://openalex.org/WB"),
    ])

    first_candidates = _group_candidate_set(first_payload)
    second_candidates = _group_candidate_set(second_payload)

    assert first_candidates == second_candidates == {"candidate_0", "candidate_1", "candidate_2"}


def test_deterministic_output_for_identical_input():
    payload = _payload([
        _record(0, doi="10.123/deterministic"),
        _record(1, doi="10.123/deterministic"),
        _record(2, doi="10.123/other"),
    ])

    assert deduplicate_normalised_records(payload) == deduplicate_normalised_records(payload)


def test_deterministic_output_ordering_uses_first_component_index():
    payload = _payload([
        _record(0, doi="10.123/b"),
        _record(1, doi="10.123/a"),
        _record(2, doi="10.123/b"),
        _record(3, doi="10.123/a"),
    ])

    records = deduplicate_normalised_records(payload)["deduplicatedPayload"]["deduplicatedRecords"]

    assert [record["candidateIds"] for record in records] == [
        ["candidate_0", "candidate_2"],
        ["candidate_1", "candidate_3"],
    ]


def test_input_is_not_mutated():
    payload = _payload([
        _record(0, doi="10.123/a"),
        _record(1, doi="10.123/a"),
    ])
    before = deepcopy(payload)

    deduplicate_normalised_records(payload)

    assert payload == before


def test_validation_failures_are_deterministic():
    with pytest.raises(ValueError, match="deduplication requires normalised payload"):
        deduplicate_normalised_records(None)

    with pytest.raises(ValueError, match="deduplication requires normalised records"):
        deduplicate_normalised_records({"runId": RUN_ID, "sourceName": SOURCE_NAME})

    with pytest.raises(ValueError, match="deduplication requires valid paper metadata"):
        deduplicate_normalised_records(_payload([{"paperId": "paper_incomplete"}]))


def test_writer_writes_only_required_files_and_returns_persisted_counts(tmp_path):
    payload = _payload([
        _record(0, doi="10.123/write"),
        _record(1, doi="10.123/write"),
        _record(2, doi="10.123/other"),
    ])

    result = write_deduplication_outputs(payload, run_directory=tmp_path)

    assert sorted(path.name for path in tmp_path.iterdir()) == [
        "deduplicated_papers.json",
        "deduplication_result.json",
    ]
    deduplicated = json.loads(result["deduplicatedPapersPath"].read_text(encoding="utf-8"))
    report = json.loads(result["deduplicationResultPath"].read_text(encoding="utf-8"))
    assert result == {
        "deduplicatedPapersPath": tmp_path / "deduplicated_papers.json",
        "deduplicationResultPath": tmp_path / "deduplication_result.json",
        "inputCount": 3,
        "outputCount": 2,
        "duplicateGroupCount": 1,
        "uncertainMatchCount": 0,
    }
    assert len(deduplicated["deduplicatedRecords"]) == 2
    assert report["inputCount"] == 3
    assert report["outputCount"] == 2
    assert report["uncertainMatches"] == []


def test_second_write_failure_removes_new_first_output(tmp_path, monkeypatch):
    payload = _payload([
        _record(0, doi="10.123/rollback"),
        _record(1, doi="10.123/rollback"),
    ])
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_deduplication_outputs(payload, run_directory=tmp_path)

    assert list(tmp_path.iterdir()) == []


def test_second_write_failure_restores_preexisting_first_output(tmp_path, monkeypatch):
    payload = _payload([
        _record(0, doi="10.123/rollback"),
        _record(1, doi="10.123/rollback"),
    ])
    first_path = tmp_path / "deduplicated_papers.json"
    first_content = b'{"old":"deduplicated"}\n'
    first_path.write_bytes(first_content)
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_deduplication_outputs(payload, run_directory=tmp_path)

    assert first_path.read_bytes() == first_content
    assert not (tmp_path / "deduplication_result.json").exists()


def test_second_write_failure_preserves_preexisting_output_set(tmp_path, monkeypatch):
    payload = _payload([
        _record(0, doi="10.123/rollback"),
        _record(1, doi="10.123/rollback"),
    ])
    first_path = tmp_path / "deduplicated_papers.json"
    second_path = tmp_path / "deduplication_result.json"
    first_content = b'{"old":"deduplicated"}\n'
    second_content = b'{"old":"result"}\n'
    first_path.write_bytes(first_content)
    second_path.write_bytes(second_content)
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_deduplication_outputs(payload, run_directory=tmp_path)

    assert first_path.read_bytes() == first_content
    assert second_path.read_bytes() == second_content


def _group_candidate_set(payload):
    group = deduplicate_normalised_records(payload)["deduplicationResult"]["duplicateGroups"][0]
    return set(group["candidateIds"])


def _fail_second_write(monkeypatch):
    original_write_run_json = deduplicator.write_run_json

    def failing_write(run_directory, filename, data):
        if filename == "deduplication_result.json":
            raise RuntimeError("forced second write failure")
        return original_write_run_json(run_directory, filename, data)

    monkeypatch.setattr(deduplicator, "write_run_json", failing_write)


def _payload(records):
    return {
        "runId": RUN_ID,
        "sourceName": SOURCE_NAME,
        "normalisedRecords": records,
        "rejectedRecords": [],
    }


def _record(
    index,
    *,
    doi="10.123/example",
    openalex_id=None,
    title=None,
    date="2026-07-01",
    abstract="Abstract",
    source="Journal",
    authors=None,
    tags=None,
):
    if openalex_id is None and doi is not None:
        openalex_id = f"https://openalex.org/W{index}"
    if title is None:
        title = f"Floating Wind Paper {index}"
    if authors is None:
        authors = [f"Author {index}"]
    if tags is None:
        tags = [f"Tag {index}"]

    return {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "paperId": f"paper_{index}",
        "candidateIds": [f"candidate_{index}"],
        "sourceName": SOURCE_NAME,
        "sourceIdentifiers": {
            "openalexId": openalex_id,
            "doi": doi,
        },
        "doi": doi,
        "title": title,
        "authors": authors,
        "abstract": abstract,
        "publicationSource": source,
        "publicationType": "journal",
        "publishedDate": date,
        "indexedDate": None,
        "sourceUrl": openalex_id,
        "openAccessStatus": "gold",
        "fullTextAvailability": "abstract_only" if abstract else "none",
        "topicTags": tags,
        "rawSources": [_raw_source(index)],
        "processingStatus": "normalised",
    }


def _raw_source(index):
    return {
        "rawSourcePath": "pipeline/data/runs/run_20260718_090000_openalex/raw_openalex.json",
        "rawQueryIndex": index,
        "rawPageIndex": 0,
        "rawResultIndex": 0,
        "queryGroup": "core_fowt",
        "queryTerm": f"term {index}",
    }
