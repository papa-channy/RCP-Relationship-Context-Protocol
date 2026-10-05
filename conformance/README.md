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

Negative fixtures currently verify that implementations reject:

- identity claims without an issuance time,
- capability manifests without an issuance time,
- protected non-discovery permission requests without a resource,
- conditional decisions without required conditions,
- persistent context assertions with neither subjects nor relationship scope,
- secure envelopes that are not bound to a permission decision,
- revocation events with an empty scope.

### Fail-closed behavioral checks

The bootstrap behavior suite verifies that:

- provider capability `allow` is not itself permission,
- `unknown` permission does not execute,
- `conditional` permission does not execute before reevaluation,
- expired `allow` decisions do not execute,
- unresolved `limited` capability does not execute,
- a fresh `allow` decision paired with a usable capability may execute.

## Required future cases

M1 and later conformance work must expand to cover:

- restricted raw content is not exported,
- purpose restrictions are enforced,
- derived data retains policy dependencies,
- revoked sources trigger descendant reevaluation,
- stale permission decisions are rejected after material input changes,
- cross-tenant identity aggregation is denied by default,
- group interactions are not silently collapsed into binary context,
- transformations do not erase confidentiality restrictions,
- unsupported cryptographic profiles fail closed,
- access to a derived object does not imply access to restricted ancestors.

## Philosophy

A provider or consumer should be able to pass the suite without using the reference implementation. Conformance is about observable protocol semantics, not architecture or programming language.
