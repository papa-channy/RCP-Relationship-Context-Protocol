#!/usr/bin/env python3
"""RCP v0.2 reference adapter for external-harness self-test ONLY.

This file deliberately reuses the project author's semantic oracle so CI can
verify the black-box harness plumbing. It is NOT an independent implementation,
MUST NOT be counted as clean-room interoperability evidence, and external
clean-room implementations MUST NOT import, copy, or translate its logic.
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[3]
RUN_WIRE_PATH = ROOT / "conformance" / "v0_2" / "run_wire.py"
SCHEMA_PATH = ROOT / "spec" / "schemas" / "v0.2-draft" / "context-assertion.schema.json"
CONTRACT_VERSION = "rcp-v0.2-cleanroom-1"


def load_reference_oracle():
    spec = importlib.util.spec_from_file_location("rcp_v02_reference_wire", RUN_WIRE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load reference semantic oracle")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def actor_key(actor: dict[str, Any]) -> list[str]:
    return [actor["scope"], actor["actor_id"], actor["actor_type"]]


def semantic_digest(assertion: dict[str, Any]) -> dict[str, Any]:
    scope = assertion["relationship_scope"]
    provenance = assertion["provenance"]
    evidence = provenance.get("evidence", [])
    derivation = provenance.get("derivation") or {}
    dependencies = derivation.get("dependencies", [])

    support_sets = [sorted(support_set) for support_set in derivation.get("support_sets", [])]
    support_sets.sort(key=lambda item: json.dumps(item, ensure_ascii=False, separators=(",", ":")))

    return {
        "assertion_id": assertion["assertion_id"],
        "assertion_type": assertion["assertion_type"],
        "epistemic_class": assertion["epistemic_class"],
        "scope_type": scope["scope_type"],
        "target_participants": sorted(actor_key(actor) for actor in scope["participants"]),
        "evidence_refs": sorted(item["evidence_ref"] for item in evidence),
        "material_dependency_refs": sorted(
            item["dependency_ref"] for item in dependencies if item["material"]
        ),
        "support_sets": support_sets,
        "policy_refs": sorted(assertion.get("policy_refs", [])),
        "lifecycle_state": assertion["lifecycle"]["state"],
        "required_extensions": sorted(assertion.get("required_extensions", [])),
    }


def reject(errors: list[str]) -> dict[str, Any]:
    return {
        "contract_version": CONTRACT_VERSION,
        "accepted": False,
        "errors": errors,
        "semantic_digest": None,
    }


def main() -> int:
    try:
        request = json.load(sys.stdin)
    except Exception as exc:
        json.dump(reject([f"invalid harness request: {exc}"]), sys.stdout)
        return 0

    if request.get("contract_version") != CONTRACT_VERSION:
        json.dump(reject(["unsupported harness contract_version"]), sys.stdout)
        return 0
    if request.get("operation") != "evaluate_context_assertion":
        json.dump(reject(["unsupported harness operation"]), sys.stdout)
        return 0

    assertion = request.get("assertion")
    if not isinstance(assertion, dict):
        json.dump(reject(["assertion must be an object"]), sys.stdout)
        return 0

    schema = load_json(SCHEMA_PATH)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    schema_errors = sorted(validator.iter_errors(assertion), key=lambda error: list(error.path))
    if schema_errors:
        json.dump(
            reject([f"schema: {error.message}" for error in schema_errors[:8]]),
            sys.stdout,
            ensure_ascii=False,
        )
        return 0

    oracle = load_reference_oracle()
    supported_extensions = set(request.get("supported_extensions", []))
    semantic_errors = oracle.semantic_errors(assertion, supported_extensions)
    if semantic_errors:
        json.dump(reject(list(semantic_errors)), sys.stdout, ensure_ascii=False)
        return 0

    response = {
        "contract_version": CONTRACT_VERSION,
        "accepted": True,
        "errors": [],
        "semantic_digest": semantic_digest(assertion),
    }
    json.dump(response, sys.stdout, ensure_ascii=False, separators=(",", ":"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
