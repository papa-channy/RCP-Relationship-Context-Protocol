import sys, json, copy, importlib.util
from pathlib import Path
WT=Path("/private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/wt")
spec=importlib.util.spec_from_file_location("rw", WT/"conformance/v0_2/run_wire.py"); rw=importlib.util.module_from_spec(spec); spec.loader.exec_module(rw)
spec2=importlib.util.spec_from_file_location("ab", WT/"conformance/v0_2/run.py"); ab=importlib.util.module_from_spec(spec2); spec2.loader.exec_module(ab)
from jsonschema import Draft202012Validator, FormatChecker
schema=json.load(open(WT/"spec/schemas/v0.2-draft/context-assertion.schema.json"))
V=Draft202012Validator(schema, format_checker=FormatChecker())
def P(i,t="person"): return {"actor_id":i,"scope":"tenant:t1","actor_type":t}
def base(parts, st="bilateral"):
    return {"type":"rcp.context_assertion","rcp_version":"0.2-draft","assertion_id":"a:1","assertion_type":"commitment",
     "relationship_scope":{"scope_type":st,"participants":parts,"trust_domain":"tenant:t1"},
     "epistemic_class":"system_interpretation","statement":"x","provenance":{"mode":"opaque","visibility":"opaque"},
     "lifecycle":{"state":"active"},"created_at":"2026-10-09T00:00:00Z"}
def check(name, inst, ext=set()):
    se=[e.message for e in V.iter_errors(inst)]
    sem = rw.semantic_errors(inst, ext) if not se else None
    ok = not se and not sem
    print(f"{name}: {'ACCEPTED' if ok else 'REJECTED'} schema={se[:2]} sem={sem}")
AB=[P("A"),P("B")]; ABC=[P("A"),P("B"),P("C")]
# RT-2: derived mode collapse
i=base(AB); i["statement"]="A and B committed (source: group chat A,B,C)"
i["provenance"]={"mode":"derived","visibility":"redacted","derivation":{"dependencies":[{"dependency_ref":"evidence:g","dependency_type":"evidence","role":"supports","material":True}],"support_sets":[["evidence:g"]]}}
check("RT2-derived-collapse",i)
j=copy.deepcopy(i); j["provenance"]={"mode":"evidence","visibility":"full","evidence":[{"evidence_ref":"evidence:g","evidence_type":"interaction","representation":"metadata","source_participants":ABC}]}
check("RT2-evidence-control",j)
k=copy.deepcopy(j); k["provenance"]["evidence"][0]["projection_basis_ref"]="basis:trust-me"; check("RT2-basis-arbitrary",k)
# derived + evidence both? derived mode with evidence list included
m=copy.deepcopy(i); m["provenance"]["evidence"]=[{"evidence_ref":"evidence:g","evidence_type":"interaction","representation":"metadata","source_participants":ABC}]
check("RT2-derived-with-evidence-list",m)
# RT-3: scope widening
w=base(ABC,"group"); w["provenance"]={"mode":"evidence","visibility":"full","evidence":[{"evidence_ref":"evidence:ab","evidence_type":"interaction","representation":"metadata","source_participants":AB,"projection_basis_ref":"basis:x"}]}
check("RT3-widen",w)
print("abstract projection_allowed widen:", ab.projection_allowed({"source_participants":["A","B"],"target_participants":["A","B","C"],"explicit_projection_basis":True}))
# RT-4
v=base(AB); v["epistemic_class"]="verified_fact"; v["statement"]="B is insolvent."; v["verification_basis_refs"]=["evidence:u"]
v["provenance"]={"mode":"evidence","visibility":"opaque","evidence":[{"evidence_ref":"evidence:u","evidence_type":"unknown","representation":"opaque_ref","source_participants":AB}]}
check("RT4a-unknown-opaque",v)
v2=base(AB); v2["epistemic_class"]="verified_fact"; v2["verification_basis_refs"]=["policy:p1"]
v2["provenance"]={"mode":"derived","visibility":"redacted","derivation":{"dependencies":[{"dependency_ref":"policy:p1","dependency_type":"policy","role":"refines","material":False}]}}
check("RT4b-policy-nonmaterial-basis",v2)
v3=base(AB); v3["epistemic_class"]="verified_fact"; v3["verification_basis_refs"]=["assertion:weak"]
v3["provenance"]={"mode":"derived","visibility":"redacted","derivation":{"dependencies":[{"dependency_ref":"assertion:weak","dependency_type":"assertion","role":"supports","material":True}],"support_sets":[["assertion:weak"]]}}
check("RT4c-assertion-basis",v3)
v4=base(AB); v4["epistemic_class"]="verified_fact"; v4["verification_basis_refs"]=["x:unresolved"]
check("RT4-control-unresolved",v4)
print("abstract verified with basis=rumor:", ab.epistemic_transition_allowed({"source_classes":["source_statement"],"output_class":"verified_fact","verification_basis":"rumor"}))
# RT-5
p=base(AB); p["provenance"]={"mode":"evidence","visibility":"full","evidence":[{"evidence_ref":"evidence:r","evidence_type":"interaction","representation":"metadata","source_participants":AB,"policy_refs":["policy:no-external-processing","policy:no-training","policy:org-confidential"]}]}
check("RT5a-evidence-policy-dropped",p)
p2=base(AB); p2["provenance"]={"mode":"derived","visibility":"redacted","derivation":{"dependencies":[{"dependency_ref":"evidence:e","dependency_type":"evidence","role":"supports","material":True},{"dependency_ref":"policy:org-confidential","dependency_type":"policy","role":"derived_from","material":False}],"support_sets":[["evidence:e"]]}}
check("RT5b-policy-nonmaterial",p2)
p2c=copy.deepcopy(p2); p2c["provenance"]["derivation"]["dependencies"][1]["material"]=True; check("RT5b-control-material",p2c)
p3=base(AB); p3["policy_refs"]=["policy:no-training","policy:allow-all"]; check("RT5c-conflicting",p3)
# RT-10
s=base([P("B"),P("scorer","service")]); s["assertion_type"]="x-broker:social-score"; s["epistemic_class"]="system_inference"
s["statement"]="B is financially stressed; trust score 0.12"; s["extensions"]={"x-broker:profile":{"score":0.12,"resale":True}}
s["provenance"]={"mode":"opaque","visibility":"hidden"}; check("RT10a-broker",s)
s2=base(AB,"x-vendor:everyone-in-org"); check("RT10b-ext-scope",s2)
s3=base(AB); s3["epistemic_class"]="unknown"; s3["provenance"]={"mode":"unavailable","visibility":"hidden"}; check("RT10c-unknown",s3)
s4=base(AB,"unknown"); check("RT10-control-unknown-scope",s4)
s5=base(AB,"provider_defined"); check("RT10-provider_defined-scope",s5)
x=base([P("A"),P("D")]); x["provenance"]={"mode":"evidence","visibility":"full","evidence":[{"evidence_ref":"evidence:ab","evidence_type":"interaction","representation":"metadata","source_participants":AB,"projection_basis_ref":"basis:x"}]}
check("RT3-target-not-in-source(A,D)",x)
