from copy import deepcopy

import pytest

from pipeline.ids import make_candidate_id, make_paper_id
from pipeline.normaliser import (
    iter_successful_openalex_works,
    map_openalex_work_to_candidate,
    map_openalex_work_to_metadata,
    reconstruct_abstract,
)


def test_extracts_works_from_one_successful_page_with_provenance():
    raw_output = {
        "queries": [
            {
                "status": "success",
                "pages": [
                    {
                        "status": "success",
                        "queryGroup": "core_fowt",
                        "queryTerm": "floating offshore wind",
                        "rawResponse": {
                            "results": [
                                {"id": "W1"},
                                {"id": "W2"},
                            ]
                        },
                    }
                ],
            }
        ]
    }

    records = iter_successful_openalex_works(raw_output)

    assert records == [
        {
            "work": {"id": "W1"},
            "provenance": {
                "rawQueryIndex": 0,
                "rawPageIndex": 0,
                "rawResultIndex": 0,
                "queryGroup": "core_fowt",
                "queryTerm": "floating offshore wind",
            },
        },
        {
            "work": {"id": "W2"},
            "provenance": {
                "rawQueryIndex": 0,
                "rawPageIndex": 0,
                "rawResultIndex": 1,
                "queryGroup": "core_fowt",
                "queryTerm": "floating offshore wind",
            },
        },
    ]


def test_extracts_multiple_queries_and_pages_in_deterministic_order():
    raw_output = {
        "queries": [
            _query(
                "success",
                [
                    _page("success", "group-a", "term-a", [{"id": "A0"}]),
                    _page("success", "group-a", "term-a", [{"id": "A1"}]),
                ],
            ),
            _query(
                "partial",
                [
                    _page("success", "group-b", "term-b", [{"id": "B0"}, {"id": "B1"}]),
                ],
            ),
        ]
    }

    records = iter_successful_openalex_works(raw_output)

    assert [record["work"]["id"] for record in records] == ["A0", "A1", "B0", "B1"]
    assert [record["provenance"] for record in records] == [
        {
            "rawQueryIndex": 0,
            "rawPageIndex": 0,
            "rawResultIndex": 0,
            "queryGroup": "group-a",
            "queryTerm": "term-a",
        },
        {
            "rawQueryIndex": 0,
            "rawPageIndex": 1,
            "rawResultIndex": 0,
            "queryGroup": "group-a",
            "queryTerm": "term-a",
        },
        {
            "rawQueryIndex": 1,
            "rawPageIndex": 0,
            "rawResultIndex": 0,
            "queryGroup": "group-b",
            "queryTerm": "term-b",
        },
        {
            "rawQueryIndex": 1,
            "rawPageIndex": 0,
            "rawResultIndex": 1,
            "queryGroup": "group-b",
            "queryTerm": "term-b",
        },
    ]


def test_ignores_failed_pages_and_failed_queries():
    raw_output = {
        "queries": [
            _query("failed", [_page("success", "ignored", "ignored", [{"id": "ignored"}])]),
            _query(
                "partial",
                [
                    _page("failed", "group", "term", [{"id": "failed-page"}]),
                    _page("success", "group", "term", [{"id": "kept"}]),
                ],
            ),
        ]
    }

    records = iter_successful_openalex_works(raw_output)

    assert [record["work"]["id"] for record in records] == ["kept"]
    assert records[0]["provenance"] == {
        "rawQueryIndex": 1,
        "rawPageIndex": 1,
        "rawResultIndex": 0,
        "queryGroup": "group",
        "queryTerm": "term",
    }


def test_extraction_does_not_mutate_raw_input():
    raw_output = {
        "queries": [_query("success", [_page("success", "group", "term", [{"id": "W1"}])])]
    }
    before = deepcopy(raw_output)

    iter_successful_openalex_works(raw_output)

    assert raw_output == before


def test_none_queries_returns_no_records():
    assert iter_successful_openalex_works({"queries": None}) == []


def test_none_pages_returns_no_records():
    raw_output = {"queries": [{"status": "success", "pages": None}]}

    assert iter_successful_openalex_works(raw_output) == []


def test_reconstructs_standard_abstract():
    abstract_index = {"floating": [0], "wind": [1], "matters": [2]}

    assert reconstruct_abstract(abstract_index) == "floating wind matters"


