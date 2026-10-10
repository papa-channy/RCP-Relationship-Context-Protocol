"""Mutation testing of run_wire.semantic_errors against wire-cases + external public cases.
Copies run_wire.py into scratch, disables one errors.append at a time."""
import importlib.util, json, sys, re
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
WT = Path(sys.argv[1]); OUT = Path(sys.argv[2])
src = (WT/"conformance/v0_2/run_wire.py").read_text().splitlines(keepends=True)
schema = json.loads((WT/"spec/schemas/v0.2-draft/context-assertion.schema.json").read_text())
V = Draft202012Validator(schema, format_checker=FormatChecker())
wire = json.loads((WT/"conformance/v0_2/wire-cases.json").read_text())
pub = json.loads((WT/"conformance/external/v0_2/cases/public.json").read_text())
extra = json.loads(Path(sys.argv[3]).read_text()) if len(sys.argv)>3 else {"cases":[]}
# find semantic_errors range
start = next(i for i,l in enumerate(src) if l.startswith("def semantic_errors"))
end = next(i for i,l in enumerate(src) if l.startswith("def normalize_assertion"))
targets = [i for i in range(start,end) if "errors.append(" in src[i]]
def load(lines, name):
    p = OUT/f"{name}.py"; p.write_text("".join(lines))
    s = importlib.util.spec_from_file_location(name, p); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
def run(mod):
    fails = []
    for c in wire["schema_cases"]:
        inst=c["instance"]
        if list(V.iter_errors(inst)): continue
        ok = not mod.semantic_errors(inst, set(c.get("supported_extensions",[])))
        if ok != c["expected_semantic_valid"]: fails.append("wire:"+c["id"])
    for pack,tag in ((pub,"pub"),(extra,"extra")):
        for c in pack["cases"]:
            inst=c["assertion"]
            ok = not list(V.iter_errors(inst)) and not mod.semantic_errors(inst,set(c.get("supported_extensions",[])))
            if ok != c["expected"]["accepted"]: fails.append(f"{tag}:"+c["id"])
    return fails
base = load(src,"base"); print("baseline fails:", run(base))
for n,i in enumerate(targets):
    lines = list(src); lines[i] = lines[i].replace("errors.append(", "(lambda *a: None)(",1)
    m = load(lines, f"mut{n}")
    f = run(m)
    # get message snippet
    msg = "".join(src[i:i+3]).strip().replace("\n"," ")[:90]
    print(f"L{i+1:3d} killed_by={len(f):2d} {'SURVIVES' if not f else ''} | {msg} | {f}")
