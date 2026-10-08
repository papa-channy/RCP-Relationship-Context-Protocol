# RCP v0.2 Draft Conformance

> **Status:** non-normative design conformance. These suites do not claim stable v0.2 protocol conformance.

The v0.2 work validates three layers independently:

```text
semantic invariants
      ↓
draft wire representation
      ↓
real MCP / HTTP binding equivalence
```

## 1. Abstract semantic suite

Run:

```bash
python conformance/v0_2/run.py
```

The suite uses an abstract representation and does not depend on the wire schema.

Coverage includes:

1. multi-party projection;
2. conflict vs supersession;
3. dependency invalidation and independent support paths;
4. policy-preserving derivation;
5. epistemic preservation;
6. source-access separation;
7. identity dependencies;
8. cross-provider composition;
9. arrival-order neutrality;
10. binding-equivalence semantics.

## 2. Draft wire suite

Run:

```bash
python -m pip install -r conformance/requirements.txt
python conformance/v0_2/run_wire.py
```

The suite validates:

- [`wire-cases.json`](./wire-cases.json)
- [`../../spec/schemas/v0.2-draft/context-assertion.schema.json`](../../spec/schemas/v0.2-draft/context-assertion.schema.json)

The representation is documented in [`../../spec/wire-v0.2-draft.md`](../../spec/wire-v0.2-draft.md).

The validator intentionally separates:

```text
JSON Schema
  -> structure / local constraints

RCP semantic validator
  -> cross-reference / relationship invariants
```

Semantic checks include:

- any evidence participant-scope change requires `projection_basis_ref`;
- `support_sets` reference declared material evidence/assertion dependencies;
- material identity dependencies declared by relationship scope exist in derivation lineage;
- material policy dependencies remain carried by the derived assertion;
- `verified_fact` bases resolve to declared lineage;
- an assertion cannot conflict with/supersede itself;
- unsupported required semantic extensions fail closed.

## 3. Standards-reconciliation regression cases

M4.5 deliberately removed fields/taxonomies that did not justify Core ownership.

The wire suite now verifies those removals:

- top-level `confidence` is rejected; Provider-specific model scores belong in namespaced extensions/profiles;
- `observation`, `interpretation`, `inference`, and `strategy` are rejected as base `assertion_type` values because epistemic meaning belongs on `epistemic_class`;
- unscoped channel names such as `message` are not Core `evidence_type` values;
- channel-specific evidence can use a namespaced type such as `x-slack:message`;
- the participant-projection invariant applies equally to `interaction`, `provider_projection`, and extension evidence types.

These are subtraction tests: future changes must not silently restore generic/duplicated responsibilities to Core.

## 4. Support-path model

`support_sets` represent alternative evidence sets that are each independently sufficient for a derived assertion.

```json
{"support_sets": [["A"], ["B"]]}
```

means either A or B independently supports the assertion.

```json
{"support_sets": [["A", "B"]]}
```

means both are jointly required.

Generic lineage may map to W3C PROV. `support_sets` carry the additional RCP validity semantics that determine what survives when a material source changes.

## 5. Participant projection

Target scope:

```text
relationship_scope.participants
```

Source evidence scope:

```text
provenance.evidence[*].source_participants
```

If the sets differ, semantic validation requires:

```text
projection_basis_ref
```

The check is deliberately independent of evidence channel/type.

## 6. Real binding-equivalence proof

The actual binding proof lives under [`../../bindings/v0_2/`](../../bindings/v0_2/).

It uses:

- the official MCP TypeScript SDK v2 Resource server/client path; and
- a plain Node HTTP server/client path.

Both expose the same Provider-owned `ContextAssertion`, which is then passed through:

```bash
python conformance/v0_2/normalize_wire.py <assertion.json>
```

The proof requires:

```text
normalize(provider fixture)
  == normalize(MCP-retrieved assertion)
  == normalize(HTTP-retrieved assertion)
```

This is internal executable binding-independence evidence, not production certification or third-party interoperability.

## 7. Important boundary

The v0.2 Core suites do not define:

- MCP resource/tool runtime mechanics;
- A2A task mechanics;
- HTTP endpoint layout;
- OAuth/OIDC authentication;
- AuthZEN request/decision syntax;
- Shared Signals transport;
- W3C PROV itself;
- ODRL/DPV policy/privacy vocabularies;
- JOSE/COSE encryption/signing;
- Provider storage/query architecture.

Those remain binding/profile/external-standard concerns.

## 8. Relationship to v0.1

All v0.1 schema, semantic, privacy-boundary, JOSE, cross-language, and external-harness tests remain separate and unchanged.

The v0.2 suites are additive. Passing them means only that the current semantic/wire/binding model is internally executable under the tested cases.

## 9. Remaining validation before normative v0.2

The candidate still needs:

- unrelated clean-room v0.2 implementation evidence;
- adversarial security/privacy review;
- executable mappings/profiles for PROV, AuthZEN, Shared Signals, and policy references where needed;
- a real non-RCP Provider integration;
- evidence from implementation about whether any embedded structure must become independently addressable;
- additional temporal/dispute lifecycle cases.
