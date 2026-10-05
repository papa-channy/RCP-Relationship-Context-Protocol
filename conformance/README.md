# RCP Conformance

The conformance suite tests protocol-visible behavior rather than one implementation's internals.

## Run locally

```bash
python -m pip install -r conformance/requirements.txt
python conformance/run.py
```

The same bootstrap suite is configured to run in GitHub Actions when `spec/**` or `conformance/**` changes.

## Current M1 coverage

### Structural schema checks

Positive fixtures cover every current Core v0.1 object:

- `IdentityClaim`
- `ProviderCapability`
- `PermissionRequest`
- `PermissionDecision`
- `ContextAssertion`
- `SecureEnvelope`
- `RevocationEvent`

Negative fixtures verify that implementations reject, among other cases:

- unsupported `rcp_version` values,
- identity claims without an issuance time,
- capability manifests without an issuance time,
- protected non-discovery permission requests without a resource,
- unregistered or malformed purposes,
- unregistered or malformed processing locations,
- conditional decisions without required conditions,
- persistent context assertions with neither subjects nor relationship scope,
- secure envelopes that are not bound to a permission decision,
- revocation events with an empty scope.

### Fail-closed permission behavior

The bootstrap behavior suite verifies that:

- provider capability `allow` is not itself permission,
- `unknown` permission does not execute,
- `conditional` permission does not execute before reevaluation,
- expired `allow` decisions do not execute,
- unresolved `limited` capability does not execute,
- a fresh `allow` decision paired with a usable capability may execute.

### Derived-policy inheritance

The conformance oracle verifies the Core v0.1 monotonic restriction rules for essential source policies:

- allowed purposes are intersected,
- allowed destinations are intersected,
- allowed processing locations are intersected,
- retention cannot exceed the shortest applicable parent maximum,
- confidentiality and sensitivity resolve to the most restrictive input,
- training remains denied if any essential source denies training,
- an empty intersection stays empty rather than being broadened by a default.

These fixtures are deliberately abstract policy objects. They test normative semantics without prematurely defining a complete RCP policy-expression language.

### Decision staleness

Staleness fixtures verify that a cached `allow` decision becomes non-executable when a recorded material dependency changes, including:

- provider capability version,
- organization policy version,
- user grant version,
- identity-resolution version.

An unchanged dependency snapshot remains executable only while the `allow` decision is otherwise valid and unexpired.

### Revocation propagation

A small derivation-graph oracle verifies that:

- a revoked sole essential source invalidates dependent context,
- invalidation propagates to descendants,
- independent surviving support requires a fresh recomputation rather than silent retention of old lineage,
- descendants of recompute-required objects are themselves reevaluated,
- unrelated graph branches remain unchanged.

The oracle is intentionally small; implementations are free to use any graph/storage architecture that produces equivalent externally observable behavior.

## Required future cases

M1 and later conformance work still need to cover:

- purpose/destination/processing-location mismatch across a `PermissionRequest`, `PermissionDecision`, and `SecureEnvelope`,
- restricted raw content is not exported,
- explicit stale-decision signaling and refresh behavior,
- cross-tenant identity aggregation is denied by default,
- group interactions are not silently collapsed into binary context,
- unsupported cryptographic profiles fail closed,
- access to a derived object does not imply access to restricted ancestors,
- independent implementation against the specification without relying on the reference code.

## Philosophy

A provider, consumer, or relay should be able to pass the suite without using the reference implementation. Conformance is about observable protocol semantics, not architecture or programming language.
