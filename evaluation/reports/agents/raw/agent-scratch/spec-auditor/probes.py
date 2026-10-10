import json, sys, copy, subprocess
from pathlib import Path
WT=Path(sys.argv[1]); OUT=Path(sys.argv[2])
P=str(WT/".venv/bin/python"); ADP=str(WT/"conformance/external/v0_2/reference_adapter.py")
def A(t1="tenant:t1"): return lambda i,ty="person",s=t1: {"actor_id":i,"scope":s,"actor_type":ty}
a=A()
base={
 "type":"rcp.context_assertion","rcp_version":"0.2-draft","assertion_id":"assertion:k",
 "assertion_type":"commitment",
 "relationship_scope":{"scope_type":"bilateral","participants":[a("A"),a("B")],"trust_domain":"tenant:t1"},
 "epistemic_class":"system_interpretation","statement":"A and B have an open commitment.",
 "provenance":{"mode":"derived","visibility":"full","derivation":{
   "dependencies":[
     {"dependency_ref":"evidence:A","dependency_type":"evidence","role":"supports","material":True},
     {"dependency_ref":"evidence:B","dependency_type":"evidence","role":"corroborates","material":True},
     {"dependency_ref":"policy:p1","dependency_type":"policy","role":"derived_from","material":True}],
   "support_sets":[["evidence:A"],["evidence:B"]]}},
 "policy_refs":["policy:p1"],"lifecycle":{"state":"active"},"created_at":"2026-10-09T00:00:00Z"}
def ev(ref, parts, basis=None):
    e={"evidence_ref":ref,"evidence_type":"interaction","representation":"opaque_ref","source_participants":parts}
    if basis: e["projection_basis_ref"]=basis
    return e
