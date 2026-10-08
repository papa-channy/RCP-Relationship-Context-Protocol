# RCP v0.2 Draft Conformance

> **Status:** non-normative design conformance. These suites do not claim stable v0.2 protocol conformance.

This directory now validates the v0.2 direction at two separate levels.

## 1. Abstract semantic suite

Run:

```bash
python conformance/v0_2/run.py
```

This suite uses an intentionally abstract representation and does not depend on a wire schema.

It tests whether the proposed relationship semantics are deterministic independently of transport/runtime choices.

Covered behavior includes:

1. multi-party projection;
2. conflict vs supersession;
3. dependency invalidation and independent support paths;
4. policy-preserving derivation;
5. epistemic preservation;
6. source-access separation;
7. identity dependencies;
8. cross-provider composition;
9. arrival-order neutrality;
10. abstract binding equivalence.

## 2. Draft wire suite

Install the shared conformance dependency set and run:

```bash
python -m pip install -r conformance/requirements.txt
python conformance/v0_2/run_wire.py
```

The wire suite validates:

- [`wire-cases.json`](./wire-cases.json)
- [`../../spec/schemas/v0.2-draft/context-assertion.schema.json`](../../spec/schemas/v0.2-draft/context-assertion.schema.json)

The candidate representation is documented in:

[`../../spec/wire-v0.2-draft.md`](../../spec/wire-v0.2-draft.md)

The wire suite deliberately separates two layers:

```text
JSON Schema
  structure / local constraints

RCP semantic validator
  cross-reference / relationship invariants
```

Examples of semantic checks that are intentionally not forced into JSON Schema include:

- a direct `{A,B,C}` interaction cannot become `{A,B}` context without `projection_basis_ref`;
- `support_sets` must reference declared material evidence/assertion dependencies;
- material identity dependencies declared by relationship scope must exist in derivation lineage;
- material policy dependencies must remain carried by the derived assertion;
- a `verified_fact` verification basis must resolve to declared lineage;
- an assertion cannot conflict with or supersede itself;
- an unsupported required semantic extension fails closed.

## Support-path model

`support_sets` represent alternative evidence sets that are each independently sufficient for a derived assertion.

```json
{
  "support_sets": [["A"], ["B"]]
}
```

means either A or B independently supports the assertion.

```json
{
  "support_sets": [["A", "B"]]
}
```

means A and B are jointly required.

The wire model carries this representation directly because the distinction materially changes downstream invalidation/recomputation behavior.

## Participant projection

The assertion's target participants live in:

```text
relationship_scope.participants
```

Each evidence reference separately carries:

```text
source_participants
```

For direct interaction evidence, a participant-scope change requires an explicit:

```text
projection_basis_ref
```

This is the wire-level representation of the M4.2 no-silent-participant-collapse invariant.

## Binding equivalence

`wire-cases.json` contains the same draft `ContextAssertion` carried through:

- an MCP-like `structuredContent` wrapper; and
- an HTTP-like response body.

`run_wire.py` strips binding framing, normalizes only RCP semantic state, and asserts equivalence.

This is still a synthetic boundary proof. It is **not yet a production RCP-over-MCP or RCP-over-HTTP implementation**.

## Important design boundary

Neither suite tests or defines:

- MCP tool/resource invocation semantics;
- A2A task mechanics;
- HTTP endpoint layout;
- OAuth/OIDC authentication;
- AuthZEN request/decision wire format;
- Shared Signals delivery;
- JOSE/COSE encryption/signing;
- Provider storage/query architecture.

Those remain binding/profile/infrastructure concerns.

## Relationship to v0.1

All v0.1 schema, semantic, privacy-boundary, JOSE, cross-language, and external-harness tests remain separate and unchanged.

The v0.2 suites are additive. Passing them means only that the current semantic and draft wire models are internally executable under the tested cases.

## Before normative v0.2

The candidate model still needs:

- broader negative and temporal lifecycle cases;
- real MCP and HTTP bindings rather than synthetic wrappers;
- reconciliation of dependency/support semantics with W3C PROV;
- policy-reference mappings to existing policy standards;
- independent implementation/adversarial review;
- a deliberate decision on whether any embedded structure needs promotion to an independently addressable top-level RCP object.
