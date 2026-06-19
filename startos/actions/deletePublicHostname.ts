import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import {
  pushIngressToApi,
  deleteDnsRecord,
  summarizeCloudflareError,
} from '../cfApi'
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
    warning: i18n(
      'This will remove this hostname from your Cloudflare tunnel and delete the DNS record from Cloudflare.',
    ),
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
    if (!conf) {
      throw new Error('Cloudflared configuration is unavailable.')
    }
    const entry = conf.ingress?.[hostname]
    const zoneId = entry?.zoneId
    const zone = zoneId ? conf.zones?.[zoneId] : undefined
    const nextIngress = { ...(conf.ingress ?? {}) }
    delete nextIngress[hostname]

    if (conf.tunnel) {
      if (!zone) {
        throw new Error(
          `No Cloudflare zone credentials found for ${hostname}. Refusing to remove the local entry before the remote tunnel config is updated.`,
        )
      }

      // Push to Cloudflare first so local state only changes after the remote config is updated.
      try {
        await pushIngressToApi(
          zone.accountId,
          conf.tunnel.id,
          zone.apiToken,
          nextIngress,
        )
      } catch (error) {
        const summary = summarizeCloudflareError(error)
        console.error(
          `Failed to update Cloudflare tunnel config while removing ${hostname}: ${summary}`,
        )
        return {
          version: '1',
          title: 'Cloudflare Update Failed',
          message: `Could not remove ${hostname} from the Cloudflare tunnel configuration. ${summary}`,
          result: null,
        }
      }
    }

    await store.write(effects, { ...conf, ingress: nextIngress })

    // Delete DNS record using the zone-specific token from the ingress entry
    let dnsWarning: string | null = null
    if (zone) {
      try {
        const dnsResult = await deleteDnsRecord(
          zoneId!,
          hostname,
          zone.apiToken,
        )
        if (dnsResult.errors.length > 0) {
          dnsWarning = `The Cloudflare tunnel was updated, but deleting the DNS record failed: ${dnsResult.errors[0]}`
        }
      } catch (error) {
        const summary = summarizeCloudflareError(error)
        console.error(`Failed to delete DNS record for ${hostname}: ${summary}`)
        dnsWarning = `The Cloudflare tunnel was updated, but deleting the DNS record failed: ${summary}`
      }
    } else {
      console.info(`No zone info for ${hostname} - delete DNS record manually`)
      dnsWarning =
        'The Cloudflare tunnel was updated, but this package could not determine which zone to use for deleting the DNS record automatically.'
    }

    // Restart the daemon so cloudflared picks up the change
    await effects.restart()

    console.info(`Public hostname ${hostname} removed`)

    if (dnsWarning) {
      return {
        version: '1',
        title: 'Public Hostname Removed with DNS Warning',
        message: dnsWarning,
        result: null,
      }
    }
  },
)
