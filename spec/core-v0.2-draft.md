# RCP Semantic Core v0.2 — Design Draft

> **Status: Non-normative design draft**
>
> This document proposes the next RCP Core direction. It does not replace the experimental normative v0.1 contract yet. RCP v0.1 remains reproducible for existing schemas, reference implementations, and conformance evidence until v0.2 wire objects and tests are explicitly adopted.

## 1. Design thesis

RCP should define a **transport-independent information and lifecycle model for relationship context**.

The Core should remain meaningful whether an implementation carries RCP objects through MCP, A2A, plain HTTP, a platform-native API, or another interoperable binding.

RCP should not own generic infrastructure when mature standards already exist for that concern.

The v0.2 design target is therefore:

> **portable, policy-bearing, provenance-bearing, stateful relationship context**

rather than a universal agent transport, authorization engine, cryptographic stack, or social network protocol.

## 2. Core problem

Relationship context differs from ordinary documents, tool responses, or social-graph edges in several ways:

1. **multi-party scope** — context often concerns two or more people and organizations rather than a single owner;
2. **epistemic meaning** — a source statement, extracted fact, observation, interpretation, inference, and recommendation are not interchangeable;
3. **distributed evidence** — different providers may hold independent, supporting, conflicting, or superseding evidence about the same relationship;
4. **derived state** — commitments, open loops, relationship state, and preparation context are often derived from underlying interactions;
5. **policy-bearing derivation** — summarization or inference does not automatically erase source restrictions;
6. **lifecycle coupling** — correction, revocation, identity changes, or policy changes can require downstream invalidation or recomputation;
7. **provider-local truth** — providers may expose a safe projection without exporting raw evidence;
8. **cross-provider composition** — consumers need predictable rules for combining independently produced relationship context.

RCP exists only if these semantics require interoperable meaning beyond generic transport/runtime protocols.

## 3. Non-goals

The v0.2 semantic Core should not define:

- a universal network transport;
- a mandatory RCP-operated gateway, relay, registry, database, or cloud service;
- a generic AI tool invocation protocol;
- a generic agent-to-agent task protocol;
- a universal authentication/login system;
- a generic authorization engine;
- a universal provenance ontology;
- a universal policy language;
- custom cryptographic primitives;
- a global person identifier or global private social graph;
- a universal taxonomy such as `best_friend`, `trusted_contact`, or a relationship score.

Bindings and profiles may reuse MCP, A2A, HTTP, OAuth/OIDC, AuthZEN, Shared Signals, W3C PROV, ODRL/DPV, JOSE/COSE, or other standards.

## 4. Candidate semantic concepts

The following are candidate concepts for v0.2. They are not yet frozen as seven or eight independent wire-object schemas.

### 4.1 `ActorReference`

A scoped reference to a person, organization, service, agent, or other actor relevant to relationship context.

Required semantic properties:

- identifier meaning is scoped;
- string equality does not imply global identity equality;
- actor references may be provider-local;
- identity evidence/bindings may be material dependencies;
- uncertain identity evidence cannot silently merge sensitive relationship histories.

RCP should not define a universal person-identity system.

### 4.2 `RelationshipScope`

Defines the relationship or participant set to which context applies.

Candidate fields/concepts:

- `relationship_ref` — optional stable local reference;
- `participants` — actors the resulting context concerns;
- `source_participants` — actors involved in the source interaction/evidence;
- `scope_type` — bilateral, group, organization-mediated, provider-defined extension;
- `tenant_scope` / `trust_domain` — identity/context isolation boundary;
- `identity_dependency_refs` — bindings required to interpret the scope.

#### Core invariant: no silent participant collapse

Evidence involving `{A,B,C}` MUST NOT automatically become context about `{A,B}` merely because A and B are both present.

A narrower projection requires an explicit basis showing why the evidence supports that narrower relationship scope.

### 4.3 `InteractionEvidence`

