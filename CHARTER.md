# RCP Project Charter

**Status:** Draft  
**Version:** 0.1

## 1. Mission

The Relationship Context Protocol (RCP) exists to make relationship context interoperable across independent digital systems **without collapsing the rights, privacy boundaries, organizational constraints, provenance, or policy attached to the underlying data**.

RCP is designed for a future in which users authorize personal AI systems and other software to act across multiple communication environments. The protocol's role is not to grant those systems unrestricted access. Its role is to provide a common way for cooperating systems to express what relationship data exists, what may be exchanged, why it may be processed, under which restrictions, and how those restrictions continue to apply to derived context.

## 2. Intended public benefit

RCP should make it possible for users to benefit from context-aware software without requiring every provider to expose unrestricted raw communication data or every consumer to reinvent permission, provenance, revocation, and policy handling.

The project prioritizes:

- user agency,
- provider sovereignty,
- counterparty privacy,
- organizational confidentiality,
- data minimization,
- interoperability,
- inspectability,
- reversibility,
- vendor neutrality.

## 3. Core principles

### 3.1 No expansion of rights

RCP MUST NOT create access rights that do not already exist through applicable authorization, law, contract, provider policy, or organization policy.

### 3.2 No central-custody requirement

RCP MUST NOT require relationship content to be stored by a central RCP operator.

Implementations SHOULD support direct or relay-based encrypted exchange where infrastructure operators cannot decrypt the relationship payload.

### 3.3 No protocol tax

The protocol itself should be freely implementable. Implementers should not owe transaction fees to the original protocol authors merely for conforming to RCP.

Managed infrastructure, support, certification, or other optional services may exist separately.

### 3.4 No privileged provider

RCP must not grant protocol-level preference to a particular communication provider, operating system, AI vendor, or cloud provider.

### 3.5 No data monetization mandate

RCP must not depend economically or technically on selling, profiling, advertising against, or centrally aggregating relationship content.

### 3.6 Restrictions survive transformation

Summarization, embedding, extraction, inference, aggregation, or other transformations MUST NOT silently erase restrictions inherited from source data.

### 3.7 Provenance is part of context

Persistent derived context MUST remain traceable to its origin or explicit user authorship.

### 3.8 Revocation must have consequences

When a permission, provider policy, organization policy, identity link, or source validity changes, affected downstream context MUST be re-evaluated.

### 3.9 Unknown is not permission

Unknown or unresolved permission MUST NOT be treated as consent.

### 3.10 Metadata is sensitive

RCP must treat social-graph metadata, routing metadata, interaction counts, and provenance as potentially sensitive even when content payloads are encrypted.

## 4. Explicit non-goals

RCP is not intended to become:

- an employee-surveillance protocol,
- a partner-surveillance tool,
- a social-credit or reputation system,
- a data-broker network,
- a global identity graph of private individuals,
- a mechanism to bypass closed-platform access controls,
- a behavioral advertising substrate,
- a universal store of private messages.

## 5. Relationship assistance boundary

RCP may support applications that help users remember commitments, prepare for interactions, recall preferences, and maintain relationships.

RCP should not encourage applications that exploit inferred vulnerabilities, coerce counterparties, secretly profile sensitive traits, or manipulate people through asymmetric private context.

## 6. Architecture philosophy

RCP distinguishes:

1. **Control Plane** — identity, capability, authorization, policy, routing, revocation.
2. **Secure Data Plane** — encrypted context exchange between authorized endpoints.
3. **Trust Plane** — signatures, provenance, audit, attestation, and conformance evidence.

The protocol should reveal only the minimum metadata needed for each plane to function.

## 7. Governance direction

Early development may be maintainer-led for speed and coherence.

If independent implementations and ecosystem participation emerge, the project should move toward:

- public RFCs,
- documented decision records,
- multiple maintainers,
- independent conformance testing,
- transparent security review,
- representative governance,
- eventually independent stewardship if justified.

No founding company should be guaranteed permanent unilateral control over the protocol.

## 8. Compatibility philosophy

RCP should reuse established standards where appropriate rather than reimplement identity, cryptography, transport, or authorization primitives without need.

RCP's distinctive scope is the semantics of **relationship-context interoperability and attached rights/policy**, not reinvention of the Internet stack.

## 9. Success criteria

RCP succeeds when independent parties can implement compatible systems and safely exchange relationship context under predictable rights and policy behavior.

Commercial revenue is not a protocol success criterion.

Useful indicators include:

- independent provider implementations,
- independent consumer implementations,
- conformance-suite interoperability,
- external security/privacy review,
- reproducible revocation behavior,
- adoption by platforms or standards communities.

## 10. Working maxim

> **Bring context together without collapsing its boundaries.**
