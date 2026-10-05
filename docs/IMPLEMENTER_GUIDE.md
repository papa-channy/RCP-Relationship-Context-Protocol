# RCP Core v0.1 — Clean-Room Implementer Guide

> Status: experimental implementer guidance for RCP Core v0.1. This guide is not itself a standards claim.

This document is for developers who want to implement RCP **without copying or importing the reference implementation**.

The most useful external validation for RCP is not another wrapper around the existing code. It is an implementation that reaches compatible protocol-visible behavior from the public specification alone.

## 1. What is normative?

For Core v0.1, implementers should treat the following as the current normative draft surface:

1. [`../spec/core-v0.1.md`](../spec/core-v0.1.md)
2. JSON Schemas in [`../spec/schemas/`](../spec/schemas/)
3. experimental normative profiles in [`../spec/profiles/`](../spec/profiles/)
4. registries in [`../spec/registries/`](../spec/registries/)

The current experimental profiles include:

- SecureEnvelope authorization binding;
- JOSE cryptographic representation;
- context-selection/privacy boundaries.

When prose and schema differ, the stricter normative requirement governs until the inconsistency is fixed.

## 2. What is not Core?

The following are **reference or test infrastructure**, not mandatory RCP architecture:

- `reference-ecosystem/`
- the Node reference provider runtime;
- the reference control-plane HTTP routes;
- the demo opaque relay implementation;
- the M2 relationship brief UI/data shape;
- the external black-box harness HTTP profile in `conformance/external/`.

An RCP implementation may use Rust, Go, Java, Python, Swift, Kotlin, another transport, another storage model, or no centralized server at all.

Conformance is about protocol-visible semantics and the chosen interoperability profile, not reproducing the reference repository layout.

## 3. Minimum Core objects

A Core v0.1 implementation should be able to parse, validate, emit, or otherwise correctly handle the objects relevant to its role:

- `IdentityClaim`
- `ProviderCapability`
- `PermissionRequest`
- `PermissionDecision`
- `ContextAssertion`
- `SecureEnvelope`
- `RevocationEvent`

All Core v0.1 wire objects carry:

```json
{"rcp_version":"0.1"}
```

Unsupported versions must fail closed rather than being silently coerced.

## 4. Provider implementation checklist

A Provider implementation should, at minimum:

- expose or otherwise communicate a `ProviderCapability`;
- evaluate permissions before protected retrieval;
- keep capability support distinct from permission;
- treat `deny`, `unknown`, and unresolved `conditional` decisions as non-executable;
- bind an executable decision to the request and material policy/capability dependencies that produced it;
- reject stale decisions when a material dependency changes;
- enforce representation boundaries (`content`, `provider_context`, metadata, etc.);
- preserve restrictions when deriving context;
- use the selected SecureEnvelope profile when claiming that profile;
- make revocation observable and fail closed for affected future operations.

A Provider must not rely on a caller merely presenting JSON that says `"decision":"allow"`. The Provider must have a trustworthy way to know the decision was validly issued for that request.

## 5. Consumer implementation checklist

A Consumer implementation should, at minimum:

- distinguish logical people/relationships from provider-local identities;
- avoid cross-tenant global identity promotion by default;
- require stronger evidence or explicit confirmation before merging ambiguous identities;
- build or receive authorization before protected retrieval;
- validate SecureEnvelope cryptographic authenticity **and** authorization-scope binding;
- treat source statements, observations, interpretations, and inferences as different epistemic classes;
- retain provenance on persistent derived context;
- recompute, restrict, invalidate, or revoke downstream context when source authorization changes;
- avoid granting source access merely because a derived child is readable.

## 6. SecureEnvelope profile

The first concrete profile identifier is:

```text
rcp-jose-x25519-a256gcm-ed25519-v0.1
```

Read [`../spec/profiles/crypto-jose-v0.1.md`](../spec/profiles/crypto-jose-v0.1.md) before implementing it.

The profile deliberately uses established JOSE/JCS primitives rather than custom cryptography. Passing the current conformance tests does **not** mean the profile has completed independent security review.

Do not infer extra cryptographic requirements from the Node reference code. If a requirement is necessary for interoperability, it belongs in the profile document or conformance material.

## 7. Identity resolution

RCP does not define a universal global identity graph in Core v0.1.

Minimum safe behavior is defined by boundaries:

- identity links are tenant/user scoped by default;
- `probable` / `possible` evidence does not independently justify sensitive automatic merging;
- `conflicted` / `rejected` evidence cannot authorize a merge;
- explicit same-tenant user confirmation is a valid local positive case;
- a provider-local identifier may map to a logical person without exposing that mapping globally.

The M2 reference ecosystem demonstrates one possible local resolver. It is not the required RCP algorithm.

## 8. Derived data and provenance

Do not treat transformation as policy laundering.

If restricted source data becomes a summary, embedding, assertion, inference, or materialized view, the derived object must retain sufficient policy/provenance dependency for:

- permission reevaluation;
- revocation impact analysis;
- deletion/retention handling;
- explanation/audit where permitted.

A readable derived object does not imply that the consumer can retrieve its restricted source.

## 9. Clean-room implementation process

Recommended process for an independent implementation:

1. Clone or download the repository.
2. Read only:
   - `/spec`
   - this implementer guide
   - `/conformance` documentation/fixtures
3. Do **not** copy source from `/reference-ecosystem` or existing implementation probes.
4. Implement the Core objects/profile relevant to your Provider or Consumer.
5. Run the structural/semantic conformance suites.
6. If implementing the experimental Provider Interop Harness Profile, start your implementation as a separate process and run the black-box harness against it.
7. Record failures and ambiguities before inspecting the reference implementation.
8. Submit an independent implementation report.

If the specification is insufficient and you need to inspect reference code to guess required behavior, record that as a **specification defect**. That result is useful to RCP.

## 10. Existing local conformance suites

Core schema/semantic tests:

```bash
python -m pip install -r conformance/requirements.txt
python conformance/run.py
python conformance/boundary_checks.py
```

JOSE profile tests:

```bash
npm install --prefix conformance/crypto
npm test --prefix conformance/crypto
```

The black-box external Provider harness is documented separately in:

[`../conformance/external/provider-harness-profile-v0.1.md`](../conformance/external/provider-harness-profile-v0.1.md)

## 11. What counts as an independent implementation?

For RCP project reporting, an implementation should only be described as independent when:

- it was written by a person/team not relying on the RCP reference implementation source for behavioral decisions;
- it does not import RCP reference implementation runtime modules;
- protocol behavior is derived from public spec/profiles/schemas/conformance documentation;
- language/library choices are independently selected;
- deviations and ambiguities are reported rather than silently patched from reference behavior.

Using standard third-party JOSE, JSON Schema, HTTP, or cryptographic libraries is expected and does not make the implementation non-independent.

## 12. Claims

Passing schemas alone means only structural compatibility.

Passing the semantic suite means compatibility with the tested semantics.

Passing the external harness means compatibility with that **test transport/profile**, not universal RCP compatibility.

A production-grade interoperability or security claim requires independent implementation evidence and independent review beyond the current repository-maintained tests.
