from __future__ import annotations

from pathlib import Path
import subprocess

from pipeline.website_publisher import PublishResult
from tools.publication_workflow import (
    print_summary,
    run_publication_workflow,
    validation_steps,
)


def test_workflow_publishes_then_runs_validation_steps_in_order(tmp_path):
    calls = []

    def publisher(**kwargs):
        calls.append(("publish", kwargs["run_directory"], kwargs["web_root"], kwargs["overwrite"]))
        return _publish_result(tmp_path)

    def runner(command, *, cwd, check):
        calls.append(("run", tuple(command), cwd, check))
        return subprocess.CompletedProcess(command, 0)

    result = run_publication_workflow(
        run_directory=tmp_path / "runs" / "run_20260727_090000_openalex",
        repo_root=tmp_path,
        overwrite=True,
        publisher=publisher,
        runner=runner,
    )

    assert calls[0] == (
        "publish",
        tmp_path / "runs" / "run_20260727_090000_openalex",
        tmp_path / "web",
        True,
    )
    assert [call[1] for call in calls[1:]] == [
        step.command for step in validation_steps(tmp_path)
    ]
    assert [validation.name for validation in result.validation_results] == [
        step.name for step in validation_steps(tmp_path)
    ]
    assert result.succeeded is True


def test_workflow_stops_on_first_failed_validation_step(tmp_path):
    commands = []

    def runner(command, *, cwd, check):
        commands.append(tuple(command))
        returncode = 1 if len(commands) == 2 else 0
        return subprocess.CompletedProcess(command, returncode)

    result = run_publication_workflow(
        run_directory=tmp_path / "run",
        repo_root=tmp_path,
        publisher=lambda **kwargs: _publish_result(tmp_path),
        runner=runner,
    )

    assert commands == [step.command for step in validation_steps(tmp_path)[:2]]
    assert [validation.returncode for validation in result.validation_results] == [0, 1]
    assert result.succeeded is False


def test_validation_steps_use_repo_root_and_web_root(tmp_path):
    steps = validation_steps(tmp_path)

    assert [step.name for step in steps] == [
        "pipeline tests",
        "website data validation",
        "website data tests",
        "website lint",
        "website build",
        "repository diff check",
    ]
    assert steps[0].cwd == tmp_path
    assert steps[0].command[-3:] == ("-m", "pytest", "pipeline/tests")
    assert steps[1].cwd == tmp_path / "web"
    assert steps[4].cwd == tmp_path / "web"
    assert steps[5].cwd == tmp_path
    assert steps[5].command == ("git", "diff", "--check")


def test_summary_reports_publish_and_validation_results(tmp_path, capsys):
    result = run_publication_workflow(
        run_directory=tmp_path / "run",
        repo_root=tmp_path,
        publisher=lambda **kwargs: _publish_result(tmp_path),
        runner=lambda command, *, cwd, check: subprocess.CompletedProcess(command, 0),
    )

    print_summary(result)

    output = capsys.readouterr().out
    assert "Publication workflow summary" in output
    assert "- weekEnd: 2026-07-26" in output
    assert "- digest written: yes" in output
    assert "- adapter updated: no" in output
    assert "- pipeline tests: passed" in output
    assert "- repository diff check: passed" in output
    assert "- result: passed" in output


def _publish_result(tmp_path: Path) -> PublishResult:
    return PublishResult(
        digest_source_path=tmp_path / "run" / "weekly_digest.json",
        digest_destination_path=tmp_path / "web" / "data" / "digests" / "2026-07-26.json",
        adapter_path=tmp_path / "web" / "data" / "digest-adapter.ts",
        week_end="2026-07-26",
        digest_file_count=16,
        wrote_digest=True,
        updated_adapter=False,
    )
