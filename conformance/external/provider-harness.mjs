import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import canonicalize from 'canonicalize'
import {
  compactDecrypt,
  exportJWK,
  flattenedVerify,
  generateKeyPair,
  importJWK,
} from 'jose'

const PROFILE = 'rcp-jose-x25519-a256gcm-ed25519-v0.1'
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const providerUrl = process.env.RCP_PROVIDER_URL?.replace(/\/$/, '')
const providerSubject = process.env.RCP_TEST_PROVIDER_SUBJECT
const requestedRepresentation = process.env.RCP_TEST_REPRESENTATION ?? null
const reportPath = path.resolve(
  process.env.RCP_CONFORMANCE_REPORT ?? path.join(process.cwd(), 'out', 'provider-report.json'),
)

const report = {
  type: 'rcp.external_provider_conformance_report',
  rcp_version: '0.1',
  harness_profile: 'external-provider-http-v0.1',
  generated_at: new Date().toISOString(),
  implementation: {
    name: process.env.RCP_IMPLEMENTATION_NAME ?? 'unspecified',
    version: process.env.RCP_IMPLEMENTATION_VERSION ?? 'unspecified',
    language: process.env.RCP_IMPLEMENTATION_LANGUAGE ?? 'unspecified',
  },
  provider: null,
  selected_representation: null,
  crypto_profile: PROFILE,
  cases: [],
  overall: 'fail',
  deviations: [],
}

function writeReport() {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
}

