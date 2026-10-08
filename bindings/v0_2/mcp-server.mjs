import { readFile } from 'node:fs/promises';

import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

const ASSERTION_URI = 'rcp://relationship/a-b/assertions/binding-equivalent';
const assertionText = await readFile(new URL('./assertion.json', import.meta.url), 'utf8');

function createServer() {
  const server = new McpServer({
    name: 'rcp-v0-2-binding-provider',
    version: '0.2.0-draft'
  });

  server.registerResource(
    'relationship-context-assertion',
    ASSERTION_URI,
    {
      title: 'RCP Relationship Context Assertion',
      description: 'RCP v0.2 draft ContextAssertion exposed as an MCP Resource',
      mimeType: 'application/rcp+json'
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/rcp+json',
          text: assertionText
        }
      ]
    })
  );

  return server;
}

void serveStdio(createServer);
