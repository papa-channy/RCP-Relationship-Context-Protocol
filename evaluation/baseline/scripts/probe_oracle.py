# Usage: run from a worktree root at the target commit, inside the venv. Feeds crafted
# edge-case assertions to the v0.2 reference oracle (schema + semantic_errors).
import json, copy, sys
sys.path.insert(0,'conformance/v0_2')
from run_wire import semantic_errors, load_json, SCHEMA_PATH
from jsonschema import Draft202012Validator, FormatChecker
V=Draft202012Validator(load_json(SCHEMA_PATH), format_checker=FormatChecker())
cases={c['id']:c for c in json.load(open('conformance/v0_2/wire-cases.json'))['schema_cases']}
def ev(i): 
    se=[e.message for e in V.iter_errors(i)]
    return ('SCHEMA-REJECT',se[:1]) if se else (('ACCEPT',[]) if not semantic_errors(i,set()) else ('SEM-REJECT',semantic_errors(i,set())))
base=cases['bilateral-source-statement']['instance']
der=cases['derived-independent-support']['instance']
P={}
x=copy.deepcopy(base); x['provenance']['evidence'][0]['policy_refs']=['policy:confidential']; x['policy_refs']=[]
P['P1 evidence restriction dropped at assertion level']=x
x=copy.deepcopy(der); x['provenance']['derivation']['dependencies'].append({'dependency_ref':x['assertion_id'],'dependency_type':'assertion','role':'supports','material':True}); x['provenance']['derivation']['support_sets'].append([x['assertion_id']])
P['P2 assertion supports itself via dependency']=x
x=copy.deepcopy(der); x['epistemic_class']='verified_fact'; x['provenance']['derivation']['dependencies'].append({'dependency_ref':'policy:p1','dependency_type':'policy','role':'derived_from','material':True}); x['policy_refs']=x.get('policy_refs',[])+['policy:p1']; x['verification_basis_refs']=['policy:p1']
P['P3 verified_fact whose basis is a policy ref']=x
x=copy.deepcopy(der); x['epistemic_class']='verified_fact'; x['provenance']['derivation']['dependencies'].append({'dependency_ref':'evidence:Z','dependency_type':'evidence','role':'refines','material':False}); x['verification_basis_refs']=['evidence:Z']
P['P4 verified_fact basis = non-material refines dep']=x
x=copy.deepcopy(base); x['lifecycle']={'state':'active','valid_from':'2027-01-01T00:00:00Z','valid_until':'2026-01-01T00:00:00Z'}
P['P5 valid_until before valid_from']=x
x=copy.deepcopy(base); x['lifecycle']={'state':'superseded'}
P['P6 superseded with no superseding relation/reason']=x
x=copy.deepcopy(base); p=x['relationship_scope']['participants']; p[1]=dict(p[0]); p[1]['actor_type']='agent'
for e in x['provenance']['evidence']: e['source_participants']=copy.deepcopy(p)
P['P7 bilateral = same actor id twice with different actor_type']=x
x=copy.deepcopy(der); deps=x['provenance']['derivation']['dependencies']; x['provenance']['derivation']['support_sets']=[x['provenance']['derivation']['support_sets'][0]]
P['P8 material support dep omitted from all support_sets']=x
x=copy.deepcopy(base); x['provenance']={'mode':'opaque','visibility':'opaque','derivation':der['provenance']['derivation']}
P['P9 opaque mode still carrying derivation']=x
x=copy.deepcopy(base); x['relationship_scope']['scope_type']='provider_defined'
P['P10 provider_defined scope_type (unknown semantics) accepted']=x
x=copy.deepcopy(base); x['relationship_scope']['scope_type']='x-acme:secret-scope'
P['P11 unrequired extension scope_type alters core meaning']=x
x=copy.deepcopy(base); x['relationship_scope']['trust_domain']='tenant:t2'
P['P12 trust_domain differs from all participant scopes']=x
x=copy.deepcopy(base); x['assertion_relations']=[{'relation':'supersedes','assertion_ref':'assertion:x'},{'relation':'conflicts_with','assertion_ref':'assertion:x'}]
P['P13 supersedes AND conflicts_with same target']=x
for k,v in P.items(): print(f"{ev(v)[0]:14} {k}  {ev(v)[1][:1]}")
