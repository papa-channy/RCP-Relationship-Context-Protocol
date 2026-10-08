# RCP Semantic Core v0.2 — Design Draft

> **Status: non-normative design draft**
>
> This document describes the active RCP v0.2 semantic-core direction after executable semantic conformance, a candidate wire model, real MCP/HTTP binding-equivalence testing, and a concrete standards-reconciliation pass. It does not replace the experimental v0.1 contract yet.

## 1. Design thesis

RCP should define a **transport-independent information and lifecycle model for relationship context**.

The Core must remain meaningful whether the same assertion is carried over MCP, HTTP, A2A, a Provider-native API, or another binding.

The current design target is:

> **portable, policy-bearing, provenance-bearing, stateful relationship context**

RCP is not intended to become a universal agent transport, authorization protocol, provenance ontology, policy language, identity system, cryptographic stack, or social-network protocol.

## 2. Why relationship context is a separate semantic problem

Relationship context differs from ordinary documents, tool responses, and social-graph edges because it commonly has all of the following properties:

1. **multi-party scope** — evidence may involve different participant sets from the relationship context derived from it;
2. **epistemic meaning** — statement, extraction, verification, observation, interpretation, inference, and strategy are not interchangeable;
3. **distributed evidence** — different Providers may independently support, contradict, refine, or supersede context;
4. **derived state** — commitments, open loops, preferences, and relationship state often arise from underlying interactions;
5. **policy-bearing derivation** — summarization, extraction, aggregation, or inference does not automatically erase restrictions;
6. **lifecycle coupling** — source correction/removal, identity changes, authorization changes, or policy changes may require downstream re-evaluation;
7. **provider-local evidence** — raw evidence may remain private while a Provider emits an authorized projection;
8. **cross-provider composition** — Consumers need deterministic rules for preserving disagreement, support, lineage, and restrictions.

RCP exists only if these semantics need interoperable agreement beyond generic transport/runtime standards.

## 3. Non-goals

RCP v0.2 Core should not define:

- a mandatory RCP-operated gateway, relay, cloud, registry, or database;
- a universal network transport;
- generic AI tool/resource invocation;
- agent-to-agent task lifecycle;
- authentication/login/token delegation;
- generic authorization request/decision mechanics;
- a universal provenance ontology;
- a universal policy/privacy vocabulary;
- generic event/signal transport;
- custom cryptographic primitives;
- a global human identity graph;
- a universal social relationship predicate or closeness score;
- a universal evidence-channel taxonomy;
- a universal model-confidence metric;
- a new schema-definition language.

Bindings/profiles should reuse mature standards where applicable, including MCP, A2A, HTTP, OAuth/OIDC, AuthZEN, Shared Signals, W3C PROV, ODRL, DPV, JOSE/COSE, and Provider-native mechanisms.

Detailed responsibility boundaries are documented in:

- [`../docs/standards-boundary.md`](../docs/standards-boundary.md)
- [`../docs/standards-reconciliation-v0.2.md`](../docs/standards-reconciliation-v0.2.md)

## 4. Current candidate semantic model

The current wire experiment uses one top-level `ContextAssertion` with embedded semantic structures. These are concepts, not commitments to independent top-level wire objects.

### 4.1 `ActorReference`

A scoped reference to a person, organization, service, agent, or other actor relevant to relationship context.

Required meaning:

- identifier meaning is scoped;
- equal strings in different scopes are not automatically the same actor;
- Provider-local identifiers are allowed;
- identity bindings may be material dependencies;
- uncertain identity evidence cannot silently merge sensitive histories.

RCP does not define universal identity verification or federation.

### 4.2 `RelationshipScope`

Defines the participant/trust scope to which a context assertion applies.

Candidate semantics include:

- optional local `relationship_ref`;
- target `participants`;
- `scope_type` such as bilateral or group;
- `trust_domain` / tenant isolation boundary;
- material `identity_dependency_refs`.

`RelationshipScope` is **not** a social edge predicate. ActivityStreams or domain vocabularies may describe `friendOf`, `follows`, membership, etc.; RCP does not duplicate that taxonomy.

