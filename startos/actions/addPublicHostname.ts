import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { writeTunnelConfig } from '../fileModels/tunnel.yaml'
import { decodeTunnelToken } from '../tunnelToken'

const { InputSpec, Value } = sdk

const CERT_PATH = '/root/.cloudflared/cert.pem'

const inputSpec = InputSpec.of({
  urlPluginMetadata: Value.hidden<{
    packageId: string
    interfaceId: string
    hostId: string
    internalPort: number
  }>(),
  hostname: Value.text({
    name: 'Public Hostname',
    description:
      'The public hostname to route to this service (e.g. myapp.example.com). Must be on a domain managed by Cloudflare.',
    required: true,
    default: '',
    placeholder: 'myapp.example.com',
    masked: false,
    inputmode: 'url',
    patterns: [
      {
        regex: '^[a-zA-Z0-9][a-zA-Z0-9\\-\\.]+\\.[a-zA-Z]{2,}$',
        description: 'Must be a valid hostname (e.g. myapp.example.com)',
      },
    ],
  }),
})

export const addPublicHostname = sdk.Action.withInput(
  'add-public-hostname',

  async () => ({
    name: 'Add Public Hostname',
    description: 'Route a public Cloudflare hostname to this service',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  inputSpec,
  async () => null,

  async ({ effects, input }) => {
    const { packageId, internalPort, interfaceId, hostId } = input.urlPluginMetadata
    const hostname = input.hostname.trim().toLowerCase()
    const host = packageId === 'STARTOS' ? 'startos' : `${packageId}.startos`
    const service = `http://${host}:${internalPort}`

    const conf = await store.read().once()
    if (!conf?.token) {
      throw new Error('No tunnel token configured. Run "Set Authentication Token" first.')
    }

    const credentials = decodeTunnelToken(conf.token)

    // Persist ingress entry and regenerate config
    await store.merge(effects, {
      ingress: {
        [hostname]: {
          packageId: packageId === 'STARTOS' ? null : packageId,
          hostId,
          interfaceId,
          internalPort,
          service,
        },
      },
    })
    const updated = await store.read().once()
    await writeTunnelConfig(effects, updated?.ingress ?? {})

    // Create DNS route automatically if logged in, otherwise log manual instructions
    let certExists = false
    try {
      await sdk.volumes.main.readFile('/.cloudflared/cert.pem')
      certExists = true
    } catch {}

    if (certExists) {
      await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'main' },
        sdk.Mounts.of()
          .mountVolume({ volumeId: 'main', subpath: null, mountpoint: '/root/data', readonly: false })
          .mountVolume({ volumeId: 'main', subpath: '.cloudflared', mountpoint: '/root/.cloudflared', readonly: true }),
        'route-dns',
        async (sub) => {
          const result = await sub.exec(
            [
              '/usr/local/bin/cloudflared', '--no-autoupdate',
              `--origincert=${CERT_PATH}`,
              'tunnel', 'route', 'dns', '--overwrite-dns',
              credentials.TunnelID, hostname,
            ],
            {}, 30_000,
          )
          if (result.stdout) console.info(result.stdout)
          if (result.stderr) console.info(result.stderr)
          if (result.exitCode !== 0) {
            console.error(
              `DNS route creation failed. Add CNAME manually: ${hostname} → ${credentials.TunnelID}.cfargotunnel.com`,
            )
          }
        },
      )
    } else {
      console.info(
        `Not logged in — add CNAME manually: ${hostname} → ${credentials.TunnelID}.cfargotunnel.com`,
      )
    }

    await effects.restart()
  },
)
