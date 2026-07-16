"""Pure helpers for normalising raw OpenAlex collector output."""

from __future__ import annotations

from typing import Any

from pipeline.ids import make_candidate_id

SUCCESS_STATUS = "success"
FAILED_STATUS = "failed"
SCHEMA_VERSION = "pipeline-data-0.1"
SOURCE_NAME = "openalex"
COLLECTED_STATUS = "collected"


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


def map_openalex_work_to_candidate(
    extracted_record: dict[str, Any],
    *,
    run_id: str,
    raw_source_path: str,
    discovery_date: str,
) -> dict[str, Any]:
    """Map one extracted OpenAlex work into the PaperCandidate shape."""
    work = extracted_record.get("work")
    provenance = extracted_record.get("provenance")
    if not isinstance(work, dict) or not isinstance(provenance, dict):
        raise ValueError("candidate requires extracted work and provenance")

    openalex_id = _clean_string(work.get("id"))
    doi = _clean_string(work.get("doi"))
    published_date = _clean_string(work.get("publication_date"))
    title = _first_clean_string(work, "title", "display_name")
    source_url = _source_url(work)

    try:
        candidate_id = make_candidate_id(
            openalex_id=openalex_id,
            source_url=source_url,
            title=title,
            published_date=published_date,
        )
    except ValueError as exc:
        raise ValueError("candidate_rejected_missing_id_source") from exc

    return {
        "schemaVersion": SCHEMA_VERSION,
        "runId": run_id,
        "candidateId": candidate_id,
        "sourceName": SOURCE_NAME,
        "sourceIdentifiers": {
            "openalexId": openalex_id,
            "doi": doi,
        },
        "queryGroup": provenance.get("queryGroup"),
        "queryTerm": provenance.get("queryTerm"),
        "rawSourcePath": raw_source_path,
        "rawQueryIndex": provenance.get("rawQueryIndex"),
        "rawPageIndex": provenance.get("rawPageIndex"),
        "rawResultIndex": provenance.get("rawResultIndex"),
        "sourceUrl": source_url,
        "publishedDate": published_date,
        "discoveryDate": discovery_date,
        "processingStatus": COLLECTED_STATUS,
    }


def _source_url(work: dict[str, Any]) -> str | None:
    primary_location = work.get("primary_location")
    if isinstance(primary_location, dict):
        landing_page_url = _clean_string(primary_location.get("landing_page_url"))
        if landing_page_url:
            return landing_page_url

    openalex_id = _clean_string(work.get("id"))
    if openalex_id and _is_url_like(openalex_id):
        return openalex_id
    return None


def _first_clean_string(source: dict[str, Any], *keys: str) -> str | None:
    for key in keys:
        value = _clean_string(source.get(key))
        if value:
            return value
    return None


def _clean_string(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    value = value.strip()
    return value or None


def _is_url_like(value: str) -> bool:
    return value.startswith("https://") or value.startswith("http://")
