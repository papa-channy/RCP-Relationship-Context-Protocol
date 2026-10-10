import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const assertionText = await readFile(new URL('./assertion.json', import.meta.url), 'utf8');
const PATH = '/rcp/relationships/a-b/assertions/binding-equivalent';

const server = createServer((request, response) => {
  if (request.method !== 'GET' || request.url !== PATH) {
    response.writeHead(404, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ error: 'not_found' }));
    return;
  }

  response.writeHead(200, {
    'content-type': 'application/rcp+json',
    'cache-control': 'no-store',
    'x-transport-only-binding': 'plain-http-v0.2-draft'
  });
  response.end(assertionText);
});

server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('expected TCP address');
  }
  process.stdout.write(`${JSON.stringify({ port: address.port, path: PATH })}\n`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
