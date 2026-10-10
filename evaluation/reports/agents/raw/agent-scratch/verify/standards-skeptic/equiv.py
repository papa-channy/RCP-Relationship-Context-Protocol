import random,itertools,sys
sys.path.insert(0,'conformance/v0_2')
import run
random.seed(1)
U=[f"e{i}" for i in range(6)]
def poly_eval(ss,removed): # boolean semiring: var=0 if removed
    return any(all(v not in removed for v in s) for s in ss)
def atms_label(ss): # minimal environments
    envs=[frozenset(s) for s in ss]
    return [e for e in envs if not any(o<e for o in envs)]
n=0;mm=0
for _ in range(3000):
    ss=[random.sample(U,random.randint(1,3)) for _ in range(random.randint(1,4))]
    allsrc=sorted(set(itertools.chain(*ss)))
    lab=atms_label(ss)
    for _ in range(16):
        rem=set(random.sample(U,random.randint(0,4)))
        r=run.dependency_invalidation_result({"all_sources":allsrc,"removed_sources":sorted(rem),"support_sets":ss})["current_support_exists"]
        a=poly_eval(ss,rem); b=any(not(e&rem) for e in lab)
        n+=1; mm+= not (r==a==b)
print(n,mm)
