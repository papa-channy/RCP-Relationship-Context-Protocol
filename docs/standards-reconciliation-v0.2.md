# RCP v0.2 Concrete Standards Reconciliation

> **Status:** design reconciliation, non-normative  
> **Reviewed:** 2026-10-09

This document applies the RCP scope rule to the **concrete v0.2 draft wire model**, not just to abstract project responsibilities.

The goal is subtraction:

> If an established standard already owns a generic primitive, RCP should reuse, reference, or profile it. RCP should keep only the relationship-specific semantics whose loss would make independent systems interpret the same relationship context differently.

## Verdict vocabulary

- **KEEP** — relationship-specific semantic agreement remains an RCP Core responsibility.
- **PROFILE / MAP** — RCP needs the semantic dependency but should map it to an established standard rather than own the generic model.
- **BINDING-ONLY** — belongs to MCP/HTTP/A2A/provider bindings, not semantic Core.
- **REMOVE / EXTENSION** — not sufficiently interoperable or relationship-specific for the base Core; remove or move to a namespaced extension.
- **WIRE SCAFFOLDING** — needed to serialize/version an RCP object but not part of RCP's originality claim.

---

## 1. Standards reviewed

### MCP

MCP defines runtime primitives such as Resources and the mechanics by which clients read them. RCP has already demonstrated the same `ContextAssertion` over a real MCP Resource and a plain HTTP endpoint.

**Boundary:** MCP can carry RCP. MCP does not define the relationship-context information model.

Reference: <https://modelcontextprotocol.io/>

### OpenID AuthZEN Authorization API 1.0

AuthZEN 1.0 is a Final Specification. Its information model already defines `Subject`, `Resource`, `Action`, `Context`, and boolean `Decision` between PEPs and PDPs.

**Boundary:** RCP must not recreate a generic permission request/decision protocol. A future RCP authorization profile should describe how a relationship assertion/resource and RCP-specific processing context are represented in AuthZEN.

Reference: <https://openid.net/specs/authorization-api-1_0.html>

### OpenID Shared Signals Framework / CAEP

Shared Signals Framework 1.0 and CAEP 1.0 are Final Specifications. SSF provides a framework for exchanging profile-defined signals/events between cooperating peers; CAEP defines continuous access-related event types.

**Boundary:** signal transport is not RCP Core. RCP owns the downstream consequence semantics for relationship-context dependencies. RCP-specific source/policy/identity invalidation may require an RCP SSF event profile when no existing CAEP event has the exact meaning.

References:
- <https://openid.net/wg/sharedsignals/specifications/>
- <https://openid.net/specs/openid-sharedsignals-framework-1_0-final.html>

### W3C PROV-O

PROV-O provides generic provenance concepts including `Entity`, `Activity`, `Agent`, `wasDerivedFrom`, and qualified `Derivation`.

**Boundary:** RCP should map generic lineage to PROV rather than invent a competing provenance ontology. PROV does not, by itself, define which alternative subsets of evidence are independently sufficient to keep a relationship assertion valid after one dependency disappears. That evidence-sufficiency/lifecycle rule remains RCP-specific.

Reference: <https://www.w3.org/TR/prov-o/>

### W3C ODRL

ODRL defines machine-readable `Policy`, `Permission`, `Prohibition`, `Duty`, `Constraint`, `Asset`, and `Party`, and explicitly supports domain profiles.

**Boundary:** RCP should reference/profile ODRL for usage-policy expression when useful. RCP should not create a universal policy language. RCP still needs to define how material restrictions attached to multiple evidence sources affect a derived relationship assertion.

Reference: <https://www.w3.org/TR/odrl-model/>

### Data Privacy Vocabulary (DPV)

DPV provides extensible concepts/taxonomies for purposes, data categories, processing operations, entities/roles, legal basis, rights, locations/context, and technologies including AI.

**Boundary:** purpose, processing, recipient/entity, location, legal-basis, and similar privacy vocabulary should reuse/map to DPV where applicable. RCP should not maintain a competing universal privacy vocabulary.

Reference: <https://w3id.org/dpv>

### ActivityStreams 2.0

ActivityStreams defines social activity syntax and includes a `Relationship` object with `subject`, `relationship`, and `object` — a reified relationship statement.

**Boundary:** RCP must not claim novelty for representing a social edge or relationship predicate. `RelationshipScope` has a different job: defining the participant/trust scope to which a context assertion applies, including multi-party evidence/projection boundaries. RCP should not create a universal friend/colleague/closeness taxonomy.

