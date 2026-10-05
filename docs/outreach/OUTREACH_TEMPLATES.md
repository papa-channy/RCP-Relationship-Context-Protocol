# RCP External Validation — Outreach Templates

These templates are for **validation outreach**, not adoption sales.

Keep the first message short. The recipient should immediately understand:

1. what RCP is;
2. what already exists;
3. what is still unproven;
4. the specific thing you are asking them to test.

Do not claim that RCP is a standard, production-ready, independently secure, or adopted by any platform.

---

## 1. Independent implementer

**Subject:** Clean-room implementation challenge for an experimental interoperability protocol

Hi <name>,

I’m working on an experimental open protocol called **RCP (Relationship Context Protocol)**. It explores how independently operated systems could exchange the minimum relationship context needed by a Personal AI while preserving Provider, user, organization, provenance, and revocation boundaries.

The protocol now has a normative Core v0.1 draft, JSON Schemas, conformance tests, an executable five-Provider reference ecosystem, encrypted `SecureEnvelope` exchange, and Node↔Python crypto interoperability.

The main thing I do **not** know yet is whether someone who did not design RCP can read the spec and independently implement compatible behavior.

I’ve published a clean-room Provider challenge and a black-box harness that does not import the reference runtime. I’d be interested in either a working implementation or a failure report showing where the spec is ambiguous or underspecified.

Technical brief: <repo>/blob/main/docs/outreach/TECHNICAL_BRIEF.md  
Implementation challenge: <repo>/blob/main/docs/outreach/IMPLEMENTATION_CHALLENGE.md  
Milestone: <repo>/issues/19

A failure that exposes a protocol flaw is just as useful as a pass.

Thanks,
<name>

---

## 2. Security / privacy reviewer

**Subject:** Request for adversarial review of an experimental rights-aware interoperability protocol

Hi <name>,

I’m developing an experimental open protocol called **RCP (Relationship Context Protocol)** for exchanging relationship context across independent Providers without treating “the user can see this” as unrestricted permission to export, derive, retain, disclose, or train on it.

The current draft includes explicit capability/permission separation, purpose and processing-location binding, provenance, derived-data restriction inheritance, revocation propagation, identity isolation, policy-drift handling, and an experimental JOSE `SecureEnvelope` profile.

The reference implementation and internal conformance tests now work, so the most useful next step is independent adversarial review rather than more self-validation.

I’m specifically looking for cases where RCP:

- expands a user’s or organization’s rights incorrectly;
- leaks a relationship graph through metadata;
- mishandles identity linking, revocation, provenance, or derived data;
- contains a cryptographic/profile assumption that is unsafe or non-interoperable;
- duplicates an existing standard badly.

Technical brief: <repo>/blob/main/docs/outreach/TECHNICAL_BRIEF.md  
Review request: <repo>/blob/main/docs/outreach/SECURITY_REVIEW_REQUEST.md  
Review checklist: <repo>/blob/main/docs/SECURITY_PRIVACY_REVIEW_CHECKLIST.md

I’m not asking for a production certification or legal-compliance opinion. A bounded critique or even a single strong counterexample would be valuable.

Thanks,
<name>

---

## 3. Standards / interoperability engineer

**Subject:** Feedback request: experimental protocol for rights-aware relationship-context interoperability

Hi <name>,

I’m working on an open experimental protocol called **RCP (Relationship Context Protocol)**.

The problem it explores is narrower than general data portability: when several independent systems hold different parts of the same human relationship, how can a Personal AI obtain only the context needed for a stated purpose while preserving Provider capability limits, user/organization rights, provenance, processing-location constraints, and later revocation?

The current draft builds on existing authorization and JOSE concepts rather than trying to replace them. What I’m trying to validate is whether RCP defines a genuinely missing interoperability semantic layer, or whether parts of it should instead be expressed entirely through existing standards.

The repository includes a Core v0.1 draft, schemas, conformance tests, a working five-Provider reference ecosystem, and an external black-box implementation harness.

Technical brief: <repo>/blob/main/docs/outreach/TECHNICAL_BRIEF.md  
Spec index: <repo>/blob/main/spec/README.md  
Project charter: <repo>/blob/main/CHARTER.md

I’d especially value criticism on scope boundaries: what RCP should delete, delegate to existing standards, or define more narrowly.

Thanks,
<name>

---

## 4. Later-stage platform interoperability contact

Use this only after external implementation/review evidence exists. The ask should be **technical feedback on one interoperability boundary**, not “please adopt RCP.”

**Subject:** Technical interoperability proposal for permission-bound Personal AI context exchange

Hi <name>,

I’m maintaining an open experimental protocol called **RCP (Relationship Context Protocol)** that explores a permission-bound way for a Provider to expose relationship context to a user-authorized Personal AI without requiring unrestricted raw-data export or central custody by the protocol operator.

RCP supports Provider-specific capability limits, purpose/destination/processing-location binding, encrypted Provider→Consumer exchange, provenance, revocation, and policy changes. The protocol and reference implementation are open, and the project is designed so a platform can operate its own implementation without sending traffic through infrastructure controlled by the original authors.

We now have <insert only verified external evidence here>.

I’m not asking for platform adoption at this stage. I’d like feedback on one concrete boundary: <specific capability / data class / interoperability question>.

Technical brief: <repo>/blob/main/docs/outreach/TECHNICAL_BRIEF.md  
Core draft: <repo>/blob/main/spec/core-v0.1.md  
Relevant profile/issue: <link>

If this falls under a formal interoperability or standards channel rather than your team, I’d also appreciate being pointed to the appropriate process.

Thanks,
<name>

---

## Short DM version

I’m testing an experimental open protocol for rights-aware relationship-context exchange between independent platforms/Personal AI systems. The reference ecosystem works; the unproven part is whether an unrelated implementer or reviewer reaches the same conclusions from the spec. I’m looking for people willing to either break the model or implement the minimal Provider profile. Technical brief: <link>. A failure report is as useful as a pass.

---

## What not to say

Avoid:

- “RCP is the new standard for Personal AI.”
- “Google/Apple could adopt this immediately.”
- “The protocol is secure because all tests pass.”
- “The relay cannot learn anything.”
- “RCP solves privacy compliance.”
- “We need your company to expose its private data/API.”

Prefer:

- “experimental protocol draft”;
- “tested reference ecosystem”;
- “independent interoperability is still unproven”;
- “the relay cannot decrypt payloads in the tested profile, but metadata privacy remains a review target”;
- “we are asking for a concrete counterexample, implementation, or bounded technical review.”
