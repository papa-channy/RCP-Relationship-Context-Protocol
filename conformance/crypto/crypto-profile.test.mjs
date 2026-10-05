import assert from 'node:assert/strict'
import canonicalize from 'canonicalize'
import {
  CompactEncrypt,
  FlattenedSign,
  compactDecrypt,
  flattenedVerify,
  generateKeyPair,
} from 'jose'

const PROFILE = 'rcp-jose-x25519-a256gcm-ed25519-v0.1'
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function canonicalBytes(value) {
  const canonical = canonicalize(value)
  assert.equal(typeof canonical, 'string', 'RFC 8785 canonicalization must succeed')
  return encoder.encode(canonical)
}

function withoutSignature(envelope) {
  const { signature, ...unsigned } = envelope
  return unsigned
}

async function encryptPayload(payload, recipientPublicKey, enc = 'A256GCM') {
  return new CompactEncrypt(canonicalBytes(payload))
    .setProtectedHeader({
      alg: 'ECDH-ES',
      enc,
      kid: 'recipient-enc-1',
      typ: 'application/rcp+jwe',
      cty: 'application/rcp+json',
    })
    .encrypt(recipientPublicKey)
}

async function signEnvelope(unsignedEnvelope, signingPrivateKey) {
  const jws = await new FlattenedSign(canonicalBytes(unsignedEnvelope))
    .setProtectedHeader({
      alg: 'Ed25519',
      kid: 'provider-sign-1',
      typ: 'application/rcp+jws',
      b64: false,
      crit: ['b64'],
    })
    .sign(signingPrivateKey)

  return {
    profile: PROFILE,
    protected: jws.protected,
    signature: jws.signature,
  }
}

async function createEnvelope({ payload, recipientPublicKey, signingPrivateKey, enc = 'A256GCM' }) {
  const jwe = await encryptPayload(payload, recipientPublicKey, enc)

  const unsigned = {
    type: 'rcp.secure_envelope',
    rcp_version: '0.1',
    envelope_id: 'envelope:crypto:001',
    sender: 'provider:demo-mail',
    recipient: 'consumer:relationship-agent',
    action: 'process',
    resource_ref: 'demo:mail:context:b',
    resource_class: 'relationship_context',
    purpose: 'meeting_preparation',
    destination: 'user:a:private-memory',
    processing_location: 'device',
    permission_decision_ref: 'decision:crypto:001',
    policy_refs: ['demo:mail:policy:relationship-memory-v1'],
    issued_at: '2026-10-05T10:01:00Z',
    expires_at: '2026-10-05T10:20:00Z',
    payload: {
      profile: PROFILE,
      jwe,
    },
  }

  return {
    ...unsigned,
    signature: await signEnvelope(unsigned, signingPrivateKey),
  }
}

async function verifyAndDecrypt(envelope, signingPublicKey, recipientPrivateKey) {
  assert.equal(envelope.payload.profile, PROFILE, 'unsupported payload profile')
  assert.equal(envelope.signature.profile, PROFILE, 'unsupported signature profile')

  const unsigned = withoutSignature(envelope)
  const verified = await flattenedVerify(
    {
      protected: envelope.signature.protected,
      signature: envelope.signature.signature,
      payload: canonicalBytes(unsigned),
    },
    signingPublicKey,
    { algorithms: ['Ed25519'] },
  )

  assert.equal(verified.protectedHeader.alg, 'Ed25519')
  assert.equal(verified.protectedHeader.kid, 'provider-sign-1')
  assert.equal(verified.protectedHeader.typ, 'application/rcp+jws')
  assert.equal(verified.protectedHeader.b64, false)
  assert.deepEqual(verified.protectedHeader.crit, ['b64'])

  const decrypted = await compactDecrypt(envelope.payload.jwe, recipientPrivateKey, {
    keyManagementAlgorithms: ['ECDH-ES'],
    contentEncryptionAlgorithms: ['A256GCM'],
  })

  assert.equal(decrypted.protectedHeader.alg, 'ECDH-ES')
  assert.equal(decrypted.protectedHeader.enc, 'A256GCM')
  assert.equal(decrypted.protectedHeader.kid, 'recipient-enc-1')
  assert.equal(decrypted.protectedHeader.typ, 'application/rcp+jwe')
  assert.equal(decrypted.protectedHeader.cty, 'application/rcp+json')
  assert.equal(decrypted.protectedHeader.zip, undefined)

  return JSON.parse(decoder.decode(decrypted.plaintext))
}

