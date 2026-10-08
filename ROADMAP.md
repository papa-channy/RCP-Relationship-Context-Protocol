# RCP Roadmap

> RCP remains experimental. Completed milestones mean the repository contains working design/reference/conformance evidence; they do **not** imply production certification, external adoption, independent security review, or standards-body endorsement.

## Current position

RCP has moved through two distinct generations:

```text
v0.1
broad executable interoperability experiment
        ↓
v0.2 draft
smaller transport-independent relationship semantic core
```

v0.1 is preserved as reproducible evidence. v0.2 is the active design direction.

The current v0.2 candidate has:

- executable semantic invariants;
- a minimal draft `ContextAssertion` wire model;
- structural + relationship semantic conformance;
- a real official-MCP Resource binding;
- a real plain-HTTP binding;
- identical semantic normalization across those bindings;
- a concrete standards-reconciliation pass that removed duplicated/generic Core responsibilities.

The next major evidence boundary is **unrelated implementation**, not more internal mock-provider features.

---

## M0 — Public foundation ✅

Completed:

- [x] public README and Charter;
- [x] architecture/threat/rights/permission/data/provenance drafts;
- [x] initial schemas/registries;
- [x] public issue/RFC workspace.

## M1 — Experimental Core v0.1 ✅ as an internal baseline

Implemented and CI-tested:

- [x] seven v0.1 wire objects;
- [x] schema positive/negative fixtures;
- [x] permission-before-retrieval;
- [x] policy inheritance;
- [x] revocation/recomputation;
- [x] request/decision/envelope binding;
- [x] identity/privacy/group boundaries;
- [x] experimental JOSE profile;
- [x] Node ↔ Python crypto interoperability.

Interpretation: v0.1 is preserved evidence, not the final RCP responsibility boundary.

## M2 — v0.1 Reference Ecosystem ✅

Completed:

- [x] five independently stateful mock Providers;
- [x] Provider-scoped identity resolution;
- [x] minimum-data planning;
- [x] permission-before-protected-read;
- [x] SecureEnvelope path;
- [x] relationship context store/brief;
- [x] revocation/recomputation;
- [x] policy drift/stale decision rejection;
- [x] raw-content boundary;
- [x] operator-blind relay;
- [x] one-command canonical demo.

The topology is non-normative reference software.

## M3 — v0.1 External-validation tooling ✅

Completed:

- [x] clean-room implementer guide;
- [x] external Provider HTTP harness;
- [x] machine-readable report;
- [x] independent implementation report template;
- [x] security/privacy review checklist;
- [x] CI black-box self-test.

These assets validate v0.1 rather than the active v0.2 semantic model.

---

# v0.2 scope-correction and proof sequence

## M4.1 — Semantic Core boundary refactor ✅

Completed through PR #24 / Issue #23 work:

- [x] reposition RCP as a transport-independent relationship information/lifecycle protocol;
- [x] remove mandatory central-RCP-infrastructure assumptions from architecture;
- [x] separate semantic Core from bindings/profiles;
- [x] create standards-boundary guidance;
- [x] draft semantic Core v0.2;
- [x] define canonical semantic scenarios;
- [x] preserve v0.1 instead of silently rewriting it.

Exit criterion achieved: Core relationship semantics can be explained independently of MCP, HTTP, A2A, relay topology, or an RCP-owned authorization service.

## M4.2 — Relationship semantic conformance ✅

Completed through PR #26:

- [x] multi-party projection positive/negative cases;
- [x] conflict vs supersession;
- [x] partial-source invalidation;
- [x] independently sufficient evidence support paths;
- [x] policy-preserving derivation;
- [x] epistemic preservation;
- [x] child/source access separation;
- [x] identity dependency changes;
- [x] cross-provider composition;
- [x] arrival-order neutrality;
- [x] abstract binding equivalence.

Result: the proposed semantic rules can be evaluated without one transport implementation.

## M4.3 — Minimal draft wire model ✅

Completed through PR #28:

- [x] one top-level candidate semantic object: `ContextAssertion`;
- [x] embedded Actor/RelationshipScope/Evidence/Derivation/Lifecycle structures;
- [x] `0.2-draft` version isolation;
- [x] JSON Schema;
- [x] cross-reference semantic validator;
- [x] evidence `support_sets`;
- [x] projection-basis validation;
- [x] required-extension fail-closed behavior;
- [x] synthetic MCP/HTTP framing equivalence.

Embedded structures remain embedded unless real implementation evidence proves independent addressability is required.

## M4.4 — Real binding-independence proof ✅

