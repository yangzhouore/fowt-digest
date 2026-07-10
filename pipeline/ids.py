"""Deterministic identifier helpers for the collector pipeline."""

from __future__ import annotations

import hashlib
import re
from datetime import UTC, datetime
from string import punctuation

_HASH_LENGTH = 16
_DOI_PREFIXES = ("https://doi.org/", "http://dx.doi.org/", "doi:")
_GREEK_EQUIVALENTS = {
    "\u03b1": "alpha",
    "\u03b2": "beta",
    "\u03b3": "gamma",
    "\u03b4": "delta",
}


def make_run_id(started_at: datetime | None = None) -> str:
    """Create a run ID using UTC run start time, as required by the contract."""
    timestamp = started_at or datetime.now(UTC)
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=UTC)
    timestamp = timestamp.astimezone(UTC)
    return f"run_{timestamp:%Y%m%d_%H%M%S}_openalex"


def make_candidate_id(
    *,
    openalex_id: str | None = None,
    source_url: str | None = None,
    title: str | None = None,
    published_date: str | None = None,
) -> str:
    """Create a deterministic OpenAlex candidate ID from the contract fallback order."""
    if openalex_id and openalex_id.strip():
        value = openalex_id.strip()
    elif source_url and source_url.strip():
        value = source_url.strip()
    elif title and title.strip() and published_date and published_date.strip():
        value = f"{title.strip().lower()}|{published_date.strip()}"
    else:
        raise ValueError(
            "candidate ID requires openalex_id, source_url, or title plus published_date"
        )

    return f"candidate_openalex_{_short_hash(value)}"


def make_paper_id(
    *,
    doi: str | None = None,
    openalex_id: str | None = None,
    title: str | None = None,
    published_date: str | None = None,
) -> str:
    """Create a deterministic deduplicated paper ID from DOI, source ID, or title/date."""
    normalised_doi = normalise_doi(doi)
    if normalised_doi:
        return f"paper_doi_{_short_hash(normalised_doi)}"

    if openalex_id and openalex_id.strip():
        return f"paper_openalex_{_short_hash(openalex_id.strip())}"

    normalised_title = normalise_title(title)
    if normalised_title and published_date and published_date.strip():
        return f"paper_title_{_short_hash(f'{normalised_title}|{published_date.strip()}')}"

    raise ValueError("paper ID requires DOI, OpenAlex ID, or title plus published_date")


def normalise_doi(doi: str | None) -> str | None:
    """Normalise DOI strings for stable ID generation and exact matching."""
    if not doi:
        return None

    value = doi.strip().lower()
    for prefix in _DOI_PREFIXES:
        if value.startswith(prefix):
            value = value[len(prefix) :]
            break

    value = value.strip().strip(punctuation)
    return value or None


def normalise_title(title: str | None) -> str | None:
    """Normalise titles according to the conservative collector contract."""
    if not title:
        return None

    value = title.strip().lower()
    for symbol, replacement in _GREEK_EQUIVALENTS.items():
        value = value.replace(symbol, replacement)

    value = value.translate(str.maketrans("", "", punctuation))
    value = re.sub(r"\s+", " ", value).strip()
    return value or None


def _short_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:_HASH_LENGTH]