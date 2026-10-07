# RCP v0.2 Canonical Semantic Scenarios

**Status:** Design draft, non-normative

These scenarios are intended to become the first transport-independent semantic conformance cases for the v0.2 direction.

The important property is that the expected semantic result must be the same regardless of whether the RCP objects are carried over MCP, HTTP, A2A, or another compatible binding.

## Scenario A — Multi-party evidence must not silently collapse

### Source

Participants: `{A, B, C}`

C states something sensitive during a group interaction.

### Requested target

Relationship scope: `{A, B}`

### Unsafe behavior

The Consumer copies C's statement into persistent A-B relationship context merely because A and B were present.

### Expected RCP behavior

- source participants remain `{A,B,C}`;
- target relationship scope remains distinct from source participant scope;
- projection to `{A,B}` is rejected unless an explicit narrower evidence basis exists;
- authorization to read the group interaction does not itself establish semantic validity for bilateral projection.

### Invariant

`source_participants ⊇ target_participants` is necessary but not sufficient for projection.

---

## Scenario B — Conflicting provider evidence

### Provider A

Assertion:

```text
Project X review is scheduled for Nov 12.
```

Epistemic class: `extracted_fact`

### Provider B

Later assertion:

```text
Project X review moved to Nov 15.
```

Epistemic class: `source_statement` or `extracted_fact` depending on source.

### Unsafe behavior

The Consumer stores both as simultaneously current facts or picks one based only on provider ordering.

### Expected RCP behavior

The model can represent at least one of:

- explicit `conflicts_with`;
- explicit `supersedes` if evidence establishes replacement;
- separate provider views when supersession is not established.

The Consumer must preserve provider origin and epistemic meaning until a deterministic reconciliation rule applies.

### Invariant

Transport order is not semantic supersession.

---

## Scenario C — Partial-source invalidation with independent support

### Initial derivation

```text
Source A ----\
              > Commitment K: "Revisit Project X in November"
Source B ----/
```

A and B independently support K.

### Change

Source A is revoked or corrected.

### Unsafe behavior

Either:

1. K is automatically retained without checking B; or
2. K is automatically destroyed even though B independently supports it.

### Expected RCP behavior

- K enters re-evaluation;
- the semantic engine determines whether B is independently sufficient;
- if B is sufficient and current policy permits use, a current K may remain/recompute with updated lineage;
- if B is not sufficient, K becomes invalidated/restricted/recomputed;
- historical K@v1 lineage still records that A was used.

### Invariant

Revocation affects dependencies, not truth by deletion fiat.

---

## Scenario D — Policy-preserving projection

### Source

Raw conversation evidence has a restriction equivalent to:

```text
external_processing = deny
```

### Provider action

The Provider creates a shorter summary or `ContextAssertion`.

### Unsafe behavior

The implementation assumes the summary is now free of the original restriction simply because it contains less information.

### Expected RCP behavior

- the derived assertion retains the material restriction by default;
- summarization/redaction/inference is not itself declassification;
- any policy loosening requires an explicit profile-defined re-derivation/declassification basis;
- a Consumer that cannot evaluate the material restriction fails closed for external processing.

### Invariant

Lower fidelity does not imply lower restriction.

---

## Scenario E — Epistemic preservation

### Source 1

```text
B said: "I may relocate to Tokyo next year."
```

RCP class: `source_statement`

### Source 2

A system predicts:

```text
B is likely to relocate to Tokyo.
```

RCP class: `system_inference`

### Unsafe behavior

After combining or repeatedly observing these items, the Consumer stores:

```text
B will relocate to Tokyo.
```

as `verified_fact`.

### Expected RCP behavior

- source statement remains a source statement;
- inference remains an inference;
- aggregation/repetition does not silently promote epistemic class;
- verification requires an explicit documented verification step/basis.

### Invariant

Confidence is not verification.

---

## Scenario F — Child access does not grant evidence access

### Provider

Raw source: private email thread.

Derived assertion:

```text
Commitment: Revisit pricing after pilot completion.
```

### Authorization

Consumer may access the commitment assertion but not the raw email.

### Unsafe behavior

Consumer follows provenance reference and retrieves the raw email because the child was readable.

### Expected RCP behavior

- assertion remains usable;
- provenance may be redacted/type-only/opaque;
- raw source access requires independent authorization;
- inability to inspect source does not automatically invalidate the assertion if the Provider is allowed to expose the projection.

### Invariant

`access(child) != access(source)`.

---

## Scenario G — Identity dependency changes

### Initial state

Provider-local identifier `p:123` is user-confirmed as Human B in tenant T.

Assertions are materialized under relationship `{A,B}`.

### Change

The identity binding is later marked `conflicted` or unlinked.

### Unsafe behavior

Existing assertions continue to appear as current A-B context without re-evaluation.

### Expected RCP behavior

- the identity binding is treated as a material dependency;
- affected assertions/state enter re-evaluation;
- implementations do not rewrite history;
- assertions may be invalidated, detached to an unresolved actor reference, or retained as historical context according to profile/lifecycle rules.

### Invariant

Identity resolution is part of semantic lineage, not an invisible preprocessing step.

---

## Scenario H — Cross-provider composition without premature flattening

### Provider A

```text
assertion: B prefers asynchronous updates
class: user_observation
```

### Provider B

```text
assertion: B asked to receive weekly email summaries
class: extracted_fact
```

### Unsafe behavior

Consumer immediately normalizes both into:

```text
verified_fact: B prefers email
```

### Expected RCP behavior

- Provider views remain individually addressable;
- epistemic classes remain intact;
- a derived combined preference may be created only with explicit derivation lineage;
- the combined assertion must not claim stronger truth than its evidence supports;
- restrictions from material sources remain attached.

### Invariant

Composition creates a new assertion; it does not erase the assertions it was composed from.

---

## Scenario I — Supersession is semantic, not arrival order

### Input

Provider A emits `X@t1`.

Provider B emits `Y@t2` later in wall-clock time.

No semantic relation between X and Y is declared or inferable from the normalized model.

### Unsafe behavior

The Consumer marks X superseded merely because Y arrived later.

### Expected RCP behavior

- both may remain active/provider-scoped if not mutually exclusive;
- supersession requires an explicit semantic basis, profile rule, or deterministically comparable state transition;
- transport arrival order alone is insufficient.

### Invariant

`later_received != supersedes`.

---

## Scenario J — Binding equivalence

The same semantic assertion is transported through two different bindings.

### Binding 1

MCP resource/tool response.

### Binding 2

Plain HTTP response.

### Expected RCP behavior

After binding-specific framing/authentication is removed, both objects enter the same semantic engine and produce equivalent:

- relationship scope;
- epistemic interpretation;
- evidence dependencies;
- policy dependencies;
- lifecycle state.

### Failure signal

If the semantic result depends on MCP-specific tool semantics or HTTP-specific endpoint behavior that is not represented in RCP, the Core boundary is incomplete or the feature belongs in the binding.

### Invariant

Transport must not be hidden semantic state.

## Acceptance direction

These scenarios should eventually be encoded as machine-readable fixtures/oracles.

Before doing so, the project should reconcile each scenario against existing standards and decide which fields/relations truly need RCP-specific representation.
