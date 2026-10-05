# RCP Experimental Specification

This directory contains the artifacts that define the experimental RCP Core v0.1 protocol contract.

Current project status: **experimental draft, not a stable standard**.

## Normative Core surface

[`core-v0.1.md`](./core-v0.1.md) defines the current normative semantics for experimental Core v0.1. `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` requirements in that document govern Core behavior.

The JSON Schemas under [`schemas/`](./schemas/) define machine-readable structural constraints. If a schema is less strict than the normative prose, implementations still need to follow the prose. The project aims to eliminate such gaps where practical.

## Experimental normative profiles

- [`profiles/secure-envelope-binding-v0.1.md`](./profiles/secure-envelope-binding-v0.1.md) — binds an encrypted envelope to the exact action, resource, purpose, destination, processing location, decision, and authorization lifetime that produced it.
- [`profiles/crypto-jose-v0.1.md`](./profiles/crypto-jose-v0.1.md) — defines the first concrete `SecureEnvelope` cryptographic representation using JWE (`ECDH-ES` with X25519 + `A256GCM`), detached JWS (`Ed25519`), and RFC 8785 JSON canonicalization.
- [`profiles/context-selection-boundaries-v0.1.md`](./profiles/context-selection-boundaries-v0.1.md) — prevents capability substitution (for example raw content export when only provider context is allowed) and prevents group interactions from silently collapsing into bilateral relationship context.

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

The current `SecureEnvelope` schema is bound to the experimental JOSE profile identifier `rcp-jose-x25519-a256gcm-ed25519-v0.1`. This is intentional for interoperability testing; it is **not** a claim that the profile is production-ready or cryptographically reviewed.

## Normative vs non-normative project material

A clean-room implementer should be able to implement Core behavior from:

1. this `/spec` directory;
2. the machine-readable schemas and registries referenced here;
3. [`../docs/IMPLEMENTER_GUIDE.md`](../docs/IMPLEMENTER_GUIDE.md), which explains how to read the experimental specification without depending on reference internals.

The following are **not Core transport requirements**:

- `/reference-ecosystem` service topology and HTTP endpoints;
- `/conformance/external/provider-harness-profile-v0.1.md` HTTP routes;
- demo ports, process layout, storage choices, or mock-provider state files;
- any implementation-specific module/package structure.

Those resources exist to demonstrate and test observable behavior. An implementation MAY use a completely different transport or architecture as long as it satisfies the applicable normative Core/profile contract.

## External implementation evidence

The M3 external Provider harness provides a non-normative black-box test surface for independently implemented Providers. Passing that harness can provide interoperability evidence for the cases it covers, but the harness does not redefine Core semantics.

Independent implementation results should use [`../docs/INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md`](../docs/INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md), and security/privacy review should use [`../docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md`](../docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md) as a bounded review aid.

## Status warning

Core v0.1 remains incomplete. It does not yet define a normative transport binding, global identity system, legal/jurisdiction profile, complete policy expression language, complete interaction wire model, or production key-discovery/attestation model.

The JOSE profile is experimental and MUST receive independent security/interoperability review before RCP can make a production-grade cryptographic interoperability claim.

No implementation should claim production-grade RCP interoperability solely because it validates against the current schemas or passes the current conformance suite.

Before RCP v0.1 can be called a stable protocol specification, the normative prose, schemas, registries, examples, profiles, and conformance tests must converge and receive independent implementation/security review.
