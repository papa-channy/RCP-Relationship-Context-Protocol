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

Negative fixtures verify unsupported versions, malformed/missing authorization dimensions, unscoped context, unbound envelopes, and empty revocation scopes.

### Fail-closed permission behavior

The suite verifies that capability support alone is not permission, and that `unknown`, unresolved `conditional`, expired `allow`, and unresolved `limited` capability states do not execute.

### Request → decision → envelope binding

The cross-object suite verifies the experimental Secure Envelope Authorization Binding Profile. Action, resource, purpose, destination, processing location, request/decision references, and authorization lifetime must all remain bound to the evaluated request.

### Identity isolation

The privacy-boundary oracle fixes only the minimum safe interoperability guarantees, not a universal identity-resolution algorithm:

- identities from different tenant/user scopes MUST NOT be automatically promoted into a global cross-user identity link;
- `probable` or `possible` identity evidence MUST NOT independently authorize automatic sensitive-context merging;
- `conflicted` and `rejected` identity evidence cannot authorize linking;
- explicit same-tenant user confirmation is a valid positive test case for a local link.

### Provenance ancestor access

A readable derived object does not grant source access. The suite verifies that:

- access to a child context does not override an ancestor `deny` or `unknown` decision;
- a revoked source remains inaccessible even if the derived child remains readable;
- source access is possible only when the source has its own valid `allow` decision and active state.

### Derived-policy inheritance

The conformance oracle verifies monotonic restriction rules:

- allowed purposes, destinations, and processing locations are intersected;
- retention cannot exceed the shortest applicable parent maximum;
- confidentiality and sensitivity resolve to the most restrictive input;
- training remains denied if any essential source denies training;
- an empty intersection stays empty rather than being broadened by a default.

These fixtures use abstract policy objects so M1 can test semantics without prematurely defining a complete policy-expression language.

### Decision staleness

A cached `allow` becomes non-executable when a recorded material dependency changes, including provider capability, organization policy, user grant, or identity-resolution versions.

### Revocation propagation

A small derivation-graph oracle verifies that revoked essential sources invalidate descendants, independently supported context requires recomputation with fresh lineage, and unrelated graph branches remain unchanged.

## Required future cases

M1 and later conformance work still need to cover:

- restricted raw content is not exported,
- explicit stale-decision signaling and refresh behavior,
- group interactions are not silently collapsed into binary context,
- unsupported cryptographic profiles fail closed,
- independent implementation against the specification without relying on the reference code.

## Philosophy

A provider, consumer, or relay should be able to pass the suite without using the reference implementation. Conformance is about observable protocol semantics, not architecture or programming language.