Represents evidence from an interaction without requiring raw content export.

It may reference or describe:

- message/thread interaction;
- meeting/call;
- calendar/event participation;
- CRM/customer interaction;
- social interaction;
- provider-generated event;
- user-authored evidence;
- another namespaced source type.

The evidence representation may be:

- opaque reference;
- type-only metadata;
- interaction metadata;
- bounded source statement;
- provider-generated projection.

RCP must allow a provider to keep raw evidence private while emitting interoperable derived context.

### 4.4 `ContextAssertion`

`ContextAssertion` remains the central semantic unit.

An assertion says one bounded thing about a relationship scope, subject, event, commitment, preference, state, or strategy and carries enough metadata to interpret its epistemic and lifecycle meaning.

Candidate assertion families include:

- source statement;
- fact/extracted fact;
- observation;
- commitment/open loop;
- preference;
- shared topic/state;
- interpretation;
- inference;
- strategy/recommendation;
- event/interaction summary.

RCP should avoid a universal ontology of social closeness or relationship scoring.

### 4.5 `EpistemicClass`

At minimum, implementations need a shared distinction between:

- `source_statement` — a source stated something; truth is not independently asserted;
- `verified_fact` — independently verified under a documented policy;
- `extracted_fact` — directly extracted without independent verification;
- `user_observation` — user-authored observation;
- `system_interpretation` — system-generated interpretation beyond direct extraction;
- `system_inference` — probabilistic/inferential conclusion;
- `strategy` — recommendation or proposed action, not a fact about a counterparty;
- `unknown` — epistemic status cannot be determined.

#### Core invariant: no epistemic promotion by convenience

Transport, summarization, merging, or repeated observation MUST NOT silently promote weaker epistemic classes to `verified_fact`.

### 4.6 `DerivationDependency`

Defines which evidence or relationship-context objects materially support a derived assertion.

A dependency should be able to represent:

- source/evidence reference;
- whether the source is essential or independently replaceable;
- derivation/transformation class;
- source version/time boundary;
- provenance visibility;
- inherited policy references;
- evidence role such as supporting, conflicting, superseding, or corroborating.

RCP may map these concepts to W3C PROV or another provenance representation. RCP's Core concern is not inventing provenance vocabulary; it is defining the lifecycle consequences of relationship-context dependencies.

### 4.7 `ContextLifecycle`

Candidate lifecycle states include:

- `active`;
- `superseded`;
- `disputed`;
- `expired`;
- `invalidated`;
- `revoked`;
- `historical` or equivalent profile-defined archival state.

The Core needs deterministic transition semantics rather than a universal event-delivery protocol.

### 4.8 `PolicyReference`

RCP should carry references or normalized constraints sufficient to preserve relationship-specific restrictions without becoming a universal policy language.

Examples of material dimensions:

- allowed purpose;
- destination/recipient class;
- processing-location restriction;
- retention maximum;
- disclosure restriction;
- derivation restriction;
- training prohibition;
- confidentiality/sensitivity classification;
- provider/organization policy dependency.

A profile may map these dimensions to ODRL, DPV, AuthZEN context, provider-native policy, or another policy system.

## 5. Core invariants

The following invariants are strong candidates for normative v0.2 behavior.

### 5.1 No rights expansion

RCP MUST NOT create rights that do not otherwise exist.

### 5.2 No silent participant collapse

Multi-party evidence MUST NOT be projected into a narrower relationship scope without an explicit evidence basis.

### 5.3 No epistemic promotion

A representation change MUST NOT silently transform a statement, observation, interpretation, or inference into a verified fact.

### 5.4 Provenance/dependency continuity

Persistent derived relationship context MUST preserve material evidence dependencies or an explicit statement that the provenance is opaque/unavailable.

### 5.5 Child access does not grant source access

Receiving an allowed derived assertion MUST NOT imply the right to inspect its underlying evidence.

