# RCP Reference Ecosystem

> Status: M2 experimental reference ecosystem. This is not a production deployment.

This workspace demonstrates RCP as a multi-provider interoperability system with separate provider process/state boundaries.

## Process topology

Direct mode remains available for earlier scenarios, while D5 adds an explicit opaque relay:

```text
mail-provider -----------┐
messenger-provider ------┤
enterprise-provider -----┼--> RCP opaque relay --> control-plane / consumer --> relationship context store
phone-provider ----------┤
meeting-provider --------┘
```

Each provider owns its own capability manifest, protected state file, permission-decision cache, policy state, and ephemeral signing key material. There is no shared provider database.

## Protected-data flow

```text
Goal
 ↓
ProcessingPlan
 ↓
provider-issued PermissionDecision
 ↓
execution-time capability revalidation
 ↓
provider validates fresh issued allow
 ↓
protected state lazy-read
 ↓
provider_result encrypted as RCP SecureEnvelope
 ↓
(optional) opaque relay stores ciphertext temporarily
 ↓
consumer one-time pulls SecureEnvelope
 ↓
JWS verification + authorization-scope binding check
 ↓
JWE decryption
 ↓
ContextAssertion normalization
 ↓
persistent relationship context store
 ↓
materialized relationship brief
```

Protected state is not read at provider startup or during planning/evaluation.

## Provider endpoints

- `GET /health`
- `GET /rcp/capabilities`
- `GET /rcp/keys`
- `POST /rcp/permissions/evaluate`
- `POST /rcp/retrieve`
- `POST /rcp/revocations/provider`

The enterprise demo provider additionally exposes:

- `POST /rcp/demo/policy-profile`

The policy-profile endpoint is a **reference-scenario control**, not a proposed RCP Core endpoint. It lets the test harness move the enterprise provider from capability/policy version 1 to a stricter version 2 while the process is running.

Without a relay, `POST /rcp/retrieve` returns an RCP `SecureEnvelope`. With `RCP_RELAY_URL` configured on the provider, the provider sends that envelope directly to the relay and returns only an `rcp.relay_receipt` to the caller. Direct `/state` access remains unavailable.

When a provider-level source revocation is issued, that provider also fails closed for existing decision reuse and future permission evaluation.

## Opaque relay endpoints

The D5 relay exposes:

- `GET /health`
- `GET /rcp/audit`
- `POST /rcp/envelopes`
- `GET /rcp/envelopes/:relay_id`

The relay intentionally exposes no key or decrypt endpoint.

The relay receives the RCP `SecureEnvelope`, so it can observe the **clear envelope metadata** that the protocol places outside the JWE. It does not receive the consumer private key and does not import the JOSE decryption stack. The protected provider result remains JWE ciphertext until the consumer retrieves and decrypts it.

Delivery is one-time in the reference implementation: after `GET /rcp/envelopes/:relay_id`, the pending envelope is deleted from relay memory.

The relay's persistent audit deliberately stores less than the transient envelope:

- relay/envelope IDs;
- sender and recipient;
- action, resource class, purpose, destination, processing location;
- permission decision reference;
- payload/signature profile names;
- ciphertext byte length;
- SHA-256 of the ciphertext;
- received/delivered timestamps.

It does **not** persist:

- the JWE ciphertext itself after delivery;
- `resource_ref`;
- provider result objects;
- relationship statements;
- raw content;
- consumer private keys.

D5 therefore demonstrates **operator-blind payload routing**, not metadata anonymity. Metadata minimization and unlinkable routing remain separate protocol/privacy problems.

## Control-plane endpoints

- `GET /health`
- `GET /rcp/providers`
- `GET /rcp/context?subject=...`
- `GET /rcp/brief?subject=...`
- `POST /rcp/plan`
- `POST /rcp/evaluate`
- `POST /rcp/execute`
- `POST /rcp/revoke-provider`

When `RCP_RELAY_URL` is configured, execution expects provider relay receipts, pulls the corresponding envelope from the relay exactly once, and then performs the same signature, authorization-binding, and decryption checks used by direct mode.

## Representation selection

For meeting preparation the planner prefers:

1. `provider_context`
2. `interaction_metadata`
3. `content`

An unconditional `allow` is preferred over a higher-fidelity `limited` representation. Under the initial provider profiles the canonical selections are:

- mail → `provider_context`
- messenger → `provider_context`
- enterprise → `interaction_metadata`
- phone → `interaction_metadata`
- meeting → `provider_context`

## Permission and envelope invariants

