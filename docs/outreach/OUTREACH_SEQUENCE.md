# RCP External Validation — Outreach Sequence

The objective of early outreach is to **reduce uncertainty**, not maximize visibility.

RCP should seek evidence in an order that makes later platform conversations more credible.

## Wave 1 — Independent implementers

Target people who are comfortable implementing protocols, identity/auth systems, SDKs, secure messaging, or API infrastructure.

Ask for one narrow deliverable:

> Build the minimal experimental Provider profile from the spec without using the reference runtime, then run the black-box harness and report every ambiguity.

Desired evidence:

- at least one unrelated implementation;
- a machine-readable harness report;
- a list of spec ambiguities or deviations;
- reproducible source/instructions.

Why first:

A protocol that only its authors can implement is not yet a convincing interoperability proposal.

## Wave 2 — Security and privacy reviewers

Target people with experience in authorization, identity, applied cryptography, privacy engineering, secure messaging, or enterprise data boundaries.

Ask for a bounded adversarial review, not a generic endorsement.

High-value outputs:

- privilege/rights expansion counterexamples;
- replay/staleness/revocation failures;
- identity-correlation risks;
- derived-data laundering cases;
- JOSE/key-management findings;
- relay metadata leakage;
- missing threat assumptions.

Why second:

A passing independent implementation proves shared interpretation, not safety.

## Wave 3 — Standards and interoperability community

Target engineers/researchers involved in identity, OAuth/OIDC, data portability, secure messaging, policy vocabularies, or agent interoperability.

Primary question:

> Which parts of RCP represent a genuinely missing semantic layer, and which parts should be deleted or delegated to existing standards?

Desired outcomes:

- scope reduction;
- mapping to existing specifications;
- terminology corrections;
- identification of extension points that should remain outside Core;
- advice on whether an RFC/community-group path is premature or appropriate.

## Wave 4 — Platform interoperability teams

Only begin this wave after at least some external implementation/review evidence exists.

Do not send a generic “please adopt RCP” message.

For each platform, identify one concrete interoperability boundary, for example:

- relationship-safe interaction metadata;
- Provider-generated context assertions without raw-content export;
- purpose-bound Personal AI delegation;
- revocation/policy signals;
- organization-managed processing restrictions;
- OS-level interaction-completed events.

Ask for technical feedback on that boundary and use the platform's formal interoperability/developer/standards channels where available.

## Evidence ladder

The outreach narrative should advance only when the evidence does.

```text
Author-designed model
        ↓
Executable reference ecosystem
        ↓
Internal cross-language interoperability
        ↓
Black-box harness
        ↓
Unrelated clean-room implementation
        ↓
Independent security/privacy review
        ↓
Standards-community critique
        ↓
Platform-specific interoperability discussion
```

Do not skip steps merely to make the project appear more mature.

## First-contact rules

- Keep the initial note short.
- Link the technical brief instead of pasting the full architecture.
- Make one specific ask per person.
- Explicitly state what remains unproven.
- Treat a counterexample as success.
- Never imply affiliation or adoption by another company.
- Do not request access to private platform data as part of validation.
- Do not offer the reference implementation as the first resource to a clean-room implementer.

## Tracking outcomes

For each outreach attempt, record only project-relevant information:

- target role/category;
- date;
- material sent;
- ask made;
- response state;
- resulting issue/PR/report, if any.

Do not create a public database of personal contact details without a clear reason and permission.
