# RCP Purpose Registry v0.1

> Status: Experimental registry for RCP Core v0.1.

`purpose` expresses why a protected operation is requested. Purpose is a first-class authorization input: a technically supported action MUST NOT execute merely because the resource is accessible.

## Core purposes

| Purpose | Meaning |
| --- | --- |
| `relationship_memory` | Maintain user-authorized long-term relationship memory. |
| `meeting_preparation` | Prepare the user for an upcoming interaction or meeting. |
| `followup_assistance` | Help the user complete or remember a follow-up. |
| `personal_search` | Retrieve relationship context in response to the user's own search/query. |
| `identity_resolution` | Resolve whether provider-specific identities refer to the same relationship subject. |
| `service_security` | Perform security, abuse-prevention, or integrity checks necessary to operate the protocol. |
| `service_operations` | Operate the protocol infrastructure without using content for unrelated secondary purposes. |
| `evaluation` | Evaluate system quality under a separately authorized evaluation policy. |
| `model_training` | Use data to train or improve a model beyond the immediate user-authorized operation. This purpose requires independent authorization and is not implied by any other purpose. |
| `advertising` | Use relationship context for advertising or ad targeting. This is high-risk and denied by default by the RCP reference policy. |
| `employee_monitoring` | Use relationship context to monitor or assess employees. High-risk and denied by default by the RCP reference policy. |
| `credit_scoring` | Use relationship context for creditworthiness or financial scoring. High-risk and denied by default by the RCP reference policy. |
| `data_brokerage` | Sell, trade, or aggregate relationship context as a data-broker product. Denied by default. |
| `surveillance` | Covert or generalized monitoring of people or relationships. Denied by default. |

## Extension purposes

Extensions MUST use:

```text
x-<namespace>:<purpose>
```

Unknown extension purposes MUST NOT be silently mapped to a broader Core purpose. If a policy evaluator cannot understand a requested purpose that matters to authorization, the result MUST be `unknown` or `deny`.

## Purpose changes

A materially different purpose requires a new permission evaluation. A prior `allow` decision MUST NOT be reused for a new purpose by relabeling the request after execution.
