# RCP v0.2 Field-Level Standards Mapping

> **Status:** non-normative design analysis for the v0.2 draft.
>
> This document explains why each current v0.2 semantic field remains in RCP, is mapped to another standard, is binding-only, or is removed. It is not a claim that the compared standards are deficient; the goal is to avoid duplicating work they already do well.

## Verdict legend

- **KEEP** — relationship-specific semantic meaning still needs an RCP contract across transports.
- **PROFILE-MAP** — RCP keeps only the relationship-specific consequence/interpretation and should map generic syntax or enforcement to an established standard.
- **BINDING-ONLY** — belongs to an MCP/HTTP/A2A/provider binding rather than semantic Core.
- **REMOVE** — no defensible RCP Core meaning remains or the field duplicates another RCP field.

## Compared standards and systems

Primary references used in this reconciliation:

- Model Context Protocol Resources: <https://modelcontextprotocol.io/specification/2026-07-28/server/resources>
- OpenID AuthZEN Authorization API 1.0 Final: <https://openid.net/specs/authorization-api-1_0.html>
- OpenID Shared Signals Framework 1.0 Final: <https://openid.net/specs/openid-sharedsignals-framework-1_0-final.html>
- OpenID CAEP 1.0 Final: <https://openid.net/specs/openid-caep-1_0-final.html>
- W3C PROV-O: <https://www.w3.org/TR/prov-o/>
- W3C ODRL Information Model 2.2: <https://www.w3.org/TR/odrl-model/>
- W3C Data Privacy Vocabulary (DPV): <https://www.w3.org/community/reports/dpvcg/CG-FINAL-dpv-20240801/>
- ActivityStreams 2.0 Vocabulary: <https://www.w3.org/TR/activitystreams-vocabulary/>
- Solid Application Interoperability: <https://solidproject.org/TR/sai>
- AT Protocol Lexicon: <https://atproto.com/specs/lexicon>
- Eclipse Dataspace Protocol 2025-1: <https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/>

## High-level result

The reconciliation does **not** justify a new generic authorization, signal-delivery, provenance, policy, schema, or transport protocol.

It does justify a smaller domain contract around five relationship-specific questions:

1. **Which relationship/participant set does this assertion actually concern?**
2. **What epistemic claim is being made?**
3. **Which evidence combinations are materially sufficient for a derived relationship assertion?**
4. **Which restrictions/dependencies survive derivation and source changes?**
5. **What lifecycle consequence follows when relationship evidence, identity, policy, or competing assertions change?**

## Top-level `ContextAssertion`

| Field / concept | Verdict | Existing-standard overlap | RCP-specific remainder |
| --- | --- | --- | --- |
| `type` | KEEP | Generic discriminators exist everywhere | Stable identification of the RCP semantic object |
| `rcp_version` | KEEP | Generic versioning patterns exist | Prevents semantic-version ambiguity between RCP generations |
| `assertion_id` | KEEP | Generic IDs | Stable local reference for dependency/conflict/supersession semantics |
| `assertion_type` | KEEP, narrow | ActivityStreams/Lexicon can type domain objects | Only bounded relationship-context families remain Core; channel and epistemic categories are not duplicated here |
| `relationship_scope` | **KEEP** | ActivityStreams `Relationship` models subject/relationship/object; Solid registers social agents | RCP needs target participant-set scope, trust-domain isolation, and identity dependencies for derived context, not merely a social edge |
| `epistemic_class` | **KEEP** | PROV records lineage but does not classify claim truth-status this way | Shared distinction between source statement, extracted fact, observation, interpretation, inference, verified fact, and strategy |
| `statement` | KEEP | Generic payload/content | Bounded human/machine-readable assertion content tied to the semantic metadata |
| `confidence` | **REMOVE** | Model-specific scoring, no interoperable semantics | Confidence is not verification and should not become Core merely because AI systems emit numbers |
| `verification_basis_refs` | KEEP / PROV-map | PROV can represent derivation/attribution | RCP requires verified-fact claims to point to declared verification lineage rather than model confidence |
| `provenance` | PROFILE-MAP | PROV-O defines Entity/Activity/Agent and derivation relations | RCP retains relationship-specific dependency sufficiency, participant projection, visibility/access separation, and lifecycle consequences |
| `assertion_relations` | KEEP, narrow | PROV has derivation relations; ActivityStreams has relationship objects | `conflicts_with`, `supersedes`, `corroborates` affect current relationship state and cannot be inferred from arrival order |
| `policy_refs` | PROFILE-MAP | ODRL/DPV/provider policy can express policy vocabulary | RCP only requires that material restrictions remain attached/inherited and fail closed if unevaluable |
| `lifecycle` | **KEEP** | Generic state machines exist | States describe validity/currentness of relationship assertions after evidence/conflict/invalidation changes |
| `required_extensions` | KEEP | Similar critical-extension patterns exist in other protocols | Unknown material RCP semantics must fail closed |
| `extensions` | KEEP | Lexicon/JSON extensibility patterns | Namespaced escape hatch without expanding Core taxonomy |
| `created_at` | KEEP | Generic timestamp | Assertion-history ordering metadata; does not itself imply supersession |