def test_reconstructs_repeated_words():
    abstract_index = {"floating": [0, 3], "wind": [1], "offshore": [2]}

    assert reconstruct_abstract(abstract_index) == "floating wind offshore floating"


def test_reconstructs_sparse_positions_without_padding():
    abstract_index = {"floating": [0], "wind": [3], "platform": [7]}

    assert reconstruct_abstract(abstract_index) == "floating wind platform"


def test_missing_or_empty_abstract_index_returns_none():
    assert reconstruct_abstract(None) is None
    assert reconstruct_abstract({}) is None


def test_malformed_abstract_index_returns_none():
    assert reconstruct_abstract(["not", "a", "dict"]) is None
    assert reconstruct_abstract({"floating": "0"}) is None
    assert reconstruct_abstract({"floating": []}) is None
    assert reconstruct_abstract({1: [0]}) is None
    assert reconstruct_abstract({"floating": [-1]}) is None
    assert reconstruct_abstract({"floating": [0.5]}) is None


def test_maps_complete_openalex_work_to_candidate():
    extracted = _extracted(
        {
            "id": " https://openalex.org/W123 ",
            "doi": " https://doi.org/10.123/example ",
            "title": "Floating wind platform response",
            "display_name": "Fallback title",
            "publication_date": "2026-07-01",
            "primary_location": {
                "landing_page_url": " https://example.org/paper ",
                "source": {"display_name": "Journal of Floating Wind"},
            },
            "authorships": [{"author": {"display_name": "Ada Example"}}],
            "abstract_inverted_index": {"floating": [0]},
        }
    )

    candidate = map_openalex_work_to_candidate(
        extracted,
        run_id="run_20260716_090000_openalex",
        raw_source_path="pipeline/data/runs/run_20260716_090000_openalex/raw_openalex.json",
        discovery_date="2026-07-16T09:00:00Z",
    )

    assert candidate == {
        "schemaVersion": "pipeline-data-0.1",
        "runId": "run_20260716_090000_openalex",
        "candidateId": make_candidate_id(openalex_id="https://openalex.org/W123"),
        "sourceName": "openalex",
        "sourceIdentifiers": {
            "openalexId": "https://openalex.org/W123",
            "doi": "https://doi.org/10.123/example",
        },
        "queryGroup": "core_fowt",
        "queryTerm": "floating offshore wind turbine",
        "rawSourcePath": "pipeline/data/runs/run_20260716_090000_openalex/raw_openalex.json",
        "rawQueryIndex": 2,
        "rawPageIndex": 1,
        "rawResultIndex": 4,
        "sourceUrl": "https://example.org/paper",
        "publishedDate": "2026-07-01",
        "discoveryDate": "2026-07-16T09:00:00Z",
        "processingStatus": "collected",
    }
    assert "abstract" not in candidate
    assert "authors" not in candidate
    assert "publicationSource" not in candidate
    assert "publicationType" not in candidate
    assert "topicTags" not in candidate


def test_candidate_id_is_deterministic_for_identical_input():
    extracted = _extracted({"id": "https://openalex.org/W999"})

    first = map_openalex_work_to_candidate(
        extracted,
        run_id="run_20260716_090000_openalex",
        raw_source_path="raw_openalex.json",
        discovery_date="2026-07-16T09:00:00Z",
    )
    second = map_openalex_work_to_candidate(
        deepcopy(extracted),
        run_id="run_20260716_090000_openalex",
        raw_source_path="raw_openalex.json",
        discovery_date="2026-07-16T09:00:00Z",
    )

    assert first == second
    assert first["candidateId"] == make_candidate_id(
        openalex_id="https://openalex.org/W999"
    )


def test_maps_candidate_with_missing_doi_as_none():
    candidate = map_openalex_work_to_candidate(
        _extracted({"id": "https://openalex.org/W1"}),
        run_id="run_20260716_090000_openalex",
        raw_source_path="raw_openalex.json",
        discovery_date="2026-07-16T09:00:00Z",
    )

    assert candidate["sourceIdentifiers"] == {
        "openalexId": "https://openalex.org/W1",
        "doi": None,
    }


