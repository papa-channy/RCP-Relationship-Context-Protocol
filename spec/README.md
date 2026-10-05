# RCP Experimental Specification

This directory contains the protocol artifacts intended to become the normative RCP specification.

Current project status: **experimental draft, not a stable standard**.

## Normative draft

[`core-v0.1.md`](./core-v0.1.md) defines the current normative semantics for the experimental Core v0.1 work. `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` requirements in that document govern Core v0.1 behavior during M1.

The JSON Schemas under [`schemas/`](./schemas/) define machine-readable structural constraints. If a schema is less strict than the normative prose, implementations still need to follow the prose. M1 aims to eliminate such gaps where practical.

## Experimental normative profiles

- [`profiles/secure-envelope-binding-v0.1.md`](./profiles/secure-envelope-binding-v0.1.md) — binds an encrypted envelope to the exact action, resource, purpose, destination, processing location, decision, and authorization lifetime that produced it.
- [`profiles/crypto-jose-v0.1.md`](./profiles/crypto-jose-v0.1.md) — defines the first concrete `SecureEnvelope` cryptographic representation using JWE (`ECDH-ES` with X25519 + `A256GCM`), detached JWS (`Ed25519`), and RFC 8785 JSON canonicalization.

Profiles refine Core behavior for a specific interoperability surface. A profile does not override a stricter Core requirement.

## Registries

- [`registries/capabilities.md`](./registries/capabilities.md)
- [`registries/reason-codes.md`](./registries/reason-codes.md)
- [`registries/assertion-types.md`](./registries/assertion-types.md)
- [`registries/purposes.md`](./registries/purposes.md)
- [`registries/processing-locations.md`](./registries/processing-locations.md)

## Initial schema surface

- `identity-claim.schema.json`
- `provider-capability.schema.json`
- `permission-request.schema.json`
- `permission-decision.schema.json`
- `context-assertion.schema.json`
- `secure-envelope.schema.json`
- `revocation-event.schema.json`

All Core v0.1 wire objects carry `rcp_version: "0.1"`. A version mismatch MUST be treated as unsupported rather than silently coerced.

The current `SecureEnvelope` schema is bound to the experimental JOSE profile identifier `rcp-jose-x25519-a256gcm-ed25519-v0.1`. This is intentional for M1 interoperability testing; it is **not** a claim that the profile is production-ready or cryptographically reviewed.

## Status warning

Core v0.1 remains incomplete. It does not yet define a transport binding, global identity system, legal/jurisdiction profile, complete policy expression language, or production key-discovery/attestation model.

The JOSE profile is experimental and MUST receive independent security/interoperability review before RCP can make a production-grade cryptographic interoperability claim.

No implementation should claim production-grade RCP interoperability solely because it validates against the current schemas or passes the current conformance suite.

Before RCP v0.1 can be called a stable protocol specification, the normative prose, schemas, registries, examples, profiles, and conformance tests must converge and receive independent implementation/security review.
