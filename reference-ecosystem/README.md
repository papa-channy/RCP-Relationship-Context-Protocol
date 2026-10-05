# RCP Reference Ecosystem

> Status: M2 experimental reference ecosystem. This is not a production deployment.

This workspace demonstrates RCP as a multi-provider interoperability system with separate provider process/state boundaries.

## Process topology

```text
mail-provider -----------┐
messenger-provider ------┤
enterprise-provider -----┼--> control-plane --> future relationship consumer
phone-provider ----------┤
meeting-provider --------┘
```

Each provider runs as a separate Node process and owns its own:

- capability manifest,
- local protected state file,
- permission-decision cache,
- provider policy/capability state.

There is no shared provider database.

## Permission-before-retrieval flow

The current M2 slice implements:

```text
Goal
 ↓
POST /rcp/plan
 ↓
ProcessingPlan + minimum representation selection
 ↓
POST /rcp/evaluate
 ↓
provider-issued PermissionDecision per step
 ↓
POST /rcp/execute
 ↓
provider-side decision validation
 ↓
protected state lazy-read
```

Protected state files are **not read at provider startup**. A provider reads its state only after an issued, fresh `allow` decision is matched to the exact request snapshot and representation.

### Provider endpoints

- `GET /health`
  - includes a non-sensitive `protected_reads` counter used by the reference tests.
- `GET /rcp/capabilities`
- `POST /rcp/permissions/evaluate`
- `POST /rcp/retrieve`

Direct `/state` access remains unavailable.

### Control-plane endpoints

- `GET /health`
- `GET /rcp/providers`
- `POST /rcp/plan`
- `POST /rcp/evaluate`
- `POST /rcp/execute`

## Representation selection

For the meeting-preparation scenario, the planner prefers:

1. `provider_context`
2. `interaction_metadata`
3. `content`

Within that preference order, an `allow` representation is preferred over a `limited` one. This means the reference planner may deliberately downgrade fidelity to avoid unnecessary conditions or raw-content access.

Current canonical selections:

- mail → `provider_context`
- messenger → `provider_context`
- enterprise → `interaction_metadata` (downgraded from limited provider context)
- phone → `interaction_metadata`
- meeting → `provider_context`

Processing location is also minimized: when external processing is not unconditionally allowed and provider-local processing is available, the planner keeps processing at the provider boundary.

## Provider-side authorization invariants

`POST /rcp/retrieve` fails closed unless all of the following hold:

- the decision ID was actually issued by that provider process;
- the decision is `allow`;
- the decision is unexpired;
- the current capability version matches the evaluated version;
- the request is byte-for-byte equivalent to the evaluated request snapshot;
- the requested representation matches the evaluated representation.

A caller cannot create a fake JSON `allow` decision and use it to retrieve data.

## Tests

Topology smoke:

```bash
npm run smoke
```

Permission-before-retrieval integration:

```bash
npm run test:permission
```

The integration test verifies that:

- all providers start with `protected_reads = 0`;
- forged decision IDs cannot retrieve data;
- planning performs no protected reads;
- permission evaluation performs no protected reads;
- request mutation after evaluation fails;
- unresolved `conditional` decisions cannot retrieve data;
- only executable steps trigger protected reads;
- a raw-content-denied provider can contribute provider-generated context;
- raw mail/message/transcript/enterprise content does not leak into the canonical execution result.

## Next M2 slice

The next slice should replace the current plaintext provider result path with the already-tested RCP JOSE `SecureEnvelope` profile and add consumer-side ContextAssertion normalization/provenance aggregation.