def test_missing_abstract_and_authors_do_not_affect_candidate_mapping():
    candidate = map_openalex_work_to_candidate(
        _extracted({"id": "https://openalex.org/W2"}),
        run_id="run_20260716_090000_openalex",
        raw_source_path="raw_openalex.json",
        discovery_date="2026-07-16T09:00:00Z",
    )

    assert "abstract" not in candidate
    assert "authors" not in candidate


def test_missing_publication_date_is_allowed_when_openalex_id_exists():
    candidate = map_openalex_work_to_candidate(
        _extracted({"id": "https://openalex.org/W3"}),
        run_id="run_20260716_090000_openalex",
        raw_source_path="raw_openalex.json",
        discovery_date="2026-07-16T09:00:00Z",
    )

    assert candidate["publishedDate"] is None
    assert candidate["candidateId"] == make_candidate_id(
        openalex_id="https://openalex.org/W3"
    )


def test_publication_source_is_not_mapped_for_candidates():
    candidate = map_openalex_work_to_candidate(
        _extracted(
            {
                "id": "https://openalex.org/W4",
                "primary_location": {
                    "source": {"display_name": "Journal of Floating Wind"}
                },
            }
        ),
        run_id="run_20260716_090000_openalex",
        raw_source_path="raw_openalex.json",
        discovery_date="2026-07-16T09:00:00Z",
    )

    assert "publicationSource" not in candidate
    assert candidate["sourceUrl"] == "https://openalex.org/W4"


def test_candidate_uses_title_and_date_when_source_ids_are_missing():
    candidate = map_openalex_work_to_candidate(
        _extracted(
            {
                "title": "Floating wind mooring review",
                "publication_date": "2026-07-15",
            }
        ),
        run_id="run_20260716_090000_openalex",
        raw_source_path="raw_openalex.json",
        discovery_date="2026-07-16T09:00:00Z",
    )

    assert candidate["candidateId"] == make_candidate_id(
        title="Floating wind mooring review",
        published_date="2026-07-15",
    )
    assert candidate["sourceIdentifiers"]["openalexId"] is None
    assert candidate["sourceUrl"] is None


def test_rejects_candidate_without_any_documented_id_source():
    with pytest.raises(ValueError, match="candidate_rejected_missing_id_source"):
        map_openalex_work_to_candidate(
            _extracted({"title": "Floating wind only"}),
            run_id="run_20260716_090000_openalex",
            raw_source_path="raw_openalex.json",
            discovery_date="2026-07-16T09:00:00Z",
        )


def test_malformed_source_values_are_treated_as_missing():
    candidate = map_openalex_work_to_candidate(
        _extracted(
            {
                "id": 123,
                "doi": ["10.123/example"],
                "title": 456,
                "display_name": "Fallback display name",
                "publication_date": "2026-07-15",
                "primary_location": {"landing_page_url": 789},
            }
        ),
        run_id="run_20260716_090000_openalex",
        raw_source_path="raw_openalex.json",
        discovery_date="2026-07-16T09:00:00Z",
    )

    assert candidate["sourceIdentifiers"] == {"openalexId": None, "doi": None}
    assert candidate["sourceUrl"] is None
    assert candidate["candidateId"] == make_candidate_id(
        title="Fallback display name",
        published_date="2026-07-15",
    )


def test_candidate_mapping_does_not_mutate_input():
    extracted = _extracted(
        {
            "id": "https://openalex.org/W5",
            "primary_location": {"landing_page_url": "https://example.org/W5"},
        }
    )
    before = deepcopy(extracted)

    map_openalex_work_to_candidate(
        extracted,
        run_id="run_20260716_090000_openalex",
        raw_source_path="raw_openalex.json",
        discovery_date="2026-07-16T09:00:00Z",
    )

    assert extracted == before


