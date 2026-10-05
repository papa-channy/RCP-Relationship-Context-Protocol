import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'

const definitions = [
  ['mail', 'services/mail-provider/server.mjs', 45201],
  ['messenger', 'services/messenger-provider/server.mjs', 45202],
  ['enterprise', 'services/enterprise-provider/server.mjs', 45203],
  ['phone', 'services/phone-provider/server.mjs', 45204],
  ['meeting', 'services/meeting-provider/server.mjs', 45205],
]
const controlPort = 45290
const children = []

function start(script, env = {}) {
  const child = spawn(process.execPath, [script], {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.push(child)
  return child
}

async function waitFor(url, attempts = 80) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error(`service did not become healthy: ${url}`)
}

async function post(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { response, body: await response.json() }
}

async function health(port) {
  const response = await fetch(`http://127.0.0.1:${port}/health`)
  assert.equal(response.ok, true)
  return response.json()
}

async function assertReadCounts(expected) {
  for (const [name, , port] of definitions) {
    const status = await health(port)
    assert.equal(
      status.protected_reads,
      expected[name],
      `${name} protected read count mismatch`,
    )
  }
}

async function main() {
  try {
    for (const [, script, port] of definitions) start(script, { PORT: String(port) })
    await Promise.all(definitions.map(([, , port]) => waitFor(`http://127.0.0.1:${port}/health`)))

    start('services/control-plane/server.mjs', {
      PORT: String(controlPort),
      MAIL_URL: 'http://127.0.0.1:45201',
      MESSENGER_URL: 'http://127.0.0.1:45202',
      ENTERPRISE_URL: 'http://127.0.0.1:45203',
      PHONE_URL: 'http://127.0.0.1:45204',
      MEETING_URL: 'http://127.0.0.1:45205',
    })
    await waitFor(`http://127.0.0.1:${controlPort}/health`)

    const zeroReads = {
      mail: 0,
      messenger: 0,
      enterprise: 0,
      phone: 0,
      meeting: 0,
    }
    await assertReadCounts(zeroReads)

    const forgedRequest = {
      type: 'rcp.permission_request',
      rcp_version: '0.1',
      request_id: 'request:forged',
      requester: 'user:a',
      executor: 'demo:mail',
      action: 'access',
      resource: 'demo:mail:provider_context:person:b',
      subject: 'person:b',
      purpose: 'meeting_preparation',
      destination: 'user:a:private-memory',
      processing_location: 'device',
      requested_at: new Date().toISOString(),
    }
    const forged = await post('http://127.0.0.1:45201/rcp/retrieve', {
      request: forgedRequest,
      decision_id: 'decision:forged-allow',
      representation: 'provider_context',
    })
    assert.equal(forged.response.status, 403)
    await assertReadCounts(zeroReads)

    const planned = await post(`http://127.0.0.1:${controlPort}/rcp/plan`, {
      subject: 'person:b',
      purpose: 'meeting_preparation',
      destination: 'user:a:private-memory',
      processing_location: 'device',
    })
    assert.equal(planned.response.ok, true)
    const plan = planned.body
    assert.equal(plan.steps.length, 5)
    assert.equal(plan.trace.at(-1).protected_data_retrieved, false)

    const byProvider = new Map(plan.steps.map((step) => [step.provider, step]))
    assert.equal(byProvider.get('demo:mail').representation, 'provider_context')
    assert.equal(byProvider.get('demo:mail').request.processing_location, 'device')
    assert.equal(byProvider.get('demo:messenger').representation, 'provider_context')
    assert.equal(byProvider.get('demo:messenger').request.processing_location, 'provider')
    assert.equal(byProvider.get('demo:enterprise').representation, 'interaction_metadata')
    assert.equal(byProvider.get('demo:enterprise').request.processing_location, 'provider')
    assert.equal(byProvider.get('demo:phone').representation, 'interaction_metadata')
    assert.equal(byProvider.get('demo:phone').request.processing_location, 'device')
    assert.equal(byProvider.get('demo:meeting').representation, 'provider_context')
    assert.equal(byProvider.get('demo:meeting').request.processing_location, 'provider')
    await assertReadCounts(zeroReads)

    const evaluatedResponse = await post(`http://127.0.0.1:${controlPort}/rcp/evaluate`, plan)
    assert.equal(evaluatedResponse.response.ok, true)
    const evaluated = evaluatedResponse.body
    assert.equal(evaluated.trace.at(-1).protected_data_retrieved, false)

    const evaluatedByProvider = new Map(evaluated.steps.map((step) => [step.provider, step]))
    assert.equal(evaluatedByProvider.get('demo:mail').decision.decision, 'allow')
    assert.equal(evaluatedByProvider.get('demo:messenger').decision.decision, 'allow')
    assert.equal(evaluatedByProvider.get('demo:enterprise').decision.decision, 'allow')
    assert.equal(evaluatedByProvider.get('demo:meeting').decision.decision, 'allow')
    assert.equal(evaluatedByProvider.get('demo:phone').decision.decision, 'conditional')
    assert.equal(evaluatedByProvider.get('demo:phone').status, 'blocked')
    await assertReadCounts(zeroReads)

    const mailStep = evaluatedByProvider.get('demo:mail')
    const tamperedRequest = { ...mailStep.request, purpose: 'advertising' }
    const tampered = await post('http://127.0.0.1:45201/rcp/retrieve', {
      request: tamperedRequest,
      decision_id: mailStep.decision.decision_id,
      representation: mailStep.representation,
    })
    assert.equal(tampered.response.status, 403)
    await assertReadCounts(zeroReads)

    const phoneStep = evaluatedByProvider.get('demo:phone')
    const conditionalBypass = await post('http://127.0.0.1:45204/rcp/retrieve', {
      request: phoneStep.request,
      decision_id: phoneStep.decision.decision_id,
      representation: phoneStep.representation,
    })
    assert.equal(conditionalBypass.response.status, 403)
    await assertReadCounts(zeroReads)

    const executedResponse = await post(`http://127.0.0.1:${controlPort}/rcp/execute`, evaluated)
    assert.equal(executedResponse.response.ok, true)
    const executed = executedResponse.body
    assert.equal(executed.results.length, 4)
    assert.equal(executed.trace.at(-1).protected_data_retrieved, true)
    assert.equal(executed.trace.at(-1).retrieved_provider_count, 4)

    const resultMap = new Map(executed.results.map((result) => [result.provider, result]))
    assert.equal(resultMap.get('demo:mail').representation, 'provider_context')
    assert.equal(resultMap.get('demo:messenger').representation, 'provider_context')
    assert.equal(resultMap.get('demo:enterprise').representation, 'interaction_metadata')
    assert.equal(resultMap.get('demo:meeting').representation, 'provider_context')
    assert.equal(resultMap.has('demo:phone'), false)

    const serialized = JSON.stringify(executed.results)
    assert.equal(serialized.includes("Let's revisit Project X in November."), false)
    assert.equal(serialized.includes('I am preparing for a Japan trip.'), false)
    assert.equal(serialized.includes('Internal Project X discussion.'), false)
    assert.equal(serialized.includes('Transcript content retained inside provider boundary.'), false)

    await assertReadCounts({
      mail: 1,
      messenger: 1,
      enterprise: 1,
      phone: 0,
      meeting: 1,
    })

    console.log('RCP permission-before-retrieval integration: PASS')
  } finally {
    for (const child of children.reverse()) child.kill('SIGTERM')
  }
}

await main()
