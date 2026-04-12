import { z, FileHelper, T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const ingressEntryShape = z.object({
  packageId: z.string().nullable(),
  hostId: z.string().catch('main'), // fallback for entries saved before hostId was added
  interfaceId: z.string(),
  internalPort: z.number(),
  service: z.string(), // e.g. "http://nextcloud.startos:80"
})

export type IngressEntry = z.infer<typeof ingressEntryShape>

const shape = z.object({
  token: z.string(),
  ingress: z.record(z.string(), ingressEntryShape.nullable()).catch({}),
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
      ingress: {},
    })
  }
}