#### Core invariant — no silent participant collapse

Evidence involving `{A,B,C}` must not silently become context about `{A,B}`.

Any change from declared source participants to target relationship participants requires an explicit semantic projection basis.

### 4.3 `EvidenceReference`

Represents relationship-relevant evidence without requiring raw evidence export.

The base evidence categories are intentionally abstract:

- `interaction`;
- `provider_projection`;
- `user_note`;
- `assertion`;
- `unknown`;
- namespaced extension types.

Channel-specific concepts such as message, Slack DM, call, meeting transcript, CRM event, or calendar event belong to Provider/domain mappings or namespaced extensions.

Evidence may expose only:

- an opaque reference;
- type-only information;
- metadata;
- a bounded source statement;
- a Provider-generated projection.

Each evidence reference declares `source_participants` separately from the target relationship scope.

### 4.4 `ContextAssertion`

`ContextAssertion` is the central semantic unit.

An assertion says one bounded thing about a relationship scope and carries sufficient information to interpret its epistemic class, lineage/dependencies, restrictions, cross-provider relations, and lifecycle state.

Base assertion subject categories are intentionally limited to concepts such as:

- commitment;
- open loop;
- preference;
- event;
- relationship state;
- shared topic;
- constraint;
- other / namespaced extensions.

Epistemic categories are not duplicated in `assertion_type`.

### 4.5 `EpistemicClass`

The current shared classes are:

- `source_statement` — a source stated something; truth is not independently asserted;
- `verified_fact` — verification occurred under an explicit basis/policy;
- `extracted_fact` — directly extracted without independent verification;
- `user_observation` — user-authored observation;
- `system_interpretation` — system-generated interpretation beyond direct extraction;
- `system_inference` — probabilistic/inferential conclusion;
- `strategy` — recommendation/proposed action rather than fact about a counterparty;
- `unknown` — epistemic class cannot safely be determined.

#### Core invariant — no epistemic promotion

Transport, repetition, summarization, aggregation, merging, or model confidence must not silently promote a weaker epistemic class to `verified_fact`.

`verified_fact` requires an explicit basis that resolves into declared lineage.

### 4.6 Confidence is extension/profile metadata

A naked numeric confidence score is not Core because values are not interoperable without a defined scoring/calibration profile.

Core only preserves:

```text
confidence != verification
```

Providers may expose confidence through a namespaced extension whose semantics are explicit.

### 4.7 `DerivationDependency`

Defines material dependencies that support or constrain a derived assertion.

Generic lineage should map to W3C PROV where practical. RCP-specific dependency meaning includes:

- dependency type: evidence, assertion, identity binding, or policy;
- evidentiary role such as support/corroboration/refinement;
- whether the dependency is material to current validity;
- independently sufficient evidence support paths.

The earlier base `transformation` field was removed during M4.5. Generic derivation/transformation activity belongs in PROV/profile metadata unless future interoperability evidence shows a relationship-specific transformation semantic is required.

### 4.8 `support_sets`

A flat provenance graph does not state which subsets of evidence are independently sufficient for a relationship assertion to remain supported.

RCP therefore currently models alternative sufficient support sets.

```json
{"support_sets": [["A"], ["B"]]}
```

means A or B independently supports the assertion.

```json
{"support_sets": [["A", "B"]]}
```

means A and B are jointly required.

This is a candidate RCP-specific semantic because it directly determines downstream validity/recomputation after source change.

### 4.9 `AssertionRelation`

Current cross-assertion relations include:

- `supports`;
- `corroborates`;
- `conflicts_with`;
- `supersedes`;
- `refines`.

Generic provenance/version vocabularies may map some relations, but RCP requires deterministic relationship-context meaning where conflict/replacement/support affects current state.

Arrival order alone is never semantic supersession.

### 4.10 `ContextLifecycle`

Current candidate assertion states are:

- `active`;
- `superseded`;
- `disputed`;
- `expired`;
- `invalidated`;
- `revoked`;
- `historical`.

