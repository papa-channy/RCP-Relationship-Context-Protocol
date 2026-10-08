# RCP v0.2 Draft Semantic Conformance

> **Status:** non-normative design conformance. This suite does not freeze a v0.2 wire format or claim stable v0.2 protocol conformance.

This directory tests whether the proposed v0.2 relationship semantics can be expressed and evaluated independently of transport/runtime choices.

Run:

```bash
python conformance/v0_2/run.py
```

The suite uses an intentionally small abstract representation. It is **not** a candidate JSON wire schema. The purpose is to stabilize semantic invariants before deciding which concepts deserve first-class wire objects, embedded structures, registries, or external-standard mappings.

## Covered semantics

The current fixtures exercise:

1. **multi-party projection** — group evidence does not silently collapse into a narrower relationship scope;
2. **evidence relations** — conflict and supersession are semantic relations, not transport-order effects;
3. **dependency invalidation** — downstream state is recomputed or invalidated according to surviving independent evidence support paths;
4. **policy-preserving derivation** — projection cannot silently loosen source restrictions;
5. **epistemic preservation** — statement/inference/observation does not become verified fact without a verification basis;
6. **source-access separation** — access to a derived child does not grant evidence access;
7. **identity dependency** — a changed identity binding triggers re-evaluation only when it is a material dependency;
8. **cross-provider composition** — composition creates a new assertion with explicit lineage and does not erase source assertions;
9. **arrival-order neutrality** — later receipt alone is not supersession;
10. **binding equivalence** — MCP-like and HTTP-like wrappers with equivalent semantic payloads normalize to the same semantic state.

## Important design boundary

This suite deliberately does **not** test:

- MCP tool/resource invocation;
- A2A task mechanics;
- HTTP endpoint shape;
- OAuth/OIDC authentication;
- AuthZEN request/decision wire format;
- Shared Signals event delivery;
- JOSE/COSE encryption/signing;
- provider-specific storage/query architecture.

Those are binding/profile/infrastructure concerns. If a relationship semantic case cannot be decided without hidden transport-specific state, that is treated as evidence that either:

1. the RCP semantic model is incomplete; or
2. the behavior belongs in the binding rather than Core.

## Abstract support-path model

For source invalidation cases, `support_sets` represent alternative evidence sets that are each independently sufficient to support a derived assertion.

Example:

```json
{
  "all_sources": ["A", "B"],
  "support_sets": [["A"], ["B"]]
}
```

means either A or B independently supports the assertion. Removing A therefore requires recomputation/new lineage, but does not force the assertion to become false or invalid.

By contrast:

```json
{
  "support_sets": [["A", "B"]]
}
```

means A and B are jointly required. Removing either source removes the currently sufficient evidence path.

This support-path representation is a test abstraction for `DerivationDependency`; it is not yet a frozen wire model.

## Relationship to v0.1

The existing v0.1 schema/semantic/JOSE/external-harness suites remain unchanged and continue to validate the preserved experimental v0.1 baseline.

The v0.2 suite is additive. A passing result means only that the current draft semantics are internally executable under these cases. It does not mean the v0.2 information model is complete, externally validated, or ready to freeze as schemas.
