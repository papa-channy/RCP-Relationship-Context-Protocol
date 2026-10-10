import json, sys, itertools, random
sys.path.insert(0,'conformance/v0_2')
import run
d=run.load_cases()
# --- ATMS/PROV profile: PROV graph (used / specializationOf) -> ATMS environments
def atms_eval(case):
    envs=[frozenset(s) for s in case['support_sets']]
    # minimal labels
    label=[e for e in envs if not any(o<e for o in envs)]
    removed=set(case['removed_sources'])
    allsrc=set(case['all_sources'])
    exists=any(not(e&removed) for e in label)
    if not (allsrc&removed): act='none'
    elif exists: act='recompute'
    else: act='invalidate'
    return {"current_support_exists":exists,"action":act,"historical_lineage_preserved":True}
ok=0
for c in d['dependency_invalidation']:
    r=atms_eval(c); print(c['id'], r==c['expected']); ok+= r==c['expected']
# --- ODRL-style: derive permission with nextPolicy duty; conflict=prohibit fold
def odrl_fold(parents):
    # each parent policy: permission(purpose in P), prohibition(external) , prohibition(training), constraint(retention<=r)
    # conflict strategy "prohibit": any prohibition wins -> union of prohibitions; permissions intersect; constraints min
    purposes=set.intersection(*[set(p['allowed_purposes']) for p in parents])
    return dict(purposes=purposes, ext_prohibited=any(p['external_processing']=='deny' for p in parents),
                train_prohibited=any(p['training']=='deny' for p in parents), ret=min(p['retention_max_seconds'] for p in parents))
def odrl_valid(c):
    f=odrl_fold(c['parents']); ch=c['child']
    if c.get('declassification_basis'): return False
    if not set(ch['allowed_purposes'])<=f['purposes']: return False
    if f['ext_prohibited'] and ch['external_processing']!='deny': return False
    if f['train_prohibited'] and ch['training']!='deny': return False
    return ch['retention_max_seconds']<=f['ret']
for c in d['policy_projection']:
    r=odrl_valid(c); print(c['id'], r==c['expected_valid']); ok+= r==c['expected_valid']
# --- AuthZEN: independent evaluation
def authzen(c): return c['source_access']=='allow' and c['source_state']=='active'
for c in d['source_access']:
    r=authzen(c); print(c['id'], r==c['expected_source_access']); ok+= r==c['expected_source_access']
print('matched',ok,'of 9')
