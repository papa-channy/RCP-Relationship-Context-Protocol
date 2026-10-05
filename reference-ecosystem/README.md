# RCP Reference Ecosystem

> **Status:** M2 implemented and CI-verified. Experimental reference software; not a production deployment, external-adoption claim, or security certification.

This workspace demonstrates RCP as an executable multi-provider interoperability system rather than a collection of standalone schemas.

## Run the canonical demo

```bash
cd reference-ecosystem
npm install
npm run demo
```

The demo starts five independent providers, an operator-blind relay, and the RCP control-plane/consumer. It then:

1. resolves five provider-scoped identities for the same human under one tenant;
2. creates a minimum-data `ProcessingPlan`;
3. obtains provider-issued `PermissionDecision` objects before protected retrieval;
4. routes allowed results as signed/encrypted RCP `SecureEnvelope` objects;
5. one-time delivers those envelopes through an opaque relay;
6. verifies signature, authorization binding, lifetime, and ciphertext at the consumer;
7. normalizes surviving data into provenance-carrying `ContextAssertion` objects;
8. persists those assertions and materializes a relationship brief.

It produces:

```text
out/canonical-trace.json   # machine-readable end-to-end trace
out/canonical-brief.txt    # human-readable relationship brief
```

The same artifacts are uploaded by the GitHub Actions reference-ecosystem workflow.

## Process topology

```text
mail-provider -----------┐
messenger-provider ------┤
enterprise-provider -----┼--> RCP opaque relay --> control-plane / consumer --> context store
phone-provider ----------┤
meeting-provider --------┘
```

Each provider runs as its own process and owns its own:

- capability manifest;
- protected state file;
- permission-decision cache;
- provider policy state;
- signing key material.

There is no shared provider database.

## Canonical provider profiles

| Provider | Identity | Interaction metadata | Raw content | Provider context | External processing |
| --- | --- | --- | --- | --- | --- |
| mail | allow | allow | allow | allow | allow |
| messenger | allow | allow | deny | allow | limited |
| enterprise | allow | allow | deny | limited | limited |
| phone | allow | allow | deny | deny | limited |
| meeting | allow | allow | limited | allow | limited |

The canonical planner prefers:

1. `provider_context`
2. `interaction_metadata`
3. `content`

while preferring an unconditional `allow` over a higher-fidelity `limited` representation.

The initial meeting-preparation plan therefore selects:

- mail → `provider_context`
- messenger → `provider_context`
- enterprise → `interaction_metadata`
- phone → `interaction_metadata`
- meeting → `provider_context`

The phone step remains conditional in the canonical scenario, so four provider sources become executable.

## Provider-scoped identity resolution

RCP does not assume that one global platform identifier represents Human B everywhere.

The canonical scenario begins with five user-confirmed provider identities:

```text
person:b
├ demo:mail       -> provider-local:b-mail
├ demo:messenger  -> provider-local:b-messenger
├ demo:enterprise -> provider-local:b-enterprise
├ demo:phone      -> provider-local:b-phone
└ demo:meeting    -> provider-local:b-meeting
```

The control plane creates RCP `IdentityClaim` objects and a tenant-scoped resolution. The logical PermissionRequest subject remains `person:b`, while each provider resource uses the provider-local subject and retains the supporting `identity_claim_ref`.

The reference resolver automatically binds only:

- `verified`
- `provider_confirmed`
- `user_confirmed`

Claims marked `probable`, `possible`, `conflicted`, or `rejected` are not silently merged. Identity resolutions are tenant-scoped and cannot be read through a different tenant.

Canonical identity seeds are in:

```text
scenarios/canonical-identity-seeds.json
```

## Permission before retrieval

Protected state is not read at provider startup, during planning, or during permission evaluation.

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
provider validates fresh issued allow
 ↓
