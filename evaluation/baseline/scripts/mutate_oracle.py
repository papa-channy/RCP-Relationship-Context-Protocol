"""Disable each rule in conformance/v0_2/run_wire.py:semantic_errors one at a time and
report whether the wire suite or the external clean-room public pack notices.
Run from the root of a worktree checked out at the target commit, inside a venv
with conformance/requirements.txt installed. Restores the file afterwards."""
import re, subprocess
P='conformance/v0_2/run_wire.py'; src=open(P).read(); lines=src.split('\n')
targets=[i for i,l in enumerate(lines) if 'errors.append(' in l and i<152]
H=['python','conformance/external/v0_2/harness.py','--cmd','python conformance/external/v0_2/reference_adapter.py',
   '--implementation-name','m','--implementation-version','0','--language','py','--rcp-revision','x','--report','/tmp/m.json']
killed=0
try:
    for i in targets:
        m=lines.copy(); m[i]=m[i].replace('errors.append(','(lambda *a: None)(')
        open(P,'w').write('\n'.join(m))
        a=subprocess.run(['python',P],capture_output=True).returncode
        b=subprocess.run(H,capture_output=True).returncode
        killed+=bool(a or b)
        print(i+1,'wire' if a else '----','ext' if b else '---','KILLED' if (a or b) else 'SURVIVED',lines[i].strip()[:90])
finally:
    open(P,'w').write(src)
print(f'killed {killed}/{len(targets)}')
