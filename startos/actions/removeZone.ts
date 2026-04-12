import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { zoneCertSubpath } from '../fileModels/certPem'
import { unlink } from 'node:fs/promises'
import { i18n } from '../i18n'

const { InputSpec, Value, Variants } = sdk

export const removeZone = sdk.Action.withInput(
  'remove-zone',

  async ({ effects }) => {
    const conf = await store.read().const(effects)
    const zones = conf?.zones ?? {}
    const count = Object.keys(zones).length
    return {
      name: i18n('Remove DNS Zone'),
      description: i18n(
        'Remove a Cloudflare DNS zone from this package. Existing hostnames in that zone may keep working, but this package will no longer manage their DNS or tunnel routes.',
      ),
      warning: i18n(
        'Existing DNS records and ingress rules in Cloudflare will NOT be deleted.',
      ),
      allowedStatuses: 'any',
      group: 'Configuration',
      visibility:
        count === 0 ? { disabled: i18n('No zones configured') } : 'enabled',
    }
  },

  InputSpec.of({
    zoneId: Value.dynamicUnion(async ({ effects }) => {
      const conf = await store.read().once()
      const zones = conf?.zones ?? {}
      const variants: Record<
        string,
        { name: string; spec: ReturnType<typeof InputSpec.of> }
      > = {}
      for (const [id, z] of Object.entries(zones)) {
        if (!z) continue
        variants[id] = { name: z.zoneName, spec: InputSpec.of({}) }
      }
      if (Object.keys(variants).length === 0) {
        variants['none'] = {
          name: 'No zones configured',
          spec: InputSpec.of({}),
        }
      }
      return {
        name: 'Zone',
        default: Object.keys(variants)[0],
        disabled: false,
        variants: Variants.of(variants),
      }
    }),
  }),

  async () => null,

  async ({ effects, input }) => {
    const zoneId = (input.zoneId as { selection: string }).selection
    if (zoneId === 'none') return

    // Remove all ingress entries for this zone
    const conf = await store.read().once()
    const staleIngress: Record<string, undefined> = {}
    for (const [hostname, entry] of Object.entries(conf?.ingress ?? {})) {
      if (entry?.zoneId === zoneId) {
        staleIngress[hostname] = undefined
      }
    }
    if (Object.keys(staleIngress).length > 0) {
      await store.merge(effects, { ingress: staleIngress as any })
    }

    // Remove zone-specific cert file
    try {
      await unlink(sdk.volumes.main.subpath(zoneCertSubpath(zoneId)))
    } catch {}

    // Remove from store
    await store.merge(effects, {
      zones: { [zoneId]: undefined } as any,
    })

    console.info(`Zone ${zoneId} removed`)
  },
)
