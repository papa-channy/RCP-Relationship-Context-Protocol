# RCP Core v0.1 — Clean-Room Implementer Guide

> **Status:** preserved experimental guidance for the v0.1 baseline.
>
> RCP is currently refactoring toward a transport-independent v0.2 semantic Core. This guide remains valid for reproducing and independently testing the **v0.1** contract, but v0.1 is no longer the active target for new protocol-scope decisions.

For the active direction, read:

- [`../spec/core-v0.2-draft.md`](../spec/core-v0.2-draft.md)
- [`standards-boundary.md`](./standards-boundary.md)
- [Issue #23](https://github.com/papa-channy/RCP-Relationship-Context-Protocol/issues/23)

Do not claim that passing the v0.1 harness establishes compatibility with the future v0.2 semantic Core.

## 1. Purpose of this guide

This document is for developers who want to implement the preserved RCP v0.1 contract **without copying or importing the reference implementation**.

A clean-room v0.1 implementation remains useful evidence for understanding ambiguities in the historical baseline, but the project should avoid treating new v0.1 Provider implementations as a substitute for validating the redesigned v0.2 semantic model.

## 2. What is normative for v0.1?

Implementers should treat the following as the v0.1 normative draft surface:

1. [`../spec/core-v0.1.md`](../spec/core-v0.1.md)
2. JSON Schemas in [`../spec/schemas/`](../spec/schemas/)
3. experimental normative profiles in [`../spec/profiles/`](../spec/profiles/)
4. registries in [`../spec/registries/`](../spec/registries/)

The current experimental profiles include:

- SecureEnvelope authorization binding;
- JOSE cryptographic representation;
- context-selection/privacy boundaries.

When prose and schema differ, the stricter normative requirement governs until the inconsistency is fixed.

## 3. What is not v0.1 Core?

The following are reference or test infrastructure, not mandatory architecture:

- `reference-ecosystem/`;
- the Node reference Provider runtime;
- the reference control-plane HTTP routes;
- the opaque relay implementation;
- the M2 relationship brief shape;
- the external black-box harness HTTP profile.

An implementation may use another language, transport, storage model, topology, or no centralized service at all.

## 4. v0.1 wire surface

A v0.1 implementation should correctly handle the objects relevant to its role:

- `IdentityClaim`
- `ProviderCapability`
- `PermissionRequest`
- `PermissionDecision`
- `ContextAssertion`
- `SecureEnvelope`
- `RevocationEvent`

All carry:

```json
{"rcp_version":"0.1"}
```

Unsupported versions must fail closed rather than being silently coerced.

## 5. Provider implementation checklist

A v0.1 Provider should:

- expose or otherwise communicate `ProviderCapability`;
- evaluate permission before protected retrieval;
- keep capability support distinct from permission;
- treat `deny`, `unknown`, and unresolved `conditional` as non-executable;
- bind executable decisions to the request and material dependencies;
- reject stale decisions;
- enforce representation boundaries;
- preserve restrictions when deriving context;
- use the selected SecureEnvelope profile when claiming it;
- make revocation observable and fail closed for affected future operations.

A Provider must not trust arbitrary caller-supplied JSON merely because it says `"decision":"allow"`.

## 6. Consumer implementation checklist

A v0.1 Consumer should:

- distinguish logical people/relationships from provider-local identities;
- avoid cross-tenant global identity promotion by default;
- avoid sensitive automatic merge on ambiguous identity evidence;
- obtain/validate authorization before protected retrieval;
- validate SecureEnvelope authenticity and authorization-scope binding;
- preserve epistemic distinctions;
- retain provenance on persistent derived context;
- recompute/restrict/invalidate downstream context when material sources change;
- avoid granting source access because a derived child is readable.

## 7. SecureEnvelope profile

The preserved experimental profile identifier is:

```text
rcp-jose-x25519-a256gcm-ed25519-v0.1
```

Read [`../spec/profiles/crypto-jose-v0.1.md`](../spec/profiles/crypto-jose-v0.1.md).

The profile uses established JOSE/JCS primitives, but passing its conformance tests does not imply independent security review or v0.2 adoption.

## 8. Identity and derivation boundaries

v0.1 does not define a universal global identity graph.

Minimum safe behavior includes:

- tenant/user scoped identity links;
- no automatic sensitive merge from `probable` / `possible` evidence;
- no positive merge from `conflicted` / `rejected` evidence;
- explicit local user confirmation as a valid positive case.

Derived relationship context must retain enough provenance/policy dependency for revocation, reevaluation, deletion/retention, and explanation where permitted.

A readable derived assertion does not imply access to its restricted source.

## 9. Clean-room v0.1 process

1. Read only `/spec`, this guide, and `/conformance` documentation/fixtures.
2. Do not copy source from `/reference-ecosystem` or existing implementation probes.
3. Implement the v0.1 objects/profile relevant to your role.
4. Run the structural/semantic conformance suites.
5. If implementing the external Provider harness profile, run it against your Provider as a separate process.
6. Record failures/ambiguities before inspecting reference code.
7. Submit an independent implementation report.

If the specification is insufficient and reference code is required to guess behavior, record that as a specification defect.

## 10. Existing v0.1 conformance suites

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

External Provider harness:

[`../conformance/external/provider-harness-profile-v0.1.md`](../conformance/external/provider-harness-profile-v0.1.md)

## 11. What counts as an independent v0.1 implementation?

An implementation should only be described as independent when:

- it was written without using reference implementation source for behavioral decisions;
- it does not import RCP reference runtime modules;
- behavior is derived from public spec/profiles/schemas/conformance documentation;
- language/library choices are independently selected;
- ambiguities are reported rather than silently patched from reference behavior.

Using standard JOSE, JSON Schema, HTTP, or cryptographic libraries is expected.

## 12. Claims and migration warning

Passing schemas alone means structural compatibility with v0.1.

Passing semantic suites means compatibility with tested v0.1 semantics.

Passing the external harness means compatibility with that v0.1 test binding/profile.

None of these imply:

- v0.2 semantic-Core compatibility;
- production readiness;
- independent security certification;
- universal RCP interoperability.

New external implementation efforts should wait for a stable enough v0.2 semantic target unless the explicit goal is to audit the preserved v0.1 baseline.
