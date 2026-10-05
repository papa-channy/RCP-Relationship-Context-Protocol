# Contributing to RCP

RCP is experimental. The project currently values **counterexamples and interoperability failures** more than feature expansion.

## Good contributions

- a rights conflict not representable by the current model,
- an identity-resolution ambiguity,
- a policy combination with no deterministic outcome,
- a revocation case that leaves stale derived data,
- an independent implementation that finds the spec underspecified,
- a privacy or metadata leakage analysis,
- a conformance fixture.

## Design-change process

Until an RFC process is introduced, substantial changes should include:

1. Problem statement
2. Actors/resources affected
3. Proposed semantics
4. Security/privacy consequences
5. Backwards-compatibility effect
6. At least one positive and negative example

## Normative language

Normative specifications should use RFC-style **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** intentionally. Design notes should avoid pretending unresolved behavior is normative.

## Project boundaries

Contributions intended primarily for surveillance, social scoring, behavioral advertising, or cross-user profiling are out of scope.
