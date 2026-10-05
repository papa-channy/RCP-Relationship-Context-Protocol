import http from 'node:http'
import { createHash, randomUUID } from 'node:crypto'

const port = Number(process.env.PORT ?? 4180)
const pending = new Map()
const audit = []

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

function digest(value) {
  return createHash('sha256').update(value).digest('hex')
}

function validateEnvelope(envelope) {
  return Boolean(
    envelope &&
    envelope.type === 'rcp.secure_envelope' &&
    envelope.rcp_version === '0.1' &&
    typeof envelope.envelope_id === 'string' &&
    typeof envelope.sender === 'string' &&
    typeof envelope.recipient === 'string' &&
    typeof envelope.payload?.jwe === 'string' &&
    typeof envelope.signature?.signature === 'string'
  )
}

function observe(relayId, envelope) {
  const ciphertext = envelope.payload.jwe
  return {
    relay_id: relayId,
    envelope_id: envelope.envelope_id,
    sender: envelope.sender,
    recipient: envelope.recipient,
    action: envelope.action,
    resource_class: envelope.resource_class,
    purpose: envelope.purpose,
    destination: envelope.destination,
    processing_location: envelope.processing_location,
    permission_decision_ref: envelope.permission_decision_ref,
    payload_profile: envelope.payload.profile,
    signature_profile: envelope.signature.profile,
    ciphertext_bytes: Buffer.byteLength(ciphertext, 'utf8'),
    ciphertext_sha256: digest(ciphertext),
    received_at: new Date().toISOString(),
    delivered_at: null,
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, 'http://127.0.0.1')

    if (req.method === 'GET' && requestUrl.pathname === '/health') {
      json(res, 200, {
        status: 'ok',
        role: 'rcp-opaque-relay',
        pending_envelopes: pending.size,
        observed_transfers: audit.length,
        decrypt_capability: false,
        private_key_count: 0,
      })
      return
    }

    if (req.method === 'GET' && requestUrl.pathname === '/rcp/audit') {
      json(res, 200, {
        transfers: audit.map((record) => ({ ...record })),
      })
      return
    }

    if (req.method === 'POST' && requestUrl.pathname === '/rcp/envelopes') {
      const envelope = await readJsonBody(req)
      if (!validateEnvelope(envelope)) {
        json(res, 400, { error: 'invalid_secure_envelope' })
        return
      }

      const relayId = `relay:${randomUUID()}`
      pending.set(relayId, structuredClone(envelope))
      audit.push(observe(relayId, envelope))

      json(res, 202, {
        type: 'rcp.relay_receipt',
        rcp_version: '0.1',
        relay_id: relayId,
        envelope_id: envelope.envelope_id,
        accepted_at: new Date().toISOString(),
      })
      return
    }

    if (req.method === 'GET' && requestUrl.pathname.startsWith('/rcp/envelopes/')) {
      const relayId = decodeURIComponent(requestUrl.pathname.slice('/rcp/envelopes/'.length))
      const envelope = pending.get(relayId)
      if (!envelope) {
        json(res, 404, { error: 'relay_envelope_not_found' })
        return
      }

      pending.delete(relayId)
      const observation = audit.find((record) => record.relay_id === relayId)
      if (observation) observation.delivered_at = new Date().toISOString()

      json(res, 200, envelope)
      return
    }

    json(res, 404, { error: 'not_found' })
  } catch (error) {
    json(res, 400, { error: 'relay_request_failed', message: error.message })
  }
})

server.listen(port, '127.0.0.1', () => console.log(`RCP opaque relay listening on ${port}`))
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)))
