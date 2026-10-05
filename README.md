# RCP — Relationship Context Protocol

> **Experimental protocol. RCP is not yet a standard and is not production-certified.**

**RCP is an open protocol for exchanging relationship context across platforms while preserving the rights, policies, provenance, and privacy boundaries attached to the underlying data.**

People maintain relationships across many independent systems: email, messaging, meetings, phone calls, calendars, enterprise collaboration tools, and future personal AI systems. Each platform sees only part of a relationship, while the permissions attached to that data differ across users, counterparties, organizations, and providers.

RCP explores a common interoperability layer for that problem.

RCP is **not** a central relationship database and **not** a protocol for bypassing platform permissions. Its goal is to let cooperating providers exchange the minimum relationship context a user is allowed to use, under explicit machine-readable policy, without requiring an RCP infrastructure operator to read the protected payload.

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

A personal AI that helps A prepare for a meeting with B should not need unrestricted access to every underlying service. A provider may permit only interaction metadata, another may expose provider-generated context, and an enterprise system may prohibit external processing entirely.

RCP makes those differences explicit and interoperable.

## Core model

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
│        intermediary need not decrypt payload             │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                     RCP TRUST PLANE                      │
│ Signature · Provenance · Audit · Policy dependencies     │
└──────────────────────────────────────────────────────────┘
```

The control plane decides **what may happen**.  
The data plane moves **what is allowed to move**.  
The trust plane preserves **why the result can be trusted and where it came from**.

## Example

Assume A communicates with B through several RCP-aware providers:

| Provider profile | Identity | Interaction metadata | Raw content | Provider context | External processing |
| --- | --- | --- | --- | --- | --- |
| Mail-like | allow | allow | allow | allow | allow |
| Messenger-like | allow | allow | deny | allow | limited |
| Enterprise-like | allow | allow | deny | limited | organization policy |
| Phone-like | allow | allow | deny | deny | metadata only |
| Meeting-like | limited | allow | limited | allow | allow |

A asks:

> Prepare me for my next interaction with B.

An RCP consumer can:

1. resolve provider-specific identities for B within the user's scope,
2. discover each provider's capabilities,
3. build a minimum-data processing plan **before retrieval**,
4. evaluate permissions and policy dependencies,
5. select only an allowed representation,
6. receive protected context in a signed/encrypted `SecureEnvelope`,
7. preserve provenance when activating `ContextAssertion` objects,
8. recompute downstream relationship context when a source is revoked,
9. invalidate stale authorization when provider/organization policy changes.

The protocol does **not** turn `A can view this` into `RCP may freely copy, retain, derive, disclose, or train on this`.

## Core invariants

RCP starts from a small set of non-negotiable rules:

- RCP **MUST NOT** expand a user's existing rights.
- Access **MUST NOT** imply delegation.
- Delegation **MUST NOT** imply processing.
- Processing **MUST NOT** imply retention or derivation.
- Retention **MUST NOT** imply disclosure.
- Provider capability **MUST NOT** be treated as permission.
- Transformation **MUST NOT** erase source restrictions.
- Persistent derived context **MUST** retain provenance.
- Unknown permission **MUST NOT** execute.
- Stale authorization **MUST NOT** execute.
- Cross-user counterparty profiling is denied by default.
- RCP infrastructure **SHOULD NOT** require custody of plaintext relationship content.
- RCP infrastructure **SHOULD** be deployable so an intermediary cannot decrypt protected relationship payloads.

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

## Experimental Core v0.1 surface

The current Core surface is intentionally small:

1. `IdentityClaim`
2. `ProviderCapability`
3. `PermissionRequest` / `PermissionDecision`
4. `ContextAssertion`
5. `SecureEnvelope`
6. `RevocationEvent`

Normative experimental semantics live in [`spec/core-v0.1.md`](./spec/core-v0.1.md), with schemas under [`spec/schemas`](./spec/schemas/) and profiles/registries under [`spec`](./spec/).

The current JOSE profile uses:

- X25519 + `ECDH-ES`,
- `A256GCM`,
- Ed25519 detached JWS,
- RFC 8785 JSON canonicalization.

This profile is **experimentally interoperable in the repository tests**, not independently security-certified.

## Run the end-to-end reference demo

The repository contains five independently stateful mock Providers, a control-plane/consumer, an operator-blind relay, tenant-scoped identity resolution, permission-before-retrieval enforcement, encrypted data exchange, persistent relationship context, revocation/recomputation, and policy-drift scenarios.

```bash
cd reference-ecosystem
npm install
npm run demo
```

The canonical demo produces:

```text
reference-ecosystem/out/canonical-trace.json
reference-ecosystem/out/canonical-brief.txt
```

The flow is:

```text
provider-scoped identity claims
        ↓