### 5.6 Transformation does not erase restrictions

Summarization, embedding, extraction, classification, aggregation, or inference MUST NOT automatically loosen inherited policy constraints.

### 5.7 Restriction inheritance is monotonic by default

Where multiple essential sources constrain independent dimensions, allowed sets intersect and prohibitions accumulate unless a profile-defined declassification/re-derivation rule explicitly permits otherwise.

### 5.8 Dependency changes have downstream consequences

When a material source, identity binding, authorization basis, policy dependency, or source validity changes, dependent relationship context MUST be re-evaluated.

### 5.9 Historical lineage is not rewritten

Recomputing an assertion without a removed source MUST NOT alter history to imply that source was never used.

### 5.10 Independent support may preserve an assertion

A derived assertion MAY remain active if remaining valid evidence independently supports it and current policy permits continued use. The implementation must be able to identify that independent support.

### 5.11 Unknown material semantics fail closed

A consumer that cannot interpret a material relationship scope, policy dependency, lifecycle state, or required extension MUST NOT silently treat it as a more permissive known value.

### 5.12 No central RCP infrastructure dependency

A conforming Provider and Consumer MUST be able to exchange RCP semantic objects without requiring infrastructure operated by the RCP maintainers.

## 6. Cross-provider composition model

A consumer that composes relationship context from multiple Providers must preserve source separation before producing a derived combined state.

Candidate evidence relations:

- `supports` — reinforces another assertion without making it identical;
- `corroborates` — independently supports substantially the same claim;
- `conflicts_with` — cannot simultaneously be treated as current truth under the same scope/time;
- `supersedes` — explicitly replaces an earlier assertion;
- `refines` — adds narrower/more precise context;
- `derived_from` — was produced using the referenced evidence;
- `independent_of` — establishes that one support path does not depend on another.

The exact registry is open for design, but two Providers should not require an LLM prompt to infer whether their assertions are supporting, conflicting, or superseding when that relationship is material to deterministic behavior.

## 7. Canonical semantic scenarios

v0.2 should not be accepted without executable or machine-checkable cases for at least the following scenarios.

### Scenario A — Multi-party projection

```text
A, B, C participate in a group interaction
C makes a sensitive statement
        ↓
Can that statement become A-B relationship context?
```

Expected direction: **not by default**. An explicit narrower evidence basis is required.

### Scenario B — Conflicting provider evidence

```text
Provider 1: "Project review is Nov 12"
Provider 2: "Project review moved to Nov 15"
```

The model must represent conflict/supersession without flattening both into current facts.

### Scenario C — Partial source invalidation

```text
Source A ----\
              -> derived commitment
Source B ----/

Source A revoked/corrected
```

The derived assertion must be re-evaluated. If B independently supports it, a new/current lineage may remain; otherwise the assertion must be invalidated/restricted/recomputed.

### Scenario D — Policy-preserving projection

```text
raw evidence: external_processing = deny
        ↓
provider-side summary / assertion
```

The projection does not automatically become externally processable merely because it contains less information. Any loosening requires an explicit profile-defined basis.

### Scenario E — Cross-provider composition

Two Providers independently describe the same relationship state with different fidelity and provenance. A Consumer must be able to preserve provider-specific views and derive a combined view without erasing disagreement, provenance, or restrictions.

## 8. Binding model

RCP Core should be transport-neutral.

Possible bindings include:

- **RCP over MCP** — MCP resources/tools/subscriptions carry RCP semantic objects;
- **RCP over HTTP** — REST/streaming endpoints carry the same objects;
- **RCP over A2A** — A2A tasks/messages convey RCP objects;
- **platform-native binding** — a provider maps RCP semantics into an existing official API.

Bindings may define:

- discovery;
- endpoint shape;
- request/response framing;
- streaming/subscription mechanics;
- authentication integration;
- transport-level errors;
- retries/idempotency;
- security envelopes.

