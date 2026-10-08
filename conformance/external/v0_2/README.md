# RCP v0.2 External Clean-Room Harness

> **Status:** non-normative external-validation tooling for `0.2-draft`.
>
> A passing run is evidence for the tested semantic surface only. It is not production certification, security review, or a stable-v0.2 claim.

## Purpose

This directory provides a black-box boundary for implementations developed from the v0.2 specification without importing the RCP authors' semantic implementation.

The harness tests a semantic object, not an RCP-operated Provider topology.

## Files

- [`CONTRACT.md`](./CONTRACT.md) — stdin/stdout adapter contract;
- [`cases/public.json`](./cases/public.json) — public reproducible case pack;
- [`harness.py`](./harness.py) — black-box evaluator/report generator;
- [`reference_adapter.py`](./reference_adapter.py) — **CI self-test only**, reuses the author-written oracle and therefore is explicitly not clean-room evidence.

Implementers should start with [`../../../docs/IMPLEMENTER_GUIDE_V0_2.md`](../../../docs/IMPLEMENTER_GUIDE_V0_2.md).

## External implementation command

An external implementation exposes a small adapter implementing `CONTRACT.md` and can be tested with:

```bash
python conformance/external/v0_2/harness.py \
  --cmd '/path/to/your-adapter' \
  --implementation-name 'my-rcp-v02-impl' \
  --implementation-version '0.1.0' \
  --language 'Rust 1.xx' \
  --rcp-revision '<exact-RCP-commit>' \
  --report ./rcp-v02-report.json
```

The adapter command may be a compiled binary or a command such as:

```text
python /path/to/adapter.py
node /path/to/adapter.mjs
cargo run --quiet --manifest-path /path/to/Cargo.toml --
```

Quote the whole command as one `--cmd` argument when it contains spaces.

## Public cases

`cases/public.json` covers representative positive and negative behavior including:

- basic bilateral evidence;
- explicit and silent group-to-bilateral projection;
- material evidence/identity/policy dependencies;
- independently sufficient support paths;
- verification basis resolution;
- fail-closed unknown scope;
- required-extension support;
- removed `confidence` field rejection;
- removed epistemic-duplicate `assertion_type` rejection;
- self-conflict rejection;
- namespaced provider evidence categories.

The public pack exists so implementations are reproducible and debuggable.

## Held-out cases

The same harness accepts another case-pack file:

```bash
python conformance/external/v0_2/harness.py \
  --cmd '/path/to/adapter' \
  --cases /path/to/held-out-cases.json \
  --implementation-name 'my-rcp-v02-impl' \
  --rcp-revision '<exact-RCP-commit>' \
  --report ./held-out-report.json
```

Independent reviewers SHOULD use additional held-out cases based on the published spec. Case IDs are not sent to the adapter, which reduces—but does not eliminate—the usefulness of hard-coded fixture lookup.

## CI self-test

The repository self-tests only the **harness plumbing** with the author-written reference adapter:

```bash
python conformance/external/v0_2/harness.py \
  --cmd "python conformance/external/v0_2/reference_adapter.py" \
  --implementation-name rcp-reference-adapter \
  --implementation-version 0.2-draft \
  --language "Python 3.12" \
  --rcp-revision repository-self-test \
  --report conformance/external/v0_2/out/self-test-report.json
```

This run MUST NOT be described as:

- an unrelated implementation;
- external interoperability;
- clean-room evidence;
- independent review.

`reference_adapter.py` deliberately imports/reuses the project semantic oracle, which is exactly what external implementations are prohibited from doing.

## Independence guard

The black-box `harness.py` itself must remain independent of reference semantic functions. It may know test inputs and expected outcomes, but it must not import:

- `conformance/v0_2/run.py`;
- `conformance/v0_2/run_wire.py`;
- `conformance/v0_2/normalize_wire.py`.

Only `reference_adapter.py` may use author-written oracle code for repository self-test.

## Report semantics

The generated JSON report records:

- implementation identity;
- RCP revision;
- case pack;
- per-case pass/fail;
- expected and actual acceptance;
- digest differences when accepted semantics disagree;
- aggregate totals.

Diagnostics returned by the implementation are retained when useful but are not required to match reference wording.

## What passes mean

A passing public report means only:

> this implementation produced the expected black-box behavior for these published cases.

A stronger independent-interoperability claim requires:

1. unrelated implementation source/artifact;
2. clean-room declaration;
3. exact RCP revision;
4. reproducible public harness report;
5. preferably reviewer-controlled held-out cases;
6. ambiguity/deviation report;
7. review that implementation logic was not copied from prohibited RCP reference code.

Issue #19 remains open until an actual unrelated implementation supplies that evidence.