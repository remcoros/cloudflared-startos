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
    warning: 'This will stop routing traffic from this hostname to the service.',
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

    // Remove from store (undefined → merge removes the key)
    await store.merge(effects, {
      ingress: { [hostname]: undefined } as any,
    })

    // Regenerate config file
    const updated = await store.read().once()
    await writeTunnelConfig(effects, updated?.ingress ?? {})

    // Restart the daemon so cloudflared picks up the change
    await effects.restart()

    console.info(`Public hostname ${hostname} removed.`)
  },
)
