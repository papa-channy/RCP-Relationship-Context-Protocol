# RCP v0.2 Draft Wire Model

> **Status: non-normative candidate representation**
>
> This document does not replace RCP Core v0.1. It is an executable design artifact for the v0.2 semantic-core direction and may change before any normative v0.2 release.

## 1. Design objective

The v0.2 wire model should encode the smallest transport-independent relationship-context contract required by the M4.2 semantic scenarios.

The current candidate deliberately starts with **one top-level semantic object**:

```text
ContextAssertion
```

The following concepts are embedded semantic structures rather than independent protocol services or mandatory top-level resources:

```text
ActorReference
RelationshipScope
EvidenceReference
DerivationDependency
AssertionRelation
ContextLifecycle
PolicyReference(s)
```

This is intentionally smaller than the v0.1 seven-object Core. Generic capability discovery, authorization requests/decisions, revocation-signal delivery, encryption envelopes, and transport framing remain outside this draft semantic wire model.

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

The draft schema is:

[`schemas/v0.2-draft/context-assertion.schema.json`](./schemas/v0.2-draft/context-assertion.schema.json)

## 3. Relationship scope

`relationship_scope` describes the relationship context to which the assertion applies.

It does **not** claim to solve global identity.

Actor identifiers are explicitly scoped:

```json
{
  "actor_id": "B",
  "scope": "tenant:t1",
  "actor_type": "person"
}
```

String equality outside the declared scope is not global identity equality.

The relationship scope contains:

- target participants;
- a scope type such as `bilateral` or `group`;
- a trust/tenant domain;
- optional identity-binding dependencies.

Identity bindings that materially affect interpretation belong in semantic lineage rather than invisible preprocessing.

## 4. Evidence references and participant projection

Evidence remains Provider-controlled. RCP does not require raw evidence export.

An `EvidenceReference` can describe:

- an opaque reference;
- type-only information;
- metadata;
- a bounded source statement;
- a provider-generated projection.

It includes `source_participants` separately from the assertion's target `relationship_scope.participants`.

This distinction is required for the no-silent-participant-collapse invariant.

Example:

```text
source interaction = {A, B, C}
target relationship = {A, B}
```

For direct interaction evidence, changing participant scope requires an explicit semantic basis. The draft field is:

```json
{"projection_basis_ref": "basis:explicit-a-b-commitment"}
```

The field identifies the basis; this draft does not define a universal proof format for that basis.

## 5. Epistemic meaning

The draft retains the semantic classes proven useful in v0.1/M4.2:

- `source_statement`
- `verified_fact`
- `extracted_fact`
- `user_observation`
- `system_interpretation`
- `system_inference`
- `strategy`
- `unknown`

`verified_fact` requires at least one explicit `verification_basis_ref` structurally, and conformance additionally checks that the reference resolves to declared evidence/dependency lineage.

Confidence is not verification.

## 6. Provenance modes

The candidate model supports four provenance modes:

- `evidence` — the assertion directly references evidence;
- `derived` — the assertion is produced from explicit dependencies;
- `opaque` — a Provider exposes the assertion while withholding detailed lineage;
- `unavailable` — lineage cannot be supplied.

Opaque provenance does not automatically imply untrusted or unusable context. Authorization/policy profiles may permit Provider-generated projections without granting source access.

## 7. Derivation and support paths

A flat `derived_from` edge is insufficient for lifecycle behavior.

The draft therefore represents both:

1. dependency records; and
2. independently sufficient support sets.

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

This means A and B are independently sufficient support paths.

By contrast:

```json
{"support_sets": [["evidence:A", "evidence:B"]]}
```

means both are jointly required.

This distinction lets a Consumer determine whether source removal requires recomputation with surviving evidence or removes all currently sufficient support.

## 8. Policy dependencies

RCP v0.2 does not define a universal policy language.

The draft carries:

- `policy_refs` on the resulting assertion;
- optional `policy_refs` on evidence references;
- material `policy` dependencies in derivation lineage.

Conformance requires material policy dependencies to remain referenced on the derived assertion unless a future explicit declassification/re-derivation profile defines a valid loosening operation.

The policy documents themselves may be expressed using ODRL, DPV, AuthZEN-related context, Provider-native policy, or another compatible system.

## 9. Assertion relations

Cross-provider composition needs explicit semantic relations that transport ordering cannot substitute for.

The draft includes:

- `supports`
- `corroborates`
- `conflicts_with`
- `supersedes`
- `refines`

An assertion cannot meaningfully declare one of these relations to itself.

A later arrival does not automatically become `supersedes`.

## 10. Lifecycle

The draft lifecycle states are:

- `active`
- `superseded`
- `disputed`
- `expired`
- `invalidated`
- `revoked`
- `historical`

`recompute` and `re-evaluate` are processing operations, not public lifecycle states. A dependency change triggers evaluation whose result may be a new active lineage, restriction, dispute, invalidation, supersession, or archival transition.

Historical lineage must not be rewritten to imply a removed source was never used.

## 11. Required extensions

Namespaced extensions use:

```text
x-<namespace>:<name>
```

A semantic extension that is required to safely interpret an assertion appears in `required_extensions`.

A Consumer that does not support a required extension must fail closed rather than ignore it.

Optional extension data may remain ignorable when it is not listed as required and does not alter Core meaning.

## 12. Binding independence

This wire object is designed to be carried through different bindings.

For example:

```text
MCP response
  └ structuredContent
       └ ContextAssertion
```

or:

```text
HTTP response body
  └ ContextAssertion
```

Binding-specific framing is removed before the RCP semantic engine evaluates the object.

The conformance suite checks that equivalent MCP-like and HTTP-like wrappers normalize to equivalent relationship semantic state.

This does not yet constitute production MCP/HTTP interoperability. It proves only that the candidate wire object does not require hidden transport state for the tested semantics.

## 13. Why embedded structures first

The draft does not currently define separate top-level wire schemas for `RelationshipScope`, `EvidenceReference`, or `DerivationDependency`.

This is deliberate.

A concept should become an independently addressable RCP wire object only if implementations need to:

- exchange it independently of an assertion;
- version it independently;
- reference it across many assertions in a way that cannot be represented safely by scoped refs;
- apply independent lifecycle or authorization semantics to it.

Until one of those requirements is demonstrated, embedded structures keep the Core smaller.

## 14. What this model does not define

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
- a universal provenance or policy ontology.

Those concerns belong to bindings, profiles, or established standards.

## 15. Validation rule

A candidate v0.2 wire object is acceptable only when both levels pass:

```text
JSON Schema structure
        +
RCP semantic cross-reference/invariant validation
```

JSON Schema is intentionally not forced to encode every graph or lifecycle rule.

The executable draft checks live under:

[`../conformance/v0_2/`](../conformance/v0_2/)

## 16. Open questions before normative freeze

- Should evidence details remain embedded or become independently resolvable objects in some profiles?
- Does `projection_basis_ref` need a small standardized basis vocabulary?
- Do `assertion_relations` require inverse relations such as `superseded_by`, or is forward lineage sufficient?
- Should `support_sets` become a general boolean evidence-expression model, or is disjunctive-normal support sufficient?
- Which policy constraints, if any, must be normalized inline rather than referenced?
- Should opaque Provider assertions be required to carry a Provider attestation/profile reference?
- Which `assertion_type` values truly belong in Core rather than an extension registry?
- Can W3C PROV map cleanly onto the dependency/support-path structure without losing RCP lifecycle meaning?

No answer should be frozen merely for schema convenience.
