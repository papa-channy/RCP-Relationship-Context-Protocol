import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'

const definitions = [
  ['mail', 'services/mail-provider/server.mjs', 45501],
  ['messenger', 'services/messenger-provider/server.mjs', 45502],
  ['enterprise', 'services/enterprise-provider/server.mjs', 45503],
  ['phone', 'services/phone-provider/server.mjs', 45504],
  ['meeting', 'services/meeting-provider/server.mjs', 45505],
]
const relayPort = 45580
const controlPort = 45590
const relayUrl = `http://127.0.0.1:${relayPort}`
const children = []

const forbiddenPlaintext = [
  "Let's revisit Project X in November.",
  'A and B agreed to revisit Project X in November.',
  'I am preparing for a Japan trip.',
  'B is preparing for a Japan trip.',
  'Internal Project X discussion.',
  'meeting-project-x',
  'Transcript content retained inside provider boundary.',
  'Project X was discussed in a video meeting.',
  'person:b',
]

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

async function get(url) {
  const response = await fetch(url)
  const body = await response.json()
  return { response, body }
}

async function post(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { response, body: await response.json() }
}

async function main() {
  try {
    start('services/relay/server.mjs', { PORT: String(relayPort) })
    await waitFor(`${relayUrl}/health`)

    for (const [, script, port] of definitions) {
      start(script, {
        PORT: String(port),
        RCP_RELAY_URL: relayUrl,
      })
    }
    await Promise.all(definitions.map(([, , port]) => waitFor(`http://127.0.0.1:${port}/health`)))

    start('services/control-plane/server.mjs', {
      PORT: String(controlPort),
      MAIL_URL: 'http://127.0.0.1:45501',
      MESSENGER_URL: 'http://127.0.0.1:45502',
      ENTERPRISE_URL: 'http://127.0.0.1:45503',
      PHONE_URL: 'http://127.0.0.1:45504',
      MEETING_URL: 'http://127.0.0.1:45505',
      RCP_RELAY_URL: relayUrl,
    })
    await waitFor(`http://127.0.0.1:${controlPort}/health`)

    const initialRelay = await get(`${relayUrl}/health`)
    assert.equal(initialRelay.response.ok, true)
    assert.equal(initialRelay.body.role, 'rcp-opaque-relay')
    assert.equal(initialRelay.body.pending_envelopes, 0)
    assert.equal(initialRelay.body.observed_transfers, 0)
    assert.equal(initialRelay.body.decrypt_capability, false)
    assert.equal(initialRelay.body.private_key_count, 0)

    const providerHealth = await Promise.all(definitions.map(async ([name, , port]) => {
      const status = await get(`http://127.0.0.1:${port}/health`)
      assert.equal(status.response.ok, true)
      assert.equal(status.body.relay_enabled, true, `${name} must route through relay in D5`)
      return status.body
    }))
    assert.equal(providerHealth.length, 5)

    const controlHealth = await get(`http://127.0.0.1:${controlPort}/health`)
    assert.equal(controlHealth.body.relay_enabled, true)

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
    assert.equal(executed.body.relay_receipts.length, 4)
    assert.equal(executed.body.envelopes.length, 4)
    assert.equal(executed.body.assertions.length, 4)
    assert.equal(executed.body.trace.at(-1).relay_routed_count, 4)

    const relayedSteps = executed.body.steps.filter(
      (step) => step.execution_status === 'relayed_verified_and_decrypted',
    )
    assert.equal(relayedSteps.length, 4)

    for (const receipt of executed.body.relay_receipts) {
      assert.equal(receipt.type, 'rcp.relay_receipt')
      assert.equal(receipt.rcp_version, '0.1')
      assert.equal(typeof receipt.relay_id, 'string')
      assert.equal(typeof receipt.envelope_id, 'string')
    }

    const relayAfter = await get(`${relayUrl}/health`)
    assert.equal(relayAfter.body.pending_envelopes, 0, 'ciphertext should be removed after one-time delivery')
    assert.equal(relayAfter.body.observed_transfers, 4)
    assert.equal(relayAfter.body.decrypt_capability, false)
    assert.equal(relayAfter.body.private_key_count, 0)

    const auditResponse = await get(`${relayUrl}/rcp/audit`)
    assert.equal(auditResponse.response.ok, true)
    assert.equal(auditResponse.body.transfers.length, 4)

    for (const record of auditResponse.body.transfers) {
      assert.equal(typeof record.envelope_id, 'string')
      assert.equal(typeof record.sender, 'string')
      assert.equal(record.recipient, 'consumer:relationship-agent')
      assert.equal(record.action, 'access')
      assert.equal(record.resource_class, 'relationship_context')
      assert.equal(record.purpose, 'meeting_preparation')
      assert.equal(record.destination, 'user:a:private-memory')
      assert.equal(typeof record.ciphertext_bytes, 'number')
      assert.ok(record.ciphertext_bytes > 100)
      assert.match(record.ciphertext_sha256, /^[a-f0-9]{64}$/)
      assert.equal(typeof record.received_at, 'string')
      assert.equal(typeof record.delivered_at, 'string')
      assert.equal(Object.hasOwn(record, 'resource_ref'), false, 'relay audit should not retain resource identifiers')
      assert.equal(Object.hasOwn(record, 'payload'), false)
      assert.equal(Object.hasOwn(record, 'jwe'), false)
    }

    const serializedAudit = JSON.stringify(auditResponse.body)
    for (const secret of forbiddenPlaintext) {
      assert.equal(
        serializedAudit.includes(secret),
        false,
        `relay audit must not retain protected plaintext: ${secret}`,
      )
    }

    // Delivery is one-time: the envelope itself is not retained after the
    // consumer has pulled it from the relay.
    const firstRelayId = executed.body.relay_receipts[0].relay_id
    const secondPull = await get(`${relayUrl}/rcp/envelopes/${encodeURIComponent(firstRelayId)}`)
    assert.equal(secondPull.response.status, 404)
    assert.equal(secondPull.body.error, 'relay_envelope_not_found')

    // The relay intentionally has no key-discovery or decrypt API.
    const keyAttempt = await get(`${relayUrl}/rcp/keys`)
    assert.equal(keyAttempt.response.status, 404)
    const decryptAttempt = await post(`${relayUrl}/rcp/decrypt`, { envelope_id: 'irrelevant' })
    assert.equal(decryptAttempt.response.status, 404)

    console.log('RCP operator-blind relay data path: PASS')
  } finally {
    for (const child of children.reverse()) child.kill('SIGTERM')
  }
}

await main()
