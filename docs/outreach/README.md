# RCP External Validation & Outreach

> **Status:** outreach package for the preserved v0.1 baseline. Active broad outreach is intentionally paused while RCP refactors toward the v0.2 transport-independent semantic Core.

These materials were created to help unrelated implementers and reviewers challenge RCP v0.1. They remain useful historical validation tools, but they should not be presented as the current implementation target for the project.

## Active project direction

Read first:

1. [`../../spec/core-v0.2-draft.md`](../../spec/core-v0.2-draft.md)
2. [`../standards-boundary.md`](../standards-boundary.md)
3. [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md)
4. [Issue #23 — semantic-core refactor](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/23)

The current engineering goal is to determine whether RCP has a defensible transport-independent relationship information/lifecycle model, not to maximize adoption of the v0.1 Provider profile.

## Preserved v0.1 validation materials

The following remain useful for auditing or independently reproducing the v0.1 baseline:

- [`TECHNICAL_BRIEF.md`](./TECHNICAL_BRIEF.md)
- [`IMPLEMENTATION_CHALLENGE.md`](./IMPLEMENTATION_CHALLENGE.md)
- [`SECURITY_REVIEW_REQUEST.md`](./SECURITY_REVIEW_REQUEST.md)
- [`../IMPLEMENTER_GUIDE.md`](../IMPLEMENTER_GUIDE.md)
- [`../../spec/core-v0.1.md`](../../spec/core-v0.1.md)
- [`../../conformance/external/provider-harness-profile-v0.1.md`](../../conformance/external/provider-harness-profile-v0.1.md)

A clean-room v0.1 implementation is still meaningful evidence about the old contract, but passing the v0.1 harness does **not** establish compatibility with the emerging v0.2 semantic Core.

## Standards/interoperability research

These planning artifacts remain useful background:

- [`OUTREACH_SEQUENCE.md`](./OUTREACH_SEQUENCE.md)
- [`TARGET_MAP.md`](./TARGET_MAP.md)
- [`OUTREACH_TEMPLATES.md`](./OUTREACH_TEMPLATES.md)

Do not use them for broad adoption outreach until the semantic-core refactor is stable enough that external reviewers are evaluating the intended protocol boundary rather than a superseded v0.1 shape.

## Current evidence

The repository still contains substantial v0.1 evidence:

- normative experimental v0.1 semantics and schemas;
- semantic/privacy-boundary conformance tests;
- JOSE profile tests;
- Node ↔ Python crypto interoperability;
- a five-Provider reference ecosystem;
- permission-before-retrieval;
- provider-side safe projection/raw-content boundaries;
- revocation/recomputation;
- policy-drift handling;
- operator-blind relay;
- black-box external Provider harness.

The v0.2 refactor is preserving these results while reducing RCP's responsibility to relationship-specific semantics.

## Claims we are not making

RCP does not currently claim:

- standards-body endorsement;
- v0.2 independent implementation interoperability;
- independent security/privacy certification;
- production readiness;
- legal compliance in any jurisdiction;
- adoption by Google, Apple, Meta, Microsoft, Kakao, or any other platform.

## Where to report findings

Use GitHub issues for protocol ambiguities and design findings. Security vulnerabilities that should not be publicly disclosed before mitigation should follow [`../../SECURITY.md`](../../SECURITY.md).

Current design milestone: [Issue #23](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/23).

Preserved v0.1 clean-room milestone: [Issue #19](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/19).
