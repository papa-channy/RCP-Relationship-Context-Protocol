import re,subprocess,sys,os,json
WT=os.getcwd(); S=sys.argv[1]
src=open('conformance/v0_2/run_wire.py').read().split('\n')
idx=[i for i,l in enumerate(src) if 'errors.append(' in l]
ad=open('conformance/external/v0_2/reference_adapter.py').read()
for i in idx:
    m=list(src); m[i]=m[i].replace('errors.append(','(lambda *a:None)(')
    t='\n'.join(m).replace('ROOT = Path(__file__).resolve().parents[2]',f'ROOT = Path({WT!r})')
    open(f'{S}/run_wire_mut.py','w').write(t)
    a=ad.replace('RUN_WIRE_PATH = ROOT / "conformance" / "v0_2" / "run_wire.py"',f'RUN_WIRE_PATH = Path({S!r})/"run_wire_mut.py"').replace('ROOT = Path(__file__).resolve().parents[3]',f'ROOT = Path({WT!r})')
    open(f'{S}/adapter_mut.py','w').write(a)
    r1=subprocess.run(['.venv/bin/python',f'{S}/run_wire_mut.py'],capture_output=True,text=True)
    r2=subprocess.run(['.venv/bin/python','conformance/external/v0_2/harness.py','--cmd',f'{WT}/.venv/bin/python {S}/adapter_mut.py','--implementation-name','m','--report',f'{S}/rep.json'],capture_output=True,text=True)
    caught1=r1.returncode!=0; caught2=r2.returncode!=0
    print(i+1,'CAUGHT' if caught1 or caught2 else 'SURVIVED',caught1,caught2,src[i].strip()[:70])
