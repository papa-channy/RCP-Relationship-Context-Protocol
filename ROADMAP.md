# RCP Roadmap

> RCP remains experimental. Completed milestones below mean the repository contains working reference/conformance evidence for that milestone; they do not imply production certification, external platform adoption, or standards-body endorsement.

## M0 — Public foundation ✅

Completed:

- [x] Public README and project charter
- [x] Architecture draft
- [x] Threat/rights model
- [x] Permission model
- [x] Data-object model
- [x] Provenance/derivation model
- [x] Initial schemas and registries
- [x] Public issue/RFC workspace

Outcome: the project has a public problem statement, principles, protocol vocabulary, and open repository structure.

## M1 — Experimental Normative Core v0.1 🟡

Implemented internally:

- [x] `IdentityClaim`
- [x] `ProviderCapability`
- [x] `PermissionRequest` / `PermissionDecision`
- [x] `ContextAssertion`
- [x] `SecureEnvelope`
- [x] `RevocationEvent`
- [x] MUST/SHOULD/MAY semantics
- [x] canonical registries/reason codes
- [x] schema-positive and schema-negative fixtures
- [x] capability negotiation semantics
- [x] permission-before-retrieval semantics
- [x] derived-policy inheritance
- [x] revocation propagation/recomputation semantics
- [x] request → decision → envelope authorization binding
- [x] experimental JOSE profile
- [x] Node ↔ Python bidirectional crypto interoperability

Still required before treating M1 as strong external evidence:

- [ ] unrelated clean-room implementation result
- [ ] independent security/privacy review, especially JOSE/key-discovery assumptions

M1 intentionally remains open until those external validation signals exist.

## M2 — Reference Ecosystem v0.1 ✅

Completed executable scenarios:

- [x] five separately stateful mock Providers (Mail, Messenger, Enterprise, Phone, Meeting)
- [x] control-plane / relationship consumer
- [x] provider capability discovery
- [x] provider-scoped identity resolution
- [x] minimum-data ProcessingPlan
- [x] provider-issued PermissionDecision
- [x] protected state lazy-read only after authorization
- [x] JOSE `SecureEnvelope` on provider→consumer data path
- [x] provenance-preserving `ContextAssertion` normalization
- [x] persistent relationship context / materialized brief
- [x] source revocation + downstream recomputation
- [x] enterprise policy drift + stale authorization rejection
- [x] raw-content boundary scenarios
- [x] operator-blind payload relay
- [x] one-command canonical demo + machine-readable trace + human-readable brief

Canonical entry point:

```bash
cd reference-ecosystem
npm install
npm run demo
```

## M3 — External implementation & review readiness ✅

Completed:

- [x] clean-room Implementer Guide
- [x] explicit normative-vs-reference boundary
- [x] non-normative external Provider HTTP harness profile
- [x] black-box Provider conformance harness
- [x] machine-readable external conformance report
- [x] CI self-test with Provider in a separate process
- [x] CI guard preventing harness dependency on `reference-ecosystem`
- [x] independent implementation report template
- [x] security/privacy review checklist

Outcome: a third-party implementer can work from `/spec` + the Implementer Guide and test a separately running Provider without importing the reference implementation.

## M4 — First independent validation ← next

Goal: obtain evidence from an implementation not written as part of the RCP reference implementation.

Required work:

- [ ] recruit at least one external implementer/reviewer
- [ ] implement a Provider or Consumer from the specification without using reference code as a library
- [ ] run the black-box harness
- [ ] submit an Independent Implementation Report
- [ ] classify each failure as spec ambiguity, harness assumption, or implementation defect
- [ ] update the Core only where independent evidence reveals an underspecified contract

Exit criterion: at least one unrelated clean-room implementation interoperates with the applicable RCP Core/profile cases and publishes reproducible evidence.

## M5 — Independent security/privacy review

Focus areas:

- [ ] JOSE profile / canonicalization / algorithm confusion
- [ ] key discovery, authenticity, rotation, compromise, and revocation
- [ ] authorization binding and stale decisions
- [ ] identity isolation / cross-tenant correlation
- [ ] provenance and derived-data laundering
- [ ] revocation lifecycle and retained copies
- [ ] operator-blind relay metadata leakage
- [ ] organization-managed data boundaries
- [ ] logs, telemetry, backups, and support tooling

Exit criterion: findings are published or tracked, critical/high issues are resolved or explicitly deferred with rationale, and protocol-vs-implementation findings are separated.

## M6 — Production-oriented trust profiles

Only after independent implementation/security feedback:

- [ ] normative or interoperable key-discovery profile
- [ ] key rotation/revocation events
- [ ] stronger replay/nonce guidance where needed
- [ ] deployment/audit profile
- [ ] richer interaction/provenance wire model
- [ ] retention/deletion lifecycle guidance
- [ ] optional jurisdiction/legal-basis profiles without embedding one jurisdiction into Core

## M7 — First real platform bridge

Build one bridge only where the source platform officially permits the required data access/processing.

Candidate classes:

- email provider with official OAuth/API access,
- calendar/meeting provider,
- enterprise collaboration provider,
- OS-level interaction-event source.

The bridge must preserve the same RCP principles:

- capability ≠ permission;
- permission before protected retrieval;
- least-data representation;
- provenance;
- provider/org restrictions;
- revocation/staleness;
- no permission expansion.

No bridge should rely on bypassing closed-platform access controls.

## M8 — Interoperability outreach / RFC governance

When independent implementation evidence exists:

- [ ] publish interoperability report/whitepaper
- [ ] invite platform interoperability/security/privacy engineers to review
- [ ] expand the RFC process
- [ ] define change-control/versioning expectations
- [ ] explore neutral stewardship
- [ ] evaluate appropriate standards communities rather than prematurely declaring a standard

## Long-term

If adoption emerges:

- public RFC governance,
- neutral stewardship,
- formal conformance/certification profiles,
- provider/consumer SDK ecosystem,
- jurisdiction/policy extensions,
- multiple independent implementations,
- standards-body engagement.

The long-term success criterion is not that RCP traffic passes through infrastructure operated by the original project. It is that independent systems can implement the protocol and preserve the same rights boundaries without depending on a central RCP operator.
