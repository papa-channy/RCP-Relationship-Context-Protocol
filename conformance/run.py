#!/usr/bin/env python3
"""Minimal RCP Core v0.1 conformance runner.

This runner intentionally tests protocol-visible behavior and schema contracts,
not implementation internals. It is an experimental bootstrap for M1.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
CONF = ROOT / "conformance"
SCHEMAS = ROOT / "spec" / "schemas"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def parse_time(value: str) -> datetime:
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def schema_checks() -> list[str]:
    failures: list[str] = []
    manifest = load_json(CONF / "fixtures" / "manifest.json")

    for case in manifest["cases"]:
        schema = load_json(SCHEMAS / case["schema"])
        instance = load_json(CONF / "fixtures" / case["fixture"])
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        errors = sorted(validator.iter_errors(instance), key=lambda e: list(e.path))
        is_valid = not errors

        if is_valid != case["valid"]:
            detail = "; ".join(error.message for error in errors[:3]) or "unexpectedly valid"
            failures.append(f"schema:{case['id']}: {detail}")

    return failures


def can_execute(case: dict) -> bool:
    """Evaluate only the executable-state invariants that Core v0.1 fixes.

    This is not a full permission engine. It deliberately demonstrates that
    provider capability cannot substitute for a permission decision and that
    deny/unknown/conditional/expired decisions fail closed.
    """

    capability = case.get("required_capability_state")
    if capability in {"deny", "limited", "unknown"}:
        return False

    decision = case.get("permission_decision")
    if not decision:
        return False

    if decision.get("decision") != "allow":
        return False

    expires_at = decision.get("expires_at")
    if not expires_at:
        return False

    as_of = parse_time(case["as_of"])
    if parse_time(expires_at) <= as_of:
        return False

    return True


def behavior_checks() -> list[str]:
    failures: list[str] = []
    payload = load_json(CONF / "behavior-cases.json")

    for case in payload["cases"]:
        actual = can_execute(case)
        if actual != case["expected_executable"]:
            failures.append(
                f"behavior:{case['id']}: expected executable={case['expected_executable']}, got {actual}"
            )

    return failures


def main() -> int:
    failures = schema_checks() + behavior_checks()
    if failures:
        print("RCP conformance bootstrap: FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("RCP conformance bootstrap: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
