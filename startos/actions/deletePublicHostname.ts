import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { pushIngressToApi, deleteDnsRecord } from '../cfApi'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  urlPluginMetadata: Value.hidden<{
    interfaceId: string
    packageId: string | null
    hostId: string
    internalPort: number
    ssl: boolean
    public: boolean
    hostname: string
    port: number | null
    info: unknown
  }>(),
})

export const deletePublicHostname = sdk.Action.withInput(
  // id
  'delete-public-hostname',

  // metadata
  async () => ({
    name: i18n('Delete Public Hostname'),
    description: i18n('Remove a Cloudflare public hostname route'),
    warning: i18n('This will remove this hostname from your Cloudflare tunnel and delete the DNS record from Cloudflare.'),
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  // input spec
  inputSpec,

  // pre-fill
  async () => null,

  // execution
  async ({ effects, input }) => {
    const { hostname } = input.urlPluginMetadata

    // Read before mutating so we can look up the zone for the remote update and DNS deletion.
    const conf = await store.read().once()
    const entry = conf?.ingress?.[hostname]
    const zoneId = entry?.zoneId
    const zone = zoneId ? conf?.zones?.[zoneId] : undefined

    if (conf?.tunnel) {
      if (!zone) {
        throw new Error(
          `No Cloudflare zone credentials found for ${hostname}. Refusing to remove the local entry before the remote tunnel config is updated.`,
        )
      }

      const nextIngress = { ...(conf.ingress ?? {}) }
      delete nextIngress[hostname]

      // Push to Cloudflare first so local state only changes after the remote config is updated.
      await pushIngressToApi(zone.accountId, conf.tunnel.id, zone.apiToken, nextIngress)
    }

    await store.merge(effects, {
      ingress: { [hostname]: undefined } as any,
    })

    // Delete DNS record using the zone-specific token from the ingress entry
    if (zone) {
      await deleteDnsRecord(zoneId!, hostname, zone.apiToken)
    } else {
      console.info(`No zone info for ${hostname} - delete DNS record manually`)
    }

    // Restart the daemon so cloudflared picks up the change
    await effects.restart()

    console.info(`Public hostname ${hostname} removed`)
  },
)