def test_maps_complete_openalex_work_to_metadata():
    extracted = _metadata_extracted(
        {
            "id": "https://openalex.org/W123",
            "doi": " https://doi.org/10.123/example ",
            "title": " Floating wind platform response ",
            "display_name": "Fallback title",
            "publication_date": "2026-07-01",
            "abstract_inverted_index": {"floating": [0], "wind": [1]},
            "authorships": [
                {"author": {"display_name": " Ada Example "}},
                {"author": {"display_name": "Ben Example"}},
            ],
            "primary_location": {
                "landing_page_url": "https://ignored.example/source",
                "source": {"display_name": " Journal of Floating Wind "},
            },
            "type": "journal-article",
            "open_access": {"oa_status": " gold ", "is_oa": True},
            "topics": [
                {"display_name": "Floating offshore wind"},
                {"display_name": "Mooring systems"},
            ],
            "concepts": [
                {"display_name": "Mooring systems"},
                {"display_name": "Hydrodynamics"},
            ],
        }
    )
    candidate = _candidate(
        source_identifiers={
            "openalexId": "https://openalex.org/W123",
            "doi": "https://doi.org/10.123/example",
        },
        source_url="https://candidate.example/source",
    )

    metadata = map_openalex_work_to_metadata(extracted, candidate)

    assert metadata == {
        "schemaVersion": "pipeline-data-0.1",
        "runId": "run_20260716_090000_openalex",
        "paperId": make_paper_id(doi="https://doi.org/10.123/example"),
        "candidateIds": ["candidate_openalex_abc123"],
        "sourceName": "openalex",
        "sourceIdentifiers": {
            "openalexId": "https://openalex.org/W123",
            "doi": "https://doi.org/10.123/example",
        },
        "doi": "https://doi.org/10.123/example",
        "title": "Floating wind platform response",
        "authors": ["Ada Example", "Ben Example"],
        "abstract": "floating wind",
        "publicationSource": "Journal of Floating Wind",
        "publicationType": "journal",
        "publishedDate": "2026-07-01",
        "indexedDate": None,
        "sourceUrl": "https://candidate.example/source",
        "openAccessStatus": "gold",
        "fullTextAvailability": "full_text_available",
        "topicTags": [
            "Floating offshore wind",
            "Mooring systems",
            "Hydrodynamics",
        ],
        "rawSources": [
            {
                "rawSourcePath": "pipeline/data/runs/run_20260716_090000_openalex/raw_openalex.json",
                "rawQueryIndex": 2,
                "rawPageIndex": 1,
                "rawResultIndex": 4,
                "queryGroup": "core_fowt",
                "queryTerm": "floating offshore wind turbine",
            }
        ],
        "processingStatus": "normalised",
    }


def test_metadata_paper_id_uses_doi_first():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W123",
                "doi": "10.123/example",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
            }
        ),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W123", "doi": None}),
    )

    assert metadata["paperId"] == make_paper_id(doi="10.123/example")


def test_metadata_paper_id_falls_back_to_openalex_id():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W123",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
            }
        ),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W123", "doi": None}),
    )

    assert metadata["paperId"] == make_paper_id(openalex_id="https://openalex.org/W123")


def test_metadata_paper_id_falls_back_to_title_and_date():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "title": "Floating Wind Mooring Review",
                "publication_date": "2026-07-01",
            }
        ),
        _candidate(source_identifiers={"openalexId": None, "doi": None}),
    )

    assert metadata["paperId"] == make_paper_id(
        title="Floating Wind Mooring Review",
        published_date="2026-07-01",
    )


def test_metadata_paper_id_is_deterministic():
    extracted = _metadata_extracted(
        {
            "id": "https://openalex.org/W999",
            "title": "Floating Wind",
            "publication_date": "2026-07-01",
        }
    )
    candidate = _candidate(source_identifiers={"openalexId": "https://openalex.org/W999", "doi": None})

    first = map_openalex_work_to_metadata(extracted, candidate)
    second = map_openalex_work_to_metadata(deepcopy(extracted), deepcopy(candidate))

    assert first == second
    assert first["paperId"] == make_paper_id(openalex_id="https://openalex.org/W999")


def test_metadata_missing_doi_is_none():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted({"id": "https://openalex.org/W1", "title": "T", "publication_date": "2026-07-01"}),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert metadata["doi"] is None
    assert metadata["sourceIdentifiers"]["doi"] is None


def test_metadata_rejects_missing_title():
    with pytest.raises(ValueError, match="metadata_rejected_missing_title"):
        map_openalex_work_to_metadata(
            _metadata_extracted({"id": "https://openalex.org/W1", "publication_date": "2026-07-01"}),
            _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
        )


def test_metadata_rejects_missing_published_date():
    with pytest.raises(ValueError, match="metadata_rejected_missing_published_date"):
        map_openalex_work_to_metadata(
            _metadata_extracted({"id": "https://openalex.org/W1", "title": "Floating Wind"}),
            _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
        )