async function testCase(name, operation) {
  const started = Date.now()
  try {
    const details = await operation()
    report.cases.push({
      name,
      status: 'pass',
      duration_ms: Date.now() - started,
      ...(details === undefined ? {} : { details }),
    })
    return details
  } catch (error) {
    report.cases.push({
      name,
      status: 'fail',
      duration_ms: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

function canonicalBytes(value) {
  const canonical = canonicalize(value)
  assert.equal(typeof canonical, 'string', 'RFC 8785 canonicalization failed')
  return encoder.encode(canonical)
}

function withoutSignature(envelope) {
  const { signature, ...unsigned } = envelope
  return unsigned
}

async function requestJson(url, init = undefined) {
  const response = await fetch(url, init)
  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }
  return { response, body }
}

async function getJson(url) {
  const { response, body } = await requestJson(url)
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}: ${JSON.stringify(body)}`)
  }
  return body
}

async function postJson(url, payload) {
  return requestJson(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

function chooseRepresentation(capability) {
  if (requestedRepresentation) {
    assert.equal(
      capability.capabilities?.[requestedRepresentation],
      'allow',
      `requested representation ${requestedRepresentation} is not unconditional allow`,
    )
    return requestedRepresentation
  }
  for (const candidate of ['provider_context', 'interaction_metadata', 'content']) {
    if (capability.capabilities?.[candidate] === 'allow') return candidate
  }
  throw new Error('harness requires at least one unconditional allowed representation')
}

function chooseProcessingLocation(capability) {
  const locations = capability.processing_locations ?? []
  if (locations.includes('provider')) return 'provider'
  if (capability.capabilities?.external_processing === 'allow' && locations.length > 0) {
    return locations[0]
  }
  throw new Error('no unconditional harness-compatible processing location')
}

async function verifyEnvelope({ envelope, signingPublicJwk, recipientPrivateKey, request, decision }) {
  assert.equal(envelope.type, 'rcp.secure_envelope')
  assert.equal(envelope.rcp_version, '0.1')
  assert.equal(envelope.payload?.profile, PROFILE)
  assert.equal(envelope.signature?.profile, PROFILE)

  const signingKey = await importJWK(signingPublicJwk, 'Ed25519')
  const verified = await flattenedVerify(
    {
      protected: envelope.signature.protected,
      signature: envelope.signature.signature,
      payload: canonicalBytes(withoutSignature(envelope)),
    },
    signingKey,
    { algorithms: ['Ed25519'] },
  )
  assert.equal(verified.protectedHeader.alg, 'Ed25519')
  assert.equal(verified.protectedHeader.typ, 'application/rcp+jws')
  assert.equal(verified.protectedHeader.b64, false)
  assert.deepEqual(verified.protectedHeader.crit, ['b64'])

  const expected = {
    sender: report.provider,
    recipient: 'conformance:consumer',
    action: request.action,
    resource_ref: request.resource,
    purpose: request.purpose,
    destination: request.destination,
    processing_location: request.processing_location,
    permission_decision_ref: decision.decision_id,
  }
  for (const [field, value] of Object.entries(expected)) {
    assert.equal(envelope[field], value, `SecureEnvelope ${field} binding mismatch`)
  }
  assert.ok(Date.parse(envelope.issued_at) >= Date.parse(decision.evaluated_at))
  assert.ok(Date.parse(envelope.expires_at) <= Date.parse(decision.expires_at))

  const decrypted = await compactDecrypt(envelope.payload.jwe, recipientPrivateKey, {
    keyManagementAlgorithms: ['ECDH-ES'],
    contentEncryptionAlgorithms: ['A256GCM'],
  })
  assert.equal(decrypted.protectedHeader.alg, 'ECDH-ES')
  assert.equal(decrypted.protectedHeader.enc, 'A256GCM')
  assert.equal(decrypted.protectedHeader.typ, 'application/rcp+jwe')
  assert.equal(decrypted.protectedHeader.cty, 'application/rcp+json')
  assert.equal(decrypted.protectedHeader.zip, undefined)

  const result = JSON.parse(decoder.decode(decrypted.plaintext))
  assert.equal(result.type, 'rcp.provider_result')
  assert.equal(result.rcp_version, '0.1')
  assert.equal(result.provider, report.provider)
  assert.equal(result.resource, request.resource)
  assert.equal(result.representation, report.selected_representation)
  assert.equal(result.decision_id, decision.decision_id)
  assert.ok(Array.isArray(result.items), 'provider_result.items must be an array')
  return result
}

async function main() {
  try {
    assert.ok(providerUrl, 'RCP_PROVIDER_URL is required')
    assert.ok(providerSubject, 'RCP_TEST_PROVIDER_SUBJECT is required')

    const capability = await testCase('capability_discovery', async () => {
      const value = await getJson(`${providerUrl}/rcp/capabilities`)
      assert.equal(value.type, 'rcp.provider_capability')
      assert.equal(value.rcp_version, '0.1')
      assert.equal(typeof value.provider, 'string')
      assert.ok(value.provider.length > 0)
      assert.equal(typeof value.capability_version, 'string')
      return value
    })
    report.provider = capability.provider

    const representation = chooseRepresentation(capability)
    const processingLocation = chooseProcessingLocation(capability)
    report.selected_representation = representation

    const keySet = await testCase('provider_signing_key_discovery', async () => {
      const value = await getJson(`${providerUrl}/rcp/keys`)
      assert.equal(value.provider, capability.provider)
      assert.ok(Array.isArray(value.signing_keys) && value.signing_keys.length > 0)
      const key = value.signing_keys[0]
      assert.equal(key.kty, 'OKP')
      assert.equal(key.crv, 'Ed25519')
      assert.equal(typeof key.kid, 'string')
      return value
    })

    const recipientKeys = await generateKeyPair('ECDH-ES', { crv: 'X25519' })
    const recipientPublicJwk = {
      ...(await exportJWK(recipientKeys.publicKey)),
      kid: 'conformance-recipient-1',
      use: 'enc',
    }

    const request = {
      type: 'rcp.permission_request',
      rcp_version: '0.1',
      request_id: `request:external-harness:${Date.now()}`,
      requester: 'conformance:user',
      executor: capability.provider,
      action: 'access',
      resource: `${capability.provider}:${representation}:${providerSubject}`,
      subject: 'conformance:person',
      purpose: 'meeting_preparation',
      destination: 'conformance:consumer',
      processing_location: processingLocation,
      requested_at: new Date().toISOString(),
    }

    const forged = await testCase('forged_decision_fails_closed', async () => {
      const attempt = await postJson(`${providerUrl}/rcp/retrieve`, {
        request,
        decision_id: 'decision:forged-by-harness',
        representation,
        recipient: 'conformance:consumer',
        recipient_public_jwk: recipientPublicJwk,
      })
      assert.equal(attempt.response.ok, false, 'forged decision unexpectedly retrieved data')
      return { http_status: attempt.response.status }
    })
    void forged

    const decision = await testCase('permission_evaluation', async () => {
      const evaluated = await postJson(`${providerUrl}/rcp/permissions/evaluate`, {
        request,
        representation,
        satisfied_limitations: [],
      })
      assert.equal(evaluated.response.ok, true, `permission endpoint returned ${evaluated.response.status}`)
      const value = evaluated.body
      assert.equal(value.type, 'rcp.permission_decision')
      assert.equal(value.rcp_version, '0.1')
      assert.equal(value.request_id, request.request_id)
      assert.equal(value.decision, 'allow')
      assert.equal(typeof value.decision_id, 'string')
      assert.equal(typeof value.expires_at, 'string')
      assert.ok(Date.parse(value.expires_at) > Date.now())
      assert.ok(
        value.policy_versions?.includes(`capability:${capability.capability_version}`),
        'allow decision must record current capability dependency for this harness profile',
      )
      return value
    })

    await testCase('mutated_request_fails_closed', async () => {
      const mutated = { ...request, purpose: 'advertising' }
      const attempt = await postJson(`${providerUrl}/rcp/retrieve`, {
        request: mutated,
        decision_id: decision.decision_id,
        representation,
        recipient: 'conformance:consumer',
        recipient_public_jwk: recipientPublicJwk,
      })
      assert.equal(attempt.response.ok, false, 'mutated request unexpectedly retrieved data')
      return { http_status: attempt.response.status }
    })

    await testCase('representation_mismatch_fails_closed', async () => {
      const mismatched = representation === 'content' ? 'provider_context' : 'content'
      const attempt = await postJson(`${providerUrl}/rcp/retrieve`, {
        request,
        decision_id: decision.decision_id,
        representation: mismatched,
        recipient: 'conformance:consumer',
        recipient_public_jwk: recipientPublicJwk,
      })
      assert.equal(attempt.response.ok, false, 'representation mismatch unexpectedly retrieved data')
      return { http_status: attempt.response.status, attempted_representation: mismatched }
    })

    const providerResult = await testCase('secure_envelope_round_trip', async () => {
      const retrieval = await postJson(`${providerUrl}/rcp/retrieve`, {
        request,
        decision_id: decision.decision_id,
        representation,
        recipient: 'conformance:consumer',
        recipient_public_jwk: recipientPublicJwk,
      })
      assert.equal(retrieval.response.ok, true, `retrieval returned ${retrieval.response.status}`)
      assert.equal(retrieval.body.type, 'rcp.secure_envelope', 'Provider returned plaintext instead of SecureEnvelope')
      return verifyEnvelope({
        envelope: retrieval.body,
        signingPublicJwk: keySet.signing_keys[0],
        recipientPrivateKey: recipientKeys.privateKey,
        request,
        decision,
      })
    })

    report.provider_result_item_count = providerResult.items.length
    report.overall = 'pass'
    writeReport()
    console.log(`RCP external Provider harness: PASS (${report.provider})`)
    console.log(`Report: ${reportPath}`)
  } catch (error) {
    report.overall = 'fail'
    report.deviations.push(error instanceof Error ? error.message : String(error))
    writeReport()
    console.error(`RCP external Provider harness: FAIL — ${report.deviations.at(-1)}`)
    console.error(`Report: ${reportPath}`)
    process.exitCode = 1
  }
}

await main()
