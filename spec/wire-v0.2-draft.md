# RCP v0.2 Draft Wire Model

> **Status: non-normative candidate representation**
>
> This document does not replace RCP Core v0.1. It is an executable design artifact for the v0.2 semantic-core direction and may change before any normative v0.2 release.

## 1. Design objective

The v0.2 wire model encodes the smallest transport-independent relationship-context contract currently required by executable semantic scenarios.

After the M4.5 standards-reconciliation pass, the candidate deliberately keeps **one top-level semantic object**:

```text
ContextAssertion
```

Embedded structures provide only the relationship-specific information necessary to interpret that assertion:

```text
ActorReference
RelationshipScope
EvidenceReference
DerivationDependency
AssertionRelation
ContextLifecycle
PolicyReference(s)
```

Generic authorization, event transport, provenance ontology, policy language, cryptography, schema language, and transport framing remain outside semantic Core.

See:

- [`../docs/standards-boundary.md`](../docs/standards-boundary.md)
- [`../docs/standards-reconciliation-v0.2.md`](../docs/standards-reconciliation-v0.2.md)

## 2. Candidate top-level shape

```json
{
  "type": "rcp.context_assertion",
  "rcp_version": "0.2-draft",
  "assertion_id": "assertion:commitment-k",
  "assertion_type": "commitment",
  "relationship_scope": {},
  "epistemic_class": "system_interpretation",
  "statement": "A and B have an open commitment.",
  "provenance": {},
  "policy_refs": [],
  "lifecycle": {"state": "active"},
  "created_at": "2026-10-09T00:00:00Z"
}
```

The candidate schema is:

[`schemas/v0.2-draft/context-assertion.schema.json`](./schemas/v0.2-draft/context-assertion.schema.json)

`type`, `rcp_version`, identifiers, and timestamps are wire scaffolding. They are not claimed as RCP-specific protocol novelty.

## 3. `assertion_type` and `epistemic_class` are orthogonal

M4.5 removed an accidental duplication between what an assertion is **about** and how it is **known/intended**.

Base `assertion_type` values are now limited to relationship-context subject categories:

- `commitment`
- `open_loop`
- `preference`
- `event`
- `relationship_state`
- `shared_topic`
- `constraint`
- `other`
- namespaced extensions

The following are **not** base `assertion_type` values:

- observation
- interpretation
- inference
- strategy

Those belong exclusively to `epistemic_class`.

Current epistemic classes are:

- `source_statement`
- `verified_fact`
- `extracted_fact`
- `user_observation`
- `system_interpretation`
- `system_inference`
- `strategy`
- `unknown`

`verified_fact` requires explicit `verification_basis_refs`, and semantic conformance requires those references to resolve to declared lineage.

## 4. Confidence is not Core

The earlier draft had a top-level numeric `confidence` field. M4.5 removed it.

A bare number is not interoperable unless a profile defines what it means, how it is calibrated, and whether values from different Providers/models are comparable.

RCP keeps only the invariant:

```text
confidence != verification
```

A Provider that needs model confidence should use a namespaced extension/profile, for example:

```json
{
  "required_extensions": ["x-example:confidence-model"],
  "extensions": {
    "x-example:confidence-model": {
      "score": 0.71,
      "model_version": "1",
      "semantics": "provider-defined calibrated probability"
    }
  }
}
```

## 5. Relationship scope

`relationship_scope` defines the target participant set to which the assertion applies.

It does not define a global identity system or a social relationship predicate such as `friendOf`.

Actor identifiers are explicitly scoped:

```json
{
  "actor_id": "B",
  "scope": "tenant:t1",
  "actor_type": "person"
}
```

String equality outside the declared scope does not imply global identity equality.

The relationship scope contains:

- target participants;
- a scope type such as bilateral or group;
- a trust/tenant domain;
- optional material identity-binding dependencies.

ActivityStreams and other social vocabularies may describe relationship predicates or activities. RCP's distinct responsibility is the **scope of a context assertion and its dependency on scoped identity interpretation**.

## 6. Evidence references and participant projection

