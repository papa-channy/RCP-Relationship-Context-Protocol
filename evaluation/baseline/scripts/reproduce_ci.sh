#!/bin/bash
# Usage: reproduce_ci.sh <worktree-at-target-commit> <log-file>
# Mirrors every run step of the three GitHub workflows at the target commit.
cd "$1"; LOG="$2"; : > "$LOG"
python3 -m venv .venv >/dev/null && source .venv/bin/activate
step(){ name="$1"; shift; s=$(date +%s); out=$( { eval "$@"; } 2>&1 ); rc=$?; e=$(( $(date +%s)-s ));
  printf '\n### %s | rc=%s | %ss\n$ %s\n%s\n' "$name" "$rc" "$e" "$*" "$(echo "$out" | tail -25)" >> "$LOG"; echo "$name rc=$rc ${e}s"; }
step pip-conf "pip install -q -r conformance/requirements.txt"
step v01-schema-semantic "python conformance/run.py"
step v01-boundary "python conformance/boundary_checks.py"
step pip-probe "pip install -q -r implementations/python-probe/requirements.txt"
step npm-crypto "npm install --silent --prefix conformance/crypto"
step v01-jose "npm test --prefix conformance/crypto"
mkdir -p /tmp/rcp-interop
step node-to-python "node conformance/crypto/interop-node-producer.mjs /tmp/rcp-interop/node-vector.json && PYTHONPATH=implementations/python-probe python implementations/python-probe/consume_vector.py /tmp/rcp-interop/node-vector.json"
step python-to-node "PYTHONPATH=implementations/python-probe python implementations/python-probe/produce_vector.py /tmp/rcp-interop/python-vector.json && node conformance/crypto/interop-node-consumer.mjs /tmp/rcp-interop/python-vector.json"
step npm-external "npm install --silent --prefix conformance/external"
step npm-refeco "npm install --silent --prefix reference-ecosystem"
step v01-harness-guard "! grep -n reference-ecosystem conformance/external/provider-harness.mjs"
step v01-external-selftest "npm run self-test --prefix conformance/external"
for t in smoke test:permission test:revocation test:policy test:relay test:identity demo; do step "refeco-$t" "npm run $t --prefix reference-ecosystem"; done
step v02-semantic "python conformance/v0_2/run.py"
step v02-wire "python conformance/v0_2/run_wire.py"
step v02-harness-guard "! grep -E 'conformance[./]v0_2[./](run|run_wire|normalize_wire)|import .*run_wire|from .*run_wire' conformance/external/v0_2/harness.py"
step v02-harness-selftest "python conformance/external/v0_2/harness.py --cmd 'python conformance/external/v0_2/reference_adapter.py' --implementation-name rcp-reference-adapter --implementation-version 0.2-draft --language 'Python 3.11' --rcp-revision 68026af --report conformance/external/v0_2/out/self-test-report.json"
step npm-bindings "npm install --silent --prefix bindings/v0_2"
step v02-binding-equivalence "npm test --prefix bindings/v0_2"
