# RCP — Relationship Context Protocol

> **Experimental draft. RCP is not yet a standard.**

**RCP is an open protocol for exchanging relationship context across platforms while preserving the rights, policies, provenance, and privacy boundaries attached to the underlying data.**

People maintain relationships across many independent systems: email, messaging, meetings, phone calls, calendars, enterprise collaboration tools, and future personal AI systems. Each platform sees only part of a relationship, while the permissions attached to that data differ across users, counterparties, organizations, and providers.

RCP explores a common interoperability layer for that problem.

RCP is **not** a central relationship database and **not** a protocol for bypassing platform permissions. Its goal is to let cooperating providers exchange the minimum relationship context a user is allowed to use, under explicit machine-readable policy, without requiring the RCP infrastructure operator to read the underlying payload.

## Why RCP?

A single relationship may be distributed like this:

```text
                     Human B
                        │
          ┌─────────────┼─────────────┐
          │             │             │
        Email       Messaging       Phone
          │             │             │
       Meetings       Social        Calendar
          │             │             │
          └─────────────┼─────────────┘
                        │
                     Human A
```

A personal AI that helps A prepare for a meeting with B should not need unrestricted access to every underlying service. A provider may permit only metadata, another may provide a provider-generated context assertion, and an enterprise system may prohibit external processing entirely.

RCP attempts to make those differences interoperable.

## Core idea

RCP separates three concerns:

```text
┌──────────────────────────────────────────────────────────┐
│                    RCP CONTROL PLANE                     │
│ Identity · Capability · Permission · Policy · Revocation │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                  RCP SECURE DATA PLANE                   │
│       Provider → encrypted context → Consumer            │
│       RCP infrastructure need not decrypt payload        │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                     RCP TRUST PLANE                      │
│ Signature · Provenance · Audit · Attestation · Metering  │
└──────────────────────────────────────────────────────────┘
```

The control plane knows **what may happen**.  
The data plane moves **what is allowed to move**.  
The trust plane proves **how it happened**.

## Example

Assume A communicates with B through four RCP-aware providers:

| Provider profile | Identity | Interaction metadata | Raw content | Provider context | External processing |
| --- | --- | --- | --- | --- | --- |
| Mail-like | allow | allow | allow | allow | allow |
| Messenger-like | allow | allow | deny | allow | limited |
| Enterprise-like | allow | allow | deny | limited | organization policy |
| Phone-like | allow | allow | deny | none | metadata only |

A asks:

> Prepare me for my next interaction with B.

An RCP consumer can:

1. resolve provider-specific identities for B,
2. discover each provider's capabilities,
3. build a minimum-data processing plan,
4. evaluate permissions and policies before retrieval,
5. obtain only the allowed context,
6. preserve provenance and restrictions on derived context,
7. recompute or invalidate downstream context when a source is revoked.

The protocol does **not** turn `A can view this` into `RCP may freely copy, retain, derive, disclose, or train on this`.

## Core invariants

RCP starts from a small set of non-negotiable rules:

- RCP **MUST NOT** expand a user's existing rights.
- Access **MUST NOT** imply delegation.
- Delegation **MUST NOT** imply processing.
- Processing **MUST NOT** imply retention or derivation.
- Retention **MUST NOT** imply disclosure.
- Provider capability **MUST NOT** be treated as legal permission.
- Transformation **MUST NOT** erase source restrictions.
- Persistent derived context **MUST** retain provenance.
- Unknown permission **MUST NOT** execute.
- Cross-user counterparty profiling is denied by default.
- RCP infrastructure **SHOULD NOT** require custody of relationship content.
- RCP infrastructure **SHOULD** be deployable so the operator cannot decrypt relationship payloads.

See [CHARTER.md](./CHARTER.md) for the project principles.

## What RCP is not

RCP is not:

- a personal CRM product,
- a social-scoring system,
- a surveillance protocol,
- a data broker,
- a mechanism for scraping closed platforms,
- a requirement to centralize private conversations,
- a proprietary toll road that every implementation must call.

The protocol is intended to be **vendor-neutral and freely implementable**.

## Initial protocol surface

The first experimental protocol surface is intentionally small:

1. `IdentityClaim`
2. `ProviderCapability`
3. `PermissionRequest` / `PermissionDecision`
4. `ContextAssertion`
5. `SecureEnvelope`
6. `RevocationEvent`

Draft JSON Schemas live in [`spec/schemas`](./spec/schemas/).

## Repository layout

```text
.
├── README.md
├── CHARTER.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── CONTRIBUTING.md
├── SECURITY.md
├── docs/
│   ├── threat-and-rights-model.md
│   ├── rights-and-permission-model.md
│   ├── data-object-model.md
│   ├── provenance-and-derivation-model.md
│   └── glossary.md
├── spec/
│   ├── README.md
│   └── schemas/
├── examples/
│   ├── relationship-query.json
│   └── providers/
├── reference/
│   └── README.md
└── conformance/
    └── README.md
```

## Reference ecosystem goal

The first meaningful milestone is **RCP Reference Ecosystem v0.1**, not integration with a specific commercial platform.

The reference ecosystem will simulate multiple independent providers with intentionally different capability and policy profiles:

```text
Mail Provider ─────┐
Messenger Provider ├──→ RCP Core ───→ Relationship Consumer
Enterprise Provider├──→           ───→ Personal AI Adapter
Phone Provider ────┤
Meeting Provider ──┘
```

Each provider should have its own data store, policy state, capability manifest, and keys. The demo should show successful context exchange, policy downgrade, source revocation, and downstream recomputation.

## Project status

**Stage:** pre-spec / reference architecture  
**Stability:** experimental  
**Production use:** not recommended  
**Interoperability claims:** none yet

The current documents are design drafts. They should be treated as hypotheses to challenge, not settled standards.

## Roadmap

Near-term milestones:

- [x] Project charter
- [x] Initial rights and threat model
- [x] Initial permission model
- [x] Initial data object model
- [x] Initial provenance/derivation model
- [x] Draft minimal JSON schemas
- [ ] Normative Core Specification v0.1
- [ ] Reference RCP Core
- [ ] Five independent mock providers
- [ ] Secure envelope implementation
- [ ] Relationship consumer demo
- [ ] Revocation propagation demo
- [ ] Organization policy-change demo
- [ ] Conformance suite
- [ ] Independent third-party provider implementation
- [ ] External security/privacy review

See [ROADMAP.md](./ROADMAP.md).

## Governance direction

RCP is intended to become neutral infrastructure rather than a proprietary platform. If the project gains independent implementers, governance should evolve toward an open RFC process and eventually an independent stewardship model.

There is no requirement that RCP traffic pass through infrastructure operated by the original authors.

## Contributing

The most useful contributions at this stage are adversarial:

- identify a rights conflict the model cannot express,
- produce a counterexample to a permission invariant,
- demonstrate an ambiguous identity merge,
- show a revocation case that cannot be propagated correctly,
- implement the draft schema independently and report where it is underspecified.

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

Relationship metadata and provenance can be sensitive even when payloads are encrypted. Security reports should follow [SECURITY.md](./SECURITY.md).

## Licensing

Reference code and machine-readable schemas are intended to be available under the Apache License 2.0. Specification and documentation licensing will be finalized before a normative release.

---

RCP's working principle is simple:

> **Bring context together without collapsing its boundaries.**
