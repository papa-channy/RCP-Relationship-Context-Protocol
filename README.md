# RCP — Relationship Context Protocol

> **Experimental protocol research project. RCP is not yet a standard and is not production-certified.**

**RCP explores a transport-independent semantic and lifecycle contract for exchanging provider-derived relationship context across heterogeneous systems while preserving participant scope, epistemic meaning, evidentiary dependencies, policy constraints, and downstream invalidation.**

RCP does **not** require a central RCP-operated server. Providers keep raw/private evidence and may expose authorized relationship-context projections through their own infrastructure and bindings.

## Why RCP exists

A relationship is often distributed across email, messaging, calls, meetings, social systems, CRMs, and local notes. The difficult interoperability problem is not simply retrieving records. Independent systems need predictable answers to questions such as:

- Which participants does this assertion actually concern?
- May `{A,B,C}` source evidence become `{A,B}` relationship context?
- Is a claim a source statement, extracted fact, observation, interpretation, inference, verified fact, or strategy?
- Which evidence combinations materially support a derived commitment or relationship state?
- What survives when one source is corrected, withdrawn, revoked, or reclassified?
- Can a Provider expose a lower-fidelity projection without exposing raw evidence?
- Which restrictions survive summarization, extraction, aggregation, or inference?
- How do independent Providers represent support, corroboration, conflict, refinement, or supersession without relying on arrival order?

RCP is justified only if those semantics need a shared contract beyond generic transport, authorization, provenance, and policy standards.

## Current v0.2 thesis

```text
Applications / Agents / CRMs / Providers
                    │
        MCP · HTTP · A2A · native APIs
                    │
                    ▼
┌──────────────────────────────────────────────┐
│                RCP SEMANTIC CORE             │
│                                              │
│ target/source participant scope              │
│ epistemic meaning                            │
│ evidence projection basis                    │
│ material derivation dependencies             │
│ independently sufficient support paths       │
│ conflict / supersession semantics            │
│ restriction inheritance consequences         │
│ relationship assertion lifecycle             │
└──────────────────────────────────────────────┘
                    │
          profiles / mappings / bindings
                    │
┌──────────────────────────────────────────────┐
│ OAuth/OIDC · AuthZEN · Shared Signals         │
│ W3C PROV · ODRL/DPV · JOSE/COSE · others     │
└──────────────────────────────────────────────┘
```

See:

- [`spec/core-v0.2-draft.md`](./spec/core-v0.2-draft.md)
- [`spec/wire-v0.2-draft.md`](./spec/wire-v0.2-draft.md)
- [`docs/standards-boundary.md`](./docs/standards-boundary.md)
- [`docs/standards-reconciliation-v0.2.md`](./docs/standards-reconciliation-v0.2.md)

## Candidate v0.2 wire model

The current draft deliberately has **one top-level semantic object**:

```text
ContextAssertion
 ├─ RelationshipScope
 ├─ EpistemicClass
 ├─ EvidenceReference
 ├─ Derivation
 │   ├─ material dependencies
 │   └─ support_sets
 ├─ AssertionRelation
 ├─ PolicyReference(s)
 └─ Lifecycle
```

`RelationshipScope`, evidence, derivation, and lifecycle remain embedded structures until independent addressability is shown to be necessary.

The executable draft schema lives at:

[`spec/schemas/v0.2-draft/context-assertion.schema.json`](./spec/schemas/v0.2-draft/context-assertion.schema.json)

Its version is intentionally `0.2-draft`; it is not a stable normative v0.2 release.

## Strongest current Core invariants

- RCP **MUST NOT** create rights that do not otherwise exist.
- Multi-party evidence **MUST NOT** silently collapse into a narrower target relationship scope.
- Transport or transformation **MUST NOT** silently promote weaker epistemic classes into `verified_fact`.
- Persistent derived context **MUST** preserve material evidence/identity/policy dependencies or explicitly declare lineage opaque/unavailable.
- Access to a derived assertion **MUST NOT** imply access to its underlying evidence.
- Transformation **MUST NOT** silently erase inherited restrictions.
- Material dependency changes **MUST** trigger downstream re-evaluation.
- Historical lineage **MUST NOT** be rewritten to pretend removed evidence was never used.
- Independent surviving evidence **MAY** preserve an assertion only when a sufficient support path remains and current policy allows it.
- Unknown material semantics or required extensions fail closed.

## Why `support_sets` exist

A flat provenance edge does not say whether evidence is jointly required or independently sufficient.

```json
{"support_sets": [["evidence:A"], ["evidence:B"]]}
```

means either A or B independently supports the assertion.

```json
{"support_sets": [["evidence:A", "evidence:B"]]}
```

means both are jointly required.

That distinction directly changes what happens when one source is removed. RCP can map generic lineage to W3C PROV while retaining this relationship-lifecycle consequence.

## RCP vs MCP

MCP and RCP solve different layers.

```text
MCP: how a client discovers/reads/invokes server capabilities and resources
RCP: what a relationship assertion means after transport framing is removed
```

The repository now contains a real internal binding-independence proof:

