# RCP Standards Boundary — v0.2 Design Direction

**Status:** non-normative design boundary  
**Last reconciliation:** 2026-10-09

RCP should be as small as possible while still defining semantics that independent systems need in order to interpret relationship context consistently.

> **If an established standard can carry, authorize, describe, signal, or secure a generic concern without losing relationship-specific meaning, RCP should bind to or profile that standard rather than reimplement it.**

The detailed field-level reconciliation is in [`standards-mapping-v0.2.md`](./standards-mapping-v0.2.md).

## 1. Current layering model

```text
Applications / agents / CRMs / providers
                 │
        MCP · HTTP · A2A · native APIs
                 │
                 ▼
        RCP RELATIONSHIP CORE
──────────────────────────────────────────
ContextAssertion
  relationship / participant scope
  epistemic class
  evidence references
  projection basis
  material dependencies
  evidence-sufficiency support sets
  conflict / supersession relations
  relationship lifecycle
  material policy references
──────────────────────────────────────────
                 │
          profiles / mappings
                 │
 OAuth/OIDC · AuthZEN · Shared Signals
 PROV · ODRL/DPV · JOSE/COSE · others
```

No conforming RCP deployment should require infrastructure operated by the RCP project.

## 2. Concrete ownership decisions

| Concern | Owner | RCP status |
| --- | --- | --- |
| Tool/resource runtime and invocation | MCP / application protocol | **binding only** |
| Agent task transport | A2A / application protocol | **binding only** |
| HTTP route/status/header behavior | HTTP binding | **binding only** |
| Authentication / token delegation | OAuth/OIDC / provider auth | **profile/binding** |
| Generic authorization evaluation | AuthZEN-compatible PDP/PEP | **profile/map** |
| Signal/event delivery | Shared Signals / profile-defined SET events | **profile/map** |
| Generic provenance ontology | W3C PROV | **profile/map** |
| Generic usage policy language | ODRL | **profile/map** |
| Privacy/processing vocabulary | DPV | **profile/map** |
| Encryption/signing primitives | JOSE/COSE | **profile/binding** |
| Social relationship predicate / social edge | ActivityStreams or domain vocabularies | **not RCP novelty** |
| Schema definition language | JSON Schema / existing schema systems | **not RCP Core** |
| Relationship target/source participant scope | **RCP** | **Core** |
| Epistemic meaning of relationship assertions | **RCP** | **Core** |
| Evidence-to-relationship projection basis | **RCP** | **Core** |
| Material identity/policy/evidence dependencies | **RCP + mappings** | **Core consequence semantics** |
| Independently sufficient evidence support paths | **RCP** | **Core** |
| Cross-provider conflict/supersession semantics | **RCP** | **Core** |
| Relationship-assertion lifecycle after dependency change | **RCP** | **Core** |
| Restriction preservation through relationship derivation | **RCP + policy mappings** | **Core rule** |

## 3. MCP boundary — now executable

MCP answers questions such as:

- what Resources/Tools does a server expose;
- how does a client reach them;
- how are requests/responses framed.

RCP answers questions such as:

- which relationship/participants an assertion concerns;
- which participants were involved in source evidence;
- whether projection from source scope to target scope is justified;
- whether the assertion is a statement, extracted/verified fact, observation, interpretation, inference, or strategy;
- which evidence sets are independently sufficient;
- what happens when evidence, identity, or policy dependencies change.

The repository now has a real proof using the official MCP TypeScript SDK and a plain HTTP server:

```text
same Provider ContextAssertion
   ├─ MCP Resource -> official MCP Client --┐
   └─ HTTP GET -> fetch --------------------┤
                                           ▼
                             same RCP semantic validator
                                           │
                                           ▼
                               identical canonical state
```

This is internal executable evidence of binding independence for the tested slice, not external interoperability or production readiness.

See [`../bindings/v0_2/`](../bindings/v0_2/).

## 4. AuthZEN boundary

OpenID Authorization API 1.0 already defines the generic authorization information model:

```text
Subject
Action
Resource
Context
  -> Decision
```

RCP v0.2 therefore should **not** recreate v0.1 `PermissionRequest` / `PermissionDecision` as Core objects.

A future RCP/AuthZEN profile may map:

```text
Subject  = authenticated requesting principal
Resource = RCP assertion / relationship-context resource
Action   = read / derive / store / disclose / process / profile action
Context  = purpose / destination / processing location / environment
Decision = AuthZEN permit/deny result
```

RCP owns only the relationship-specific meaning of the protected resource and the downstream consequences of material authorization changes.

## 5. Shared Signals boundary

RCP does not own generic event delivery.

Shared Signals Framework can carry profile-defined signals/events. CAEP event types should be reused when their exact semantics match.

For relationship-specific source/policy/identity changes not represented by existing CAEP events, an RCP SSF profile may define an RCP event type rather than overloading an unrelated event.

RCP Core owns the consequence model:

```text
change signal
  -> resolve affected material dependency
  -> find dependent assertions
  -> re-evaluate surviving evidence + policy
  -> retain / recompute / restrict / dispute / invalidate / supersede
  -> preserve historical lineage
```

## 6. PROV boundary

W3C PROV should be the primary mapping target for generic lineage.

Candidate mapping:

```text
ContextAssertion             -> prov:Entity
EvidenceReference            -> prov:Entity
Provider / derivation system -> prov:Agent
Derivation process           -> prov:Activity
source lineage               -> prov:wasDerivedFrom / qualified Derivation
provider attribution         -> prov:wasAttributedTo where applicable
```

RCP must not create a competing universal provenance ontology.

What remains RCP-specific is **lifecycle interpretation of provenance**, especially:

- participant projection boundaries;
- material vs non-material dependency;
- independently sufficient evidence sets;
- evidence support/corroboration/conflict meaning;
- partial-source invalidation/recomputation;
- child assertion access not granting source access.

`support_sets` are therefore not a replacement for PROV. They are the minimum relationship-validity information PROV lineage alone does not specify.

## 7. ODRL / DPV boundary

ODRL can express policy permissions, prohibitions, duties, constraints, assets, and parties. DPV provides reusable vocabulary for purposes, processing operations, entities/roles, locations/context, legal bases, rights, and related privacy concepts.

RCP should reference/profile them where practical instead of inventing its own general policy/privacy vocabulary.

The Core rule is narrower:

> a derived relationship assertion does not become less restricted merely because evidence was summarized, extracted, aggregated, or inferred.

When multiple material evidence sources contribute, RCP defines that material restrictions remain in force according to the applicable policy profile. The syntax and vocabulary of those policies live outside Core.

## 8. ActivityStreams boundary

ActivityStreams already defines a `Relationship` object as a reified subject–relationship–object statement.

Therefore RCP should not define:

- a universal `friend`, `colleague`, `mentor`, `trusted`, or closeness taxonomy;
- a competing generic social edge representation.

RCP `RelationshipScope` is different: it says **which participant set a context assertion is about**, and keeps that target set separate from source-evidence participants.

That distinction is required for rules such as:

```text
source participants = {A,B,C}
target relationship = {A,B}

=> explicit projection basis required
```

## 9. Solid SAI boundary

Solid Application Interoperability already defines Social Agents, data registries, access needs, authorizations, grants, and application data interoperability over Solid Pods.

RCP should not recreate those mechanisms.

RCP is compatible with a different deployment assumption:

```text
Provider A raw evidence stays in Provider A
Provider B raw evidence stays in Provider B

only authorized relationship projections cross boundaries
```

A future Solid binding/profile could carry RCP assertions, but Solid storage/access mechanics are not RCP Core.

## 10. AT Protocol / Lexicon boundary

Lexicon is an existing schema language for AT Protocol records, RPC methods, subscriptions, and permission sets.

RCP does not need a new schema language. The current project uses JSON Schema for one serialization, while Core semantics are validated separately so another serialization/profile could be introduced later.

## 11. Eclipse Dataspace Protocol precedent

Eclipse Dataspace Protocol is a useful architecture precedent because it defines governed data-sharing semantics and transport bindings for autonomous parties while reusing external vocabularies such as ODRL/DCAT.

RCP follows the same architectural discipline but applies it to a different semantic problem: relationship context rather than dataset catalog/contract/transfer negotiation.

## 12. Schema reductions adopted in this reconciliation

The concrete reconciliation removed several accidental Core claims.

### Removed: top-level `confidence`

A number without a calibration/profile is not interoperable. Model confidence now belongs in a namespaced extension/profile.

Core keeps only the invariant:

```text
confidence != verification
```

### Removed: epistemic categories from `assertion_type`

`observation`, `interpretation`, `inference`, and `strategy` were removed from the base `assertion_type` registry because they duplicate `epistemic_class`.

The axes are now orthogonal:

```text
assertion_type   = what the assertion concerns
                   commitment / preference / event / state / ...

epistemic_class = how it is known or intended
                   statement / fact / observation / inference / strategy / ...
```

### Reduced: evidence channel taxonomy

The Core evidence types are now deliberately abstract:

```text
interaction
provider_projection
user_note
assertion
unknown
x-namespace:type
```

`message`, `Slack DM`, `meeting transcript`, `phone call`, CRM event, etc. are Provider/domain vocabulary and should use namespaced types or mappings.

### Strengthened: channel-independent projection rule

Any evidence whose `source_participants` differ from the assertion target participants requires an explicit `projection_basis_ref`.

The safety rule no longer depends on whether RCP recognizes the evidence channel.

## 13. Remaining originality boundary

After removing generic and duplicated responsibilities, RCP's candidate independent protocol value is:

> **a transport-independent semantic and lifecycle contract for provider-derived relationship context, preserving target/source participant scope, epistemic meaning, evidentiary sufficiency, material identity/policy dependencies, restriction inheritance, and downstream state transitions across heterogeneous systems.**

This claim is still a hypothesis until unrelated implementations and adversarial review confirm that the semantic contract is both necessary and independently implementable.

## 14. Guardrail for future Core changes

Before adding a field/object to Core, require all of the following:

1. Existing standards do not already own the generic primitive.
2. The concept changes relationship-context interpretation or lifecycle.
3. Its meaning survives MCP/HTTP/A2A/provider-native binding changes.
4. Two Providers need deterministic agreement on it without an LLM guessing the semantics.
5. It produces an executable interoperability invariant.

Otherwise it belongs in a profile, binding, extension, or external standard.
