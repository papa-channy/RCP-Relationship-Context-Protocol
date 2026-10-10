# RCP v0.2 Draft Binding Equivalence

> **Status:** executable non-normative binding proof.
>
> This directory does not define production MCP/HTTP profiles. It proves that the current RCP semantic object can survive two real transport/runtime paths without changing relationship meaning.

## Goal

The same Provider-owned fixture:

[`assertion.json`](./assertion.json)

is exposed through two independently implemented bindings:

```text
Provider fixture
   ├─ MCP Resource server ── official MCP client ──┐
   │                                               │
   └─ plain HTTP server ── fetch client ──────────┤
                                                   ▼
                                  RCP v0.2 schema + semantic validator
                                                   │
                                                   ▼
                                      canonical semantic state
```

Both normalized outputs must be identical.

## MCP binding

The MCP implementation uses the official TypeScript SDK v2 packages:

- `@modelcontextprotocol/server`
- `@modelcontextprotocol/client`

The Provider exposes the assertion as a Resource:

```text
rcp://relationship/a-b/assertions/binding-equivalent
```

with media type:

```text
application/rcp+json
```

The MCP binding owns:

- MCP server/client connection mechanics;
- Resource registration and URI lookup;
- `resources/read` request/response framing;
- MCP protocol metadata and capability mechanics.

Those are **not** RCP semantic Core state.

The Resource text payload is the draft RCP `ContextAssertion` itself.

## HTTP binding

The plain HTTP implementation uses Node's built-in HTTP server and exposes:

```text
GET /rcp/relationships/a-b/assertions/binding-equivalent
```

with:

```text
Content-Type: application/rcp+json
```

The HTTP binding owns:

- route layout;
- HTTP status codes;
- HTTP headers;
- HTTP caching/retry behavior.

Those are **not** RCP semantic Core state.

The response body is the same draft RCP `ContextAssertion`.

## Shared semantic validator

Both extracted assertion objects are written to temporary files and passed through:

```bash
python conformance/v0_2/normalize_wire.py <assertion.json>
```

That command:

1. validates the draft JSON Schema;
2. runs the same RCP cross-reference / fail-closed semantic checks used by M4.3;
3. emits canonical transport-independent semantic state.

The equivalence test requires:

```text
normalize(fixture)
  == normalize(MCP result)
  == normalize(HTTP result)
```

## Run

From the repository root:

```bash
python -m pip install -r conformance/requirements.txt
npm install --prefix bindings/v0_2
npm test --prefix bindings/v0_2
```

## What this proves

A passing result proves, for this tested slice, that:

- an actual MCP Resource can carry the candidate RCP wire object;
- a plain HTTP endpoint can carry the same object;
- MCP-specific and HTTP-specific framing are removable without losing tested RCP meaning;
- both bindings can feed one shared semantic validator;
- RCP Core does not need hidden MCP or HTTP transport state for this scenario.

## What this does not prove

It does not prove:

- production authentication/authorization;
- OAuth/OIDC or AuthZEN integration;
- production endpoint discovery;
- subscriptions/realtime update semantics;
- key management or JOSE/COSE security;
- cache/retry/idempotency profiles;
- real Provider integration;
- complete MCP host compatibility;
- complete HTTP binding design;
- external interoperability.

## Why MCP Resource, not MCP Tool

The tested operation is read-only retrieval of relationship context. MCP already defines Resources for addressable data, so this proof does not introduce an RCP-specific tool invocation abstraction.

Actions that change external systems remain outside this RCP semantic binding proof and can use MCP Tools, A2A tasks, Provider-native APIs, or other appropriate action protocols.

## Boundary rule

A binding may decide **how an RCP object is reached and carried**.

A binding must not silently decide **what that relationship object means**.
