# Semantic Conformance Notes

The M1 semantic tests intentionally define **observable minimum behavior**, not a required internal implementation architecture.

The policy-inheritance fixtures use abstract policy objects because Core v0.1 has not yet standardized a complete policy-expression language. The oracle therefore checks only the monotonic restriction rules already normative in `spec/core-v0.1.md`.

The revocation fixtures use a small directed derivation graph. Implementations may use relational storage, graph databases, event sourcing, or other architectures as long as externally observable descendant impact is equivalent.

The staleness fixtures use opaque dependency versions to demonstrate one normative rule: a cached `allow` decision cannot survive a material change to an authorization dependency without reevaluation.

These fixtures should be replaced or expanded as future RCP profiles make policy expressions, provenance edges, and event formats normative.
