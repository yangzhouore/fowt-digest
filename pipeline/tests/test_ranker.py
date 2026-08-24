from __future__ import annotations

from copy import deepcopy
from datetime import date
import json

import pytest

import pipeline.ranker as ranker
from pipeline.ranker import (
    SCORE_MODEL_ID,
    SELECTION_REASON_BELOW_LIMIT,
    SELECTION_REASON_NOT_RELEVANT,
    SELECTION_REASON_SELECTED,
    rank_classified_papers,
    score_classified_paper,
    write_ranking_outputs,
)
from pipeline.relevance_classifier import NOT_RELEVANT, POSSIBLY_RELEVANT, RELEVANT


RUN_ID = "run_20260718_090000_openalex"
SOURCE_NAME = "openalex"


def test_score_is_reproducible_for_identical_input():
    record = _record(
        "paper_1",
        RELEVANT,
        "2026-07-20",
        title="Floating offshore wind turbine mooring control benchmark",
        abstract="A validated OpenFAST model studies mooring loads, controls, fatigue and wake response.",
    )

    assert score_classified_paper(record) == score_classified_paper(deepcopy(record))


def test_score_components_have_bounds_and_total_is_component_sum():
    record = _record(
        "paper_1",
        RELEVANT,
        "2026-07-20",
        title="Floating offshore wind turbine dynamic cable and mooring benchmark",
        abstract="The dataset validates numerical hydrodynamic, aerodynamic and structural load models.",
    )

    score = score_classified_paper(record)

    assert score["modelId"] == SCORE_MODEL_ID
    assert score["maxScore"] == 100
    assert score["total"] == sum(component["score"] for component in score["components"])
    assert {component["componentId"] for component in score["components"]} == {
        "fowt_relevance",
        "technical_specificity",
        "research_value",
        "venue_quality",
        "metadata_quality",
        "recency",
    }
    for component in score["components"]:
        assert 0 <= component["score"] <= component["maxScore"]
        assert isinstance(component["evidence"], list)


def test_missing_metadata_reduces_metadata_and_venue_scores_without_failure():
    record = _record(
        "paper_missing",
        POSSIBLY_RELEVANT,
        "2026-07-20",
        title="Floating offshore wind concept",
        abstract=None,
        authors=[],
        doi=None,
        source_url=None,
        publication_source=None,
        publication_type="unknown",
        topic_tags=[],
        full_text_availability="none",
    )

    score = score_classified_paper(record)
    components = _components_by_id(score)

    assert components["metadata_quality"]["score"] < 5
    assert components["venue_quality"]["score"] == 1
    assert score["total"] < 60


def test_non_journal_dataset_or_repository_records_are_supported():
    record = _record(
        "paper_dataset",
        RELEVANT,
        "2026-07-20",
        title="Floating offshore wind turbine benchmark dataset",
        abstract="A reproducible dataset and validation package for mooring and hydrodynamic models.",
        publication_type="unknown",
        publication_source="Zenodo",
        topic_tags=["Floating offshore wind", "Dataset", "Hydrodynamics"],
    )

    score = score_classified_paper(record)
    components = _components_by_id(score)

    assert components["venue_quality"]["score"] >= 6
    assert components["research_value"]["score"] >= 9


def test_ranking_uses_score_before_classification_date_and_paper_id():
    payload = _payload([
        _record(
            "paper_low_newer",
            RELEVANT,
            "2026-07-21",
            title="Floating offshore wind note",
            abstract=None,
            topic_tags=["Floating offshore wind"],
        ),
        _record(
            "paper_high_older",
            RELEVANT,
            "2026-07-19",
            title="Floating offshore wind turbine mooring control benchmark",
            abstract="A validated OpenFAST and CFD model studies mooring loads, controls, fatigue and wake response.",
            topic_tags=["Floating offshore wind", "Mooring", "Control", "CFD", "Fatigue"],
        ),
    ])

    ranked = rank_classified_papers(payload, selection_limit=10)["rankedPayload"]["rankedRecords"]

    assert ranked[0]["paperId"] == "paper_high_older"
    assert ranked[0]["selectionScore"]["total"] > ranked[1]["selectionScore"]["total"]