`recompute` / `re-evaluate` are processing operations, not public lifecycle states.

A material dependency change triggers evaluation; the resulting assertion state may remain active under new lineage or transition to a more restrictive/currently non-active state.

### 4.11 `PolicyReference`

RCP does not define a universal policy language.

The semantic object carries references to material policy dependencies. Profiles may map them to:

- ODRL Policies;
- DPV purpose/processing/entity/location/legal-basis descriptions;
- AuthZEN context or authorization-system references;
- Provider-native policy;
- another explicit policy system.

RCP Core defines only the relationship-specific inheritance/consequence rules.

## 5. Candidate Core invariants

The following have executable coverage and remain the strongest candidates for eventual normative v0.2 behavior.

### 5.1 No rights expansion

RCP must not create rights that do not otherwise exist.

### 5.2 No silent participant collapse

Source evidence participant scope cannot be changed into another relationship scope without an explicit basis.

### 5.3 No epistemic promotion

Representation change or confidence cannot silently convert statement/observation/interpretation/inference into verified fact.

### 5.4 Material lineage continuity

Persistent derived relationship context retains material evidence/identity/policy dependencies or explicitly signals opaque/unavailable lineage.

### 5.5 Child access does not grant source access

Permission to consume a derived assertion does not imply permission to retrieve underlying evidence.

### 5.6 Transformation does not erase restrictions

Summarization, extraction, classification, aggregation, embedding, or inference does not by itself loosen source restrictions.

### 5.7 Restriction inheritance is conservative by default

Material restrictions remain in force according to the applicable policy profile unless a profile-defined re-derivation/declassification rule explicitly establishes a permitted loosening.

### 5.8 Dependency changes have downstream consequences

Changes to material evidence, identity bindings, authorization basis, policy dependencies, or source validity require dependent relationship context to be re-evaluated.

### 5.9 Historical lineage is not rewritten

Recomputation after source removal does not alter history to imply that the removed source was never used.

### 5.10 Independent support may preserve current context

A derived assertion may remain/recompute as current when a surviving valid support set is independently sufficient and current policy still permits the use.

### 5.11 Unknown material semantics fail closed

Unknown relationship scope, required semantic extensions, or other material semantics are not interpreted as a more permissive known value.

### 5.12 No central RCP infrastructure dependency

A conforming semantic exchange must not require infrastructure operated by the RCP maintainers.

### 5.13 Transport framing is not semantic state

MCP metadata, HTTP paths/headers/status, A2A task framing, or equivalent binding details must not change RCP relationship meaning unless explicitly represented in the RCP semantic object/profile.

## 6. Existing-standard mappings

### 6.1 MCP / HTTP / A2A

Bindings own discovery, connection, request/response framing, subscriptions/streaming, transport errors, retry/idempotency, and runtime capability mechanics.

RCP semantics sit inside the binding payload.

The repository has already demonstrated equivalent RCP semantic state through a real official MCP Resource client/server path and a plain HTTP path.

### 6.2 AuthZEN

AuthZEN Authorization API 1.0 should own generic authorization evaluation:

```text
Subject + Resource + Action + Context -> Decision
```

RCP should define a mapping/profile for relationship resources/actions/context rather than recreate `PermissionRequest` / `PermissionDecision` in Core.

### 6.3 Shared Signals

Shared Signals should own generic signal delivery where applicable.

RCP owns what a source/policy/identity/grant change means for dependent relationship assertions. If no existing CAEP event matches a relationship-specific change, an RCP SSF event profile is preferable to inventing a new event transport.

### 6.4 W3C PROV

PROV should represent generic Entity/Agent/Activity/Derivation lineage.

RCP retains participant projection, dependency materiality, support sufficiency, epistemic meaning, and relationship lifecycle consequences.

### 6.5 ODRL / DPV

ODRL/DPV should provide policy/privacy terminology where applicable. RCP retains conservative restriction propagation through relationship derivation.

### 6.6 ActivityStreams

ActivityStreams already represents social activities and typed relationship edges. RCP should not duplicate them.

`RelationshipScope` is an assertion-scope primitive, not a replacement social graph ontology.

