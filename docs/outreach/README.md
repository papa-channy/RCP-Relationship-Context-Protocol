# RCP External Validation & Outreach

This directory contains concise materials for people who did **not** participate in the design of RCP and may be willing to challenge, implement, or review it.

RCP is still an experimental protocol draft. These materials are intentionally written as **validation requests**, not as standards-adoption or production-readiness claims.

## Start here by role

### Independent implementer

Read:

1. [`TECHNICAL_BRIEF.md`](./TECHNICAL_BRIEF.md)
2. [`IMPLEMENTATION_CHALLENGE.md`](./IMPLEMENTATION_CHALLENGE.md)
3. [`../IMPLEMENTER_GUIDE.md`](../IMPLEMENTER_GUIDE.md)
4. [`../../spec/core-v0.1.md`](../../spec/core-v0.1.md)

The target outcome is a clean-room Provider implementation that can be tested with the external black-box harness without importing the RCP reference runtime.

### Security or privacy reviewer

Read:

1. [`TECHNICAL_BRIEF.md`](./TECHNICAL_BRIEF.md)
2. [`SECURITY_REVIEW_REQUEST.md`](./SECURITY_REVIEW_REQUEST.md)
3. [`../SECURITY_PRIVACY_REVIEW_CHECKLIST.md`](../SECURITY_PRIVACY_REVIEW_CHECKLIST.md)
4. [`../threat-and-rights-model.md`](../threat-and-rights-model.md)

The target outcome is not a generic code review. We want the reviewer to identify protocol ambiguity, unsafe permission semantics, metadata leakage, cryptographic-profile weaknesses, or rights-model gaps.

### Standards / interoperability engineer

Read:

1. [`TECHNICAL_BRIEF.md`](./TECHNICAL_BRIEF.md)
2. [`../../spec/README.md`](../../spec/README.md)
3. [`../../CHARTER.md`](../../CHARTER.md)
4. [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md)

The useful question is not “should everyone adopt RCP?” yet. The useful question is whether the protocol surface defines a coherent interoperability problem that existing identity, authorization, portability, and secure-envelope standards do not already solve on their own.

## Current evidence

The repository currently includes:

- normative Core v0.1 draft semantics and JSON Schemas;
- capability, permission, context, secure-envelope, and revocation objects;
- semantic and privacy-boundary conformance tests;
- experimental JOSE profile tests;
- Node ↔ Python cryptographic interoperability probes;
- an executable five-provider reference ecosystem;
- permission-before-retrieval enforcement;
- encrypted Provider → Consumer context delivery;
- revocation propagation and relationship-brief recomputation;
- policy-drift / stale-decision handling;
- an operator-blind relay reference path;
- a black-box external Provider harness.

## Claims we are **not** making

RCP does not currently claim:

- standards-body endorsement;
- independent implementation interoperability;
- independent cryptographic or security review;
- production security;
- legal compliance in any jurisdiction;
- compatibility with private APIs that do not expose the required capabilities;
- adoption by Google, Apple, Meta, Microsoft, Kakao, or any other platform.

## Where to report findings

Use GitHub issues for protocol ambiguities, implementation failures, and review findings. For security vulnerabilities that should not be disclosed publicly before mitigation, follow [`../../SECURITY.md`](../../SECURITY.md).

Current clean-room validation milestone: [Issue #19](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/19).