def test_tie_breaking_is_stable_after_equal_scores():
    payload = _payload([
        _record("paper_b", RELEVANT, "2026-07-20"),
        _record("paper_a", RELEVANT, "2026-07-20"),
    ])

    ranked = rank_classified_papers(payload, selection_limit=10)["rankedPayload"]["rankedRecords"]

    assert [record["paperId"] for record in ranked] == ["paper_a", "paper_b"]
    assert ranked[0]["selectionScore"]["total"] == ranked[1]["selectionScore"]["total"]


def test_selected_top_five_are_highest_scored_eligible_records():
    payload = _payload(
        [
            _record(
                f"paper_{index}",
                RELEVANT,
                "2026-07-20",
                title=f"Floating offshore wind turbine mooring control benchmark {index}",
                abstract="Validated CFD OpenFAST model for mooring loads, fatigue, controls and wake.",
            )
            for index in range(1, 7)
        ]
        + [
            _record(
                "paper_not_relevant",
                NOT_RELEVANT,
                "2026-07-21",
                title="Unrelated coastal planning note",
                abstract="General planning article without floating wind turbine signals.",
                topic_tags=["Planning"],
            )
        ]
    )

    ranked = rank_classified_papers(payload, selection_limit=5)["rankedPayload"]["rankedRecords"]
    selected = [record for record in ranked if record["selected"]]

    assert len(selected) == 5
    assert [record["paperId"] for record in selected] == [
        record["paperId"] for record in ranked[:5]
    ]
    assert ranked[-1]["paperId"] == "paper_not_relevant"
    assert ranked[-1]["selected"] is False
    assert ranked[-1]["selectionReason"] == SELECTION_REASON_NOT_RELEVANT


def test_every_input_receives_unique_continuous_global_rank():
    ranked = rank_classified_papers(
        _payload([
            _record("paper_3", POSSIBLY_RELEVANT, "2026-07-18"),
            _record("paper_1", RELEVANT, "2026-07-19"),
            _record("paper_2", NOT_RELEVANT, "2026-07-20"),
        ]),
        selection_limit=2,
    )["rankedPayload"]["rankedRecords"]

    assert [record["rank"] for record in ranked] == [1, 2, 3]
    assert len({record["rank"] for record in ranked}) == 3
    assert all("selectionScore" in record for record in ranked)


def test_ranked_records_directly_extend_classified_records_without_paper_wrapper():
    original = _record("paper_1", RELEVANT, "2026-07-18")

    ranked = rank_classified_papers(_payload([original]), selection_limit=1)["rankedPayload"]["rankedRecords"][0]

    assert "paper" not in ranked
    for key, value in original.items():
        assert ranked[key] == value
    assert ranked["rank"] == 1
    assert ranked["selected"] is True
    assert ranked["selectionReason"] == SELECTION_REASON_SELECTED
    assert ranked["selectionScore"]["modelId"] == SCORE_MODEL_ID


def test_selection_is_separate_from_ranking_and_respects_limit():
    ranked = rank_classified_papers(
        _payload([
            _record("paper_1", RELEVANT, "2026-07-20"),
            _record("paper_2", RELEVANT, "2026-07-19"),
            _record("paper_3", POSSIBLY_RELEVANT, "2026-07-18"),
            _record("paper_4", NOT_RELEVANT, "2026-07-21"),
        ]),
        selection_limit=2,
    )["rankedPayload"]["rankedRecords"]

    assert [(record["selected"], record["selectionReason"]) for record in ranked].count(
        (True, SELECTION_REASON_SELECTED)
    ) == 2
    assert any(
        record["selectionReason"] == SELECTION_REASON_BELOW_LIMIT
        for record in ranked
        if record["relevanceAssessment"]["classification"] != NOT_RELEVANT
    )
    assert any(record["selectionReason"] == SELECTION_REASON_NOT_RELEVANT for record in ranked)


def test_not_relevant_is_never_selected_even_inside_limit():
    ranked = rank_classified_papers(
        _payload([_record("paper_1", NOT_RELEVANT, "2026-07-20")]),
        selection_limit=5,
    )["rankedPayload"]["rankedRecords"]

    assert ranked[0]["rank"] == 1
    assert ranked[0]["selected"] is False
    assert ranked[0]["selectionReason"] == SELECTION_REASON_NOT_RELEVANT


