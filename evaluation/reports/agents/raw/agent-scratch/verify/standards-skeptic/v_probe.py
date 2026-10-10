import sys,copy,json
sys.path.insert(0,'conformance/v0_2')
import run_wire as rw
from jsonschema import Draft202012Validator, FormatChecker
schema=rw.load_json(rw.SCHEMA_PATH); payload=rw.load_json(rw.CASES_PATH)
V=Draft202012Validator(schema,format_checker=FormatChecker())
cases={c['id']:c['instance'] for c in payload['schema_cases']}
def check(name,inst):
    errs=sorted(V.iter_errors(inst),key=lambda e:list(e.path))
    if errs: print(f"[{name}] SCHEMA-REJECT: {errs[0].message[:150]}"); return
    s=rw.semantic_errors(inst,set())
    print(f"[{name}]", "ACCEPTED" if not s else f"SEM-REJECTED {s}")
A={"actor_id":"A","scope":"tenant:t1","actor_type":"person"}
B={**A,"actor_id":"B"}; C={**A,"actor_id":"C"}
D=copy.deepcopy
# SS-03 P1: derived, bilateral {A,B}; deps are group evidence but participants never declared
i=D(cases['derived-independent-support']); check("P1 derived bilateral, no source_participants anywhere",i)
# P1b: same with provenance.evidence {A,B,C} declared (mode derived)
i=D(cases['derived-independent-support']); i['provenance']['evidence']=[{"evidence_ref":"evidence:a","evidence_type":"interaction","representation":"metadata","source_participants":[A,B,C]},{"evidence_ref":"evidence:b","evidence_type":"interaction","representation":"metadata","source_participants":[A,B]}]; check("P1b derived + evidence {A,B,C} declared",i)
# P1c: SS-03 probe: mode derived, evidence declared with only 'a' hiding? 
i=D(cases['derived-independent-support']); i['provenance']['evidence']=[{"evidence_ref":"evidence:a","evidence_type":"interaction","representation":"metadata","source_participants":[A,B,C],"projection_basis_ref":"basis:x"}]; check("P1c derived + evidence a {A,B,C}+basis",i)
# does semantic check require support_set refs resolve to evidence list?
i=D(cases['derived-independent-support']); i['provenance']['evidence']=[{"evidence_ref":"evidence:zzz","evidence_type":"interaction","representation":"metadata","source_participants":[A,B]}]; check("P1d derived evidence list unrelated to deps",i)
# opaque
i=D(cases['explicit-bilateral-projection']); i['provenance']={"mode":"opaque","visibility":"opaque"}; check("P1e opaque (explicit allowed)",i)
# SS-04
i=D(cases['explicit-bilateral-projection']); i['provenance']['evidence'][0]['source_participants']=[A,B]; i['provenance']['evidence'][0]['policy_refs']=['policy:external-processing-deny']; i.pop('policy_refs',None); check("P3 evidence policy_refs not carried (evidence mode)",i)
i=D(cases['derived-independent-support']); i['provenance']['evidence']=[{"evidence_ref":"evidence:a","evidence_type":"interaction","representation":"metadata","source_participants":[A,B],"policy_refs":["policy:deny-ext"]}]; check("P3b derived: evidence policy_ref not carried",i)
i=D(cases['derived-independent-support']); i.pop('policy_refs'); check("P3c control: material policy dep missing",i)
i=D(cases['derived-independent-support']); i['policy_refs']=[]; i['provenance']['derivation']['dependencies']=[d for d in i['provenance']['derivation']['dependencies'] if d['dependency_type']!='policy']; check("P3d policy dependency simply omitted",i)
# SS-02 same-origin: schema fields for independence
i=D(cases['derived-independent-support']); i['provenance']['derivation']['dependencies'][0]['had_primary_source']='x'; check("P5 had_primary_source field",i)
print(sorted(schema['$defs']['Dependency']['properties']), sorted(schema['$defs']['EvidenceReference']['properties']))
# SS-06
i=D(cases['bilateral-source-statement']); i['relationship_scope']['participants'][0]['role']='obligor'; check("P5 participant role",i)
i=D(cases['bilateral-source-statement']); i['relationship_scope']['participants'][0]['valid_from']='2026-01-01T00:00:00Z'; check("P6 participant valid_from",i)
i=D(cases['bilateral-source-statement']); i['relationship_scope']=[i['relationship_scope'],i['relationship_scope']]; check("P7 multiple scopes",i)
i=D(cases['bilateral-source-statement']); i['assertion_relations']=[{"relation":"supersedes","assertion_ref":"assertion:x","fields":["due"]}]; check("P8 partial supersede",i)
i=D(cases['bilateral-source-statement']); i['relationship_scope']['scope_type']='group'; check("P14 2-person group",i)
i=D(cases['bilateral-source-statement']); i['statement']={"obligor":"A","obligee":"B"}; check("statement object",i)
print("--- extension path")
i=D(cases['bilateral-source-statement']); i['extensions']={"x-acme:obligations":{"obligor":"A","obligee":"B","due":"2026-11-01T00:00:00Z"}}; i['required_extensions']=["x-acme:obligations"]
errs=list(V.iter_errors(i)); print("schema errs",[e.message for e in errs]); print("supported:",rw.semantic_errors(i,{"x-acme:obligations"}), "unsupported:",rw.semantic_errors(i,set()))
i=D(cases['bilateral-source-statement']); i['assertion_relations']=[{"relation":"refines","assertion_ref":"assertion:x"}]; check("refines relation",i)
