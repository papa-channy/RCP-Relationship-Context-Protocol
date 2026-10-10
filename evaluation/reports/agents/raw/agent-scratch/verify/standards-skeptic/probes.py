import json,sys,copy
sys.path.insert(0,'conformance/v0_2')
from pathlib import Path
import run_wire as rw
from jsonschema import Draft202012Validator, FormatChecker
schema=rw.load_json(rw.SCHEMA_PATH); payload=rw.load_json(rw.CASES_PATH)
V=Draft202012Validator(schema,format_checker=FormatChecker())
cases={c['id']:c['instance'] for c in payload['schema_cases']}
def check(name,inst):
    errs=list(V.iter_errors(inst))
    if errs: print(f"[{name}] SCHEMA-REJECT: {errs[0].message}"); return
    s=rw.semantic_errors(inst,set())
    print(f"[{name}]", "ACCEPTED" if not s else f"REJECTED {s}")
A={"actor_id":"A","scope":"tenant:t1","actor_type":"person"}
B={**A,"actor_id":"B"}; C={**A,"actor_id":"C"}; D={**A,"actor_id":"D"}
# P1: derived-mode with no projection check: scope {A,B}, any dependency; no source participants anywhere
i=copy.deepcopy(cases['derived-independent-support']); check("P1 derived mode (no source_participants field exists)",i)
# P1b opaque
i=copy.deepcopy(cases['explicit-bilateral-projection']); i['provenance']={"mode":"opaque","visibility":"opaque"}; check("P1b opaque",i)
# P2 expansion: evidence source {A,B}, target {A,B,D} group, basis x
i=copy.deepcopy(cases['explicit-bilateral-projection'])
i['relationship_scope']['scope_type']='group'; i['relationship_scope']['participants']=[A,B,D]
i['provenance']['evidence'][0]['source_participants']=[A,B]
i['provenance']['evidence'][0]['projection_basis_ref']='x'
check("P2 scope EXPANSION {A,B}->{A,B,D} basis x",i)
# abstract oracle
import run as ro
print("oracle expansion:", ro.projection_allowed({"source_participants":["A","B"],"target_participants":["A","B","D"],"explicit_projection_basis":"x"}))
# P1c: disjoint target
i=copy.deepcopy(cases['explicit-bilateral-projection']); i['provenance']['evidence'][0]['source_participants']=[C,D]; check("P1c disjoint source {C,D}->{A,B} basis",i)
# P3: evidence policy_refs not carried
i=copy.deepcopy(cases['explicit-bilateral-projection']); i['provenance']['evidence'][0]['policy_refs']=['policy:external-processing-deny']; i.pop('policy_refs',None); check("P3 evidence policy_refs not carried",i)
# P3b derived: policy dependency not carried -> rejected (control)
i=copy.deepcopy(cases['derived-independent-support']); i.pop('policy_refs'); check("P3b derived policy dep not carried (control)",i)
# P5 had_primary_source
i=copy.deepcopy(cases['derived-independent-support']); i['provenance']['derivation']['dependencies'][0]['had_primary_source']='x'; check("P5 had_primary_source",i)
print("oracle dup source:", ro.dependency_invalidation_result({"all_sources":["gmail:m1","crm:m1-copy"],"support_sets":[["gmail:m1"],["crm:m1-copy"]],"removed_sources":["gmail:m1"]}))
