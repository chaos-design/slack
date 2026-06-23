#!/usr/bin/env python3
"""Generate and gate ai-doc-creator Markdown resource handoffs.

This module is intentionally small and dependency-free so agents can use it as
the deterministic part of the ai-doc-creator workflow before invoking creative
downstream skills.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
import json
import re
from pathlib import Path
from typing import Iterable


ALLOWED_SOURCE_TYPES = {"url", "file", "image", "text"}
ALLOWED_SKILLS = {"bilingual-reader", "content-slides"}
STATE_FILE = ".ai-doc-creator-state.json"
LOG_FILE = ".ai-doc-creator-events.jsonl"
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]+\]\([^)]+\)|https?://\S+", re.IGNORECASE)


class ResourceMarkdownError(ValueError):
    """Raised when a Markdown resource cannot be generated or validated."""


class HumanConfirmationRequired(ResourceMarkdownError):
    """Raised when a downstream action is blocked until human confirmation."""


@dataclass(frozen=True)
class MarkdownResourceRequest:
    """A single downstream skill's Markdown handoff request."""

    skill: str
    source: str
    source_type: str
    title: str
    body: str
    output_dir: Path
    slug: str | None = None
    generated_at: str | None = None
    overwrite: bool = False


def utc_timestamp() -> str:
    """Return an ISO timestamp suitable for state and event records."""

    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def markdown_timestamp() -> str:
    """Return the human-readable Markdown timestamp used by project resources."""

    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def slugify(value: str) -> str:
    """Create a stable Markdown filename slug from source title text."""

    slug = re.sub(r'[/\\:*?"<>|\s]+', "-", value.strip().lower())
    slug = re.sub(r"-{2,}", "-", slug).strip("-._")
    return (slug[:60].strip("-._") or "resource")


def state_path(output_dir: Path) -> Path:
    return output_dir / "artifacts" / STATE_FILE


def log_path(output_dir: Path) -> Path:
    return output_dir / "artifacts" / LOG_FILE


def resource_state_key(skill: str, slug: str) -> str:
    """Return the state key for one skill-specific Markdown handoff."""

    return f"{skill}:{slug}"


def read_state(output_dir: Path) -> dict[str, object]:
    """Load the state file, returning an empty state when it does not exist."""

    path = state_path(output_dir)
    if not path.exists():
        return {"resources": {}, "parallel": {"allowed": False, "tasks": []}}
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ResourceMarkdownError(f"State file is not valid JSON: {path}") from exc
    if not isinstance(state, dict):
        raise ResourceMarkdownError("State file root must be an object.")
    state.setdefault("resources", {})
    state.setdefault("parallel", {"allowed": False, "tasks": []})
    return state


def write_state(output_dir: Path, state: dict[str, object]) -> None:
    """Persist workflow state in a human-readable JSON file."""

    state_path(output_dir).parent.mkdir(parents=True, exist_ok=True)
    state_path(output_dir).write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def append_event(output_dir: Path, event: str, payload: dict[str, object]) -> None:
    """Append one JSONL event for auditability."""

    log_path(output_dir).parent.mkdir(parents=True, exist_ok=True)
    record = {"event": event, "at": utc_timestamp(), **payload}
    with log_path(output_dir).open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def validate_request(request: MarkdownResourceRequest) -> None:
    """Validate inputs before writing a Markdown resource."""

    if not request.skill.strip():
        raise ResourceMarkdownError("skill is required.")
    if request.skill not in ALLOWED_SKILLS:
        raise ResourceMarkdownError(f"skill must be one of: {', '.join(sorted(ALLOWED_SKILLS))}.")
    if request.source_type not in ALLOWED_SOURCE_TYPES:
        raise ResourceMarkdownError(f"source_type must be one of: {', '.join(sorted(ALLOWED_SOURCE_TYPES))}.")
    if not request.source.strip():
        raise ResourceMarkdownError("source is required.")
    if not request.title.strip():
        raise ResourceMarkdownError("title is required.")
    if not request.body.strip():
        raise ResourceMarkdownError("body is required; do not generate empty Markdown resources.")


