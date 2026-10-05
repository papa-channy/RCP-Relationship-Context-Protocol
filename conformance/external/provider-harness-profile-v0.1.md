# RCP External Provider Interop Harness Profile v0.1

> Status: experimental black-box test profile. **This is not RCP Core transport.**

This profile defines a small HTTP surface solely so the RCP project can test an independently implemented Provider as a separate process without importing its code.

An implementation may conform to RCP Core without implementing this HTTP profile. Passing this profile means only that the Provider is interoperable with the tested harness surface.

## 1. Test target

The harness targets one Provider process at:

```text
RCP_PROVIDER_URL=http://127.0.0.1:<port>
```

The Provider under test must own a synthetic conformance fixture subject supplied to the harness as:

```text
RCP_TEST_PROVIDER_SUBJECT=<provider-local-subject>
```

The fixture must be non-production data.

## 2. Required endpoints

### `GET /rcp/capabilities`

Returns a Core v0.1 `ProviderCapability`.

The harness requires at least one unconditional `allow` among:

1. `provider_context`
2. `interaction_metadata`
3. `content`

unless `RCP_TEST_REPRESENTATION` explicitly selects another supported representation understood by the harness.

### `GET /rcp/keys`

Returns:

```json
{
  "provider": "provider-id",
  "signing_keys": [
    {"kty":"OKP","crv":"Ed25519","x":"...","kid":"..."}
  ]
}
```

At least one public Ed25519 JWK must be usable for the experimental JOSE SecureEnvelope profile.

### `POST /rcp/permissions/evaluate`

Input:

```json
{
  "request": {"type":"rcp.permission_request","rcp_version":"0.1","...":"..."},
  "representation": "provider_context",
  "satisfied_limitations": []
}
```

The Provider returns a Core v0.1 `PermissionDecision`.

For the synthetic test resource and selected unconditional representation, the harness expects an executable `allow` with an expiration time and a policy dependency identifying the current Provider capability version.

The harness may also submit malformed, forged, or mutated attempts to verify fail-closed behavior.

### `POST /rcp/retrieve`

Input:

```json
{
  "request": {"...":"the exact evaluated PermissionRequest"},
  "decision_id": "decision-id",
  "representation": "provider_context",
  "recipient": "conformance:consumer",
  "recipient_public_jwk": {"kty":"OKP","crv":"X25519","x":"...","kid":"..."}
}
```

For a valid executable decision, return one Core v0.1 `SecureEnvelope` using:

```text
rcp-jose-x25519-a256gcm-ed25519-v0.1
```

The clear envelope fields must remain bound to the evaluated request and decision.

The encrypted plaintext for this harness is expected to be an object with at least:

```json
{
  "type": "rcp.provider_result",
  "rcp_version": "0.1",
  "provider": "provider-id",
  "resource": "provider-id:representation:fixture-subject",
  "representation": "representation",
  "decision_id": "decision-id",
  "items": []
}
```

The exact application semantics of `items` are not tested beyond valid JSON array representation in v0.1.

## 3. Required negative behavior

The Provider must fail closed for at least these harness cases:

- unknown/forged decision ID;
- request mutation after evaluation;
- representation mismatch after evaluation;
- unsupported or denied representation;
- stale/expired decision when the test environment can trigger it.

The harness treats any protected plaintext returned directly in place of a SecureEnvelope as failure when the JOSE profile is claimed.

## 4. Consumer key material

The harness generates a fresh X25519 recipient key pair for each run and sends only the public JWK to the Provider.

The Provider must not require access to the recipient private key.

## 5. Provider signing key

The harness obtains the Provider public signing key only from `/rcp/keys` for this test profile.

Production RCP key discovery is not specified by this harness.

## 6. Authorization binding checks

The harness verifies that the returned envelope exactly matches the evaluated request/decision for:

- sender;
- recipient;
- action;
- resource;
- purpose;
- destination;
- processing location;
- permission decision reference;
- authorization lifetime.

A cryptographically valid envelope with incorrect authorization metadata fails.

## 7. Report

The harness writes a machine-readable report including:

- implementation name/version supplied by environment metadata;
- Provider ID;
- selected representation;
- test cases and pass/fail status;
- crypto profile;
- deviations/errors;
- timestamp.

A passing report is evidence for this harness profile only.

## 8. Environment variables

Required:

```text
RCP_PROVIDER_URL
RCP_TEST_PROVIDER_SUBJECT
```

Optional:

```text
RCP_TEST_REPRESENTATION
RCP_IMPLEMENTATION_NAME
RCP_IMPLEMENTATION_VERSION
RCP_IMPLEMENTATION_LANGUAGE
RCP_CONFORMANCE_REPORT
```

## 9. Separation from RCP Core

The endpoint names, HTTP status choices, and `rcp.provider_result` harness plaintext shape are test-binding conventions.

They must not be cited as mandatory RCP Core behavior unless separately adopted into a future normative transport/profile specification.
