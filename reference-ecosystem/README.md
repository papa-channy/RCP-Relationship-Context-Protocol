# RCP Reference Ecosystem

> Status: M2 experimental reference ecosystem. This is not a production deployment.

This workspace demonstrates RCP as a multi-provider interoperability system with separate provider process/state boundaries.

## Process topology

```text
mail-provider -----------┐
messenger-provider ------┤
enterprise-provider -----┼--> control-plane / consumer --> relationship context store
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
provider validates fresh issued allow
 ↓
protected state lazy-read
 ↓
provider_result encrypted as RCP SecureEnvelope
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

`POST /rcp/retrieve` returns an RCP `SecureEnvelope`, never plaintext provider data. Direct `/state` access remains unavailable.

When a provider-level source revocation is issued, that provider also fails closed for existing decision reuse and future permission evaluation.

## Control-plane endpoints

- `GET /health`
- `GET /rcp/providers`
- `GET /rcp/context?subject=...`
- `GET /rcp/brief?subject=...`
- `POST /rcp/plan`
- `POST /rcp/evaluate`
- `POST /rcp/execute`
- `POST /rcp/revoke-provider`

## Representation selection

For meeting preparation the planner prefers:

1. `provider_context`
2. `interaction_metadata`
3. `content`

An unconditional `allow` is preferred over a higher-fidelity `limited` representation. Current canonical selections are:

- mail → `provider_context`
- messenger → `provider_context`
- enterprise → `interaction_metadata`
- phone → `interaction_metadata`
- meeting → `provider_context`

## Permission and envelope invariants

Protected retrieval fails closed unless the decision was actually issued by that provider, remains `allow` and unexpired, the request and representation match the evaluated snapshot, and the capability version remains unchanged.

The provider encrypts selected results using:

`rcp-jose-x25519-a256gcm-ed25519-v0.1`

The consumer activates content only after provider signing-key discovery, detached JWS verification, exact authorization-scope/lifetime binding, JWE decryption, and decrypted provider-result binding.

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
- rejection of old decisions and new permission requests after provider revocation.

## Next M2 slice

Next, implement enterprise policy drift/staleness (D3): change organization/provider policy after an `allow`, mark the cached decision stale, and demonstrate planner downgrade or exclusion instead of reusing the old authorization.
