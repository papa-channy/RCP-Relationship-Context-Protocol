import canonicalize from 'canonicalize'
import {
  CompactEncrypt,
  FlattenedSign,
  compactDecrypt,
  exportJWK,
  flattenedVerify,
  generateKeyPair,
  importJWK,
} from 'jose'

export const RCP_JOSE_PROFILE = 'rcp-jose-x25519-a256gcm-ed25519-v0.1'
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function canonicalBytes(value) {
  const canonical = canonicalize(value)
  if (typeof canonical !== 'string') throw new Error('RFC 8785 canonicalization failed')
  return encoder.encode(canonical)
}

function withoutSignature(envelope) {
  const { signature, ...unsigned } = envelope
  return unsigned
}

export async function createSigningKeyMaterial(kid) {
  const pair = await generateKeyPair('Ed25519')
  const publicJwk = {
    ...(await exportJWK(pair.publicKey)),
    kid,
    use: 'sig',
    alg: 'Ed25519',
  }
  return { privateKey: pair.privateKey, publicJwk }
}

export async function createRecipientKeyMaterial(kid) {
  const pair = await generateKeyPair('ECDH-ES', { crv: 'X25519' })
  const publicJwk = {
    ...(await exportJWK(pair.publicKey)),
    kid,
    use: 'enc',
  }
  return { privateKey: pair.privateKey, publicJwk }
}

export async function createSecureEnvelope({
  payload,
  metadata,
  recipientPublicJwk,
  signingPrivateKey,
  signingKid,
}) {
  const recipientPublicKey = await importJWK(recipientPublicJwk, 'ECDH-ES')
  const jwe = await new CompactEncrypt(canonicalBytes(payload))
    .setProtectedHeader({
      alg: 'ECDH-ES',
      enc: 'A256GCM',
      kid: recipientPublicJwk.kid,
      typ: 'application/rcp+jwe',
      cty: 'application/rcp+json',
    })
    .encrypt(recipientPublicKey)

  const unsigned = {
    ...metadata,
    payload: {
      profile: RCP_JOSE_PROFILE,
      jwe,
    },
  }

  const detached = await new FlattenedSign(canonicalBytes(unsigned))
    .setProtectedHeader({
      alg: 'Ed25519',
      kid: signingKid,
      typ: 'application/rcp+jws',
      b64: false,
      crit: ['b64'],
    })
    .sign(signingPrivateKey)

  return {
    ...unsigned,
    signature: {
      profile: RCP_JOSE_PROFILE,
      protected: detached.protected,
      signature: detached.signature,
    },
  }
}

export async function verifyAndDecryptSecureEnvelope({
  envelope,
  signingPublicJwk,
  recipientPrivateKey,
}) {
  if (envelope.payload?.profile !== RCP_JOSE_PROFILE) {
    throw new Error('unsupported RCP payload crypto profile')
  }
  if (envelope.signature?.profile !== RCP_JOSE_PROFILE) {
    throw new Error('unsupported RCP signature crypto profile')
  }

  const signingPublicKey = await importJWK(signingPublicJwk, 'Ed25519')
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

  if (
    verified.protectedHeader.alg !== 'Ed25519' ||
    verified.protectedHeader.kid !== signingPublicJwk.kid ||
    verified.protectedHeader.typ !== 'application/rcp+jws' ||
    verified.protectedHeader.b64 !== false ||
    JSON.stringify(verified.protectedHeader.crit) !== JSON.stringify(['b64'])
  ) {
    throw new Error('invalid RCP JWS protected header')
  }

  const decrypted = await compactDecrypt(envelope.payload.jwe, recipientPrivateKey, {
    keyManagementAlgorithms: ['ECDH-ES'],
    contentEncryptionAlgorithms: ['A256GCM'],
  })

  if (
    decrypted.protectedHeader.alg !== 'ECDH-ES' ||
    decrypted.protectedHeader.enc !== 'A256GCM' ||
    decrypted.protectedHeader.typ !== 'application/rcp+jwe' ||
    decrypted.protectedHeader.cty !== 'application/rcp+json' ||
    decrypted.protectedHeader.zip !== undefined
  ) {
    throw new Error('invalid RCP JWE protected header')
  }

  return JSON.parse(decoder.decode(decrypted.plaintext))
}
