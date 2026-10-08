# RCP v0.2 Independent Implementation Report Template

> Use this template for an implementation developed independently from the RCP author-written v0.2 semantic validator and reference runtime. A completed report is interoperability evidence for a bounded tested surface, not certification.

## 1. Implementation identity

- **Implementation name:**
- **Implementation version / commit:**
- **Repository URL / artifact:**
- **Implementer(s):**
- **Date tested:**
- **Language/runtime:**
- **Major validation/schema/protocol libraries:**
- **Adapter command used by the harness:**

## 2. RCP revision

- **Exact RCP commit/tag tested:**
- **`rcp_version` implemented:** `0.2-draft`
- **Public case-pack version:**
- **Harness contract version:**

## 3. Clean-room declaration

List every RCP project document used during implementation.

Confirm each item:

- [ ] implementation was built from the allowed v0.2 specification/conformance documents;
- [ ] implementation does not import RCP `conformance/v0_2/run.py`;
- [ ] implementation does not import RCP `conformance/v0_2/run_wire.py`;
- [ ] implementation does not import RCP `conformance/v0_2/normalize_wire.py`;
- [ ] implementation does not import/copy `bindings/v0_2/` implementation logic;
- [ ] implementation does not import/copy `reference-ecosystem/` runtime logic;
- [ ] any accidental or necessary consultation of prohibited reference code is disclosed below.

Suggested declaration:

> This implementation was developed from the published RCP v0.2 draft specification, schema, standards-boundary material, semantic scenarios, and clean-room harness contract. It does not import or copy the RCP author-written semantic oracle or reference runtime. Any exception is explicitly disclosed in this report and should disqualify or narrow the clean-room claim as appropriate.

## 4. Implemented semantic surface

| Semantic behavior | Implemented | Notes |
| --- | --- | --- |
| `ContextAssertion` structural validation | yes/no/partial | |
| bilateral/group relationship scope | yes/no/partial | |
| fail-closed unknown material scope | yes/no/partial | |
| source vs target participant projection | yes/no/partial | |
| `projection_basis_ref` rule | yes/no/partial | |
| epistemic classes | yes/no/partial | |
| `verified_fact` basis resolution | yes/no/partial | |
| dependency integrity | yes/no/partial | |
| material dependency semantics | yes/no/partial | |
| independent `support_sets` | yes/no/partial | |
| material identity dependencies | yes/no/partial | |
| material policy dependencies | yes/no/partial | |
| assertion relation checks | yes/no/partial | |
| required-extension fail-closed behavior | yes/no/partial | |
| semantic digest projection for harness | yes/no/partial | test-only |

## 5. Public black-box harness result

- **Command:**
- **Report path / URL:**
- **Report SHA-256:**
- **Total cases:**
- **Passed:**
- **Failed:**
- **Overall result:**

Attach the JSON report when possible.

## 6. Held-out / reviewer-controlled result

- **Reviewer / case-pack owner:**
- **Case-pack identifier or hash:**
- **Was the case pack unseen before implementation freeze?** yes/no
- **Command:**
- **Report path / URL:**
- **Passed / failed:**

If no held-out run was performed, state that explicitly. Public-fixture-only evidence is weaker than reviewer-controlled evidence.

## 7. Binding tested, if any

The base semantic harness does not require a network binding.

If an actual binding was tested, describe:

- binding: MCP / HTTP / A2A / provider-native / other;
- server/client libraries;
- how the RCP assertion was extracted from transport framing;
- whether semantic output matched the standalone evaluator;
- authentication/authorization assumptions;
- known deviations.

## 8. Failures or interpretation points

For every failed or disputed case, record:

- case / requirement;
- observed behavior;
- expected behavior;
- implementer's reading of the spec;
- classification;
- proposed resolution.

Allowed classifications:

1. `implementation_defect`
2. `spec_ambiguity`
3. `schema_prose_mismatch`
4. `harness_assumption`
5. `standards_overlap`
6. `profile_or_binding_gap`
7. `security_or_privacy_concern`

Do not suppress failures to obtain a passing-looking report.

## 9. Specification ambiguities discovered

For each ambiguity:

- document / section;
- competing reasonable interpretations;
- implementation choice;
- interoperability impact;
- suggested wording or test.

## 10. Standards-overlap findings

This section is especially important for v0.2.

For any RCP field/rule that appears duplicative of MCP, AuthZEN, Shared Signals, PROV, ODRL/DPV, ActivityStreams, Solid, AT Protocol, Dataspace Protocol, or another mature standard:

- RCP concept;
- existing standard / section;
- whether the existing standard determines the same behavior;
- what RCP-specific residue, if any, remains;
- recommendation: keep / profile-map / move to binding / remove.

A finding that RCP should shrink is a successful review outcome, not a failed contribution.

## 11. Security/privacy observations

Review at least:

- unsafe group-to-bilateral projection;
- cross-tenant identity correlation;
- epistemic laundering;
- evidence/provenance leakage;
- incorrect support-set treatment;
- policy/restriction laundering;
- conflict/supersession abuse;
- required-extension downgrade behavior;
- opaque provenance misuse;
- dependency-graph amplification / denial-of-service risk.

## 12. Reproduction instructions

Provide commands from a clean environment:

```text
<clone/build commands>
<adapter command>
<harness command>
```

List any environment variables, fixtures, or external services required.

## 13. Claim supported by this report

Select only claims actually demonstrated:

- [ ] independent structural compatibility for tested `ContextAssertion` cases
- [ ] independent semantic compatibility for tested public cases
- [ ] independent semantic compatibility for reviewer-controlled held-out cases
- [ ] one concrete binding interoperability result
- [ ] standards-overlap findings reported
- [ ] security/privacy observations reported

Do **not** claim from this report alone:

- production security certification;
- legal compliance;
- all-provider interoperability;
- all-binding interoperability;
- external platform adoption;
- stable/final v0.2;
- standards-body endorsement.

## 14. Sign-off

- **Implementer name / handle:**
- **Date:**
- **Report revision:**
- **Clean-room declaration confirmed:** yes/no
