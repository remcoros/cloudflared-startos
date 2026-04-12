import { z, FileHelper, T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const ingressEntryShape = z.object({
  packageId: z.string().nullable(),
  hostId: z.string().catch('main'),
  interfaceId: z.string(),
  internalPort: z.number(),
  service: z.string(),
})

export type IngressEntry = z.infer<typeof ingressEntryShape>

export const tunnelInfoShape = z.object({
  id: z.string(),
  name: z.string(),
})

export type TunnelInfo = z.infer<typeof tunnelInfoShape>

export const zoneInfoShape = z.object({
  zoneId: z.string(),
  zoneName: z.string(),
  accountId: z.string(),
  apiToken: z.string(),
})

export type ZoneInfo = z.infer<typeof zoneInfoShape>

const shape = z.object({
  tunnel: tunnelInfoShape.nullable().catch(null),
  zoneInfo: zoneInfoShape.nullable().catch(null),
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
  const conf = await store.read().once()
  if (!conf) {
    await store.write(effects, {
      tunnel: null,
      zoneInfo: null,
      ingress: {},
    })
  }
}
