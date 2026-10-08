#!/usr/bin/env python3
"""Validate the non-normative RCP v0.2 draft wire model.

This runner intentionally separates:

1. JSON Schema structure; and
2. relationship-specific cross-reference / fail-closed semantics.

It is not a transport, authorization, policy, provenance-ontology, or
cryptographic engine.
"""

from __future__ import annotations

import json
import sys
from copy import deepcopy
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "spec" / "schemas" / "v0.2-draft" / "context-assertion.schema.json"
CASES_PATH = ROOT / "conformance" / "v0_2" / "wire-cases.json"

SUPPORT_ROLES = {"supports", "corroborates", "derived_from"}


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def actor_key(actor: dict) -> tuple[str, str, str]:
    return (actor["scope"], actor["actor_id"], actor["actor_type"])


def semantic_errors(instance: dict, supported_extensions: set[str]) -> list[str]:
    errors: list[str] = []

    scope = instance["relationship_scope"]
    target_participants = {actor_key(actor) for actor in scope["participants"]}
    scope_type = scope["scope_type"]

    if scope_type == "bilateral" and len(target_participants) != 2:
        errors.append("bilateral scope must contain exactly two distinct participants")
    elif scope_type == "group" and len(target_participants) < 3:
        errors.append("group scope must contain at least three distinct participants")
    elif scope_type == "unknown":
        errors.append("unknown relationship scope is material and must fail closed")

    provenance = instance["provenance"]
    evidence_items = provenance.get("evidence", [])
    evidence_refs = {item["evidence_ref"] for item in evidence_items}

    if len(evidence_refs) != len(evidence_items):
        errors.append("evidence_ref values must be unique within one assertion")

    # Participant projection is a relationship semantic rule, not a channel rule.
    # Any evidence item whose declared source-participant set differs from the
    # assertion target scope requires an explicit basis for that projection.
    for evidence in evidence_items:
        source_participants = {actor_key(actor) for actor in evidence["source_participants"]}
        if source_participants != target_participants and not evidence.get("projection_basis_ref"):
            errors.append(
                f"{evidence['evidence_ref']} changes participant scope without projection_basis_ref"
            )

    dependency_refs: set[str] = set()
    dependency_by_ref: dict[str, dict] = {}
    derivation = provenance.get("derivation")

    if provenance["mode"] == "evidence" and derivation is not None:
        errors.append("evidence provenance mode must not carry derivation semantics")

    if provenance["mode"] == "derived":
        if not derivation:
            errors.append("derived provenance requires derivation")
        else:
            dependencies = derivation["dependencies"]
            for dependency in dependencies:
                ref = dependency["dependency_ref"]
                if ref in dependency_refs:
                    errors.append(f"duplicate dependency_ref: {ref}")
                dependency_refs.add(ref)
                dependency_by_ref[ref] = dependency

            material_support_refs = {
                ref
                for ref, dependency in dependency_by_ref.items()
                if dependency["material"]
                and dependency["dependency_type"] in {"evidence", "assertion"}
                and dependency["role"] in SUPPORT_ROLES
            }

            support_sets = derivation.get("support_sets", [])
            if material_support_refs and not support_sets:
                errors.append("material support dependencies require explicit support_sets")

            for support_set in support_sets:
                for ref in support_set:
                    dependency = dependency_by_ref.get(ref)
                    if dependency is None:
                        errors.append(f"support_set references unknown dependency: {ref}")
                        continue
                    if not dependency["material"]:
                        errors.append(f"support_set references non-material dependency: {ref}")
                    if dependency["dependency_type"] not in {"evidence", "assertion"}:
                        errors.append(f"support_set contains non-evidence support dependency: {ref}")
                    if dependency["role"] not in SUPPORT_ROLES:
                        errors.append(f"support_set dependency has non-support role: {ref}")

            identity_dependencies = {
                ref
                for ref, dependency in dependency_by_ref.items()
                if dependency["dependency_type"] == "identity_binding" and dependency["material"]
            }
            for ref in scope.get("identity_dependency_refs", []):
                if ref not in identity_dependencies:
                    errors.append(f"relationship scope identity dependency is not materialized: {ref}")

            required_policy_refs = {
                ref
                for ref, dependency in dependency_by_ref.items()
                if dependency["dependency_type"] == "policy" and dependency["material"]
            }
            carried_policy_refs = set(instance.get("policy_refs", []))
            missing_policy_refs = required_policy_refs - carried_policy_refs
            if missing_policy_refs:
                errors.append(
                    "material policy dependencies are not preserved: "
                    + ", ".join(sorted(missing_policy_refs))
                )

    known_basis_refs = evidence_refs | dependency_refs
    for ref in instance.get("verification_basis_refs", []):
        if ref not in known_basis_refs:
            errors.append(f"verification basis does not resolve to evidence/dependency: {ref}")

    assertion_id = instance["assertion_id"]
    for relation in instance.get("assertion_relations", []):
        if relation["assertion_ref"] == assertion_id:
            errors.append("assertion cannot declare a semantic relation to itself")

    declared_extensions = set(instance.get("extensions", {}).keys())
    for extension in instance.get("required_extensions", []):
        if extension not in declared_extensions:
            errors.append(f"required extension payload is missing: {extension}")
        if extension not in supported_extensions:
            errors.append(f"required extension is unsupported: {extension}")

    return errors


