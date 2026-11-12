import { sdk } from '../sdk'
import { summarizeCloudflareError } from '../cfApi'
import { i18n } from '../i18n'
import { removeManagedHostname } from '../init/reconcileIngress'
import { withRouteLock } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  urlPluginMetadata: Value.hidden<{
    interfaceId: string
    packageId: string
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

    return withRouteLock(async () => {
      try {
        await removeManagedHostname(effects, hostname)
      } catch (error) {
        const detail = summarizeCloudflareError(error)
        console.error(`Failed to remove ${hostname}: ${detail}`)
        return {
          version: '1' as const,
          title: i18n('Cloudflare Update Failed'),
          message: i18n(
            'Could not finish removing public hostnames: ${detail}. Run Repair Cloudflare Routes to retry.',
            { detail: `${hostname}: ${detail}` },
          ),
          result: null,
        }
      }
    })
  },
)
