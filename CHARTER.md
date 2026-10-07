# RCP Project Charter

**Status:** Draft  
**Version:** 0.2 direction

## 1. Mission

The Relationship Context Protocol (RCP) exists to make **relationship context** interoperable across independent digital systems without collapsing participant scope, epistemic meaning, provenance, policy restrictions, organizational boundaries, or lifecycle dependencies.

RCP is designed for a world in which communication systems, social products, CRMs, enterprise platforms, personal applications, and AI agents may all need to exchange limited relationship context without centralizing the underlying evidence.

RCP's role is not to create a new global relationship database or generic agent transport. Its role is to define the **smallest transport-independent semantic contract** needed for independent systems to interpret relationship context consistently.

## 2. Intended public benefit

RCP should make it possible for people and organizations to benefit from relationship-aware software without requiring:

- unrestricted raw communication export,
- a universal private social graph,
- a mandatory RCP cloud,
- every Consumer to reinvent relationship scoping, epistemic classification, provenance dependency, invalidation, and policy-preserving derivation.

The project prioritizes:

- user agency,
- provider sovereignty,
- participant/counterparty privacy,
- organizational confidentiality,
- data minimization,
- interoperability,
- inspectability,
- reversibility,
- vendor neutrality,
- transport independence.

## 3. Core principles

### 3.1 No expansion of rights

RCP MUST NOT create access or usage rights that do not otherwise exist through applicable authorization, law, contract, provider policy, organization policy, or another valid basis.

### 3.2 Relationship semantics before infrastructure

RCP SHOULD standardize relationship-specific meaning and lifecycle rules before defining new infrastructure primitives.

If an established standard can solve a generic concern without losing RCP semantics, RCP SHOULD map to, profile, or bind that standard instead of replacing it.

### 3.3 No central-infrastructure dependency

A conforming Provider and Consumer MUST be able to exchange RCP semantic objects without depending on infrastructure operated by the RCP project or its original maintainers.

RCP MAY define optional relays, discovery services, SDKs, hosted gateways, or managed services, but none may become a protocol-mandated toll point.

### 3.4 Provider sovereignty

A Provider retains control over:

- its raw/private source data,
- internal search and indexing,
- deterministic or AI-powered derivation,
- exposed fidelity,
- authorization/policy authority,
- retention and disclosure controls.

RCP should allow a Provider to expose an interoperable relationship projection without exposing its raw evidence.

### 3.5 Multi-party scope must be preserved

Relationship context may involve multiple people, organizations, or other actors.

Evidence involving `{A,B,C}` MUST NOT silently become bilateral `{A,B}` context without an explicit narrower evidence basis.

### 3.6 Epistemic meaning must be preserved

Source statements, extracted facts, user observations, system interpretations, system inferences, verified facts, and strategies are not interchangeable.

Transport, repetition, summarization, aggregation, or model confidence MUST NOT silently promote weaker evidence into verified fact.

### 3.7 Restrictions survive transformation

Summarization, embedding, extraction, inference, aggregation, redaction, or other transformations MUST NOT silently erase restrictions inherited from material source evidence.

### 3.8 Provenance and evidence dependencies are part of context

Persistent derived context MUST remain traceable to material evidence dependencies or explicitly declare that provenance is intentionally opaque/unavailable.

Access to a derived assertion MUST NOT imply access to its source evidence.

### 3.9 Dependency changes have consequences

When a material source, identity binding, permission basis, provider policy, organization policy, or source validity changes, affected downstream relationship context MUST be re-evaluated.

The resulting action may be delete, invalidate, restrict, recompute, supersede, or retain based on independent valid support and current policy.

### 3.10 Historical lineage must remain honest

Recomputation MUST NOT rewrite history to imply a removed or revoked source was never used.

### 3.11 Unknown material semantics fail closed

Unknown or unresolved material relationship scope, policy dependency, lifecycle state, identity binding, or extension MUST NOT be interpreted as a more permissive known value.

### 3.12 Metadata is sensitive

