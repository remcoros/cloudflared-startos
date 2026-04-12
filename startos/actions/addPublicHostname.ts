import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { pushIngressToApi } from '../cfApi'

const { InputSpec, Value, Variants } = sdk

const CERT_PATH = '/root/.cloudflared/cert.pem'

const inputSpec = InputSpec.of({
  urlPluginMetadata: Value.hidden<{
    packageId: string
    interfaceId: string
    hostId: string
    internalPort: number
  }>(),
  subdomain: Value.text({
    name: 'Subdomain',
    description: 'The subdomain to route to this service (e.g. myapp).',
    required: true,
    default: null,
    placeholder: 'myapp',
    masked: false,
    inputmode: 'text',
    patterns: [
      {
        regex: '^[a-zA-Z0-9][a-zA-Z0-9\\-]*$',
        description: 'Subdomain only, no dots (e.g. myapp)',
      },
    ],
  }),
  domain: Value.dynamicUnion(async ({ effects }) => {
    const conf = await store.read().once()
    const zones: Record<string, { name: string; spec: ReturnType<typeof InputSpec.of> }> = {}

    if (conf?.zoneInfo?.zoneName) {
      const key = conf.zoneInfo.zoneId
      zones[key] = { name: conf.zoneInfo.zoneName, spec: InputSpec.of({}) }
    }

    // Fallback if no zone info yet
    if (Object.keys(zones).length === 0) {
      zones['manual'] = { name: 'Login to Cloudflare to see your domains', spec: InputSpec.of({}) }
    }

    return {
      name: 'Domain',
      default: Object.keys(zones)[0],
      disabled: false,
      variants: Variants.of(zones),
    }
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

  // pre-fill subdomain from packageId
  async ({ effects, prefill }) => {
    const p = prefill as typeof inputSpec._PARTIAL
    const suggestedHost = p?.urlPluginMetadata?.packageId
    return suggestedHost && suggestedHost !== 'STARTOS'
      ? { subdomain: suggestedHost }
      : null
  },

  async ({ effects, input }) => {
    const { packageId, internalPort, interfaceId, hostId } = input.urlPluginMetadata
    const subdomain = input.subdomain.trim().toLowerCase()
    const domainSelection = (input.domain as { selection: string; value: {} })

    const conf = await store.read().once()

    // Resolve the domain name from the selection
    const zoneName = conf?.zoneInfo?.zoneName
    if (!zoneName) {
      return {
        version: '1' as const,
        title: 'Not Logged In',
        message: 'Login to Cloudflare first (run "Cloudflare Account" action), then add a public hostname.',
        result: null,
      }
    }

    const hostname = `${subdomain}.${zoneName}`
    const host = packageId === 'STARTOS' ? 'startos' : `${packageId}.startos`
    const service = `http://${host}:${internalPort}`

    if (!conf?.tunnel) {
      return {
        version: '1' as const,
        title: 'No Tunnel Configured',
        message: 'Select a Cloudflare tunnel first (run "Cloudflare Tunnel" action).',
        result: null,
      }
    }

    const tunnelId = conf.tunnel.id

    // Persist ingress entry and push to Cloudflare API
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
    if (conf.zoneInfo) {
      await pushIngressToApi(
        conf.zoneInfo.accountId,
        tunnelId,
        conf.zoneInfo.apiToken,
        updated?.ingress ?? {},
      )
    }

    // Create DNS route automatically if logged in
    let certExists = false
    try {
      await sdk.volumes.main.readFile('/.cloudflared/cert.pem')
      certExists = true
    } catch {}

    let dnsCreated = false
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
              tunnelId, hostname,
            ],
            {}, 30_000,
          )
          if (result.stdout) console.info(result.stdout)
          if (result.stderr) console.info(result.stderr)
          if (result.exitCode !== 0) {
            console.error(
              `DNS route creation failed. Add CNAME manually: ${hostname} -> ${tunnelId}.cfargotunnel.com`,
            )
          } else {
            dnsCreated = true
          }
        },
      )
    } else {
      console.info(
        `Not logged in - add CNAME manually: ${hostname} -> ${tunnelId}.cfargotunnel.com`,
      )
    }

    await effects.restart()

    return {
      version: '1' as const,
      title: 'Public Hostname Added',
      message: dnsCreated
        ? `${hostname} is now routed to this service. DNS record created automatically.`
        : `${hostname} is now routed to this service. Add a CNAME record manually: ${hostname} -> ${tunnelId}.cfargotunnel.com (proxied).`,
      result: {
        type: 'single' as const,
        value: `https://${hostname}`,
        copyable: true,
        qr: false,
        masked: false,
      },
    }
  },
)
