import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const outputDir = path.join(root, 'out')
const seedPath = path.join(here, 'canonical-identity-seeds.json')

const providerDefinitions = [
  ['demo:mail', 'services/mail-provider/server.mjs', 45601],
  ['demo:messenger', 'services/messenger-provider/server.mjs', 45602],
  ['demo:enterprise', 'services/enterprise-provider/server.mjs', 45603],
  ['demo:phone', 'services/phone-provider/server.mjs', 45604],
  ['demo:meeting', 'services/meeting-provider/server.mjs', 45605],
]
const relayPort = 45680
const controlPort = 45690
const relayUrl = `http://127.0.0.1:${relayPort}`
const controlUrl = `http://127.0.0.1:${controlPort}`
const children = []

function start(script, env = {}) {
  const child = spawn(process.execPath, [script], {
    cwd: root,
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

async function getJson(url) {
  const response = await fetch(url)
  const body = await response.json()
  if (!response.ok) throw new Error(`GET ${url} failed with ${response.status}: ${JSON.stringify(body)}`)
  return body
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(`POST ${url} failed with ${response.status}: ${JSON.stringify(body)}`)
  return body
}

function renderBrief({ identityResolution, execution, relayAudit }) {
  const claimById = new Map(identityResolution.claims.map((claim) => [claim.claim_id, claim]))
  const bindingLines = Object.values(identityResolution.bindings)
    .sort((a, b) => a.provider.localeCompare(b.provider))
    .map((binding) => {
      const claim = claimById.get(binding.claim_id)
      return `- ${binding.provider} -> ${claim.identity_type} (${binding.verification_state})`
    })

  const contextText = execution.brief.text || '- No active relationship context.'

  return [
    'RCP Canonical Relationship Brief',
    '================================',
    `Tenant: ${identityResolution.tenant}`,
    `Subject: ${identityResolution.person_id}`,
    `Identity resolution: ${Object.keys(identityResolution.bindings).length} provider bindings (${identityResolution.status})`,
    `Active relationship context: ${execution.brief.active_assertion_count}`,
    `Encrypted relay transfers: ${relayAudit.transfers.length}`,
    '',
    'Context',
    '-------',
    contextText,
    '',
    'Provider identity bindings',
    '--------------------------',
    ...bindingLines,
    '',
    'Execution summary',
    '-----------------',
    `- Envelopes verified/decrypted: ${execution.envelopes.length}`,
    `- ContextAssertions activated: ${execution.assertions.length}`,
    `- Relay-routed envelopes: ${execution.relay_receipts.length}`,
    `- Stale providers: ${execution.trace.at(-1).stale_provider_count}`,
    '',
  ].join('\n')
}

async function main() {
  try {
    start('services/relay/server.mjs', { PORT: String(relayPort) })
    await waitFor(`${relayUrl}/health`)

    for (const [, script, port] of providerDefinitions) {
      start(script, {
        PORT: String(port),
        RCP_RELAY_URL: relayUrl,
      })
    }
    await Promise.all(
      providerDefinitions.map(([, , port]) => waitFor(`http://127.0.0.1:${port}/health`)),
    )

    start('services/control-plane/server.mjs', {
      PORT: String(controlPort),
      MAIL_URL: 'http://127.0.0.1:45601',
      MESSENGER_URL: 'http://127.0.0.1:45602',
      ENTERPRISE_URL: 'http://127.0.0.1:45603',
      PHONE_URL: 'http://127.0.0.1:45604',
      MEETING_URL: 'http://127.0.0.1:45605',
      RCP_RELAY_URL: relayUrl,
    })
    await waitFor(`${controlUrl}/health`)

    const identityInput = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
    const identityResolution = await postJson(`${controlUrl}/rcp/identity/resolve`, identityInput)
    assert.equal(identityResolution.status, 'resolved')
    assert.equal(identityResolution.tenant, 'user:a')
    assert.equal(identityResolution.person_id, 'person:b')
    assert.equal(identityResolution.claims.length, 5)
    assert.equal(Object.keys(identityResolution.bindings).length, 5)

    const retrievedResolution = await getJson(
      `${controlUrl}/rcp/identity/resolutions/${encodeURIComponent(identityResolution.resolution_id)}?tenant=user%3Aa`,
    )
    assert.equal(retrievedResolution.resolution_id, identityResolution.resolution_id)

    const plan = await postJson(`${controlUrl}/rcp/plan`, {
      tenant: 'user:a',
      identity_resolution_id: identityResolution.resolution_id,
      purpose: 'meeting_preparation',
      destination: 'user:a:private-memory',
      processing_location: 'device',
    })
    assert.equal(plan.subject, 'person:b')
    assert.equal(plan.identity_resolution_id, identityResolution.resolution_id)
    assert.equal(plan.trace[0].identity_resolution_applied, true)

    const expectedProviderSubjects = new Map([
      ['demo:mail', 'provider-local:b-mail'],
      ['demo:messenger', 'provider-local:b-messenger'],
      ['demo:enterprise', 'provider-local:b-enterprise'],
      ['demo:phone', 'provider-local:b-phone'],
      ['demo:meeting', 'provider-local:b-meeting'],
    ])
    for (const step of plan.steps) {
      if (step.status !== 'planned') continue
      assert.equal(step.request.subject, 'person:b')
      assert.equal(step.provider_subject, expectedProviderSubjects.get(step.provider))
      assert.ok(step.request.resource.endsWith(`:${step.provider_subject}`))
      assert.equal(typeof step.identity_claim_ref, 'string')
      assert.equal(step.identity_verification_state, 'user_confirmed')
    }

    const evaluated = await postJson(`${controlUrl}/rcp/evaluate`, plan)
    const execution = await postJson(`${controlUrl}/rcp/execute`, evaluated)
    assert.equal(execution.envelopes.length, 4)
    assert.equal(execution.relay_receipts.length, 4)
    assert.equal(execution.assertions.length, 4)
    assert.equal(execution.brief.subject, 'person:b')
    assert.equal(execution.brief.active_assertion_count, 4)
    assert.equal(execution.trace.at(-1).relay_routed_count, 4)

    const relayAudit = await getJson(`${relayUrl}/rcp/audit`)
    assert.equal(relayAudit.transfers.length, 4)
    const relayHealth = await getJson(`${relayUrl}/health`)
    assert.equal(relayHealth.pending_envelopes, 0)
    assert.equal(relayHealth.decrypt_capability, false)
    assert.equal(relayHealth.private_key_count, 0)

    const trace = {
      type: 'rcp.reference_demo_trace',
      rcp_version: '0.1',
      scenario: 'canonical-meeting-preparation',
      generated_at: new Date().toISOString(),
      identity_resolution: identityResolution,
      processing_plan: plan,
      evaluated_plan: evaluated,
      execution,
      relay_audit: relayAudit,
    }
    const humanBrief = renderBrief({ identityResolution, execution, relayAudit })

    fs.rmSync(outputDir, { recursive: true, force: true })
    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(
      path.join(outputDir, 'canonical-trace.json'),
      `${JSON.stringify(trace, null, 2)}\n`,
      'utf8',
    )
    fs.writeFileSync(
      path.join(outputDir, 'canonical-brief.txt'),
      `${humanBrief}\n`,
      'utf8',
    )

    assert.equal(fs.existsSync(path.join(outputDir, 'canonical-trace.json')), true)
    assert.equal(fs.existsSync(path.join(outputDir, 'canonical-brief.txt')), true)

    console.log(humanBrief)
    console.log(`Machine trace: ${path.relative(root, path.join(outputDir, 'canonical-trace.json'))}`)
    console.log(`Human brief: ${path.relative(root, path.join(outputDir, 'canonical-brief.txt'))}`)
    console.log('RCP canonical identity-resolved reference demo: PASS')
  } finally {
    for (const child of children.reverse()) child.kill('SIGTERM')
  }
}

await main()