Social-graph metadata, relationship identifiers, routing metadata, interaction counts, provenance, and dependency graphs can be sensitive even when content payloads are encrypted.

## 4. Protocol boundary

RCP is not intended to replace mature standards for generic concerns.

RCP should prefer established standards for areas such as:

- agent/application capability transport (for example MCP or A2A where appropriate),
- authentication/delegation (OAuth/OIDC or provider-native mechanisms),
- generic authorization request/decision mechanics (for example AuthZEN-compatible systems),
- dynamic security/revocation signal transport (for example Shared Signals/CAEP where applicable),
- provenance vocabulary (for example W3C PROV),
- policy vocabulary (for example ODRL/DPV where applicable),
- cryptographic primitives and envelopes (for example JOSE/COSE profiles).

RCP's distinctive scope is the **relationship-specific information model, participant scope, epistemic semantics, evidence dependencies, derivation/projection rules, lifecycle, restriction inheritance, and cross-provider composition behavior**.

## 5. Explicit non-goals

RCP is not intended to become:

- an employee-surveillance protocol,
- a partner-surveillance tool,
- a social-credit or reputation system,
- a data-broker network,
- a global identity graph of private individuals,
- a mechanism to bypass closed-platform access controls,
- a behavioral advertising substrate,
- a universal store of private messages,
- a new generic AI tool protocol,
- a new generic agent task protocol,
- a universal authorization engine,
- a universal policy language,
- a mandatory hosted service run by the project maintainers.

## 6. Relationship assistance boundary

RCP may support applications that help users or authorized organizations:

- remember commitments,
- prepare for interactions,
- recall preferences,
- preserve relationship history,
- coordinate customer or professional relationships,
- derive limited provider-side context for AI/agent workflows.

RCP should not encourage applications that exploit inferred vulnerabilities, coerce counterparties, secretly profile sensitive traits, or manipulate people through asymmetric private context.

## 7. Architecture philosophy

RCP v0.2 direction separates two categories:

### Semantic Core

Defines transport-independent relationship meaning:

- actor and relationship scope,
- interaction evidence,
- context assertions,
- epistemic classes,
- derivation/evidence dependencies,
- lifecycle and invalidation,
- policy/restriction behavior,
- cross-provider composition.

### Bindings and profiles

Define how Core semantics are carried or integrated through particular infrastructure:

- MCP,
- A2A,
- HTTP,
- provider-native APIs,
- AuthZEN-compatible authorization,
- Shared-Signals-compatible change/revocation signals,
- JOSE/COSE security profiles,
- provenance/policy mappings.

A binding MUST NOT redefine the semantic meaning of Core objects.

## 8. Compatibility philosophy

A concept belongs in RCP Core only if independent systems still need to agree on its meaning when the transport or agent framework changes.

The project SHOULD use the following test before adding a Core primitive:

> **Would this semantic agreement still be necessary if one implementation carried the object over MCP and another carried the equivalent object over plain HTTP?**

If not, the feature probably belongs in a binding/profile rather than Core.

## 9. Governance direction

Early development may be maintainer-led for speed and coherence.

If independent implementations and ecosystem participation emerge, the project should move toward:

- public RFCs,
- documented decision records,
- multiple maintainers,
- independent conformance testing,
- transparent security/privacy review,
- representative governance,
- eventually independent stewardship if justified.

No founding company or maintainer should be guaranteed permanent unilateral control over the protocol.

## 10. Success criteria

RCP succeeds when independent systems can produce, exchange, interpret, and update relationship context with predictable semantic results even when they use different underlying transports or runtime frameworks.

Strong evidence includes:

- independent implementations of the semantic model,
- equivalent semantic outcomes across multiple bindings,
- deterministic multi-party projection behavior,
- interoperable conflict/support/supersession semantics,
- reproducible source invalidation and recomputation behavior,
- external security/privacy review,
- demonstrated provider-side safe projection without mandatory raw-data export.

Commercial revenue, GitHub stars, or traffic through infrastructure operated by the original project are not protocol success criteria.

## 11. Working maxim

> **Bring context together without collapsing its boundaries.**
