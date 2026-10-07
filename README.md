# RCP — Relationship Context Protocol

> **Experimental protocol research project. RCP is not yet a standard and is not production-certified.**

**RCP explores a transport-independent information and lifecycle model for exchanging relationship context across heterogeneous systems while preserving participant scope, epistemic meaning, provenance dependencies, policy constraints, and downstream invalidation.**

RCP is currently being refactored from its experimental v0.1 interoperability stack into a smaller, more defensible **relationship semantic core**.

The active design question is not how to build an RCP-owned network. It is:

> **What relationship-context semantics must independent systems agree on even when they use different transports, agent frameworks, authorization engines, and infrastructure?**

## The problem

A real relationship is distributed across many systems:

```text
                     Human B
                        │
          ┌─────────────┼─────────────┐
          │             │             │
        Email       Messaging       Phone
          │             │             │
       Meetings       Social        CRM
          │             │             │
          └─────────────┼─────────────┘
                        │
                     Human A
```

Those systems do not merely hold documents or social-graph edges. They may hold different evidence about:

- interactions,
- commitments and open loops,
- preferences,
- shared topics,
- current relationship state,
- user observations,
- provider interpretations,
- system inferences,
- strategies or recommended next actions.

The hard interoperability problem is not just retrieving those records. Independent systems need predictable answers to questions such as:

- Which people and organizations does this context actually concern?
- May a group interaction involving `{A,B,C}` become bilateral context about `{A,B}`?
- Is a statement a fact, observation, interpretation, or inference?
- Which evidence supports a derived commitment or relationship state?
- What happens when one source is corrected, deleted, revoked, or reclassified?
- Can a provider expose a lower-fidelity relationship projection without exposing raw evidence?
- Which restrictions survive summarization, extraction, or inference?
- How should two providers represent supporting, conflicting, superseding, or independently sufficient evidence?

RCP exists only if these semantics require a shared contract beyond generic transport/runtime protocols.

## Current design thesis

RCP should standardize **relationship meaning**, not reinvent general infrastructure.

```text
┌──────────────────────────────────────────────┐
│ Applications / Agents / CRMs / Social Apps   │
└──────────────────────────────────────────────┘
                    │
          transport / agent binding
                    │
     MCP · A2A · HTTP · platform APIs · other
                    │
                    ▼
┌──────────────────────────────────────────────┐
│                RCP SEMANTIC CORE             │
│                                              │
│ relationship / participant scope             │
│ interaction evidence                         │
│ context assertions                           │
│ epistemic meaning                            │
│ derivation dependencies                      │
│ lifecycle / supersession / invalidation      │
│ cross-provider composition                   │
│ relationship-specific restriction behavior  │
└──────────────────────────────────────────────┘
                    │
          profiles / mappings / reuse
                    │
┌──────────────────────────────────────────────┐
│ OAuth/OIDC · AuthZEN · Shared Signals         │
│ W3C PROV · ODRL/DPV · JOSE · other standards │
└──────────────────────────────────────────────┘
```

See [`docs/standards-boundary.md`](./docs/standards-boundary.md).

## RCP vs MCP

RCP is not intended to compete with MCP.

A useful boundary is:

```text
MCP: What capabilities can this system expose to an AI/client, and how are they invoked?

RCP: What does a piece of relationship context mean, what evidence supports it,
     which participants it concerns, what restrictions follow it, and how does
     its state change when dependencies change?
```

A future **RCP-over-MCP** binding may expose RCP objects through MCP resources, tools, or subscriptions. The same semantic objects should also remain meaningful over plain HTTP, A2A, or another binding.

If RCP semantics cannot survive a change of transport, the project should be reconsidered as an MCP/domain extension rather than an independent semantic protocol.

## Proposed v0.2 semantic surface

The active v0.2 design draft centers on concepts such as:

1. `ActorReference`
2. `RelationshipScope`
3. `InteractionEvidence`
4. `ContextAssertion`
5. `EpistemicClass`
6. `DerivationDependency`
7. `ContextLifecycle`
8. `PolicyReference`

These are **candidate semantic concepts**, not yet frozen wire objects.

Read [`spec/core-v0.2-draft.md`](./spec/core-v0.2-draft.md).

## Core invariants under review

The strongest RCP-specific invariants currently include:

- RCP **MUST NOT** expand rights that do not otherwise exist.
- Multi-party evidence **MUST NOT** silently collapse into a narrower relationship scope.
- Transport, summarization, or repeated observation **MUST NOT** silently promote an inference or source statement into a verified fact.
- Persistent derived context **MUST** preserve material evidence/provenance dependencies or explicitly declare them opaque.
- Access to a derived assertion **MUST NOT** imply access to its raw source evidence.
- Transformation **MUST NOT** silently erase inherited restrictions.
- Material source, policy, authorization, or identity changes **MUST** trigger downstream re-evaluation where dependent context is affected.
- Historical lineage **MUST NOT** be rewritten to pretend a removed source was never used.
- Independent supporting evidence **MAY** allow a derived assertion to survive partial source invalidation when current policy still permits it.
- No conforming RCP deployment should require infrastructure operated by the RCP project.

These rules are the main candidates for RCP's independent protocol value.

## Provider-owned RCP Servers

An RCP Server is an **implementation role**, not a central service operated by the RCP project.

A communication, social, CRM, or enterprise provider may expose RCP semantics:

- inside its existing application,
- as a microservice,
- as a sidecar,
- through an MCP server,
- through an HTTP API,
- through another standards-compatible binding.

The Provider keeps control over:

- raw source data,
- internal search/indexing,
- AI or deterministic derivation logic,
- policy authority,
- exposed fidelity,
- retention and access controls.

RCP should allow this pattern:

