# Contributing to RCP

RCP is experimental. The project currently values **counterexamples, independent implementations, security/privacy findings, and interoperability failures** more than feature expansion.

## High-value contributions

Especially useful contributions include:

- a rights conflict not representable by the current model;
- an identity-resolution ambiguity;
- a policy combination with no deterministic outcome;
- a revocation case that leaves stale derived data;
- an independent implementation that finds the spec underspecified;
- a privacy or metadata leakage analysis;
- a cryptographic/interoperability finding;
- a positive or negative conformance fixture.

## Clean-room interoperability contributions

The highest-priority contribution is currently an unrelated clean-room Provider or Consumer implementation.

For Provider work, start with:

1. [`spec/core-v0.1.md`](./spec/core-v0.1.md)
2. applicable files under [`spec/profiles/`](./spec/profiles/)
3. [`spec/registries/`](./spec/registries/)
4. [`spec/schemas/`](./spec/schemas/)
5. [`docs/IMPLEMENTER_GUIDE.md`](./docs/IMPLEMENTER_GUIDE.md)
6. the non-normative [`conformance/external/provider-harness-profile-v0.1.md`](./conformance/external/provider-harness-profile-v0.1.md) only when you are ready to expose the black-box test transport

### Independence rule

If the goal is to count as independent interoperability evidence:

- do **not** import `/reference-ecosystem` as a library;
- do **not** copy its permission engine, Provider runtime, or SecureEnvelope implementation into the new implementation;
- do **not** rely on undocumented behavior observed only by reading the reference source;
- document any point where the specification was insufficient and reference behavior had to be consulted.

Reading the public README, specification, schemas, profiles, registries, implementer guide, and harness profile is expected. The reference ecosystem may be used **afterward for comparison/debugging**, but that should be disclosed in the implementation report.

A different programming language is welcome but not mandatory. Independent design decisions are more important than language diversity.

### Run the external Provider harness

```bash
npm install --prefix conformance/external

RCP_PROVIDER_URL=http://127.0.0.1:9001 \
RCP_TEST_PROVIDER_SUBJECT=<provider-local-subject> \
RCP_IMPLEMENTATION_NAME=<name> \
RCP_IMPLEMENTATION_VERSION=<version> \
RCP_IMPLEMENTATION_LANGUAGE=<language> \
RCP_CONFORMANCE_REPORT=./provider-report.json \
npm run provider --prefix conformance/external
```

Submit:

- the implementation source or reproducible artifact;
- reproduction instructions;
- `provider-report.json`;
- a completed [`docs/INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md`](./docs/INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md);
- any discovered ambiguities or deviations.

Track the first clean-room validation under [M4 / Issue #19](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/19).

## How to report an interoperability failure

Please classify failures when possible:

1. **implementation defect** — a clear normative requirement was implemented incorrectly;
2. **spec ambiguity** — multiple reasonable implementations can disagree;
3. **schema/prose mismatch** — structural and normative requirements diverge;
4. **harness assumption** — the test transport assumes behavior Core does not require;
5. **profile gap** — an interoperability surface is underspecified;
6. **security/privacy concern** — behavior interoperates but is unsafe or leaks more than expected.

A failure that exposes an ambiguity is valuable even when no code fix is ready.

## Security and privacy contributions

Use [`docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md`](./docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md) as a review aid for protocol/deployment boundaries such as:

- permission-before-retrieval;
- identity isolation;
- derived-data restriction inheritance;
- revocation and policy drift;
- JOSE/key handling;
- operator-blind relay metadata;
- organization-managed data boundaries;
- logs, telemetry, backups, and admin tooling.

Sensitive vulnerability reports should follow [`SECURITY.md`](./SECURITY.md) rather than being posted publicly before remediation.

## Design-change process

RCP does not yet operate a mature formal standards process. Until external participation is large enough to justify one, substantial protocol changes should include:

1. Problem statement
2. Actors/resources affected
3. Proposed semantics
4. Security/privacy consequences
5. Rights/policy consequences
6. Backwards-compatibility effect
7. At least one positive example
8. At least one negative/adversarial example
9. Conformance impact
10. Alternatives considered

The reserved RFC format is described in [`rfcs/README.md`](./rfcs/README.md).

## Normative language

Normative specifications should use RFC-style **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** intentionally. Design notes, issues, and reference implementation behavior should not pretend unresolved behavior is normative.

A reference implementation behavior that is not required by `/spec` is not automatically part of RCP Core.

## Project boundaries

Contributions intended primarily for surveillance, social scoring, behavioral advertising, covert manipulation, data brokerage, or cross-user profiling are out of scope.

RCP also will not accept bridges whose primary mechanism is bypassing a platform's access controls, scraping closed private data without authorization, or converting UI access into an assumed right to export/process data elsewhere.

## What successful contribution looks like

A strong contribution should make at least one of these things true:

- two independent implementations agree where they previously disagreed;
- a protocol ambiguity becomes an explicit rule;
- a rights/privacy boundary becomes harder to violate accidentally;
- an unsafe behavior becomes a failing conformance case;
- a reference-only assumption is removed from the normative contract;
- reviewers can reproduce the result without trusting the original author's environment.
