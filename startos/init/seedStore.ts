import { sdk } from '../sdk'
import { createDefaultStore } from '../fileModels/store.yaml'

export const seedStore = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return
  await createDefaultStore(effects)
})