protected state lazy-read
```

A provider rejects retrieval unless:

- the decision ID was actually issued by that provider process;
- the decision is `allow` and unexpired;
- the evaluated request still matches exactly;
- the selected representation still matches;
- the current capability version still matches the evaluated version.

The tests explicitly reject forged decisions, request mutation after evaluation, unresolved conditional decisions, revoked providers, and stale decisions.

## SecureEnvelope data path

After authorization, providers do not return plaintext protected results to the consumer path.

The selected provider result is encrypted and signed using the experimental profile:

```text
rcp-jose-x25519-a256gcm-ed25519-v0.1
```

The current profile uses:

- X25519 / `ECDH-ES`
- `A256GCM`
- Ed25519 detached JWS
- RFC 8785 JSON canonicalization

Consumer activation requires:

1. provider signing-key discovery;
2. detached JWS verification;
3. sender/recipient/action/resource/purpose/destination/processing-location/decision binding;
4. authorization lifetime validation;
5. JWE decryption with the consumer recipient key;
6. decrypted provider-result binding validation.

Cryptographic authenticity never substitutes for authorization validation.

## Operator-blind relay

With `RCP_RELAY_URL` enabled, providers send the SecureEnvelope to the relay and return only an `rcp.relay_receipt`.

The consumer then one-time retrieves the ciphertext envelope from the relay before performing its normal verification and decryption.

The relay has no consumer private key and exposes no key or decrypt endpoint. After successful delivery, pending ciphertext is removed from relay memory.

Its persistent audit is intentionally minimized to transfer metadata such as:

- sender / recipient;
- action and resource class;
- purpose / destination / processing location;
- permission-decision reference;
- crypto profile identifiers;
- ciphertext byte length and SHA-256;
- received / delivered timestamps.

It does not persist:

- JWE ciphertext after delivery;
- `resource_ref`;
- provider-result objects;
- relationship statements;
- raw provider content;
- consumer private keys.

This demonstrates **operator-blind payload routing**, not metadata anonymity. Unlinkable routing and stronger traffic-analysis resistance remain future privacy work.

## ContextAssertion activation

After decryption, provider data is normalized rather than silently promoted to verified fact.

Current reference mapping:

- provider-generated context → `system_interpretation`, provenance `provider_generated`;
- interaction metadata → `extracted_fact`, assertion type `event`;
- explicitly allowed raw content → `source_statement`.

Every persistent assertion retains source provenance and inherited policy references.

## Persistent context and source revocation — D2

The consumer stores assertions by logical subject and materializes the current relationship brief only from `active` assertions.

Provider revocation does not rewrite history:

```text
before
  mail        active
  messenger   active
  enterprise  active
  meeting     active

revoke demo:messenger

historical store
  mail        active
  messenger   revoked
  enterprise  active
  meeting     active

current brief
  active assertions = 3
```

After provider revocation:

- matching provenance is transitioned to `revoked`;
- unrelated context survives;
- the brief is recomputed;
- old provider decisions cannot be reused;
- future permission evaluation fails closed.

## Enterprise policy drift — D3

The enterprise demo supports a runtime transition:

```text
managed-context-v1 / capability 1
  interaction_metadata = allow
  provider_context     = limited
  external_processing  = limited

            ↓

lockdown-v2 / capability 2
  interaction_metadata = deny
  provider_context     = deny
  content              = deny
  external_processing  = deny
```

When this change occurs after an `allow` was issued:

- the provider rejects replay of the old decision;
- the control plane independently sees the capability-version mismatch and marks the step `stale` before retrieval;
- the enterprise protected-read counter remains unchanged;
- unaffected providers continue;
- replanning under v2 excludes the enterprise source with `no_usable_representation`.

Previously persisted context is not retroactively reclassified in this slice. A formal `restricted` lifecycle state is future specification work rather than an overloaded use of `revoked` or `invalidated`.

## Raw-content boundary — D4

The messenger provider contains raw fixture content but advertises:

```text
content = deny
provider_context = allow
```

The canonical flow can therefore receive provider-generated context without exporting the underlying raw message. Tests assert that known raw mail/message/enterprise/transcript strings do not leak into the clear canonical result or relay audit.

## Executable scenarios

```bash
npm run smoke
npm run test:permission
npm run test:revocation
npm run test:policy
npm run test:relay
npm run test:identity
npm run demo
```

The CI workflow runs all of them on every relevant pull request.

### Coverage

- **D1 — multi-provider relationship preparation:** implemented
- **D2 — source revocation + downstream recomputation:** implemented
- **D3 — enterprise policy drift + stale decisions:** implemented
- **D4 — raw-content boundary / provider-context fallback:** implemented and tested
- **D5 — operator-blind encrypted relay:** implemented
- **Provider-scoped identity resolution:** implemented for the canonical user-confirmed case
- **One-command trace + human brief:** implemented

## Current boundary of the claim

M2 demonstrates that the current RCP v0.1 design can be executed coherently across independent mock provider boundaries.

It does **not** prove:

- adoption by Google, Apple, Kakao, Microsoft, Meta, or any other platform;
- production-grade key management or transport security;
- jurisdiction-wide legal correctness;
- metadata anonymity;
- external independent interoperability;
- security certification.

Those require separate work and external review.

## Next direction

With the reference ecosystem now executable end-to-end, the next useful work should shift from adding more mock behavior to external validation:

1. have an independent developer implement one Provider or Consumer from the public spec without using the reference code;
2. conduct an external security/privacy review of the Core + JOSE profile + relay metadata model;
3. tighten the remaining normative gaps discovered by those reviews;
4. only then consider a real non-RCP platform bridge as a compatibility demonstration.
