#!/usr/bin/env python3
"""Additional RCP M1 privacy/data-boundary conformance checks.

These checks exercise provider representation boundaries and interaction-scope
projection. They define observable minimum behavior without defining a complete
provider transport API or InteractionObject wire schema.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONF = ROOT / "conformance"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def representation_transferable(case: dict) -> bool:
    """Return whether the requested representation may leave its current boundary.

    Capability is only a technical prerequisite. Permission remains mandatory,
    and unresolved `limited` capabilities fail closed.
    """

    if case.get("permission_decision") != "allow":
        return False

    representation = case["requested_representation"]
    capabilities = case["capabilities"]

    capability_name = {
        "raw_content": "content",
        "provider_context": "provider_context",
        "interaction_metadata": "interaction_metadata",
    }.get(representation)

    if not capability_name:
        return False

    state = capabilities.get(capability_name)
    if state == "deny" or state is None:
        return False
    if state == "limited" and not case.get("limitations_resolved", False):
        return False

    if case.get("requires_external_processing", False):
        external_state = capabilities.get("external_processing")
        if external_state == "deny" or external_state is None:
            return False
        if external_state == "limited" and not case.get("limitations_resolved", False):
            return False

    return state in {"allow", "limited"}


def content_boundary_checks() -> list[str]:
    failures: list[str] = []
    payload = load_json(CONF / "content-boundary-cases.json")

    for case in payload["cases"]:
        actual = representation_transferable(case)
        expected = case["expected_transferable"]
        if actual != expected:
            failures.append(
                f"content-boundary:{case['id']}: expected transferable={expected}, got {actual}"
            )

    return failures


def group_projection_permitted(case: dict) -> bool:
    """Apply the minimum group-context projection invariant.

    A context scoped to fewer participants than the source interaction requires
    explicit evidence that supports that narrower scope. This prevents a group
    interaction from becoming bilateral relationship memory merely because A
    and B were both present.
    """

    interaction = set(case["interaction_participants"])
    target = set(case["target_relationship_participants"])

    if not target or not target.issubset(interaction):
        return False

    if target == interaction:
        return True

    # Narrower projection requires an explicit source/evidence basis.
    return bool(case.get("bilateral_basis", False))


def group_context_checks() -> list[str]:
    failures: list[str] = []
    payload = load_json(CONF / "group-context-cases.json")

    for case in payload["cases"]:
        actual = group_projection_permitted(case)
        expected = case["expected_projection_permitted"]
        if actual != expected:
            failures.append(
                f"group-context:{case['id']}: expected permitted={expected}, got {actual}"
            )

    return failures


def main() -> int:
    failures = content_boundary_checks() + group_context_checks()
    if failures:
        print("RCP content/group boundary conformance: FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("RCP content/group boundary conformance: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