def normalize_assertion(instance: dict) -> dict:
    """Return transport-independent semantic state for equivalence checks."""

    normalized = {
        "type": instance["type"],
        "rcp_version": instance["rcp_version"],
        "assertion_id": instance["assertion_id"],
        "assertion_type": instance["assertion_type"],
        "relationship_scope": {
            "relationship_ref": instance["relationship_scope"].get("relationship_ref"),
            "scope_type": instance["relationship_scope"]["scope_type"],
            "participants": sorted(
                [list(actor_key(actor)) for actor in instance["relationship_scope"]["participants"]]
            ),
            "trust_domain": instance["relationship_scope"]["trust_domain"],
            "identity_dependency_refs": sorted(
                instance["relationship_scope"].get("identity_dependency_refs", [])
            ),
        },
        "epistemic_class": instance["epistemic_class"],
        "statement": instance["statement"],
        "verification_basis_refs": sorted(instance.get("verification_basis_refs", [])),
        "policy_refs": sorted(instance.get("policy_refs", [])),
        "lifecycle": deepcopy(instance["lifecycle"]),
    }

    provenance = instance["provenance"]
    normalized_provenance = {
        "mode": provenance["mode"],
        "visibility": provenance["visibility"],
    }

    if provenance.get("evidence"):
        normalized_provenance["evidence"] = sorted(
            [
                {
                    "evidence_ref": evidence["evidence_ref"],
                    "evidence_type": evidence["evidence_type"],
                    "provider_ref": evidence.get("provider_ref"),
                    "representation": evidence["representation"],
                    "source_participants": sorted(
                        [list(actor_key(actor)) for actor in evidence["source_participants"]]
                    ),
                    "projection_basis_ref": evidence.get("projection_basis_ref"),
                    "occurred_at": evidence.get("occurred_at"),
                    "policy_refs": sorted(evidence.get("policy_refs", [])),
                }
                for evidence in provenance["evidence"]
            ],
            key=lambda item: item["evidence_ref"],
        )

    if provenance.get("derivation"):
        derivation = provenance["derivation"]
        normalized_provenance["derivation"] = {
            "dependencies": sorted(
                derivation["dependencies"], key=lambda item: item["dependency_ref"]
            ),
            "support_sets": sorted(
                [sorted(support_set) for support_set in derivation.get("support_sets", [])]
            ),
        }

    normalized["provenance"] = normalized_provenance
    normalized["assertion_relations"] = sorted(
        instance.get("assertion_relations", []),
        key=lambda item: (item["relation"], item["assertion_ref"]),
    )
    normalized["required_extensions"] = sorted(instance.get("required_extensions", []))
    normalized["extensions"] = instance.get("extensions", {})
    return normalized


def validate_schema_cases(schema: dict, payload: dict) -> list[str]:
    failures: list[str] = []
    validator = Draft202012Validator(schema, format_checker=FormatChecker())

    for case in payload["schema_cases"]:
        instance = case["instance"]
        schema_errors = sorted(validator.iter_errors(instance), key=lambda error: list(error.path))
        schema_valid = not schema_errors

        if schema_valid != case["expected_schema_valid"]:
            details = "; ".join(error.message for error in schema_errors[:3]) or "unexpectedly valid"
            failures.append(
                f"wire-schema:{case['id']}: expected valid={case['expected_schema_valid']}, {details}"
            )
            continue

        if not schema_valid:
            continue

        supported_extensions = set(case.get("supported_extensions", []))
        errors = semantic_errors(instance, supported_extensions)
        semantic_valid = not errors
        if semantic_valid != case["expected_semantic_valid"]:
            failures.append(
                f"wire-semantic:{case['id']}: expected valid={case['expected_semantic_valid']}, got errors={errors}"
            )

    return failures


def validate_binding_equivalence(schema: dict, payload: dict) -> list[str]:
    failures: list[str] = []
    validator = Draft202012Validator(schema, format_checker=FormatChecker())

    for case in payload["binding_equivalence_cases"]:
        mcp_object = case["mcp"]["result"]["structuredContent"]
        http_object = case["http"]["body"]

        for binding_name, instance in (("mcp", mcp_object), ("http", http_object)):
            errors = list(validator.iter_errors(instance))
            if errors:
                failures.append(
                    f"binding:{case['id']}:{binding_name}: extracted RCP object is schema-invalid: {errors[0].message}"
                )
                continue
            semantic = semantic_errors(instance, set())
            if semantic:
                failures.append(
                    f"binding:{case['id']}:{binding_name}: extracted RCP object is semantic-invalid: {semantic}"
                )

        if normalize_assertion(mcp_object) != normalize_assertion(http_object):
            failures.append(
                f"binding:{case['id']}: binding-specific framing changed semantic state"
            )

    return failures


def main() -> int:
    schema = load_json(SCHEMA_PATH)
    payload = load_json(CASES_PATH)

    failures = validate_schema_cases(schema, payload) + validate_binding_equivalence(schema, payload)

    if failures:
        print("RCP v0.2 draft wire conformance: FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(
        "RCP v0.2 draft wire conformance: PASS "
        f"({len(payload['schema_cases'])} schema/semantic cases, "
        f"{len(payload['binding_equivalence_cases'])} binding-equivalence case)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
