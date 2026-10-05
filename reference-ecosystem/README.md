# RCP Reference Ecosystem

> Status: M2 scaffold. This is not a production deployment.

This workspace demonstrates RCP as a multi-provider interoperability system. The first scaffold intentionally exposes **capability discovery only**; protected relationship data routes are withheld until permission-before-retrieval is implemented.

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
- local state file,
- future provider policy state,
- future JOSE key material.

There is no shared provider database.

## Current endpoints

Each provider:

- `GET /health`
- `GET /rcp/capabilities`

Control plane:

- `GET /health`
- `GET /rcp/providers`

Protected provider state is deliberately **not exposed** in this scaffold.

## Smoke test

From this directory:

```bash
npm run smoke
```

The smoke test starts five provider processes plus the control plane, verifies that all five capability manifests are discovered, checks the intentionally different capability boundaries, and verifies that a direct `/state` request returns `404` from every provider.

## Next M2 slice

The next implementation slice adds:

1. a `ProcessingPlan` model,
2. permission evaluation before retrieval,
3. representation selection (`raw_content`, `provider_context`, `interaction_metadata`),
4. provider-side protected routes that require a valid decision reference,
5. RCP JOSE SecureEnvelope provider→consumer delivery.

Only after those controls exist should the provider fixture data become retrievable.