def test_metadata_maps_ordered_authors_and_ignores_malformed_entries():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W1",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
                "authorships": [
                    {"author": {"display_name": "First Author"}},
                    {"author": {"display_name": "  "}},
                    {"author": {"display_name": "Second Author"}},
                    {"author": {}},
                    {"not_author": {"display_name": "Ignored"}},
                    "malformed",
                ],
            }
        ),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert metadata["authors"] == ["First Author", "Second Author"]


def test_metadata_missing_authors_are_empty_list():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted({"id": "https://openalex.org/W1", "title": "Floating Wind", "publication_date": "2026-07-01"}),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert metadata["authors"] == []


def test_metadata_reconstructs_abstract():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W1",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
                "abstract_inverted_index": {"floating": [0], "wind": [1]},
            }
        ),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert metadata["abstract"] == "floating wind"


def test_metadata_missing_or_malformed_abstract_is_none():
    missing = map_openalex_work_to_metadata(
        _metadata_extracted({"id": "https://openalex.org/W1", "title": "Floating Wind", "publication_date": "2026-07-01"}),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )
    malformed = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W1",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
                "abstract_inverted_index": {"floating": []},
            }
        ),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert missing["abstract"] is None
    assert malformed["abstract"] is None


def test_metadata_publication_source_mapping():
    with_source = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W1",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
                "primary_location": {"source": {"display_name": " Source Name "}},
            }
        ),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )
    without_source = map_openalex_work_to_metadata(
        _metadata_extracted({"id": "https://openalex.org/W1", "title": "Floating Wind", "publication_date": "2026-07-01"}),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert with_source["publicationSource"] == "Source Name"
    assert without_source["publicationSource"] is None


@pytest.mark.parametrize(
    ("openalex_type", "expected"),
    [
        ("journal-article", "journal"),
        ("proceedings-article", "conference"),
        ("preprint", "preprint"),
        ("book-chapter", "unknown"),
        (None, "unknown"),
    ],
)
def test_metadata_publication_type_mapping(openalex_type, expected):
    work = {
        "id": "https://openalex.org/W1",
        "title": "Floating Wind",
        "publication_date": "2026-07-01",
    }
    if openalex_type is not None:
        work["type"] = openalex_type

    metadata = map_openalex_work_to_metadata(
        _metadata_extracted(work),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert metadata["publicationType"] == expected


def test_metadata_topic_tags_use_topics_then_concepts_and_remove_duplicates():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W1",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
                "topics": [
                    {"display_name": "Topic A"},
                    {"display_name": "Topic B"},
                    {"display_name": "Topic A"},
                    {"display_name": "  "},
                    "malformed",
                ],
                "concepts": [
                    {"display_name": "Topic B"},
                    {"display_name": "Concept C"},
                ],
            }
        ),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert metadata["topicTags"] == ["Topic A", "Topic B", "Concept C"]


def test_metadata_missing_topics_and_concepts_are_empty_list():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted({"id": "https://openalex.org/W1", "title": "Floating Wind", "publication_date": "2026-07-01"}),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert metadata["topicTags"] == []


def test_metadata_full_text_availability_states():
    full_text = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W1",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
                "open_access": {"is_oa": True},
            }
        ),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )
    abstract_only = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W2",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
                "abstract_inverted_index": {"floating": [0]},
                "open_access": {"is_oa": False},
            }
        ),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W2", "doi": None}),
    )
    none = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W3",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
                "open_access": {"is_oa": False},
            }
        ),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W3", "doi": None}),
    )

    assert full_text["fullTextAvailability"] == "full_text_available"
    assert abstract_only["fullTextAvailability"] == "abstract_only"
    assert none["fullTextAvailability"] == "none"


def test_metadata_open_access_status_missing_is_none():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted({"id": "https://openalex.org/W1", "title": "Floating Wind", "publication_date": "2026-07-01"}),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert metadata["openAccessStatus"] is None


