import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { createDefaultStore, store } from '../fileModels/store.yaml'
import { sdk } from '../sdk'
import { setToken } from '../actions/setToken'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    await createDefaultStore(effects)

    const authToken = (await store.read().once())?.token
    if (!authToken) {
      await sdk.action.createOwnTask(effects, setToken, 'critical', {
        reason: 'Set Cloudflare tunnel authentication token',
      })
    }
  },
})
