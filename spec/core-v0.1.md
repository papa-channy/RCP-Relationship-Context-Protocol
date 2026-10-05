# RCP Core Specification v0.1

> **Status: Experimental Draft**
>
> This document defines the first normative core semantics for the Relationship Context Protocol (RCP). It is not yet a stable standard and MUST NOT be represented as one.

## 1. Conformance language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**, and **MAY** are to be interpreted as normative requirements for RCP implementations.

When this document conflicts with explanatory design documents under `/docs`, this document governs Core v0.1 behavior. Machine-readable schemas constrain syntax; this document defines semantics.

## 2. Scope

RCP Core v0.1 defines interoperability semantics for six protocol concepts represented by seven JSON object schemas:

1. `IdentityClaim`
2. `ProviderCapability`
3. `PermissionRequest`
4. `PermissionDecision`
5. `ContextAssertion`
6. `SecureEnvelope`
7. `RevocationEvent`

Core v0.1 does **not** define provider-specific APIs, global person identifiers, legal conclusions, a centralized relationship graph, or a complete cryptographic profile.

### 2.1 Wire version

Every Core v0.1 wire object MUST contain:

```json
{"rcp_version":"0.1"}
```

An implementation receiving an unsupported `rcp_version` MUST reject or quarantine the object as unsupported. It MUST NOT silently reinterpret the object as another RCP version.

Protocol version and provider-specific versions are distinct. For example, `capability_version` describes the provider capability manifest and MUST NOT be treated as the RCP wire version.

The JSON Schema identifiers use stable URN-style identifiers such as `urn:rcp:schema:permission-request:0.1`; implementers MUST NOT depend on a particular maintainer-controlled HTTP host to resolve Core schema identity.

## 3. Protocol invariants

A conforming implementation MUST preserve the following invariants:

1. RCP MUST NOT expand rights that do not otherwise exist.
2. Technical capability MUST NOT be interpreted as authorization.
3. `unknown` permission MUST be non-executable.
4. `conditional` permission MUST be non-executable until every required condition is satisfied and re-evaluated.
5. Permission MUST be evaluated before protected data retrieval, transfer, processing, derivation, storage, disclosure, action, or training.
6. Derived context MUST retain policy and provenance dependencies on its sources.
7. Transformation MUST NOT silently weaken source restrictions.
8. Revocation MUST trigger re-evaluation of dependent objects.
9. Access to a derived object MUST NOT imply access to its source objects.
10. Implementations MUST NOT merge identities across users or tenants merely because an identifier appears equivalent.
11. Incidental mention of a third party MUST NOT automatically create a persistent person profile.
12. The RCP protocol MUST NOT require traffic to pass through infrastructure operated by the protocol maintainers.
13. A later-stage object MUST NOT broaden the purpose, destination, processing location, or action authorized by the decision on which it depends.
14. Unsupported protocol versions, unknown material purposes, and unknown material processing locations MUST fail closed.

## 4. Actor and identifier model

Core v0.1 treats actor, provider, consumer, subject, resource, relationship, destination, and policy identifiers as opaque strings unless a registry or profile explicitly defines them.

Implementations:

- MUST compare opaque identifiers only within their declared scope;
- MUST NOT infer global identity equivalence from string equality alone;
- SHOULD use collision-resistant locally unique identifiers;
- SHOULD avoid embedding unnecessary personal data in identifiers.

Core v0.1 intentionally does not define a universal human identifier.

## 5. `IdentityClaim`

An `IdentityClaim` states that a provider or other issuer has observed an identity representation and assigns a declared verification state to it.

### 5.1 Semantics

`provider` identifies the provider namespace in which `identifier` has meaning.

`identifier` MUST NOT be interpreted as globally unique unless a later profile explicitly defines that behavior.

`verification_state` has the following semantics:

- `verified`: independently verified under a mechanism documented by the issuer.
- `provider_confirmed`: confirmed by the provider but not asserted as independently verified.
- `user_confirmed`: explicitly linked by the relevant user.
- `probable`: evidence suggests a match but automatic sensitive-context merge MUST NOT occur.
- `possible`: weak candidate match; automatic persistent merge MUST NOT occur.
- `conflicted`: contradictory evidence exists; automatic merge MUST NOT occur.
- `rejected`: the claim MUST NOT be used as positive identity evidence.

### 5.2 Merge safety