```text
same Provider-owned ContextAssertion
   ├─ official MCP SDK Resource → official MCP Client ─┐
   └─ plain HTTP endpoint → fetch ─────────────────────┤
                                                       ▼
                                           same RCP validator
                                                       │
                                                       ▼
                                           identical semantic state
```

See [`bindings/v0_2/`](./bindings/v0_2/).

This proves the tested semantic slice does not require hidden MCP-specific state. It is **not** external interoperability evidence or production certification.

## Standards reconciliation

The current v0.2 draft intentionally delegates generic responsibilities:

| Generic concern | Preferred owner |
| --- | --- |
| resource/tool invocation | MCP / application protocol |
| authentication/delegation | OAuth/OIDC / provider auth |
| authorization request/decision | OpenID AuthZEN-compatible PDP/PEP |
| change/revocation signal delivery | OpenID Shared Signals / CAEP or provider events |
| general provenance ontology | W3C PROV |
| usage/privacy policy vocabulary | ODRL / DPV / provider policy |
| cryptographic primitives | JOSE / COSE |
| social relationship edge vocabulary | ActivityStreams / domain vocabularies |
| schema/RPC language | JSON Schema / Lexicon / existing systems |
| dataspace contract/transfer negotiation | Eclipse Dataspace Protocol or equivalents |

The reconciliation also **reduced** the draft surface:

- removed generic top-level `confidence`;
- removed epistemic duplicates from `assertion_type`;
- removed channel/product-specific evidence types from Core;
- made participant-projection safety independent of communication-channel labels.

## Provider-owned RCP role

A Provider may expose RCP semantics:

- inside its existing service;
- as a sidecar or microservice;
- through an MCP server;
- through HTTP/A2A/native APIs;
- through another compatible binding.

Raw/private evidence can remain Provider-local:

```text
Provider raw/private evidence
          │
          ▼
provider-owned derivation + policy enforcement
          │
          ▼
authorized RCP relationship projection
          │
          ▼
AI / CRM / app / another provider
```

AI may help derive context, but AI is not required for RCP conformance.

## What RCP is not

RCP is not:

- a central relationship database or mandatory gateway;
- a personal CRM product;
- a social-scoring system;
- a surveillance or data-broker protocol;
- a global identity graph;
- a generic tool or agent-task protocol;
- a universal authorization engine;
- a universal provenance or policy language;
- a replacement for MCP, OAuth/OIDC, AuthZEN, Shared Signals, PROV, ODRL/DPV, JOSE/COSE, ActivityStreams, Solid, AT Protocol, or Dataspace Protocol.

## v0.1 preserved experimental baseline

The repository retains the executable v0.1 contract and its seven wire objects:

1. `IdentityClaim`
2. `ProviderCapability`
3. `PermissionRequest`
4. `PermissionDecision`
5. `ContextAssertion`
6. `SecureEnvelope`
7. `RevocationEvent`

v0.1 remains valuable evidence for permission-before-retrieval, identity/privacy boundaries, provenance/source-access separation, policy inheritance, revocation/recomputation, JOSE delivery, Node↔Python interoperability, provider isolation, and the five-provider reference ecosystem.

It is preserved as an **experimental baseline**, not the final RCP responsibility boundary.

## Executable evidence

Current repository evidence includes:

- v0.1 schema/semantic/privacy conformance;
- JOSE tamper/wrong-key/algorithm-substitution tests;
- Node ↔ Python bidirectional SecureEnvelope interoperability;
- v0.1 black-box external Provider harness;
- v0.2 abstract semantic scenarios;
- v0.2 candidate JSON Schema and positive/negative wire fixtures;
- cross-reference/fail-closed semantic validation;
- concrete MCP Resource ↔ HTTP binding-equivalence proof.

All v0.1 and v0.2 CI suites remain separate.

## Project status

**v0.1:** implemented and CI-verified experimental baseline  
**v0.2 semantic core:** machine-checkable draft  
**v0.2 wire model:** executable candidate, not frozen  
**binding independence:** internally demonstrated for MCP Resource + plain HTTP retrieval  
**standards reconciliation:** field-level first pass completed  
**independent third-party v0.2 implementation:** not established  
**independent security/privacy review:** not completed  
**production use:** not recommended

The next decisive step is an **unrelated clean-room implementation of the v0.2 semantic surface**, followed by independent security/privacy review. These external checks should be allowed to shrink the Core again if existing standards or simpler representations are sufficient.

See [`ROADMAP.md`](./ROADMAP.md).

## Repository layout

```text
.
├── README.md
├── CHARTER.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── docs/
│   ├── standards-boundary.md
│   ├── standards-reconciliation-v0.2.md
│   └── ...
├── spec/
│   ├── core-v0.1.md
│   ├── core-v0.2-draft.md
│   ├── wire-v0.2-draft.md
│   └── schemas/v0.2-draft/
├── conformance/
│   └── v0_2/
├── bindings/
│   └── v0_2/
├── implementations/
├── reference-ecosystem/
├── examples/
└── rfcs/
```

## Working rule

Before adding a new Core primitive, ask:

> **Would independent systems still need to agree on this meaning if the same relationship context were carried once over MCP and once over plain HTTP?**

If not, it belongs in a binding, profile, extension, or external standard.

---

> **Bring context together without collapsing its boundaries.**