## `ActorReference`

| Field | Verdict | Rationale |
| --- | --- | --- |
| `actor_id` | KEEP | The value is intentionally scoped; RCP does not define a global person ID |
| `scope` | **KEEP** | Prevents provider-local/tenant-local identifiers from being silently merged |
| `actor_type` | KEEP, extensible | Minimal interpretation aid; not a global identity ontology |

AuthZEN also uses typed/scoped subject and resource identifiers. That is useful for authorization mappings, but an RCP actor is a participant in relationship semantics, not necessarily the authorization requester. RCP must not replace AuthZEN's Subject/Resource model with its own authorization API.

## `RelationshipScope`

| Field | Verdict | Rationale |
| --- | --- | --- |
| `relationship_ref` | KEEP optional | Local stable handle; not a federated global relationship ID |
| `scope_type` | KEEP, minimal | Needed to distinguish bilateral/group/organization-mediated interpretation; avoid social-closeness taxonomy |
| `participants` | **KEEP** | Core multi-party semantic boundary |
| `trust_domain` | **KEEP** | Identity and context correlation boundary |
| `identity_dependency_refs` | **KEEP** | Identity bindings can materially alter which relationship history an assertion belongs to |

ActivityStreams can represent a typed relationship edge between a subject and object. That does not replace RCP's need to model multi-party evidence being projected into a possibly different target participant set, nor the dependency of historical context on scoped identity bindings.

## `EvidenceReference`

| Field | Verdict | Rationale |
| --- | --- | --- |
| `evidence_ref` | KEEP | Addressable lineage reference |
| `evidence_type` | KEEP only as generic/extensible source category | **Do not** standardize Slack/message/call/meeting taxonomies in Core; provider/channel-specific types use namespaced extensions |
| `provider_ref` | KEEP optional | Preserves provider separation during composition |
| `representation` | KEEP | Fidelity class matters for what was actually exported without implying source access |
| `source_participants` | **KEEP** | Required to test no-silent-participant-collapse |
| `projection_basis_ref` | **KEEP** | Records explicit basis when evidence participant scope differs from target relationship scope |
| `occurred_at` | KEEP optional | Evidence time can matter to state evaluation, but does not itself create supersession |
| `policy_refs` | PROFILE-MAP | Policy syntax belongs to ODRL/DPV/provider policy; RCP preserves attachment/inheritance |

Solid SAI and Eclipse Dataspace Protocol cover controlled data access/sharing and grant/agreement mechanics. RCP should reuse those ideas where applicable, but its evidence reference is about semantic lineage and scope of a relationship assertion, not a replacement data-sharing framework.

## `Derivation`

| Field | Verdict | Existing-standard overlap | RCP-specific remainder |
| --- | --- | --- | --- |
| `transformation` | PROFILE-MAP / extension | PROV Activity can describe generation/derivation | RCP only needs an interpretable transformation reference when it affects downstream semantics |
| `dependencies` | PROFILE-MAP to PROV where useful | PROV can express derivation/dependency lineage | RCP classifies material dependency types that trigger relationship re-evaluation |
| `support_sets` | **KEEP** | No compared generic provenance standard defines the RCP rule “these alternative evidence sets are each independently sufficient for this relationship assertion” | Needed to decide whether partial source invalidation preserves or invalidates derived context |

`support_sets` are intentionally not a competing universal provenance language. They encode only the evidence-sufficiency information that materially affects RCP lifecycle behavior.

## `Dependency`

| Field | Verdict | Rationale |
| --- | --- | --- |
| `dependency_ref` | KEEP | Links to material lineage |
| `dependency_type` | KEEP, narrow | Distinguishes evidence/assertion/identity/policy consequences; generic provenance mapping can still be provided |
| `role` | KEEP, narrow | `supports`, `corroborates`, `derived_from`, `refines` affect composition semantics |
| `material` | **KEEP** | Drives fail-closed re-evaluation; non-material metadata should not invalidate relationship state |