ProcessingPlan
        ↓
provider-issued PermissionDecision
        ↓
execution-time capability revalidation
        ↓
protected state lazy-read
        ↓
JOSE SecureEnvelope
        ↓
operator-blind relay (optional transport)
        ↓
consumer verification + decryption
        ↓
ContextAssertion + provenance
        ↓
relationship context store / brief
```

See [`reference-ecosystem/README.md`](./reference-ecosystem/README.md).

## Conformance and interoperability evidence

Current repository evidence includes:

- schema-positive and schema-negative fixtures;
- fail-closed permission semantics;
- capability/representation boundary tests;
- identity tenant-isolation tests;
- provenance ancestor-access separation;
- derived-policy inheritance;
- revocation propagation;
- stale-decision behavior;
- JOSE tamper/wrong-key/algorithm-substitution tests;
- **Node ↔ Python bidirectional SecureEnvelope interoperability**;
- an external black-box Provider harness that does not import the reference implementation;
- CI self-test of that harness against a separately running Provider process.

Run the existing suites from [`conformance/README.md`](./conformance/README.md).

### Test an independently implemented Provider

Read [`docs/IMPLEMENTER_GUIDE.md`](./docs/IMPLEMENTER_GUIDE.md) and the non-normative [`conformance/external/provider-harness-profile-v0.1.md`](./conformance/external/provider-harness-profile-v0.1.md), then run:

```bash
npm install --prefix conformance/external

RCP_PROVIDER_URL=http://127.0.0.1:9001 \
RCP_TEST_PROVIDER_SUBJECT=provider-local:test-subject \
RCP_IMPLEMENTATION_NAME=my-provider \
RCP_IMPLEMENTATION_VERSION=0.1.0 \
RCP_IMPLEMENTATION_LANGUAGE=rust \
RCP_CONFORMANCE_REPORT=./provider-report.json \
npm run provider --prefix conformance/external
```

Use [`docs/INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md`](./docs/INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md) to report results.

**No unrelated third-party clean-room implementation has been claimed as passing yet.** The black-box harness makes that validation externally testable; it does not substitute for the validation itself.

## External validation — start here

RCP is now actively looking for **independent implementation and adversarial review**, not adoption endorsements.

- [External validation index](./docs/outreach/README.md)
- [Technical brief](./docs/outreach/TECHNICAL_BRIEF.md)
- [Clean-room Provider implementation challenge](./docs/outreach/IMPLEMENTATION_CHALLENGE.md)
- [Security & privacy review request](./docs/outreach/SECURITY_REVIEW_REQUEST.md)
- [Recommended outreach sequence](./docs/outreach/OUTREACH_SEQUENCE.md)

If you did not participate in RCP's design and can either implement the tested Provider profile, identify an interoperability ambiguity, or produce a strong security/privacy counterexample, that evidence is more useful to the project right now than additional feature requests.

Current validation milestone: [Issue #19 — first unrelated clean-room implementation](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/19).

## Operator-blind relay claim

The reference relay demonstrates **payload blindness, not metadata anonymity**.

The relay can route a signed/encrypted `SecureEnvelope` without possessing recipient private keys. It may still observe protocol-visible envelope metadata. The demo minimizes the relay's persistent audit and removes transient ciphertext after one-time delivery, but RCP does not currently claim unlinkable or metadata-private routing.

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
│   ├── outreach/
│   ├── IMPLEMENTER_GUIDE.md
│   ├── INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md
│   ├── SECURITY_PRIVACY_REVIEW_CHECKLIST.md
│   ├── threat-and-rights-model.md
│   ├── rights-and-permission-model.md
│   ├── data-object-model.md
│   └── provenance-and-derivation-model.md
├── spec/
│   ├── core-v0.1.md
│   ├── profiles/
│   ├── registries/
│   └── schemas/
├── conformance/
│   ├── external/
│   ├── crypto/
│   └── fixtures/
├── implementations/
│   └── python-probe/
├── reference-ecosystem/
│   ├── packages/
│   ├── services/
│   ├── scenarios/
│   └── tests/
├── examples/
└── rfcs/
```

