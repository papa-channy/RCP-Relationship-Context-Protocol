# Security Policy

RCP is currently an experimental design and reference project. It is **not production-ready**.

## Sensitive areas

Security review should assume that even without plaintext payload access, the following may be sensitive:

- identity links,
- interaction metadata,
- relationship identifiers,
- routing metadata,
- provenance graphs,
- policy state,
- revocation history.

## Design expectations

Implementations should aim for:

- payload encryption independent of transport encryption,
- per-provider credential isolation,
- least-privilege authorization,
- tenant-scoped identity graphs,
- minimal metadata retention,
- authenticated capability and policy manifests,
- immutable or tamper-evident audit trails,
- revocation propagation,
- explicit protection against derived-data laundering.

## Reporting

Until a dedicated security contact is published, do not post exploitable security issues publicly. Open a minimal issue requesting a private reporting channel without including exploit details.
