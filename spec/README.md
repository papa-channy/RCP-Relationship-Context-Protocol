# RCP Experimental Specification

This directory contains both the preserved experimental v0.1 contract and the active v0.2 semantic-core design work.

Current project status: **experimental draft, not a stable standard**.

## Specification generations

### v0.1 — preserved experimental baseline

[`core-v0.1.md`](./core-v0.1.md) remains the current normative experimental contract for the existing schemas, conformance suite, reference ecosystem, and external Provider harness.

It defines seven wire objects:

1. `IdentityClaim`
2. `ProviderCapability`
3. `PermissionRequest`
4. `PermissionDecision`
5. `ContextAssertion`
6. `SecureEnvelope`
7. `RevocationEvent`

The v0.1 work is intentionally retained because it provides reproducible evidence for:

- fail-closed authorization behavior;
- permission-before-retrieval;
- identity isolation;
- multi-party projection boundaries;
- epistemic classes;
- provenance/access separation;
- derived-policy inheritance;
- revocation/recomputation;
- encrypted `SecureEnvelope` interoperability;
- Node ↔ Python JOSE interoperability.

Do not silently reinterpret v0.1 objects as v0.2 objects.

### v0.2 — active semantic-core design

[`core-v0.2-draft.md`](./core-v0.2-draft.md) is the active **non-normative design draft**.

It proposes that RCP Core become a transport-independent relationship information/lifecycle model centered on concepts such as:

- `ActorReference`;
- `RelationshipScope`;
- `InteractionEvidence`;
- `ContextAssertion`;
- `EpistemicClass`;
- `DerivationDependency`;
- `ContextLifecycle`;
- `PolicyReference`.

The draft intentionally re-evaluates generic v0.1 infrastructure concerns such as capability discovery, authorization requests/decisions, transport envelopes, and revocation signal delivery.

See [`../docs/standards-boundary.md`](../docs/standards-boundary.md) for the responsibility split.

## v0.2 Core rule

A concept should remain in RCP Core only if independent systems still need to agree on its meaning when the transport/runtime changes.

Conceptual test:

> **Would two systems need the same semantic agreement if one carried the relationship object over MCP and the other carried the equivalent object over plain HTTP?**

If not, the feature probably belongs in a binding/profile rather than Core.

## Existing v0.1 profiles

The following remain normative only for the v0.1 experimental contract unless explicitly migrated:

- [`profiles/secure-envelope-binding-v0.1.md`](./profiles/secure-envelope-binding-v0.1.md)
- [`profiles/crypto-jose-v0.1.md`](./profiles/crypto-jose-v0.1.md)
- [`profiles/context-selection-boundaries-v0.1.md`](./profiles/context-selection-boundaries-v0.1.md)

These profiles are valuable implementation evidence but should not be assumed to represent the final v0.2 Core boundary.

## Existing registries

Current v0.1 registries:

- [`registries/capabilities.md`](./registries/capabilities.md)
- [`registries/reason-codes.md`](./registries/reason-codes.md)
- [`registries/assertion-types.md`](./registries/assertion-types.md)
- [`registries/purposes.md`](./registries/purposes.md)
- [`registries/processing-locations.md`](./registries/processing-locations.md)

Each registry will be classified during the v0.2 refactor as one of:

1. relationship semantic Core;
2. reusable RCP profile;
3. transport/binding concern;
4. better delegated to an external standard.

No registry should be carried into v0.2 merely for compatibility with the current reference implementation.

## Existing v0.1 schemas

The machine-readable schemas under [`schemas/`](./schemas/) remain the syntax contract for v0.1:

- `identity-claim.schema.json`
- `provider-capability.schema.json`
- `permission-request.schema.json`
- `permission-decision.schema.json`
- `context-assertion.schema.json`
- `secure-envelope.schema.json`
- `revocation-event.schema.json`

All v0.1 wire objects carry `rcp_version: "0.1"`.

**No v0.2 wire schemas are frozen yet.**

The project will define v0.2 schemas only after relationship-specific semantic scenarios stabilize.

## Required v0.2 semantic scenarios

Before v0.2 becomes normative, conformance work should cover at least:

1. **multi-party projection** — `{A,B,C}` evidence does not silently become `{A,B}` context;
2. **conflicting evidence** — independent Providers can express conflict/supersession without flattening both into current fact;
3. **partial-source invalidation** — dependent context is re-evaluated and may survive only with independent valid support;
4. **policy-preserving derivation** — lower-fidelity transformation does not automatically loosen restrictions;
5. **cross-provider composition** — combined state preserves provider/evidence separation, disagreement, and restrictions;
6. **epistemic preservation** — source statements, observations, interpretations, inferences, and strategies do not silently become verified facts.

## Binding strategy

RCP v0.2 should be capable of multiple bindings.

Candidate bindings/profiles include:

- RCP over MCP;
- RCP over HTTP;
- RCP over A2A;
- provider-native API mapping;
- AuthZEN-compatible relationship authorization profile;
- Shared-Signals-compatible invalidation/change profile;
- W3C PROV mapping;
- ODRL/DPV policy mapping;
- JOSE/COSE security profile.

A binding may define transport framing, discovery, subscriptions, authentication integration, retries, and security mechanics. It must not redefine RCP semantic meaning.

## Normative vs non-normative project material

### v0.1 implementers

A clean-room v0.1 implementer can still work from:

1. [`core-v0.1.md`](./core-v0.1.md);
2. applicable v0.1 profiles/registries/schemas;
3. [`../docs/IMPLEMENTER_GUIDE.md`](../docs/IMPLEMENTER_GUIDE.md).

The existing black-box Provider harness remains a v0.1 validation tool.

### v0.2 implementers

There is not yet a stable v0.2 clean-room implementation target.

The project should first finish semantic reconciliation and conformance scenarios, then publish machine-readable v0.2 definitions and a new implementation target.

## Reference ecosystem status

`/reference-ecosystem` demonstrates v0.1 behavior. Its:

- service topology;
- control-plane process;
- HTTP routes;
- relay;
- demo ports;
- storage choices;
- package/module structure

are not v0.2 Core requirements.

## Status warning

RCP v0.2 is explicitly under scope reduction.

The project should prefer deleting or delegating a generic protocol responsibility over preserving it merely because the v0.1 reference implementation already contains it.

Before any v0.2 stable claim, the semantic model, schemas, examples, bindings, and conformance cases must converge and receive independent implementation/security/privacy review.
