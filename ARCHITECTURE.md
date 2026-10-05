# RCP Architecture v0.1

**Status:** Design Draft

## 1. Goal

RCP defines an interoperability layer between **providers** that hold relationship-related data and **consumers** that are authorized to use a subset of that context.

A deployment may be fully decentralized, provider-to-consumer, or use optional relays. RCP does not require a central content-processing service.

## 2. Logical roles

- **User / Requester** — initiates a relationship-context use case.
- **Counterparty** — another human participating in the relationship.
- **Provider** — holds or derives source context.
- **Consumer** — receives permitted context for an authorized purpose.
- **Organization** — may impose policy on managed resources.
- **RCP Control Service** — evaluates/coordinates capability, authorization, and policy.
- **RCP Relay** — optional ciphertext transport.
- **Trust Service** — verifies signatures, attestations, provenance, and conformance claims.

A single real-world system may implement multiple roles.

## 3. Planes

### Control Plane

Carries machine-readable information such as:

- provider capability manifests,
- identity claims,
- permission requests and decisions,
- purposes,
- processing-location restrictions,
- destination restrictions,
- policy changes,
- revocations.

### Secure Data Plane

Carries encrypted payloads such as:

- context assertions,
- permitted content fragments,
- interaction metadata,
- provider-generated summaries.

The data plane SHOULD support payload encryption to an authorized consumer such that an intermediary relay cannot decrypt the payload.

### Trust Plane

Carries or verifies:

- provider signatures,
- consumer capability claims,
- provenance references,
- policy snapshots,
- audit events,
- optional remote attestation.

## 4. Minimal exchange flow

```text
User request
   │
   ▼
Consumer creates purpose-bound query
   │
   ▼
Providers advertise capabilities
   │
   ▼
Permission + policy evaluation
   │
   ▼
Minimum-data processing plan
   │
   ▼
Provider creates allowed context
   │
   ▼
Provider encrypts payload for consumer
   │
   ▼
Optional RCP relay transports ciphertext
   │
   ▼
Consumer verifies envelope + decrypts payload
   │
   ▼
Derived context retains provenance/policy dependency
```

## 5. Reference ecosystem

The first reference implementation should include five independent mock providers:

- Mail Provider — content export allowed.
- Messenger Provider — content denied, provider-side context allowed.
- Enterprise Provider — organization-managed policy and downgrade behavior.
- Phone Provider — interaction metadata only.
- Meeting Provider — event metadata with optional context assertions.

Each provider must maintain independent state, capability, policy, and signing keys.

## 6. Mandatory architecture properties

- Permission is evaluated before retrieval.
- Provider capabilities and permission are separate concepts.
- Raw payload custody by an RCP operator is optional, not required.
- Persistent derived data maintains provenance.
- Source revocation triggers descendant re-evaluation.
- Identity resolution is tenant-scoped by default.
- A group interaction is not automatically reduced to binary relationships.
- Policy changes can restrict existing derived data without pretending the historical derivation never occurred.

## 7. Non-normative deployment models

### Direct

`Provider → encrypted payload → Consumer`

### Relay

`Provider → encrypted payload → RCP Relay → Consumer`

### Provider-side derivation

`Provider raw data → provider internal derivation → signed ContextAssertion → Consumer`

### On-device aggregation

Multiple provider payloads are decrypted and merged only on the user's device.

## 8. Open architecture questions

- recipient-key discovery and rotation,
- pairwise/pseudonymous relationship identifiers,
- metadata-minimizing relay design,
- counterparty policy signaling,
- jurisdiction profile discovery,
- remote attestation semantics,
- multi-device user identity,
- federated RCP deployments.