def build_markdown(request: MarkdownResourceRequest) -> str:
    """Build a complete Markdown handoff for one downstream skill."""

    generated_at = request.generated_at or markdown_timestamp()
    body = request.body.replace("\r\n", "\n").replace("\r", "\n").strip()
    links = sorted(set(MARKDOWN_LINK_RE.findall(body)))
    lines = [
        f"# {request.title.strip()}",
        "",
        f"> Source: {request.source.strip()}",
        f"> Source type: {request.source_type}",
        f"> Skill: {request.skill.strip()}",
        f"> Generated: {generated_at}",
        "",
        body,
        "",
    ]
    if links:
        lines.extend(["## Links", ""])
        lines.extend(f"- {link}" for link in links)
        lines.append("")
    return "\n".join(lines)


def validate_markdown(markdown: str) -> None:
    """Check the Markdown handoff has the minimum contract downstream skills need."""

    if len(re.findall(r"^#\s+\S", markdown, flags=re.MULTILINE)) != 1:
        raise ResourceMarkdownError("Markdown must contain exactly one H1 title.")
    required_prefixes = ("> Source:", "> Source type:", "> Skill:", "> Generated:")
    for prefix in required_prefixes:
        if not any(line.startswith(prefix) for line in markdown.splitlines()):
            raise ResourceMarkdownError(f"Markdown is missing metadata line: {prefix}")
    content_lines = [
        line
        for line in markdown.splitlines()
        if line.strip()
        and not line.startswith("#")
        and not line.startswith(">")
        and line.strip() != "## Links"
        and not line.startswith("- ")
    ]
    if not content_lines:
        raise ResourceMarkdownError("Markdown body is empty.")


def generate_markdown_resource(request: MarkdownResourceRequest) -> Path:
    """Generate one skill-specific Markdown file and mark it pending review."""

    validate_request(request)
    output_dir = request.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    slug = request.slug or slugify(request.title)
    markdown_path = output_dir / f"{slug}.md"
    if markdown_path.exists() and not request.overwrite:
        raise ResourceMarkdownError(f"Markdown already exists: {markdown_path}")

    markdown = build_markdown(request)
    validate_markdown(markdown)
    markdown_path.write_text(markdown, encoding="utf-8")

    state = read_state(output_dir)
    resources = state.setdefault("resources", {})
    if not isinstance(resources, dict):
        raise ResourceMarkdownError("resources state must be an object.")
    resource_key = resource_state_key(request.skill, slug)
    resources[resource_key] = {
        "skill": request.skill,
        "slug": slug,
        "status": "generated",
        "markdownPath": str(markdown_path),
        "source": request.source,
        "sourceType": request.source_type,
        "generatedAt": utc_timestamp(),
        "confirmed": False,
    }
    state["parallel"] = {"allowed": False, "tasks": []}
    write_state(output_dir, state)
    append_event(
        output_dir,
        "markdown_generated",
        {"skill": request.skill, "slug": slug, "resourceKey": resource_key, "markdownPath": str(markdown_path)},
    )
    return markdown_path


def find_resource_entry(resources: dict[str, object], skill: str, slug: str | None = None) -> tuple[str, dict[str, object]]:
    """Find one generated Markdown resource by skill and optional slug."""

    if slug:
        key = resource_state_key(skill, slug)
        entry = resources.get(key)
        if isinstance(entry, dict):
            return key, entry
        raise ResourceMarkdownError(f"No generated Markdown resource found for skill and slug: {skill} / {slug}")

    direct_entry = resources.get(skill)
    if isinstance(direct_entry, dict):
        return skill, direct_entry

    matches = [
        (key, entry)
        for key, entry in resources.items()
        if isinstance(entry, dict) and entry.get("skill") == skill
    ]
    if not matches:
        raise ResourceMarkdownError(f"No generated Markdown resource found for skill: {skill}")
    if len(matches) > 1:
        slugs = ", ".join(str(entry.get("slug")) for _, entry in matches)
        raise ResourceMarkdownError(f"Multiple Markdown resources found for {skill}; pass --slug. Available slugs: {slugs}")
    return matches[0]


def confirm_markdown_resource(
    output_dir: Path,
    skill: str,
    reviewer: str,
    notes: str = "",
    slug: str | None = None,
) -> dict[str, object]:
    """Record human confirmation for one generated Markdown resource."""

    state = read_state(output_dir)
    resources = state.get("resources", {})
    if not isinstance(resources, dict):
        raise ResourceMarkdownError("resources state must be an object.")
    resource_key, entry = find_resource_entry(resources, skill, slug)
    markdown_path = Path(str(entry.get("markdownPath", "")))
    if not markdown_path.exists():
        raise ResourceMarkdownError(f"Markdown file is missing: {markdown_path}")
    validate_markdown(markdown_path.read_text(encoding="utf-8"))

    entry.update(
        {
            "status": "confirmed",
            "confirmed": True,
            "confirmedAt": utc_timestamp(),
            "confirmedBy": reviewer.strip() or "human",
            "confirmationNotes": notes,
        }
    )
    write_state(output_dir, state)
    append_event(
        output_dir,
        "markdown_confirmed",
        {"skill": skill, "slug": entry.get("slug"), "resourceKey": resource_key, "reviewer": entry["confirmedBy"]},
    )
    return entry


