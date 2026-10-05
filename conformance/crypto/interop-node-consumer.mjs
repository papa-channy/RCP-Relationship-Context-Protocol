import fs from 'node:fs'
import assert from 'node:assert/strict'
import canonicalize from 'canonicalize'
import {
  compactDecrypt,
  flattenedVerify,
  importJWK,
} from 'jose'

const PROFILE = 'rcp-jose-x25519-a256gcm-ed25519-v0.1'
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function canonicalBytes(value) {
  const canonical = canonicalize(value)
  assert.equal(typeof canonical, 'string')
  return encoder.encode(canonical)
}

function unsignedEnvelope(envelope) {
  const { signature, ...unsigned } = envelope
  return unsigned
}

async function main() {
  const input = process.argv[2]
  if (!input) throw new Error('usage: node interop-node-consumer.mjs <vector.json>')

  const vector = JSON.parse(fs.readFileSync(input, 'utf8'))
  assert.equal(vector.profile, PROFILE)
  assert.equal(vector.envelope.payload.profile, PROFILE)
  assert.equal(vector.envelope.signature.profile, PROFILE)

  const signingPublicKey = await importJWK(vector.sender_public_jwk, 'Ed25519')
  const recipientPrivateKey = await importJWK(vector.recipient_private_jwk, 'ECDH-ES')

  const verified = await flattenedVerify(
    {
      protected: vector.envelope.signature.protected,
      signature: vector.envelope.signature.signature,
      payload: canonicalBytes(unsignedEnvelope(vector.envelope)),
    },
    signingPublicKey,
    { algorithms: ['Ed25519'] },
  )

  assert.equal(verified.protectedHeader.alg, 'Ed25519')
  assert.equal(verified.protectedHeader.kid, vector.sender_public_jwk.kid)
  assert.equal(verified.protectedHeader.typ, 'application/rcp+jws')
  assert.equal(verified.protectedHeader.b64, false)
  assert.deepEqual(verified.protectedHeader.crit, ['b64'])

  const decrypted = await compactDecrypt(vector.envelope.payload.jwe, recipientPrivateKey, {
    keyManagementAlgorithms: ['ECDH-ES'],
    contentEncryptionAlgorithms: ['A256GCM'],
  })

  assert.equal(decrypted.protectedHeader.alg, 'ECDH-ES')
  assert.equal(decrypted.protectedHeader.enc, 'A256GCM')
  assert.equal(decrypted.protectedHeader.kid, vector.recipient_private_jwk.kid)
  assert.equal(decrypted.protectedHeader.typ, 'application/rcp+jwe')
  assert.equal(decrypted.protectedHeader.cty, 'application/rcp+json')
  assert.equal(decrypted.protectedHeader.zip, undefined)

  const plaintext = JSON.parse(decoder.decode(decrypted.plaintext))
  assert.deepEqual(plaintext, vector.plaintext)

  console.log(`Node consumed ${vector.producer ?? 'unknown'} RCP vector: PASS`)
}

await main()