## `AssertionRelation`

| Relation | Verdict | Rationale |
| --- | --- | --- |
| `supports` | KEEP | Relationship-state evidence relation |
| `corroborates` | KEEP | Independent confirming evidence must remain distinguishable from same-source duplication |
| `conflicts_with` | **KEEP** | Generic transport/provenance does not decide current contradictory relationship claims |
| `supersedes` | **KEEP** | Explicit semantic replacement; later arrival alone is insufficient |
| `refines` | KEEP | Allows a more precise assertion without pretending the earlier one was false |

## `Lifecycle`

| Field | Verdict | Rationale |
| --- | --- | --- |
| `state` | **KEEP** | Describes semantic validity/currentness of an assertion, not task or transport status |
| `valid_from` / `valid_until` | KEEP | Temporal applicability of the assertion |
| `reason_refs` | KEEP / profile-map | Reasons may point to provider, policy, signal, or profile-specific objects |

Shared Signals/CAEP can carry change/security signals between cooperating systems. RCP should not recreate that delivery framework. RCP owns the **descendant consequence rule** after a relevant source/policy/identity/grant signal is received: identify affected assertions, re-evaluate support/policy, then retain/restrict/dispute/invalidate/recompute while preserving history.

## Generic responsibilities explicitly excluded

| Concern | Verdict | Preferred owner |
| --- | --- | --- |
| Resource/tool invocation | BINDING-ONLY | MCP or application protocol |
| HTTP endpoint shape | BINDING-ONLY | HTTP binding |
| Agent task lifecycle | BINDING-ONLY | A2A or equivalent |
| Authentication/delegation | BINDING-ONLY / PROFILE-MAP | OAuth/OIDC/platform auth |
| Authorization request/decision | **REMOVE from Core** | AuthZEN-compatible PDP/PEP API |
| Revocation/change signal transport | **REMOVE from Core** | Shared Signals/CAEP or provider event system |
| Universal provenance ontology | **REMOVE from Core** | W3C PROV |
| Universal policy language | **REMOVE from Core** | ODRL/DPV/provider-native policy |
| Encryption/signature primitives | **REMOVE from Core** | JOSE/COSE and security profiles |
| Generic schema/RPC language | **REMOVE from Core** | JSON Schema, AT Protocol Lexicon where appropriate, OpenAPI/etc. |
| Dataspace negotiation/agreement framework | **REMOVE from Core** | Eclipse Dataspace Protocol or equivalent |
| Social graph relationship vocabulary | **REMOVE from Core** | ActivityStreams/domain vocabularies |
| Global person identity | **REMOVE from Core** | identity providers / domain systems |

## Concrete schema reductions from this pass

This reconciliation removes or narrows the following v0.2 draft surface:

1. **remove top-level `confidence`** — no shared semantic meaning; it encouraged accidental equivalence between model score and verification;
2. **remove epistemic duplicates from `assertion_type`** — `observation`, `interpretation`, `inference`, and `strategy` belong in `epistemic_class`, while `assertion_type` describes what the assertion is about;
3. **remove channel-specific Core evidence types** — `message`, `thread`, `call`, `meeting`, `calendar_event`, `crm_interaction`, and `social_interaction` are provider/domain details; Core keeps generic evidence classes plus namespaced extensions;
4. **apply participant projection rules to evidence semantics regardless of channel label** — safety cannot depend on recognizing a fixed list of communication products.

## Current defensible RCP Core

After subtraction, the strongest independently useful RCP surface is:

```text
ContextAssertion
 ├─ RelationshipScope
 │   ├─ scoped participants
 │   ├─ trust domain
 │   └─ identity dependencies
 ├─ EpistemicClass
 ├─ EvidenceReference
 │   ├─ source participants
 │   ├─ exposed representation
 │   └─ projection basis
 ├─ Derivation
 │   ├─ material dependencies
 │   └─ independent support sets
 ├─ AssertionRelation
 │   └─ support / conflict / supersession / refinement
 ├─ PolicyReference(s)
 │   └─ external vocabulary, RCP inheritance consequences
 └─ Lifecycle
     └─ validity/currentness after dependency changes
```

This is the boundary that should now be challenged by an unrelated implementation and adversarial security/privacy review. If those reviewers can express all tested semantics using existing standards alone without an RCP-specific contract, RCP should shrink again.