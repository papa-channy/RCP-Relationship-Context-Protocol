# RCP Experimental Specification

This directory contains the preserved experimental v0.1 contract and the active v0.2 semantic-core design.

Current status: **experimental draft, not a stable standard**.

## v0.1 — preserved experimental baseline

[`core-v0.1.md`](./core-v0.1.md) remains the normative experimental contract for the existing v0.1 schemas, profiles, conformance suite, reference ecosystem, and external Provider harness.

Its seven wire objects remain unchanged:

1. `IdentityClaim`
2. `ProviderCapability`
3. `PermissionRequest`
4. `PermissionDecision`
5. `ContextAssertion`
6. `SecureEnvelope`
7. `RevocationEvent`

Do not silently reinterpret v0.1 objects as v0.2 objects.

## v0.2 — active semantic-core design

[`core-v0.2-draft.md`](./core-v0.2-draft.md) defines the non-normative semantic direction.

[`wire-v0.2-draft.md`](./wire-v0.2-draft.md) defines the current non-normative candidate wire representation.

The candidate deliberately begins with one top-level semantic object:

```text
ContextAssertion
```

with embedded structures for:

- scoped actor references;
- relationship scope;
- evidence references and source participants;
- epistemic class;
- material derivation dependencies;
- independently sufficient `support_sets`;
- assertion conflict/support/supersession relations;
- lifecycle state;
- external policy references;
- required semantic extensions.

The candidate schema is:

[`schemas/v0.2-draft/context-assertion.schema.json`](./schemas/v0.2-draft/context-assertion.schema.json)

Its wire version is intentionally `"0.2-draft"`.

## Core admission rule

A concept should remain in RCP Core only if independent systems still need to agree on its meaning when transport/runtime changes.

> **Would two systems need the same semantic agreement if one carried the assertion over MCP and the other over plain HTTP?**

If not, the feature belongs in a binding/profile/extension or external standard.

## Structure vs semantic validation

The v0.2 draft separates:

```text
JSON Schema
  shape / local constraints

RCP semantic validator
  cross-reference / relationship invariants
```

Semantic checks include:

- no silent participant-scope collapse;
- verification bases resolve to declared lineage;
- support sets reference material dependencies;
- material identity bindings remain explicit;
- material policy dependencies remain carried;
- assertions cannot conflict with or supersede themselves;
- unsupported required extensions fail closed;
- binding framing does not alter semantic state.

This separation keeps Core meaning independent from one serialization technology.

## Standards reconciliation

The v0.2 draft has completed a first field-level reconciliation against MCP, AuthZEN, Shared Signals/CAEP, W3C PROV, ODRL/DPV, ActivityStreams, Solid Application Interoperability, AT Protocol Lexicon, and Eclipse Dataspace Protocol.

See:

- [`../docs/standards-boundary.md`](../docs/standards-boundary.md)
- [`../docs/standards-mapping-v0.2.md`](../docs/standards-mapping-v0.2.md)

The reconciliation removed several accidental Core claims:

- top-level generic `confidence`;
- epistemic duplicates in `assertion_type`;
- channel/product-specific evidence types;
- channel-dependent participant-projection logic;
- generic transformation classification from the base derivation structure.

Generic authorization, signal delivery, provenance vocabulary, policy language, cryptography, and transport remain external/profile concerns.

## Executable v0.2 evidence

[`../conformance/v0_2/`](../conformance/v0_2/) contains:

1. abstract transport-independent semantic scenarios;
2. draft JSON Schema/wire fixtures;
3. cross-reference/fail-closed semantic validation.

[`../bindings/v0_2/`](../bindings/v0_2/) contains the current binding-independence proof:

- official MCP TypeScript SDK Resource server/client path;
- plain HTTP server/client path;
- one shared Provider-owned assertion;
- the same Python schema + semantic validator;
- identical normalized semantic state after transport framing is removed.

This is internal executable evidence, not independent third-party interoperability.

## v0.1 profiles/registries

Existing files under [`profiles/`](./profiles/) and [`registries/`](./registries/) remain part of the v0.1 experimental contract unless explicitly migrated.

They must not be carried into v0.2 merely because the v0.1 reference implementation already uses them.

## Binding strategy

Candidate bindings include:

- RCP over MCP;
- RCP over HTTP;
- RCP over A2A;
- Provider-native API mappings.

Bindings may define discovery, framing, authentication integration, subscriptions, retries, transport errors, and security mechanics. They must not redefine Core relationship meaning.

## Implementer status

### v0.1

The existing clean-room implementer surface remains available through the v0.1 spec, schemas, profiles, registries, [`../docs/IMPLEMENTER_GUIDE.md`](../docs/IMPLEMENTER_GUIDE.md), and external Provider harness.

### v0.2

There is **not yet an independently validated stable v0.2 implementation target**.

The next major milestone is a bounded external clean-room implementation of the v0.2 semantic/wire surface. The implementer should not import the RCP reference semantic engine. Findings must be allowed to shrink or revise the draft.

## Status warning

RCP v0.2 remains under active falsification and scope reduction.

Before a stable v0.2 claim, the semantic model, wire representation, and necessary profiles must survive unrelated implementation and independent security/privacy review.
