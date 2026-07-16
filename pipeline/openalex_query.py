"""Deterministic OpenAlex Works query construction helpers."""

from __future__ import annotations

from datetime import date
from typing import Final
from urllib.parse import urlencode

OPENALEX_WORKS_URL: Final = "https://api.openalex.org/works"
DEFAULT_PER_PAGE: Final = 50
DEFAULT_CURSOR: Final = "*"

FOWT_KEYWORD_GROUPS: Final = (
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


def build_date_filter(from_publication_date: date, to_publication_date: date) -> str:
    """Build the contract weekly publication-date filter."""
    if from_publication_date > to_publication_date:
        raise ValueError("from_publication_date must be on or before to_publication_date")

    return (
        f"from_publication_date:{from_publication_date.isoformat()},"
        f"to_publication_date:{to_publication_date.isoformat()}"
    )


def build_pagination_params(
    *, per_page: int = DEFAULT_PER_PAGE, cursor: str = DEFAULT_CURSOR
) -> dict[str, str | int]:
    """Build cursor-pagination parameters for an OpenAlex Works query."""
    if per_page != DEFAULT_PER_PAGE:
        raise ValueError("per_page must be 50")
    if not cursor:
        raise ValueError("cursor must not be empty")

    return {"per-page": per_page, "cursor": cursor}


def build_search_params(
    search_term: str,
    *,
    from_publication_date: date,
    to_publication_date: date,
    per_page: int = DEFAULT_PER_PAGE,
    cursor: str = DEFAULT_CURSOR,
) -> dict[str, str | int]:
    """Build deterministic OpenAlex Works search parameters for one term."""
    if not search_term.strip():
        raise ValueError("search_term must not be empty")

    params: dict[str, str | int] = {
        "search": search_term,
        "filter": build_date_filter(from_publication_date, to_publication_date),
    }
    params.update(build_pagination_params(per_page=per_page, cursor=cursor))
    return params


def build_query_url(params: dict[str, str | int]) -> str:
    """Build a deterministic OpenAlex Works URL from query parameters."""
    return f"{OPENALEX_WORKS_URL}?{urlencode(params)}"


def iter_keyword_queries(
    *,
    from_publication_date: date,
    to_publication_date: date,
    per_page: int = DEFAULT_PER_PAGE,
    cursor: str = DEFAULT_CURSOR,
) -> list[dict[str, object]]:
    """Generate one deterministic query descriptor per contract keyword term."""
    queries: list[dict[str, object]] = []

    for group_name, terms in FOWT_KEYWORD_GROUPS:
        for term in terms:
            params = build_search_params(
                term,
                from_publication_date=from_publication_date,
                to_publication_date=to_publication_date,
                per_page=per_page,
                cursor=cursor,
            )
            queries.append(
                {
                    "group": group_name,
                    "term": term,
                    "params": params,
                    "url": build_query_url(params),
                }
            )

    return queries
