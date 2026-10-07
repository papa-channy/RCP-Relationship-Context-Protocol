# RCP Architecture — v0.2 Direction

**Status:** Design Draft

## 1. Goal

RCP defines a transport-independent semantic layer between systems that **hold, derive, or consume relationship context**.

RCP does not require a central control service, mandatory relay, protocol-owned cloud, or single network topology.

A deployment may be:

- Provider → Consumer directly;
- Provider → optional relay → Consumer;
- Provider → MCP binding → Agent;
- Provider → A2A or HTTP binding → Consumer;
- multiple Providers → local/enterprise relationship runtime;
- another architecture that preserves the same semantic contract.

## 2. Core architecture principle

The architecture is split into two categories:

```text
┌──────────────────────────────────────────────┐
│         Applications / Agents / Systems      │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│             BINDINGS / PROFILES              │
│ MCP · A2A · HTTP · OAuth · AuthZEN · SSF     │
│ JOSE · provider-native APIs · other          │
└──────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│              RCP SEMANTIC CORE               │
│                                              │
│ actor / relationship scope                   │
│ interaction evidence                         │
│ context assertions                           │
│ epistemic meaning                            │
│ evidence / derivation dependencies           │
│ lifecycle / invalidation / supersession      │
│ relationship-specific restriction behavior  │
│ cross-provider composition                   │
└──────────────────────────────────────────────┘
```

The semantic Core defines **meaning**.
Bindings define **how that meaning is carried or integrated**.

## 3. Logical roles

### Actor

A person, organization, service, agent, or other entity participating in or referenced by relationship context.

### Provider

A system that holds or derives source evidence and may expose an RCP relationship projection.

Examples:

- messaging service,
- email provider,
- CRM,
- enterprise collaboration service,
- social network,
- local personal data source,
- another authorized application.

A Provider remains authoritative over its raw evidence, derivation implementation, policy, and exposed fidelity.

### Consumer

A system authorized to receive or use RCP relationship context.

Examples:

- personal AI,
- enterprise agent,
- CRM,
- another communication/social Provider,
- local personal application,
- workflow engine.

### RCP Server

An implementation role through which a Provider exposes RCP semantics.

An RCP Server may be:

- embedded in an existing service;
- a microservice;
- a sidecar;
- an MCP server exposing RCP resources;
- an HTTP service;
- a managed service operated on a Provider's behalf.

**There is no canonical central RCP Server operated by the protocol project.**

### RCP Client / Semantic Consumer

An implementation role that understands RCP semantic objects and applies their lifecycle/restriction rules.

### Optional intermediary

A relay, queue, gateway, or other intermediary may carry RCP data but is not required by Core.

## 4. Semantic pipeline

A typical Provider-side flow may look like:

```text
raw/private provider evidence
          │
          ▼
identity + participant scoping
          │
          ▼
provider-local search / retrieval
          │
          ▼
deterministic or AI-powered derivation
          │
          ▼
relationship projection
          │
          ├─ ContextAssertion
          ├─ RelationshipScope
          ├─ evidence/provenance dependencies
          ├─ epistemic class
          ├─ lifecycle state
          └─ policy references/restrictions
          │
          ▼
transport binding
          │
          ▼
authorized Consumer
```

The Provider may keep the raw/private evidence entirely internal.

## 5. Consumer-side semantic pipeline

```text
receive RCP object(s)
        │
        ▼
validate semantic version/extensions
        │
        ▼
resolve relationship + participant scope
        │
        ▼
validate epistemic/lifecycle meaning
        │
        ▼
record provider/evidence separation
        │
        ▼
apply policy/restriction dependencies
        │
        ▼
compose supporting/conflicting/superseding evidence
        │
        ▼
materialize current relationship state
```

Transport-specific framing should be discarded before semantic evaluation except where a binding explicitly contributes a referenced security/authorization dependency.

## 6. Relationship scope architecture

RCP must distinguish at least:

```text
source participants
        ≠
target relationship participants
        ≠
authorized requester/consumer
```

Example:

```text
Group interaction participants: {A, B, C}
Target relationship:            {A, B}
```

The existence of A and B in the group interaction is insufficient by itself to project all group evidence into the A-B relationship.

This boundary is a Core semantic rule, not a transport decision.

## 7. Evidence and derivation architecture

A relationship assertion may depend on multiple sources:

```text
Provider A evidence -----\
                          > ContextAssertion → RelationshipState
Provider B evidence -----/
```

The dependency graph must preserve enough information to answer:

