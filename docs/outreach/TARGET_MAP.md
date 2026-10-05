# RCP External Validation — Public Target Map

> Current as of October 2026. This is a map of public technical communities and open-source projects relevant to validating RCP. It is not a contact database and should not be used for bulk outreach.

The goal is to obtain independent implementation and review evidence before approaching large platform teams with adoption-oriented proposals.

## 1. OpenID AuthZEN Working Group — highest priority

**Why:** AuthZEN standardizes authorization interoperability between Policy Decision Points and Policy Enforcement Points. Authorization API 1.0 became an OpenID Final Specification in 2026, and the group is actively working on agent-era authorization, COAZ mappings, obligations, and interoperability.

**RCP question:** Which parts of RCP's `PermissionRequest` / `PermissionDecision` should map to AuthZEN instead of being defined independently? What relationship-context-specific semantics genuinely remain?

**Public channels**

- https://openid.net/wg/authzen/
- https://openid.net/wg/authzen/specifications/
- https://github.com/openid/authzen
- Public WG mailing list listed by OpenID: `openid-specs-authzen@lists.openid.net`

**Best use:** authorization-model critique and standards-boundary review.

## 2. OpenID Shared Signals Working Group — highest priority

**Why:** Shared Signals / CAEP already standardize cross-system state-change and revocation signals. The specifications reached Final status in 2025 and interoperability-profile work remains active in 2026.

**RCP question:** Can `RevocationEvent`, policy drift, and stale-decision invalidation be represented as Shared Signals profiles instead of creating a parallel event mechanism?

**Public channels**

- https://openid.net/wg/sharedsignals/
- https://openid.net/wg/sharedsignals/specifications/
- https://github.com/openid/sharedsignals

**Best use:** revocation, policy-change, and dynamic-state semantics.

## 3. Independent Shared Signals / AuthZEN implementers — Wave 1 candidates

People who already implement open identity protocols independently are strong candidates for the clean-room Provider challenge.

Public projects discovered during this mapping pass include:

- Rust AuthZEN SDK: https://github.com/mjovanc/openidauthzen
- Go Shared Signals implementation: https://github.com/i2-open/i2goSignals
- Python SSF transmitter: https://github.com/solarssk/ssf-transmitter
- Go SSF forwarder: https://github.com/twosense/ssf-forwarder

**Outreach rule:** do not open unrelated issues in these repositories just to advertise RCP. Use an explicitly public professional/community channel if available.

**Best use:** unrelated clean-room implementation evidence.

## 4. OpenFGA Community — high priority

**Why:** OpenFGA practitioners implement fine-grained relationship/attribute authorization across real systems and multiple SDK languages.

**RCP question:** Is capability-vs-permission separation executable at a Provider boundary without hidden application assumptions? Are resource/action/subject semantics too underspecified?

**Public channels**

- https://openfga.dev/community
- https://github.com/openfga/openfga
- https://github.com/openfga/community

The community page exposes public Slack, GitHub Discussions, and monthly meetings.

## 5. Open Policy Agent Community — high priority

**Why:** OPA practitioners understand policy decision/enforcement boundaries and can challenge whether RCP mixes protocol semantics with policy-engine responsibilities.

**RCP question:** Which rules belong in RCP's interoperability contract, and which should be left entirely to a policy engine/deployment profile?

**Public channel:** https://www.openpolicyagent.org/community

## 6. W3C Data Privacy Vocabularies and Controls Community Group — high priority

**Why:** DPVCG develops machine-readable privacy, processing, purpose, personal-data, and control vocabularies, including AI-related use cases.

**RCP question:** Which RCP purpose, recipient, processing, sensitivity, and constraint concepts should map directly to DPV rather than creating new terms?

**Public channel:** https://www.w3.org/community/dpvcg/

Participation is open through a W3C account; the group publishes meeting, mailing-list, and GitHub links.

## 7. IETF OAuth Working Group — standards-boundary review

**Why:** OAuth remains active in 2026 on delegation, transaction tokens, client identity, OAuth 2.1, and related security work.

**RCP question:** Does RCP duplicate OAuth/RAR/transaction-token semantics in any authorization or delegation layer?

**Public channel:** https://datatracker.ietf.org/wg/oauth/

Bring narrow technical questions, not the entire RCP project as an endorsement request.

## 8. Matrix specification community — medium priority

**Why:** Matrix has mature federation, encryption, metadata/privacy tradeoffs, and an implementation-first public spec-change process.

**RCP question:** Are the federation, envelope, metadata, and governance boundaries sound from an open-protocol perspective?

**Public channels**

- https://matrix.org/faq/
- https://spec.matrix.org/proposals
- Public spec room referenced by Matrix: `#matrix-spec:matrix.org`

## 9. Ory open-source community — medium priority

**Why:** Ory maintains OAuth/OIDC, identity, zero-trust proxying, and relationship-based authorization projects with a large practitioner community.

**Public channel:** https://github.com/ory

Use community Slack/contribution channels exposed by Ory for practitioner feedback rather than filing unrelated product issues.

# Later-stage platform channels — not Wave 1

## Apple

Apple currently provides a formal interoperability-request process and asks developers to submit separate requests for individual OS/hardware capabilities. There is also a separate EU DMA interoperability process.

- https://developer.apple.com/support/interoperability-requests
- https://developer.apple.com/support/ios-interoperability/

**Future RCP approach:** request feedback on one concrete capability, such as a privacy-preserving interaction event or Provider-generated context interface — not “adopt RCP.”

## Google

Google operates a Data Portability API for user-authorized transfer of supported data, with OAuth, verification, data-minimization, deletion, and security requirements.

- https://developers.google.com/data-portability
- https://developers.google.com/data-portability/policy

**Future RCP approach:** compare portability with lower-fidelity, purpose-bound Provider context rather than asking for unrestricted raw data export.

# Recommended first five outreach actions

1. Invite **one unrelated open-protocol implementer** from the AuthZEN/Shared Signals ecosystem to attempt the clean-room Provider challenge.
2. Ask **OpenID AuthZEN** for a narrow authorization-model mapping critique.
3. Ask **OpenID Shared Signals** whether RCP revocation/policy events should profile SSF/CAEP.
4. Ask **OpenFGA or OPA practitioners** whether Provider-side enforcement semantics are implementable and correctly scoped.
5. Ask **W3C DPVCG** to map RCP purpose/data-processing concepts to existing privacy vocabularies.

Move to Apple/Google/platform-specific discussions only after some external implementation/review evidence exists.

# What counts as useful evidence

Useful outcomes include:

- a clean-room implementation attempt;
- a reproducible interoperability failure;
- a protocol ambiguity issue;
- a proposal to remove/delegate part of RCP to an existing standard;
- a security/privacy counterexample;
- an independent review report.

“Interesting project” is encouraging, but it is not validation evidence.
