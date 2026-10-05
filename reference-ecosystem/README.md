# RCP Reference Ecosystem

> Status: M2 experimental reference ecosystem. This is not a production deployment.

This workspace demonstrates RCP as a multi-provider interoperability system with separate provider process/state boundaries.

## Process topology

```text
mail-provider -----------┐
messenger-provider ------┤
enterprise-provider -----┼--> control-plane / consumer
phone-provider ----------┤
meeting-provider --------┘
```

Each provider owns its own capability manifest, protected state file, permission-decision cache, policy state, and ephemeral signing key material. There is no shared provider database.

## Current protected-data flow

```text
Goal
 ↓
POST /rcp/plan
 ↓
ProcessingPlan + minimum representation selection
 ↓
POST /rcp/evaluate
 ↓
provider-issued PermissionDecision
 ↓
POST /rcp/execute
 ↓
provider validates fresh issued allow
 ↓
protected state lazy-read
 ↓
provider_result encrypted as RCP SecureEnvelope
 ↓
consumer discovers provider signing key
 ↓
JWS verification + authorization-scope binding check
 ↓
JWE decryption
 ↓
ContextAssertion normalization + provenance activation
```

Protected state is not read at provider startup or during planning/evaluation.

## Provider endpoints

- `GET /health`
  - exposes only provider identity and a non-sensitive `protected_reads` test counter.
- `GET /rcp/capabilities`
- `GET /rcp/keys`
  - exposes the provider's public signing JWK only.
- `POST /rcp/permissions/evaluate`
- `POST /rcp/retrieve`
  - returns an RCP `SecureEnvelope`, never the plaintext provider result.

Direct `/state` access remains unavailable.

## Control-plane endpoints

- `GET /health`
- `GET /rcp/providers`
- `POST /rcp/plan`
- `POST /rcp/evaluate`
- `POST /rcp/execute`

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

When external processing is not unconditionally allowed and provider-local processing exists, execution remains at the provider boundary.

## Provider-side authorization invariants

Protected retrieval fails closed unless:

- the decision ID was issued by that provider process;
- the decision is `allow` and unexpired;
- the capability version is unchanged;
- the request exactly matches the evaluated snapshot;
- the representation exactly matches the evaluated representation;
- a recipient encryption public key is supplied.

The protected state read occurs only after those checks.

## SecureEnvelope activation invariants

The provider encrypts the selected provider result using the experimental profile:

`rcp-jose-x25519-a256gcm-ed25519-v0.1`

The consumer activates decrypted context only after:

1. provider signing-key discovery,
2. detached JWS verification,
3. exact match of sender/recipient/action/resource/purpose/destination/processing location/decision ID,
4. authorization lifetime check,
5. JWE decryption under the consumer recipient key,
6. decrypted provider-result binding check.

Cryptographic authenticity does not replace authorization-scope validation.

## ContextAssertion normalization

Decrypted provider results are normalized by the consumer:

- provider-generated context → `system_interpretation`, provenance `provider_generated`, visibility `redacted`;
- interaction metadata → `extracted_fact`, assertion type `event`, visibility `type_only`;
- raw content, if ever explicitly selected and allowed, remains a `source_statement` rather than being promoted to a verified fact.

Every activated assertion contains provider/resource source references and inherited permission-policy references.

## Tests

```bash
npm install
npm run smoke
npm run test:permission
```

The integration test verifies:

- zero protected reads before execution;
- forged decision rejection;
- request-mutation rejection;
- unresolved conditional rejection;
- only executable steps trigger state reads;
- provider→consumer data travels as JOSE `SecureEnvelope` objects;
- four canonical provider results activate as four provenance-carrying `ContextAssertion` objects;
- raw mail/message/enterprise/transcript strings do not appear in clear execution output.

## Next M2 slice

Next, add persistent relationship-context aggregation and deterministic recomputation so source revocation can invalidate/rebuild the final relationship brief without losing provenance from unaffected providers.