probes={}
probes["P0-base"]=base
x=copy.deepcopy(base); x["relationship_scope"]["participants"]=[a("A","person"),a("A","agent")]; probes["P1-bilateral-same-actor-two-types"]=x
x=copy.deepcopy(base); x["relationship_scope"]["participants"]=[a("A",s="tenant:t9"),a("B",s="tenant:t8")]; probes["P1b-participants-outside-trust_domain"]=x
x=copy.deepcopy(base); x["provenance"]={"mode":"evidence","visibility":"full","evidence":[ev("evidence:E",[a("A"),a("C")],"basis:x")]}; x["policy_refs"]=[]; probes["P2-target-not-subset-of-source-with-basis"]=x
x=copy.deepcopy(base); x["provenance"]["derivation"]["support_sets"]=[["evidence:A","evidence:B"],["evidence:B","evidence:A"]]; probes["P3-duplicate-support-set-reordered"]=x
x=copy.deepcopy(base); x["provenance"]["derivation"]["support_sets"]=[["evidence:A"],["evidence:A","evidence:B"]]; probes["P3b-non-minimal-superset-support-set"]=x
x=copy.deepcopy(base); x["provenance"]["derivation"]["support_sets"]=[["evidence:A"]]; probes["P4-material-support-dep-in-no-support-set"]=x
x=copy.deepcopy(base); x["provenance"]["mode"]="opaque"; x["policy_refs"]=[]; x["provenance"]["derivation"]["support_sets"]=[["evidence:UNKNOWN"]]; probes["P7-opaque-mode-carrying-derivation-drops-policy"]=x
x=copy.deepcopy(base); x["provenance"]["mode"]="unavailable"; x["policy_refs"]=[]; probes["P7b-unavailable-mode-carrying-derivation-drops-policy"]=x
x=copy.deepcopy(base); x["provenance"]["mode"]="derived"; x["policy_refs"]=[]; probes["P7c-control-derived-drops-policy"]=x
x=copy.deepcopy(base); x["provenance"]={"mode":"evidence","visibility":"full","evidence":[ev("evidence:E",[a("A"),a("B")])]}; x["policy_refs"]=[]; x["relationship_scope"]["identity_dependency_refs"]=["identity:A-binding"]; probes["P8-evidence-mode-unmaterialized-identity-dep"]=x
x=copy.deepcopy(base); x["epistemic_class"]="verified_fact"; x["verification_basis_refs"]=["policy:p1"]; probes["P9-verified-basis-is-a-policy-ref"]=x
x=copy.deepcopy(base); x["epistemic_class"]="verified_fact"; x["provenance"]["derivation"]["dependencies"].append({"dependency_ref":"evidence:N","dependency_type":"evidence","role":"supports","material":False}); x["verification_basis_refs"]=["evidence:N"]; probes["P9b-verified-basis-non-material-dep"]=x
x=copy.deepcopy(base); x["lifecycle"]={"state":"active","valid_from":"2027-01-01T00:00:00Z","valid_until":"2020-01-01T00:00:00Z"}; probes["P11-valid_from-after-valid_until"]=x
x=copy.deepcopy(base); x["lifecycle"]={"state":"active","valid_until":"2000-01-01T00:00:00Z"}; probes["P11b-active-but-past-valid_until"]=x
x=copy.deepcopy(base); x["assertion_relations"]=[{"relation":"supersedes","assertion_ref":"assertion:j"},{"relation":"conflicts_with","assertion_ref":"assertion:j"},{"relation":"supports","assertion_ref":"assertion:j"}]; probes["P12-supersedes-conflicts-supports-same-target"]=x
x=copy.deepcopy(base); x["relationship_scope"]["scope_type"]="x-acme:secret-circle"; probes["P13-unknown-namespaced-scope_type"]=x
x=copy.deepcopy(base); x["relationship_scope"]["scope_type"]="provider_defined"; x["relationship_scope"]["participants"]=[a("A"),a("B"),a("C"),a("D")]; probes["P13b-provider_defined-scope"]=x
x=copy.deepcopy(base); x["provenance"]["derivation"]["dependencies"].append({"dependency_ref":"assertion:k","dependency_type":"assertion","role":"supports","material":True}); x["provenance"]["derivation"]["support_sets"]=[["assertion:k"]]; probes["P21-self-supporting-assertion-cycle"]=x
x=copy.deepcopy(base); x["provenance"]={"mode":"evidence","visibility":"full","evidence":[ev("evidence:E",[a("A"),a("B")]),ev("evidence:E",[a("A"),a("B")])]}; x["policy_refs"]=[]; probes["P20-duplicate-evidence_ref-identical"]=x
x=copy.deepcopy(base); x["provenance"]["visibility"]="hidden"; x["provenance"]["mode"]="evidence"; x["provenance"]["evidence"]=[ev("evidence:E",[a("A"),a("B")])]; probes["P22-evidence-mode-with-derivation"]=x
x=copy.deepcopy(base); x["extensions"]={"x-acme:override-scope":{"participants":["A","Z"]}}; probes["P23-unrequired-extension-that-alters-meaning"]=x
x=copy.deepcopy(base); x["provenance"]["derivation"]["dependencies"]=[{"dependency_ref":"evidence:A","dependency_type":"evidence","role":"supports","material":False}]; del x["provenance"]["derivation"]["support_sets"]; x["policy_refs"]=[]; probes["P24-derived-with-zero-material-deps"]=x
x=copy.deepcopy(base); x["created_at"]="2026-13-45T99:00:00Z"; probes["P25-bad-date"]=x
res={}
for k,v in probes.items():
    req={"contract_version":"rcp-v0.2-cleanroom-1","operation":"evaluate_context_assertion","supported_extensions":[],"assertion":v}
    r=json.loads(subprocess.run([P,ADP],input=json.dumps(req),capture_output=True,text=True).stdout)
    res[k]=r
    print(f"{k:55s} accepted={r['accepted']} {'' if r['accepted'] else r['errors'][:2]}")
    if k.startswith("P3"): print("   digest support_sets:", r["semantic_digest"]["support_sets"] if r["semantic_digest"] else None)
(OUT/"probes.json").write_text(json.dumps(probes,indent=1)); (OUT/"probe-results.json").write_text(json.dumps(res,indent=1))
