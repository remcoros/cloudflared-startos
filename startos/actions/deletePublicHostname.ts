import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { writeTunnelConfig } from '../fileModels/tunnel.yaml'

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

    // Remove from store
    await store.merge(effects, {
      ingress: { [hostname]: undefined } as any,
    })

    // Regenerate config file
    const updated = await store.read().once()
    await writeTunnelConfig(effects, updated ?? { ingress: {}, tunnel: null, zoneInfo: null })

    // Delete the DNS CNAME record from Cloudflare if we have credentials
    const zoneInfo = updated?.zoneInfo
    if (zoneInfo) {
      try {
        // Look up the DNS record ID by hostname
        const listResp = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneInfo.zoneId}/dns_records?name=${hostname}&type=CNAME`,
          {
            headers: {
              Authorization: `Bearer ${zoneInfo.apiToken}`,
              'Content-Type': 'application/json',
            },
          },
        )
        const listData = (await listResp.json()) as any
        const records: Array<{ id: string }> = listData.result ?? []

        for (const record of records) {
          const delResp = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneInfo.zoneId}/dns_records/${record.id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${zoneInfo.apiToken}`,
                'Content-Type': 'application/json',
              },
            },
          )
          const delData = (await delResp.json()) as any
          if (delData.success) {
            console.info(`DNS CNAME record deleted for ${hostname}`)
          } else {
            console.error(`Failed to delete DNS record for ${hostname}: ${JSON.stringify(delData.errors)}`)
          }
        }

        if (records.length === 0) {
          console.info(`No DNS CNAME record found for ${hostname} - nothing to delete`)
        }
      } catch (e) {
        console.error(`Error deleting DNS record for ${hostname}: ${String(e)}`)
      }
    } else {
      console.info(`No zone credentials available - DNS record for ${hostname} must be deleted manually`)
    }

    // Restart the daemon so cloudflared picks up the change
    await effects.restart()

    console.info(`Public hostname ${hostname} removed`)
  },
)
