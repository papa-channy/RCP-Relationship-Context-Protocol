# RCP Reference Ecosystem — v0.1 Experimental Baseline

> **Status:** M2 implemented and CI-verified for the preserved RCP v0.1 design. Experimental reference software; not the normative v0.2 architecture, a production deployment, an external-adoption claim, or a security certification.

RCP is now being refactored around a smaller transport-independent semantic Core. This workspace remains valuable because it demonstrates executable v0.1 behavior and provides regression evidence for semantics that may survive into v0.2.

For the active direction, see:

- [`../spec/core-v0.2-draft.md`](../spec/core-v0.2-draft.md)
- [`../docs/standards-boundary.md`](../docs/standards-boundary.md)
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- [Issue #23](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/23)

The process topology, control-plane service, HTTP routes, relay, storage model, and v0.1 permission/envelope objects in this workspace are **reference implementation choices**, not mandatory v0.2 Core architecture.

## Run the canonical v0.1 demo

```bash
cd reference-ecosystem
npm install
npm run demo
```

The demo starts five independent Providers, an operator-blind relay, and the reference control-plane/Consumer. It then:

1. resolves five provider-scoped identities for the same human under one tenant;
2. creates a minimum-data `ProcessingPlan`;
3. obtains provider-issued `PermissionDecision` objects before protected retrieval;
4. routes allowed results as signed/encrypted RCP `SecureEnvelope` objects;
5. one-time delivers those envelopes through an opaque relay;
6. verifies signature, authorization binding, lifetime, and ciphertext at the Consumer;
7. normalizes surviving data into provenance-carrying `ContextAssertion` objects;
8. persists those assertions and materializes a relationship brief.

It produces:

```text
out/canonical-trace.json
out/canonical-brief.txt
```

## Reference topology

```text
mail-provider -----------┐
messenger-provider ------┤
enterprise-provider -----┼--> opaque relay --> reference control-plane / consumer --> context store
phone-provider ----------┤
meeting-provider --------┘
```

Each Provider runs as its own process and owns its own:

- capability manifest;
- protected state;
- permission-decision cache;
- provider policy state;
- signing key material.

There is no shared Provider database.

## What the reference implementation proves

The workspace demonstrates that the v0.1 design can execute several important relationship-context boundaries coherently across independently stateful mock Providers.

### Provider-scoped identity resolution

The canonical scenario maps one logical person to provider-local identities under one tenant:

```text
person:b
├ demo:mail       -> provider-local:b-mail
├ demo:messenger  -> provider-local:b-messenger
├ demo:enterprise -> provider-local:b-enterprise
├ demo:phone      -> provider-local:b-phone
└ demo:meeting    -> provider-local:b-meeting
```

Only strong local evidence states are automatically bound in the reference resolver. Ambiguous/conflicted states do not silently merge, and resolutions are tenant-scoped.

The v0.2 design may narrow this into relationship-scoped identity dependencies rather than retain a generic `IdentityClaim` protocol object.

### Permission before retrieval

Protected state is not read at Provider startup, planning, or permission evaluation.

```text
Goal
 ↓
Identity resolution
 ↓
ProcessingPlan
 ↓
ProviderCapability selection
 ↓
provider-issued PermissionDecision
 ↓
execution-time capability revalidation
 ↓
Provider validates fresh issued allow
 ↓
protected-state lazy read
```

Tests reject forged decisions, request mutation, unresolved conditional decisions, revoked Providers, and stale decisions.

The v0.2 direction keeps the **no over-retrieval / no rights-expansion behavior** while reconsidering whether generic permission request/decision mechanics belong in RCP Core or an AuthZEN-compatible profile.

### Provider-side representation boundaries

The canonical Provider profiles distinguish:

- identity;
- interaction metadata;
- raw content;
- provider-generated context;
- external processing.

The planner prefers lower-risk provider-generated or metadata representations over raw content when possible.

This remains important to v0.2 because a Provider should be able to keep raw/private evidence internal while emitting an interoperable relationship projection.

### SecureEnvelope data path

After authorization, the v0.1 reference Providers encrypt/sign selected results using:

```text
rcp-jose-x25519-a256gcm-ed25519-v0.1
```

with:

- X25519 / `ECDH-ES`;
- `A256GCM`;
- Ed25519 detached JWS;
- RFC 8785 JSON canonicalization.

The Consumer validates sender/recipient/action/resource/purpose/destination/processing-location/decision binding before activating plaintext.

This remains useful crypto interoperability evidence, but v0.2 treats envelope/security mechanics as a binding/profile concern rather than the center of the semantic Core.

### Operator-blind relay

With `RCP_RELAY_URL`, Providers send `SecureEnvelope` objects to a relay and return receipts. The Consumer one-time retrieves and decrypts the ciphertext.

The relay has no Consumer private key and persists only minimized transfer metadata.

This demonstrates **payload blindness, not metadata anonymity**.

The relay is optional reference transport infrastructure; no v0.2 deployment is required to use it.

### ContextAssertion activation

Provider data is normalized without silently promoting it to verified fact.

Reference mappings include:

- provider-generated context → `system_interpretation`;
- interaction metadata → `extracted_fact`;
- allowed raw content → `source_statement`.

This epistemic separation is one of the strongest candidates for the v0.2 semantic Core.

### Persistent context and source revocation

The Consumer stores assertions and materializes current relationship context from active state.

Provider/source revocation can transition affected assertions, recompute the current brief, preserve unrelated context, and keep historical provenance.

The v0.2 design keeps the **downstream lifecycle consequence model** while reconsidering whether RCP needs to own a generic `RevocationEvent` transport object.

### Enterprise policy drift

The enterprise Provider can move from a permissive capability/policy version to a stricter runtime version.

Old authorization becomes stale and new retrieval is blocked before protected state is read.

The v0.2 design keeps policy/identity/source changes as material dependencies while moving generic authorization mechanics toward profiles/mappings.

### Raw-content boundary

The messenger Provider can expose provider-generated context while denying raw content export.

Known raw fixture strings are tested not to leak into the canonical clear result or relay audit.

This provider-side safe projection pattern remains central to the v0.2 architecture.

## Executable v0.1 scenarios

```bash
npm run smoke
npm run test:permission
npm run test:revocation
npm run test:policy
npm run test:relay
npm run test:identity
npm run demo
```

The CI workflow runs the relevant tests on pull requests.

Current v0.1 coverage includes:

- D1 — multi-provider relationship preparation;
- D2 — source revocation + downstream recomputation;
- D3 — enterprise policy drift + stale decisions;
- D4 — raw-content boundary / provider-context fallback;
- D5 — operator-blind encrypted relay;
- Provider-scoped identity resolution;
- one-command trace + human-readable brief.

## Current boundary of the claim

The reference ecosystem does **not** prove:

- that this service topology is the final RCP architecture;
- v0.2 semantic interoperability;
- adoption by any real platform;
- production-grade key management/security;
- legal correctness;
- metadata anonymity;
- external independent interoperability;
- security certification.

## Next direction

Do not add more mock infrastructure merely to make the v0.1 reference stack larger.

The next engineering work should use the reference ecosystem selectively as a testbed for the v0.2 semantic refactor:

1. encode multi-party projection scenarios;
2. encode conflicting/supporting/superseding evidence;
3. encode partial-source invalidation with independent surviving support;
4. encode policy-preserving derivation;
5. separate the semantic engine from HTTP/control-plane mechanics;
6. carry equivalent v0.2 semantic objects over at least two bindings, such as MCP and HTTP;
7. compare resulting relationship state for semantic equivalence.

Only after the v0.2 semantic surface stabilizes should the project resume unrelated clean-room implementation as the main milestone.