- which evidence is material;
- whether sources are independent;
- whether one source supersedes or conflicts with another;
- which restrictions are inherited;
- what must happen if one dependency changes.

RCP may encode or map provenance using established provenance standards. Core focuses on the relationship-specific consequence model.

## 8. Lifecycle architecture

RCP needs domain semantics for lifecycle states such as:

- active;
- superseded;
- disputed;
- expired;
- invalidated;
- revoked;
- historical.

A change trigger may arrive through any binding/profile.

The semantic engine then evaluates:

```text
change signal
    ↓
affected dependency set
    ↓
evidence sufficiency
    ↓
current restrictions/policy
    ↓
delete | invalidate | restrict | recompute | supersede | retain
    ↓
new materialized relationship state
```

Signal transport is not the same thing as lifecycle semantics.

## 9. Binding architecture

### RCP over MCP

MCP may provide:

- discovery;
- tools/resources;
- subscriptions;
- authorization integration;
- transport framing.

RCP provides the semantic payload and rules.

A generic Agent should be able to consume RCP objects from more than one MCP Provider without inventing provider-specific relationship meaning.

### RCP over HTTP

An HTTP profile may define endpoints, content types, streaming, errors, retries, and authentication integration while carrying the same semantic objects.

### RCP over A2A

A2A tasks/messages may carry RCP objects, but task lifecycle does not redefine relationship-context lifecycle.

### Provider-native bindings

A platform may map RCP concepts onto its official API without exposing a standalone generic RCP transport.

## 10. Authorization architecture

RCP v0.2 should not define a universal authorization engine.

Instead:

```text
generic authorization system
      │
      ├─ principal
      ├─ action
      ├─ resource
      └─ context
      │
      ▼
RCP relationship semantics
      │
      ├─ what counts as the protected relationship resource
      ├─ which participant scope applies
      ├─ which representation is requested
      ├─ which derivation/use restrictions follow
      └─ which lifecycle dependencies become material
```

AuthZEN-compatible mappings are a likely profile direction, but Core should remain authorization-engine-neutral.

## 11. Security architecture

RCP should reuse established cryptographic primitives and profiles.

The existing v0.1 JOSE SecureEnvelope remains useful experimental evidence, but v0.2 treats envelope transport/security as a binding/profile concern.

Core still requires that semantic objects can be integrity-protected and that security/authorization dependencies are referenced without changing their semantic meaning.

## 12. AI architecture

AI is an implementation option, not a protocol requirement.

Provider A may derive context using:

```text
SQL/rules → RCP assertion
```

Provider B may use:

```text
search → model → verification → RCP assertion
```

Both can conform if they emit the same semantic contract.

AI-generated assertions must preserve explicit epistemic meaning and MUST NOT be presented as verified facts unless the required verification semantics are satisfied.

## 13. v0.1 reference ecosystem status

The current reference ecosystem remains a valuable experimental implementation but is no longer the architecture definition.

It demonstrates:

- independent Provider state;
- provider-side context selection;
- permission-before-retrieval;
- encrypted transfer;
- relay payload blindness;
- ContextAssertion normalization;
- source revocation/recomputation;
- policy drift;
- identity scoping.

Its control-plane service, HTTP routes, process topology, relay, and storage choices are **non-normative reference implementation decisions**.

## 14. Mandatory architecture properties for v0.2 direction

- Core semantics remain meaningful independent of transport.
- No mandatory project-operated infrastructure exists.
- Providers may keep raw evidence private and emit lower-fidelity projections.
- Participant/relationship scope is explicit.
- Multi-party evidence is not silently collapsed.
- Epistemic meaning is explicit and non-promoting.
- Persistent derived context preserves material dependencies.
- Child access does not imply source access.
- Transformation does not silently erase restrictions.
- Dependency changes trigger downstream re-evaluation.
- Cross-provider composition preserves provider/evidence separation before deriving combined state.
- Unknown material semantics fail closed.

## 15. Open architecture questions

- first-class versus embedded `RelationshipScope`;
- minimum `InteractionEvidence` shape;
- cross-provider evidence relation registry;
- temporal semantics for current relationship state;
- disputed/participant-contested context;
- policy-reference normalization versus external policy documents;
- mapping to W3C PROV/ODRL/DPV;
- AuthZEN-compatible relationship authorization profile;
- Shared-Signals-compatible invalidation profile;
- minimal RCP-over-MCP binding;
- second transport binding for semantic-equivalence testing;
- pairwise/pseudonymous relationship identifiers;
- metadata-minimizing transport profiles.
