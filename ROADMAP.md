# RCP Roadmap

> RCP remains experimental. Completed milestones below mean the repository contains working design/reference/conformance evidence; they do not imply production certification, external platform adoption, or standards-body endorsement.

## Current transition

RCP v0.1 proved that a rights-aware relationship-context exchange can be made executable, including permission-before-retrieval, provenance, epistemic classes, revocation/recomputation, identity isolation, and encrypted delivery.

The next design phase deliberately **shrinks RCP Core**.

RCP v0.2 should focus on transport-independent relationship semantics and delegate generic infrastructure concerns to established standards/bindings wherever possible.

Active refactor: [Issue #23](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/23).

## M0 — Public foundation ✅

Completed:

- [x] public README and project charter;
- [x] architecture draft;
- [x] threat/rights model;
- [x] permission model;
- [x] data-object model;
- [x] provenance/derivation model;
- [x] initial schemas and registries;
- [x] public issue/RFC workspace.

## M1 — Experimental Normative Core v0.1 ✅ as an internal baseline

Implemented and CI-tested:

- [x] `IdentityClaim`;
- [x] `ProviderCapability`;
- [x] `PermissionRequest` / `PermissionDecision`;
- [x] `ContextAssertion`;
- [x] `SecureEnvelope`;
- [x] `RevocationEvent`;
- [x] MUST/SHOULD/MAY semantics;
- [x] registries/reason codes;
- [x] schema-positive and schema-negative fixtures;
- [x] permission-before-retrieval semantics;
- [x] derived-policy inheritance;
- [x] revocation propagation/recomputation semantics;
- [x] request → decision → envelope authorization binding;
- [x] multi-party context projection boundaries;
- [x] experimental JOSE profile;
- [x] Node ↔ Python bidirectional crypto interoperability.

**Interpretation:** v0.1 is preserved as experimental evidence, not the final RCP responsibility boundary.

External clean-room validation of the v0.1 Provider harness is no longer the immediate design priority while the semantic Core is being refactored.

## M2 — Reference Ecosystem v0.1 ✅

Completed executable scenarios:

- [x] five separately stateful mock Providers;
- [x] control-plane / relationship consumer reference service;
- [x] provider capability discovery;
- [x] provider-scoped identity resolution;
- [x] minimum-data ProcessingPlan;
- [x] provider-issued authorization decision;
- [x] protected-state lazy read only after authorization;
- [x] JOSE `SecureEnvelope` data path;
- [x] provenance-preserving `ContextAssertion` normalization;
- [x] persistent relationship context / materialized brief;
- [x] source revocation + downstream recomputation;
- [x] policy drift + stale authorization rejection;
- [x] raw-content boundary scenarios;
- [x] operator-blind payload relay;
- [x] one-command canonical demo.

The topology is now treated as a **non-normative experimental implementation**, not the required RCP architecture.

## M3 — External implementation tooling v0.1 ✅

Completed:

- [x] clean-room Implementer Guide;
- [x] normative-vs-reference boundary;
- [x] non-normative external Provider HTTP harness profile;
- [x] black-box Provider conformance harness;
- [x] machine-readable report;
- [x] CI self-test against a separate Provider process;
- [x] independent implementation report template;
- [x] security/privacy review checklist.

These assets remain useful, but they validate the v0.1 Provider profile rather than the emerging v0.2 semantic Core.

---

# Active v0.2 roadmap

## M4.1 — Semantic Core boundary refactor ← current

Goal: determine the smallest RCP-specific semantic contract that remains meaningful independent of transport/runtime.

### Completed in first refactor pass

- [x] create standards-boundary document;
- [x] draft transport-independent semantic Core v0.2;
- [x] reposition README/Charter/Architecture around semantic Core + bindings;
- [x] preserve v0.1 rather than silently rewriting its normative contract.

### Required before freezing v0.2 concepts

- [ ] reconcile each v0.1 responsibility against MCP/A2A/OAuth/AuthZEN/Shared Signals/PROV/ODRL/DPV/JOSE;
- [ ] decide which proposed v0.2 concepts are first-class wire objects versus embedded structures;
- [ ] define a minimal relationship-specific representation/capability vocabulary;
- [ ] define cross-provider evidence relation semantics;
- [ ] define temporal/current-state semantics;
- [ ] define disputed/contested context behavior;
- [ ] define relationship-scoped identity dependency semantics;
- [ ] define the minimum policy dimensions that Core must understand versus externally reference.

### Exit criterion

RCP Core can be explained without reference to MCP, HTTP, A2A, an RCP relay, or an RCP-owned authorization service, while still defining non-trivial relationship interoperability semantics.

## M4.2 — Relationship semantic conformance

Turn the v0.2 design into executable semantic cases before freezing schemas.

Required canonical scenarios:

### Multi-party projection

- [ ] `{A,B,C}` source interaction does not automatically become `{A,B}` relationship context;
- [ ] explicit narrower evidence basis succeeds where justified.

### Conflicting evidence

- [ ] two Providers can express contradictory current assertions;
- [ ] conflict does not silently collapse to one fact;
- [ ] explicit supersession can establish a new current state.

### Partial-source invalidation

- [ ] derived context is re-evaluated when one source changes;
- [ ] independent surviving support can preserve a current assertion with new/updated lineage;
- [ ] insufficient surviving evidence invalidates the assertion.

### Policy-preserving derivation

- [ ] lower-fidelity projection does not automatically loosen source restrictions;
- [ ] unsupported material policy fails closed;
- [ ] any declassification/re-derivation rule is explicit and profile-defined.

### Cross-provider composition

- [ ] Provider-specific views remain distinguishable;
- [ ] combined state preserves disagreement/provenance/restrictions;
- [ ] support/corroboration/supersession relations are deterministic where declared.

### Epistemic preservation

- [ ] source statements/inferences do not become verified facts through transport or aggregation;
- [ ] strategy is never presented as a fact about a counterparty.

### Exit criterion

The semantic scenarios can be evaluated without depending on one specific transport implementation.

## M4.3 — v0.2 wire model and schemas

Only after semantic scenarios stabilize:

- [ ] freeze candidate semantic structures;
- [ ] define v0.2 versioning/extension rules;
- [ ] add JSON Schemas or equivalent machine-readable definitions;
- [ ] migrate relevant v0.1 fixtures;
- [ ] explicitly deprecate or move generic v0.1 objects to profiles/bindings where decided;
- [ ] keep compatibility/migration examples.

Candidate semantic concepts under review:

- `ActorReference`;
- `RelationshipScope`;
- `InteractionEvidence`;
- `ContextAssertion`;
- `EpistemicClass`;
- `DerivationDependency`;
- `ContextLifecycle`;
- `PolicyReference`.

## M4.4 — Binding independence proof

Goal: demonstrate that RCP semantics are not merely one MCP/HTTP API convention.

Required:

- [ ] define minimal RCP-over-MCP binding;
- [ ] define minimal RCP-over-HTTP binding or another independent transport;
- [ ] send equivalent semantic objects through both;
- [ ] evaluate both through the same semantic engine;
- [ ] prove equivalent relationship state/lifecycle outcome;
- [ ] ensure binding-specific metadata does not redefine semantic meaning.

### Exit criterion

At least two materially different bindings produce equivalent semantic outcomes for the canonical scenarios.

If this cannot be demonstrated, reassess whether RCP should become a domain extension/profile rather than an independent semantic protocol.

## M4.5 — External clean-room semantic implementation

Resume independent implementation only after the v0.2 semantic surface is sufficiently stable.

- [ ] recruit at least one unrelated implementer;
- [ ] implement the semantic engine from `/spec` without importing reference semantic code;
- [ ] run semantic conformance scenarios;
- [ ] test at least one binding;
- [ ] publish ambiguity/failure report;
- [ ] classify findings as spec ambiguity, binding assumption, implementation defect, standards overlap, or security/privacy concern.

Issue #19 remains useful as historical/external-validation infrastructure, but the target should be updated to the v0.2 semantic model before claiming independent RCP interoperability.

## M5 — Independent security/privacy review

Focus areas after v0.2 semantics stabilize:

- [ ] participant-scope leakage and multi-party projection;
- [ ] cross-tenant identity correlation;
- [ ] epistemic laundering;
- [ ] provenance/evidence dependency leakage;
- [ ] derived-data laundering;
- [ ] invalidation/recomputation failures;
- [ ] policy inheritance/declassification mistakes;
- [ ] metadata leakage through bindings;
- [ ] binding-specific auth/security assumptions;
- [ ] provider-side AI derivation risks.

Cryptographic/key-discovery review applies to specific security profiles, not to semantic Core as a whole.

## M6 — Standards mappings and production bindings

After the semantic Core is validated:

- [ ] AuthZEN-compatible relationship authorization profile;
- [ ] Shared-Signals-compatible invalidation/change profile;
- [ ] W3C PROV mapping;
- [ ] ODRL/DPV policy mapping where useful;
- [ ] production-oriented JOSE/COSE security profile if needed;
- [ ] MCP binding;
- [ ] HTTP/A2A or provider-native binding;
- [ ] discovery/version-negotiation guidance per binding.

## M7 — First real provider implementation

Choose a real system only after the semantic Core and at least one binding are coherent.

The implementation must test whether the Provider can:

- keep raw/private evidence local;
- expose a lower-fidelity RCP relationship projection;
- preserve participant scope;
- emit explicit epistemic classes;
- identify material evidence dependencies;
- enforce/refer to policy constraints;
- process source invalidation/recomputation;
- interoperate with a generic Consumer without provider-specific relationship semantics.

No bridge should rely on bypassing closed-platform access controls.

## M8 — Broader interoperability/governance work

Only after independent semantic interoperability exists:

- publish interoperability results;
- expand RFC/change-control process;
- define stable versioning/deprecation rules;
- invite standards/security/privacy review;
- evaluate neutral stewardship if justified.

## Long-term success criterion

RCP succeeds when independent systems can implement the same relationship-context semantics and preserve the same participant, epistemic, evidence, restriction, and lifecycle boundaries **without depending on the original project's infrastructure or one particular agent transport**.
