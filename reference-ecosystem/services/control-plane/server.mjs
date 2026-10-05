import http from 'node:http'
import { randomUUID } from 'node:crypto'

const port = Number(process.env.PORT ?? 4190)
const providers = [
  ['demo:mail', process.env.MAIL_URL ?? 'http://127.0.0.1:4101'],
  ['demo:messenger', process.env.MESSENGER_URL ?? 'http://127.0.0.1:4102'],
  ['demo:enterprise', process.env.ENTERPRISE_URL ?? 'http://127.0.0.1:4103'],
  ['demo:phone', process.env.PHONE_URL ?? 'http://127.0.0.1:4104'],
  ['demo:meeting', process.env.MEETING_URL ?? 'http://127.0.0.1:4105'],
]

const REPRESENTATION_PREFERENCE = [
  'provider_context',
  'interaction_metadata',
  'content',
]

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

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await response.json()
  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}: ${JSON.stringify(body)}`)
  }
  return body
}

async function discover() {
  return Promise.all(providers.map(async ([id, baseUrl]) => {
    const response = await fetch(`${baseUrl}/rcp/capabilities`)
    if (!response.ok) throw new Error(`capability discovery failed for ${id}: ${response.status}`)
    const capability = await response.json()
    if (capability.provider !== id) throw new Error(`provider identity mismatch: expected ${id}`)
    return { id, base_url: baseUrl, capability }
  }))
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

  if (requestedLocation && supported.includes(requestedLocation) && externalState === 'allow') {
    return requestedLocation
  }
  if (supported.includes('provider')) return 'provider'
  if (requestedLocation && supported.includes(requestedLocation)) return requestedLocation
  return supported[0] ?? null
}

function makePlan(discovered, input) {
  const subject = input.subject ?? 'person:b'
  const purpose = input.purpose ?? 'meeting_preparation'
  const destination = input.destination ?? 'user:a:private-memory'
  const requestedLocation = input.processing_location ?? 'device'
  const requestedAt = new Date().toISOString()

  const steps = discovered.map(({ id, base_url: baseUrl, capability }) => {
    const representation = selectRepresentation(capability)
    const processingLocation = selectProcessingLocation(capability, requestedLocation)

    if (!representation || !processingLocation) {
      return {
        provider: id,
        base_url: baseUrl,
        status: 'unavailable',
        reason: !representation ? 'no_usable_representation' : 'no_processing_location',
      }
    }

    const request = {
      type: 'rcp.permission_request',
      rcp_version: '0.1',
      request_id: `request:${randomUUID()}`,
      requester: 'user:a',
      executor: id,
      action: 'access',
      resource: `${id}:${representation}:${subject}`,
      subject,
      purpose,
      destination,
      processing_location: processingLocation,
      requested_at: requestedAt,
    }

    return {
      provider: id,
      base_url: baseUrl,
      status: 'planned',
      representation,
      request,
      capability_version: capability.capability_version,
      selected_from: {
        representation_state: capability.capabilities[representation],
        external_processing_state: capability.capabilities.external_processing,
      },
    }
  })

  return {
    type: 'rcp.processing_plan',
    rcp_version: '0.1',
    plan_id: `plan:${randomUUID()}`,
    goal: 'prepare_next_interaction',
    subject,
    created_at: requestedAt,
    steps,
    trace: [
      {
        event: 'plan.created',
        at: requestedAt,
        protected_data_retrieved: false,
      },
    ],
  }
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
      {
        event: 'plan.permissions_evaluated',
        at: evaluatedAt,
        protected_data_retrieved: false,
      },
    ],
  }
}

async function executePlan(plan) {
  const executedAt = new Date().toISOString()
  const results = []
  const steps = []

  for (const step of plan.steps) {
    if (step.status !== 'executable' || step.decision?.decision !== 'allow') {
      steps.push({ ...step, execution_status: 'skipped' })
      continue
    }

    const result = await postJson(`${step.base_url}/rcp/retrieve`, {
      request: step.request,
      decision_id: step.decision.decision_id,
      representation: step.representation,
    })
    results.push(result)
    steps.push({ ...step, execution_status: 'retrieved' })
  }

  return {
    ...plan,
    steps,
    results,
    executed_at: executedAt,
    trace: [
      ...(plan.trace ?? []),
      {
        event: 'plan.executed',
        at: executedAt,
        protected_data_retrieved: results.length > 0,
        retrieved_provider_count: results.length,
      },
    ],
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') {
      json(res, 200, { status: 'ok', role: 'rcp-control-plane' })
      return
    }

    if (req.method === 'GET' && req.url === '/rcp/providers') {
      json(res, 200, { providers: await discover() })
      return
    }

    if (req.method === 'POST' && req.url === '/rcp/plan') {
      const input = await readJsonBody(req)
      json(res, 200, makePlan(await discover(), input))
      return
    }

    if (req.method === 'POST' && req.url === '/rcp/evaluate') {
      const plan = await readJsonBody(req)
      json(res, 200, await evaluatePlan(plan))
      return
    }

    if (req.method === 'POST' && req.url === '/rcp/execute') {
      const plan = await readJsonBody(req)
      json(res, 200, await executePlan(plan))
      return
    }

    json(res, 404, { error: 'not_found' })
  } catch (error) {
    json(res, 502, { error: 'control_plane_failed', message: error.message })
  }
})

server.listen(port, '127.0.0.1', () => console.log(`RCP control plane listening on ${port}`))
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)))
