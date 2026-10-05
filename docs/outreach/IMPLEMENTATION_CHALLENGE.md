# RCP Clean-Room Provider Implementation Challenge

## Objective

Build a minimal RCP Provider implementation from the specification and implementer materials **without importing or copying the RCP reference runtime**, then run the public black-box Provider harness against it.

The goal is to test the specification, not the implementer.

A harness failure that exposes ambiguity or an undocumented assumption is a valuable result.

## Allowed input set

Use these materials:

1. [`../../spec/core-v0.1.md`](../../spec/core-v0.1.md)
2. applicable files under [`../../spec/profiles/`](../../spec/profiles/)
3. registries under [`../../spec/registries/`](../../spec/registries/)
4. JSON Schemas under [`../../spec/schemas/`](../../spec/schemas/)
5. [`../IMPLEMENTER_GUIDE.md`](../IMPLEMENTER_GUIDE.md)
6. [`../../conformance/external/provider-harness-profile-v0.1.md`](../../conformance/external/provider-harness-profile-v0.1.md) for the non-normative HTTP test binding

Do not use `/reference-ecosystem` as a library and do not copy its permission, Provider runtime, or cryptographic implementation logic.

Looking at repository structure or public issue discussions is fine, but if a behavior is only discoverable by reading reference code, record that as a specification gap rather than copying it.

## Strongly preferred implementation shape

A separate repository or otherwise isolated codebase is preferred.

A different language/runtime from the current JavaScript reference is useful, for example:

- Rust;
- Go;
- Java/Kotlin;
- C#;
- Python;
- Swift.

Different language is not itself proof of independence; independent implementation decisions matter more.

## Minimum behavior under test

The initial external Provider harness expects the experimental test transport profile to support:

- capability discovery;
- Provider signing-key discovery;
- permission evaluation;
- rejection of a forged decision;
- rejection of a mutated request replay;
- rejection of representation mismatch;
- protected retrieval only after a valid Provider-issued allow;
- signed + encrypted `SecureEnvelope` delivery;
- authorization-scope binding;
- JOSE profile interoperability for the tested profile.

The harness profile is **not** the normative Core transport. If the harness requires behavior that the Core/profile does not justify, report a `harness assumption` rather than modifying your implementation merely to satisfy it.

## Run the harness

Install the harness dependencies:

```bash
npm install --prefix conformance/external
```

Start your Provider, then run:

```bash
RCP_PROVIDER_URL=http://127.0.0.1:9001 \
RCP_TEST_PROVIDER_SUBJECT=<provider-local-subject> \
RCP_IMPLEMENTATION_NAME=<implementation-name> \
RCP_IMPLEMENTATION_VERSION=<version> \
RCP_IMPLEMENTATION_LANGUAGE=<language/runtime> \
RCP_CONFORMANCE_REPORT=./provider-report.json \
npm run provider --prefix conformance/external
```

A successful run creates a machine-readable report.

## What to submit

Please provide:

- source repository or reproducible source archive;
- exact RCP commit/tag used;
- language/runtime;
- protocol, JOSE, canonicalization, and crypto libraries used;
- startup/reproduction instructions;
- generated black-box harness report;
- completed [`../INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md`](../INDEPENDENT_IMPLEMENTATION_REPORT_TEMPLATE.md);
- every ambiguity or undocumented assumption you encountered.

## Failure classification

Please classify each failure as one of:

1. **Implementation defect** — a clear normative requirement was implemented incorrectly.
2. **Spec ambiguity** — multiple reasonable readings lead to different behavior.
3. **Schema/prose mismatch** — machine-readable and prose constraints diverge.
4. **Harness assumption** — the non-normative HTTP harness demands behavior not justified by Core/profile semantics.
5. **Profile gap** — the profile lacks enough detail for two implementations to interoperate.
6. **Security/privacy concern** — interoperability works, but the required behavior appears unsafe.

## Useful failure examples

The following are more valuable than silently working around the issue:

- two reasonable resource identifier encodings produce incompatible behavior;
- expiry or policy-version semantics are underspecified;
- clear envelope metadata creates unexpected privacy leakage;
- a JOSE detail works in one library but cannot be represented safely in another;
- Provider capability semantics do not tell the planner enough to select a representation;
- the permission object cannot represent a legitimate organization restriction;
- the spec permits a replay that the intended threat model assumes is blocked.

## What counts as success

For M4, success requires at least one unrelated clean-room implementation to complete the applicable black-box flow with a reproducible report, after any discovered protocol defects are classified and resolved.

This does not certify RCP or the implementation for production use.