## Project status

**Stage:** experimental Core + executable reference ecosystem + external-validation readiness  
**Stability:** experimental  
**Production use:** not recommended  
**Reference ecosystem:** implemented and CI-verified  
**Internal cross-language interoperability:** demonstrated (Node ↔ Python)  
**External black-box validation surface:** implemented  
**Independent third-party interoperability claim:** not yet established  
**Independent security/privacy review:** not yet completed

The protocol documents remain drafts that should be challenged. Passing current tests does not imply legal compliance, formal verification, cryptographic proof, or production security.

## Roadmap

Completed engineering milestones include:

- [x] Public foundation and project charter
- [x] Rights/threat, permission, data-object, and provenance models
- [x] Experimental Core v0.1 + machine-readable schemas/registries
- [x] Schema/semantic/privacy-boundary conformance suite
- [x] JOSE SecureEnvelope profile + tamper/negative tests
- [x] Node ↔ Python bidirectional crypto interoperability
- [x] Five-provider reference ecosystem
- [x] Permission-before-retrieval flow
- [x] Relationship ContextAssertion persistence + provenance
- [x] Source revocation + downstream recomputation
- [x] Enterprise policy drift + stale decision enforcement
- [x] Operator-blind payload relay
- [x] Provider-scoped identity resolution
- [x] One-command canonical demo
- [x] Clean-room implementer guide and external Provider harness
- [x] Independent implementation report template and security/privacy review checklist
- [ ] First unrelated clean-room Provider/Consumer implementation
- [ ] Independent security/privacy review
- [ ] Production-grade key discovery/rotation/revocation profile
- [ ] First real public-platform bridge
- [ ] Standards-community / platform interoperability outreach

See [ROADMAP.md](./ROADMAP.md).

## Governance direction

RCP is intended to become neutral infrastructure rather than a proprietary platform. If the project gains independent implementers, governance should evolve toward an open RFC process and eventually an independent stewardship model.

There is no requirement that RCP traffic pass through infrastructure operated by the original authors.

## Contributing

The most useful contributions now are independent and adversarial:

- implement an RCP Provider or Consumer **without using the reference implementation as a library**;
- run the external black-box harness and report ambiguities;
- identify a rights conflict the model cannot express;
- produce a counterexample to a permission invariant;
- demonstrate an ambiguous or unsafe identity merge;
- show a revocation/policy-drift case that is not handled correctly;
- review the JOSE/key-discovery assumptions;
- review privacy leakage through relay-visible metadata or provenance.

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security and privacy review

Relationship metadata and provenance can be sensitive even when payloads are encrypted. Security reports should follow [SECURITY.md](./SECURITY.md).

Reviewers can use [`docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md`](./docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md) as a bounded review aid. Completion of that checklist is not certification.

## Licensing

Reference code and machine-readable schemas are intended to be available under the Apache License 2.0. Specification and documentation licensing will be finalized before a stable normative release.

---

RCP's working principle is simple:

> **Bring context together without collapsing its boundaries.**