def test_zero_selection_limit_selects_no_eligible_records():
    ranked = rank_classified_papers(
        _payload([_record("paper_1", RELEVANT, "2026-07-20")]),
        selection_limit=0,
    )["rankedPayload"]["rankedRecords"]

    assert ranked[0]["selected"] is False
    assert ranked[0]["selectionReason"] == SELECTION_REASON_BELOW_LIMIT


def test_ranking_result_contains_aggregate_statistics_only():
    result = rank_classified_papers(
        _payload([
            _record("paper_1", RELEVANT, "2026-07-20"),
            _record("paper_2", POSSIBLY_RELEVANT, "2026-07-19"),
            _record("paper_3", NOT_RELEVANT, "2026-07-18"),
        ]),
        selection_limit=2,
    )["rankingResult"]

    assert result == {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "sourceName": SOURCE_NAME,
        "inputCount": 3,
        "rankedCount": 3,
        "selectedCount": 2,
        "selectionLimit": 2,
        "scoreModelId": SCORE_MODEL_ID,
        "classificationCounts": {
            RELEVANT: 1,
            POSSIBLY_RELEVANT: 1,
            NOT_RELEVANT: 1,
        },
    }
    assert "rankedRecords" not in result
    assert "papers" not in result


def test_deterministic_output_for_identical_input():
    payload = _payload([
        _record("paper_b", RELEVANT, "2026-07-18"),
        _record("paper_a", RELEVANT, "2026-07-18"),
    ])

    assert rank_classified_papers(payload, selection_limit=1) == rank_classified_papers(payload, selection_limit=1)


def test_input_is_not_mutated():
    payload = _payload([_record("paper_1", RELEVANT, "2026-07-20")])
    before = deepcopy(payload)

    rank_classified_papers(payload, selection_limit=1)

    assert payload == before


def test_validation_failures_are_deterministic():
    with pytest.raises(ValueError, match="ranking requires classified payload"):
        rank_classified_papers(None, selection_limit=1)

    with pytest.raises(ValueError, match="ranking requires classified records"):
        rank_classified_papers({"runId": RUN_ID, "sourceName": SOURCE_NAME}, selection_limit=1)

    with pytest.raises(ValueError, match="ranking requires valid selection limit"):
        rank_classified_papers(_payload([]), selection_limit=-1)

    with pytest.raises(ValueError, match="ranking requires valid selection limit"):
        rank_classified_papers(_payload([]), selection_limit=True)

    with pytest.raises(ValueError, match="ranking requires valid classified paper"):
        rank_classified_papers(_payload([{"paperId": "paper_incomplete"}]), selection_limit=1)


def test_invalid_classification_is_rejected():
    record = _record("paper_1", RELEVANT, "2026-07-20")
    record["relevanceAssessment"]["classification"] = "Maybe"

    with pytest.raises(ValueError, match="ranking requires valid relevance assessment"):
        rank_classified_papers(_payload([record]), selection_limit=1)


def test_missing_or_invalid_published_date_is_rejected():
    missing = _record("paper_1", RELEVANT, "2026-07-20")
    missing["publishedDate"] = ""
    invalid = _record("paper_2", RELEVANT, "2026-99-99")

    with pytest.raises(ValueError, match="ranking requires valid classified paper"):
        rank_classified_papers(_payload([missing]), selection_limit=1)

    with pytest.raises(ValueError, match="ranking requires valid classified paper"):
        rank_classified_papers(_payload([invalid]), selection_limit=1)


def test_writer_writes_only_required_files_and_returns_persisted_counts(tmp_path):
    payload = _payload([
        _record("paper_1", RELEVANT, "2026-07-20"),
        _record("paper_2", NOT_RELEVANT, "2026-07-19"),
    ])

    result = write_ranking_outputs(payload, run_directory=tmp_path, selection_limit=1)

    assert sorted(path.name for path in tmp_path.iterdir()) == [
        "ranked_papers.json",
        "ranking_result.json",
    ]
    ranked = json.loads(result["rankedPapersPath"].read_text(encoding="utf-8"))
    summary = json.loads(result["rankingResultPath"].read_text(encoding="utf-8"))
    assert result == {
        "rankedPapersPath": tmp_path / "ranked_papers.json",
        "rankingResultPath": tmp_path / "ranking_result.json",
        "inputCount": 2,
        "rankedCount": 2,
        "selectedCount": 1,
        "selectionLimit": 1,
        "scoreModelId": SCORE_MODEL_ID,
        "classificationCounts": {RELEVANT: 1, POSSIBLY_RELEVANT: 0, NOT_RELEVANT: 1},
    }
    assert len(ranked["rankedRecords"]) == 2
    assert ranked["scoreModel"]["id"] == SCORE_MODEL_ID
    assert summary["rankedCount"] == 2


