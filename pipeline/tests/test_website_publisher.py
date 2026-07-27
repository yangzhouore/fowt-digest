from __future__ import annotations

import json

import pytest

from pipeline.website_publisher import (
    publish_weekly_digest,
    update_digest_adapter_source,
)


def test_publish_copies_weekly_digest_to_website_week_end_file(tmp_path):
    run_directory = tmp_path / "runs" / "run_20260727_090000_openalex"
    web_root = tmp_path / "web"
    _write_digest(run_directory / "weekly_digest.json", week_end="2026-07-26")
    _write_adapter(web_root / "data" / "digest-adapter.ts", ["2026-07-19.json"])
    _write_digest(web_root / "data" / "digests" / "2026-07-19.json", week_end="2026-07-19")

    result = publish_weekly_digest(run_directory=run_directory, web_root=web_root)

    destination = web_root / "data" / "digests" / "2026-07-26.json"
    assert result.digest_destination_path == destination
    assert result.week_end == "2026-07-26"
    assert result.digest_file_count == 2
    assert result.wrote_digest is True
    assert result.updated_adapter is True
    assert json.loads(destination.read_text(encoding="utf-8"))["weekEnd"] == "2026-07-26"


def test_publish_registers_digest_files_newest_first(tmp_path):
    run_directory = tmp_path / "runs" / "run_20260727_090000_openalex"
    web_root = tmp_path / "web"
    _write_digest(run_directory / "weekly_digest.json", week_end="2026-07-26")
    _write_digest(web_root / "data" / "digests" / "2026-01-18.json", week_end="2026-01-18")
    _write_digest(web_root / "data" / "digests" / "2026-07-19.json", week_end="2026-07-19")
    _write_adapter(web_root / "data" / "digest-adapter.ts", ["2026-07-19.json"])

    publish_weekly_digest(run_directory=run_directory, web_root=web_root)

    adapter = (web_root / "data" / "digest-adapter.ts").read_text(encoding="utf-8")
    assert adapter.index("digest20260726Json") < adapter.index("digest20260719Json")
    assert adapter.index("digest20260719Json") < adapter.index("digest20260118Json")
    assert 'from "./digests/2026-07-26.json";' in adapter


def test_publish_does_not_overwrite_different_existing_digest_without_flag(tmp_path):
    run_directory = tmp_path / "runs" / "run_20260727_090000_openalex"
    web_root = tmp_path / "web"
    _write_digest(run_directory / "weekly_digest.json", week_end="2026-07-26")
    _write_digest(
        web_root / "data" / "digests" / "2026-07-26.json",
        week_end="2026-07-26",
        title="Existing digest",
    )
    _write_adapter(web_root / "data" / "digest-adapter.ts", ["2026-07-26.json"])

    with pytest.raises(FileExistsError, match="already exists"):
        publish_weekly_digest(run_directory=run_directory, web_root=web_root)


def test_publish_allows_idempotent_existing_digest(tmp_path):
    run_directory = tmp_path / "runs" / "run_20260727_090000_openalex"
    web_root = tmp_path / "web"
    digest = _digest(week_end="2026-07-26")
    _write_json(run_directory / "weekly_digest.json", digest)
    _write_json(web_root / "data" / "digests" / "2026-07-26.json", digest)
    _write_adapter(web_root / "data" / "digest-adapter.ts", ["2026-07-26.json"])

    result = publish_weekly_digest(run_directory=run_directory, web_root=web_root)

    assert result.wrote_digest is False
    assert result.updated_adapter is False


def test_publish_overwrite_replaces_existing_digest(tmp_path):
    run_directory = tmp_path / "runs" / "run_20260727_090000_openalex"
    web_root = tmp_path / "web"
    _write_digest(run_directory / "weekly_digest.json", week_end="2026-07-26")
    _write_digest(
        web_root / "data" / "digests" / "2026-07-26.json",
        week_end="2026-07-26",
        title="Existing digest",
    )
    _write_adapter(web_root / "data" / "digest-adapter.ts", ["2026-07-26.json"])

    result = publish_weekly_digest(run_directory=run_directory, web_root=web_root, overwrite=True)

    assert result.wrote_digest is True
    destination = web_root / "data" / "digests" / "2026-07-26.json"
    assert json.loads(destination.read_text(encoding="utf-8"))["selectedPapers"][0]["title"] == (
        "Published digest"
    )


def test_publish_rejects_missing_or_invalid_weekly_digest(tmp_path):
    with pytest.raises(ValueError, match="weekly_digest.json not found"):
        publish_weekly_digest(run_directory=tmp_path / "missing", web_root=tmp_path / "web")

    run_directory = tmp_path / "run"
    _write_json(run_directory / "weekly_digest.json", {"weekEnd": "not-a-date"})
    _write_adapter(tmp_path / "web" / "data" / "digest-adapter.ts", ["2026-07-26.json"])
    _write_digest(tmp_path / "web" / "data" / "digests" / "2026-07-26.json", week_end="2026-07-26")

    with pytest.raises(ValueError, match="valid weekEnd"):
        publish_weekly_digest(run_directory=run_directory, web_root=tmp_path / "web")


def test_update_digest_adapter_source_preserves_non_digest_source():
    source = "\n".join([
        'import digest20260719Json from "./digests/2026-07-19.json";',
        'import otherValue from "../other";',
        "",
        "type Example = string;",
        "",
        "const digestJsonFiles = [",
        "  digest20260719Json,",
        "];",
        "",
    ])

    updated = update_digest_adapter_source(
        source,
        ["2026-07-26.json", "2026-07-19.json"],
    )

    assert updated.startswith(
        "\n".join([
            'import digest20260726Json from "./digests/2026-07-26.json";',
            'import digest20260719Json from "./digests/2026-07-19.json";',
            "",
            'import otherValue from "../other";',
        ])
    )
    assert "  digest20260726Json,\n  digest20260719Json," in updated


def _write_adapter(path, file_names):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(update_digest_adapter_source("const digestJsonFiles = [];\n", file_names))


def _write_digest(path, *, week_end, title="Published digest"):
    _write_json(path, _digest(week_end=week_end, title=title))


def _write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def _digest(*, week_end, title="Published digest"):
    return {
        "schemaVersion": "pipeline-data-0.1",
        "runId": "run_20260727_090000_openalex",
        "sourceName": "openalex",
        "weekStart": "2026-07-20",
        "weekEnd": week_end,
        "generatedAt": "2026-07-27T09:00:00Z",
        "selectedPapers": [
            {
                "paperId": "paper_doi_one",
                "title": title,
                "authors": ["Author"],
                "abstract": None,
                "publicationSource": "Journal",
                "publicationType": "journal",
                "publishedDate": "2026-07-25",
                "indexedDate": None,
                "doi": None,
                "sourceUrl": None,
                "openAccessStatus": None,
                "fullTextAvailability": "abstract_only",
                "topicTags": ["Floating offshore wind"],
                "rank": 1,
                "selected": True,
                "selectionReason": "selected_within_limit",
            }
        ],
    }
