"""Standards-skeptic probes against RCP v0.2 wire validator (commit 68026af)."""
import json, sys, copy
from pathlib import Path
WT = Path("/private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/wt")
sys.path.insert(0, str(WT/"conformance/v0_2"))
import run_wire, run as sem
from jsonschema import Draft202012Validator, FormatChecker
schema = run_wire.load_json(run_wire.SCHEMA_PATH)
V = Draft202012Validator(schema, format_checker=FormatChecker())
cases = {c["id"]: c["instance"] for c in run_wire.load_json(run_wire.CASES_PATH)["schema_cases"]}

def act(i, s="tenant:t1", t="person"): return {"actor_id": i, "scope": s, "actor_type": t}
def check(name, inst, ext=()):
    se = [e.message for e in V.iter_errors(inst)]
    if se:
        print(f"[{name}] SCHEMA-REJECT: {se[:2]}"); return
    errs = run_wire.semantic_errors(inst, set(ext))
    print(f"[{name}] {'ACCEPTED' if not errs else 'SEMANTIC-REJECT: '+str(errs)}")

base_proj = cases["explicit-bilateral-projection"]
base_der = cases["derived-independent-support"]
base_ver = cases["verified-fact-with-explicit-basis"]

# P1 participant projection bypass via derived mode (no evidence embedded => no source_participants checked)
p = copy.deepcopy(base_der); p["assertion_id"]="assertion:p1"
p["statement"]="C's sensitive remark, recorded as A-B context"
check("P1 derived-mode bypasses projection check (group-derived -> bilateral, no basis)", p)
# P1b opaque provenance
p = copy.deepcopy(base_proj); p["provenance"]={"mode":"opaque","visibility":"opaque"}
check("P1b opaque provenance: no projection basis needed", p)

# P2 target expansion: source {A,B} -> target {A,B,D} with arbitrary basis string
p = copy.deepcopy(base_proj)
p["relationship_scope"]={"scope_type":"group","participants":[act("A"),act("B"),act("D")],"trust_domain":"tenant:t1"}
p["provenance"]["evidence"][0]["source_participants"]=[act("A"),act("B")]
p["provenance"]["evidence"][0]["projection_basis_ref"]="x"
check("P2 wire: scope EXPANSION {A,B}->{A,B,D} with basis 'x'", p)
print("    semantic-oracle projection_allowed same case:",
      sem.projection_allowed({"source_participants":["A","B"],"target_participants":["A","B","D"],"explicit_projection_basis":True}))

# P3 evidence-level restriction dropped from assertion
p = copy.deepcopy(base_proj); p["provenance"]["evidence"][0]["policy_refs"]=["policy:external-processing-deny"]; p["policy_refs"]=[]
check("P3 evidence policy_refs not carried to assertion policy_refs", p)

# P4 verified_fact whose basis is a policy dependency / its own unverified source statement
p = copy.deepcopy(base_der); p["epistemic_class"]="verified_fact"; p["verification_basis_refs"]=["policy:no-training"]
check("P4a verified_fact with basis = policy ref", p)
p = copy.deepcopy(base_ver)
p["provenance"]["evidence"][0]["representation"]="source_statement"; p["provenance"]["evidence"][0]["evidence_type"]="user_note"
check("P4b verified_fact with basis = its own source_statement evidence", p)

# P5 non-independent evidence: no way to say crm copy shares origin with gmail message
p = copy.deepcopy(base_der)
p["provenance"]["derivation"]["dependencies"][1]["had_primary_source"]="evidence:a"
check("P5 try to declare common origin on dependency", p)
print("    oracle: support_sets [[gmail:m1],[crm:m1-copy]], origin m1 deleted at gmail only ->",
      sem.dependency_invalidation_result({"all_sources":["gmail:m1","crm:m1-copy"],"support_sets":[["gmail:m1"],["crm:m1-copy"]],"removed_sources":["gmail:m1"]}))

# P6 one assertion spanning several relationships
p = copy.deepcopy(base_proj); p["relationship_scope"]=[p["relationship_scope"], {"scope_type":"bilateral","participants":[act("A"),act("C")],"trust_domain":"tenant:t1"}]
check("P6 relationship_scope as list of scopes", p)

# P7 per-party obligations
p = copy.deepcopy(base_der); p["obligations"]=[{"debtor":"A","action":"send deck"},{"debtor":"B","action":"review"}]
check("P7 structured per-party obligations (core field)", p)
p = copy.deepcopy(base_der); p["required_extensions"]=["x-odrl:duties"]; p["extensions"]={"x-odrl:duties":[{"assignee":"A"}]}
check("P7b obligations via required extension, consumer w/o support", p)

# P8 contradictory relations to same target
p = copy.deepcopy(base_proj); p["assertion_relations"]=[{"relation":"supersedes","assertion_ref":"assertion:x"},{"relation":"conflicts_with","assertion_ref":"assertion:x"},{"relation":"supports","assertion_ref":"assertion:x"}]
check("P8 supersedes+conflicts_with+supports same target", p)

# P9 scope_type values without defined semantics; trust_domain unrelated to actor scopes
p = copy.deepcopy(base_proj); p["relationship_scope"]["scope_type"]="provider_defined"
check("P9a scope_type=provider_defined", p)
p = copy.deepcopy(base_ver)
p["relationship_scope"]={"scope_type":"bilateral","participants":[act("A","tenant:t1"),act("B","tenant:t2")],"trust_domain":"tenant:t3"}
p["provenance"]["evidence"][0]["source_participants"]=[act("A","tenant:t1"),act("B","tenant:t2")]
check("P9b cross-tenant participants, trust_domain=tenant:t3", p)

# P10 participants changing over time: per-participant validity not representable
p = copy.deepcopy(base_proj); p["relationship_scope"]["participants"][1]["valid_until"]="2026-01-01T00:00:00Z"
check("P10 per-participant membership interval", p)

# P11 uncertain-but-not-conflicting: relation 'weakens'/'qualifies' not available
p = copy.deepcopy(base_proj); p["assertion_relations"]=[{"relation":"qualifies","assertion_ref":"assertion:x"}]
check("P11 relation 'qualifies' (uncertain, non-conflicting)", p)

# P12 partial supersession: no part/field selector
p = copy.deepcopy(base_proj); p["assertion_relations"]=[{"relation":"supersedes","assertion_ref":"assertion:x","part":"date"}]
check("P12 partial supersession selector", p)

# P13 actor_type is part of identity equality
p = copy.deepcopy(base_ver); p["provenance"]["evidence"][0]["source_participants"][1]["actor_type"]="unknown"
check("P13 same actor B typed 'unknown' in evidence vs 'person' in target", p)
