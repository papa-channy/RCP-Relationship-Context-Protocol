# RCP Processing Location Registry v0.1

> Status: Experimental registry for RCP Core v0.1.

`processing_location` describes the execution boundary in which protected relationship data will be processed. It is an authorization input, not a descriptive afterthought.

## Core processing locations

| Value | Meaning |
| --- | --- |
| `provider` | Processing occurs inside the source provider's controlled environment. |
| `device` | Processing occurs on the end user's local device. |
| `consumer` | Processing occurs inside the authorized consumer application's controlled environment. |
| `relay` | Processing occurs inside an RCP-compatible relay. Relays SHOULD avoid plaintext payload access. |
| `confidential_compute` | Processing occurs inside an attested confidential-computing environment under a profile that defines the trust guarantees. |
| `third_party` | Processing occurs at an external processor that is neither the source provider nor the direct consumer. |

## Extensions

Extensions MUST use:

```text
x-<namespace>:<location>
```

Unknown locations that are material to authorization MUST result in `unknown` or `deny`, not optimistic execution.

## Important distinction

Processing location does not define destination. A consumer may store data in one destination while processing it in another environment. Both inputs must be evaluated where relevant.