References:
- <https://www.w3.org/TR/activitystreams-core/>
- <https://www.w3.org/TR/activitystreams-vocabulary/>

### Solid Application Interoperability

Solid SAI defines interoperability for Social Agents/Applications over data in Solid Pods, including data registrations, access needs, access authorizations, and access grants.

**Boundary:** RCP should not recreate user-controlled data registries or generic access-grant flows. RCP remains provider-local/federated: raw evidence may stay in Slack, Gmail, CRM, etc., while only a relationship-context projection is exchanged.

Reference: <https://solidproject.org/TR/sai>

### AT Protocol Lexicon

Lexicon is a schema language for records, queries, procedures, subscriptions, and permission sets.

**Boundary:** RCP does not need its own schema-definition language. JSON Schema (or an equivalent serialization definition) is sufficient for RCP wire artifacts. Lexicon is an architectural/schema precedent, not a replacement for relationship semantics.

Reference: <https://atproto.com/specs/lexicon>

### Eclipse Dataspace Protocol

The Dataspace Protocol is a stable specification for interoperable, usage-controlled data sharing between autonomous entities. It reuses DCAT and ODRL and separates protocol semantics from HTTPS bindings/transport.

**Boundary:** it is a strong architectural precedent for RCP's `semantic protocol + profiles/bindings + reuse existing standards` approach. It does not define relationship-context epistemics, participant projection, evidence sufficiency, or relationship-derived lifecycle.

Reference: <https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/>

---

## 2. Concrete v0.2 field-level mapping

