"""Publish pipeline weekly digest output into static website data."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date
import json
import os
from pathlib import Path
import re
import tempfile
from typing import Any


@dataclass(frozen=True)
class PublishResult:
    digest_source_path: Path
    digest_destination_path: Path
    adapter_path: Path
    week_end: str
    digest_file_count: int
    wrote_digest: bool
    updated_adapter: bool


def publish_weekly_digest(
    *,
    run_directory: str | Path,
    web_root: str | Path = Path("web"),
    overwrite: bool = False,
) -> PublishResult:
    """Copy a run's weekly_digest.json into web/data/digests and register it."""
    run_directory = Path(run_directory)
    web_root = Path(web_root)
    source_path = run_directory / "weekly_digest.json"
    digest = _read_digest(source_path)
    week_end = _validated_week_end(digest)

    digest_dir = web_root / "data" / "digests"
    adapter_path = web_root / "data" / "digest-adapter.ts"
    destination_path = digest_dir / f"{week_end}.json"

    digest_bytes = source_path.read_bytes()
    wrote_digest = _write_digest_copy(
        destination_path,
        digest_bytes,
        overwrite=overwrite,
    )
    updated_adapter = update_digest_adapter(adapter_path=adapter_path, digest_dir=digest_dir)

    return PublishResult(
        digest_source_path=source_path,
        digest_destination_path=destination_path,
        adapter_path=adapter_path,
        week_end=week_end,
        digest_file_count=len(_list_digest_files(digest_dir)),
        wrote_digest=wrote_digest,
        updated_adapter=updated_adapter,
    )


def update_digest_adapter(*, adapter_path: str | Path, digest_dir: str | Path) -> bool:
    """Rewrite digest imports and registration from the JSON files on disk."""
    adapter_path = Path(adapter_path)
    digest_files = _list_digest_files(digest_dir)
    if not digest_files:
        raise ValueError("website publishing requires at least one digest JSON file")

    source = adapter_path.read_text(encoding="utf-8")
    updated_source = update_digest_adapter_source(source, digest_files)
    if updated_source == source:
        return False

    _atomic_write_text(adapter_path, updated_source)
    return True


def update_digest_adapter_source(source: str, digest_files: list[str]) -> str:
    """Return adapter source with deterministic digest imports and registration."""
    ordered_files = sorted(digest_files, reverse=True)
    imports = [
        f'import {_variable_name(file_name)} from "./digests/{file_name}";'
        for file_name in ordered_files
    ]
    registrations = [
        f"  {_variable_name(file_name)},"
        for file_name in ordered_files
    ]

    without_digest_imports = re.sub(
        r'^import\s+[A-Za-z_$][\w$]*\s+from\s+"\.\/digests\/\d{4}-\d{2}-\d{2}\.json";\r?\n',
        "",
        source,
        flags=re.MULTILINE,
    ).lstrip("\r\n")

    array_pattern = re.compile(
        r"const\s+digestJsonFiles\s*=\s*\[[\s\S]*?\];",
        flags=re.MULTILINE,
    )
    replacement = "\n".join([
        "const digestJsonFiles = [",
        *registrations,
        "];",
    ])
    without_registration, replacements = array_pattern.subn(
        replacement,
        without_digest_imports,
        count=1,
    )
    if replacements != 1:
        raise ValueError("digest adapter registration array not found")

    separator = "\n\n" if without_registration.startswith("import ") else "\n\n\n"
    return "\n".join(imports) + separator + without_registration


def _read_digest(source_path: Path) -> dict[str, Any]:
    try:
        with source_path.open("r", encoding="utf-8") as file:
            value = json.load(file)
    except FileNotFoundError:
        raise ValueError(f"{source_path}: weekly_digest.json not found") from None
    except json.JSONDecodeError:
        raise ValueError(f"{source_path}: malformed weekly digest JSON") from None

    if not isinstance(value, dict):
        raise ValueError(f"{source_path}: weekly digest must be an object")
    return value


def _validated_week_end(digest: dict[str, Any]) -> str:
    week_end = digest.get("weekEnd")
    if not isinstance(week_end, str):
        raise ValueError("weekly digest requires weekEnd")
    try:
        date.fromisoformat(week_end)
    except ValueError:
        raise ValueError("weekly digest requires valid weekEnd") from None
    return week_end


def _write_digest_copy(destination_path: Path, content: bytes, *, overwrite: bool) -> bool:
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    if destination_path.exists():
        if destination_path.read_bytes() == content:
            return False
        if not overwrite:
            raise FileExistsError(
                f"{destination_path} already exists; pass overwrite=True to replace it"
            )

    _atomic_write_bytes(destination_path, content)
    return True


def _list_digest_files(digest_dir: str | Path) -> list[str]:
    return sorted(
        path.name
        for path in Path(digest_dir).iterdir()
        if path.is_file() and path.suffix == ".json"
    )


def _variable_name(file_name: str) -> str:
    match = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})\.json", file_name)
    if not match:
        raise ValueError(f"{file_name}: digest filename must be YYYY-MM-DD.json")
    return f"digest{match.group(1)}{match.group(2)}{match.group(3)}Json"


def _atomic_write_text(path: Path, content: str) -> None:
    _atomic_write_bytes(path, content.encode("utf-8"))


def _atomic_write_bytes(path: Path, content: bytes) -> None:
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            "wb",
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
            delete=False,
        ) as temp_file:
            temp_path = Path(temp_file.name)
            temp_file.write(content)
            temp_file.flush()
            os.fsync(temp_file.fileno())
        os.replace(temp_path, path)
    except Exception:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
        raise


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Publish pipeline weekly_digest.json into static website data."
    )
    parser.add_argument(
        "run_directory",
        help="Pipeline run directory containing weekly_digest.json.",
    )
    parser.add_argument(
        "--web-root",
        default="web",
        help="Website root directory. Defaults to web.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace an existing digest file for the same weekEnd.",
    )
    args = parser.parse_args()

    result = publish_weekly_digest(
        run_directory=args.run_directory,
        web_root=args.web_root,
        overwrite=args.overwrite,
    )
    print(f"Published {result.digest_destination_path}")
    if result.updated_adapter:
        print(f"Updated {result.adapter_path}")
    else:
        print(f"{result.adapter_path} already up to date")


if __name__ == "__main__":
    main()