def test_second_write_failure_removes_new_first_output(tmp_path, monkeypatch):
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_ranking_outputs(_payload([_record("paper_1", RELEVANT, "2026-07-20")]), run_directory=tmp_path, selection_limit=1)

    assert list(tmp_path.iterdir()) == []


def test_second_write_failure_restores_preexisting_outputs(tmp_path, monkeypatch):
    first_path = tmp_path / "ranked_papers.json"
    second_path = tmp_path / "ranking_result.json"
    first_content = b'{"old":"ranked"}\n'
    second_content = b'{"old":"result"}\n'
    first_path.write_bytes(first_content)
    second_path.write_bytes(second_content)
    _fail_second_write(monkeypatch)

    with pytest.raises(RuntimeError, match="forced second write failure"):
        write_ranking_outputs(_payload([_record("paper_1", RELEVANT, "2026-07-20")]), run_directory=tmp_path, selection_limit=1)

    assert first_path.read_bytes() == first_content
    assert second_path.read_bytes() == second_content


def _components_by_id(score):
    return {component["componentId"]: component for component in score["components"]}


def _fail_second_write(monkeypatch):
    original_write_run_json = ranker.write_run_json

    def failing_write(run_directory, filename, data):
        if filename == "ranking_result.json":
            raise RuntimeError("forced second write failure")
        return original_write_run_json(run_directory, filename, data)

    monkeypatch.setattr(ranker, "write_run_json", failing_write)


def _payload(records):
    return {
        "runId": RUN_ID,
        "sourceName": SOURCE_NAME,
        "classifiedRecords": records,
    }


def _record(
    paper_id,
    classification,
    published_date,
    *,
    title=None,
    abstract="Abstract",
    authors=None,
    doi="https://doi.org/10.1234/example",
    source_url=None,
    publication_source="Journal of Offshore Wind Engineering",
    publication_type="journal",
    topic_tags=None,
    full_text_availability="abstract_only",
):
    if authors is None:
        authors = ["Author"]
    if source_url is None and doi:
        source_url = doi
    if topic_tags is None:
        topic_tags = ["Floating offshore wind"]

    return {
        "schemaVersion": "pipeline-data-0.1",
        "runId": RUN_ID,
        "paperId": paper_id,
        "candidateIds": [f"candidate_{paper_id}"],
        "sourceName": SOURCE_NAME,
        "sourceIdentifiers": {
            "openalexId": f"https://openalex.org/{paper_id}",
            "doi": doi,
        },
        "doi": doi,
        "title": title or f"Floating offshore wind turbine study {paper_id}",
        "authors": authors,
        "abstract": abstract,
        "publicationSource": publication_source,
        "publicationType": publication_type,
        "publishedDate": published_date,
        "indexedDate": None,
        "sourceUrl": source_url,
        "openAccessStatus": None,
        "fullTextAvailability": full_text_availability,
        "topicTags": topic_tags,
        "rawSources": [
            {
                "rawSourcePath": "pipeline/data/runs/run_20260718_090000_openalex/raw_openalex.json",
                "rawQueryIndex": 0,
                "rawPageIndex": 0,
                "rawResultIndex": 0,
                "queryGroup": "core_fowt",
                "queryTerm": "floating offshore wind",
            }
        ],
        "processingStatus": "classified",
        "relevanceAssessment": {
            "assessmentId": f"relevance_{paper_id}",
            "paperId": paper_id,
            "classification": classification,
            "confidence": 0.9,
            "reason": "test_reason",
            "topicTags": topic_tags,
            "evidenceBasis": ["title"],
            "modelName": None,
            "promptVersion": None,
            "generatedAt": "2026-07-18T09:00:00Z",
        },
    }
