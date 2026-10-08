#!/usr/bin/env python3
"""RCP v0.2 draft semantic conformance oracle.

This suite intentionally does not define a v0.2 wire format. It encodes the
relationship-specific invariants proposed by the v0.2 design draft using an
abstract test representation. Generic transport, authorization, cryptography,
and event-delivery behavior remain outside this oracle.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
CASES = HERE / "semantic-cases.json"


def load_cases() -> dict[str, Any]:
    with CASES.open("r", encoding="utf-8") as f:
        return json.load(f)


def projection_allowed(case: dict[str, Any]) -> bool:
    source = set(case["source_participants"])
    target = set(case["target_participants"])
    if not target or not target.issubset(source):
        return False
    if target == source:
        return True
    return bool(case.get("explicit_projection_basis"))


def evidence_relation_result(case: dict[str, Any]) -> dict[str, Any]:
    relation = case.get("declared_relation")
    if relation == "supersedes_left":
        return {"relation": relation, "left_current": False, "right_current": True}
    if relation == "conflicts_with":
        return {"relation": relation, "left_current": True, "right_current": True}
    # Wall-clock or transport arrival order alone carries no supersession meaning.
    return {"relation": "independent_views", "left_current": True, "right_current": True}


def dependency_invalidation_result(case: dict[str, Any]) -> dict[str, Any]:
    all_sources = set(case["all_sources"])
    removed = set(case["removed_sources"])
    material_removed = bool(all_sources & removed)

    surviving_support = any(
        not (set(support_set) & removed) for support_set in case["support_sets"]
    )

    if not material_removed:
        action = "none"
    elif surviving_support:
        action = "recompute"
    else:
        action = "invalidate"

    return {
        "current_support_exists": surviving_support,
        "action": action,
        "historical_lineage_preserved": True,
    }


def effective_parent_policy(parents: list[dict[str, Any]]) -> dict[str, Any]:
    purpose_sets = [set(parent["allowed_purposes"]) for parent in parents]
    allowed_purposes = set.intersection(*purpose_sets) if purpose_sets else set()
    return {
        "allowed_purposes": allowed_purposes,
        "external_processing": (
            "deny" if any(parent["external_processing"] == "deny" for parent in parents) else "allow"
        ),
        "training": "deny" if any(parent["training"] == "deny" for parent in parents) else "allow",
        "retention_max_seconds": min(parent["retention_max_seconds"] for parent in parents),
    }


def policy_projection_valid(case: dict[str, Any]) -> bool:
    parents = case["parents"]
    child = case["child"]
    effective = effective_parent_policy(parents)

    # The draft does not yet define a declassification profile. A mere boolean
    # assertion cannot loosen inherited restrictions.
    declassification_profile = case.get("declassification_profile")
    if case.get("declassification_basis") and not declassification_profile:
        return False

    if not set(child["allowed_purposes"]).issubset(effective["allowed_purposes"]):
        return False
    if effective["external_processing"] == "deny" and child["external_processing"] != "deny":
        return False
    if effective["training"] == "deny" and child["training"] != "deny":
        return False
    if child["retention_max_seconds"] > effective["retention_max_seconds"]:
        return False
    return True


def epistemic_transition_allowed(case: dict[str, Any]) -> bool:
    sources = case["source_classes"]
    output = case["output_class"]

    if output == "verified_fact":
        if all(source == "verified_fact" for source in sources):
            return True
        return bool(case.get("verification_basis"))

    if output == "extracted_fact":
        if all(source == "extracted_fact" for source in sources):
            return True
        return bool(case.get("direct_extraction_basis"))

    # Interpretation, inference, strategy, unknown, or unchanged source classes
    # remain explicitly labeled and therefore do not claim verification.
    return True


def source_access_allowed(case: dict[str, Any]) -> bool:
    return case.get("source_access") == "allow" and case.get("source_state") == "active"


def identity_change_requires_reevaluation(case: dict[str, Any]) -> bool:
    if not case.get("assertion_depends_on_binding"):
        return False
    return case.get("before_state") != case.get("after_state")


def composition_valid(case: dict[str, Any]) -> bool:
    sources = case["sources"]
    derived = case["derived"]
    source_ids = {source["id"] for source in sources}
    dependency_refs = set(derived.get("dependency_refs", []))

    if derived.get("id") in source_ids:
        return False
    if dependency_refs != source_ids:
        return False
    if not case.get("sources_remain_addressable"):
        return False
    if derived.get("epistemic_class") == "verified_fact":
        source_classes = [source["epistemic_class"] for source in sources]
        if not all(source_class == "verified_fact" for source_class in source_classes):
            if not derived.get("verification_basis"):
                return False
    return True


def arrival_order_supersedes(case: dict[str, Any]) -> bool:
    # Timestamps may help determine chronology, but chronology alone is not the
    # semantic relation `supersedes`.
    return bool(case.get("explicit_supersedes"))


def normalize_semantic(value: Any, key: str | None = None) -> Any:
    if isinstance(value, dict):
        return {k: normalize_semantic(v, k) for k, v in sorted(value.items())}
    if isinstance(value, list):
        normalized = [normalize_semantic(item) for item in value]
        if key in {"participants", "dependency_refs", "policy_refs"}:
            return sorted(normalized, key=lambda item: json.dumps(item, sort_keys=True))
        return normalized
    return value


def bindings_equivalent(case: dict[str, Any]) -> bool:
    # Binding-specific `frame` and transport identity are deliberately excluded.
    left = normalize_semantic(case["left"]["semantic"])
    right = normalize_semantic(case["right"]["semantic"])
    return left == right


def check_cases(
    failures: list[str],
    cases: list[dict[str, Any]],
    fn,
    expected_key: str,
    prefix: str,
) -> int:
    count = 0
    for case in cases:
        count += 1
        actual = fn(case)
        expected = case[expected_key]
        if actual != expected:
            failures.append(f"{prefix}:{case['id']}: expected {expected!r}, got {actual!r}")
    return count


def main() -> int:
    payload = load_cases()
    failures: list[str] = []
    count = 0

    count += check_cases(
        failures,
        payload["multi_party_projection"],
        projection_allowed,
        "expected_allowed",
        "projection",
    )
    count += check_cases(
        failures,
        payload["evidence_relations"],
        evidence_relation_result,
        "expected",
        "evidence-relation",
    )
    count += check_cases(
        failures,
        payload["dependency_invalidation"],
        dependency_invalidation_result,
        "expected",
        "dependency-invalidation",
    )
    count += check_cases(
        failures,
        payload["policy_projection"],
        policy_projection_valid,
        "expected_valid",
        "policy-projection",
    )
    count += check_cases(
        failures,
        payload["epistemic_preservation"],
        epistemic_transition_allowed,
        "expected_allowed",
        "epistemic",
    )
    count += check_cases(
        failures,
        payload["source_access"],
        source_access_allowed,
        "expected_source_access",
        "source-access",
    )
    count += check_cases(
        failures,
        payload["identity_dependency"],
        identity_change_requires_reevaluation,
        "expected_reevaluation",
        "identity-dependency",
    )
    count += check_cases(
        failures,
        payload["cross_provider_composition"],
        composition_valid,
        "expected_valid",
        "composition",
    )
    count += check_cases(
        failures,
        payload["arrival_order"],
        arrival_order_supersedes,
        "expected_left_superseded",
        "arrival-order",
    )
    count += check_cases(
        failures,
        payload["binding_equivalence"],
        bindings_equivalent,
        "expected_equivalent",
        "binding-equivalence",
    )

    if failures:
        print(f"RCP v0.2 draft semantic conformance: FAIL ({len(failures)}/{count} failed)")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"RCP v0.2 draft semantic conformance: PASS ({count} cases)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
