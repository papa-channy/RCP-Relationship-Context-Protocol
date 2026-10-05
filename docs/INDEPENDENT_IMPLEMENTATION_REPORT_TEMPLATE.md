# RCP Independent Implementation Report Template

> Use this template only for an implementation developed independently from the RCP reference runtime. A submitted report is evidence, not automatic certification.

## 1. Implementation identity

- **Implementation name:**
- **Version / commit:**
- **Repository URL:**
- **Implementer(s):**
- **Date tested:**
- **Role:** Provider / Consumer / Relay / multiple
- **Language/runtime:**
- **Major protocol/crypto libraries:**

## 2. Independence statement

Describe how the implementation was developed.

- Did the implementer read `/reference-ecosystem` source before the first interoperability attempt?
- Does the implementation import or copy RCP reference runtime code?
- Which public RCP documents were used?
- Which behaviors, if any, required looking at reference code because the specification was insufficient?

Suggested declaration:

> This implementation was developed from the public RCP specification, schemas, profiles, registries, and conformance documentation. It does not import the RCP reference implementation runtime. Any point where reference code was consulted is disclosed below as a specification ambiguity or deviation.

## 3. Specification inputs

List exact versions/commits of:

- `spec/core-v0.1.md`
- relevant `spec/profiles/*`
- relevant `spec/registries/*`
- JSON Schemas
- `docs/IMPLEMENTER_GUIDE.md`
- conformance harness/profile documentation

## 4. Supported protocol surface

Mark each item:

| Object / profile | Implemented | Notes |
| --- | --- | --- |
| IdentityClaim | yes/no/partial | |
| ProviderCapability | yes/no/partial | |
| PermissionRequest | yes/no/partial | |
| PermissionDecision | yes/no/partial | |
| ContextAssertion | yes/no/partial | |
| SecureEnvelope | yes/no/partial | |
| RevocationEvent | yes/no/partial | |
| SecureEnvelope authorization binding profile | yes/no/partial | |
| JOSE crypto profile | yes/no/partial | |
| Context-selection boundary profile | yes/no/partial | |
| External Provider Interop Harness Profile | yes/no/not applicable | |

## 5. Conformance results

### Core schema / semantic suite

- Commit tested:
- Command(s):
- Result:
- Report/log URL or attachment:

### Crypto interoperability

- JOSE/JCS libraries:
- Result:
- Known deviations:

### External black-box harness

- Provider URL used locally:
- `RCP_TEST_PROVIDER_SUBJECT` fixture description:
- Harness report file:
- Harness report SHA-256:
- Overall result:

Attach the generated JSON report when possible.

## 6. Test cases that failed or required interpretation

For each case:

- test / requirement;
- observed behavior;
- expected behavior;
- whether this is believed to be an implementation defect, spec defect, harness defect, or unresolved ambiguity.

Do not hide failures to obtain a passing-looking report. Ambiguities are a primary output of independent implementation work.

## 7. Specification ambiguities discovered

List every place where two reasonable implementers could reach different behavior from the current public spec.

Suggested fields:

- document / section;
- ambiguous text;
- implementation choice;
- suggested clarification;
- interoperability impact.

## 8. Security / privacy observations

Report observations related to:

- authorization binding;
- decision staleness;
- identity merge/isolation;
- provenance;
- revocation;
- derived-data restrictions;
- cryptographic profile;
- key discovery/revocation;
- relay metadata leakage;
- retention/deletion;
- cross-tenant isolation.

## 9. Interoperability claim requested

Choose the narrowest accurate statement:

- [ ] Structural schema compatibility only
- [ ] Core semantic conformance suite passes
- [ ] JOSE profile interoperability demonstrated
- [ ] External Provider Harness v0.1 passes
- [ ] Independent Provider implementation demonstrated
- [ ] Independent Consumer implementation demonstrated
- [ ] Other (describe)

A report must not claim production security certification or platform adoption unless separately established.

## 10. Reproduction instructions

Provide the smallest set of commands needed for another reviewer to reproduce the implementation and test results from a clean environment.

```text
<commands>
```

## 11. Sign-off

- Implementer name / handle:
- Date:
- Report revision:
