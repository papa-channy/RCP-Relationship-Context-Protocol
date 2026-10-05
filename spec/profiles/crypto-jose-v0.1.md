# RCP JOSE Cryptographic Profile v0.1

> **Status: Experimental Normative Profile**
>
> Profile identifier: `rcp-jose-x25519-a256gcm-ed25519-v0.1`
>
> This profile defines one concrete cryptographic representation for RCP `SecureEnvelope`. It intentionally composes existing IETF/JOSE mechanisms rather than defining new cryptographic primitives.

## 1. Goals

This profile provides:

- recipient-only confidentiality for the protected relationship payload,
- authenticated encryption of the protected payload,
- sender authenticity and integrity for the complete policy-visible envelope,
- cryptographic binding between clear authorization metadata and encrypted payload,
- deterministic signature input across implementations,
- explicit algorithm allowlists and downgrade resistance.

This profile does not define network key discovery, certificate issuance, hardware attestation, or post-quantum migration.

## 2. Normative references

This profile uses:

- RFC 7515 — JSON Web Signature (JWS)
- RFC 7516 — JSON Web Encryption (JWE)
- RFC 7517 — JSON Web Key (JWK)
- RFC 7518 — JSON Web Algorithms (JWA)
- RFC 7797 — JWS Unencoded Payload Option
- RFC 8037 — X25519/Edwards-curve use with JOSE
- RFC 8785 — JSON Canonicalization Scheme (JCS)
- RFC 9864 — Fully-Specified JOSE/COSE Algorithms

## 3. Cryptographic suite

A conforming implementation of this profile MUST use exactly:

### Payload encryption

- JWE Compact Serialization
- key management algorithm: `ECDH-ES`
- recipient ECDH curve: `X25519`
- content encryption algorithm: `A256GCM`

The combination of the JWE algorithm identifiers and the required X25519 recipient key is fixed by this profile. Implementations MUST NOT substitute a NIST EC curve, RSA key-management algorithm, CBC content encryption, or a different GCM key size while claiming this profile identifier.

### Envelope signature

- JWS Flattened JSON Serialization with detached payload
- JWS algorithm: `Ed25519`
- unencoded payload option: `b64=false`
- `crit` MUST contain `b64`

`Ed25519` is the fully-specified JOSE algorithm identifier defined by RFC 9864. Implementations of this profile MUST NOT emit the polymorphic legacy `EdDSA` identifier.

### Canonicalization

The detached JWS payload MUST be the UTF-8 bytes of the RFC 8785 JCS canonical representation of the unsigned RCP envelope defined below.

## 4. Key separation

Encryption and signing MUST use distinct key pairs.

Recipient encryption key:

```json
{
  "kty": "OKP",
  "crv": "X25519",
  "kid": "..."
}
```

Sender signing key:

```json
{
  "kty": "OKP",
  "crv": "Ed25519",
  "alg": "Ed25519",
  "kid": "..."
}
```

A conforming implementation MUST NOT use the same private key material for both encryption/key agreement and signing.

Private key material MUST NOT be carried inside an RCP envelope.

## 5. Key identifiers and resolution

Both JWE and JWS protected headers MUST contain `kid`.

`kid` is an opaque key identifier scoped to the key issuer/resolver. This profile does not define a network discovery URL.

Before encryption or verification, an implementation MUST resolve `kid` through a trusted provider/consumer key registry or another future RCP key-discovery profile.

If the referenced key is unknown, revoked, outside its validity window, or has the wrong key type/curve/use, processing MUST fail closed.

## 6. JWE protected payload

The relationship payload MUST be serialized to JSON and canonicalized using RFC 8785. The UTF-8 bytes of that canonical JSON are the JWE plaintext.

The JWE Compact Serialization protected header MUST include:

```json
{
  "alg": "ECDH-ES",
  "enc": "A256GCM",
  "kid": "<recipient encryption key id>",
  "typ": "application/rcp+jwe",
  "cty": "application/rcp+json"
}
```

ECDH-ES will additionally carry the ephemeral public key parameters required by JOSE.

`zip` MUST NOT be used in this profile.

The recipient MUST enforce an allowlist containing only `ECDH-ES` for key management and `A256GCM` for content encryption when validating this profile.

## 7. SecureEnvelope representation

Under this profile, `SecureEnvelope.payload` is:

```json
{
  "profile": "rcp-jose-x25519-a256gcm-ed25519-v0.1",
  "jwe": "<JWE Compact Serialization>"
}
```

The `jwe` value is opaque to relays.

## 8. Unsigned envelope

To generate the sender signature:

1. construct the complete RCP `SecureEnvelope`, including the encrypted `payload`, but excluding the `signature` member;
2. validate that object against the applicable RCP structural and authorization-binding rules;
3. canonicalize the entire unsigned envelope with RFC 8785 JCS;
4. UTF-8 encode the canonical JSON;
5. use those bytes as the detached JWS payload.

This binds the signature to, at minimum:

- sender,
- recipient,
- action,
- resource reference and class,
- purpose,
- destination,
- processing location,
- permission decision reference,
- policy references,
- issue/expiry times,
- encrypted payload bytes as represented by the JWE string.

A relay or consumer MUST NOT modify any signed field and retain the existing signature.

## 9. Detached JWS

The JWS protected header MUST contain:

```json
{
  "alg": "Ed25519",
  "kid": "<sender signing key id>",
  "typ": "application/rcp+jws",
  "b64": false,
  "crit": ["b64"]
}
```

The detached Flattened JWS representation stored in the envelope MUST omit the `payload` member and retain only the protected-header and signature values.

`SecureEnvelope.signature` is therefore:

```json
{
  "profile": "rcp-jose-x25519-a256gcm-ed25519-v0.1",
  "protected": "<base64url JWS protected header>",
  "signature": "<base64url Ed25519 signature>"
}
```

## 10. Verification order

A recipient activating protected RCP content MUST perform at least this logical sequence:

1. validate RCP envelope structure and `rcp_version`;
2. confirm the cryptographic profile identifier is supported;
3. resolve the sender signing key by `kid`;
4. reconstruct the unsigned envelope by removing `signature`;
5. JCS-canonicalize the unsigned envelope;
6. verify the detached JWS with an explicit `Ed25519` allowlist and required `b64` critical-header processing;
7. validate `PermissionRequest -> PermissionDecision -> SecureEnvelope` authorization binding and freshness;
8. resolve the recipient X25519 private key by the JWE `kid`;
9. decrypt the JWE while explicitly allowing only `ECDH-ES` + `A256GCM`;
10. parse and validate the decrypted RCP payload before use.

An implementation MAY perform safe structural parsing before signature validation, but MUST NOT treat unauthenticated policy metadata as authoritative.

## 11. Failure behavior

Processing MUST fail closed when any of the following occurs:

- unsupported profile identifier;
- unsupported or unexpected JWS/JWE algorithm;
- missing or unknown `kid`;
- signing key is not Ed25519;
- recipient key is not X25519;
- JWS protected header does not contain `b64=false` and `crit:["b64"]` semantics;
- JWS verification fails;
- envelope authorization binding fails;
- JWE authentication/decryption fails;
- `zip` is present;
- the decrypted payload cannot be parsed or validated as the expected RCP protected content.

Implementations MUST NOT retry with weaker algorithms after a profile validation failure.

## 12. Metadata visibility

This profile encrypts the relationship payload but intentionally leaves authorization/routing metadata visible because RCP control-plane components may need it for policy enforcement and routing.

Implementations MUST treat this metadata as sensitive relationship metadata and minimize logging/retention. This profile does not claim traffic-analysis resistance or metadata anonymity.

## 13. Key rotation and revocation

A key registry used with this profile MUST be able to mark a `kid` inactive or revoked.

New envelopes MUST NOT be created with a revoked key.

Consumers MUST reject signatures from a signing key that was already revoked at the envelope's `issued_at`, unless a future archival-validation profile explicitly defines trusted historical validation semantics.

A decryption key MAY remain locally available for a bounded retention period solely to process previously authorized stored ciphertext when policy permits. Key retention MUST NOT override source-data deletion or revocation requirements.

## 14. Testability

The reference conformance implementation for this profile SHOULD use independent JOSE/JCS libraries rather than hand-rolled cryptographic primitives.

At minimum, tests MUST demonstrate:

- encrypt → sign → verify → decrypt success;
- metadata tampering breaks signature verification;
- ciphertext tampering breaks signature and/or JWE authentication;
- wrong signing key fails;
- wrong recipient key fails;
- algorithm substitution is rejected;
- unsupported profile is rejected.

## 15. Security status

This is an experimental profile and has not received an independent cryptographic/security review. It MUST NOT yet be represented as production-grade RCP security guidance.
