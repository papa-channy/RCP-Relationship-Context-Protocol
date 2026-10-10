#!/bin/bash
WT=/private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/wt
H=$(dirname "$0")
for f in $H/attacks/*.json; do
  python3 - "$f" "$WT" <<'P'
import json,sys,subprocess
f,wt=sys.argv[1],sys.argv[2]
a=json.load(open(f))
req={"contract_version":"rcp-v0.2-cleanroom-1","operation":"evaluate_context_assertion","supported_extensions":[],"assertion":a}
r=subprocess.run([wt+"/.venv/bin/python",wt+"/conformance/external/v0_2/reference_adapter.py"],input=json.dumps(req),text=True,capture_output=True)
o=json.loads(r.stdout)
print(f.split('/')[-1][:-5].ljust(75),"ACCEPTED" if o["accepted"] else "REJECTED "+"; ".join(o["errors"])[:100])
P
done
