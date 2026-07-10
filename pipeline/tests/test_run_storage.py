import json

import pytest

from pipeline.run_storage import RUN_FILE_NAMES, create_run_directory, write_run_json


def test_create_run_directory_uses_expected_path(tmp_path):
    run_dir = create_run_directory("run_20260809_091500_openalex", base_dir=tmp_path)

    assert run_dir == tmp_path / "run_20260809_091500_openalex"
    assert run_dir.is_dir()


def test_create_run_directory_does_not_overwrite_existing_run(tmp_path):
    create_run_directory("run_20260809_091500_openalex", base_dir=tmp_path)

    with pytest.raises(FileExistsError):
        create_run_directory("run_20260809_091500_openalex", base_dir=tmp_path)


def test_write_run_json_writes_expected_filename_and_readable_json(tmp_path):
    run_dir = create_run_directory("run_20260809_091500_openalex", base_dir=tmp_path)
    output_path = write_run_json(run_dir, "run_summary", {"status": "success", "count": 1})

    assert output_path == run_dir / RUN_FILE_NAMES["run_summary"]
    assert json.loads(output_path.read_text(encoding="utf-8")) == {
        "count": 1,
        "status": "success",
    }
    assert output_path.read_text(encoding="utf-8").endswith("\n")


def test_write_run_json_preserves_unicode_content(tmp_path):
    run_dir = create_run_directory("run_20260809_091500_openalex", base_dir=tmp_path)
    output_path = write_run_json(run_dir, "candidates", {"title": "Floating wind \u2013 \u03b1 test"})

    content = output_path.read_text(encoding="utf-8")
    assert "Floating wind \u2013 \u03b1 test" in content


def test_repeated_write_replaces_file_predictably(tmp_path):
    run_dir = create_run_directory("run_20260809_091500_openalex", base_dir=tmp_path)

    output_path = write_run_json(run_dir, "normalised", {"version": 1})
    second_path = write_run_json(run_dir, "normalised", {"version": 2})

    assert second_path == output_path
    assert json.loads(output_path.read_text(encoding="utf-8")) == {"version": 2}


def test_successful_write_leaves_no_temporary_file(tmp_path):
    run_dir = create_run_directory("run_20260809_091500_openalex", base_dir=tmp_path)
    write_run_json(run_dir, "deduplicated_papers", [{"paperId": "paper_test"}])

    assert not list(run_dir.glob("*.tmp"))
    assert not list(run_dir.glob(".*.tmp"))


def test_write_run_json_rejects_unknown_file_key(tmp_path):
    run_dir = create_run_directory("run_20260809_091500_openalex", base_dir=tmp_path)

    with pytest.raises(ValueError):
        write_run_json(run_dir, "future_file", {})