```text
Provider raw/private evidence
          │
          │ stays provider-side
          ▼
provider-owned derivation / policy
          │
          ▼
RCP relationship projection
          │
          ▼
authorized AI / app / CRM / other provider
```

AI may be used to derive relationship context, but AI is **not required** for RCP conformance.

## What RCP is not

RCP is not:

- a central relationship database,
- a mandatory RCP cloud or gateway,
- a personal CRM product,
- a social-scoring system,
- a surveillance protocol,
- a data broker,
- a global identity graph,
- a new generic tool protocol,
- a new agent-to-agent task protocol,
- a universal authorization engine,
- a universal policy language,
- a replacement for OAuth/OIDC, AuthZEN, Shared Signals, W3C PROV, ODRL/DPV, JOSE, MCP, or A2A.

The project should reuse or profile established standards where they already solve the generic problem.

## v0.1: preserved experimental baseline

The repository already contains a substantial experimental v0.1 implementation and conformance baseline built around seven wire objects:

1. `IdentityClaim`
2. `ProviderCapability`
3. `PermissionRequest`
4. `PermissionDecision`
5. `ContextAssertion`
6. `SecureEnvelope`
7. `RevocationEvent`

That work is **not being discarded**. It proved important behaviors including:

- capability ≠ permission;
- permission-before-retrieval;
- fail-closed unknown/conditional/stale authorization;
- epistemic separation;
- provenance/source-access separation;
- derived-policy inheritance;
- multi-party projection boundaries;
- revocation/recomputation behavior;
- JOSE envelope interoperability;
- Node ↔ Python crypto interoperability;
- provider-scoped identity isolation;
- operator-blind relay behavior;
- an external black-box Provider harness.

However, v0.1 also owns generic infrastructure concerns that the v0.2 design is intentionally reconsidering.

### Current v0.2 migration hypothesis

| v0.1 concept | Proposed direction |
| --- | --- |
| `IdentityClaim` | narrow to relationship-scoped identity evidence/binding |
| `ProviderCapability` | move generic discovery to bindings; retain only relationship-specific representation semantics |
| `PermissionRequest` / `PermissionDecision` | map generic authorization mechanics to AuthZEN-compatible or equivalent profiles |
| `ContextAssertion` | retain and strengthen as a central RCP semantic object |
| `SecureEnvelope` | treat as a security/transport profile using established crypto standards |
| `RevocationEvent` | delegate generic signal transport; keep downstream relationship lifecycle semantics in Core |

The existing normative experimental specification remains at [`spec/core-v0.1.md`](./spec/core-v0.1.md).

## Reference ecosystem

The existing five-provider demo remains useful as **v0.1 experimental evidence**.

```bash
cd reference-ecosystem
npm install
npm run demo
```

It demonstrates:

- five separately stateful mock Providers,
- provider-scoped identity resolution,
- permission-before-retrieval,
- provider-side context selection,
- JOSE `SecureEnvelope` delivery,
- optional operator-blind relay,
- provenance-preserving `ContextAssertion` activation,
- revocation and downstream recomputation,
- enterprise policy drift/stale authorization,
- one-command trace and relationship brief generation.

The reference topology is **not** a required RCP deployment architecture.

See [`reference-ecosystem/README.md`](./reference-ecosystem/README.md).

## Conformance evidence

Current repository evidence includes:

- schema-positive and schema-negative fixtures;
- semantic/privacy-boundary tests;
- identity tenant-isolation tests;
- provenance ancestor-access separation;
- derived-policy inheritance;
- revocation propagation;
- stale-decision behavior;
- JOSE tamper/wrong-key/algorithm-substitution tests;
- Node ↔ Python bidirectional SecureEnvelope interoperability;
- an external black-box Provider harness with CI self-test.

These tests currently validate the **v0.1 experimental baseline**. v0.2 will require new semantic conformance cases rather than assuming the existing HTTP/Provider harness defines the new Core.

## v0.2 acceptance work

The active refactor is tracked in [Issue #23](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/23).

Before v0.2 becomes normative, the project should at minimum:

- reconcile RCP against MCP/A2A/OAuth/AuthZEN/Shared Signals/PROV/ODRL/DPV/JOSE responsibilities;
- define machine-checkable multi-party projection semantics;
- define conflict/support/supersession relationships between provider assertions;
- define evidence dependency and partial-source invalidation behavior;
- define policy-preserving derivation semantics;
- prove equivalent semantic interpretation across at least two bindings (for example MCP and HTTP);
- then update wire schemas and conformance tests;
- only after that resume clean-room external implementation against the new semantic surface.

## Project status

**Stage:** semantic-core refactor after experimental v0.1  
**v0.1:** implemented, CI-verified experimental baseline  
**v0.2:** active non-normative design draft  
**Production use:** not recommended  
**Independent third-party v0.2 interoperability:** not established  
**Independent security/privacy review:** not completed

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
│   ├── standards-boundary.md
│   ├── outreach/
│   ├── IMPLEMENTER_GUIDE.md
│   ├── threat-and-rights-model.md
│   ├── rights-and-permission-model.md
│   ├── data-object-model.md
│   └── provenance-and-derivation-model.md
├── spec/
│   ├── core-v0.1.md
│   ├── core-v0.2-draft.md
│   ├── profiles/
│   ├── registries/
│   └── schemas/
├── conformance/
├── implementations/
├── reference-ecosystem/
├── examples/
└── rfcs/
```

## Working rule

Before adding a new RCP Core primitive, ask:

> **Would independent systems still need to agree on this meaning if the same relationship context were carried once over MCP and once over plain HTTP?**

If not, the feature probably belongs in a binding or profile rather than Core.

---

RCP's working maxim remains:

> **Bring context together without collapsing its boundaries.**
