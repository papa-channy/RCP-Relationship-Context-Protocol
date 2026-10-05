import http from 'node:http'
import { randomUUID } from 'node:crypto'
import {
  createRecipientKeyMaterial,
  verifyAndDecryptSecureEnvelope,
} from '../../packages/secure-envelope/index.mjs'
import { RelationshipContextStore } from '../../packages/context-store/index.mjs'
import { IdentityResolutionStore } from '../../packages/identity-resolution/index.mjs'

const port = Number(process.env.PORT ?? 4190)
const relayUrl = process.env.RCP_RELAY_URL ?? null
const providers = [
  ['demo:mail', process.env.MAIL_URL ?? 'http://127.0.0.1:4101'],
  ['demo:messenger', process.env.MESSENGER_URL ?? 'http://127.0.0.1:4102'],
  ['demo:enterprise', process.env.ENTERPRISE_URL ?? 'http://127.0.0.1:4103'],
  ['demo:phone', process.env.PHONE_URL ?? 'http://127.0.0.1:4104'],
  ['demo:meeting', process.env.MEETING_URL ?? 'http://127.0.0.1:4105'],
]

const REPRESENTATION_PREFERENCE = ['provider_context', 'interaction_metadata', 'content']
const ASSERTION_TYPES = new Set([
  'fact', 'source_statement', 'commitment', 'decision', 'preference', 'interest',
  'goal', 'status', 'event', 'open_loop', 'followup', 'constraint', 'risk',
  'organization_context', 'relationship_context', 'strategy',
])
const consumerId = 'consumer:relationship-agent'
const recipientMaterialPromise = createRecipientKeyMaterial(`${consumerId}:enc:1`)
const contextStore = new RelationshipContextStore()
const identityStore = new IdentityResolutionStore()