Protected retrieval fails closed unless the decision was actually issued by that provider, remains `allow` and unexpired, the request and representation match the evaluated snapshot, and the capability version remains unchanged.

The control plane performs its own execution-time capability revalidation before calling `/rcp/retrieve`. A decision is treated as stale when:

- the provider's current `capability_version` differs from the version captured by the plan, or
- the `PermissionDecision` does not contain the expected `capability:<version>` policy binding.

A stale step is skipped before protected retrieval. Provider-side checks independently reject stale decision replay as a second fail-closed boundary.

The provider encrypts selected results using:

`rcp-jose-x25519-a256gcm-ed25519-v0.1`

The consumer activates content only after provider signing-key discovery, detached JWS verification, exact authorization-scope/lifetime binding, JWE decryption, and decrypted provider-result binding. Relay transport does not weaken or replace any of those checks.

## Persistent context and recomputation

Activated assertions are stored by subject without discarding provenance. The materialized relationship brief contains only assertions whose current lifecycle status is `active`.

A provider source revocation does **not** erase historical provenance. Matching assertions are transitioned to `revoked`, while unrelated assertions remain active. The relationship brief is then recomputed from the surviving active assertions.

Current D2 example:

```text
before revocation
  mail        active
  messenger   active
  enterprise  active
  meeting     active
  brief count = 4

revoke demo:messenger

historical store
  mail        active
  messenger   revoked
  enterprise  active
  meeting     active
  total assertions = 4

current brief
  active assertions = 3
```

Replaying the same revocation is idempotent at the consumer materialized-state layer: an already revoked assertion is not revoked a second time or assigned a new lifecycle transition.

## Enterprise policy drift and staleness

The D3 scenario starts with the enterprise provider under `managed-context-v1` / capability version `1`. In that state, `interaction_metadata` is allowed and a meeting-preparation request can receive an `allow` decision.

The test then switches the running provider to `lockdown-v2` / capability version `2`:

```text
managed-context-v1
  capability version = 1
  interaction_metadata = allow
  provider_context     = limited
  external_processing  = limited

          ↓ policy change

lockdown-v2
  capability version = 2
  interaction_metadata = deny
  provider_context     = deny
  content              = deny
  external_processing  = deny
```

After the change:

1. direct replay of the old version-1 decision is rejected by the enterprise provider;
2. execution of the already-evaluated plan marks the enterprise step `stale` before retrieval;
3. the enterprise provider's protected-read counter remains unchanged;
4. the other still-valid providers continue executing;
5. a new plan discovers capability version 2 and marks enterprise `unavailable` with `no_usable_representation`;
6. a new direct permission request for the old representation is denied under version 2.

This D3 slice intentionally does **not** retroactively delete or reclassify previously persisted enterprise assertions. Policy-change effects on already-retained context require an explicit lifecycle state such as `restricted`, which should be specified separately rather than overloading `revoked` or `invalidated`.

## ContextAssertion normalization

- provider-generated context → `system_interpretation`, provenance `provider_generated`, visibility `redacted`;
- interaction metadata → `extracted_fact`, assertion type `event`, visibility `type_only`;
- raw content, if explicitly selected and allowed, remains a `source_statement`.

Every activated assertion retains provider/resource source references and inherited permission-policy references.

## Tests

```bash
npm install
npm run smoke
npm run test:permission
npm run test:revocation
npm run test:policy
npm run test:relay
```

The test suite verifies:

- independent provider topology;
- permission-before-retrieval;
- forged/tampered/conditional decision rejection;
- SecureEnvelope provider→consumer delivery;
- ContextAssertion provenance activation;
- absence of raw protected content from clear canonical output;
- persistent context storage;
- provider source revocation;
- historical assertion retention with `revoked` status;
- deterministic brief recomputation from unaffected sources;
- rejection of old decisions and new permission requests after provider revocation;
- runtime enterprise policy/capability drift;
- control-plane and provider-side stale-decision enforcement;
- replanning under the new policy without reusing old authorization;
- provider→relay→consumer SecureEnvelope routing;
- zero relay decryption keys/capability;
- one-time ciphertext delivery and removal;
- metadata-minimized relay audit containing transfer counts/size/hash but no protected relationship plaintext or resource identifier.

## Remaining M2 work

D1, D2, D3, and D5 now have dedicated executable scenarios, and D4 raw-content boundaries are exercised by the permission and relay tests. Before calling M2 complete, the reference ecosystem still needs a canonical one-command demonstration that ties these pieces together, produces a machine-readable execution trace plus a human-readable relationship brief, and makes the provider-scoped identity resolution step explicit rather than relying on the current preselected `person:b` subject.
