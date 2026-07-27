"""Coordinate the deterministic digest publication workflow."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import os
from pathlib import Path
import subprocess
import sys
from typing import Callable, Sequence

from pipeline.website_publisher import PublishResult, publish_weekly_digest


CommandRunner = Callable[..., subprocess.CompletedProcess]
Publisher = Callable[..., PublishResult]


@dataclass(frozen=True)
class ValidationStep:
    name: str
    command: tuple[str, ...]
    cwd: Path


@dataclass(frozen=True)
class ValidationResult:
    name: str
    command: tuple[str, ...]
    cwd: Path
    returncode: int


@dataclass(frozen=True)
class PublicationWorkflowResult:
    publish_result: PublishResult
    validation_results: tuple[ValidationResult, ...]

    @property
    def succeeded(self) -> bool:
        return all(result.returncode == 0 for result in self.validation_results)


def run_publication_workflow(
    *,
    run_directory: str | Path,
    repo_root: str | Path = Path("."),
    overwrite: bool = False,
    publisher: Publisher = publish_weekly_digest,
    runner: CommandRunner = subprocess.run,
) -> PublicationWorkflowResult:
    """Publish an existing digest run, then run repository validation."""
    repo_root = Path(repo_root)
    publish_result = publisher(
        run_directory=Path(run_directory),
        web_root=repo_root / "web",
        overwrite=overwrite,
    )

    results: list[ValidationResult] = []
    for step in validation_steps(repo_root):
        completed = runner(
            list(step.command),
            cwd=step.cwd,
            check=False,
        )
        result = ValidationResult(
            name=step.name,
            command=step.command,
            cwd=step.cwd,
            returncode=completed.returncode,
        )
        results.append(result)
        if result.returncode != 0:
            break

    return PublicationWorkflowResult(
        publish_result=publish_result,
        validation_results=tuple(results),
    )


def validation_steps(repo_root: str | Path) -> tuple[ValidationStep, ...]:
    """Return the accepted M5 validation steps in execution order."""
    repo_root = Path(repo_root)
    web_root = repo_root / "web"
    npm = _npm_command()

    return (
        ValidationStep(
            name="pipeline tests",
            command=(sys.executable, "-m", "pytest", "pipeline/tests"),
            cwd=repo_root,
        ),
        ValidationStep(
            name="website data validation",
            command=(npm, "run", "validate:data"),
            cwd=web_root,
        ),
        ValidationStep(
            name="website data tests",
            command=(npm, "run", "test:data"),
            cwd=web_root,
        ),
        ValidationStep(
            name="website lint",
            command=(npm, "run", "lint"),
            cwd=web_root,
        ),
        ValidationStep(
            name="website build",
            command=(npm, "run", "build"),
            cwd=web_root,
        ),
        ValidationStep(
            name="repository diff check",
            command=("git", "diff", "--check"),
            cwd=repo_root,
        ),
    )


def print_summary(result: PublicationWorkflowResult) -> None:
    """Print a concise deterministic publication workflow summary."""
    publish_result = result.publish_result
    print("Publication workflow summary")
    print(f"- digest: {publish_result.digest_destination_path}")
    print(f"- weekEnd: {publish_result.week_end}")
    print(f"- digest written: {_yes_no(publish_result.wrote_digest)}")
    print(f"- adapter updated: {_yes_no(publish_result.updated_adapter)}")

    for validation in result.validation_results:
        status = "passed" if validation.returncode == 0 else "failed"
        print(f"- {validation.name}: {status}")

    print(f"- result: {'passed' if result.succeeded else 'failed'}")


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Publish an existing pipeline digest and run repository validation."
    )
    parser.add_argument(
        "run_directory",
        help="Pipeline run directory containing weekly_digest.json.",
    )
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Repository root. Defaults to the current directory.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Allow replacing an existing website digest for the same weekEnd.",
    )
    args = parser.parse_args(argv)

    try:
        result = run_publication_workflow(
            run_directory=args.run_directory,
            repo_root=args.repo_root,
            overwrite=args.overwrite,
        )
    except Exception as exc:
        print(f"Publication workflow failed before validation: {exc}", file=sys.stderr)
        return 1

    print_summary(result)
    return 0 if result.succeeded else 1


def _npm_command() -> str:
    return "npm.cmd" if os.name == "nt" else "npm"


def _yes_no(value: bool) -> str:
    return "yes" if value else "no"


if __name__ == "__main__":
    raise SystemExit(main())
