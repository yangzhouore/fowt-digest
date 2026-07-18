from __future__ import annotations

from copy import deepcopy
import json

import pytest

import pipeline.relevance_classifier as relevance_classifier
from pipeline.relevance_classifier import (
    NOT_RELEVANT,
    POSSIBLY_RELEVANT,
    RELEVANT,
    classify_deduplicated_papers,
    write_classification_outputs,
)


RUN_ID = "run_20260718_090000_openalex"
SOURCE_NAME = "openalex"
CLASSIFIED_AT = "2026-07-18T09:00:00Z"


def test_classifies_strong_fowt_title_as_relevant():
    result = classify_deduplicated_papers(
        _payload([_record(0, title="Floating offshore wind wake modelling")]),
        classified_at=CLASSIFIED_AT,
    )

    assessment = _assessment(result)
    assert assessment == {
        "assessmentId": "relevance_paper_0",
        "paperId": "paper_0",
        "classification": RELEVANT,
        "confidence": 0.9,
        "reason": "relevant_title_fowt_phrase",
        "topicTags": ["Hydrodynamics"],
        "evidenceBasis": ["title"],
        "modelName": None,
        "promptVersion": None,
        "generatedAt": CLASSIFIED_AT,
    }


def test_classifies_strong_fowt_topic_as_relevant():
    result = classify_deduplicated_papers(
        _payload([_record(0, title="Wake modelling", tags=["Floating offshore wind"])]),
        classified_at=CLASSIFIED_AT,
    )

    assessment = _assessment(result)
    assert assessment["classification"] == RELEVANT
    assert assessment["confidence"] == 0.86
    assert assessment["reason"] == "relevant_topic_fowt_phrase"
    assert assessment["evidenceBasis"] == ["topicTags"]


def test_classifies_combined_title_signals_as_relevant():
    result = classify_deduplicated_papers(
        _payload([_record(0, title="Mooring loads for offshore wind turbines")]),
        classified_at=CLASSIFIED_AT,
    )

    assessment = _assessment(result)
    assert assessment["classification"] == RELEVANT
    assert assessment["reason"] == "relevant_title_combined_fowt_signals"
    assert assessment["evidenceBasis"] == ["title"]


def test_classifies_abstract_only_fowt_phrase_as_possibly_relevant():
    result = classify_deduplicated_papers(
        _payload([
            _record(
                0,
                title="Cable design",
                abstract="This study evaluates floating offshore wind array cables.",
                tags=[],
            )
        ]),
        classified_at=CLASSIFIED_AT,
    )

    assessment = _assessment(result)
    assert assessment["classification"] == POSSIBLY_RELEVANT
    assert assessment["confidence"] == 0.6
    assert assessment["reason"] == "possibly_relevant_abstract_only_fowt_phrase"
    assert assessment["evidenceBasis"] == ["abstract"]


def test_classifies_weak_combined_signals_as_possibly_relevant():
    result = classify_deduplicated_papers(
        _payload([
            _record(
                0,
                title="Offshore wind design",
                abstract="The method includes mooring load screening.",
                tags=[],
            )
        ]),
        classified_at=CLASSIFIED_AT,
    )

    assessment = _assessment(result)
    assert assessment["classification"] == POSSIBLY_RELEVANT
    assert assessment["reason"] == "possibly_relevant_combined_weak_signals"
    assert assessment["evidenceBasis"] == ["title", "abstract"]


def test_classifies_offshore_wind_only_as_possibly_relevant():
    result = classify_deduplicated_papers(
        _payload([_record(0, title="Offshore wind resource assessment", abstract=None, tags=[])]),
        classified_at=CLASSIFIED_AT,
    )

    assessment = _assessment(result)
    assert assessment["classification"] == POSSIBLY_RELEVANT
    assert assessment["confidence"] == 0.45
    assert assessment["reason"] == "possibly_relevant_offshore_wind_only"
    assert assessment["evidenceBasis"] == ["title"]


def test_classifies_without_fowt_signals_as_not_relevant():
    result = classify_deduplicated_papers(
        _payload([_record(0, title="Solar forecasting", abstract="Battery storage", tags=[])]),
        classified_at=CLASSIFIED_AT,
    )

    assessment = _assessment(result)
    assert assessment["classification"] == NOT_RELEVANT
    assert assessment["confidence"] == 0.1
    assert assessment["reason"] == "not_relevant_no_fowt_signals"
    assert assessment["evidenceBasis"] == []


def test_result_contains_only_aggregate_statistics():
    result = classify_deduplicated_papers(
        _payload([
            _record(0, title="Floating offshore wind control"),
            _record(1, title="Offshore wind policy", tags=[]),
            _record(2, title="Solar forecasting", tags=[]),
        ]),
        classified_at=CLASSIFIED_AT,
    )

    summary = result["classificationResult"]
    assert summary == {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "sourceName": SOURCE_NAME,
        "inputCount": 3,
        "classifiedCount": 3,
        "classificationCounts": {
            RELEVANT: 1,
            POSSIBLY_RELEVANT: 1,
            NOT_RELEVANT: 1,
        },
    }
    assert "assessments" not in summary
    assert "classifiedRecords" not in summary


def test_classified_records_preserve_order_and_set_processing_status():
    result = classify_deduplicated_papers(
        _payload([
            _record(0, title="Solar forecasting", tags=[]),
            _record(1, title="Floating offshore wind control"),
        ]),
        classified_at=CLASSIFIED_AT,
    )

    records = result["classifiedPayload"]["classifiedRecords"]
    assert [record["paperId"] for record in records] == ["paper_0", "paper_1"]
    assert [record["processingStatus"] for record in records] == ["classified", "classified"]
    assert [record["relevanceAssessment"]["classification"] for record in records] == [
        NOT_RELEVANT,
        RELEVANT,
    ]