| RCP draft field/concept | Existing-standard overlap | Verdict | RCP-specific residue |
| --- | --- | --- | --- |
| `type` | generic typed-object convention | **WIRE SCAFFOLDING** | identify RCP object kind |
| `rcp_version` | generic protocol versioning | **WIRE SCAFFOLDING** | distinguish incompatible RCP semantics |
| `assertion_id` | generic resource/entity identifiers | **WIRE SCAFFOLDING** | scoped addressability for relations/lineage |
| `assertion_type` | ActivityStreams and domain vocabularies define many event/object types | **KEEP, MINIMIZE** | only relationship-context subject categories; no social relationship taxonomy |
| `relationship_scope` | ActivityStreams relationship edges; Solid agents/roles | **KEEP** | assertion target participant set, trust domain, identity dependencies, projection boundary |
| `ActorReference.actor_id/scope` | AuthZEN Subject IDs; Solid identities; generic identifiers | **KEEP MINIMAL / MAP** | scoped identity reference without claiming global identity equality |
| `ActorReference.actor_type` | generic entity vocabularies/DPV roles | **PROFILE / MAP** | only minimal interpretation; allow namespaced external types |
| `scope_type` | group/role concepts exist elsewhere | **KEEP MINIMAL** | determines relationship assertion cardinality/scope semantics, not social closeness |
| `trust_domain` | auth/security domain concepts exist generically | **KEEP** | prevents accidental cross-tenant/cross-domain identity/context collapse |
| `identity_dependency_refs` | PROV can model dependencies; identity systems model bindings | **KEEP + PROV MAP** | identity resolution is material relationship lineage and can invalidate current context |
| `epistemic_class` | PROV records origin but does not define truth/knowledge status classes | **KEEP** | source statement vs extracted/verified fact vs observation/interpretation/inference/strategy |
| `statement` | generic content/text | **WIRE SCAFFOLDING** | bounded assertion payload |
| `confidence` | generic model score; no stable cross-provider semantics | **REMOVE / EXTENSION** | not comparable unless a profile defines calibration/meaning; confidence is not verification |
| `verification_basis_refs` | PROV can point to entities/activities | **KEEP + PROV MAP** | explicit basis required before `verified_fact`; basis must resolve to semantic lineage |
| `provenance` | W3C PROV | **PROFILE / MAP** | RCP keeps minimum exposure/lineage contract and lifecycle consequences |
| `provenance.mode` | PROV has Entity/Activity relations but not RCP exposure modes | **KEEP MINIMAL** | direct evidence vs derived vs opaque/unavailable lineage exposure |
| `provenance.visibility` | policy/privacy systems can constrain disclosure | **KEEP MINIMAL / POLICY MAP** | tells Consumer whether detailed lineage is intentionally exposed, redacted, opaque, or unavailable |
| `EvidenceReference.evidence_ref` | PROV Entity identifiers | **PROFILE / MAP** | reference into RCP lifecycle dependency graph |
| `evidence_type` | ActivityStreams, provider schemas, domain vocabularies | **KEEP VERY ABSTRACT / EXTEND** | only categories needed to interpret relationship evidence; channel taxonomy should not be Core |
| `provider_ref` | PROV `Agent` / attribution concepts | **PROFILE / MAP** | source-provider origin retained for composition/audit |
| `representation` | generic fidelity/representation concept | **KEEP MINIMAL** | raw evidence may stay private while a bounded projection remains usable |
| `source_participants` | ActivityStreams audience/actors; generic event participants | **KEEP** | source-interaction scope distinct from target relationship scope |
| `projection_basis_ref` | no direct generic equivalent | **KEEP** | explicit reason/basis for narrowing or otherwise changing participant scope |
| evidence `occurred_at` | PROV time / generic timestamps | **PROFILE / MAP** | temporal evidence metadata only |
| evidence `policy_refs` | ODRL/DPV/provider policy | **PROFILE / MAP** | restrictions attached to material source evidence |
| `Derivation.dependencies` | PROV derivation/dependency | **PROFILE / MAP** | dependency classes affect RCP lifecycle behavior |
| dependency `dependency_type` | PROV Entity/Agent/Activity is more generic | **KEEP MINIMAL** | distinguish evidence/assertion/identity/policy because each changes RCP lifecycle differently |
| dependency `role` | PROV derivation covers part; support/corroboration/refinement are domain semantics | **KEEP + PROV MAP** | evidentiary role in relationship composition |
| dependency `material` | no direct PROV truth-sufficiency equivalent | **KEEP** | determines whether change must trigger RCP re-evaluation |
| `support_sets` | PROV can express lineage but not alternative sufficient evidence sets | **KEEP** | distinguish `{A} OR {B}` from `{A AND B}` for downstream validity/recomputation |
| `assertion_relations.supports/corroborates/conflicts_with/supersedes/refines` | generic provenance/version vocabularies cover only subsets | **KEEP MINIMAL** | deterministic cross-provider relationship-context reconciliation |
| `policy_refs` | ODRL / DPV / provider policy | **PROFILE / MAP** | attach material policy without defining a new policy language |
| `lifecycle.state` | many protocols define their own state machines | **KEEP** | state of a relationship assertion after evidence/identity/policy changes |
| lifecycle timestamps/reasons | generic temporal/reason metadata | **WIRE SCAFFOLDING / PROFILE** | explain/assert current lifecycle state |
| `required_extensions` / `extensions` | common extensibility pattern; ATProto Lexicon has namespace/schema mechanisms | **WIRE SCAFFOLDING** | fail closed when unknown extension changes material relationship semantics |
| MCP Resource URI / `resources/read` | MCP | **BINDING-ONLY** | none in Core |
| HTTP route / headers / status | HTTP | **BINDING-ONLY** | none in Core |
| authentication / token delegation | OAuth/OIDC | **BINDING/PROFILE** | none in Core |
| authorization request/decision | AuthZEN | **PROFILE / MAP** | define RCP resource/action/context mapping, not a new decision protocol |
| invalidation event transport | SSF/CAEP or profile-defined SET events | **PROFILE / MAP** | RCP defines descendant/lifecycle consequence after trigger |
| encryption/signing | JOSE/COSE | **BINDING/PROFILE** | no custom cryptographic primitive in Core |

---

## 3. Concrete reductions resulting from this pass

### 3.1 Remove base `confidence`

A naked number such as `0.82` is not interoperable without knowing:

- what is being scored;
- model/calibration regime;
- probability vs ranking vs heuristic interpretation;
- population/domain;
- whether values are comparable across Providers.

RCP Core only needs the invariant:

> confidence does not equal verification.

Providers that need confidence SHOULD use a namespaced extension/profile that defines its semantics.

### 3.2 Remove epistemic duplicates from `assertion_type`

The following base assertion types duplicate the orthogonal `epistemic_class` axis:

- `observation`
- `interpretation`
- `inference`
- `strategy`

They should not exist as base `assertion_type` values.

`assertion_type` should describe **what the assertion is about** (e.g. commitment, open loop, preference, event, relationship state), while `epistemic_class` describes **how the assertion is known or intended**.

### 3.3 Shrink evidence channel taxonomy

RCP Core should not standardize every source channel (`message`, `thread`, `call`, `meeting`, `calendar_event`, CRM, social, etc.). Those ecosystems already have their own vocabularies and will continue to evolve.

The base model only needs enough distinction for relationship semantics, for example:

- `interaction`
- `provider_projection`
- `user_note`
- `assertion`
- `unknown`
- namespaced extensions

Specific channels can be namespaced extensions or mapped from ActivityStreams/provider schemas.

