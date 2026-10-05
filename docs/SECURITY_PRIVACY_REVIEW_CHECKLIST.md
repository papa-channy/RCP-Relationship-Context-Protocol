# RCP Core v0.1 — Security & Privacy Review Checklist

> Status: review aid for the experimental RCP Core v0.1. This document does not certify an implementation and is not itself a security audit.

This checklist defines the bounded claims a security or privacy reviewer should test before RCP makes stronger interoperability or production-readiness claims.

## 1. Review scope and evidence

Record before review:

- RCP commit/tag under review;
- implementation name, version, language, and cryptographic libraries;
- supported Core objects and experimental profiles;
- deployment boundaries (provider, consumer, relay, organization policy service);
- processing locations and destinations used in the test deployment;
- threat model assumptions and excluded threats;
- all deviations from the normative Core/profile documents.

A reviewer SHOULD distinguish:

1. **protocol claim** — what RCP requires;
2. **implementation claim** — what one implementation does;
3. **deployment claim** — what an operator configuration guarantees.

Do not infer one from another.

## 2. Authorization before protected retrieval

Verify that:

- protected data is not read before a `PermissionDecision` is evaluated;
- provider capability support is not treated as permission;
- `deny`, `unknown`, unresolved `conditional`, expired `allow`, and stale decisions fail closed;
- a decision is bound to the exact request snapshot that produced it;
- mutation of action, resource, purpose, destination, processing location, or representation invalidates execution;
- a forged decision identifier cannot retrieve data;
- provider-side enforcement exists even when a consumer/control plane also checks permission;
- authorization dependencies record material policy/capability versions where required by the applicable profile.

Evidence to request:

- negative test results;
- provider audit/read counters or equivalent instrumentation;
- stale-decision test traces;
- code/configuration showing the enforcement boundary.

## 3. Capability negotiation and least-data selection

Verify that:

- capability names use the applicable registry semantics;
- `content`, `provider_context`, `interaction_metadata`, and identity capabilities are not silently substituted for one another;
- a denied raw-content capability cannot be bypassed through a broader endpoint;
- `limited` capabilities do not execute until their named limitations are satisfied;
- processing-location restrictions are evaluated separately from representation availability;
- the planner does not retrieve higher-fidelity data when a lower-fidelity representation satisfies the stated purpose.

## 4. Identity resolution and tenant isolation

Verify that:

- identity graphs are scoped to the user/tenant by default;
- no global cross-user identity graph is silently created;
- `probable` and `possible` evidence does not independently authorize sensitive-context merging;
- `conflicted` and `rejected` identity evidence cannot authorize linking;
- user-confirmed/provider-confirmed bindings retain their evidence and scope;
- unlink/unmerge operations do not leave hidden aliases that continue joining future data;
- provider-local identifiers do not become globally stable identifiers unless explicitly designed and authorized to do so.

Privacy review should also inspect correlation risk caused by stable provider IDs, relay metadata, logs, and telemetry.

## 5. Epistemic integrity

Verify that:

- source statements are not promoted to verified facts merely by normalization;
- provider-generated context is distinguishable from raw/provider-originated evidence;
- user observations and system inferences remain distinguishable;
- inference confidence/epistemic class survives storage and display where required;
- group interaction context is not automatically narrowed into a bilateral relationship assertion without a narrower evidence basis.

## 6. Provenance and derived-data policy inheritance

Verify that:

- every persistent `ContextAssertion` used in relationship memory has provenance;
- readable derived context does not itself grant access to restricted ancestors;
- transformation/summarization does not erase source restrictions;
- allowed purposes, destinations, and processing locations do not broaden across derivation;
- retention does not exceed the strictest applicable source maximum;
- confidentiality/sensitivity classification does not become weaker without an explicit validated transformation rule;
- independently supported derived context can be recomputed when one source is removed.

## 7. Revocation and lifecycle behavior

Verify that:

- source/provider revocation prevents future retrieval under the revoked authorization;
- already cached decisions become non-executable when the relevant grant/source is revoked;
- downstream assertions with sole revoked support become revoked/invalidated as specified;
- unrelated graph branches survive;
- recomputation is deterministic for the tested dependency graph;
- repeated revocation events are idempotent at the materialized-state layer;
- caches, embeddings, search indexes, exports, and backup handling are explicitly accounted for by the deployment even if Core v0.1 does not yet standardize all of them.

## 8. Policy drift and stale decisions

Verify that:

- a provider/organization policy version change invalidates decisions that depended on the previous version;
- execution-time revalidation occurs before protected retrieval where the implementation claims it;
- provider-side checks independently reject stale replay;
- replanning uses current capability/policy state rather than silently reusing an old allow;
- policy changes are not incorrectly modeled as factual invalidation of previously observed relationship history unless the retention policy actually requires that transition.

## 9. SecureEnvelope authorization binding

For `rcp-jose-x25519-a256gcm-ed25519-v0.1`, verify that the envelope is bound to:

- sender;
- recipient;
- action;
- resource reference;
- purpose;
- destination;
- processing location;
- permission decision reference;
- authorization lifetime.

Verify that:

- envelope expiry cannot exceed the underlying permission decision;
- envelope issuance cannot predate the decision it claims to use;
- decrypted provider result repeats and matches the provider/resource/representation/decision binding;
- unsigned or partially verified envelope metadata is never activated as trusted context.

## 10. JOSE profile review

Independently inspect:

- X25519 `ECDH-ES` key handling;
- `A256GCM` content encryption;
- Ed25519 detached JWS verification;
- RFC 8785 JSON canonicalization inputs;
- `b64=false` / `crit=["b64"]` handling;
- algorithm allowlists rather than accepting arbitrary JOSE algorithms;
- rejection of wrong recipient/signing keys;
- rejection of ciphertext and clear-metadata tampering;
- key generation entropy and private-key storage;
- key discovery authenticity, rotation, compromise, and revocation strategy.

Important: passing the repository crypto tests is interoperability evidence, **not** a cryptographic security proof.

## 11. Relay/operator visibility

For an operator-blind relay deployment, verify separately what the relay can observe.

At minimum test that:

- relay does not possess recipient decryption keys;
- relay exposes no decrypt operation;
- protected provider result remains ciphertext at the relay;
- transient ciphertext retention matches the claimed lifecycle;
- persistent relay audit excludes fields the deployment promises not to retain;
- clear envelope metadata is explicitly documented as visible to the relay;
- the operator does not claim metadata anonymity merely because payloads are encrypted;
- logs/APM/error traces do not accidentally capture envelope payloads or protected identifiers beyond the stated audit surface.

## 12. Organization and managed-account boundary

Verify that:

- `A can view it` is not treated as `A can export it`;
- organization policy and provider capability are independent inputs;
- work-managed/organization-owned sources can deny external processing/export even when the human account user has local UI access;
- employment/membership termination or equivalent organization events can invalidate dependent authorization state;
- organization-confidential data is not silently downgraded when transformed into relationship context.

## 13. Logging, telemetry, and operator access

Inspect:

- application logs;
- metrics labels;
- distributed traces;
- crash reports;
- support tooling;
- database backups;
- admin interfaces.

Verify that protected data, identity aliases, permission tokens/decisions, private keys, and decrypted payloads are not retained outside their declared boundary. Review redaction behavior on errors and malformed requests.

## 14. Denial-of-service and abuse boundaries

Review:

- request-size limits;
- envelope/ciphertext-size limits;
- JSON parsing limits;
- replay resistance and decision lifetime;
- rate limiting where exposed publicly;
- malformed JOSE handling;
- identity-claim flooding;
- derivation/revocation graph amplification;
- resource exhaustion caused by expensive crypto or repeated failed authorization.

Core v0.1 does not yet standardize all operational limits, so implementation/deployment controls must be documented as such.

## 15. Social-manipulation boundary

If an application uses RCP context for relationship assistance, verify that the application layer distinguishes benign assistance from covert manipulation.

Examples that SHOULD remain allowed by product policy:

- remembering commitments;
- recalling preferences;
- preparing a meeting;
- suggesting respectful follow-up.

Review or prohibit application behaviors that use sensitive/inferred vulnerabilities to coerce, deceive, pressure, or emotionally manipulate a counterparty. This is primarily an application-policy concern, but RCP-derived context can increase the impact and therefore must be included in threat review.

## 16. Required reviewer outputs

A useful review report should include:

- scope and exact version;
- tested claims;
- passed claims;
- findings with severity and reproduction details;
- protocol ambiguity vs implementation bug classification;
- privacy observations even when no exploit exists;
- unresolved assumptions;
- recommended Core/profile changes;
- explicit statement of what was **not** reviewed.

## 17. Claims that MUST NOT be made solely from this checklist

Completion of this checklist does not by itself justify claims of:

- production security;
- legal compliance in any jurisdiction;
- formal verification;
- cryptographic proof;
- independent interoperability;
- standards-body endorsement;
- safe use for every relationship/organization context.
