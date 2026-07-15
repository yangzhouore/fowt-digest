import json

import pytest

from pipeline.run_storage import (
    SUPPORTED_RUN_FILENAMES,
    create_run_directory,
    run_file_path,
    write_run_json,
)


def test_create_run_directory_uses_contract_layout_under_configured_root(tmp_path):
    runs_root = tmp_path / "pipeline" / "data" / "runs"

    run_directory = create_run_directory("run_20260809_091500_openalex", runs_root=runs_root)

    assert run_directory == runs_root / "run_20260809_091500_openalex"
    assert run_directory.is_dir()


def test_create_run_directory_does_not_overwrite_existing_run(tmp_path):
    runs_root = tmp_path / "runs"
    create_run_directory("run_20260809_091500_openalex", runs_root=runs_root)

    with pytest.raises(FileExistsError):
        create_run_directory("run_20260809_091500_openalex", runs_root=runs_root)


def test_supported_filename_paths_stay_inside_run_directory(tmp_path):
    run_directory = create_run_directory("run_20260809_091500_openalex", runs_root=tmp_path)

    for filename in SUPPORTED_RUN_FILENAMES:
        assert run_file_path(run_directory, filename) == run_directory / filename


def test_write_run_json_round_trips_pretty_deterministic_utf8_json(tmp_path):
    run_directory = create_run_directory("run_20260809_091500_openalex", runs_root=tmp_path)
    alpha = "\u03b1"
    payload = {"zeta": 2, "alpha": {"message": f"floating wind {alpha}"}}

    output_path = write_run_json(run_directory, "run_summary.json", payload)
    output_text = output_path.read_text(encoding="utf-8")

    assert json.loads(output_text) == payload
    assert alpha in output_text
    assert output_text == (
        f'{{\n'
        f'  "alpha": {{\n'
        f'    "message": "floating wind {alpha}"\n'
        f'  }},\n'
        f'  "zeta": 2\n'
        f'}}\n'
    )


def test_write_run_json_supports_every_contract_filename(tmp_path):
    run_directory = create_run_directory("run_20260809_091500_openalex", runs_root=tmp_path)

    for filename in SUPPORTED_RUN_FILENAMES:
        output_path = write_run_json(run_directory, filename, {"filename": filename})
        assert json.loads(output_path.read_text(encoding="utf-8")) == {"filename": filename}


def test_write_run_json_overwrites_existing_file(tmp_path):
    run_directory = create_run_directory("run_20260809_091500_openalex", runs_root=tmp_path)

    output_path = write_run_json(run_directory, "candidates.json", {"version": 1})
    write_run_json(run_directory, "candidates.json", {"version": 2})

    assert json.loads(output_path.read_text(encoding="utf-8")) == {"version": 2}


def test_write_run_json_leaves_no_temporary_file_after_success(tmp_path):
    run_directory = create_run_directory("run_20260809_091500_openalex", runs_root=tmp_path)

    write_run_json(run_directory, "normalised.json", {"ok": True})

    assert list(run_directory.glob("*.tmp")) == []
    assert list(run_directory.glob(".*.tmp")) == []


def test_invalid_run_filename_is_rejected(tmp_path):
    run_directory = create_run_directory("run_20260809_091500_openalex", runs_root=tmp_path)

    with pytest.raises(ValueError, match="unsupported run output filename"):
        run_file_path(run_directory, "other.json")

    with pytest.raises(ValueError, match="unsupported run output filename"):
        write_run_json(run_directory, "other.json", {})
