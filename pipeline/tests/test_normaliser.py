from copy import deepcopy

from pipeline.normaliser import iter_successful_openalex_works, reconstruct_abstract


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
