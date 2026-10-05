# RCP Experimental Specification

This directory contains the protocol artifacts intended to become the normative RCP specification.

Current project status: **experimental draft, not a stable standard**.

## Normative draft

[`core-v0.1.md`](./core-v0.1.md) defines the current normative semantics for the experimental Core v0.1 work. `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` requirements in that document govern Core v0.1 behavior during M1.

The JSON Schemas under [`schemas/`](./schemas/) define machine-readable structural constraints. If a schema is less strict than the normative prose, implementations still need to follow the prose. M1 aims to eliminate such gaps where practical.

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

## Status warning

Core v0.1 is intentionally incomplete. It does not yet define a stable cryptographic profile, transport binding, global identity system, legal/jurisdiction profile, or policy expression language.

No implementation should claim production-grade RCP interoperability solely because it validates against the current schemas.

Before RCP v0.1 can be called a stable protocol specification, the normative prose, schemas, registries, examples, and conformance tests must converge and receive independent implementation/security review.
