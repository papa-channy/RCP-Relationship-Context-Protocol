import http from 'node:http'
import fs from 'node:fs'

export function loadJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

export function createProviderServer({ capabilityPath, statePath, port }) {
  const capability = loadJson(capabilityPath)
  // State is intentionally owned and loaded by this provider process but not
  // exposed by the bootstrap topology. Protected-data routes will be added
  // only together with permission-before-retrieval enforcement.
  const state = loadJson(statePath)

  const server = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json; charset=utf-8')

    if (req.method === 'GET' && req.url === '/health') {
      res.end(JSON.stringify({
        status: 'ok',
        provider: capability.provider,
        state_revision: state.revision,
      }))
      return
    }

    if (req.method === 'GET' && req.url === '/rcp/capabilities') {
      res.end(JSON.stringify(capability))
      return
    }

    res.statusCode = 404
    res.end(JSON.stringify({ error: 'not_found' }))
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
