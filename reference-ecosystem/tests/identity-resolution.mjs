import assert from 'node:assert/strict'
import { IdentityResolutionStore } from '../packages/identity-resolution/index.mjs'

const capabilities = [
  {
    provider: 'demo:mail',
    capabilities: { identity: 'allow' },
  },
  {
    provider: 'demo:messenger',
    capabilities: { identity: 'allow' },
  },
]

const store = new IdentityResolutionStore()

const resolved = store.resolve({
  tenant: 'user:a',
  person_id: 'person:b',
  provider_capabilities: capabilities,
  seeds: [
    {
      provider: 'demo:mail',
      provider_subject: 'provider-local:b-mail',
      identity_type: 'email',
      identifier: 'b@example.test',
      verification_state: 'user_confirmed',
    },
    {
      provider: 'demo:messenger',
      provider_subject: 'provider-local:b-messenger',
      identity_type: 'messenger_id',
      identifier: 'user_59127',
      verification_state: 'user_confirmed',
    },
  ],
})

assert.equal(resolved.status, 'resolved')
assert.equal(resolved.claims.length, 2)
assert.equal(resolved.bindings['demo:mail'].provider_subject, 'provider-local:b-mail')
assert.equal(resolved.bindings['demo:messenger'].provider_subject, 'provider-local:b-messenger')
assert.equal(resolved.bindings['demo:mail'].verification_state, 'user_confirmed')
assert.equal(store.get(resolved.resolution_id, 'user:a')?.person_id, 'person:b')
assert.equal(store.get(resolved.resolution_id, 'user:other'), null, 'resolution must not cross tenant boundary')

const uncertain = store.resolve({
  tenant: 'user:a',
  person_id: 'person:candidate',
  provider_capabilities: capabilities,
  seeds: [
    {
      provider: 'demo:mail',
      provider_subject: 'provider-local:candidate-mail',
      identity_type: 'email',
      identifier: 'maybe-b@example.test',
      verification_state: 'probable',
    },
  ],
})

assert.equal(uncertain.status, 'needs_confirmation')
assert.equal(Object.hasOwn(uncertain.bindings, 'demo:mail'), false)
assert.equal(uncertain.pending.length, 1)
assert.equal(
  uncertain.pending[0].reason,
  'verification_state_probable_requires_confirmation',
)

const deniedCapability = store.resolve({
  tenant: 'user:a',
  person_id: 'person:no-identity-access',
  provider_capabilities: [
    { provider: 'demo:mail', capabilities: { identity: 'deny' } },
  ],
  seeds: [
    {
      provider: 'demo:mail',
      provider_subject: 'provider-local:no-access',
      identity_type: 'email',
      identifier: 'hidden@example.test',
      verification_state: 'user_confirmed',
    },
  ],
})

assert.equal(deniedCapability.status, 'needs_confirmation')
assert.equal(deniedCapability.claims.length, 0)
assert.equal(Object.keys(deniedCapability.bindings).length, 0)
assert.equal(deniedCapability.pending[0].reason, 'provider_identity_capability_denied')

console.log('RCP tenant-scoped identity resolution: PASS')
