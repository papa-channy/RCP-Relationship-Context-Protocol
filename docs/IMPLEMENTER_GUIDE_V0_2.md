# RCP v0.2 Clean-Room Implementer Guide

> **Status:** external-validation guide for the non-normative `0.2-draft` semantic/wire surface.
>
> Passing this guide's harness does not make an implementation production-ready and does not freeze v0.2.

## 1. Purpose

This guide exists to test whether an unrelated implementer can independently reproduce RCP v0.2 relationship semantics from the specification, without importing or translating the project authors' semantic implementation.

The clean-room target is deliberately narrower than the old v0.1 Provider harness. It tests the **semantic object**, not an RCP-owned service topology.

## 2. Allowed inputs

A clean-room implementer MAY use only the following RCP materials as implementation inputs:

1. [`../spec/core-v0.2-draft.md`](../spec/core-v0.2-draft.md)
2. [`../spec/wire-v0.2-draft.md`](../spec/wire-v0.2-draft.md)
3. [`../spec/schemas/v0.2-draft/context-assertion.schema.json`](../spec/schemas/v0.2-draft/context-assertion.schema.json)
4. [`standards-boundary.md`](./standards-boundary.md)
5. [`standards-reconciliation-v0.2.md`](./standards-reconciliation-v0.2.md)
6. [`semantic-scenarios-v0.2.md`](./semantic-scenarios-v0.2.md)
7. this guide
8. [`../conformance/external/v0_2/CONTRACT.md`](../conformance/external/v0_2/CONTRACT.md)
9. public black-box case packs explicitly published under `conformance/external/v0_2/cases/`

General external standards referenced by those documents may of course be used directly.

## 3. Prohibited implementation inputs

For evidence to count as clean-room, the implementation MUST NOT import, copy, translate, or line-by-line reproduce implementation logic from:

- `conformance/v0_2/run.py`
- `conformance/v0_2/run_wire.py`
- `conformance/v0_2/normalize_wire.py`
- `bindings/v0_2/`
- `reference-ecosystem/`
- another RCP author-written semantic implementation

The external black-box harness may invoke the implementation, but the implementation itself must not depend on the reference oracle.

## 4. What to implement

At minimum, independently implement the applicable `ContextAssertion` behavior for:

- JSON/schema-compatible structural validation;
- bilateral/group scope cardinality;
- fail-closed unknown material relationship scope;
- source-participant vs target-participant projection rules;
- explicit `projection_basis_ref` when scope changes;
- `verified_fact` verification basis requirements;
- derived dependency/reference integrity;
- independently sufficient `support_sets`;
- material identity dependency preservation;
- material policy dependency preservation;
- assertion self-relation rejection;
- required-extension fail-closed behavior;
- stable semantic interpretation independent of transport framing.

You do not need to implement MCP, HTTP, OAuth, AuthZEN, Shared Signals, PROV, ODRL, DPV, or JOSE to pass the base semantic clean-room harness.

## 5. Adapter contract

Your implementation may use any internal architecture or language. To make it black-box testable, provide a small executable adapter that follows the non-normative stdin/stdout contract in [`../conformance/external/v0_2/CONTRACT.md`](../conformance/external/v0_2/CONTRACT.md).

The harness sends one JSON request on stdin and expects one JSON response on stdout.

Conceptually:

```text
public/held-out case
      │
      ▼
external harness
      │ JSON stdin
      ▼
your adapter -> your independent semantic implementation
      │ JSON stdout
      ▼
external harness compares black-box outcome
```

The adapter is only a test boundary. It is not an RCP network protocol.

## 6. Required response behavior

For each assertion, return:

- `accepted`: whether the object is valid under the tested v0.2 semantic surface;
- `errors`: implementation-defined diagnostics when rejected;
- `semantic_digest`: a small harness-defined projection when accepted.

The digest exists only so the harness can verify that accepted objects were interpreted consistently. It is not a new normative RCP wire object.

## 7. Public vs held-out cases

The repository contains a public case pack for reproducibility and debugging.

The harness also accepts another case-pack path. Reviewers SHOULD run additional held-out cases derived from the same published specification when evaluating independent evidence.

This reduces the value of hard-coding known fixture IDs or expected booleans.

An implementation that passes only by case-ID lookup does not qualify as independent interoperability evidence.

## 8. Running the harness

Example:

```bash
python conformance/external/v0_2/harness.py \
  --cmd '/path/to/your-rcp-v02-adapter' \
  --implementation-name 'example-impl' \
  --implementation-version '0.1.0' \
  --language 'Rust 1.xx' \
  --report ./rcp-v02-report.json
```

To use another case pack:

```bash
python conformance/external/v0_2/harness.py \
  --cmd '/path/to/adapter' \
  --cases /path/to/held-out-cases.json \
  --implementation-name 'example-impl' \
  --report ./held-out-report.json
```

The process exits non-zero when any case fails.

## 9. Required evidence for Issue #19

Submit or link:

- implementation repository/source or reproducible artifact;
- language/runtime and important libraries;
- exact RCP commit/tag used;
- public-case harness report;
- held-out-case report when available;
- reproduction instructions;
- deviations and ambiguities found;
- explicit clean-room declaration;
- completed independent implementation report.

## 10. Failure classification

Classify every discrepancy as one of:

1. `implementation_defect`
2. `spec_ambiguity`
3. `schema_prose_mismatch`
4. `harness_assumption`
5. `standards_overlap`
6. `profile_or_binding_gap`
7. `security_or_privacy_concern`

A clean-room failure is useful evidence. Do not patch the implementation merely to match the reference oracle if the specification reasonably supports another interpretation; report the ambiguity first.

## 11. Claims a successful run permits

After one unrelated implementation passes the applicable public and reviewer-selected cases, the project may say only something like:

> At least one unrelated implementation independently reproduced the tested RCP v0.2 draft semantic surface at revision `<commit>`.

It does **not** establish:

- production security;
- legal compliance;
- all-provider interoperability;
- all-binding interoperability;
- standards-body endorsement;
- stable v0.2 final semantics.

## 12. Design feedback is part of the test

External implementers are explicitly encouraged to conclude that:

- a field is unnecessary;
- an existing standard already supplies equivalent semantics;
- a rule is ambiguous;
- a rule cannot be implemented without hidden assumptions;
- the wire representation is overfit to JSON;
- an embedded structure needs independent addressability;
- an RCP-specific concept should be deleted.

The goal is not to make the implementer agree with the authors. The goal is to discover the smallest independently implementable relationship-context contract.