def test_metadata_raw_sources_exact_shape():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted({"id": "https://openalex.org/W1", "title": "Floating Wind", "publication_date": "2026-07-01"}),
        _candidate(source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None}),
    )

    assert metadata["rawSources"] == [
        {
            "rawSourcePath": "pipeline/data/runs/run_20260716_090000_openalex/raw_openalex.json",
            "rawQueryIndex": 2,
            "rawPageIndex": 1,
            "rawResultIndex": 4,
            "queryGroup": "core_fowt",
            "queryTerm": "floating offshore wind turbine",
        }
    ]


def test_metadata_source_url_is_copied_from_candidate():
    metadata = map_openalex_work_to_metadata(
        _metadata_extracted(
            {
                "id": "https://openalex.org/W1",
                "title": "Floating Wind",
                "publication_date": "2026-07-01",
                "primary_location": {"landing_page_url": "https://work.example/source"},
            }
        ),
        _candidate(
            source_identifiers={"openalexId": "https://openalex.org/W1", "doi": None},
            source_url="https://candidate.example/source",
        ),
    )

    assert metadata["sourceUrl"] == "https://candidate.example/source"


def test_metadata_rejects_invalid_extracted_record_shape():
    with pytest.raises(ValueError, match="metadata requires extracted work"):
        map_openalex_work_to_metadata({"work": None}, _candidate())


@pytest.mark.parametrize("invalid_extracted_record", [None, "not a record"])
def test_metadata_rejects_non_dict_extracted_record(invalid_extracted_record):
    with pytest.raises(ValueError, match="metadata requires extracted work"):
        map_openalex_work_to_metadata(invalid_extracted_record, _candidate())


def test_metadata_rejects_invalid_candidate_shape():
    with pytest.raises(ValueError, match="metadata requires candidate"):
        map_openalex_work_to_metadata(
            _metadata_extracted({"title": "Floating Wind", "publication_date": "2026-07-01"}),
            None,
        )


def test_metadata_rejects_candidate_without_source_identifiers():
    with pytest.raises(ValueError, match="metadata requires candidate sourceIdentifiers"):
        map_openalex_work_to_metadata(
            _metadata_extracted({"title": "Floating Wind", "publication_date": "2026-07-01"}),
            {"candidateId": "candidate_openalex_abc123"},
        )


def test_metadata_mapping_does_not_mutate_inputs():
    extracted = _metadata_extracted(
        {
            "id": "https://openalex.org/W5",
            "title": "Floating Wind",
            "publication_date": "2026-07-01",
            "authorships": [{"author": {"display_name": "Ada Example"}}],
            "topics": [{"display_name": "Topic A"}],
        }
    )
    candidate = _candidate(source_identifiers={"openalexId": "https://openalex.org/W5", "doi": None})
    before_extracted = deepcopy(extracted)
    before_candidate = deepcopy(candidate)

    map_openalex_work_to_metadata(extracted, candidate)

    assert extracted == before_extracted
    assert candidate == before_candidate
def _query(status, pages):
    return {
        "status": status,
        "pages": pages,
    }


def _page(status, query_group, query_term, results):
    return {
        "status": status,
        "queryGroup": query_group,
        "queryTerm": query_term,
        "rawResponse": {"results": results},
    }


def _extracted(work):
    return {
        "work": work,
        "provenance": {
            "rawQueryIndex": 2,
            "rawPageIndex": 1,
            "rawResultIndex": 4,
            "queryGroup": "core_fowt",
            "queryTerm": "floating offshore wind turbine",
        },
    }

def _metadata_extracted(work):
    return _extracted(work)


def _candidate(source_identifiers=None, source_url="https://candidate.example/source"):
    if source_identifiers is None:
        source_identifiers = {
            "openalexId": "https://openalex.org/W123",
            "doi": None,
        }
    return {
        "schemaVersion": "pipeline-data-0.1",
        "runId": "run_20260716_090000_openalex",
        "candidateId": "candidate_openalex_abc123",
        "sourceName": "openalex",
        "sourceIdentifiers": source_identifiers,
        "queryGroup": "core_fowt",
        "queryTerm": "floating offshore wind turbine",
        "rawSourcePath": "pipeline/data/runs/run_20260716_090000_openalex/raw_openalex.json",
        "rawQueryIndex": 2,
        "rawPageIndex": 1,
        "rawResultIndex": 4,
        "sourceUrl": source_url,
        "publishedDate": "2026-07-01",
        "discoveryDate": "2026-07-16T09:00:00Z",
        "processingStatus": "collected",
    }