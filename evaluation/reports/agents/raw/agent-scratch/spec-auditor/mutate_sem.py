import importlib.util, sys, io, contextlib
from pathlib import Path
WT=Path(sys.argv[1]); OUT=Path(sys.argv[2])
src=(WT/"conformance/v0_2/run.py").read_text()
src=src.replace('HERE = Path(__file__).resolve().parent', f'HERE = Path({str(WT/"conformance/v0_2")!r})')
M = {
 "proj: drop subset check": ("if not target or not target.issubset(source):\n        return False", "if not target:\n        return False"),
 "proj: drop basis requirement": ("return bool(case.get(\"explicit_projection_basis\"))", "return True"),
 "rel: conflicts makes left non-current": ("return {\"relation\": relation, \"left_current\": True, \"right_current\": True}\n    # Wall", "return {\"relation\": relation, \"left_current\": False, \"right_current\": True}\n    # Wall"),
 "dep: material_removed ignores all_sources (always True)": ("material_removed = bool(all_sources & removed)", "material_removed = True"),
 "dep: surviving_support any->all": ("surviving_support = any(", "surviving_support = all("),
 "dep: historical lineage False": ("\"historical_lineage_preserved\": True,", "\"historical_lineage_preserved\": False,"),
 "pol: purpose union": ("set.intersection(*purpose_sets)", "set.union(*purpose_sets)"),
 "pol: ext deny via all": ("\"deny\" if any(parent[\"external_processing\"] == \"deny\"", "\"deny\" if all(parent[\"external_processing\"] == \"deny\""),
 "pol: training deny via all": ("\"deny\" if any(parent[\"training\"] == \"deny\"", "\"deny\" if all(parent[\"training\"] == \"deny\""),
 "pol: retention max": ("min(parent[\"retention_max_seconds\"]", "max(parent[\"retention_max_seconds\"]"),
 "pol: declassification bool loosens": ("if case.get(\"declassification_basis\") and not declassification_profile:\n        return False", "if case.get(\"declassification_basis\"):\n        return True"),
 "pol: drop external check": ("if effective[\"external_processing\"] == \"deny\" and child[\"external_processing\"] != \"deny\":\n        return False", "pass"),
 "pol: drop training check": ("if effective[\"training\"] == \"deny\" and child[\"training\"] != \"deny\":\n        return False", "pass"),
 "pol: drop retention check": ("if child[\"retention_max_seconds\"] > effective[\"retention_max_seconds\"]:\n        return False", "pass"),
 "pol: drop purpose check": ("if not set(child[\"allowed_purposes\"]).issubset(effective[\"allowed_purposes\"]):\n        return False", "pass"),
 "epi: extracted_fact always allowed": ("return bool(case.get(\"direct_extraction_basis\"))", "return True"),
 "epi: verified from all-verified needs basis": ("if all(source == \"verified_fact\" for source in sources):\n            return True\n        return bool(case.get(\"verification_basis\"))", "return bool(case.get(\"verification_basis\"))"),
 "acc: ignore revoked": ("return case.get(\"source_access\") == \"allow\" and case.get(\"source_state\") == \"active\"", "return case.get(\"source_access\") == \"allow\""),
 "id: ignore before/after": ("return case.get(\"before_state\") != case.get(\"after_state\")", "return True"),
 "comp: allow id reuse": ("if derived.get(\"id\") in source_ids:\n        return False", "pass"),
 "comp: ignore addressable": ("if not case.get(\"sources_remain_addressable\"):\n        return False", "pass"),
 "comp: subset deps ok": ("if dependency_refs != source_ids:", "if not dependency_refs <= source_ids:"),
 "arr: later arrival supersedes": ("return bool(case.get(\"explicit_supersedes\"))", "return case['right_received_at'] > case['left_received_at']"),
 "bind: no list sorting": ("if key in {\"participants\", \"dependency_refs\", \"policy_refs\"}:", "if False:"),
}
for name,(a,b) in M.items():
    assert a in src, name
    s=src.replace(a,b,1); p=OUT/"semmut.py"; p.write_text(s)
    spec=importlib.util.spec_from_file_location("semmut",p); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    buf=io.StringIO()
    with contextlib.redirect_stdout(buf): rc=m.main()
    out=buf.getvalue().strip().splitlines()
    print(f"{'KILLED ' if rc else 'SURVIVES'} | {name} | {out[0] if out else ''} {'; '.join(l[2:60] for l in out[1:3])}")
