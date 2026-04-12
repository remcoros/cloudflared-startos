import { sdk } from '../sdk'
import { createDefaultStore, store } from '../fileModels/store.yaml'
import { setToken } from '../actions/setToken'

export const seedStore = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await createDefaultStore(effects)

  const authToken = (await store.read().once())?.token
  if (!authToken) {
    await sdk.action.createOwnTask(effects, setToken, 'critical', {
      reason: 'Set Cloudflare tunnel authentication token',
    })
  }
})
