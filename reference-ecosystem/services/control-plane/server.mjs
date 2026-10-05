import http from 'node:http'

const port = Number(process.env.PORT ?? 4190)
const providers = [
  ['demo:mail', process.env.MAIL_URL ?? 'http://127.0.0.1:4101'],
  ['demo:messenger', process.env.MESSENGER_URL ?? 'http://127.0.0.1:4102'],
  ['demo:enterprise', process.env.ENTERPRISE_URL ?? 'http://127.0.0.1:4103'],
  ['demo:phone', process.env.PHONE_URL ?? 'http://127.0.0.1:4104'],
  ['demo:meeting', process.env.MEETING_URL ?? 'http://127.0.0.1:4105'],
]

async function discover() {
  return Promise.all(providers.map(async ([id, baseUrl]) => {
    const response = await fetch(`${baseUrl}/rcp/capabilities`)
    if (!response.ok) throw new Error(`capability discovery failed for ${id}: ${response.status}`)
    const capability = await response.json()
    if (capability.provider !== id) throw new Error(`provider identity mismatch: expected ${id}`)
    return { id, base_url: baseUrl, capability }
  }))
}

const server = http.createServer(async (req, res) => {
  res.setHeader('content-type', 'application/json; charset=utf-8')
  try {
    if (req.method === 'GET' && req.url === '/health') {
      res.end(JSON.stringify({ status: 'ok', role: 'rcp-control-plane' }))
      return
    }
    if (req.method === 'GET' && req.url === '/rcp/providers') {
      res.end(JSON.stringify({ providers: await discover() }))
      return
    }
    res.statusCode = 404
    res.end(JSON.stringify({ error: 'not_found' }))
  } catch (error) {
    res.statusCode = 502
    res.end(JSON.stringify({ error: 'provider_discovery_failed', message: error.message }))
  }
})

server.listen(port, '127.0.0.1', () => console.log(`RCP control plane listening on ${port}`))
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)))