function json(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

async function getJson(url) {
  const response = await fetch(url)
  const body = await response.json()
  if (!response.ok) throw new Error(`${url} failed with ${response.status}: ${JSON.stringify(body)}`)
  return body
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(`${url} failed with ${response.status}: ${JSON.stringify(body)}`)
  return body
}

async function discover() {
  return Promise.all(providers.map(async ([id, baseUrl]) => {
    const capability = await getJson(`${baseUrl}/rcp/capabilities`)
    if (capability.provider !== id) throw new Error(`provider identity mismatch: expected ${id}`)
    return { id, base_url: baseUrl, capability }
  }))
}

async function resolveIdentity(input) {
  const discovered = await discover()
  return identityStore.resolve({
    tenant: input.tenant ?? 'user:a',
    person_id: input.person_id,
    seeds: input.seeds,
    provider_capabilities: discovered.map(({ capability }) => capability),
  })
}

function selectRepresentation(capability) {
  for (const representation of REPRESENTATION_PREFERENCE) {
    if (capability.capabilities?.[representation] === 'allow') return representation
  }
  for (const representation of REPRESENTATION_PREFERENCE) {
    if (capability.capabilities?.[representation] === 'limited') return representation
  }
  return null
}

function selectProcessingLocation(capability, requestedLocation) {
  const supported = capability.processing_locations ?? []
  const externalState = capability.capabilities?.external_processing ?? 'deny'
  if (requestedLocation && supported.includes(requestedLocation) && externalState === 'allow') return requestedLocation
  if (supported.includes('provider')) return 'provider'
  if (requestedLocation && supported.includes(requestedLocation)) return requestedLocation
  return supported[0] ?? null
}

function resolvePlanSubject(input) {
  const tenant = input.tenant ?? 'user:a'
  if (!input.identity_resolution_id) {
    return {
      tenant,
      subject: input.subject ?? 'person:b',
      resolution: null,
    }
  }

  const resolution = identityStore.get(input.identity_resolution_id, tenant)
  if (!resolution) throw new Error('identity_resolution_not_found_or_wrong_tenant')
  if (resolution.status !== 'resolved') throw new Error('identity_resolution_requires_confirmation')

  return {
    tenant,
    subject: resolution.person_id,
    resolution,
  }
}

function makePlan(discovered, input) {
  const { tenant, subject, resolution } = resolvePlanSubject(input)
  const purpose = input.purpose ?? 'meeting_preparation'
  const destination = input.destination ?? 'user:a:private-memory'
  const requestedLocation = input.processing_location ?? 'device'
  const requestedAt = new Date().toISOString()

  const steps = discovered.map(({ id, base_url: baseUrl, capability }) => {
    const binding = resolution?.bindings?.[id] ?? null
    if (resolution && !binding) {
      return {
        provider: id,
        base_url: baseUrl,
        status: 'unavailable',
        reason: 'identity_binding_missing',
        capability_version: capability.capability_version,
      }
    }

    const representation = selectRepresentation(capability)
    const processingLocation = selectProcessingLocation(capability, requestedLocation)
    if (!representation || !processingLocation) {
      return {
        provider: id,
        base_url: baseUrl,
        status: 'unavailable',
        reason: !representation ? 'no_usable_representation' : 'no_processing_location',
        capability_version: capability.capability_version,
      }
    }

    const providerSubject = binding?.provider_subject ?? subject
    const step = {
      provider: id,
      base_url: baseUrl,
      status: 'planned',
      representation,
      provider_subject: providerSubject,
      request: {
        type: 'rcp.permission_request',
        rcp_version: '0.1',
        request_id: `request:${randomUUID()}`,
        requester: tenant,
        executor: id,
        action: 'access',
        resource: `${id}:${representation}:${providerSubject}`,
        subject,
        purpose,
        destination,
        processing_location: processingLocation,
        requested_at: requestedAt,
      },
      capability_version: capability.capability_version,
      selected_from: {
        representation_state: capability.capabilities[representation],
        external_processing_state: capability.capabilities.external_processing,
      },
    }
    if (binding) {
      step.identity_claim_ref = binding.claim_id
      step.identity_verification_state = binding.verification_state
    }
    return step
  })

  const plan = {
    type: 'rcp.processing_plan',
    rcp_version: '0.1',
    plan_id: `plan:${randomUUID()}`,
    goal: 'prepare_next_interaction',
    tenant,
    subject,
    created_at: requestedAt,
    steps,
    trace: [{
      event: 'plan.created',
      at: requestedAt,
      protected_data_retrieved: false,
      identity_resolution_applied: Boolean(resolution),
    }],
  }
  if (resolution) plan.identity_resolution_id = resolution.resolution_id
  return plan
}

async function evaluatePlan(plan) {
  const evaluatedAt = new Date().toISOString()
  const steps = await Promise.all(plan.steps.map(async (step) => {
    if (step.status !== 'planned') return step
    const decision = await postJson(`${step.base_url}/rcp/permissions/evaluate`, {
      request: step.request,
      representation: step.representation,
      satisfied_limitations: [],
    })
    return {
      ...step,
      status: decision.decision === 'allow' ? 'executable' : 'blocked',
      decision,
    }
  }))

  return {
    ...plan,
    steps,
    evaluated_at: evaluatedAt,
    trace: [
      ...(plan.trace ?? []),
      { event: 'plan.permissions_evaluated', at: evaluatedAt, protected_data_retrieved: false },
    ],
  }
}

function assertEnvelopeBinding(envelope, step) {
  const expected = {
    action: step.request.action,
    resource_ref: step.request.resource,
    purpose: step.request.purpose,
    destination: step.request.destination,
    processing_location: step.request.processing_location,
    permission_decision_ref: step.decision.decision_id,
    sender: step.provider,
    recipient: consumerId,
  }
  for (const [field, value] of Object.entries(expected)) {
    if (envelope[field] !== value) throw new Error(`secure envelope binding mismatch for ${field}`)
  }
  if (Date.parse(envelope.expires_at) > Date.parse(step.decision.expires_at)) {
    throw new Error('secure envelope outlives permission decision')
  }
  if (Date.parse(envelope.issued_at) < Date.parse(step.decision.evaluated_at)) {
    throw new Error('secure envelope predates permission decision')
  }
}

function assertionTypeFor(item, representation) {
  if (representation === 'interaction_metadata') return 'event'
  if (representation === 'content') return 'source_statement'
  if (ASSERTION_TYPES.has(item.type)) return item.type
  return 'relationship_context'
}

function statementFor(item, representation, provider) {
  if (representation === 'provider_context') return item.statement ?? `Provider-generated relationship context from ${provider}.`
  if (representation === 'interaction_metadata') {
    const id = item.id ?? 'unknown-interaction'
    const occurred = item.occurred_at ? ` at ${item.occurred_at}` : ''
    const duration = item.duration_seconds ? ` lasting ${item.duration_seconds} seconds` : ''
    return `Interaction ${id} occurred${occurred}${duration}.`
  }
  if (representation === 'content') return item.text ?? `Source content from ${provider}.`
  return `Relationship data from ${provider}.`
}

function normalizeProviderResult(providerResult, step, subject) {
  return providerResult.items.map((item, index) => {
    const representation = providerResult.representation
    const providerContext = representation === 'provider_context'
    const metadata = representation === 'interaction_metadata'
    const assertion = {
      type: 'rcp.context_assertion',
      rcp_version: '0.1',
      assertion_id: `assertion:${randomUUID()}`,
      assertion_type: assertionTypeFor(item, representation),
      epistemic_class: providerContext ? 'system_interpretation' : metadata ? 'extracted_fact' : 'source_statement',
      statement: statementFor(item, representation, providerResult.provider),
      subjects: [step.request.requester, subject],
      provenance: {
        origin_type: providerContext ? 'provider_generated' : 'external_provider',
        source_refs: [`${providerResult.resource}#item:${item.id ?? index}`],
        visibility: providerContext ? 'redacted' : metadata ? 'type_only' : 'full',
      },
      policy_refs: step.decision.policy_versions ?? [],
      status: 'active',
      created_at: new Date().toISOString(),
    }
    if (item.occurred_at) assertion.valid_from = item.occurred_at
    return assertion
  })
}

async function executePlan(plan) {
  const executedAt = new Date().toISOString()
  const recipientMaterial = await recipientMaterialPromise
  const envelopes = []
  const relayReceipts = []
  const assertions = []
  const steps = []
  let staleProviderCount = 0

  for (const step of plan.steps) {
    if (step.status !== 'executable' || step.decision?.decision !== 'allow') {
      steps.push({ ...step, execution_status: 'skipped' })
      continue
    }

    const currentCapability = await getJson(`${step.base_url}/rcp/capabilities`)
    const decisionBoundToPlannedCapability = step.decision.policy_versions?.includes(
      `capability:${step.capability_version}`,
    )
    if (
      currentCapability.capability_version !== step.capability_version ||
      !decisionBoundToPlannedCapability
    ) {
      staleProviderCount += 1
      steps.push({
        ...step,
        status: 'stale',
        execution_status: 'stale',
        stale_reason: currentCapability.capability_version !== step.capability_version
          ? 'capability_version_changed'
          : 'decision_missing_capability_binding',
        current_capability_version: currentCapability.capability_version,
      })
      continue
    }

    const keySet = await getJson(`${step.base_url}/rcp/keys`)
    const signingPublicJwk = keySet.signing_keys?.[0]
    if (!signingPublicJwk) throw new Error(`provider signing key unavailable: ${step.provider}`)

    const delivery = await postJson(`${step.base_url}/rcp/retrieve`, {
      request: step.request,
      decision_id: step.decision.decision_id,
      representation: step.representation,
      recipient: consumerId,
      recipient_public_jwk: recipientMaterial.publicJwk,
    })

    let envelope = delivery
    if (relayUrl) {
      if (delivery.type !== 'rcp.relay_receipt' || typeof delivery.relay_id !== 'string') {
        throw new Error(`provider did not return relay receipt: ${step.provider}`)
      }
      relayReceipts.push(delivery)
      envelope = await getJson(`${relayUrl}/rcp/envelopes/${encodeURIComponent(delivery.relay_id)}`)
      if (envelope.envelope_id !== delivery.envelope_id) {
        throw new Error(`relay receipt envelope mismatch: ${step.provider}`)
      }
    }

    const providerResult = await verifyAndDecryptSecureEnvelope({
      envelope,
      signingPublicJwk,
      recipientPrivateKey: recipientMaterial.privateKey,
    })
    assertEnvelopeBinding(envelope, step)

    if (
      providerResult.provider !== step.provider ||
      providerResult.resource !== step.request.resource ||
      providerResult.representation !== step.representation ||
      providerResult.decision_id !== step.decision.decision_id
    ) {
      throw new Error(`decrypted provider result binding mismatch: ${step.provider}`)
    }

    envelopes.push(envelope)
    assertions.push(...normalizeProviderResult(providerResult, step, plan.subject))
    steps.push({
      ...step,
      execution_status: relayUrl ? 'relayed_verified_and_decrypted' : 'retrieved_and_verified',
    })
  }

  const persistence = contextStore.upsertAssertions(plan.subject, assertions)
  const brief = contextStore.brief(plan.subject)

  return {
    ...plan,
    steps,
    envelopes,
    relay_receipts: relayReceipts,
    assertions,
    context_revision: persistence.revision,
    brief,
    executed_at: executedAt,
    trace: [
      ...(plan.trace ?? []),
      {
        event: 'plan.executed',
        at: executedAt,
        protected_data_retrieved: envelopes.length > 0,
        retrieved_provider_count: envelopes.length,
        activated_assertion_count: assertions.length,
        stale_provider_count: staleProviderCount,
        relay_routed_count: relayReceipts.length,
        context_revision: persistence.revision,
      },
    ],
  }
}

async function revokeProvider(providerId) {
  const entry = providers.find(([id]) => id === providerId)
  if (!entry) throw new Error(`unknown provider: ${providerId}`)
  const [, baseUrl] = entry
  const event = await postJson(`${baseUrl}/rcp/revocations/provider`, {})
  const impact = contextStore.applyRevocation(event)
  return {
    event,
    impact,
    contexts: impact.changed_subjects.map((subject) => contextStore.snapshot(subject)),
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, 'http://127.0.0.1')

    if (req.method === 'GET' && requestUrl.pathname === '/health') {
      json(res, 200, { status: 'ok', role: 'rcp-control-plane', relay_enabled: Boolean(relayUrl) })
      return
    }
    if (req.method === 'GET' && requestUrl.pathname === '/rcp/providers') {
      json(res, 200, { providers: await discover() })
      return
    }
    if (req.method === 'GET' && requestUrl.pathname.startsWith('/rcp/identity/resolutions/')) {
      const resolutionId = decodeURIComponent(requestUrl.pathname.slice('/rcp/identity/resolutions/'.length))
      const tenant = requestUrl.searchParams.get('tenant') ?? 'user:a'
      const resolution = identityStore.get(resolutionId, tenant)
      if (!resolution) {
        json(res, 404, { error: 'identity_resolution_not_found' })
        return
      }
      json(res, 200, resolution)
      return
    }
    if (req.method === 'GET' && requestUrl.pathname === '/rcp/context') {
      const subject = requestUrl.searchParams.get('subject')
      if (!subject) {
        json(res, 400, { error: 'subject_required' })
        return
      }
      json(res, 200, contextStore.snapshot(subject))
      return
    }
    if (req.method === 'GET' && requestUrl.pathname === '/rcp/brief') {
      const subject = requestUrl.searchParams.get('subject')
      if (!subject) {
        json(res, 400, { error: 'subject_required' })
        return
      }
      json(res, 200, contextStore.brief(subject))
      return
    }
    if (req.method === 'POST' && requestUrl.pathname === '/rcp/identity/resolve') {
      json(res, 200, await resolveIdentity(await readJsonBody(req)))
      return
    }
    if (req.method === 'POST' && requestUrl.pathname === '/rcp/plan') {
      json(res, 200, makePlan(await discover(), await readJsonBody(req)))
      return
    }
    if (req.method === 'POST' && requestUrl.pathname === '/rcp/evaluate') {
      json(res, 200, await evaluatePlan(await readJsonBody(req)))
      return
    }
    if (req.method === 'POST' && requestUrl.pathname === '/rcp/execute') {
      json(res, 200, await executePlan(await readJsonBody(req)))
      return
    }
    if (req.method === 'POST' && requestUrl.pathname === '/rcp/revoke-provider') {
      const body = await readJsonBody(req)
      json(res, 200, await revokeProvider(body.provider))
      return
    }

    json(res, 404, { error: 'not_found' })
  } catch (error) {
    json(res, 502, { error: 'control_plane_failed', message: error.message })
  }
})

server.listen(port, '127.0.0.1', () => console.log(`RCP control plane listening on ${port}`))
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)))