Bindings MUST NOT redefine Core semantic meaning.

## 9. v0.1 migration map

v0.1 remains an experimental baseline and should not be deleted in place.

### Retain and strengthen

- `ContextAssertion` semantics;
- epistemic classes;
- relationship/subject scoping;
- provenance/access separation;
- policy inheritance;
- multi-party projection boundary;
- dependency invalidation/recomputation.

### Narrow or move to profiles/bindings

#### `IdentityClaim`

Keep only identity evidence required to interpret relationship scope. Generic identity verification/federation belongs elsewhere.

#### `ProviderCapability`

Move generic capability discovery to binding profiles. Retain only relationship-specific representation semantics that a Consumer must understand consistently.

#### `PermissionRequest` / `PermissionDecision`

Treat v0.1 as an executable authorization experiment. v0.2 should define an AuthZEN-compatible or equivalent mapping instead of owning a universal authorization request/decision protocol.

#### `SecureEnvelope`

Treat the current JOSE envelope as an experimental security profile. Encryption/signature primitives and key distribution are not semantic Core responsibilities.

#### `RevocationEvent`

Move generic signal transport to Shared-Signals-compatible or other event profiles. Keep the downstream relationship-context consequence model in Core.

## 10. Server and client interpretation

A future **RCP Server** is an implementation role, not infrastructure operated by the RCP project.

A Provider may implement an RCP Server:

- inside its monolith;
- as a microservice;
- as a sidecar;
- as an MCP server exposing RCP resources;
- as an HTTP service;
- as a managed service operated on the Provider's behalf.

The Provider retains control over its raw data, derivation method, policy authority, and exposed fidelity.

An **RCP Client/Consumer** may be:

- a personal AI;
- an enterprise agent;
- a CRM;
- another communication/social Provider;
- a local personal application;
- another authorized software system.

AI may be used internally to derive context, but AI is not required for protocol conformance.

## 11. Transport-independence acceptance test

A v0.2 semantic object should pass the following conceptual test:

1. Provider A emits the object through an MCP binding.
2. Provider B emits an equivalent object through an HTTP binding.
3. The Consumer validates both through the same semantic engine.
4. Equivalent evidence/policy inputs produce equivalent relationship lifecycle state.
5. Transport-specific metadata does not alter the semantic interpretation.

If this cannot be demonstrated, RCP may be too tightly coupled to its transport and should be reconsidered as an extension/profile rather than an independent semantic protocol.

## 12. Open design questions

- Should `RelationshipScope` be a first-class wire object or embedded structure?
- How much of `InteractionEvidence` should be standardized versus opaque provider references?
- Which assertion families deserve a Core registry versus namespaced extensions?
- What minimum evidence-relation vocabulary is required for deterministic cross-provider composition?
- Can W3C PROV express all required dependency structures without RCP-specific duplication?
- Which policy dimensions must be normalized in Core versus referenced externally?
- What explicit declassification/re-derivation proof, if any, can loosen inherited restrictions?
- How should temporal validity and relationship state transitions be represented without building a generic temporal database protocol?
- How should disputed context be carried when participants or Providers disagree?
- What is the smallest RCP-over-MCP binding that proves RCP semantics remain independent from MCP?

## 13. Adoption rule for this draft

Do not freeze v0.2 wire schemas merely because the concepts appear coherent.

Before v0.2 becomes normative, the project should:

1. reconcile each concept against existing standards;
2. encode the canonical semantic scenarios as conformance cases;
3. prove at least two transport bindings can carry equivalent semantic objects;
4. update schemas only after the semantic surface is stable enough to test;
5. obtain an unrelated implementation or adversarial review of the v0.2 model.

The goal is not to maximize the number of RCP-defined primitives. The goal is to define the **smallest semantic contract that independent systems need in order to exchange relationship context without losing scope, epistemic meaning, provenance, restrictions, or lifecycle behavior.**
