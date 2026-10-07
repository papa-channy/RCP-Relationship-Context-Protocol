# Data Object Model — v0.2 Design Direction

**Status:** Non-normative design draft

RCP's data model should standardize the **meaning of relationship context**, not every object that a communication or social platform may store internally.

A persistent RCP object should preserve enough information to answer:

- what relationship/participant scope it concerns,
- what kind of assertion/evidence it represents,
- how strongly it claims truth,
- where it came from,
- what material evidence supports it,
- what restrictions/policy dependencies apply,
- what lifecycle state it is in,
- how changes to its dependencies affect it.

## Candidate semantic concepts

### `ActorReference`

Scoped reference to a person, organization, service, agent, or other actor.

RCP does not assume global identity equality from identifier equality.

### `RelationshipScope`

Defines the actors/context the assertion is actually about.

Important distinction:

```text
source interaction participants
        ≠
target relationship participants
```

A group interaction involving `{A,B,C}` does not automatically create bilateral `{A,B}` relationship memory.

### `InteractionEvidence`

Represents evidence from an interaction without requiring raw content export.

Possible representations:

- opaque source reference;
- type-only evidence;
- interaction metadata;
- bounded source statement;
- provider-generated projection.

### `ContextAssertion`

The central bounded semantic unit.

Possible assertion families:

- source statement;
- extracted/verified fact;
- user observation;
- commitment / open loop;
- preference;
- shared topic / relationship state;
- system interpretation;
- system inference;
- strategy / recommendation;
- event/interaction summary.

### `EpistemicClass`

Describes what kind of truth claim an assertion makes.

Current candidate classes:

- `source_statement`;
- `verified_fact`;
- `extracted_fact`;
- `user_observation`;
- `system_interpretation`;
- `system_inference`;
- `strategy`;
- `unknown`.

### `DerivationDependency`

Describes material evidence dependencies and how they support, conflict with, supersede, refine, or derive another assertion.

### `ContextLifecycle`

Candidate states:

- active;
- superseded;
- disputed;
- expired;
- invalidated;
- revoked;
- historical/profile-defined archival state.

### `PolicyReference`

References or normalizes only the minimum restrictions needed for relationship-specific lifecycle and derivation behavior.

RCP should not become a universal policy language.

## Key distinctions

- person != platform identity;
- actor reference != global identity;
- source participant != target relationship participant;
- author != subject;
- raw communication != relationship context;
- source statement != verified fact;
- extracted fact != independently verified fact;
- user observation != system inference;
- inference != strategy;
- child assertion access != source-evidence access;
- provider-private evidence != externally exportable context;
- lower fidelity != automatically lower restriction;
- source revocation != automatic historical deletion;
- same topic != same assertion;
- corroborating evidence != duplicated provenance.

## Scope discipline

The following are **not** candidates for universal RCP Core objects merely because providers may use them internally:

- raw message;
- email;
- document;
- generic file;
- calendar event;
- generic social post;
- tool definition;
- agent task;
- generic authorization decision;
- cryptographic envelope.

Those may appear as source evidence or transport/profile objects, but Core should standardize only the relationship semantics needed across systems.

## Composition rule

Cross-provider context should preserve source separation before materializing a combined relationship state.

Conceptually:

```text
Provider A assertion ----\
                          > composition / reconciliation -> current relationship view
Provider B assertion ----/
```

The combined view must not erase:

- provider origin;
- evidence dependencies;
- epistemic class;
- restrictions;
- conflict or supersession information.

## Design objective

The v0.2 object model should be small enough that the same semantic engine can interpret equivalent objects delivered over different bindings such as MCP and HTTP.
