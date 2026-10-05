# Python RCP Implementation Probe

This directory is a deliberately separate implementation probe for the experimental RCP JOSE profile.

It does **not** import the RCP Python conformance oracle and does not reuse the Node JOSE implementation. It implements the published profile using a different library stack:

- `jwcrypto`
- `rfc8785`
- the cryptography-backed Ed25519/X25519 key objects exposed by `jwcrypto`

## Purpose

The probe exists to answer a narrow M1 question:

> Can a second implementation, built from the published RCP profile rather than the existing Node implementation, produce and consume the same wire-level cryptographic envelope?

GitHub Actions tests both directions dynamically:

```text
Node producer  → RCP envelope/vector → Python consumer
Python producer → RCP envelope/vector → Node consumer
```

The exchanged vectors include test-only private recipient keys so the CI consumers can decrypt them. They are generated during CI and are not protocol examples for production key distribution.

## Status

This is an **internal second-implementation probe**, not an independent third-party implementation and not a production SDK.

Passing this probe demonstrates cross-library/cross-language interoperability for the tested profile surface. RCP still requires external implementer and security review before claiming independent ecosystem interoperability.
