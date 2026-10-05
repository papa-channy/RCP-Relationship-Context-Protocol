# RCP Context Selection Boundary Profile v0.1

> **Status: Experimental Normative Profile**

This profile defines two minimum privacy boundaries for selecting relationship context from provider data: representation capability boundaries and multi-party interaction scope.

It intentionally does not define a complete provider transport API or a complete `InteractionObject` wire format.

## 1. Representation capability is specific

A provider advertises separate capabilities such as:

- `content`
- `provider_context`
- `interaction_metadata`
- `external_processing`

These capabilities are not interchangeable.

If `content = deny`, a consumer MUST NOT retrieve or export raw communication content merely because `provider_context`, `interaction_metadata`, or `external_processing` is available.

If `provider_context = allow`, the provider MAY emit a provider-generated `ContextAssertion` while continuing to deny raw content.

This separation is a core RCP privacy property: interoperability MAY be achieved through minimum context without requiring source-content disclosure.

## 2. `limited` capabilities

A capability value of `limited` MUST be treated as unavailable until all material limitations relevant to the operation are resolved.

A consumer MUST NOT reinterpret `limited` as `allow` because another related capability is available.

Once the declared limitation is resolved, the capability becomes technically usable for the constrained operation, but a separate valid permission decision remains REQUIRED.

## 3. Capability does not replace permission

Even when the exact requested representation capability is `allow`, the transfer MUST NOT occur without a fresh applicable `PermissionDecision` of `allow`.

Capability answers:

> Can this provider technically support this operation?

Permission answers:

> May this operation execute in this context?

The two decisions MUST remain separate.

## 4. External processing boundary

If an operation requires processing outside the provider boundary, the provider's `external_processing` capability is an additional technical prerequisite.

Therefore:

- `content = allow` does not imply `external_processing = allow`;
- `provider_context = allow` does not imply unrestricted external processing;
- `external_processing = deny` MUST block operations that require external processing even when the underlying representation is otherwise readable.

## 5. Multi-party interaction scope

An interaction with participants `{A, B, C}` is not equivalent to three independent bilateral interactions `{A,B}`, `{A,C}`, and `{B,C}`.

A context assertion derived from a multi-party interaction SHOULD remain scoped to that interaction or full participant set unless there is explicit evidence supporting a narrower relationship scope.

A consumer MUST NOT create persistent bilateral relationship context solely because both members of the target pair participated in the same group interaction.

## 6. Narrowing interaction scope

Let `I` be the source interaction participant set and `T` the target relationship participant set.

A projection from I to T MUST satisfy:

1. `T` is a non-empty subset of `I`; and
2. either:
   - `T == I`, or
   - explicit evidence supports the narrower scope.

Examples of an explicit narrower basis can include:

- a statement directly addressed from A to B;
- a provider assertion explicitly scoped to A and B;
- a user-confirmed bilateral note;
- another evidence object whose scope is already bilateral.

Mere co-presence in a group interaction is insufficient.

## 7. Third-party protection

When a group interaction contains a third participant C, narrowing context to relationship A-B MUST NOT silently discard C's relevance if the assertion materially concerns C.

A future interaction/provenance profile may define richer participant-role and assertion-scope fields. Until then, implementations MUST fail closed rather than invent an unsupported bilateral interpretation.

## 8. Conformance

The canonical M1 cases are:

- `conformance/content-boundary-cases.json`
- `conformance/group-context-cases.json`
- `conformance/boundary_checks.py`

Conformance to this profile does not require any particular internal database, graph model, or provider adapter architecture.
