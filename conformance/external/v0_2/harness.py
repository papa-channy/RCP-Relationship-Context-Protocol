#!/usr/bin/env python3
"""Black-box harness for unrelated RCP v0.2 semantic implementations.

This harness intentionally knows expected black-box outcomes but does not import
RCP's reference semantic validator. The implementation adapter receives no case
ID or expected result.
"""

from __future__ import annotations

import argparse
import json
import shlex
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
DEFAULT_CASES = HERE / "cases" / "public.json"
CONTRACT_VERSION = "rcp-v0.2-cleanroom-1"


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def canonical(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def run_adapter(command: str, request: dict[str, Any], timeout: float) -> tuple[dict[str, Any] | None, str | None, str]:
    argv = shlex.split(command)
    if not argv:
        return None, "empty implementation command", ""

    try:
        completed = subprocess.run(
            argv,
            input=json.dumps(request, ensure_ascii=False),
            text=True,
            capture_output=True,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return None, f"adapter timed out after {timeout}s", ""
    except OSError as exc:
        return None, f"adapter process could not start: {exc}", ""

    stderr = completed.stderr.strip()
    if completed.returncode != 0:
        return None, f"adapter exited with code {completed.returncode}", stderr

    stdout = completed.stdout.strip()
    if not stdout:
        return None, "adapter produced empty stdout", stderr

    try:
        response = json.loads(stdout)
    except json.JSONDecodeError as exc:
        return None, f"adapter stdout is not one JSON document: {exc}", stderr

    if not isinstance(response, dict):
        return None, "adapter response must be a JSON object", stderr

    return response, None, stderr


def validate_response_shape(response: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    if response.get("contract_version") != CONTRACT_VERSION:
        errors.append("wrong or missing contract_version")

    if not isinstance(response.get("accepted"), bool):
        errors.append("accepted must be boolean")
        return errors

    if not isinstance(response.get("errors"), list):
        errors.append("errors must be an array")

    digest = response.get("semantic_digest")
    if response["accepted"] and not isinstance(digest, dict):
        errors.append("accepted response requires object semantic_digest")
    if not response["accepted"] and digest is not None:
        errors.append("rejected response requires semantic_digest=null")

    return errors


def evaluate_case(command: str, case: dict[str, Any], timeout: float) -> dict[str, Any]:
    request = {
        "contract_version": CONTRACT_VERSION,
        "operation": "evaluate_context_assertion",
        "supported_extensions": case.get("supported_extensions", []),
        "assertion": case["assertion"],
    }

    response, process_error, stderr = run_adapter(command, request, timeout)
    expected = case["expected"]
    result: dict[str, Any] = {
        "id": case["id"],
        "passed": False,
        "expected_accepted": expected["accepted"],
        "actual_accepted": None,
        "failures": [],
    }

    if stderr:
        result["adapter_stderr"] = stderr

    if process_error:
        result["failures"].append(process_error)
        return result

    assert response is not None
    shape_errors = validate_response_shape(response)
    if shape_errors:
        result["failures"].extend(shape_errors)
        return result

    actual_accepted = response["accepted"]
    result["actual_accepted"] = actual_accepted

    if actual_accepted != expected["accepted"]:
        result["failures"].append(
            f"acceptance mismatch: expected {expected['accepted']}, got {actual_accepted}"
        )
        if response.get("errors"):
            result["adapter_errors"] = response["errors"]
        return result

    if actual_accepted:
        expected_digest = expected.get("semantic_digest")
        actual_digest = response.get("semantic_digest")
        if canonical(actual_digest) != canonical(expected_digest):
            result["failures"].append("semantic_digest mismatch")
            result["expected_digest"] = expected_digest
            result["actual_digest"] = actual_digest
            return result
    elif response.get("errors"):
        result["adapter_errors"] = response["errors"]

    result["passed"] = True
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run RCP v0.2 clean-room black-box conformance")
    parser.add_argument("--cmd", required=True, help="implementation adapter command")
    parser.add_argument("--cases", default=str(DEFAULT_CASES), help="case pack JSON path")
    parser.add_argument("--implementation-name", required=True)
    parser.add_argument("--implementation-version", default="unknown")
    parser.add_argument("--language", default="unknown")
    parser.add_argument("--rcp-revision", default="unspecified")
    parser.add_argument("--report", default="rcp-v0.2-cleanroom-report.json")
    parser.add_argument("--timeout", type=float, default=10.0)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    case_path = Path(args.cases).resolve()
    payload = load_json(case_path)

    if payload.get("case_pack_version") != "rcp-v0.2-cleanroom-cases-1":
        print("Unsupported case pack version", file=sys.stderr)
        return 2

    results = [evaluate_case(args.cmd, case, args.timeout) for case in payload["cases"]]
    passed = sum(1 for result in results if result["passed"])
    failed = len(results) - passed

    report = {
        "harness_contract_version": CONTRACT_VERSION,
        "case_pack_version": payload["case_pack_version"],
        "case_pack_path": str(case_path),
        "case_pack_declared_revision": payload.get("rcp_revision"),
        "rcp_revision": args.rcp_revision,
        "implementation": {
            "name": args.implementation_name,
            "version": args.implementation_version,
            "language": args.language,
            "command": args.cmd,
        },
        "run_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "total": len(results),
            "passed": passed,
            "failed": failed,
        },
        "results": results,
    }

    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    status = "PASS" if failed == 0 else "FAIL"
    print(f"RCP v0.2 external clean-room harness: {status} ({passed}/{len(results)} cases)")
    print(f"report: {report_path}")

    if failed:
        for result in results:
            if not result["passed"]:
                print(f"- {result['id']}: {'; '.join(result['failures'])}")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
