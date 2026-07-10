from datetime import UTC, datetime

import pytest

from pipeline.ids import (
    make_candidate_id,
    make_paper_id,
    make_run_id,
    normalise_doi,
    normalise_title,
)


def test_run_id_uses_utc_contract_format():
    run_id = make_run_id(datetime(2026, 8, 9, 9, 15, 0, tzinfo=UTC))

    assert run_id == "run_20260809_091500_openalex"


def test_doi_based_paper_ids_are_stable_for_equivalent_inputs():
    first = make_paper_id(doi="https://doi.org/10.1234/FOWT.TEST.")
    second = make_paper_id(doi=" 10.1234/fowt.test ")

    assert first == second
    assert first.startswith("paper_doi_")


def test_missing_doi_falls_back_to_openalex_id():
    first = make_paper_id(doi=None, openalex_id="https://openalex.org/W123")
    second = make_paper_id(openalex_id="https://openalex.org/W123")

    assert first == second
    assert first.startswith("paper_openalex_")


def test_missing_doi_and_source_id_falls_back_to_normalised_title_and_date():
    first = make_paper_id(title=" Floating   Wind: Control! ", published_date="2026-08-09")
    second = make_paper_id(title="floating wind control", published_date="2026-08-09")

    assert first == second
    assert first.startswith("paper_title_")


def test_title_fallback_changes_when_publication_date_changes():
    first = make_paper_id(title="Floating Wind Control", published_date="2026-08-09")
    second = make_paper_id(title="Floating Wind Control", published_date="2026-08-10")

    assert first != second


def test_candidate_id_prefers_openalex_id_and_is_stable():
    first = make_candidate_id(
        openalex_id="https://openalex.org/W123",
        source_url="https://example.test/other",
        title="Other title",
        published_date="2026-08-09",
    )
    second = make_candidate_id(openalex_id="https://openalex.org/W123")

    assert first == second
    assert first.startswith("candidate_openalex_")


def test_candidate_id_fallbacks_remain_unique_for_different_source_urls():
    first = make_candidate_id(source_url="https://example.test/a")
    second = make_candidate_id(source_url="https://example.test/b")

    assert first != second


def test_id_helpers_reject_insufficient_inputs():
    with pytest.raises(ValueError):
        make_candidate_id(title="Only title")

    with pytest.raises(ValueError):
        make_paper_id(title="Only title")


def test_normalisation_helpers_match_contract():
    assert normalise_doi("https://doi.org/10.1234/ABC.") == "10.1234/abc"
    assert normalise_title("  Floating   Wind: \u03b1 Control! ") == "floating wind alpha control"