# RCP Conformance

The conformance suite tests protocol-visible behavior rather than one implementation's internals.

## Run locally

Schema and semantic suite:

```bash
python -m pip install -r conformance/requirements.txt
python conformance/run.py
```

Content/group privacy-boundary suite:

```bash
python conformance/boundary_checks.py
```

Experimental JOSE crypto-profile suite:

```bash
npm install --prefix conformance/crypto
npm test --prefix conformance/crypto
```

## External black-box Provider harness

M3 adds an HTTP harness intended for a separately running Provider implementation. The harness does **not** import the RCP reference ecosystem.

Read first:

- [`../docs/IMPLEMENTER_GUIDE.md`](../docs/IMPLEMENTER_GUIDE.md)
- [`external/provider-harness-profile-v0.1.md`](./external/provider-harness-profile-v0.1.md)
- [`../docs/INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md`](../docs/INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md)

Install the harness:

```bash
npm install --prefix conformance/external
```

Run it against an implementation that exposes the non-normative external Provider harness HTTP profile:

```bash
RCP_PROVIDER_URL=http://127.0.0.1:9001 \
RCP_TEST_PROVIDER_SUBJECT=provider-local:test-subject \
RCP_IMPLEMENTATION_NAME=my-provider \
RCP_IMPLEMENTATION_VERSION=0.1.0 \
RCP_IMPLEMENTATION_LANGUAGE=rust \
RCP_CONFORMANCE_REPORT=./provider-report.json \
npm run provider --prefix conformance/external
```

The resulting machine-readable report records implementation metadata, selected representation/profile, individual cases, failures/deviations, and overall result.

A `PASS` from this harness means only that the tested Provider matched the **external harness profile and the tested RCP Core/profile behavior**. It is not production certification, legal compliance, or a security audit.

### Harness self-test

Repository CI also runs:

```bash
npm install --prefix conformance/external
npm install --prefix reference-ecosystem
npm run self-test --prefix conformance/external
```

The self-test launches the reference mail Provider as a separate process and invokes the external harness strictly over HTTP. The harness source itself is checked to ensure it does not import or reference `reference-ecosystem` implementation code.

This validates the harness machinery; it does **not** count as an independent third-party implementation.

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

### Provider representation boundaries

`conformance/boundary_checks.py` verifies that provider capabilities are representation-specific:

- `content = deny` blocks raw-content export even when `provider_context` or external processing is available;
- provider-generated context can remain usable while raw content stays unavailable;
- capability support never substitutes for a valid `allow` decision;
- `limited` capabilities fail closed until their limitations are resolved;
- `external_processing = deny` blocks operations that require processing outside the provider boundary even when content is otherwise readable.

### Group interaction scope

The boundary suite also verifies that multi-party interactions do not silently become bilateral relationship memory:

- a two-party interaction can remain scoped to those two participants;
- a group interaction `{A,B,C}` cannot become persistent `{A,B}` context merely because A and B were both present;
- narrowing a group interaction to a bilateral relationship requires an explicit narrower evidence basis;
- the target relationship participants must be a subset of the source interaction participants;
- context may remain scoped to the full group without bilateral projection.

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

### Experimental JOSE cryptographic profile

The Node-based profile suite exercises the candidate `rcp-jose-x25519-a256gcm-ed25519-v0.1` representation with independent JOSE/JCS libraries rather than custom cryptographic primitives.

It currently tests:

- X25519 `ECDH-ES` + `A256GCM` JWE encrypt/decrypt round trip,
- Ed25519 detached JWS over RFC 8785-canonicalized unsigned envelope metadata plus ciphertext representation,
- metadata tampering rejection,
- ciphertext tampering rejection,
- wrong signing-key rejection,
- wrong recipient-key rejection,
- content-encryption algorithm substitution rejection,
- unsupported RCP crypto-profile rejection.

Passing this suite means the experimental profile is executable with the tested libraries. It does **not** constitute an independent cryptographic security review or a production-readiness claim.

## M3 review surface

For independent implementation/review work, the intended clean-room input set is:

1. `/spec/core-v0.1.md`;
2. applicable `/spec/profiles/*.md`;
3. `/spec/registries/*`;
4. `/spec/schemas/*`;
5. `/docs/IMPLEMENTER_GUIDE.md`.

The external HTTP harness profile under `/conformance/external` is explicitly **non-normative transport/test scaffolding**. `/reference-ecosystem` is an example implementation and MUST NOT be required to understand the Core contract.

Security/privacy reviewers should use [`../docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md`](../docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md) as a bounded review aid.

## Required future cases

M1/M3 and later conformance work still need:

- an actual third-party clean-room implementation result;
- independent security review of the cryptographic profile;
- production key-discovery and key-revocation interoperability;
- a complete interaction/provenance wire model for richer group-role semantics;
- broader external harness roles (Consumer/Relay) if those become necessary for interoperability claims.

## Philosophy

A provider, consumer, or relay should be able to pass the relevant conformance surface without using the reference implementation. Conformance is about observable protocol semantics, not architecture or programming language.
