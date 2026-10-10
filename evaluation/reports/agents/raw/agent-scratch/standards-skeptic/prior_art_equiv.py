"""Show RCP support_sets/invalidation == (a) positive-boolean provenance polynomial
(Green et al. PODS'07 semiring, why-provenance witness basis), (b) ATMS label check,
(c) a PROV-O qualified-derivation profile: one prov:Activity per sufficient group,
K supported iff some activity has no prov:used entity that wasInvalidatedBy."""
import itertools, random, sys
from pathlib import Path
WT = Path("/private/tmp/claude-501/-Users-chan-Developer-service-RCP-Relationship-Context-Protocol/4e25fc89-d154-4bd1-9a0a-2f1818f6059b/scratchpad/wt")
sys.path.insert(0, str(WT/"conformance/v0_2"))
import run as sem

def poly_eval(support_sets, removed):           # sum of products over B={0,1}
    val = lambda x: 0 if x in removed else 1
    return any(all(val(x) for x in mono) for mono in support_sets)

def atms_label_holds(support_sets, removed):     # label = set of environments
    return any(set(env).isdisjoint(removed) for env in support_sets)

def to_prov(k, support_sets):                    # triples
    t = []
    for i, grp in enumerate(support_sets):
        d, a = f"_:d{i}", f"_:act{i}"
        t += [(k,"prov:qualifiedDerivation",d),(d,"prov:hadActivity",a)]
        t += [(a,"prov:used",e) for e in grp]
        t += [(d,"prov:entity",e) for e in grp]
    return t
def prov_profile_holds(k, triples, removed):
    inval = {e for e in removed}                 # e prov:wasInvalidatedBy ...
    acts = {o for s,p,o in triples if p=="prov:hadActivity"}
    return any(all(o not in inval for s,p,o in triples if s==a and p=="prov:used") for a in acts)

random.seed(7); src = ["A","B","C","D"]; n=0; mism=0
for _ in range(3000):
    ss = [random.sample(src, random.randint(1,3)) for _ in range(random.randint(1,3))]
    all_s = sorted({x for g in ss for x in g})
    for r in range(0,len(src)+1):
        for removed in itertools.combinations(src, r):
            removed=set(removed)
            o = sem.dependency_invalidation_result({"all_sources":all_s,"support_sets":ss,"removed_sources":sorted(removed)})["current_support_exists"]
            a = poly_eval(ss,removed); b = atms_label_holds(ss,removed); c = prov_profile_holds("K",to_prov("K",ss),removed)
            n+=1; mism += not (o==a==b==c)
print(f"compared {n} (support_sets, removal) pairs; mismatches={mism}")
print("example PROV encoding of [[A],[B]]:", to_prov("K",[["A"],["B"]]))
