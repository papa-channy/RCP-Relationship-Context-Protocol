import json,subprocess,copy,sys,importlib.util
W='.'
sys.path.insert(0,'conformance/v0_2')
d=json.load(open('conformance/v0_2/wire-cases.json'))
get=lambda i:[c for c in d['schema_cases'] if c['id']==i][0]['instance']
def run(a, ext=()):
    req={"contract_version":"rcp-v0.2-cleanroom-1","operation":"evaluate_context_assertion","assertion":a,"supported_extensions":list(ext)}
    r=subprocess.run(['.venv/bin/python','conformance/external/v0_2/reference_adapter.py'],input=json.dumps(req),capture_output=True,text=True)
    o=json.loads(r.stdout); return o['accepted'],o['errors']
base=get('derived-independent-support')
def der(mode):
    a=copy.deepcopy(base); a['provenance']['mode']=mode
    if mode in('opaque','unavailable'): a['provenance']['visibility']='opaque'
    a['policy_refs']=[]; a['provenance']['derivation']['support_sets']=[["evidence:UNKNOWN"]]
    return a
for m in ['derived','opaque','unavailable']:
    print('P7',m,run(der(m)))
# P8 evidence mode with derivation? (run_wire:73 forbids)
a=copy.deepcopy(base); a['provenance']['mode']='evidence'; print('evidence+deriv',run(a))
# P8: evidence mode + identity dep ref not materialized
a=copy.deepcopy(get('explicit-bilateral-projection')); a['relationship_scope']['identity_dependency_refs']=['identity:x']; print('P8',run(a))
# P2 projection source {A,C} target {A,B}
a=copy.deepcopy(get('explicit-bilateral-projection'))
a['provenance']['evidence'][0]['source_participants']=[x for x in a['provenance']['evidence'][0]['source_participants'] if x['actor_id'] in('A','C')]
print('P2',run(a))
spec=importlib.util.spec_from_file_location('r','conformance/v0_2/run.py'); r=importlib.util.module_from_spec(spec); spec.loader.exec_module(r)
print('proj',r.projection_allowed({"source_participants":["A","C"],"target_participants":["A","B"],"explicit_projection_basis":True}))
# P21
a=copy.deepcopy(base); a['assertion_id']='assertion:k'
a['provenance']['derivation']['dependencies'].append({"dependency_ref":"assertion:k","dependency_type":"assertion","role":"supports","material":True})
a['provenance']['derivation']['support_sets']=[["assertion:k"]]
print('P21',run(a))
print(r.dependency_invalidation_result({"all_sources":["A","B","assertion:k"],"support_sets":[["A"],["B"],["assertion:k"]],"removed_sources":["A","B"]}))
# P11
for vf,vu,st in [("2027-01-01T00:00:00Z","2020-01-01T00:00:00Z","active"),(None,"2000-01-01T00:00:00Z","active")]:
    a=copy.deepcopy(get('explicit-bilateral-projection')); l={"state":st}
    if vf:l['valid_from']=vf
    l['valid_until']=vu; a['lifecycle']=l; print('P11',run(a))
a=copy.deepcopy(get('explicit-bilateral-projection')); a['lifecycle']={"state":"superseded"}; print('superseded no rel',run(a))
# mutual supersession semantic_errors
for i,j in [('j','k'),('k','j')]:
    a=copy.deepcopy(get('conflict-relation-preserved')); a['assertion_id']='assertion:'+i; a['assertion_relations']=[{"relation":"supersedes","assertion_ref":'assertion:'+j}]; print('mutual',i,run(a))
from collections import Counter
c=Counter(x['instance']['lifecycle']['state'] for x in d['schema_cases'] if 'lifecycle' in x['instance']); print(c)
