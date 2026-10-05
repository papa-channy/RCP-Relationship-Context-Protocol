import fs from 'node:fs'
import assert from 'node:assert/strict'
import canonicalize from 'canonicalize'
import {
  CompactEncrypt,
  FlattenedSign,
  exportJWK,
  generateKeyPair,
} from 'jose'

const PROFILE = 'rcp-jose-x25519-a256gcm-ed25519-v0.1'
const encoder = new TextEncoder()

function canonicalBytes(value) {
  const canonical = canonicalize(value)
  assert.equal(typeof canonical, 'string')
  return encoder.encode(canonical)
}

async function main() {
  const output = process.argv[2]
  if (!output) throw new Error('usage: node interop-node-producer.mjs <output.json>')

  const recipient = await generateKeyPair('ECDH-ES', { crv: 'X25519' })
  const signer = await generateKeyPair('Ed25519')

  const recipientPrivateJwk = {
    ...(await exportJWK(recipient.privateKey)),
    kid: 'node-recipient-enc-1',
    use: 'enc',
  }
  const senderPublicJwk = {
    ...(await exportJWK(signer.publicKey)),
    kid: 'node-provider-sign-1',
    use: 'sig',
    alg: 'Ed25519',
  }

  const plaintext = {
    type: 'rcp.context_assertion',
    rcp_version: '0.1',
    assertion_id: 'assertion:node-interop:001',
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

  const jwe = await new CompactEncrypt(canonicalBytes(plaintext))
    .setProtectedHeader({
      alg: 'ECDH-ES',
      enc: 'A256GCM',
      kid: 'node-recipient-enc-1',
      typ: 'application/rcp+jwe',
      cty: 'application/rcp+json',
    })
    .encrypt(recipient.publicKey)

  const unsigned = {
    type: 'rcp.secure_envelope',
    rcp_version: '0.1',
    envelope_id: 'envelope:node-interop:001',
    sender: 'provider:node-probe',
    recipient: 'consumer:python-probe',
    action: 'process',
    resource_ref: 'demo:mail:context:b',
    resource_class: 'relationship_context',
    purpose: 'meeting_preparation',
    destination: 'user:a:private-memory',
    processing_location: 'device',
    permission_decision_ref: 'decision:node-interop:001',
    policy_refs: ['demo:mail:policy:relationship-memory-v1'],
    issued_at: '2026-10-05T10:01:00Z',
    expires_at: '2026-10-05T10:20:00Z',
    payload: {
      profile: PROFILE,
      jwe,
    },
  }

  const detached = await new FlattenedSign(canonicalBytes(unsigned))
    .setProtectedHeader({
      alg: 'Ed25519',
      kid: 'node-provider-sign-1',
      typ: 'application/rcp+jws',
      b64: false,
      crit: ['b64'],
    })
    .sign(signer.privateKey)

  const envelope = {
    ...unsigned,
    signature: {
      profile: PROFILE,
      protected: detached.protected,
      signature: detached.signature,
    },
  }

  const vector = {
    producer: 'node-jose-canonicalize',
    profile: PROFILE,
    plaintext,
    envelope,
    recipient_private_jwk: recipientPrivateJwk,
    sender_public_jwk: senderPublicJwk,
  }

  fs.writeFileSync(output, JSON.stringify(vector, null, 2), 'utf8')
  console.log('Node RCP interop vector produced')
}

await main()
