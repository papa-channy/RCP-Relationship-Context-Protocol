# RCP — Technical Brief for External Validation

> Experimental protocol draft. This brief is for technical review and independent implementation, not for production adoption claims.

## The problem

A person’s relationship with another person is often split across independent systems: email, messaging, calls, meetings, calendars, enterprise collaboration tools, and future personal AI systems.

A Personal AI may need enough context to answer a request such as:

> “Prepare me for my next conversation with B.”

But the underlying data does not have one uniform permission boundary.

One Provider may allow message content. Another may allow only interaction metadata. An enterprise Provider may allow local processing but prohibit export. A counterparty or organization may have separate restrictions. A later revocation or policy change may invalidate a previously valid decision.

The interoperability problem is therefore not merely:

> “How do we move data between APIs?”

It is:

> **How can independently operated systems exchange the minimum relationship context needed for an authorized purpose without collapsing the rights, policy, provenance, and processing boundaries attached to that data?**

## RCP’s proposed role

RCP is an experimental open protocol for representing and exchanging relationship context under explicit machine-readable constraints.

It separates three conceptual planes:

```text
Control Plane
Identity · Capability · Permission · Policy · Revocation

Secure Data Plane
Provider → encrypted context → Consumer

Trust Plane
Signature · Provenance · Audit · Attestation / metering metadata
```

RCP does not require all payloads to pass through an RCP-operated central service. A Provider and Consumer can implement the protocol directly.

## Minimal Core v0.1 surface

The current experimental Core defines:

- `IdentityClaim`
- `ProviderCapability`
- `PermissionRequest`
- `PermissionDecision`
- `ContextAssertion`
- `SecureEnvelope`
- `RevocationEvent`

The current normative draft also defines rules such as:

- capability support is not authorization;
- permission is purpose-, destination-, processing-location-, resource-, and time-bound;
- `unknown`, unresolved `conditional`, stale, or expired decisions fail closed;
- derived context does not silently lose source restrictions;
- readable derived context does not automatically grant access to its ancestors;
- revocation must be able to affect downstream context;
- cross-tenant identity graphs do not merge by default;
- group context does not silently become bilateral relationship context;
- transformation does not turn an inference into a verified fact.

## Secure exchange profile

The current experimental `SecureEnvelope` profile uses existing JOSE/JCS mechanisms rather than new cryptographic primitives:

- X25519 with `ECDH-ES`;
- `A256GCM`;
- Ed25519 detached JWS;
- RFC 8785 JSON canonicalization.

The reference ecosystem uses the profile so that Provider payloads are encrypted for the Consumer. The relay reference path does not hold recipient decryption keys.

This profile has executable tests and Node ↔ Python interoperability evidence, but it has **not** received an independent cryptographic security review.

## What is implemented today

The repository contains an executable reference ecosystem with five independent mock Provider processes:

- mail-like;
- messenger-like;
- enterprise-like;
- phone-like;
- meeting-like.

The Providers intentionally expose different capabilities and policies.

The canonical path demonstrates:

```text
provider-local identity claims
→ tenant-scoped identity binding
→ capability discovery
→ minimum-data ProcessingPlan
→ Provider-issued PermissionDecision
→ protected lazy retrieval
→ signed + encrypted SecureEnvelope
→ optional operator-blind relay
→ Consumer verification + decryption
→ ContextAssertion with provenance
→ relationship brief
```

Separate scenarios exercise source revocation, downstream recomputation, policy drift, stale-decision rejection, and representation boundaries.

## Existing validation evidence

Current internal evidence includes:

- JSON Schema validation and negative fixtures;
- semantic conformance oracles;
- permission fail-closed tests;
- derived-policy inheritance tests;
- revocation graph tests;
- identity/provenance privacy-boundary tests;
- group-scope tests;
- JOSE tamper/wrong-key/algorithm-substitution tests;
- Node producer → Python consumer interoperability;
- Python producer → Node consumer interoperability;
- black-box external Provider harness self-test over HTTP.

## The key uncertainty now

The strongest remaining question is no longer whether the original author can make the model work.

It is:

> **Can an unrelated implementer read the specification without reference-runtime guidance and independently produce compatible behavior?**

A second independent question is:

> **Does the protocol preserve the security/privacy properties it claims when reviewed by someone who did not design it?**

Those are the validation targets for the next milestone.

## What we are asking reviewers to do

We are looking for one or more of the following:

1. implement the experimental Provider surface from the spec and run the black-box harness;
2. identify ambiguous or contradictory normative requirements;
3. challenge the permission, identity, provenance, revocation, or policy-drift semantics;
4. review the JOSE profile and key-discovery assumptions;
5. analyze relay/operator metadata leakage;
6. identify a case where RCP would incorrectly expand a person’s or organization’s rights;
7. show that an existing standard already solves a proposed RCP responsibility more cleanly.

A failure that exposes a specification flaw is a useful outcome.

## What success would mean — and would not mean

One clean-room implementation successfully interoperating would mean only:

> at least one unrelated implementation interpreted the tested RCP Provider profile compatibly.

It would **not** mean:

- all roles are interoperable;
- RCP is production ready;
- the cryptography is independently secure;
- RCP complies with privacy law;
- any platform has adopted RCP;
- RCP should be standardized as-is.

## Entry points

- Core draft: [`../../spec/core-v0.1.md`](../../spec/core-v0.1.md)
- Spec index: [`../../spec/README.md`](../../spec/README.md)
- Implementer guide: [`../IMPLEMENTER_GUIDE.md`](../IMPLEMENTER_GUIDE.md)
- Conformance index: [`../../conformance/README.md`](../../conformance/README.md)
- Security/privacy checklist: [`../SECURITY_PRIVACY_REVIEW_CHECKLIST.md`](../SECURITY_PRIVACY_REVIEW_CHECKLIST.md)
- Clean-room validation milestone: [Issue #19](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/19)
