import http from 'node:http'
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'

export function loadJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

const REPRESENTATION_FIELDS = {
  identity: 'identities',
  interaction_metadata: 'interactions',
  content: 'raw_content',
  provider_context: 'provider_context',
}

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

function expiresIn(minutes) {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

function limitationRefs(capability, name) {
  return capability.limitation_refs?.[name] ?? []
}

function allLimitationsSatisfied(refs, supplied) {
  const set = new Set(supplied ?? [])
  return refs.every((ref) => set.has(ref))
}

function decisionBase(request) {
  return {
    type: 'rcp.permission_decision',
    rcp_version: '0.1',
    decision_id: `decision:${randomUUID()}`,
    request_id: request.request_id,
    evaluated_at: new Date().toISOString(),
  }
}

function evaluateRequest({ capability, request, representation, satisfiedLimitations }) {
  const base = decisionBase(request)

  if (
    request?.type !== 'rcp.permission_request' ||
    request?.rcp_version !== '0.1' ||
    request?.action !== 'access' ||
    typeof request?.resource !== 'string' ||
    !request.resource.startsWith(`${capability.provider}:${representation}:`)
  ) {
    return {
      ...base,
      decision: 'deny',
      reason_codes: ['x-demo:invalid-request-binding'],
    }
  }

  if (!Object.hasOwn(REPRESENTATION_FIELDS, representation)) {
    return {
      ...base,
      decision: 'unknown',
      reason_codes: ['x-demo:unknown-representation'],
    }
  }

  const representationState = capability.capabilities?.[representation] ?? 'deny'
  if (representationState === 'deny') {
    return {
      ...base,
      decision: 'deny',
      reason_codes: ['x-demo:representation-denied'],
    }
  }

  const representationLimits = limitationRefs(capability, representation)
  if (
    representationState === 'limited' &&
    !allLimitationsSatisfied(representationLimits, satisfiedLimitations)
  ) {
    return {
      ...base,
      decision: 'conditional',
      required_conditions: representationLimits.map((ref) => `satisfy:${ref}`),
      expires_at: expiresIn(5),
      policy_versions: [`capability:${capability.capability_version}`, ...representationLimits],
    }
  }

  const processingLocation = request.processing_location
  if (
    processingLocation &&
    !capability.processing_locations.includes(processingLocation)
  ) {
    return {
      ...base,
      decision: 'deny',
      reason_codes: ['x-demo:processing-location-denied'],
    }
  }

  if (processingLocation && processingLocation !== 'provider') {
    const externalState = capability.capabilities?.external_processing ?? 'deny'
    if (externalState === 'deny') {
      return {
        ...base,
        decision: 'deny',
        reason_codes: ['x-demo:external-processing-denied'],
      }
    }

    const externalLimits = limitationRefs(capability, 'external_processing')
    if (
      externalState === 'limited' &&
      !allLimitationsSatisfied(externalLimits, satisfiedLimitations)
    ) {
      return {
        ...base,
        decision: 'conditional',
        required_conditions: externalLimits.map((ref) => `satisfy:${ref}`),
        expires_at: expiresIn(5),
        policy_versions: [`capability:${capability.capability_version}`, ...externalLimits],
      }
    }
  }

  return {
    ...base,
    decision: 'allow',
    expires_at: expiresIn(5),
    policy_versions: [`capability:${capability.capability_version}`],
  }
}

export function createProviderServer({ capabilityPath, statePath, port }) {
  const capability = loadJson(capabilityPath)
  const issuedDecisions = new Map()
  let protectedReads = 0

  function readProtectedState() {
    protectedReads += 1
    return loadJson(statePath)
  }

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/health') {
        json(res, 200, {
          status: 'ok',
          provider: capability.provider,
          protected_reads: protectedReads,
        })
        return
      }

      if (req.method === 'GET' && req.url === '/rcp/capabilities') {
        json(res, 200, capability)
        return
      }

      if (req.method === 'POST' && req.url === '/rcp/permissions/evaluate') {
        const body = await readJsonBody(req)
        const { request, representation, satisfied_limitations: satisfiedLimitations } = body
        const decision = evaluateRequest({
          capability,
          request,
          representation,
          satisfiedLimitations,
        })

        issuedDecisions.set(decision.decision_id, {
          decision,
          requestSnapshot: JSON.stringify(request),
          representation,
          capabilityVersion: capability.capability_version,
        })

        json(res, 200, decision)
        return
      }

      if (req.method === 'POST' && req.url === '/rcp/retrieve') {
        const body = await readJsonBody(req)
        const { request, decision_id: decisionId, representation } = body
        const record = issuedDecisions.get(decisionId)

        if (!record) {
          json(res, 403, { error: 'unknown_permission_decision' })
          return
        }

        if (
          record.decision.decision !== 'allow' ||
          record.representation !== representation ||
          record.requestSnapshot !== JSON.stringify(request) ||
          record.capabilityVersion !== capability.capability_version ||
          !record.decision.expires_at ||
          Date.parse(record.decision.expires_at) <= Date.now()
        ) {
          json(res, 403, { error: 'permission_decision_not_executable' })
          return
        }

        const field = REPRESENTATION_FIELDS[representation]
        if (!field) {
          json(res, 400, { error: 'unknown_representation' })
          return
        }

        // Protected state is read only after every authorization check above.
        const state = readProtectedState()
        json(res, 200, {
          type: 'rcp.provider_result',
          rcp_version: '0.1',
          provider: capability.provider,
          resource: request.resource,
          representation,
          decision_id: decisionId,
          state_revision: state.revision,
          items: state[field] ?? [],
        })
        return
      }

      json(res, 404, { error: 'not_found' })
    } catch (error) {
      json(res, 400, { error: 'invalid_request', message: error.message })
    }
  })

  return {
    server,
    listen() {
      return new Promise((resolve) => server.listen(port, '127.0.0.1', resolve))
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
      })
    },
  }
}
