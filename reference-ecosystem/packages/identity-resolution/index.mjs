import { randomUUID } from 'node:crypto'

const AUTO_BIND_STATES = new Set([
  'verified',
  'provider_confirmed',
  'user_confirmed',
])

function assertNonEmpty(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${field} is required`)
  }
}

export class IdentityResolutionStore {
  constructor() {
    this.resolutions = new Map()
  }

  resolve({ tenant, person_id: personId, seeds, provider_capabilities: providerCapabilities }) {
    assertNonEmpty(tenant, 'tenant')
    assertNonEmpty(personId, 'person_id')
    if (!Array.isArray(seeds) || seeds.length === 0) throw new Error('identity seeds are required')

    const capabilities = new Map(
      (providerCapabilities ?? []).map((entry) => [entry.provider, entry]),
    )
    const seenProviders = new Set()
    const claims = []
    const bindings = {}
    const pending = []
    const issuedAt = new Date().toISOString()

    for (const seed of seeds) {
      assertNonEmpty(seed.provider, 'seed.provider')
      assertNonEmpty(seed.provider_subject, 'seed.provider_subject')
      assertNonEmpty(seed.identity_type, 'seed.identity_type')
      assertNonEmpty(seed.identifier, 'seed.identifier')
      assertNonEmpty(seed.verification_state, 'seed.verification_state')

      if (seenProviders.has(seed.provider)) {
        throw new Error(`duplicate provider identity seed: ${seed.provider}`)
      }
      seenProviders.add(seed.provider)

      const capability = capabilities.get(seed.provider)
      const identityCapability = capability?.capabilities?.identity ?? 'deny'
      if (identityCapability === 'deny') {
        pending.push({
          provider: seed.provider,
          reason: 'provider_identity_capability_denied',
        })
        continue
      }

      const claim = {
        type: 'rcp.identity_claim',
        rcp_version: '0.1',
        claim_id: `identity-claim:${randomUUID()}`,
        provider: seed.provider,
        identity_type: seed.identity_type,
        identifier: seed.identifier,
        verification_state: seed.verification_state,
        subject_hint: `${tenant}:${personId}`,
        evidence_refs: [`user-seed:${tenant}:${seed.provider}`],
        issued_at: issuedAt,
      }
      claims.push(claim)

      if (!AUTO_BIND_STATES.has(seed.verification_state)) {
        pending.push({
          provider: seed.provider,
          claim_id: claim.claim_id,
          reason: `verification_state_${seed.verification_state}_requires_confirmation`,
        })
        continue
      }

      bindings[seed.provider] = {
        provider: seed.provider,
        provider_subject: seed.provider_subject,
        claim_id: claim.claim_id,
        verification_state: seed.verification_state,
      }
    }

    const resolution = {
      type: 'rcp.identity_resolution',
      rcp_version: '0.1',
      resolution_id: `identity-resolution:${randomUUID()}`,
      tenant,
      person_id: personId,
      status: pending.length === 0 ? 'resolved' : 'needs_confirmation',
      claims,
      bindings,
      pending,
      created_at: issuedAt,
    }

    this.resolutions.set(resolution.resolution_id, structuredClone(resolution))
    return structuredClone(resolution)
  }

  get(resolutionId, tenant = null) {
    const resolution = this.resolutions.get(resolutionId)
    if (!resolution) return null
    if (tenant && resolution.tenant !== tenant) return null
    return structuredClone(resolution)
  }
}