async function mustReject(label, operation) {
  let rejected = false
  try {
    await operation()
  } catch {
    rejected = true
  }
  assert.equal(rejected, true, label)
}

function tamperCompactJwe(jwe) {
  const parts = jwe.split('.')
  assert.equal(parts.length, 5)
  assert.ok(parts[3].length > 0)
  const last = parts[3].at(-1)
  parts[3] = `${parts[3].slice(0, -1)}${last === 'A' ? 'B' : 'A'}`
  return parts.join('.')
}

async function main() {
  const recipientKeys = await generateKeyPair('ECDH-ES', { crv: 'X25519' })
  const wrongRecipientKeys = await generateKeyPair('ECDH-ES', { crv: 'X25519' })
  const senderKeys = await generateKeyPair('Ed25519')
  const wrongSenderKeys = await generateKeyPair('Ed25519')

  const protectedPayload = {
    type: 'rcp.context_assertion',
    rcp_version: '0.1',
    assertion_id: 'assertion:crypto:001',
    assertion_type: 'commitment',
    epistemic_class: 'source_statement',
    statement: 'A and B agreed to revisit Project X in November.',
    subjects: ['user:a', 'person:b'],
    provenance: {
      origin_type: 'provider_generated',
      visibility: 'redacted',
    },
    status: 'active',
    created_at: '2026-10-05T10:00:00Z',
  }

  const envelope = await createEnvelope({
    payload: protectedPayload,
    recipientPublicKey: recipientKeys.publicKey,
    signingPrivateKey: senderKeys.privateKey,
  })

  const roundTrip = await verifyAndDecrypt(
    envelope,
    senderKeys.publicKey,
    recipientKeys.privateKey,
  )
  assert.deepEqual(roundTrip, protectedPayload)

  await mustReject('metadata tampering must invalidate the detached JWS', async () => {
    const tampered = { ...envelope, destination: 'org:a:crm' }
    await verifyAndDecrypt(tampered, senderKeys.publicKey, recipientKeys.privateKey)
  })

  await mustReject('ciphertext tampering must be rejected', async () => {
    const tampered = {
      ...envelope,
      payload: {
        ...envelope.payload,
        jwe: tamperCompactJwe(envelope.payload.jwe),
      },
    }
    await verifyAndDecrypt(tampered, senderKeys.publicKey, recipientKeys.privateKey)
  })

  await mustReject('wrong signing key must fail verification', async () => {
    await verifyAndDecrypt(envelope, wrongSenderKeys.publicKey, recipientKeys.privateKey)
  })

  await mustReject('wrong recipient key must fail decryption', async () => {
    await verifyAndDecrypt(envelope, senderKeys.publicKey, wrongRecipientKeys.privateKey)
  })

  const substitutedAlgorithmEnvelope = await createEnvelope({
    payload: protectedPayload,
    recipientPublicKey: recipientKeys.publicKey,
    signingPrivateKey: senderKeys.privateKey,
    enc: 'A128GCM',
  })
  await mustReject('content-encryption algorithm substitution must fail allowlist validation', async () => {
    await verifyAndDecrypt(
      substitutedAlgorithmEnvelope,
      senderKeys.publicKey,
      recipientKeys.privateKey,
    )
  })

  await mustReject('unsupported profile must fail closed', async () => {
    const unsupported = {
      ...envelope,
      payload: { ...envelope.payload, profile: 'rcp-unsupported-v9' },
    }
    await verifyAndDecrypt(unsupported, senderKeys.publicKey, recipientKeys.privateKey)
  })

  console.log('RCP JOSE crypto profile: PASS')
}

await main()
