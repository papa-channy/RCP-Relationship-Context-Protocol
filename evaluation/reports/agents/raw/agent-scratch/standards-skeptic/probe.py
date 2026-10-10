import json, sys, copy
WT = "/private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/wt"
sys.path.insert(0, WT + "/conformance/v0_2")
from run_wire import semantic_errors, load_json, SCHEMA_PATH, CASES_PATH
import run as sem
from jsonschema import Draft202012Validator, FormatChecker
V = Draft202012Validator(load_json(SCHEMA_PATH), format_checker=FormatChecker())
cases = {c["id"]: c["instance"] for c in load_json(CASES_PATH)["schema_cases"]}
DER = cases["derived-independent-support"]
EVI = cases["explicit-bilateral-projection"]
def P(a, s="tenant:t1", t="person"): return {"actor_id": a, "scope": s, "actor_type": t}
def check(name, inst, ext=()):
    se = [e.message[:110] for e in V.iter_errors(inst)]
    if se:
        print(f"[{name}] SCHEMA-INVALID: {se[:2]}"); return
    errs = semantic_errors(inst, set(ext))
    print(f"[{name}] {'ACCEPTED' if not errs else 'REJECTED ' + str(errs)}")

# P1 derived mode hides group source participants -> bilateral target, no basis
i = copy.deepcopy(DER); i["relationship_scope"].pop("identity_dependency_refs")
i["provenance"]["derivation"]["dependencies"] = [
  {"dependency_ref": "evidence:group-thread-ABC", "dependency_type": "evidence", "role": "supports", "material": True}]
i["provenance"]["derivation"]["support_sets"] = [["evidence:group-thread-ABC"]]
i["policy_refs"] = []
check("P1 derived-mode, group evidence not declared, bilateral target", i)
# P1b same but declaring evidence with ABC participants and no basis -> should be rejected
j = copy.deepcopy(i); j["provenance"]["evidence"] = [{"evidence_ref": "evidence:group-thread-ABC", "evidence_type": "interaction", "representation": "opaque_ref", "source_participants": [P("A"), P("B"), P("C")]}]
check("P1b derived-mode, group evidence declared, no basis", j)

# P2 evidence mode with two items: sufficiency cannot be stated
i = copy.deepcopy(EVI)
e2 = copy.deepcopy(i["provenance"]["evidence"][0]); e2["evidence_ref"] = "evidence:other"
i["provenance"]["evidence"].append(e2)
check("P2 evidence-mode two items, no support_sets possible", i)
k = copy.deepcopy(i); k["provenance"]["derivation"] = {"dependencies": [{"dependency_ref": "evidence:other", "dependency_type": "evidence", "role": "supports", "material": True}], "support_sets": [["evidence:other"]]}
check("P2b evidence-mode + derivation/support_sets", k)

# P3 evidence-level policy_refs not inherited by assertion
i = copy.deepcopy(EVI); i["provenance"]["evidence"][0]["policy_refs"] = ["policy:no-training", "policy:no-external-processing"]
i.pop("policy_refs", None)
check("P3 evidence policy_refs dropped at assertion level", i)
# P3b derived: evidence with policy refs, no policy dependency declared
i = copy.deepcopy(DER); i["provenance"]["evidence"] = [{"evidence_ref": "evidence:a", "evidence_type": "interaction", "representation": "opaque_ref", "source_participants": [P("A"), P("B")], "policy_refs": ["policy:no-external-processing"]}]
check("P3b derived: evidence policy_ref not carried to policy_refs", i)

# P4 non-independent evidence (CRM copy of the same email) declared as independent support
i = copy.deepcopy(DER); i["relationship_scope"].pop("identity_dependency_refs")
i["provenance"]["derivation"]["dependencies"] = [
 {"dependency_ref": "mail:msg-1", "dependency_type": "evidence", "role": "supports", "material": True},
 {"dependency_ref": "crm:activity-7-synced-from-mail-msg-1", "dependency_type": "evidence", "role": "corroborates", "material": True}]
