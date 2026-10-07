# RCP Standards Boundary — v0.2 Design Direction

**Status:** Design draft, non-normative

RCP should be as small as possible while still defining semantics that independent systems need in order to interpret relationship context consistently.

The project therefore follows this rule:

> **If an established protocol can carry or enforce a generic infrastructure concern without losing relationship-specific meaning, RCP should bind to or profile that protocol rather than reimplement it.**

RCP's distinctive responsibility is the **information model and lifecycle of relationship context**, not generic agent transport, authorization infrastructure, cryptography, or federation plumbing.

## 1. Layering model

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
│ relationship scope                           │
│ participant scope                            │
│ interaction evidence                         │
│ context assertions                           │
│ epistemic meaning                            │
│ derivation dependencies                      │
│ lifecycle / supersession / invalidation      │
│ cross-provider composition                   │
│ relationship-specific policy inheritance     │
└──────────────────────────────────────────────┘
                    │
          profiles / mappings / reuse
                    │
┌──────────────────────────────────────────────┐
│ OAuth/OIDC · AuthZEN · Shared Signals         │
│ W3C PROV · ODRL/DPV · JOSE · other standards │
└──────────────────────────────────────────────┘
```

No conforming RCP deployment should require infrastructure operated by the RCP project.

## 2. Responsibility matrix

| Concern | Primary owner | RCP responsibility |
| --- | --- | --- |
| Generic tool/resource invocation | MCP / application protocol | Define an RCP binding when useful; do not recreate generic tool transport |
| Agent-to-agent task exchange | A2A or other agent protocol | Carry RCP semantic objects through a binding; do not recreate generic task lifecycle |
| User authentication / delegated access | OAuth 2.x / OIDC or platform-native auth | Reference the authenticated principal and grants; do not define a universal login system |
| Generic authorization request/decision | AuthZEN-compatible authorization systems | Define relationship resource/action/context semantics and mapping profiles |
| Dynamic security/revocation signal transport | OpenID Shared Signals / CAEP where applicable | Define what a signal means for relationship-context descendants and materialized state |
| Provenance vocabulary | W3C PROV or equivalent | Define the minimum relationship-specific dependency semantics and how provenance affects lifecycle |
| Usage-policy vocabulary | ODRL / DPV / provider policy systems where applicable | Define monotonic inheritance requirements and fail-closed behavior when restrictions cannot be evaluated |
| Encryption/signature primitives | JOSE / COSE / established cryptographic profiles | Define interoperable RCP bindings where required; do not invent cryptographic primitives |
| Relationship information model | **RCP** | Core responsibility |
| Participant/relationship scoping | **RCP** | Core responsibility |
| Epistemic semantics | **RCP** | Core responsibility |
| Evidence-to-context projection | **RCP** | Core responsibility |
| Relationship-context lifecycle | **RCP** | Core responsibility |
| Cross-provider composition/conflict semantics | **RCP** | Core responsibility |

## 3. MCP boundary

MCP and RCP solve different primary problems.

### MCP

MCP answers questions such as:

- What tools/resources/prompts does this server expose?
- How does a client invoke them?
- How can an AI application connect to an external system?

### RCP

RCP answers questions such as:

- Which participants and relationship does this context concern?
- Is this a source statement, extracted fact, observation, inference, or strategy?
- Which evidence supports this assertion?
- May a group interaction be projected into a bilateral relationship context?
- What happens to derived context when an essential source is corrected, withdrawn, or revoked?
- How do two providers express supporting, conflicting, superseding, or independently sufficient relationship evidence?
- Which restrictions survive transformation into lower-fidelity relationship context?

If RCP only defined `get_relationship_context()` tools or a server-specific query API, an MCP extension would likely be sufficient. RCP is justified as an independent layer only if its semantic objects remain meaningful outside MCP.

A future **RCP-over-MCP** binding should therefore transport RCP semantic objects without making MCP part of the meaning of those objects.

## 4. A2A boundary

A2A-like protocols can define discovery, tasks, messages, streaming, and long-running agent interactions.

RCP should not duplicate those mechanisms. An agent may exchange RCP objects through an A2A task, but the relationship scope, epistemic meaning, evidence graph, lifecycle, and restrictions must remain interpretable independently of A2A.

## 5. Authorization boundary

RCP v0.1 introduced `PermissionRequest` and `PermissionDecision` to make rights-expansion failures executable. That experiment remains useful evidence, but v0.2 should separate two concerns:

1. **generic authorization mechanics** — evaluating a subject/action/resource/context request;
2. **relationship-specific authorization semantics** — defining the protected relationship resource, participant scope, representation, purpose dependencies, derivation consequences, and restriction inheritance.

The first should be delegated or mapped to established authorization infrastructure where possible. The second belongs in RCP.

## 6. Revocation boundary

RCP does not need to own a universal event-delivery protocol.

What RCP must define is the consequence model:

```text
source/policy/identity/grant signal changes
              ↓
