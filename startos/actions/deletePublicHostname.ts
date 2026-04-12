import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { pushIngressToApi, deleteDnsRecord } from '../cfApi'

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
    name: 'Delete Public Hostname',
    description: 'Remove a Cloudflare public hostname route',
    warning: 'This will remove the hostname from the tunnel config and delete the DNS record from Cloudflare.',
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

    // Remove from store and push updated ingress to CF API
    await store.merge(effects, {
      ingress: { [hostname]: undefined } as any,
    })
    const updated = await store.read().once()
    if (updated?.zoneInfo && updated.tunnel) {
      await pushIngressToApi(
        updated.zoneInfo.accountId,
        updated.tunnel.id,
        updated.zoneInfo.apiToken,
        updated.ingress ?? {},
      )
    }

    // Delete DNS record
    const zoneInfo = updated?.zoneInfo
    if (zoneInfo) {
      await deleteDnsRecord(zoneInfo.zoneId, hostname, zoneInfo.apiToken)
    } else {
      console.info(`No zone credentials - delete DNS record for ${hostname} manually`)
    }

    // Restart the daemon so cloudflared picks up the change
    await effects.restart()

    console.info(`Public hostname ${hostname} removed`)
  },
)