Completed through PR #30:

- [x] official MCP TypeScript SDK v2 Resource server;
- [x] official MCP Client `readResource` path;
- [x] plain Node HTTP server/client path;
- [x] shared Provider-owned assertion fixture;
- [x] same JSON Schema + semantic validator for both paths;
- [x] identical canonical semantic output after binding framing is stripped;
- [x] transport-only metadata excluded from semantic state.

Result: internal executable evidence shows the tested RCP semantic object is not merely MCP-specific syntax.

This is not external interoperability or production binding certification.

## M4.5 — Concrete standards reconciliation ✅ after merge of Issue #31 work

Scope:

- [x] field-level comparison with MCP, AuthZEN, Shared Signals/CAEP, PROV, ODRL/DPV, ActivityStreams, Solid SAI, AT Protocol Lexicon, and Eclipse Dataspace Protocol;
- [x] explicit KEEP / PROFILE-MAP / BINDING-ONLY / REMOVE decisions;
- [x] remove top-level generic `confidence` from Core;
- [x] remove epistemic duplicates from `assertion_type`;
- [x] shrink evidence channel taxonomy to abstract categories + namespaced extensions;
- [x] make participant-projection checks channel-independent;
- [x] remove generic transformation classification from base derivation structure;
- [x] document PROV/AuthZEN/SSF/ODRL-DPV mapping boundaries.

Resulting originality boundary:

> RCP is a candidate transport-independent semantic/lifecycle contract for Provider-derived relationship context, preserving target/source participant scope, epistemic meaning, evidentiary sufficiency, material identity/policy dependencies, restriction inheritance, and downstream state transitions.

---

# Next evidence milestones

## M4.6 — Unrelated clean-room v0.2 implementation ← next external milestone

Do not count another author-written implementation as independent evidence.

Required:

- [ ] publish a bounded v0.2 clean-room implementer surface;
- [ ] make the current semantic/wire suite consumable without reference code;
- [ ] update external implementation report template for v0.2;
- [ ] have at least one unrelated person/team implement the semantic target from `/spec` and conformance docs;
- [ ] test at least one binding;
- [ ] classify every failure as implementation defect, spec ambiguity, standards overlap, binding assumption, profile gap, or security/privacy concern;
- [ ] resolve material ambiguities discovered by the clean-room implementation.

A successful unrelated implementation would support only the claim that **at least one independent implementation interoperated for the tested v0.2 surface**.

## M5 — Independent security/privacy review

Focus:

- [ ] participant-scope leakage;
- [ ] cross-tenant identity correlation;
- [ ] epistemic laundering;
- [ ] evidence/provenance leakage;
- [ ] derived-data laundering;
- [ ] support-set/invalidation errors;
- [ ] restriction inheritance/declassification mistakes;
- [ ] metadata leakage through bindings;
- [ ] malicious Provider/Consumer behavior;
- [ ] Provider-side AI derivation risk.

Cryptographic review applies to specific security profiles, not the semantic Core as a whole.

## M6 — Executable standards profiles and production binding hardening

Build only profiles demonstrated to be required by implementation:

- [ ] RCP ↔ W3C PROV lineage mapping;
- [ ] RCP ↔ AuthZEN authorization profile;
- [ ] RCP ↔ Shared Signals event/profile mapping;
- [ ] ODRL/DPV policy-reference examples/profile where useful;
- [ ] production-oriented security profile using JOSE/COSE if required;
- [ ] binding discovery/version-negotiation guidance;
- [ ] subscriptions/change-delivery semantics per binding without moving them into Core.

## M7 — First real non-RCP Provider implementation

Choose a real system only after the semantic target survives unrelated implementation/review.

The pilot should test whether a Provider can:

- keep private/raw evidence local;
- emit a lower-fidelity RCP relationship projection;
- preserve source/target participant scope;
- emit explicit epistemic classes;
- expose material evidence/identity/policy dependencies;
- react to dependency changes;
- interoperate with a generic Consumer without Provider-specific relationship semantics.

No bridge should bypass closed-platform access controls.

## M8 — Broader interoperability/governance

Only after independent interoperability exists:

- publish interoperability results;
- expand RFC/change-control/versioning/deprecation processes;
- invite standards/security/privacy critique;
- evaluate neutral stewardship if actual multi-organization participation justifies it.

## Long-term success criterion

RCP succeeds when independent systems preserve the same participant, epistemic, evidence-sufficiency, restriction, and lifecycle semantics **without depending on the original project's infrastructure or one specific agent transport**.
