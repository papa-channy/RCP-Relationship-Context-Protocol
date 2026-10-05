# RCP Core Permission Reason Codes v0.1

> Status: Experimental registry for RCP Core v0.1.

Reason codes explain why a `PermissionDecision` was produced. They are machine-readable diagnostic semantics, not user-facing legal conclusions.

A reason code MUST NOT be interpreted as authorization by itself.

## Registered reason codes

### Capability and provider state

| Code | Meaning |
| --- | --- |
| `capability_denied` | Required provider capability is explicitly unavailable. |
| `capability_limited` | Required provider capability exists only under unresolved limitations. |
| `capability_unknown` | Required provider capability is unknown or unavailable to the evaluator. |
| `capability_stale` | The capability manifest is too old or has been superseded. |
| `provider_policy_denied` | Provider policy forbids the requested operation. |
| `provider_policy_unknown` | Provider policy is not sufficiently known to permit execution. |

### User and delegated authority

| Code | Meaning |
| --- | --- |
| `user_grant_missing` | Required user authorization has not been granted. |
| `user_grant_revoked` | Previously available user authorization has been revoked. |
| `delegation_missing` | Requester access exists but delegated execution authority does not. |
| `reauthentication_required` | A fresh user authentication or grant is required before reevaluation. |

### Organization and counterparty constraints

| Code | Meaning |
| --- | --- |
| `organization_policy_denied` | Applicable organization policy forbids the requested operation. |
| `organization_policy_unknown` | Applicable organization policy cannot be determined. |
| `counterparty_restricted` | A valid counterparty restriction forbids the requested operation. |
| `counterparty_policy_unknown` | Counterparty restriction state is relevant but unresolved. |

### Purpose, destination, and processing environment

| Code | Meaning |
| --- | --- |
| `purpose_not_allowed` | Requested purpose is outside the allowed purposes. |
| `purpose_unknown` | Purpose is missing, ambiguous, or cannot be evaluated. |
| `destination_not_allowed` | Requested destination is prohibited. |
| `destination_unknown` | Destination is required for evaluation but unresolved. |
| `processing_location_not_allowed` | Requested processing location is prohibited. |
| `processing_location_unknown` | Processing location is required for evaluation but unresolved. |

### Resource and identity state

| Code | Meaning |
| --- | --- |
| `resource_unknown` | Protected resource or resource scope cannot be resolved. |
| `resource_restricted` | Resource classification or policy forbids the operation. |
| `identity_ambiguous` | Identity resolution is insufficient for the requested operation. |
| `identity_conflicted` | Conflicting identity evidence prevents safe execution. |
| `classification_unknown` | Data classification is required but unresolved. |
| `sensitivity_restricted` | Sensitivity rules prohibit the operation. |
| `confidentiality_restricted` | Confidentiality rules prohibit the operation. |

### Legal/policy basis

| Code | Meaning |
| --- | --- |
| `legal_basis_unknown` | A required legal/policy basis cannot be established. |
| `legal_basis_invalid` | A previously relied-upon basis is no longer valid. |
| `policy_stale` | A policy snapshot used by the request is no longer current. |

### Decision lifecycle and integrity

| Code | Meaning |
| --- | --- |
| `decision_expired` | A prior decision has passed its expiry time. |
| `decision_stale` | A material decision input changed after evaluation. |
| `condition_unsatisfied` | One or more required conditions remain unsatisfied. |
| `provenance_missing` | Required provenance for persistent or derived context is absent. |
| `crypto_profile_unsupported` | Required cryptographic profile is unsupported. |
| `integrity_verification_failed` | Signature, digest, or equivalent integrity verification failed. |
| `security_blocked` | A security policy or incident response rule blocks execution. |
| `insufficient_context` | Evaluator lacks enough information to produce `allow` or a more specific denial. |

## Registered condition codes

`required_conditions` on a `conditional` decision SHOULD use these values where applicable:

- `require_user_confirmation`
- `require_reauthentication`
- `require_on_device_processing`
- `require_provider_side_processing`
- `require_redaction`
- `require_attestation`
- `require_organization_approval`
- `require_fresh_capability_manifest`
- `require_fresh_policy_snapshot`
- `require_identity_confirmation`

A `conditional` decision MUST contain at least one condition.

## Extension reason codes

Implementations MAY emit namespaced extension codes using:

```text
x-<namespace>:<code>
```

Example:

```text
x-example.com:regional_contract_missing
```

Consumers MUST NOT treat an unknown extension reason or condition code as satisfying authorization. Unknown codes MAY be preserved for diagnostics.