Evidence remains Provider-controlled. RCP does not require raw evidence export or a universal evidence store.

The base `evidence_type` registry is intentionally abstract after M4.5:

- `interaction`
- `provider_projection`
- `user_note`
- `assertion`
- `unknown`
- namespaced extensions

Specific channel vocabularies such as email message, Slack DM, meeting transcript, phone call, CRM event, or ActivityStreams activity should be expressed through a namespaced extension or external mapping, not a growing Core registry.

An evidence reference still declares `source_participants` separately from the assertion's target `relationship_scope.participants`.

This distinction is central:

```text
source participants = {A,B,C}
target relationship = {A,B}
```

Whenever those sets differ, **regardless of evidence type**, an explicit semantic basis is required:

```json
{"projection_basis_ref": "basis:explicit-a-b-commitment"}
```

The field identifies the basis. This draft does not define a universal proof language for the basis.

## 7. Evidence representation

`representation` describes how much evidence representation is exposed through this RCP object:

- `opaque_ref`
- `type_only`
- `metadata`
- `source_statement`
- `provider_projection`

This is intentionally not a content-format registry. It supports the RCP requirement that Provider-held raw evidence may remain unavailable while an authorized lower-fidelity relationship projection remains usable.

## 8. Provenance and W3C PROV mapping

RCP should not invent a competing provenance ontology.

The candidate model supports four exposure modes:

- `evidence`
- `derived`
- `opaque`
- `unavailable`

A future PROV profile should map generic lineage concepts such as:

```text
ContextAssertion             -> prov:Entity
EvidenceReference            -> prov:Entity
Provider / derivation system -> prov:Agent
Derivation process           -> prov:Activity
source dependency            -> prov:wasDerivedFrom / qualified Derivation
```

RCP keeps only relationship-specific consequences that generic lineage does not settle, including participant projection, materiality, evidence sufficiency, and downstream lifecycle behavior.

Opaque provenance does not automatically make an assertion unusable. A Provider may be authorized to expose a projection without exposing its source.

## 9. Derivation and support paths

Generic derivation lineage is mappable to PROV, but lifecycle behavior requires additional relationship validity semantics.

The draft therefore represents:

1. typed/material dependencies; and
2. independently sufficient evidence `support_sets`.

Example:

```json
{
  "dependencies": [
    {
      "dependency_ref": "evidence:A",
      "dependency_type": "evidence",
      "role": "supports",
      "material": true
    },
    {
      "dependency_ref": "evidence:B",
      "dependency_type": "evidence",
      "role": "corroborates",
      "material": true
    }
  ],
  "support_sets": [
    ["evidence:A"],
    ["evidence:B"]
  ]
}
```

This means either A or B independently supports the assertion.

By contrast:

```json
{"support_sets": [["evidence:A", "evidence:B"]]}
```

means both are jointly required.

The earlier draft `transformation` field was removed from this base structure. Generic transformation activity belongs in provenance/profile metadata unless a relationship-specific transformation semantic is later proven necessary.

## 10. Policy dependencies

RCP v0.2 does not define a universal policy or privacy vocabulary.

The draft carries references only:

- `policy_refs` on the assertion;
- optional `policy_refs` on evidence;
- material `policy` dependencies in derivation lineage.

A future profile may point these references to ODRL Policies, DPV processing/purpose descriptions, Provider policy, or another compatible policy system.

Core owns the relationship-specific rule:

> derivation or projection does not silently erase material restrictions.

Conformance requires material policy dependencies to remain carried by the derived assertion unless a future explicit declassification/re-derivation profile defines valid loosening semantics.

## 11. Assertion relations

Cross-provider composition needs relations that transport arrival order cannot substitute for:

- `supports`
- `corroborates`
- `conflicts_with`
- `supersedes`
- `refines`

Some parts can map to generic provenance/version vocabularies. The relationship-specific requirement is that Consumers can deterministically preserve disagreement, replacement, and evidentiary support without an LLM inventing the relation from prose.

An assertion cannot meaningfully declare one of these relations to itself.

A later arrival does not automatically become `supersedes`.

## 12. Lifecycle

The current assertion states are:

- `active`
- `superseded`
- `disputed`
- `expired`
- `invalidated`
- `revoked`
- `historical`

`recompute` and `re-evaluate` remain processing operations rather than public lifecycle states.

A dependency change may cause a Consumer/Provider to re-evaluate support and policy, resulting in a new active lineage, restriction, dispute, invalidation, supersession, revocation, or historical transition.

Historical lineage must not be rewritten to imply a removed source was never used.

## 13. Required extensions

Namespaced extensions use:

```text
x-<namespace>:<name>
```

A semantic extension required to safely interpret an assertion appears in `required_extensions`.

A Consumer that does not support such an extension must fail closed rather than ignore it.

Optional extension data may remain ignorable only when it does not alter Core meaning.

## 14. Binding independence — implemented for MCP and HTTP

The repository now carries the same draft `ContextAssertion` through two real binding implementations:

```text
Provider fixture
   ├─ official MCP SDK Resource -> official MCP Client --┐
   └─ plain HTTP GET -> fetch ---------------------------┤
                                                        ▼
                                          same validator/normalizer
                                                        │
                                                        ▼
                                             identical semantic state
```

See [`../bindings/v0_2/`](../bindings/v0_2/).

MCP Resource URIs, `resources/read`, stdio connection mechanics, HTTP paths, headers, and status codes are binding state. They are not included in normalized RCP semantic state.

This is an **internal executable binding-independence proof** for the tested slice. It is not production binding certification or unrelated third-party interoperability.

## 15. AuthZEN / Shared Signals / security profiles remain external

The semantic wire object does not contain generic authorization requests/decisions, signal transport envelopes, or cryptographic envelopes.

Future profiles should prefer:

- OAuth/OIDC for authentication/delegation;
- AuthZEN for generic authorization request/decision mechanics;
- Shared Signals / appropriate profile-defined SET events for change-signal delivery;
- JOSE/COSE for security envelopes where a binding requires them.

RCP owns the relationship resource meaning and downstream lifecycle consequences, not those generic mechanisms.

## 16. Why embedded structures remain embedded

This draft still does not define separate top-level wire schemas for `RelationshipScope`, `EvidenceReference`, or `DerivationDependency`.

A concept should become independently addressable only if implementation evidence shows a need to:

- exchange it independently of an assertion;
- version it independently;
- reference it across many assertions beyond safe scoped refs;
- apply independent lifecycle or authorization semantics to it.

Until then, embedded structures keep the Core smaller.

## 17. What this model does not define

This draft does not define:

- endpoint discovery;
- generic server capabilities;
- authentication or delegated authorization;
- generic permission request/decision objects;
- event transport or subscriptions;
- key discovery/rotation;
- encryption/signature representation;
- retries/idempotency;
- Provider storage architecture;
- a universal social relationship taxonomy;
- a universal provenance ontology;
- a universal policy/privacy vocabulary;
- a universal evidence-channel taxonomy;
- a universal model-confidence metric.

Those concerns belong to bindings, profiles, extensions, or established standards.

## 18. Validation rule

A candidate v0.2 object is acceptable only when both levels pass:

```text
JSON Schema structure
        +
RCP semantic cross-reference/invariant validation
```

JSON Schema is intentionally not forced to encode every graph/lifecycle rule.

The executable checks live under [`../conformance/v0_2/`](../conformance/v0_2/).

## 19. Open questions before normative freeze

- Should evidence details remain embedded or become independently resolvable in some profiles?
- Does `projection_basis_ref` need a standardized basis vocabulary or only namespaced profiles?
- Do assertion relations require inverse relations such as `superseded_by`?
- Is disjunctive-normal `support_sets` sufficient, or will real Providers require richer evidence expressions?
- Which policy dimensions, if any, must be normalized inline rather than externally referenced?
- Should opaque Provider assertions carry a Provider-attestation profile reference?
- Which base `assertion_type` values survive real Provider implementation?
- Can a PROV profile carry all generic dependency information without duplicating it in RCP serialization while preserving RCP support/lifecycle behavior?

No answer should be frozen merely for schema convenience.
