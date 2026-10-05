import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'

const definitions = [
  ['mail', 'services/mail-provider/server.mjs', 45301],
  ['messenger', 'services/messenger-provider/server.mjs', 45302],
  ['enterprise', 'services/enterprise-provider/server.mjs', 45303],
  ['phone', 'services/phone-provider/server.mjs', 45304],
  ['meeting', 'services/meeting-provider/server.mjs', 45305],
]
const controlPort = 45390
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

async function waitFor(url, attempts = 100) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error(`service did not become healthy: ${url}`)
}

async function get(url) {
  const response = await fetch(url)
  return { response, body: await response.json() }
}

async function post(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { response, body: await response.json() }
}

async function executeCanonicalFlow() {
  const planned = await post(`http://127.0.0.1:${controlPort}/rcp/plan`, {
    subject: 'person:b',
    purpose: 'meeting_preparation',
    destination: 'user:a:private-memory',
    processing_location: 'device',
  })
  assert.equal(planned.response.ok, true)

  const evaluated = await post(`http://127.0.0.1:${controlPort}/rcp/evaluate`, planned.body)
  assert.equal(evaluated.response.ok, true)

  const executed = await post(`http://127.0.0.1:${controlPort}/rcp/execute`, evaluated.body)
  assert.equal(executed.response.ok, true)
  return { plan: planned.body, evaluated: evaluated.body, executed: executed.body }
}

async function main() {
  try {
    for (const [, script, port] of definitions) start(script, { PORT: String(port) })
    await Promise.all(definitions.map(([, , port]) => waitFor(`http://127.0.0.1:${port}/health`)))

    start('services/control-plane/server.mjs', {
      PORT: String(controlPort),
      MAIL_URL: 'http://127.0.0.1:45301',
      MESSENGER_URL: 'http://127.0.0.1:45302',
      ENTERPRISE_URL: 'http://127.0.0.1:45303',
      PHONE_URL: 'http://127.0.0.1:45304',
      MEETING_URL: 'http://127.0.0.1:45305',
    })
    await waitFor(`http://127.0.0.1:${controlPort}/health`)

    const first = await executeCanonicalFlow()
    assert.equal(first.executed.assertions.length, 4)
    assert.equal(first.executed.brief.active_assertion_count, 4)
    assert.equal(first.executed.context_revision, 1)
    assert.ok(first.executed.brief.text.includes('B is preparing for a Japan trip.'))
    assert.ok(first.executed.brief.text.includes('A and B agreed to revisit Project X in November.'))

    const before = await get(`http://127.0.0.1:${controlPort}/rcp/context?subject=person%3Ab`)
    assert.equal(before.response.ok, true)
    assert.equal(before.body.assertion_count, 4)
    assert.equal(before.body.active_assertion_count, 4)

    const messengerBefore = before.body.assertions.find((assertion) =>
      assertion.provenance.source_refs.some((ref) => ref.startsWith('demo:messenger:')),
    )
    assert.ok(messengerBefore)
    assert.equal(messengerBefore.status, 'active')

    const oldMessengerStep = first.evaluated.steps.find((step) => step.provider === 'demo:messenger')
    assert.equal(oldMessengerStep.decision.decision, 'allow')

    const revoked = await post(`http://127.0.0.1:${controlPort}/rcp/revoke-provider`, {
      provider: 'demo:messenger',
    })
    assert.equal(revoked.response.ok, true)
    assert.equal(revoked.body.event.type, 'rcp.revocation_event')
    assert.equal(revoked.body.event.revocation_type, 'provider')
    assert.deepEqual(revoked.body.event.scope, {
      scope_type: 'provider',
      scope_id: 'demo:messenger',
    })
    assert.equal(revoked.body.impact.revoked_assertion_ids.length, 1)
    assert.deepEqual(revoked.body.impact.changed_subjects, ['person:b'])

    const after = await get(`http://127.0.0.1:${controlPort}/rcp/context?subject=person%3Ab`)
    assert.equal(after.response.ok, true)
    assert.equal(after.body.assertion_count, 4, 'history should retain revoked assertions')
    assert.equal(after.body.active_assertion_count, 3)
    assert.equal(after.body.store_revision, 2)

    const messengerAfter = after.body.assertions.find(
      (assertion) => assertion.assertion_id === messengerBefore.assertion_id,
    )
    assert.equal(messengerAfter.status, 'revoked')

    const activeProviders = new Set(
      after.body.assertions
        .filter((assertion) => assertion.status === 'active')
        .map((assertion) => assertion.provenance.source_refs[0].split(':').slice(0, 2).join(':')),
    )
    assert.deepEqual(activeProviders, new Set(['demo:mail', 'demo:enterprise', 'demo:meeting']))

    const briefAfter = await get(`http://127.0.0.1:${controlPort}/rcp/brief?subject=person%3Ab`)
    assert.equal(briefAfter.response.ok, true)
    assert.equal(briefAfter.body.active_assertion_count, 3)
    assert.equal(briefAfter.body.text.includes('B is preparing for a Japan trip.'), false)
    assert.ok(briefAfter.body.text.includes('A and B agreed to revisit Project X in November.'))
    assert.ok(briefAfter.body.text.includes('Project X was discussed in a video meeting.'))

    const messengerHealth = await get('http://127.0.0.1:45302/health')
    assert.equal(messengerHealth.body.revoked, true)
    assert.equal(messengerHealth.body.protected_reads, 1)

    const oldDecisionReuse = await post('http://127.0.0.1:45302/rcp/retrieve', {
      request: oldMessengerStep.request,
      decision_id: oldMessengerStep.decision.decision_id,
      representation: oldMessengerStep.representation,
    })
    assert.equal(oldDecisionReuse.response.status, 403)
    const messengerHealthAfterReuse = await get('http://127.0.0.1:45302/health')
    assert.equal(messengerHealthAfterReuse.body.protected_reads, 1)

    const plannedAgain = await post(`http://127.0.0.1:${controlPort}/rcp/plan`, {
      subject: 'person:b',
      purpose: 'meeting_preparation',
      destination: 'user:a:private-memory',
      processing_location: 'device',
    })
    const evaluatedAgain = await post(`http://127.0.0.1:${controlPort}/rcp/evaluate`, plannedAgain.body)
    const messengerAgain = evaluatedAgain.body.steps.find((step) => step.provider === 'demo:messenger')
    assert.equal(messengerAgain.decision.decision, 'deny')
    assert.deepEqual(messengerAgain.decision.reason_codes, ['x-demo:provider-revoked'])
    assert.equal(messengerAgain.status, 'blocked')

    const revokeAgain = await post(`http://127.0.0.1:${controlPort}/rcp/revoke-provider`, {
      provider: 'demo:messenger',
    })
    assert.equal(revokeAgain.response.ok, true)
    assert.equal(revokeAgain.body.impact.revoked_assertion_ids.length, 0)
    assert.equal(revokeAgain.body.impact.changed_subjects.length, 0)

    console.log('RCP source revocation and relationship brief recomputation: PASS')
  } finally {
    for (const child of children.reverse()) child.kill('SIGTERM')
  }
}

await main()
