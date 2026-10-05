import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'

const definitions = [
  ['mail', 'services/mail-provider/server.mjs', 45101],
  ['messenger', 'services/messenger-provider/server.mjs', 45102],
  ['enterprise', 'services/enterprise-provider/server.mjs', 45103],
  ['phone', 'services/phone-provider/server.mjs', 45104],
  ['meeting', 'services/meeting-provider/server.mjs', 45105],
]
const controlPort = 45190
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

async function waitFor(url, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error(`service did not become healthy: ${url}`)
}

async function main() {
  try {
    for (const [, script, port] of definitions) start(script, { PORT: String(port) })
    await Promise.all(definitions.map(([, , port]) => waitFor(`http://127.0.0.1:${port}/health`)))

    start('services/control-plane/server.mjs', {
      PORT: String(controlPort),
      MAIL_URL: 'http://127.0.0.1:45101',
      MESSENGER_URL: 'http://127.0.0.1:45102',
      ENTERPRISE_URL: 'http://127.0.0.1:45103',
      PHONE_URL: 'http://127.0.0.1:45104',
      MEETING_URL: 'http://127.0.0.1:45105',
    })
    await waitFor(`http://127.0.0.1:${controlPort}/health`)

    const response = await fetch(`http://127.0.0.1:${controlPort}/rcp/providers`)
    assert.equal(response.ok, true)
    const topology = await response.json()
    assert.equal(topology.providers.length, 5)

    const map = new Map(topology.providers.map((entry) => [entry.id, entry.capability]))
    assert.equal(map.get('demo:mail').capabilities.content, 'allow')
    assert.equal(map.get('demo:messenger').capabilities.content, 'deny')
    assert.equal(map.get('demo:messenger').capabilities.provider_context, 'allow')
    assert.equal(map.get('demo:enterprise').processing_locations.length, 1)
    assert.equal(map.get('demo:enterprise').processing_locations[0], 'provider')
    assert.equal(map.get('demo:phone').capabilities.provider_context, 'deny')
    assert.equal(map.get('demo:meeting').capabilities.content, 'limited')

    for (const [, , port] of definitions) {
      const protectedAttempt = await fetch(`http://127.0.0.1:${port}/state`)
      assert.equal(protectedAttempt.status, 404, 'bootstrap provider must not expose protected state')
    }

    console.log('RCP reference ecosystem topology smoke: PASS')
  } finally {
    for (const child of children.reverse()) child.kill('SIGTERM')
  }
}

await main()
