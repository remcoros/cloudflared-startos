import { matches, FileHelper, T } from '@start9labs/start-sdk'
const { object, string } = matches

const shape = object({
  token: string,
})

export type StoreType = typeof shape._TYPE

export const store = FileHelper.yaml(
  '/media/startos/volumes/main/start9/config.yaml',
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