Core v0.1 does not define a universal merge algorithm. Implementations MUST record the evidence or user action that causes identity linkage. `probable`, `possible`, `conflicted`, and `rejected` claims MUST NOT independently authorize persistent sensitive-context merging.

Identity evidence generated in one user or tenant scope MUST NOT be promoted into a cross-user global person graph by default.

## 6. `ProviderCapability`

A `ProviderCapability` describes what a provider implementation is technically prepared to support. It does not grant legal or user permission.

### 6.1 Capability negotiation

A consumer MUST discover or possess a non-stale provider capability manifest before requesting provider-specific protected operations.

Capability values are:

- `allow`: the provider advertises technical support for the capability.
- `deny`: the provider advertises that the capability is unavailable.
- `limited`: support exists only under additional provider-defined constraints.

A capability value of `allow` MUST NOT be converted directly into an `allow` permission decision.

A `limited` capability MUST be treated as unresolved until the relevant provider limitation is identified and satisfied. Providers SHOULD expose machine-resolvable `limitation_refs`; a consumer that cannot resolve a material limitation MUST fail closed.

Core capability names are defined in [`registries/capabilities.md`](./registries/capabilities.md).

Core processing-location values are defined in [`registries/processing-locations.md`](./registries/processing-locations.md).

Unknown capability names MAY be preserved as namespaced extensions but MUST NOT be treated as equivalent to registered Core capabilities.

## 7. `PermissionRequest`

A `PermissionRequest` asks whether an actor may perform a single action for a declared purpose and execution context.

### 7.1 Actions

Core actions are:

- `discover`
- `access`
- `delegate`
- `transfer`
- `process`
- `derive`
- `store`
- `disclose`
- `act`
- `train`

Implementations MUST evaluate these actions independently. Permission for one action MUST NOT imply permission for another.

### 7.2 Required context

Every request MUST contain `requester`, `executor`, `action`, `purpose`, and `requested_at`.

For every action other than `discover`, the request MUST identify the protected `resource` or a provider-defined resource scope sufficient to make the authorization decision deterministic.

If an operation depends on a destination or processing location, those values MUST be supplied before execution. An evaluator MUST return `unknown` or `deny` rather than assume an unspecified destination or processing location.

### 7.3 Purpose binding

`purpose` is mandatory and MUST use a registered Core value or a valid namespaced extension from [`registries/purposes.md`](./registries/purposes.md).

Implementations MUST NOT replace a missing, malformed, or unknown material purpose with a broader default purpose.

A later request for a materially different purpose MUST be independently evaluated. Renaming a purpose after authorization MUST NOT extend an existing decision.

### 7.4 Processing location

When `processing_location` is present, it MUST use a registered Core value or a valid namespaced extension from [`registries/processing-locations.md`](./registries/processing-locations.md).

A consumer MUST NOT silently map an unknown value such as a generic `cloud` label to a more permissive registered location.

## 8. `PermissionDecision`

A `PermissionDecision` is the result of evaluating exactly one immutable `PermissionRequest` snapshot.

### 8.1 Request binding

`request_id` MUST identify the request snapshot actually evaluated. An implementation MUST NOT rebind an existing decision to a modified request that happens to reuse the same identifier.

Where request identifiers are not guaranteed immutable by storage design, an implementation SHOULD bind decisions to an integrity-protected request representation or equivalent snapshot mechanism.

### 8.2 Decision states

- `allow`: the requested action may execute under the evaluated context until the decision expires or becomes stale.
- `deny`: the action MUST NOT execute.
- `conditional`: the action MUST NOT execute until all required conditions are met and the decision is re-evaluated or explicitly transformed into a fresh `allow` decision.
- `unknown`: the evaluator lacks sufficient basis to permit execution; the action MUST NOT execute.

An `allow` or `conditional` decision MUST have a finite `expires_at` in Core v0.1.

### 8.3 Reason and condition codes

`reason_codes` SHOULD contain registered reason codes when the decision requires explanation. `deny` and `unknown` decisions MUST provide at least one reason code under the Core schema.

`conditional` decisions MUST provide at least one `required_condition` and MUST remain non-executable until re-evaluated.

Registered reason and condition codes are defined in [`registries/reason-codes.md`](./registries/reason-codes.md).

An implementation MAY emit namespaced extension codes, but unknown extension codes MUST NOT be interpreted as positive authorization.

### 8.4 Staleness

A decision becomes stale when any material input changes, including:

- provider capability state;
- user grant state;
- organization policy;
- counterparty restriction;
- legal-basis status;
- destination;
- processing location;
- purpose;
- relevant resource classification;
- identity resolution on which the decision depends.

An expired or stale `allow` decision MUST NOT authorize a new execution.

## 9. `ContextAssertion`

A `ContextAssertion` represents one bounded unit of relationship context and its epistemic status.

`assertion_type` MUST use a registered Core value or a valid namespaced extension from [`registries/assertion-types.md`](./registries/assertion-types.md).

### 9.1 Epistemic classes

- `source_statement`: a source stated something; truth is not independently asserted.
- `verified_fact`: the implementation has performed an explicit verification step under a documented policy.
- `extracted_fact`: content directly extracted from source material without independent truth verification.
- `user_observation`: an observation authored by a user.
- `system_interpretation`: system-generated interpretation that goes beyond direct extraction.
- `system_inference`: probabilistic or inferential system conclusion.
- `strategy`: recommended action or strategy; it MUST NOT be presented as a fact about a counterparty.
- `unknown`: epistemic status cannot be determined.

Implementations MUST NOT silently promote `source_statement`, `user_observation`, `system_interpretation`, or `system_inference` to `verified_fact`.

### 9.2 Scope and lifecycle

A persistent assertion MUST identify at least one subject or a relationship scope.

`status` MUST represent the current lifecycle state of the assertion. Superseded, expired, invalidated, or revoked assertions MUST NOT be returned as current active context without an explicit historical query.

### 9.3 Provenance

Every persistent assertion MUST contain provenance.

A derived or externally sourced assertion MUST identify sufficient `source_refs` to support downstream revocation analysis unless the provider exposes only opaque provenance. If provenance is opaque, `origin_type` and visibility MUST still make that limitation explicit.

Access to a `ContextAssertion` MUST NOT automatically grant access to its `source_refs`.

### 9.4 Policy inheritance

A derived assertion MUST preserve applicable source restrictions. Where multiple sources are combined, the output MUST NOT silently receive broader permissions than any essential source permits.

For independently constrained dimensions, restrictions accumulate and permissions intersect. At minimum:

- allowed purposes become the intersection of allowed purposes;
- allowed destinations become the intersection of allowed destinations;
- allowed processing locations become the intersection of allowed processing locations;
- maximum retention MUST NOT exceed the shortest applicable parent maximum unless the output is independently re-derived from sources that permit longer retention;
- a training prohibition on any essential source MUST remain a training prohibition on the derived object;
- confidentiality and sensitivity MUST NOT be downgraded merely because content was summarized, embedded, classified, or reformatted.

If a restriction cannot be represented or evaluated, downstream use requiring that evaluation MUST fail closed.

## 10. `SecureEnvelope`

A `SecureEnvelope` carries policy-visible routing metadata plus an encrypted relationship payload.

### 10.1 Authorization binding

`permission_decision_ref` MUST identify the authorization decision relied upon for the envelope transfer or processing step.

The envelope `purpose` MUST match the purpose of the `PermissionRequest` referenced by that decision. The envelope MUST NOT broaden the authorized action, destination, processing location, scope, or purpose.

If the referenced decision is missing, expired, stale, revoked, or not `allow`, the recipient MUST NOT activate the protected payload for the requested operation.

### 10.2 Operator blindness

RCP deployments SHOULD be architected so routing infrastructure can deliver an envelope without possessing the recipient's payload decryption key.

A relay MUST NOT require plaintext relationship content merely to route an otherwise valid envelope.

### 10.3 Cryptography

Core v0.1 defines the envelope semantics but does **not yet define a stable interoperable cryptographic profile**. Therefore:

- implementations MUST NOT advertise generic Core v0.1 schema conformance as proof of cryptographic interoperability;
- `profile` and `alg` values MUST identify a documented encryption/signature profile rather than a private undocumented primitive;
- authenticated encryption MUST be used for protected payloads;
- signatures MUST cover the policy-relevant envelope fields and the encrypted payload or its cryptographically bound digest;
- implementations MUST reject unsupported algorithms rather than silently downgrade.

A later RCP cryptographic profile will register concrete algorithms, canonicalization, key discovery, rotation, and signature coverage.

### 10.4 Metadata minimization

Cleartext envelope metadata SHOULD contain only fields required for authorization, routing, expiry, policy enforcement, and verification. Implementations SHOULD minimize persistent routing logs because relationship metadata can itself be sensitive.

