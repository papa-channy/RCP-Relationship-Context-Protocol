import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const bindingsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(bindingsDir, '../..');
const assertionUri = 'rcp://relationship/a-b/assertions/binding-equivalent';
const python = process.env.PYTHON || 'python';
const normalizer = join(repoRoot, 'conformance/v0_2/normalize_wire.py');
const fixturePath = join(bindingsDir, 'assertion.json');

function normalize(path) {
  const result = spawnSync(python, [normalizer, path], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env
  });

  if (result.status !== 0) {
    throw new Error(
      `normalizer failed for ${path}:\n${result.stderr || result.stdout || `exit ${result.status}`}`
    );
  }

  return result.stdout.trim();
}

async function startHttpServer() {
  const child = spawn(process.execPath, [join(bindingsDir, 'http-server.mjs')], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const lines = createInterface({ input: child.stdout });
  const stderr = [];
  child.stderr.on('data', chunk => stderr.push(chunk.toString()));

  const linePromise = once(lines, 'line');
  const exitPromise = once(child, 'exit').then(([code]) => {
    throw new Error(`HTTP binding server exited before readiness with code ${code}: ${stderr.join('')}`);
  });

  const [line] = await Promise.race([linePromise, exitPromise]);
  const ready = JSON.parse(line);
  return { child, ready };
}

async function readViaMcp() {
  const client = new Client({
    name: 'rcp-binding-equivalence-client',
    version: '0.2.0-draft'
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(bindingsDir, 'mcp-server.mjs')],
    cwd: repoRoot
  });

  await client.connect(transport);
  try {
    const result = await client.readResource({ uri: assertionUri });
    const content = result.contents.find(item => 'text' in item);
    assert.ok(content, 'MCP resource must return a text representation');
    assert.equal(content.uri, assertionUri);
    assert.equal(content.mimeType, 'application/rcp+json');
    return JSON.parse(content.text);
  } finally {
    await client.close();
  }
}

async function readViaHttp(ready) {
  const url = `http://127.0.0.1:${ready.port}${ready.path}`;
  const response = await fetch(url, {
    headers: {
      'x-client-transport-only-metadata': 'ignored-by-rcp-core'
    }
  });

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /^application\/rcp\+json/);
  assert.equal(response.headers.get('x-transport-only-binding'), 'plain-http-v0.2-draft');
  return response.json();
}

async function main() {
  const tempDir = await mkdtemp(join(tmpdir(), 'rcp-binding-equivalence-'));
  const mcpPath = join(tempDir, 'mcp.json');
  const httpPath = join(tempDir, 'http.json');

  const { child: httpServer, ready } = await startHttpServer();

  try {
    const [mcpAssertion, httpAssertion] = await Promise.all([
      readViaMcp(),
      readViaHttp(ready)
    ]);

    await Promise.all([
      writeFile(mcpPath, JSON.stringify(mcpAssertion, null, 2)),
      writeFile(httpPath, JSON.stringify(httpAssertion, null, 2))
    ]);

    const fixtureSemantic = normalize(fixturePath);
    const mcpSemantic = normalize(mcpPath);
    const httpSemantic = normalize(httpPath);

    assert.equal(
      mcpSemantic,
      fixtureSemantic,
      'MCP binding changed the canonical RCP semantic state'
    );
    assert.equal(
      httpSemantic,
      fixtureSemantic,
      'HTTP binding changed the canonical RCP semantic state'
    );
    assert.equal(
      mcpSemantic,
      httpSemantic,
      'MCP and HTTP bindings produced different canonical RCP semantic states'
    );

    console.log('RCP v0.2 real binding equivalence: PASS');
    console.log(`- MCP resource: ${assertionUri}`);
    console.log(`- HTTP path: ${ready.path}`);
    console.log('- Both outputs passed the same JSON Schema + RCP semantic validator');
    console.log('- Both outputs normalized to identical canonical relationship state');
  } finally {
    httpServer.kill('SIGTERM');
    await once(httpServer, 'exit').catch(() => {});
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
