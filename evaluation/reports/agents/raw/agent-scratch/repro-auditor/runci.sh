#!/bin/bash
# usage: runci.sh <clone> <venv> <nodebin>
cd "$1" || exit 1
export PATH="$3:$2/bin:$PATH" VIRTUAL_ENV="$2" _ZO_DOCTOR=0 GITHUB_SHA=68026af
step(){ n="$1"; shift; s=$(date +%s.%N); "$@" > /tmp/rcp_step.out 2>&1; rc=$?; e=$(date +%s.%N); printf "STEP %-60s rc=%d t=%.1fs\n" "$n" $rc $(echo "$e - $s"|bc); tail -${TAILN:-4} /tmp/rcp_step.out | sed 's/^/    | /'; }
sh(){ bash -c "$1"; }
echo "python: $(python --version) node: $(node --version) npm: $(npm --version)"
echo "=== workflow: conformance.yml"
step "pip install conformance/requirements" python -m pip install -r conformance/requirements.txt
step "conformance/run.py" python conformance/run.py
step "boundary_checks.py" python conformance/boundary_checks.py
step "pip install python-probe reqs" python -m pip install -r implementations/python-probe/requirements.txt
step "npm install crypto" npm install --prefix conformance/crypto
step "npm test crypto" npm test --prefix conformance/crypto
mkdir -p /tmp/rcp-interop
step "node producer" node conformance/crypto/interop-node-producer.mjs /tmp/rcp-interop/node-vector.json
step "py consume" env PYTHONPATH=implementations/python-probe python implementations/python-probe/consume_vector.py /tmp/rcp-interop/node-vector.json
step "py produce" env PYTHONPATH=implementations/python-probe python implementations/python-probe/produce_vector.py /tmp/rcp-interop/python-vector.json
step "node consume" node conformance/crypto/interop-node-consumer.mjs /tmp/rcp-interop/python-vector.json
step "npm install external" npm install --prefix conformance/external
step "npm install reference-ecosystem (for harness)" npm install --prefix reference-ecosystem
if grep -n "reference-ecosystem" conformance/external/provider-harness.mjs; then echo "FAIL independence grep"; else echo "STEP independence grep rc=0 (no match)"; fi
step "external self-test" npm run self-test --prefix conformance/external
echo "=== workflow: reference-ecosystem.yml"
step "npm install" npm install --prefix reference-ecosystem
for t in smoke test:permission test:revocation test:policy test:relay test:identity demo; do step "npm run $t" npm run $t --prefix reference-ecosystem; done
ls -la reference-ecosystem/out 2>&1 | head
echo "=== workflow: semantic-v0.2.yml"
step "v0_2/run.py" python conformance/v0_2/run.py
step "v0_2/run_wire.py" python conformance/v0_2/run_wire.py
if grep -E "conformance[./]v0_2[./](run|run_wire|normalize_wire)|import .*run_wire|from .*run_wire" conformance/external/v0_2/harness.py; then echo "FAIL grep"; else echo "STEP v0.2 independence grep rc=0 (no match)"; fi
step "external v0_2 harness self-test" python conformance/external/v0_2/harness.py --cmd "python conformance/external/v0_2/reference_adapter.py" --implementation-name rcp-reference-adapter --implementation-version 0.2-draft --language "Python 3.12" --rcp-revision "${GITHUB_SHA}" --report conformance/external/v0_2/out/self-test-report.json
step "npm install bindings" npm install --prefix bindings/v0_2
step "npm test bindings" npm test --prefix bindings/v0_2
