# RCP Conformance

The conformance suite will test protocol behavior rather than one implementation's internals.

Initial required cases:

- unknown permission does not execute,
- provider capability is not treated as permission,
- restricted raw content is not exported,
- purpose restrictions are enforced,
- derived data retains policy dependencies,
- revoked sources trigger descendant reevaluation,
- stale permission decisions are rejected,
- cross-tenant identity aggregation is denied by default,
- group interactions are not silently collapsed into binary context,
- transformations do not erase confidentiality restrictions.
