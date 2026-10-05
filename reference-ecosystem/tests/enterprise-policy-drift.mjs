import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'

const definitions = [
  ['mail', 'services/mail-provider/server.mjs', 45401],
  ['messenger', 'services/messenger-provider/server.mjs', 45402],
  ['enterprise', 'services/enterprise-provider/server.mjs', 45403],
  ['phone', 'services/phone-provider/server.mjs', 45404],
  ['meeting', 'services/meeting-provider/server.mjs', 45405],
]
const controlPort = 45490
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

async function getJson(url) {
  const response = await fetch(url)
  assert.equal(response.ok, true, `GET failed: ${url}`)
  return response.json()
}

async function main() {
  try {
    for (const [, script, port] of definitions) start(script, { PORT: String(port) })
    await Promise.all(definitions.map(([, , port]) => waitFor(`http://127.0.0.1:${port}/health`)))

    start('services/control-plane/server.mjs', {
      PORT: String(controlPort),
      MAIL_URL: 'http://127.0.0.1:45401',
      MESSENGER_URL: 'http://127.0.0.1:45402',
      ENTERPRISE_URL: 'http://127.0.0.1:45403',
      PHONE_URL: 'http://127.0.0.1:45404',
      MEETING_URL: 'http://127.0.0.1:45405',
    })
    await waitFor(`http://127.0.0.1:${controlPort}/health`)

    const planned = await post(`http://127.0.0.1:${controlPort}/rcp/plan`, {
      subject: 'person:b',
      purpose: 'meeting_preparation',
      destination: 'user:a:private-memory',
      processing_location: 'device',
    })
    assert.equal(planned.response.ok, true)
    const initialEnterprisePlan = planned.body.steps.find((step) => step.provider === 'demo:enterprise')
    assert.equal(initialEnterprisePlan.status, 'planned')
    assert.equal(initialEnterprisePlan.representation, 'interaction_metadata')
    assert.equal(initialEnterprisePlan.capability_version, '1')
    assert.equal(initialEnterprisePlan.request.processing_location, 'provider')

    const evaluated = await post(`http://127.0.0.1:${controlPort}/rcp/evaluate`, planned.body)
    assert.equal(evaluated.response.ok, true)
    const enterpriseStep = evaluated.body.steps.find((step) => step.provider === 'demo:enterprise')
    assert.equal(enterpriseStep.status, 'executable')
    assert.equal(enterpriseStep.decision.decision, 'allow')
    assert.ok(enterpriseStep.decision.policy_versions.includes('capability:1'))

    const beforeDriftHealth = await getJson('http://127.0.0.1:45403/health')
    assert.equal(beforeDriftHealth.capability_version, '1')
    assert.equal(beforeDriftHealth.active_policy_profile, 'managed-context-v1')
    assert.equal(beforeDriftHealth.protected_reads, 0)

    const drift = await post('http://127.0.0.1:45403/rcp/demo/policy-profile', {
      profile: 'lockdown-v2',
    })
    assert.equal(drift.response.ok, true)
    assert.equal(drift.body.provider, 'demo:enterprise')
    assert.equal(drift.body.previous_capability_version, '1')
    assert.equal(drift.body.capability_version, '2')
    assert.equal(drift.body.profile, 'lockdown-v2')

    const driftedCapability = await getJson('http://127.0.0.1:45403/rcp/capabilities')
    assert.equal(driftedCapability.capability_version, '2')
    assert.equal(driftedCapability.capabilities.interaction_metadata, 'deny')
    assert.equal(driftedCapability.capabilities.provider_context, 'deny')
    assert.equal(driftedCapability.capabilities.content, 'deny')
    assert.equal(driftedCapability.capabilities.external_processing, 'deny')

    // Provider-side stale enforcement: a decision issued under capability v1
    // cannot be replayed after policy/capability v2 becomes effective.
    const directReplay = await post('http://127.0.0.1:45403/rcp/retrieve', {
      request: enterpriseStep.request,
      decision_id: enterpriseStep.decision.decision_id,
      representation: enterpriseStep.representation,
      recipient: 'consumer:test',
      recipient_public_jwk: { kid: 'not-used-because-stale' },
    })
    assert.equal(directReplay.response.status, 403)
    assert.equal(directReplay.body.error, 'permission_decision_not_executable')

    const afterReplayHealth = await getJson('http://127.0.0.1:45403/health')
    assert.equal(afterReplayHealth.capability_version, '2')
    assert.equal(afterReplayHealth.active_policy_profile, 'lockdown-v2')
    assert.equal(afterReplayHealth.protected_reads, 0)

    // Control-plane stale enforcement: the old evaluated plan is revalidated
    // against current provider capability before any protected retrieval.
    const executed = await post(`http://127.0.0.1:${controlPort}/rcp/execute`, evaluated.body)
    assert.equal(executed.response.ok, true)
    const executedEnterprise = executed.body.steps.find((step) => step.provider === 'demo:enterprise')
    assert.equal(executedEnterprise.status, 'stale')
    assert.equal(executedEnterprise.execution_status, 'stale')
    assert.equal(executedEnterprise.stale_reason, 'capability_version_changed')
    assert.equal(executedEnterprise.capability_version, '1')
    assert.equal(executedEnterprise.current_capability_version, '2')
    assert.equal(executed.body.trace.at(-1).stale_provider_count, 1)
    assert.equal(executed.body.envelopes.length, 3)
    assert.equal(executed.body.assertions.length, 3)
    assert.equal(
      JSON.stringify(executed.body.assertions).includes('demo:enterprise:'),
      false,
      'stale enterprise data must not activate into current assertions',
    )

    const afterExecuteHealth = await getJson('http://127.0.0.1:45403/health')
    assert.equal(afterExecuteHealth.protected_reads, 0)

    // Replanning sees capability v2 and excludes the enterprise source rather
    // than attempting to reuse the old v1 decision or representation.
    const replanned = await post(`http://127.0.0.1:${controlPort}/rcp/plan`, {
      subject: 'person:b',
      purpose: 'meeting_preparation',
      destination: 'user:a:private-memory',
      processing_location: 'device',
    })
    assert.equal(replanned.response.ok, true)
    const replannedEnterprise = replanned.body.steps.find((step) => step.provider === 'demo:enterprise')
    assert.equal(replannedEnterprise.status, 'unavailable')
    assert.equal(replannedEnterprise.reason, 'no_usable_representation')
    assert.equal(replannedEnterprise.capability_version, '2')

    const reevaluated = await post(`http://127.0.0.1:${controlPort}/rcp/evaluate`, replanned.body)
    assert.equal(reevaluated.response.ok, true)
    const reevaluatedEnterprise = reevaluated.body.steps.find((step) => step.provider === 'demo:enterprise')
    assert.equal(reevaluatedEnterprise.status, 'unavailable')
    assert.equal(reevaluatedEnterprise.decision, undefined)

    // A direct new request for the old representation is denied under v2.
    const newDecision = await post('http://127.0.0.1:45403/rcp/permissions/evaluate', {
      request: {
        type: 'rcp.permission_request',
        rcp_version: '0.1',
        request_id: 'request:enterprise-after-drift',
        requester: 'user:a',
        executor: 'demo:enterprise',
        action: 'access',
        resource: 'demo:enterprise:interaction_metadata:person:b',
        subject: 'person:b',
        purpose: 'meeting_preparation',
        destination: 'user:a:private-memory',
        processing_location: 'provider',
        requested_at: new Date().toISOString(),
      },
      representation: 'interaction_metadata',
      satisfied_limitations: [],
    })
    assert.equal(newDecision.response.ok, true)
    assert.equal(newDecision.body.decision, 'deny')
    assert.deepEqual(newDecision.body.reason_codes, ['x-demo:representation-denied'])

    const finalHealth = await getJson('http://127.0.0.1:45403/health')
    assert.equal(finalHealth.protected_reads, 0)

    console.log('RCP enterprise policy drift and staleness: PASS')
  } finally {
    for (const child of children.reverse()) child.kill('SIGTERM')
  }
}

await main()
