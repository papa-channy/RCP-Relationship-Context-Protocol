# Provenance & Derivation Model — v0.2 Design Direction

**Status:** Non-normative design draft

RCP should not invent a universal provenance ontology.

Where practical, implementations should map to or reuse established provenance representations such as W3C PROV or provider-native lineage systems.

RCP's distinctive concern is narrower:

> **Which evidence dependencies are material to relationship context, and what lifecycle consequences follow when those dependencies change?**

## Separate concepts

- **Provenance** — where an object came from.
- **Evidence** — what supports a relationship assertion.
- **Derivation** — transformation that produced a new assertion/state.
- **Evidence relation** — how one assertion/evidence item relates to another.
- **Authorization dependency** — which grant/decision permitted the relevant use.
- **Policy dependency** — which restrictions continue to apply.
- **Identity dependency** — which scoped identity binding was required to interpret the relationship.
- **Lifecycle dependency** — which source/policy/identity changes require downstream re-evaluation.

## Evidence relation candidates

RCP may need a small relationship-specific relation vocabulary such as:

- `supports`;
- `corroborates`;
- `conflicts_with`;
- `supersedes`;
- `refines`;
- `derived_from`;
- `independent_of`.

The exact registry is not yet frozen.

These relations are not intended to replace a general provenance vocabulary. They exist only where deterministic relationship-context composition needs a shared meaning.

## Core restriction invariant

```text
Restriction(child) >= Restriction(material parent)
```

This is shorthand for monotonic restriction behavior, not a claim that every policy system has a single scalar restriction level.

For independently constrained policy dimensions:

- allowed sets generally intersect;
- prohibitions accumulate;
- retention cannot silently become longer;
- training/disclosure restrictions do not disappear through summarization;
- confidentiality/sensitivity does not automatically downgrade because fidelity decreased.

A transformation does not automatically make data less restricted.

## Child/source access separation

A Consumer may be authorized to receive:

```text
"Project X should be revisited in November"
```

without being authorized to read the original:

- private email,
- meeting transcript,
- CRM note,
- message thread.

Therefore:

> **access to a derived relationship assertion does not imply access to its evidence.**

Provenance visibility may be:

- full;
- redacted;
- type-only;
- opaque/internal-only;
- another profile-defined visibility.

Even when provenance is opaque, the assertion should disclose enough metadata to make the limitation explicit.

## Dependency invalidation

When a material source, identity binding, authorization basis, provider policy, organization policy, or source validity changes:

1. identify affected dependencies;
2. find dependent relationship assertions/materialized state;
3. reevaluate evidence sufficiency;
4. reevaluate current restrictions/policy;
5. choose a lifecycle action;
6. rebuild affected materialized relationship state;
7. preserve historical lineage.

Possible lifecycle actions include:

- delete;
- invalidate;
- restrict;
- recompute;
- supersede;
- retain with independent support;
- retain only as historical context.

## Independent-support rule

Consider:

```text
Source A ----\
              > Commitment K
Source B ----/
```

If Source A becomes unusable, Commitment K does **not** have one universal outcome.

A semantic engine must determine whether Source B independently provides sufficient support.

### Case 1 — independent support remains

```text
Source A revoked
Source B valid + independently sufficient
        ↓
K may remain/recompute under a new current lineage
```

### Case 2 — support no longer sufficient

```text
Source A revoked
Source B insufficient/dependent on A
        ↓
K must be invalidated/restricted/recomputed
```

RCP should make this distinction machine-checkable rather than forcing an LLM to guess from prose.

## Historical-lineage invariant

If a source was actually used to derive an assertion, later revocation/recomputation must not rewrite history to pretend that the source was never used.

Conceptually:

```text
K@v1 <- Source A + Source B

Source A revoked

K@v2 <- Source B
```

not:

```text
K@v1 <- Source B   # false rewritten history
```

## Cross-provider provenance

When relationship context from multiple Providers is composed, provider origin should remain visible to the semantic engine even if a user-facing application later produces a single summary.

```text
Provider A evidence ─┐
                     ├─> derived combined state
Provider B evidence ─┘
```

A combined state must not destroy:

- origin/provider identity;
- evidence independence/dependence;
- conflict/supersession relations;
- inherited restrictions;
- lifecycle dependencies.

## Revocation transport boundary

RCP does not need to own a universal `RevocationEvent` transport in v0.2.

A change may arrive through:

- Shared Signals / CAEP-compatible signal;
- provider webhook/event stream;
- MCP subscription;
- HTTP event stream;
- local database change;
- user action;
- another binding.

RCP's Core responsibility begins when that change affects a material relationship-context dependency.

## Design test

A provenance/derivation field belongs in RCP Core only if it is required to produce the same relationship lifecycle result across different transports and provenance representations.