def test_identical_input_produces_identical_output():
    payload = _payload([_record(0, title="Floating offshore wind control")])

    assert classify_deduplicated_papers(payload, classified_at=CLASSIFIED_AT) == classify_deduplicated_papers(
        payload, classified_at=CLASSIFIED_AT
    )


def test_input_is_not_mutated():
    payload = _payload([_record(0, title="Floating offshore wind control")])
    before = deepcopy(payload)

    classify_deduplicated_papers(payload, classified_at=CLASSIFIED_AT)

    assert payload == before


def test_validation_failures_are_deterministic():
    with pytest.raises(ValueError, match="classification requires deduplicated payload"):
        classify_deduplicated_papers(None, classified_at=CLASSIFIED_AT)

    with pytest.raises(ValueError, match="classification requires deduplicated records"):
        classify_deduplicated_papers({"runId": RUN_ID, "sourceName": SOURCE_NAME}, classified_at=CLASSIFIED_AT)

    with pytest.raises(ValueError, match="classification requires valid paper metadata"):
        classify_deduplicated_papers(_payload([{"paperId": "paper_incomplete"}]), classified_at=CLASSIFIED_AT)

    with pytest.raises(ValueError, match="classification requires generated timestamp"):
        classify_deduplicated_papers(_payload([]), classified_at="")


def test_invalid_topic_tags_are_rejected():
    record = _record(0)
    record["topicTags"] = "Floating offshore wind"

    with pytest.raises(ValueError, match="classification requires valid paper metadata"):
        classify_deduplicated_papers(_payload([record]), classified_at=CLASSIFIED_AT)


def test_writer_writes_only_required_files_and_returns_persisted_counts(tmp_path):
    payload = _payload([
        _record(0, title="Floating offshore wind control"),
        _record(1, title="Solar forecasting", tags=[]),
    ])

    result = write_classification_outputs(
        payload, run_directory=tmp_path, classified_at=CLASSIFIED_AT
    )

    assert sorted(path.name for path in tmp_path.iterdir()) == [
        "classification_result.json",
        "classified_papers.json",
    ]
    classified = json.loads(result["classifiedPapersPath"].read_text(encoding="utf-8"))
    summary = json.loads(result["classificationResultPath"].read_text(encoding="utf-8"))
    assert result == {
        "classifiedPapersPath": tmp_path / "classified_papers.json",
        "classificationResultPath": tmp_path / "classification_result.json",
        "inputCount": 2,
        "classifiedCount": 2,
        "classificationCounts": {RELEVANT: 1, POSSIBLY_RELEVANT: 0, NOT_RELEVANT: 1},
    }
    assert len(classified["classifiedRecords"]) == 2
    assert summary["classifiedCount"] == 2


def test_second_write_failure_removes_new_first_output(tmp_path, monkeypatch):
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_classification_outputs(
            _payload([_record(0)]), run_directory=tmp_path, classified_at=CLASSIFIED_AT
        )

    assert list(tmp_path.iterdir()) == []


def test_second_write_failure_restores_preexisting_outputs(tmp_path, monkeypatch):
    first_path = tmp_path / "classified_papers.json"
    second_path = tmp_path / "classification_result.json"
    first_content = b'{"old":"classified"}\n'
    second_content = b'{"old":"result"}\n'
    first_path.write_bytes(first_content)
    second_path.write_bytes(second_content)
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_classification_outputs(
            _payload([_record(0)]), run_directory=tmp_path, classified_at=CLASSIFIED_AT
        )

    assert first_path.read_bytes() == first_content
    assert second_path.read_bytes() == second_content


def _assessment(result):
    return result["classifiedPayload"]["classifiedRecords"][0]["relevanceAssessment"]


def _fail_second_write(monkeypatch):
    original_write_run_json = relevance_classifier.write_run_json

    def failing_write(run_directory, filename, data):
        if filename == "classification_result.json":
            raise RuntimeError("forced second write failure")
        return original_write_run_json(run_directory, filename, data)

    monkeypatch.setattr(relevance_classifier, "write_run_json", failing_write)


def _payload(records):
    return {
        "runId": RUN_ID,
        "sourceName": SOURCE_NAME,
        "deduplicatedRecords": records,
    }


def _record(index, *, title="Floating offshore wind paper", abstract="Abstract", tags=None):
    if tags is None:
        tags = ["Hydrodynamics"]
    return {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "paperId": f"paper_{index}",
        "candidateIds": [f"candidate_{index}"],
        "sourceName": SOURCE_NAME,
        "sourceIdentifiers": {
            "openalexId": f"https://openalex.org/W{index}",
            "doi": f"10.123/{index}",
        },
        "doi": f"10.123/{index}",
        "title": title,
        "authors": [f"Author {index}"],
        "abstract": abstract,
        "publicationSource": "Journal",
        "publicationType": "journal",
        "publishedDate": "2026-07-01",
        "indexedDate": None,
        "sourceUrl": f"https://openalex.org/W{index}",
        "openAccessStatus": "gold",
        "fullTextAvailability": "abstract_only" if abstract else "none",
        "topicTags": tags,
        "rawSources": [
            {
                "rawSourcePath": "pipeline/data/runs/run_20260718_090000_openalex/raw_openalex.json",
                "rawQueryIndex": index,
                "rawPageIndex": 0,
                "rawResultIndex": 0,
                "queryGroup": "core_fowt",
                "queryTerm": f"term {index}",
            }
        ],
        "processingStatus": "deduplicated",
    }