identify affected relationship-context dependencies
              ↓
re-evaluate evidence sufficiency + policy
              ↓
delete / invalidate / restrict / recompute / retain
              ↓
preserve historical lineage
```

A future Shared-Signals-compatible profile may carry the trigger. RCP defines the relationship-context state transition caused by that trigger.

## 7. Provenance boundary

RCP should reuse established provenance concepts where possible instead of creating a competing universal provenance ontology.

RCP still needs normative domain rules such as:

- derived relationship context identifies essential evidence dependencies;
- access to a child assertion does not imply access to source evidence;
- removal of one source may or may not invalidate a derived assertion depending on independent supporting evidence;
- historical provenance must not be rewritten to pretend a revoked source was never used;
- provenance visibility may be restricted independently from the derived assertion itself.

## 8. Policy boundary

RCP should not become a universal policy language.

RCP must, however, define minimum policy behavior for relationship context:

- transformation does not silently erase restrictions;
- independently constrained dimensions accumulate or intersect monotonically;
- a consumer that cannot evaluate a material restriction fails closed for the affected use;
- a provider may expose a lower-fidelity projection without exposing the raw evidence;
- loosening inherited restrictions requires an explicit, profile-defined declassification/re-derivation basis rather than mere summarization.

## 9. Identity boundary

RCP does not define a global human identity graph.

RCP needs only enough identity semantics to scope relationship context safely:

- provider-local identifiers remain provider-local;
- identity bindings are scoped to a user, tenant, organization, or explicit trust domain;
- uncertain identity evidence cannot silently merge sensitive relationship histories;
- the identity evidence supporting a relationship scope is itself a material dependency that can change.

## 10. Transport independence criterion

A concept belongs in RCP Core only if it can satisfy this test:

> **Would two independent systems still need to agree on this meaning if the same object were carried once over MCP and once over plain HTTP?**

If the answer is no, the concept probably belongs in a binding/profile rather than Core.

The project should eventually demonstrate semantic equivalence across at least two bindings:

```text
Provider A -- RCP over MCP ----\
                               > same RCP semantic engine -> equivalent relationship state
Provider B -- RCP over HTTP ---/
```

## 11. v0.1 migration classification

The following is the current design hypothesis, not yet a normative v0.2 decision:

| v0.1 concept | v0.2 direction |
| --- | --- |
| `IdentityClaim` | narrow to relationship-scoped identity binding/evidence profile |
| `ProviderCapability` | move generic discovery mechanics to bindings; retain representation semantics if relationship-specific |
| `PermissionRequest` | map generic authorization mechanics to AuthZEN-compatible profile |
| `PermissionDecision` | map generic authorization mechanics to AuthZEN-compatible profile |
| `ContextAssertion` | retain and strengthen as a central RCP semantic object |
| `SecureEnvelope` | move transport/crypto mechanics to JOSE or other security binding profile |
| `RevocationEvent` | move signal transport to Shared-Signals-compatible profile; retain downstream relationship lifecycle semantics in Core |

## 12. Design guardrails

Before adding a new Core object or field, ask:

1. Is this needed for relationship-context meaning rather than generic transport/runtime behavior?
2. Does an established standard already define the generic primitive?
3. Can RCP profile/map that standard instead?
4. Would the meaning survive a change of transport or agent framework?
5. Can two providers implement the concept independently without relying on an LLM prompt to infer the semantics?
6. Does the concept produce a testable interoperability invariant?

If these questions do not produce a strong affirmative case, the feature should stay outside Core.
