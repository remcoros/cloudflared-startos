import { z, FileHelper, T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  token: z.string(),
})

export type StoreType = z.infer<typeof shape>

export const store = FileHelper.yaml(
  {
    base: sdk.volumes.main,
    subpath: '/start9/config.yaml',
  },
  shape,
)

export const createDefaultStore = async (effects: T.Effects) => {
  // check if the file exists (from previous installs or upgrades)
  const conf = await store.read().once()
  if (!conf) {
    await store.write(effects, {
      token: '',
    })
  }
}