### 6.7 Solid Application Interoperability

Solid SAI can solve data registration/access-needs/grants in Solid deployments. RCP does not duplicate that access architecture and can remain useful when raw evidence stays inside independent Providers.

### 6.8 AT Protocol Lexicon

RCP does not need a custom schema language. JSON Schema is the current serialization definition; semantics are separately executable.

### 6.9 Eclipse Dataspace Protocol

Dataspace Protocol is an architectural precedent for autonomous participants, domain protocol semantics, reuse of external standards, and separate bindings. It does not define relationship-context semantics.

## 7. Cross-provider composition

A Consumer composing context from multiple Providers must preserve provider/source separation before creating a new derived combined assertion.

Composition itself creates new lineage; it does not overwrite the input assertions.

A combined assertion must preserve:

- target/source participant scope;
- epistemic constraints;
- material evidence dependencies;
- material policy dependencies;
- conflicts/disputes;
- sufficient-support semantics;
- historical lineage.

## 8. Binding-independence evidence

M4.4 implemented the same Provider-owned assertion through:

1. official MCP TypeScript SDK v2 Resource server/client over stdio;
2. plain HTTP server/client.

Both extracted objects pass the same RCP schema/semantic validator and normalize to identical canonical relationship state.

This is internal executable evidence that the tested semantic object is not merely MCP-specific syntax. It is not unrelated external implementation evidence.

## 9. v0.1 migration direction

v0.1 remains a reproducible experimental baseline.

| v0.1 concept | v0.2 direction |
| --- | --- |
| `IdentityClaim` | narrow to relationship-scoped identity dependency/evidence profiles |
| `ProviderCapability` | generic discovery to bindings; keep only relationship representation semantics if needed |
| `PermissionRequest` | replace with AuthZEN-compatible profile/mapping |
| `PermissionDecision` | replace with AuthZEN-compatible profile/mapping |
| `ContextAssertion` | retain/strengthen as central RCP semantic object |
| `SecureEnvelope` | move to JOSE/COSE/security binding profile |
| `RevocationEvent` | move signal delivery to Shared-Signals-compatible profile; retain downstream lifecycle consequences in RCP |

No v0.1 artifact is silently reinterpreted as v0.2.

## 10. Current executable status

Implemented internally:

- abstract v0.2 semantic conformance;
- candidate v0.2 `ContextAssertion` JSON Schema;
- structural + cross-reference wire conformance;
- support-set semantics;
- participant-projection checks;
- required-extension fail-closed behavior;
- real MCP Resource binding;
- real plain HTTP binding;
- identical semantic normalization across those two bindings;
- v0.1 regression compatibility.

Not yet demonstrated:

- unrelated clean-room v0.2 implementation;
- external security/privacy review;
- real production Provider integration;
- complete PROV/AuthZEN/SSF/ODRL/DPV executable profiles;
- normative v0.2 stability.

## 11. Open design questions

- Can a PROV profile carry generic dependency records without duplicating them in the RCP serialization while preserving `material` and `support_sets`?
- Is disjunctive-normal `support_sets` expressive enough for real Providers?
- Does `projection_basis_ref` need a common vocabulary/profile?
- Which base `assertion_type` values survive real Provider implementation?
- Should opaque Provider assertions require a Provider-attestation/profile reference?
- Which policy constraints, if any, must be normalized inline rather than only referenced?
- Are any currently embedded structures independently addressable enough to justify promotion to top-level wire objects?
- How should temporal validity and disputes be represented without building a generic temporal or truth-maintenance system?

## 12. Rule for future Core additions

Do not add a Core field/object unless all of the following are true:

1. an established standard does not already own the generic primitive;
2. the concept changes relationship-context interpretation or lifecycle;
3. its meaning survives transport/runtime changes;
4. independent Providers need deterministic agreement on it;
5. it produces an executable interoperability invariant.

The goal is the **smallest semantic contract** independent systems need to exchange relationship context without losing participant scope, epistemic meaning, evidence sufficiency, restrictions, or lifecycle behavior.
