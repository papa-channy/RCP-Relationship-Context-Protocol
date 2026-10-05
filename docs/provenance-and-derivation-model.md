# Provenance & Derivation Model — Design Draft

Persistent derived relationship context must remain traceable to its source or explicit user authorship.

## Separate concepts

- Provenance — where an object came from.
- Derivation — transformation that produced it.
- Evidence — what supports a statement.
- Permission dependency — which authorization permitted processing.
- Policy dependency — which restrictions continue to apply.

## Core invariant

```text
Restriction(child) >= Restriction(parent)
```

A transformation does not automatically make data less restricted.

## Revocation propagation

When a source, grant, policy, identity link, or legal basis changes:

1. identify affected source,
2. traverse descendants,
3. reevaluate permission,
4. reevaluate evidence sufficiency,
5. delete / invalidate / restrict / recompute / retain,
6. rebuild materialized views,
7. write an audit event.
