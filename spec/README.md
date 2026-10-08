# RCP Experimental Specification

This directory contains both the preserved experimental v0.1 contract and the active v0.2 semantic-core design work.

Current project status: **experimental draft, not a stable standard**.

## Specification generations

### v0.1 — preserved experimental baseline

[`core-v0.1.md`](./core-v0.1.md) remains the normative experimental contract for the existing v0.1 schemas, conformance suite, reference ecosystem, and external Provider harness.

Its seven wire objects remain unchanged:

1. `IdentityClaim`
2. `ProviderCapability`
3. `PermissionRequest`
4. `PermissionDecision`
5. `ContextAssertion`
6. `SecureEnvelope`
7. `RevocationEvent`

The v0.1 work is retained as reproducible evidence for permission-before-retrieval, identity/privacy boundaries, policy inheritance, revocation/recomputation, JOSE execution, and cross-language interoperability.

Do not silently reinterpret v0.1 objects as v0.2 objects.

### v0.2 — active semantic-core design

[`core-v0.2-draft.md`](./core-v0.2-draft.md) defines the current **non-normative semantic direction**.

[`wire-v0.2-draft.md`](./wire-v0.2-draft.md) defines the current **non-normative candidate wire representation** produced after the M4.2 semantic-conformance pass.

The current candidate intentionally begins with one top-level semantic object:

```text
ContextAssertion
```

and embeds the semantic structures needed to interpret it:

- scoped actor references;
- relationship scope;
- evidence references and source participants;
- epistemic class;
- derivation dependencies and independently sufficient support sets;
- assertion relations such as conflict/supersession;
- lifecycle state;
- policy references;
- required semantic extensions.

The candidate schema is:

[`schemas/v0.2-draft/context-assertion.schema.json`](./schemas/v0.2-draft/context-assertion.schema.json)

Its wire version is intentionally `"0.2-draft"` so it cannot be confused with the v0.1 contract or a future stable v0.2 release.

## v0.2 Core rule

A concept should remain in RCP Core only if independent systems still need to agree on its meaning when the transport/runtime changes.

Conceptual test:

> **Would two systems need the same semantic agreement if one carried the relationship object over MCP and the other carried the equivalent object over plain HTTP?**

If not, the feature probably belongs in a binding/profile rather than Core.

## v0.2 schema policy

The existence of a draft JSON Schema does **not** freeze v0.2.

The project deliberately separates:

```text
JSON Schema structure
        +
RCP semantic cross-reference/invariant validation
```

JSON Schema validates shape and local constraints. The v0.2 semantic/wire conformance suite validates graph-like rules such as:

- no silent participant-scope collapse;
- verification bases resolve to declared lineage;
- support sets reference real material dependencies;
- identity bindings that affect scope remain material dependencies;
- material policy dependencies remain attached;
- self-conflict/supersession relations are rejected;
- unsupported required extensions fail closed;
- transport wrappers do not alter semantic state.

This keeps relationship semantics independent from one serialization technology.

## Existing v0.1 profiles and registries

The existing files under [`profiles/`](./profiles/) and [`registries/`](./registries/) remain part of the v0.1 experimental contract unless explicitly migrated.

They must not be carried into v0.2 merely because the reference implementation already uses them.

See [`../docs/standards-boundary.md`](../docs/standards-boundary.md) for the current responsibility split between RCP Core, reusable profiles, transport bindings, and external standards.

## Existing v0.1 schemas

The root files under [`schemas/`](./schemas/) remain the machine-readable syntax contract for v0.1:

- `identity-claim.schema.json`
- `provider-capability.schema.json`
- `permission-request.schema.json`
- `permission-decision.schema.json`
- `context-assertion.schema.json`
- `secure-envelope.schema.json`
- `revocation-event.schema.json`

All v0.1 wire objects carry `rcp_version: "0.1"`.

The draft v0.2 schema lives only under `schemas/v0.2-draft/`.

## v0.2 executable validation

The current v0.2 conformance work lives under [`../conformance/v0_2/`](../conformance/v0_2/).

It contains two layers:

1. abstract semantic scenarios that do not assume a wire schema;
2. draft wire cases that validate the candidate `ContextAssertion` representation and cross-reference invariants.

Representative scenarios include:

- `{A,B,C}` evidence must not silently become `{A,B}` context;
- conflicting provider assertions remain explicit rather than being flattened by arrival order;
- partial source invalidation distinguishes independent support from jointly required evidence;
- transformation does not silently loosen policy restrictions;
- source statements/inferences do not silently become verified facts;
- identity changes are semantic lineage events when material;
- equivalent MCP-like and HTTP-like wrappers normalize to the same RCP semantic state.

## Binding strategy

RCP v0.2 is intended to support multiple bindings, including:

- RCP over MCP;
- RCP over HTTP;
- RCP over A2A;
- Provider-native API mappings.

Bindings may define discovery, framing, authentication integration, subscriptions, retries, transport errors, and security mechanics.

Bindings must not redefine Core relationship meaning.

Generic authorization, revocation-signal delivery, provenance vocabularies, policy languages, and cryptographic primitives should reuse or profile mature standards where possible, including AuthZEN, Shared Signals, W3C PROV, ODRL/DPV, and JOSE/COSE.

## Implementer status

### v0.1

The v0.1 clean-room implementer surface remains available through the existing spec, schemas, profiles, registries, and [`../docs/IMPLEMENTER_GUIDE.md`](../docs/IMPLEMENTER_GUIDE.md).

### v0.2

There is still **no stable v0.2 clean-room implementation target**.

The current wire model is an executable candidate. It must survive schema/semantic convergence, multi-binding implementation, and independent review before becoming a normative target.

## Reference ecosystem status

`/reference-ecosystem` demonstrates v0.1 behavior. Its process topology, control-plane service, HTTP routes, relay, storage model, and package structure are not v0.2 Core requirements.

## Status warning

RCP v0.2 remains under scope reduction.

The project should prefer deleting or delegating generic protocol responsibilities over preserving them for compatibility with v0.1 implementation choices.

Before any stable v0.2 claim, the semantic model, candidate wire representation, bindings, and conformance behavior must converge and receive unrelated implementation plus independent security/privacy review.
