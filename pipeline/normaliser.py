"""Pure helpers for normalising raw OpenAlex collector output."""

from __future__ import annotations

from typing import Any

SUCCESS_STATUS = "success"
FAILED_STATUS = "failed"


def iter_successful_openalex_works(raw_output: dict[str, Any]) -> list[dict[str, Any]]:
    """Return successful raw OpenAlex works with raw-output provenance."""
    records: list[dict[str, Any]] = []

    queries = raw_output.get("queries")
    if not isinstance(queries, list):
        return records

    for query_index, query in enumerate(queries):
        if not isinstance(query, dict) or query.get("status") == FAILED_STATUS:
            continue

        pages = query.get("pages")
        if not isinstance(pages, list):
            continue

        for page_index, page in enumerate(pages):
            if not isinstance(page, dict) or page.get("status") != SUCCESS_STATUS:
                continue

            raw_response = page.get("rawResponse")
            if not isinstance(raw_response, dict):
                continue
            results = raw_response.get("results")
            if not isinstance(results, list):
                continue

            for result_index, work in enumerate(results):
                if not isinstance(work, dict):
                    continue
                records.append(
                    {
                        "work": work,
                        "provenance": {
                            "rawQueryIndex": query_index,
                            "rawPageIndex": page_index,
                            "rawResultIndex": result_index,
                            "queryGroup": page.get("queryGroup"),
                            "queryTerm": page.get("queryTerm"),
                        },
                    }
                )

    return records


def reconstruct_abstract(abstract_inverted_index: Any) -> str | None:
    """Reconstruct OpenAlex abstract text from an inverted index."""
    if not isinstance(abstract_inverted_index, dict) or not abstract_inverted_index:
        return None

    positioned_words: dict[int, str] = {}
    for word, positions in abstract_inverted_index.items():
        if not isinstance(word, str) or not isinstance(positions, list) or not positions:
            return None
        for position in positions:
            if not isinstance(position, int) or position < 0:
                return None
            positioned_words[position] = word

    if not positioned_words:
        return None

    return " ".join(word for _, word in sorted(positioned_words.items()))
