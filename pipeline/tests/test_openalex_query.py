from datetime import date

import pytest

from pipeline.openalex_query import (
    DEFAULT_CURSOR,
    DEFAULT_PER_PAGE,
    FOWT_KEYWORD_GROUPS,
    OPENALEX_WORKS_URL,
    build_date_filter,
    build_pagination_params,
    build_query_url,
    build_search_params,
    iter_keyword_queries,
)


def test_keyword_groups_match_collector_contract():
    assert FOWT_KEYWORD_GROUPS == (
        (
            "core_fowt",
            (
                "floating offshore wind",
                "floating wind turbine",
                "floating offshore wind turbine",
            ),
        ),
        (
            "platform_and_station_keeping",
            (
                "floating wind platform",
                "floating wind mooring",
                "floating wind semi-submersible",
                "floating wind spar",
                "floating wind tension leg platform",
            ),
        ),
        (
            "electrical_and_operations",
            (
                "floating wind dynamic cable",
                "floating wind wake",
                "floating wind control",
                "floating wind installation",
                "floating wind operations",
            ),
        ),
    )


def test_build_date_filter_uses_weekly_publication_window():
    assert build_date_filter(date(2026, 8, 3), date(2026, 8, 9)) == (
        "from_publication_date:2026-08-03,to_publication_date:2026-08-09"
    )


def test_build_date_filter_rejects_reversed_window():
    with pytest.raises(ValueError, match="from_publication_date"):
        build_date_filter(date(2026, 8, 9), date(2026, 8, 3))


def test_build_pagination_params_uses_contract_defaults():
    assert build_pagination_params() == {
        "per-page": DEFAULT_PER_PAGE,
        "cursor": DEFAULT_CURSOR,
    }


def test_build_pagination_params_accepts_explicit_cursor_and_limit():
    assert build_pagination_params(per_page=25, cursor="abc") == {
        "per-page": 25,
        "cursor": "abc",
    }


def test_build_pagination_params_rejects_out_of_contract_limits():
    with pytest.raises(ValueError, match="between 1 and 50"):
        build_pagination_params(per_page=0)

    with pytest.raises(ValueError, match="between 1 and 50"):
        build_pagination_params(per_page=51)


def test_build_search_params_is_deterministic_for_identical_input():
    first = build_search_params(
        "floating offshore wind",
        from_publication_date=date(2026, 8, 3),
        to_publication_date=date(2026, 8, 9),
    )
    second = build_search_params(
        "floating offshore wind",
        from_publication_date=date(2026, 8, 3),
        to_publication_date=date(2026, 8, 9),
    )

    assert first == second
    assert first == {
        "search": "floating offshore wind",
        "filter": "from_publication_date:2026-08-03,to_publication_date:2026-08-09",
        "per-page": 50,
        "cursor": "*",
    }


def test_build_query_url_encodes_openalex_works_parameters():
    params = build_search_params(
        "floating wind turbine",
        from_publication_date=date(2026, 8, 3),
        to_publication_date=date(2026, 8, 9),
    )

    assert build_query_url(params) == (
        f"{OPENALEX_WORKS_URL}?"
        "search=floating+wind+turbine&"
        "filter=from_publication_date%3A2026-08-03%2Cto_publication_date%3A2026-08-09&"
        "per-page=50&"
        "cursor=%2A"
    )


def test_keyword_queries_expand_one_query_per_contract_term_in_order():
    queries = iter_keyword_queries(
        from_publication_date=date(2026, 8, 3),
        to_publication_date=date(2026, 8, 9),
    )

    assert len(queries) == 13
    assert [query["group"] for query in queries[:3]] == ["core_fowt"] * 3
    assert [query["term"] for query in queries[:3]] == [
        "floating offshore wind",
        "floating wind turbine",
        "floating offshore wind turbine",
    ]
    assert queries[-1]["group"] == "electrical_and_operations"
    assert queries[-1]["term"] == "floating wind operations"


def test_keyword_queries_are_deterministic():
    first = iter_keyword_queries(
        from_publication_date=date(2026, 8, 3),
        to_publication_date=date(2026, 8, 9),
    )
    second = iter_keyword_queries(
        from_publication_date=date(2026, 8, 3),
        to_publication_date=date(2026, 8, 9),
    )

    assert first == second
