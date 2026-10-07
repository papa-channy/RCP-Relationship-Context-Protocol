# RCP — Technical Brief

> **Experimental protocol research project.** RCP v0.1 remains a reproducible baseline, while the active design direction is a transport-independent v0.2 relationship semantic Core.

## The problem

A relationship is usually represented indirectly across many systems: messages, email, meetings, calls, CRM activity, calendars, social interactions, enterprise collaboration, and AI-generated summaries.

The interoperability problem is not simply moving those records.

Independent systems may need to agree on:

- who the context is actually about;
- whether evidence from a multi-party interaction may be projected into a narrower relationship;
- whether a claim is a source statement, extracted fact, observation, interpretation, inference, or verified fact;
- which evidence materially supports a derived commitment or relationship state;
- what restrictions survive summarization/derivation;
- what happens when a source, identity binding, or policy dependency changes;
- how independently produced context from different Providers supports, conflicts with, supersedes, or refines other context.

RCP explores whether those semantics justify a dedicated interoperability layer.

## Active v0.2 hypothesis

RCP should define a **transport-independent information and lifecycle model for relationship context**.

It should not try to replace generic infrastructure standards.

Conceptually:

```text
Applications / Agents / CRMs / Social systems
                  │
       MCP · A2A · HTTP · other bindings
                  │
                  ▼
        RCP relationship semantics
                  │
                  ├─ relationship / participant scope
                  ├─ interaction evidence
                  ├─ context assertions
                  ├─ epistemic meaning
                  ├─ derivation dependencies
                  ├─ lifecycle / invalidation
                  ├─ policy/restriction inheritance
                  └─ cross-provider composition
                  │
       external standards / profiles
  OAuth · AuthZEN · SSF · PROV · ODRL/DPV · JOSE
```

The project should reuse or profile established standards for generic transport, authorization, signals, provenance vocabulary, policy vocabulary, and cryptography.

## Why not just MCP?

If RCP only defined tools such as:

```text
get_relationship_context()
search_interactions()
subscribe_relationship_updates()
```

then an MCP extension would likely be sufficient.

RCP is only justified as an independent semantic layer if the same relationship object must preserve its meaning outside MCP.

The current design test is:

> **Would two independent systems still need to agree on this meaning if one carried the object over MCP and another carried the equivalent object over plain HTTP?**

Candidate semantics that may pass this test include:

- participant/relationship scope;
- epistemic class;
- evidence dependencies;
- multi-party projection rules;
- policy-preserving derivation;
- lifecycle/invalidation consequences;
- cross-provider conflict/support/supersession semantics.

A future `RCP-over-MCP` profile should carry these semantics rather than redefine them.

## Provider-owned implementation model

RCP does not require an RCP-operated cloud or central gateway.

A Provider may run its own RCP Server as:

- part of its existing backend;
- a microservice;
- a sidecar;
- an MCP server;
- an HTTP service;
- another binding/profile.

The Provider can keep raw/private evidence internal and expose only a safe relationship projection:

```text
private provider evidence
         │
         ▼
provider policy + deterministic/AI derivation
         │
         ▼
RCP semantic projection
         │
         ▼
authorized Consumer
```

AI may help derive context, but AI is not required for RCP conformance.

## Candidate v0.2 semantic concepts

The active non-normative draft currently explores:

- `ActorReference`;
- `RelationshipScope`;
- `InteractionEvidence`;
- `ContextAssertion`;
- `EpistemicClass`;
- `DerivationDependency`;
- `ContextLifecycle`;
- `PolicyReference`.

The project is intentionally **not** freezing these as final wire objects yet.

## Strongest relationship-specific invariants

Current candidates include:

- no rights expansion;
- no silent collapse of `{A,B,C}` evidence into `{A,B}` context;
- no silent promotion of statements/inferences into verified facts;
- persistent derived context retains material evidence/provenance dependencies;
- access to a child assertion does not imply access to its evidence;
- transformation does not silently erase restrictions;
- material dependency changes trigger downstream re-evaluation;
- historical lineage is not rewritten;
- independent surviving evidence may preserve an assertion after partial source invalidation;
- unknown material semantics fail closed.

## Preserved v0.1 evidence

Before the semantic-core refactor, RCP v0.1 implemented a larger interoperability stack with:

- `IdentityClaim`;
- `ProviderCapability`;
- `PermissionRequest` / `PermissionDecision`;
- `ContextAssertion`;
- `SecureEnvelope`;
- `RevocationEvent`.

The repository demonstrates:

- schema/semantic negative tests;
- permission-before-retrieval;
- provider representation boundaries;
- identity isolation;
- multi-party projection boundaries;
- provenance/source-access separation;
- derived-policy inheritance;
- revocation/recomputation;
- JOSE encrypted exchange;
- Node ↔ Python crypto interoperability;
- five separately stateful mock Providers;
- policy drift/stale authorization;
- optional operator-blind relay;
- external black-box Provider harness.

That work is preserved as evidence. It is not automatically the final v0.2 responsibility boundary.

## Current refactor hypothesis

| v0.1 concept | v0.2 direction under review |
| --- | --- |
| `IdentityClaim` | narrow to relationship-scoped identity evidence/binding |
| `ProviderCapability` | generic discovery moves to bindings; relationship representation semantics may remain |
| `PermissionRequest` / `PermissionDecision` | map to AuthZEN-compatible or equivalent authorization profile |
| `ContextAssertion` | retain and strengthen in semantic Core |
| `SecureEnvelope` | security/transport profile using established crypto standards |
| `RevocationEvent` | generic signal transport delegated; downstream relationship lifecycle stays Core |

## What must be proven next

The current priority is not broad external adoption or additional v0.1 mock infrastructure.

RCP must first prove that the semantic layer is real.

Required evidence includes:

1. machine-checkable multi-party projection scenarios;
2. deterministic conflict/support/supersession scenarios across Providers;
3. partial-source invalidation with independent surviving support;
4. policy-preserving derivation;
5. epistemic preservation;
6. equivalent semantic results when the same RCP meaning is carried over at least two materially different bindings, such as MCP and HTTP.

If transport independence cannot be demonstrated, the project should seriously consider becoming an MCP/domain extension rather than a separate semantic protocol.

## What success would mean

A successful v0.2 result would not mean RCP is a standard or production-ready.

It would mean:

> independent systems have a relationship-specific semantic contract that cannot be reduced to generic tool transport without losing deterministic participant, epistemic, provenance, restriction, or lifecycle meaning.

## Entry points

- Active semantic draft: [`../../spec/core-v0.2-draft.md`](../../spec/core-v0.2-draft.md)
- Standards boundary: [`../standards-boundary.md`](../standards-boundary.md)
- Architecture: [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md)
- Preserved v0.1 spec: [`../../spec/core-v0.1.md`](../../spec/core-v0.1.md)
- Refactor issue: [Issue #23](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/23)
- Preserved v0.1 clean-room milestone: [Issue #19](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/19)