def start_parallel_generation(
    output_dir: Path,
    gate_skill: str,
    next_skills: Iterable[str],
    gate_slug: str | None = None,
) -> list[dict[str, str]]:
    """Allow downstream parallel generation only after the gate skill is confirmed."""

    if gate_skill not in ALLOWED_SKILLS:
        raise ResourceMarkdownError(f"gate_skill must be one of: {', '.join(sorted(ALLOWED_SKILLS))}.")
    state = read_state(output_dir)
    resources = state.get("resources", {})
    if not isinstance(resources, dict):
        raise ResourceMarkdownError("resources state must be an object.")
    _, gate = find_resource_entry(resources, gate_skill, gate_slug)
    if not isinstance(gate, dict) or gate.get("status") != "confirmed":
        raise HumanConfirmationRequired(
            f"Cannot start parallel generation until {gate_skill} Markdown is human-confirmed."
        )

    tasks = []
    for skill in next_skills:
        if not skill or skill == gate_skill:
            continue
        if skill not in ALLOWED_SKILLS:
            raise ResourceMarkdownError(f"next skill must be one of: {', '.join(sorted(ALLOWED_SKILLS))}.")
        tasks.append({"skill": skill, "status": "ready", "gateSkill": gate_skill})
    state["parallel"] = {
        "allowed": True,
        "gateSkill": gate_skill,
        "gateSlug": gate.get("slug"),
        "tasks": tasks,
        "startedAt": utc_timestamp(),
    }
    write_state(output_dir, state)
    append_event(
        output_dir,
        "parallel_generation_ready",
        {"gateSkill": gate_skill, "gateSlug": gate.get("slug"), "tasks": tasks},
    )
    return tasks


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage ai-doc-creator Markdown resource gates.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate = subparsers.add_parser("generate", help="Generate one skill Markdown resource.")
    generate.add_argument("--skill", required=True)
    generate.add_argument("--source", required=True)
    generate.add_argument("--source-type", required=True, choices=sorted(ALLOWED_SOURCE_TYPES))
    generate.add_argument("--title", required=True)
    generate.add_argument("--body-file", type=Path, required=True)
    generate.add_argument("--output-dir", type=Path, required=True)
    generate.add_argument("--slug")
    generate.add_argument("--overwrite", action="store_true")

    confirm = subparsers.add_parser("confirm", help="Record human confirmation.")
    confirm.add_argument("--skill", required=True)
    confirm.add_argument("--slug")
    confirm.add_argument("--reviewer", required=True)
    confirm.add_argument("--notes", default="")
    confirm.add_argument("--output-dir", type=Path, required=True)

    parallel = subparsers.add_parser("start-parallel", help="Open the parallel generation gate.")
    parallel.add_argument("--gate-skill", required=True)
    parallel.add_argument("--gate-slug")
    parallel.add_argument("--next-skill", action="append", required=True)
    parallel.add_argument("--output-dir", type=Path, required=True)

    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.command == "generate":
            body = args.body_file.read_text(encoding="utf-8")
            path = generate_markdown_resource(
                MarkdownResourceRequest(
                    skill=args.skill,
                    source=args.source,
                    source_type=args.source_type,
                    title=args.title,
                    body=body,
                    output_dir=args.output_dir,
                    slug=args.slug,
                    overwrite=args.overwrite,
                )
            )
            print(json.dumps({"status": "generated", "path": str(path)}, ensure_ascii=False))
        elif args.command == "confirm":
            entry = confirm_markdown_resource(args.output_dir, args.skill, args.reviewer, args.notes, args.slug)
            print(json.dumps({"status": "confirmed", "resource": entry}, ensure_ascii=False))
        elif args.command == "start-parallel":
            tasks = start_parallel_generation(args.output_dir, args.gate_skill, args.next_skill, args.gate_slug)
            print(json.dumps({"status": "ready", "tasks": tasks}, ensure_ascii=False))
    except Exception as exc:
        print(json.dumps({"status": "error", "message": str(exc)}, ensure_ascii=False))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
