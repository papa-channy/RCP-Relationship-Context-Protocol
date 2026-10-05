# RCP Core Capability Registry v0.1

> Status: Experimental registry for RCP Core v0.1.

A capability communicates **technical support**, not authorization. A capability value of `allow` MUST NOT by itself authorize access, transfer, processing, storage, derivation, disclosure, action, or training.

## Values

Every registered capability has one of three values:

- `allow` — the provider advertises technical support.
- `deny` — the provider advertises that the capability is unavailable.
- `limited` — support exists only under additional provider-defined constraints that MUST be discovered or evaluated before use.

## Core capability names

| Capability | Meaning |
| --- | --- |
| `identity` | Provider can expose identity claims or identity-link evidence within provider policy. |
| `interaction_metadata` | Provider can expose metadata that an interaction occurred, such as participants, time, or duration. |
| `content` | Provider can expose communication or artifact content under applicable authorization. |
| `provider_context` | Provider can emit provider-generated relationship context without necessarily exposing raw content. |
| `external_processing` | Provider supports processing outside the provider boundary under some policy. This does not imply any specific destination is allowed. |
| `secure_envelope` | Provider can produce or consume an RCP SecureEnvelope under at least one documented cryptographic profile. |
| `revocation_events` | Provider can emit or consume RCP RevocationEvent objects. |
| `policy_events` | Provider can signal material policy changes that may stale prior permission decisions. |

## Extension capability names

An implementation MAY advertise extension capabilities. Extension names MUST use the following form:

```text
x-<namespace>:<name>
```

Examples:

```text
x-example.com:calendar_availability
x-messenger.example:ephemeral_context
```

Extension names MUST NOT redefine a Core capability. A consumer that does not understand an extension capability MUST ignore it for positive authorization decisions.

## Negotiation rule

Before requesting a protected provider operation, a consumer MUST possess a non-stale capability manifest that covers the required capability.

- `deny` → the operation MUST NOT be attempted as that capability.
- `limited` → the consumer MUST resolve the provider-defined limitation before treating the capability as technically usable.
- `allow` → the consumer MAY proceed to permission evaluation. It MUST NOT skip permission evaluation.

## Versioning

`capability_version` identifies the provider's capability-manifest version, not the RCP protocol version. A provider SHOULD change it whenever a material capability interpretation changes.
