"""Pure helpers for normalising raw OpenAlex collector output."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from pipeline.ids import make_candidate_id, make_paper_id
from pipeline.run_storage import write_run_json

SUCCESS_STATUS = "success"
FAILED_STATUS = "failed"
SCHEMA_VERSION = "pipeline-data-0.1"
SOURCE_NAME = "openalex"
COLLECTED_STATUS = "collected"
NORMALISED_STATUS = "normalised"


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


def map_openalex_work_to_metadata(
    extracted_record: dict[str, Any],
    candidate: dict[str, Any],
) -> dict[str, Any]:
    """Map one extracted OpenAlex work and candidate into PaperMetadata."""
    if not isinstance(extracted_record, dict):
        raise ValueError("metadata requires extracted work")
    work = extracted_record.get("work")
    if not isinstance(work, dict):
        raise ValueError("metadata requires extracted work")
    if not isinstance(candidate, dict):
        raise ValueError("metadata requires candidate")

    source_identifiers = candidate.get("sourceIdentifiers")
    if not isinstance(source_identifiers, dict):
        raise ValueError("metadata requires candidate sourceIdentifiers")

    title = _first_clean_string(work, "title", "display_name")
    if not title:
        raise ValueError("metadata_rejected_missing_title")

    published_date = _clean_string(work.get("publication_date"))
    if not published_date:
        raise ValueError("metadata_rejected_missing_published_date")

    openalex_id = _clean_string(source_identifiers.get("openalexId"))
    doi = _clean_string(work.get("doi"))
    if doi is None:
        doi = _clean_string(source_identifiers.get("doi"))
    abstract = reconstruct_abstract(work.get("abstract_inverted_index"))

    paper_id = make_paper_id(
        doi=doi,
        openalex_id=openalex_id,
        title=title,
        published_date=published_date,
    )

    return {
        "schemaVersion": SCHEMA_VERSION,
        "runId": candidate.get("runId"),
        "paperId": paper_id,
        "candidateIds": [candidate.get("candidateId")],
        "sourceName": candidate.get("sourceName"),
        "sourceIdentifiers": {
            "openalexId": openalex_id,
            "doi": doi,
        },
        "doi": doi,
        "title": title,
        "authors": _authors(work),
        "abstract": abstract,
        "publicationSource": _publication_source(work),
        "publicationType": _publication_type(work),
        "publishedDate": published_date,
        "indexedDate": None,
        "sourceUrl": candidate.get("sourceUrl"),
        "openAccessStatus": _open_access_status(work),
        "fullTextAvailability": _full_text_availability(work, abstract),
        "topicTags": _topic_tags(work),
        "rawSources": [_raw_source(candidate)],
        "processingStatus": NORMALISED_STATUS,
    }


def write_normalisation_outputs(
    raw_output: dict[str, Any],
    *,
    run_directory: str | Path,
    run_id: str,
    raw_source_path: str,
    discovery_date: str,
) -> dict[str, Any]:
    """Write candidates.json and normalised.json from raw OpenAlex output."""
    candidates: list[dict[str, Any]] = []
    rejected_candidates: list[dict[str, Any]] = []
    normalised_records: list[dict[str, Any]] = []
    rejected_records: list[dict[str, Any]] = []

    for extracted_record in iter_successful_openalex_works(raw_output):
        try:
            candidate = map_openalex_work_to_candidate(
                extracted_record,
                run_id=run_id,
                raw_source_path=raw_source_path,
                discovery_date=discovery_date,
            )
        except ValueError as exc:
            rejected_candidates.append(
                {
                    "reason": str(exc),
                    "provenance": _raw_location_from_extracted(
                        extracted_record,
                        raw_source_path=raw_source_path,
                    ),
                }
            )
            continue

        candidates.append(candidate)

        try:
            metadata = map_openalex_work_to_metadata(extracted_record, candidate)
        except ValueError as exc:
            rejected_records.append(
                {
                    "candidateId": candidate.get("candidateId"),
                    "reason": str(exc),
                    "provenance": _raw_location_from_candidate(candidate),
                }
            )
            continue

        normalised_records.append(metadata)

    candidates_payload = {
        "runId": run_id,
        "sourceName": SOURCE_NAME,
        "candidates": candidates,
        "rejectedCandidates": rejected_candidates,
    }
    normalised_payload = {
        "runId": run_id,
        "sourceName": SOURCE_NAME,
        "normalisedRecords": normalised_records,
        "rejectedRecords": rejected_records,
    }

    candidates_path = write_run_json(run_directory, "candidates.json", candidates_payload)
    normalised_path = write_run_json(run_directory, "normalised.json", normalised_payload)

    return {
        "candidatesPath": candidates_path,
        "normalisedPath": normalised_path,
        "candidateCount": len(candidates),
        "rejectedCandidateCount": len(rejected_candidates),
        "normalisedCount": len(normalised_records),
        "rejectedRecordCount": len(rejected_records),
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


def _authors(work: dict[str, Any]) -> list[str]:
    authorships = work.get("authorships")
    if not isinstance(authorships, list):
        return []

    authors: list[str] = []
    for authorship in authorships:
        if not isinstance(authorship, dict):
            continue
        author = authorship.get("author")
        if not isinstance(author, dict):
            continue
        name = _clean_string(author.get("display_name"))
        if name:
            authors.append(name)
    return authors


def _publication_source(work: dict[str, Any]) -> str | None:
    primary_location = work.get("primary_location")
    if not isinstance(primary_location, dict):
        return None
    source = primary_location.get("source")
    if not isinstance(source, dict):
        return None
    return _clean_string(source.get("display_name"))


def _publication_type(work: dict[str, Any]) -> str:
    value = _clean_string(work.get("type"))
    if value == "journal-article":
        return "journal"
    if value == "proceedings-article":
        return "conference"
    if value == "preprint":
        return "preprint"
    return "unknown"


def _open_access_status(work: dict[str, Any]) -> str | None:
    open_access = work.get("open_access")
    if not isinstance(open_access, dict):
        return None
    return _clean_string(open_access.get("oa_status"))


def _full_text_availability(work: dict[str, Any], abstract: str | None) -> str:
    open_access = work.get("open_access")
    if isinstance(open_access, dict) and open_access.get("is_oa") is True:
        return "full_text_available"
    if abstract:
        return "abstract_only"
    return "none"


def _topic_tags(work: dict[str, Any]) -> list[str]:
    tags: list[str] = []
    seen: set[str] = set()
    for key in ("topics", "concepts"):
        values = work.get(key)
        if not isinstance(values, list):
            continue
        for value in values:
            if not isinstance(value, dict):
                continue
            tag = _clean_string(value.get("display_name"))
            if tag and tag not in seen:
                seen.add(tag)
                tags.append(tag)
    return tags


def _raw_source(candidate: dict[str, Any]) -> dict[str, Any]:
    return {
        "rawSourcePath": candidate.get("rawSourcePath"),
        "rawQueryIndex": candidate.get("rawQueryIndex"),
        "rawPageIndex": candidate.get("rawPageIndex"),
        "rawResultIndex": candidate.get("rawResultIndex"),
        "queryGroup": candidate.get("queryGroup"),
        "queryTerm": candidate.get("queryTerm"),
    }


def _raw_location_from_extracted(
    extracted_record: dict[str, Any],
    *,
    raw_source_path: str,
) -> dict[str, Any]:
    provenance = extracted_record.get("provenance")
    if not isinstance(provenance, dict):
        provenance = {}
    return {
        "rawSourcePath": raw_source_path,
        "rawQueryIndex": provenance.get("rawQueryIndex"),
        "rawPageIndex": provenance.get("rawPageIndex"),
        "rawResultIndex": provenance.get("rawResultIndex"),
    }


def _raw_location_from_candidate(candidate: dict[str, Any]) -> dict[str, Any]:
    return {
        "rawSourcePath": candidate.get("rawSourcePath"),
        "rawQueryIndex": candidate.get("rawQueryIndex"),
        "rawPageIndex": candidate.get("rawPageIndex"),
        "rawResultIndex": candidate.get("rawResultIndex"),
    }


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
