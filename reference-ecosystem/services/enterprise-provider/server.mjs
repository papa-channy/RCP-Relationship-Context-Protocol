import { createProviderServer } from '../../packages/provider-runtime/server.mjs'

const provider = createProviderServer({
  capabilityPath: new URL('./capability.json', import.meta.url),
  statePath: new URL('./state.json', import.meta.url),
  policyProfilesPath: new URL('./policy-profiles.json', import.meta.url),
  port: Number(process.env.PORT ?? 4103),
})

await provider.listen()
console.log('demo:enterprise listening')
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, async () => { await provider.close(); process.exit(0) })
