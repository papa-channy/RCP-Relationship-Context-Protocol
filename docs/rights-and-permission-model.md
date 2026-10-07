# Rights & Permission Model — v0.2 Design Direction

**Status:** Non-normative design draft

RCP v0.1 modeled permission as an action-specific `PermissionRequest` / `PermissionDecision` protocol. That was useful for proving fail-closed behavior, but v0.2 should avoid owning a universal authorization engine if established authorization systems can carry the generic request/decision mechanics.

The v0.2 question is narrower:

> **What relationship-specific resource, participant, representation, purpose, derivation, and lifecycle semantics must an authorization system understand in order to make a safe decision?**

## 1. Rights are not ownership

Relationship context may involve multiple people, organizations, Providers, and policy domains.

RCP therefore does not assume one simple owner whose consent automatically authorizes every use.

At minimum, a protected operation may depend on:

- requester identity;
- executor identity;
- target relationship/participants;
- source participants;
- Provider policy;
- organization policy;
- user authorization;
- destination;
- purpose;
- processing location;
- requested representation/fidelity;
- derivation/storage/disclosure/training constraints;
- current evidence/policy/identity versions.

## 2. Generic authorization versus RCP semantics

Generic authorization systems can decide structures conceptually similar to:

```text
subject + action + resource + context -> decision
```

RCP should define the domain meaning of the protected relationship resources and context.

Examples of relationship-specific resource classes:

- raw interaction evidence;
- interaction metadata;
- provider-generated relationship projection;
- context assertion;
- commitment/open loop;
- relationship state/snapshot;
- derived briefing;
- provenance/evidence reference.

Permission to one class MUST NOT silently imply permission to another.

## 3. Action dimensions

The v0.1 action vocabulary remains useful as an analytical checklist:

- discover;
- access;
- delegate;
- transfer;
- process;
- derive;
- store;
- disclose;
- act;
- train.

v0.2 does not yet decide whether this exact list remains a Core registry, becomes an authorization profile, or maps to another standard.

The invariant remains:

> permission for one materially different action does not automatically authorize another.

## 4. Representation is part of authorization context

A Provider may allow:

```text
interaction_metadata
provider_context
context_assertion
```

while denying:

```text
raw_content
```

A Consumer MUST NOT substitute a more revealing representation merely because the Provider technically supports it.

This representation boundary is relationship-specific and should remain testable even if the generic authorization decision is produced by AuthZEN or another external PDP.

## 5. Purpose and processing restrictions

Purpose, destination, processing location, retention, disclosure, derivation, and training may materially affect whether a relationship-context use is permitted.

RCP should not invent a universal policy language for these dimensions.

RCP must still define that:

- missing/unknown material restrictions do not become implicit permission;
- a later stage does not silently broaden the authorized use;
- lower-fidelity transformation does not automatically loosen restrictions;
- a Consumer unable to evaluate a material restriction fails closed for the affected use.

## 6. Participant rights boundary

The fact that Human A can read an interaction does not imply that every derived relationship use is authorized.

Particularly for multi-party evidence:

```text
A, B, C source interaction
```

an operation targeting:

```text
A-B relationship context
```

must independently satisfy the projection/participant-scope rules.

Authorization cannot repair a semantically invalid projection after the fact.

## 7. Staleness dependencies

An authorization basis may become stale when a material dependency changes, including:

- user grant;
- organization/provider policy;
- identity binding;
- participant scope;
- resource classification;
- representation/fidelity;
- destination;
- purpose;
- processing location;
- source validity.

RCP v0.2 should define which relationship-context dependencies are material. A binding/profile may define how a PDP or authorization service receives and versions them.

## 8. AuthZEN-compatible direction

The current design direction is to investigate an authorization mapping/profile rather than preserve `PermissionRequest` / `PermissionDecision` as permanently independent generic Core objects.

A future profile should be able to map concepts such as:

```text
RCP Actor/Requester
RCP relationship resource
RCP action/use
RCP participant scope
RCP purpose
RCP representation
RCP policy dependencies
```

into an external authorization request/decision model without losing semantics.

## 9. v0.1 compatibility

The v0.1 objects remain normative for the existing experimental v0.1 contract and tests.

This document does not retroactively change their meaning.

The v0.2 refactor instead asks which v0.1 behaviors belong to:

- RCP semantic Core;
- authorization profile;
- binding-specific implementation;
- external standard mapping.

## 10. Design objective

RCP should be able to say:

> **Here is exactly what relationship resource/use is being authorized and which semantic dependencies matter.**

It should not need to say:

> **Every conforming deployment must use an authorization engine invented by RCP.**