i["provenance"]["derivation"]["support_sets"] = [["mail:msg-1"], ["crm:activity-7-synced-from-mail-msg-1"]]
i["policy_refs"] = []
check("P4 same-origin evidence as independent support", i)
print("   oracle after user deletes mail:msg-1 ->", sem.dependency_invalidation_result({"all_sources": ["mail:msg-1", "crm:activity-7-synced-from-mail-msg-1"], "support_sets": [["mail:msg-1"], ["crm:activity-7-synced-from-mail-msg-1"]], "removed_sources": ["mail:msg-1"]}))

# P5 per-party obligation roles
i = copy.deepcopy(EVI); i["relationship_scope"]["participants"][0]["role"] = "obligor"
check("P5 participant role (obligor/obligee)", i)
# P6 participant temporal validity
i = copy.deepcopy(EVI); i["relationship_scope"]["participants"][0]["valid_from"] = "2026-01-01T00:00:00Z"
check("P6 participant valid_from", i)
# P7 one assertion spanning several relationships
i = copy.deepcopy(EVI); i["relationship_scope"] = [i["relationship_scope"], copy.deepcopy(i["relationship_scope"])]
check("P7 relationship_scope as array", i)
# P8 partial supersession
i = copy.deepcopy(EVI); i["assertion_relations"] = [{"relation": "supersedes", "assertion_ref": "assertion:old", "fields": ["due_date"]}]
check("P8 partial supersedes", i)
# P9 namespaced scope_type not required -> silently accepted (not fail-closed)
i = copy.deepcopy(EVI); i["relationship_scope"]["scope_type"] = "x-acme:delegated-team"
check("P9 unknown namespaced scope_type without required_extensions", i)
i["relationship_scope"]["scope_type"] = "provider_defined"
check("P9b provider_defined scope_type", i)
# P10 trust_domain inconsistent with participants' scope
i = copy.deepcopy(EVI); i["relationship_scope"]["trust_domain"] = "tenant:t9"
check("P10 trust_domain mismatches every participant scope", i)
# P11 target not subset of source, but basis present (oracle rejects this case)
i = copy.deepcopy(EVI); i["relationship_scope"]["participants"][1] = P("D")
check("P11 wire: target {A,D} from source {A,B,C} with basis", i)
print("   abstract oracle same situation ->", sem.projection_allowed({"source_participants": ["A","B","C"], "target_participants": ["A","D"], "explicit_projection_basis": "basis:x"}))
# P12 contradictory mode/visibility
i = copy.deepcopy(EVI); i["provenance"]["visibility"] = "hidden"
check("P12 mode=evidence + visibility=hidden while evidence fully listed", i)
i = copy.deepcopy(DER); i["provenance"]["mode"] = "opaque"; i["provenance"]["visibility"] = "full"
check("P12b mode=opaque + visibility=full + full derivation", i)
# P13 graded uncertainty via required extension -> whole assertion rejected by non-supporting consumer
i = copy.deepcopy(EVI); i["required_extensions"] = ["x-example:confidence-model"]; i["extensions"] = {"x-example:confidence-model": {"score": 0.6}}
check("P13 uncertainty as required extension, consumer unaware", i)
# P14 two-member group conversation
i = copy.deepcopy(EVI); i["relationship_scope"]["scope_type"] = "group"; i["provenance"]["evidence"][0]["source_participants"] = [P("A"), P("B")]; i["provenance"]["evidence"][0].pop("projection_basis_ref")
check("P14 group scope with 2 members", i)
# P15 provider granularity: org-level source participant, person-level target
i = copy.deepcopy(EVI); i["provenance"]["evidence"][0]["source_participants"] = [P("A"), P("acme", "crm:acme", "organization")]; i["provenance"]["evidence"][0].pop("projection_basis_ref")
check("P15 org-granular source vs person target, no basis", i)
# P16 supersedes and conflicts_with the same assertion simultaneously
i = copy.deepcopy(EVI); i["assertion_relations"] = [{"relation": "supersedes", "assertion_ref": "assertion:x"}, {"relation": "conflicts_with", "assertion_ref": "assertion:x"}, {"relation": "supports", "assertion_ref": "assertion:x"}]
check("P16 supersedes+conflicts_with+supports same target", i)
