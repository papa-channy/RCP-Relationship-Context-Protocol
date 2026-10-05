# Rights & Permission Model — Design Draft

RCP models permission as an action-specific decision, not as ownership or a broad account-wide consent.

## Core actions

- `DISCOVER`
- `ACCESS`
- `DELEGATE`
- `TRANSFER`
- `PROCESS`
- `DERIVE`
- `STORE`
- `DISCLOSE`
- `ACT`
- `TRAIN`

## Decision states

- `ALLOW`
- `DENY`
- `CONDITIONAL`
- `UNKNOWN`

`UNKNOWN` is blocked from execution but kept distinct from an explicit denial.

## Evaluation concept

```text
evaluate_permission(
  requester,
  executor,
  action,
  resource,
  subject,
  purpose,
  destination,
  processing_location,
  time,
  environment
) -> PermissionDecision
```

Provider capability, user authorization, legal basis, provider policy, organization policy, purpose, destination, processing location, and RCP safety rules remain distinct inputs.