### 3.4 Make participant-projection safety evidence-type independent

The no-silent-participant-collapse rule is semantic, not channel-specific.

If an evidence item's declared `source_participants` differ from the target `relationship_scope.participants`, an explicit `projection_basis_ref` is required regardless of whether the evidence came from a message, meeting, CRM event, provider projection, or another source.

This removes hidden semantics from the `evidence_type` registry.

---

## 4. Mapping profiles to build later

These are **profiles/mappings**, not new Core objects.

### RCP ↔ PROV profile

Candidate mappings:

```text
ContextAssertion               -> prov:Entity
EvidenceReference              -> prov:Entity (or externally referenced Entity)
Provider / derivation system   -> prov:Agent
Derivation transformation      -> prov:Activity
Dependency derived_from        -> prov:wasDerivedFrom / qualified Derivation
provider_ref                   -> prov:wasAttributedTo (where applicable)
```

RCP-specific fields such as `material`, `support_sets`, participant projection, epistemic class, and lifecycle consequences remain outside generic PROV semantics.

### RCP ↔ AuthZEN profile

Candidate mapping:

```text
AuthZEN Subject
  = authenticated requesting user/agent principal

AuthZEN Resource
  type = rcp-context-assertion / relationship-context
  id   = assertion/resource identifier
  properties may include relationship scope / representation class

AuthZEN Action
  = read / derive / store / disclose / process / other profile-defined action

AuthZEN Context
  = purpose, destination, processing location, binding/environment facts

AuthZEN Decision
  = generic permit/deny result
```

RCP should not reintroduce `PermissionRequest` / `PermissionDecision` into v0.2 Core.

### RCP ↔ Shared Signals profile

SSF can transport a trigger such as:

- source invalidated/corrected;
- identity binding invalidated;
- policy dependency changed;
- authorization basis changed.

RCP then performs:

```text
signal
  -> resolve dependency
  -> identify affected assertions
  -> re-evaluate surviving support + policy
  -> transition/recompute
  -> preserve historical lineage
```

Existing CAEP event types should be reused only when their semantics match. RCP should define a profile-specific SET event type rather than overload an unrelated CAEP event for source-level relationship-context changes.

### RCP ↔ ODRL / DPV profile

ODRL can express permissions/prohibitions/duties/constraints over assets; DPV can provide purpose, processing, entity/recipient, location, legal-basis, and privacy terminology.

RCP's `policy_refs` should be capable of referencing such external policy/processing descriptions.

RCP still owns the **composition rule**: material restrictions on evidence do not disappear merely because evidence is summarized or combined into a relationship assertion.

---

## 5. Why ActivityStreams / Solid / ATProto / Dataspace do not eliminate the Core

### ActivityStreams

ActivityStreams can say that Alice has a typed relationship to Bob or that an activity occurred. It does not define RCP's distinction between:

- target relationship scope and source participant scope;
- epistemic class;
- evidence sufficiency sets;
- derived relationship-context invalidation;
- policy-preserving projection.

RCP should therefore **reuse social/activity vocabularies where useful without redefining social graph predicates**.

### Solid SAI

Solid SAI provides a rich answer to who can discover/access/manipulate data controlled by a Social Agent. RCP does not need to reproduce that access system.

RCP addresses a different interoperability problem: what a Provider-generated relationship-context projection means when the raw evidence may remain inside the Provider rather than being normalized into a shared Pod/data registry.

### ATProto Lexicon

Lexicon demonstrates schema-driven application interoperability but is tied to the AT Protocol data/RPC model. RCP already uses JSON Schema and does not need a competing schema language.

### Eclipse Dataspace Protocol

Dataspace Protocol is the closest architectural precedent for separating domain protocol semantics from transport bindings while profiling existing standards. It reinforces RCP's architectural direction rather than replacing the relationship-specific model.

---

## 6. Resulting RCP originality boundary

After this reconciliation, RCP should **not** claim originality for:

- representing a social relationship edge;
- generic identity;
- generic resource/tool access;
- authorization request/decision mechanics;
- provenance graphs in general;
- usage-policy languages;
- event delivery;
- transport bindings;
- schema-definition languages;
- cryptography.

The remaining candidate independent value is narrower:

> **A transport-independent semantic and lifecycle contract for provider-derived relationship context, preserving target/source participant scope, epistemic meaning, evidentiary sufficiency, material identity/policy dependencies, restriction inheritance, and downstream state transitions across heterogeneous systems.**

That is the boundary future implementation and external validation must falsify or confirm.