## 11. `RevocationEvent`

A `RevocationEvent` communicates that a previously usable permission, source, policy state, or processing basis is no longer valid for the specified scope.

### 11.1 Scope

`scope.scope_type` and `scope.scope_id` MUST identify a deterministically interpretable affected scope. An empty or purely descriptive scope is not conformant.

A receiver that cannot resolve the affected scope MUST fail closed for new operations that depend on that unresolved scope until policy state is refreshed.

### 11.2 Processing requirements

Upon accepting a revocation event, a conforming implementation MUST:

1. identify affected source objects and permission decisions;
2. mark affected cached decisions stale;
3. traverse known dependent derived objects;
4. decide for each dependent whether to delete, invalidate, restrict, recompute, or retain;
5. rebuild affected materialized views and indexes when required;
6. record a privacy-minimized audit result.

### 11.3 No source-history rewriting

If a derived object is recomputed without a revoked source, the implementation SHOULD create new lineage or an equivalent auditable version transition. It MUST NOT rewrite historical provenance to imply the revoked source was never used.

### 11.4 Independent support

A derived assertion MAY remain usable if independent valid sources support it and current permission evaluation allows the continued use. The implementation MUST be able to explain that independent basis.

## 12. Minimum processing sequence

For a protected context operation, conforming implementations MUST follow this logical order:

```text
User or agent request
        ↓
Processing plan
        ↓
Capability check
        ↓
Permission evaluation
        ↓
Minimum required retrieval
        ↓
Processing / derivation
        ↓
Provenance write
        ↓
Output activation
```

The sequence MAY be implemented in distributed components, but protected data MUST NOT be bulk-retrieved first and authorized afterward.

## 13. Failure behavior

RCP Core v0.1 is fail-closed for protected operations.

The following MUST NOT result in execution:

- unsupported `rcp_version`;
- `deny`;
- `unknown`;
- unresolved `conditional`;
- stale permission decision;
- expired permission decision;
- capability `deny`;
- unresolved capability `limited`;
- unregistered or malformed material purpose;
- unregistered or malformed material processing location;
- unsupported required cryptographic profile;
- ambiguous sensitive identity merge;
- missing mandatory provenance for a persistent derived assertion.

## 14. Extension rules

Registered extensible vocabularies use the namespaced form:

```text
x-<namespace>:<name>
```

An extension MUST NOT redefine the meaning of a registered Core field, capability, purpose, processing location, assertion type, action, decision, epistemic class, or reason code.

Consumers that do not understand an extension MAY preserve it, but MUST NOT reinterpret it as a more permissive Core value.

Core objects use strict schemas and MUST NOT rely on silently ignored unknown fields for interoperability.

## 15. Conformance classes

Core v0.1 anticipates three conformance classes:

### 15.1 Provider

A Provider implementation exposes capability information and emits or transfers context according to RCP policy decisions.

### 15.2 Consumer

A Consumer implementation requests, receives, derives, stores, or acts on relationship context while preserving attached restrictions and provenance.

### 15.3 Relay

A Relay forwards secure envelopes without requiring plaintext payload access and obeys applicable routing, expiry, and revocation requirements.

An implementation MAY satisfy more than one class.

## 16. Conformance target for M1

M1 is complete only when:

1. every normative example validates against its schema;
2. negative fixtures fail for the intended reason;
3. schemas encode deterministic structural requirements where practical;
4. capability, reason/condition, assertion-type, purpose, and processing-location registries are stable enough for two independent implementations to interpret identically;
5. no protected operation can pass solely because capability is `allow`;
6. policy inheritance tests demonstrate that transformation does not relax parent restrictions;
7. revocation tests demonstrate descendant re-evaluation and recomputation/invalidation behavior;
8. stale-decision tests demonstrate fail-closed behavior after material input changes;
9. an implementer can build the seven Core objects without relying on undocumented behavior.

## 17. Known open items

Core v0.1 intentionally leaves the following for follow-on profiles/specifications:

- cryptographic algorithm profile and key discovery;
- identity-link and unlink protocol;
- full policy expression language;
- legal/jurisdiction profiles;
- provider discovery transport;
- transport binding (HTTP, event stream, local IPC, etc.);
- remote attestation;
- federated/shared relationship objects;
- normative privacy-preserving metering.

These open items MUST NOT be silently invented as global RCP semantics by one implementation.
