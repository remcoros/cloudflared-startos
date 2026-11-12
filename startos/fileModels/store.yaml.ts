import { z, FileHelper, T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const ingressEntryShape = z
  .looseObject({
    packageId: z
      .union([z.string(), z.null()])
      .transform((value) =>
        value === null || value === 'STARTOS' ? 'start-os' : value,
      ),
    hostId: z.string().catch('main'),
    interfaceId: z.string(),
    internalPort: z.number(),
    service: z.string(),
    zoneId: z.string().catch(''), // which zone's DNS this hostname was created in
    // Persist deletion intent before contacting Cloudflare. A reinstall must
    // not revive a route whose tunnel or DNS cleanup is still pending.
    removal: z
      .looseObject({
        tunnelId: z.string(),
        accountId: z.string(),
      })
      .optional(),
  })
  .transform((entry) =>
    entry.packageId === 'start-os'
      ? { ...entry, hostId: 'admin', interfaceId: 'admin-ui' }
      : entry,
  )

export type IngressEntry = z.infer<typeof ingressEntryShape>

export const tunnelInfoShape = z.looseObject({
  id: z.string(),
  name: z.string(),
  accountId: z.string().catch(''),
})

export type TunnelInfo = z.infer<typeof tunnelInfoShape>

export const zoneInfoShape = z.looseObject({
  zoneId: z.string(),
  zoneName: z.string(),
  accountId: z.string(),
  apiToken: z.string(),
})

export type ZoneInfo = z.infer<typeof zoneInfoShape>

const shape = z.looseObject({
  tunnel: tunnelInfoShape.nullable().catch(null),
  zones: z.record(z.string(), zoneInfoShape.nullish()).catch({}),
  ingress: z.record(z.string(), ingressEntryShape.nullable()).catch({}),
  repairRequired: z.boolean().catch(false),
  repairMessage: z.string().nullable().catch(null),
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
      zones: {},
      ingress: {},
      repairRequired: false,
      repairMessage: null,
    })
  }
}
