# RCP Roadmap

## M0 — Public foundation

- [x] README
- [x] Project charter
- [x] Architecture draft
- [x] Rights/threat design drafts
- [x] Initial schemas
- [ ] Public issue taxonomy
- [ ] RFC template

## M1 — Normative Core v0.1

Define MUST/SHOULD/MAY behavior for:

- IdentityClaim
- ProviderCapability
- PermissionRequest / PermissionDecision
- ContextAssertion
- SecureEnvelope
- RevocationEvent

Exit criterion: schemas and prose define the same semantics and all examples validate.

## M2 — Reference Core

Implement:

- capability negotiation,
- permission engine,
- policy engine,
- provenance graph,
- derivation dependencies,
- revocation impact analysis,
- secure envelope signing/encryption.

Exit criterion: deterministic reference scenarios pass locally.

## M3 — Reference Ecosystem

Implement independent mock providers:

1. Mail
2. Messenger
3. Enterprise collaboration
4. Phone
5. Meeting

Implement one relationship consumer.

Exit criterion: one user/counterparty relationship can be reconstructed from heterogeneous provider permissions without violating provider policies.

## M4 — Rights-aware demo

Canonical demos:

1. Multi-provider relationship recall.
2. Provider source revocation and downstream recomputation.
3. Organization policy change and processing downgrade.
4. Ambiguous identity link requiring user confirmation.
5. Provider-side context extraction with opaque provenance.

## M5 — Conformance

Build provider and consumer test suites covering:

- unknown permission denial,
- raw-content restriction,
- purpose binding,
- policy inheritance,
- derived-data laundering prevention,
- revocation propagation,
- cross-tenant isolation,
- stale policy invalidation.

## M6 — Independent implementation

Give the specification to an external implementer without reference code guidance.

Exit criterion: an independently built provider or consumer interoperates with the reference ecosystem.

## M7 — Bridges and external review

Only after the reference protocol is coherent:

- build one bridge to an existing public API,
- invite security/privacy review,
- publish an interoperability whitepaper,
- approach standards communities and platform interoperability teams.

## Long-term

If adoption emerges:

- public RFC governance,
- neutral stewardship,
- formal conformance certification,
- jurisdiction profiles,
- provider/consumer SDK ecosystem,
- standards-body engagement.
