# RCP — External Security & Privacy Review Request

## Why we are asking for review

RCP is an experimental interoperability protocol for exchanging relationship context across independent systems while preserving the permission, policy, provenance, identity, organization, and revocation boundaries attached to the underlying data.

The current repository already contains a working reference ecosystem and conformance tests. The next useful step is not more validation by the original designer; it is adversarial review by people who did not design the protocol.

We are specifically looking for findings that show where the **protocol model itself** is unsafe, ambiguous, too permissive, or misleading.

## Review target

Please review an exact RCP commit or tag and record it in your findings.

Primary material:

- [`../../spec/core-v0.1.md`](../../spec/core-v0.1.md)
- [`../../spec/profiles/`](../../spec/profiles/)
- [`../rights-and-permission-model.md`](../rights-and-permission-model.md)
- [`../provenance-and-derivation-model.md`](../provenance-and-derivation-model.md)
- [`../threat-and-rights-model.md`](../threat-and-rights-model.md)
- [`../SECURITY_PRIVACY_REVIEW_CHECKLIST.md`](../SECURITY_PRIVACY_REVIEW_CHECKLIST.md)

The reference ecosystem is useful for reproducing behavior, but a protocol-level finding should identify whether the root cause is normative semantics, an experimental profile, or only the reference implementation.

## High-value review questions

### Authorization

Can a Provider, Consumer, relay, or attacker cause protected data to be retrieved or activated without a valid permission decision bound to the exact action, resource, purpose, destination, processing location, representation, and lifetime?

Can capability support accidentally become authorization?

Do stale, expired, `unknown`, or unresolved `conditional` decisions fail closed in every relevant path?

### Identity

Can provider-local identities be correlated across users or tenants more broadly than intended?

Can `probable`, `possible`, conflicted, or stale identity evidence cause sensitive context to be merged into the wrong person?

Does any identifier become an unintended global correlation handle?

### Provenance and derived context

Can transformation, summarization, embedding, or inference remove restrictions that applied to a source?

Can a readable derived object be used to recover or authorize access to an otherwise restricted ancestor?

Can a source statement become a verified fact without an explicit verification step?

### Revocation and policy drift

Can a revoked source continue to influence materialized relationship state?

Can a cached permission decision remain executable after a capability, organization policy, user grant, identity resolution, or source state changes?

Are there cases where recomputation preserves unsupported context or removes independently supported context incorrectly?

### SecureEnvelope / JOSE profile

Review the experimental profile for:

- X25519 `ECDH-ES` use;
- `A256GCM` content encryption;
- Ed25519 detached JWS;
- RFC 8785 canonicalization;
- `b64=false` and critical-header handling;
- algorithm substitution;
- key confusion;
- key discovery / rotation / compromise gaps;
- replay and lifetime assumptions;
- binding between clear metadata, permission decision, and decrypted Provider result.

The repository contains executable crypto tests and Node ↔ Python interoperability probes, but these are **not** a security proof.

### Relay and metadata privacy

The reference relay cannot decrypt payloads, but it can still observe some routing/control metadata.

Please identify whether clear metadata, timing, ciphertext size, stable identifiers, logs, or audit events expose a relationship graph or sensitive behavioral information beyond the stated privacy model.

### Organization boundaries

Can a user's local ability to view work-managed data be incorrectly interpreted as a right to export, derive, retain, or disclose it?

Can organization confidentiality disappear after transformation into relationship context?

## What is out of scope for this review request

Unless you explicitly choose to cover it, we are **not** asking for:

- a legal-compliance opinion for any jurisdiction;
- production infrastructure certification;
- a complete application-layer social-manipulation audit;
- review of real Gmail/Kakao/Apple/Microsoft integrations;
- standards-body endorsement.

## Useful output format

For each finding, please include:

- severity or impact;
- affected document/profile/object;
- exact reproduction or counterexample;
- whether it is a protocol ambiguity, protocol defect, profile defect, implementation defect, or deployment risk;
- security/privacy consequence;
- suggested invariant, test, or wording change if one is obvious.

Please also list important assumptions that you expected the protocol to specify but could not find.

A finding that forces RCP to remove or narrow a feature is a successful review outcome.

## Disclosure

Public protocol/design findings can be filed as GitHub issues.

If a finding creates an exploitable security issue that should be fixed before public disclosure, follow [`../../SECURITY.md`](../../SECURITY.md).

## Claims after review

Even a successful independent review would not by itself establish production safety, legal compliance, or standards status. RCP will report the scope and limitations of any review rather than treating “reviewed” as a blanket certification.
