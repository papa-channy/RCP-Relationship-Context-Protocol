#!/usr/bin/env python3
"""RCP Core v0.1 experimental conformance runner.

The runner tests protocol-visible invariants and schema contracts. It is a
small conformance oracle for M1, not a production permission/policy engine and
not a requirement to use the reference implementation architecture.
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict, deque
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
CONF = ROOT / "conformance"
SCHEMAS = ROOT / "spec" / "schemas"

CONFIDENTIALITY_RANK = {
    "none": 0,
    "private_communication": 1,
    "organization_internal": 2,
    "organization_confidential": 3,
    "trade_secret_candidate": 4,
    "legally_privileged": 5,
    "unknown": 6,
}

SENSITIVITY_RANK = {
    "public": 0,
    "private": 1,
    "sensitive": 2,
    "highly_sensitive": 3,
    "unknown": 4,
}


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
    capability = case.get("required_capability_state")
    if capability in {"deny", "limited", "unknown"}:
        return False

    decision = case.get("permission_decision")
    if not decision or decision.get("decision") != "allow":
        return False

    expires_at = decision.get("expires_at")
    if not expires_at:
        return False

    return parse_time(expires_at) > parse_time(case["as_of"])


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


def envelope_is_activatable(case: dict) -> bool:
    request = case["request"]
    decision = case["decision"]
    envelope = case["envelope"]
    as_of = parse_time(case["as_of"])

    if decision.get("request_id") != request.get("request_id"):
        return False
    if envelope.get("permission_decision_ref") != decision.get("decision_id"):
        return False
    if decision.get("decision") != "allow":
        return False

    decision_expiry = decision.get("expires_at")
    envelope_expiry = envelope.get("expires_at")
    evaluated_at = decision.get("evaluated_at")
    issued_at = envelope.get("issued_at")
    if not all([decision_expiry, envelope_expiry, evaluated_at, issued_at]):
        return False

    decision_expiry_dt = parse_time(decision_expiry)
    envelope_expiry_dt = parse_time(envelope_expiry)
    evaluated_at_dt = parse_time(evaluated_at)
    issued_at_dt = parse_time(issued_at)

    if decision_expiry_dt <= as_of or envelope_expiry_dt <= as_of:
        return False
    if issued_at_dt < evaluated_at_dt:
        return False
    if envelope_expiry_dt > decision_expiry_dt:
        return False

    bindings = {
        "action": "action",
        "resource": "resource_ref",
        "purpose": "purpose",
        "destination": "destination",
        "processing_location": "processing_location",
    }
    return all(
        request.get(request_field) == envelope.get(envelope_field)
        for request_field, envelope_field in bindings.items()
    )


def cross_object_checks() -> list[str]:
    failures: list[str] = []
    payload = load_json(CONF / "cross-object-cases.json")

    for case in payload["cases"]:
        actual = envelope_is_activatable(case)
        if actual != case["expected_activatable"]:
            failures.append(
                f"cross-object:{case['id']}: expected activatable={case['expected_activatable']}, got {actual}"
            )

    return failures


def identity_link_permitted(case: dict) -> bool:
    """Check only the minimum identity isolation guarantees fixed by Core v0.1.

    This oracle intentionally does not define a complete identity-resolution
    algorithm. It proves that explicit same-tenant user confirmation is a safe
    positive fixture while known unsafe states cannot create an automatic link.
    """

    left = case["left"]
    right = case["right"]

    if left.get("tenant") != right.get("tenant"):
        return False

    blocked_states = {"conflicted", "rejected"}
    if left.get("verification_state") in blocked_states:
        return False
    if right.get("verification_state") in blocked_states:
        return False

    if case.get("sensitive_context"):
        uncertain_states = {"probable", "possible"}
        if left.get("verification_state") in uncertain_states:
            return False
        if right.get("verification_state") in uncertain_states:
            return False

    return (
        left.get("verification_state") == "user_confirmed"
        and right.get("verification_state") == "user_confirmed"
    )


def ancestor_access_permitted(case: dict) -> bool:
    """Child access never substitutes for an independent ancestor decision."""

    if case.get("child_decision") != "allow":
        return False
    if case.get("ancestor_state") != "active":
        return False
    return case.get("ancestor_decision") == "allow"


def privacy_boundary_checks() -> list[str]:
    failures: list[str] = []
    payload = load_json(CONF / "privacy-boundary-cases.json")

    for case in payload["identity_link_cases"]:
        actual = identity_link_permitted(case)
        if actual != case["expected_link_permitted"]:
            failures.append(
                f"identity-boundary:{case['id']}: expected permitted={case['expected_link_permitted']}, got {actual}"
            )

    for case in payload["provenance_access_cases"]:
        actual = ancestor_access_permitted(case)
        if actual != case["expected_ancestor_access"]:
            failures.append(
                f"provenance-boundary:{case['id']}: expected access={case['expected_ancestor_access']}, got {actual}"
            )

    return failures


def intersect_values(parents: list[dict], key: str) -> list[str]:
    values = [set(parent[key]) for parent in parents]
    if not values:
        return []
    return sorted(set.intersection(*values))


def most_restrictive(parents: list[dict], key: str, ranking: dict[str, int]) -> str:
    return max((parent[key] for parent in parents), key=lambda value: ranking[value])


def derive_effective_policy(parents: list[dict]) -> dict:
    if not parents:
        raise ValueError("at least one parent policy is required")

    return {
        "allowed_purposes": intersect_values(parents, "allowed_purposes"),
        "allowed_destinations": intersect_values(parents, "allowed_destinations"),
        "allowed_processing_locations": intersect_values(
            parents, "allowed_processing_locations"
        ),
        "retention_max_seconds": min(
            parent["retention_max_seconds"] for parent in parents
        ),
        "confidentiality": most_restrictive(
            parents, "confidentiality", CONFIDENTIALITY_RANK
        ),
        "sensitivity": most_restrictive(parents, "sensitivity", SENSITIVITY_RANK),
        "training": (
            "deny" if any(parent["training"] == "deny" for parent in parents) else "allow"
        ),
    }


def policy_inheritance_checks() -> list[str]:
    failures: list[str] = []
    payload = load_json(CONF / "policy-inheritance-cases.json")

    for case in payload["cases"]:
        actual = derive_effective_policy(case["parents"])
        if actual != case["expected"]:
            failures.append(
                f"policy-inheritance:{case['id']}: expected {case['expected']}, got {actual}"
            )

    return failures


def decision_is_fresh(case: dict) -> bool:
    decision = case["decision"]
    if decision.get("decision") != "allow":
        return False

    expires_at = decision.get("expires_at")
    if not expires_at or parse_time(expires_at) <= parse_time(case["as_of"]):
        return False

    snapshot = decision.get("dependency_snapshot")
    current = case.get("current_dependencies")
    if not snapshot or not current:
        return False

    return snapshot == current


def staleness_checks() -> list[str]:
    failures: list[str] = []
    payload = load_json(CONF / "staleness-cases.json")

    for case in payload["cases"]:
        actual = decision_is_fresh(case)
        if actual != case["expected_executable"]:
            failures.append(
                f"staleness:{case['id']}: expected executable={case['expected_executable']}, got {actual}"
            )

    return failures


def propagate_revocation(case: dict) -> dict[str, str]:
    states = {node_id: node["state"] for node_id, node in case["nodes"].items()}
    children: dict[str, list[dict]] = defaultdict(list)
    parents: dict[str, list[dict]] = defaultdict(list)

    for edge in case["edges"]:
        children[edge["parent"]].append(edge)
        parents[edge["child"]].append(edge)

    recomputable = set(case.get("recomputable", []))
    revoked = case["revoke"]
    states[revoked] = "revoked"

    queue = deque([revoked])
    queued = {revoked}

    while queue:
        affected_parent = queue.popleft()
        for edge in children.get(affected_parent, []):
            child = edge["child"]
            incoming = parents[child]

            essential_unusable = any(
                incoming_edge["dependency"] == "essential"
                and states[incoming_edge["parent"]]
                in {"revoked", "invalidated", "recompute_required"}
                for incoming_edge in incoming
            )

            supporting_edges = [
                incoming_edge
                for incoming_edge in incoming
                if incoming_edge["dependency"] == "supporting"
            ]
            supporting_lost = any(
                states[incoming_edge["parent"]]
                in {"revoked", "invalidated", "recompute_required"}
                for incoming_edge in supporting_edges
            )
            supporting_usable = any(
                states[incoming_edge["parent"]] == "active"
                for incoming_edge in supporting_edges
            )

            if essential_unusable:
                new_state = "recompute_required" if child in recomputable else "invalidated"
            elif supporting_lost:
                if supporting_usable and child in recomputable:
                    new_state = "recompute_required"
                else:
                    new_state = "invalidated"
            else:
                continue

            if states[child] != new_state:
                states[child] = new_state
                if child not in queued:
                    queue.append(child)
                    queued.add(child)

    return states


def revocation_checks() -> list[str]:
    failures: list[str] = []
    payload = load_json(CONF / "revocation-cases.json")

    for case in payload["cases"]:
        actual = propagate_revocation(case)
        if actual != case["expected_states"]:
            failures.append(
                f"revocation:{case['id']}: expected {case['expected_states']}, got {actual}"
            )

    return failures


def main() -> int:
    failures = (
        schema_checks()
        + behavior_checks()
        + cross_object_checks()
        + privacy_boundary_checks()
        + policy_inheritance_checks()
        + staleness_checks()
        + revocation_checks()
    )

    if failures:
        print("RCP conformance bootstrap: FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("RCP conformance bootstrap: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
