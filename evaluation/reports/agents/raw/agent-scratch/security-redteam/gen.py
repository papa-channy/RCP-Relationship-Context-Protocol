import json, copy, os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'attacks')
def act(i,s="tenant:t1",t="person"): return {"actor_id":i,"scope":s,"actor_type":t}
A,B,C=act("A"),act("B"),act("C")
def base(aid="assertion:x", parts=None, scope_type="bilateral", td="tenant:t1"):
    return {"type":"rcp.context_assertion","rcp_version":"0.2-draft","assertion_id":aid,
      "assertion_type":"commitment",
      "relationship_scope":{"scope_type":scope_type,"participants":parts or [A,B],"trust_domain":td},
      "epistemic_class":"system_interpretation","statement":"A and B have an open commitment.",
      "provenance":{"mode":"derived","visibility":"redacted","derivation":{"dependencies":[
         {"dependency_ref":"evidence:e1","dependency_type":"evidence","role":"supports","material":True}],
         "support_sets":[["evidence:e1"]]}},
      "lifecycle":{"state":"active"},"created_at":"2026-10-09T00:00:00Z"}
cases={}
# 1 participant collapse via derived mode (group evidence {A,B,C}, no evidence list, so projection check skipped)
a=base("assertion:collapse"); a["statement"]="A and B privately agreed to leave the company (source: group chat A,B,C)."
a["provenance"]["derivation"]["dependencies"][0]["dependency_ref"]="evidence:group-chat-ABC"
a["provenance"]["derivation"]["support_sets"]=[["evidence:group-chat-ABC"]]
cases["01-participant-collapse-derived-mode"]=a
# 1b control: same but via evidence mode WITHOUT basis -> expected rejected
b=base("assertion:collapse-ctrl"); b["provenance"]={"mode":"evidence","visibility":"full","evidence":[{"evidence_ref":"evidence:g","evidence_type":"interaction","representation":"metadata","source_participants":[A,B,C]}]}
cases["01b-control-collapse-evidence-mode-rejected"]=b
# 1c: derived mode + evidence list + bogus basis string
c=copy.deepcopy(a); c["assertion_id"]="assertion:collapse-bogus-basis"
c["provenance"]["evidence"]=[{"evidence_ref":"evidence:group-chat-ABC","evidence_type":"interaction","representation":"metadata","source_participants":[A,B,C],"projection_basis_ref":"basis:trust-me"}]
cases["01c-bogus-projection-basis-unresolved"]=c
# 2 scope widening: bilateral source {A,B} -> group target {A,B,C} with basis (abstract oracle requires target subset of source)
d=base("assertion:widen",parts=[A,B,C],scope_type="group"); d["provenance"]={"mode":"evidence","visibility":"full","evidence":[{"evidence_ref":"evidence:bilateral-ab","evidence_type":"interaction","representation":"metadata","source_participants":[A,B],"projection_basis_ref":"basis:x"}]}
d["statement"]="A, B and C are jointly committed."
cases["02-scope-widening-C-added"]=d
# 3 epistemic laundering variants
e=base("assertion:launder1"); e["epistemic_class"]="verified_fact"; e["statement"]="B is insolvent."
e["verification_basis_refs"]=["evidence:rumor"]
e["provenance"]={"mode":"evidence","visibility":"full","evidence":[{"evidence_ref":"evidence:rumor","evidence_type":"unknown","representation":"opaque_ref","source_participants":[A,B]}]}
cases["03a-verified-from-unknown-opaque-evidence"]=e
f=base("assertion:launder2"); f["epistemic_class"]="verified_fact"; f["statement"]="B committed fraud."
f["verification_basis_refs"]=["policy:p1"]
f["provenance"]["derivation"]["dependencies"].append({"dependency_ref":"policy:p1","dependency_type":"policy","role":"derived_from","material":False})
cases["03b-verified-basis-is-nonmaterial-policy-dep"]=f
g=base("assertion:launder3"); g["epistemic_class"]="verified_fact"; g["assertion_type"]="relationship_state"; g["statement"]="B is hostile to A."
g["verification_basis_refs"]=["assertion:weak-inference-7"]
g["provenance"]["derivation"]["dependencies"]=[{"dependency_ref":"assertion:weak-inference-7","dependency_type":"assertion","role":"derived_from","material":True}]
g["provenance"]["derivation"]["support_sets"]=[["assertion:weak-inference-7"]]
cases["03c-verified-from-unresolvable-system-inference-assertion"]=g
# 4 restriction laundering
h=base("assertion:policy-drop"); h["provenance"]={"mode":"evidence","visibility":"full","evidence":[{"evidence_ref":"evidence:e1","evidence_type":"interaction","representation":"source_statement","source_participants":[A,B],"policy_refs":["policy:no-external-processing","policy:no-training","policy:org-confidential"]}]}
cases["04a-evidence-policy-refs-dropped-from-assertion"]=h
i=base("assertion:policy-nonmaterial")
i["provenance"]["derivation"]["dependencies"].append({"dependency_ref":"policy:org-confidential","dependency_type":"policy","role":"derived_from","material":False})
cases["04b-policy-dependency-marked-nonmaterial"]=i
j=base("assertion:policy-swap"); j["policy_refs"]=["policy:allow-all"]
j["provenance"]["derivation"]["dependencies"].append({"dependency_ref":"policy:no-training","dependency_type":"policy","role":"derived_from","material":True})
j["policy_refs"]=["policy:no-training","policy:allow-all"]
cases["04c-policy-conflict-opaque-strings-accepted"]=j
# 5 circular / self-support
k=base("assertion:self"); k["provenance"]["derivation"]["dependencies"]=[{"dependency_ref":"assertion:self","dependency_type":"assertion","role":"supports","material":True}]
k["provenance"]["derivation"]["support_sets"]=[["assertion:self"]]
cases["05-self-supporting-assertion"]=k
# 6 cross-tenant
l=base("assertion:xtenant",parts=[act("alice","tenant:t1"),act("alice","tenant:t2")]); l["assertion_type"]="relationship_state"
l["statement"]="alice@t1 and alice@t2 are the same person who moonlights for a competitor."
cases["06a-cross-tenant-identity-correlation-no-binding"]=l
m=base("assertion:xtenant2",parts=[act("alice","tenant:t1"),act("bob","tenant:t2")],td="tenant:t3"); 
cases["06b-trust-domain-unrelated-to-participant-scopes"]=m
n=base("assertion:idref-ghost"); n["provenance"]={"mode":"opaque","visibility":"opaque"}; n["relationship_scope"]["identity_dependency_refs"]=["identity:ghost"]
cases["06c-identity-dependency-unchecked-outside-derived-mode"]=n
# 7 lifecycle
o=base("assertion:revoked-yet-full"); o["lifecycle"]={"state":"revoked"}; o["provenance"]={"mode":"evidence","visibility":"full","evidence":[{"evidence_ref":"evidence:e1","evidence_type":"interaction","representation":"source_statement","source_participants":[A,B]}]}
o["statement"]="B told A: <full sensitive text retained after revocation>"
cases["07a-revoked-assertion-retains-statement-and-full-provenance"]=o
p=base("assertion:expired-active"); p["lifecycle"]={"state":"active","valid_from":"2030-01-01T00:00:00Z","valid_until":"2020-01-01T00:00:00Z"}
cases["07b-active-with-inverted-validity-window"]=p
q=base("assertion:superseded-orphan"); q["lifecycle"]={"state":"superseded"}
cases["07c-superseded-without-any-supersedes-relation"]=q
r=base("assertion:active-vs-conflict"); r["assertion_relations"]=[{"relation":"supersedes","assertion_ref":"assertion:other"},{"relation":"conflicts_with","assertion_ref":"assertion:other"}]
cases["07d-supersedes-and-conflicts-same-target"]=r
# 8 provenance leakage via hidden visibility
s=base("assertion:hidden-but-leaky"); s["provenance"]["visibility"]="hidden"
s["provenance"]["evidence"]=[{"evidence_ref":"evidence:dm-with-C-about-layoffs","evidence_type":"interaction","representation":"source_statement","source_participants":[A,B,C],"projection_basis_ref":"basis:x","occurred_at":"2026-10-08T23:41:00Z"}]
s["provenance"]["derivation"]["dependencies"][0]["dependency_ref"]="evidence:dm-with-C-about-layoffs"
s["provenance"]["derivation"]["support_sets"]=[["evidence:dm-with-C-about-layoffs"]]
cases["08-visibility-hidden-yet-evidence-participants-and-time-exposed"]=s
# 9 misuse
t=base("assertion:score",parts=[act("B","tenant:t1"),act("scorer","tenant:t9","service")],td="tenant:t9"); t["assertion_type"]="x-broker:social-score"
t["epistemic_class"]="system_inference"; t["statement"]="B is a high churn risk, depressed, financially stressed; trust score 0.12."
t["provenance"]={"mode":"opaque","visibility":"hidden"}
t["extensions"]={"x-broker:profile":{"score":0.12,"segments":["financially_stressed","health_concern"],"resale":True}}
cases["09a-social-scoring-broker-profile-no-policy-no-purpose"]=t
u=base("assertion:xscope"); u["relationship_scope"]["scope_type"]="x-vendor:everyone-in-org"
u["relationship_scope"]["participants"]=[A,B]
cases["09b-extension-scope-type-not-required-extension"]=u
v=base("assertion:unknown-epi"); v["epistemic_class"]="unknown"; v["provenance"]={"mode":"unavailable","visibility":"hidden"}; v["statement"]="B is untrustworthy."
cases["09c-unknown-epistemic-opaque-unavailable-no-lineage"]=v
w=base("assertion:inf-from-derived"); w["provenance"]["visibility"]="hidden"
w["provenance"]["derivation"]["dependencies"]=[{"dependency_ref":"evidence:a-private-journal","dependency_type":"evidence","role":"supports","material":True},{"dependency_ref":"evidence:b-private-email","dependency_type":"evidence","role":"corroborates","material":True}]
w["provenance"]["derivation"]["support_sets"]=[["evidence:a-private-journal"],["evidence:b-private-email"]]
cases["10-derived-hidden-still-leaks-dependency-refs-and-support-structure"]=w
for k,v in cases.items():
    json.dump(v,open(f"{OUT}/{k}.json","w"),indent=1)
print(len(cases))
