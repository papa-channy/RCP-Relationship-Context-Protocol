# Threat & Rights Model — Design Draft

This document is intentionally non-normative. It captures the initial rights model behind RCP.

## Actors

- Human A — service user / requester
- Human B — counterparty
- Human C — mentioned third party
- Org-A / Org-B — organizations with possible confidentiality interests
- Provider — communication/data platform
- OS/identity platform
- RCP provider/consumer infrastructure

## Central rule

`A can see data` is not equivalent to `A may delegate it`, `RCP may process it`, `RCP may retain it`, `RCP may derive from it`, or `RCP may disclose it`.

RCP evaluates actions against multiple independent constraints rather than assigning a single owner to each datum.

## Important threat classes

- unauthorized provider access,
- identity mis-merge,
- excessive collection,
- unauthorized derived profiling,
- corporate data leakage,
- revoked-data persistence,
- infrastructure breach,
- insider access,
- external model leakage,
- cross-user counterparty aggregation,
- policy drift,
- cross-border transfer errors,
- group-context misattribution,
- source-statement-to-fact collapse,
- derived-data laundering,
- provenance leakage,
- social manipulation,
- cross-tenant identity graphs,
- over-retrieval,
- stale permission decisions.

## Default safety stance

Restrictions accumulate. Unknown permission is non-executable. Sensitive inference and cross-user profiling are denied by default.
