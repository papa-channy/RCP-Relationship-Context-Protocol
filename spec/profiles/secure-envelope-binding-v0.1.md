# RCP Secure Envelope Authorization Binding Profile v0.1

> **Status: Experimental Normative Profile**
>
> This profile refines the `SecureEnvelope` authorization-binding requirements of RCP Core v0.1. It does not define the cryptographic algorithm profile.

## 1. Purpose

A `SecureEnvelope` is not an independent grant. It transports a protected payload under authority already evaluated through a `PermissionRequest` and `PermissionDecision`.

The envelope MUST therefore contain enough policy-visible metadata to prove that it does not broaden the authorization on which it relies.

## 2. Required authorization fields

A Core v0.1 `SecureEnvelope` conforming to this profile MUST contain:

- `permission_decision_ref`
- `action`
- `resource_ref`
- `purpose`
- `destination`
- `processing_location`
- `issued_at`
- `expires_at`

`resource_class` remains descriptive classification metadata. `resource_ref` is the authorization scope binding.

## 3. Reference chain

Given:

```text
PermissionRequest R
       ↓ evaluated as
PermissionDecision D
       ↓ authorizes
SecureEnvelope E
```

all of the following MUST hold before E's protected payload may be activated:

1. `D.request_id == R.request_id`
2. `E.permission_decision_ref == D.decision_id`
3. `D.decision == allow`
4. `E.action == R.action`
5. `E.resource_ref == R.resource`
6. `E.purpose == R.purpose`
7. `E.destination == R.destination`
8. `E.processing_location == R.processing_location`

A mismatch in any required binding is authorization failure. Implementations MUST NOT repair a mismatch by choosing the more permissive value.

## 4. Temporal binding

The envelope MUST NOT predate the authorization decision:

```text
E.issued_at >= D.evaluated_at
```

The envelope MUST NOT outlive the authorization on which it depends:

```text
E.expires_at <= D.expires_at
```

At activation time, both D and E MUST be unexpired and non-stale.

An implementation MAY choose an envelope expiry earlier than the decision expiry.

## 5. Missing request dimensions

This profile is intended for operations that transfer an encrypted protected payload. Before such an envelope is produced, the underlying `PermissionRequest` MUST resolve `resource`, `purpose`, `destination`, and `processing_location`.

If one of these dimensions is not applicable to a future operation type, a future profile MUST define that case explicitly. An implementation MUST NOT use omission to bypass a policy dimension that is material to authorization.

## 6. Recipient and destination

`recipient` identifies the technical envelope recipient. `destination` identifies the policy destination authorized by the request.

These values MAY differ. For example, an envelope can be technically delivered to a consumer process while the authorized destination is a user's private memory store.

Therefore an implementation MUST NOT substitute `recipient` for `destination` during policy evaluation.

## 7. Relay behavior

A relay MAY route an envelope without access to the plaintext payload. A relay that cannot validate the full referenced permission chain MAY forward the opaque envelope under its relay policy, but it MUST NOT claim that the payload is authorized for activation.

The final activating consumer MUST validate the authorization binding or rely on an integrity-protected attestation defined by a future profile.

## 8. Failure behavior

The protected payload MUST NOT be activated when:

- the decision is missing;
- the referenced request is missing when required for validation;
- the decision is not `allow`;
- the decision is stale, revoked, or expired;
- the envelope is expired;
- the envelope predates the decision;
- the envelope outlives the decision;
- action, resource, purpose, destination, or processing location differs from the authorized request.

These failures are fail-closed. They do not authorize a best-effort downgrade.

## 9. Conformance

The canonical M1 cases are in `conformance/cross-object-cases.json` and are evaluated by `conformance/run.py`.

Conformance to this profile does not imply cryptographic interoperability. The first stable RCP cryptographic profile remains separate work.
