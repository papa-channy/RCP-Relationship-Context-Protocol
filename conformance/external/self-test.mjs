import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const repoRoot = path.resolve(new URL('../..', import.meta.url).pathname)
const providerEntry = path.join(
  repoRoot,
  'reference-ecosystem',
  'services',
  'mail-provider',
  'server.mjs',
)
const harnessEntry = path.join(repoRoot, 'conformance', 'external', 'provider-harness.mjs')
const port = 4381
const providerUrl = `http://127.0.0.1:${port}`
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rcp-external-harness-'))
const reportPath = path.join(tmpDir, 'provider-report.json')

function spawnProcess(command, args, options = {}) {
  return spawn(command, args, {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  })
}

async function waitForHealth(url, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs
  let lastError = null
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch (error) {
      lastError = error
    }
    await sleep(100)
  }
  throw new Error(`provider did not become healthy: ${lastError?.message ?? 'timeout'}`)
}

function collect(child) {
  let stdout = ''
  let stderr = ''
  child.stdout?.on('data', (chunk) => { stdout += chunk.toString() })
  child.stderr?.on('data', (chunk) => { stderr += chunk.toString() })
  return {
    stdout: () => stdout,
    stderr: () => stderr,
  }
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) => resolve({ code, signal }))
  })
}

async function terminate(child) {
  if (child.exitCode !== null || child.signalCode !== null) return
  child.kill('SIGTERM')
  const exited = await Promise.race([
    waitForExit(child),
    sleep(2_000).then(() => null),
  ])
  if (!exited && child.exitCode === null) child.kill('SIGKILL')
}

const provider = spawnProcess(process.execPath, [providerEntry], {
  env: {
    ...process.env,
    PORT: String(port),
  },
})
const providerOutput = collect(provider)

try {
  await waitForHealth(`${providerUrl}/health`)

  const harness = spawnProcess(process.execPath, [harnessEntry], {
    env: {
      ...process.env,
      RCP_PROVIDER_URL: providerUrl,
      RCP_TEST_PROVIDER_SUBJECT: 'provider-local:b-mail',
      RCP_CONFORMANCE_REPORT: reportPath,
      RCP_IMPLEMENTATION_NAME: 'rcp-reference-mail-provider',
      RCP_IMPLEMENTATION_VERSION: 'self-test',
      RCP_IMPLEMENTATION_LANGUAGE: 'javascript-node',
    },
  })
  const harnessOutput = collect(harness)
  const result = await waitForExit(harness)

  assert.equal(
    result.code,
    0,
    `external harness failed\nstdout:\n${harnessOutput.stdout()}\nstderr:\n${harnessOutput.stderr()}`,
  )
  assert.equal(fs.existsSync(reportPath), true, 'external harness did not emit report')

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  assert.equal(report.type, 'rcp.external_provider_conformance_report')
  assert.equal(report.rcp_version, '0.1')
  assert.equal(report.overall, 'pass')
  assert.equal(report.provider, 'demo:mail')
  assert.ok(Array.isArray(report.cases))

  const requiredCases = [
    'capability_discovery',
    'provider_signing_key_discovery',
    'forged_decision_fails_closed',
    'permission_evaluation',
    'mutated_request_fails_closed',
    'representation_mismatch_fails_closed',
    'secure_envelope_round_trip',
  ]
  for (const name of requiredCases) {
    const testCase = report.cases.find((entry) => entry.name === name)
    assert.ok(testCase, `missing harness case: ${name}`)
    assert.equal(testCase.status, 'pass', `harness case failed: ${name}`)
  }

  console.log('RCP external Provider harness self-test: PASS')
  console.log(`Report: ${reportPath}`)
} catch (error) {
  console.error('RCP external Provider harness self-test: FAIL')
  console.error(error)
  console.error(`provider stdout:\n${providerOutput.stdout()}`)
  console.error(`provider stderr:\n${providerOutput.stderr()}`)
  process.exitCode = 1
} finally {
  await terminate(provider)
}
