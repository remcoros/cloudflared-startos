import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { createDefaultStore } from '../fileModels/store.yaml'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    await createDefaultStore(effects)
  },
})
