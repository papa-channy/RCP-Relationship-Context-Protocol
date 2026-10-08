#!/usr/bin/env python3
"""Validate and canonically normalize one RCP v0.2 draft ContextAssertion."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

from run_wire import SCHEMA_PATH, load_json, normalize_assertion, semantic_errors


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: normalize_wire.py <context-assertion.json>", file=sys.stderr)
        return 2

    input_path = Path(sys.argv[1])
    instance = load_json(input_path)
    schema = load_json(SCHEMA_PATH)

    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    schema_errors = sorted(validator.iter_errors(instance), key=lambda error: list(error.path))
    if schema_errors:
        for error in schema_errors:
            print(f"schema: {error.message}", file=sys.stderr)
        return 1

    supported_extensions = {
        value.strip()
        for value in os.environ.get("RCP_SUPPORTED_EXTENSIONS", "").split(",")
        if value.strip()
    }
    semantic = semantic_errors(instance, supported_extensions)
    if semantic:
        for error in semantic:
            print(f"semantic: {error}", file=sys.stderr)
        return 1

    normalized = normalize_assertion(instance)
    print(json.dumps(normalized, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
