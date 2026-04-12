import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { pushIngressToApi, summarizeCloudflareError } from '../cfApi'
import { zoneCertSubpath } from '../fileModels/certPem'
import { i18n } from '../i18n'

const { InputSpec, Value, Variants } = sdk

function summarizeDnsRouteFailure(output: string): string {
  const trimmed = output.trim()
  const lower = trimmed.toLowerCase()

  if (!trimmed) return 'Cloudflare did not return a detailed DNS error.'
  if (lower.includes('already exists')) {
    return 'Cloudflare reports that a DNS record for this hostname already exists.'
  }
  if (lower.includes('authentication') || lower.includes('unauthorized')) {
    return 'Cloudflare rejected the DNS update because authentication failed.'
  }
  if (lower.includes('not found')) {
    return 'Cloudflare could not find the requested tunnel or DNS zone.'
  }

  const lastLine = trimmed.split('\n').filter(Boolean).at(-1) ?? trimmed
  return lastLine.length > 180 ? `${lastLine.slice(0, 177)}...` : lastLine
}

const inputSpec = InputSpec.of({
  urlPluginMetadata: Value.hidden<{
    packageId: string
    interfaceId: string
    hostId: string
    internalPort: number
  }>(),
  subdomain: Value.text({
    name: i18n('Subdomain'),
    description: i18n('The subdomain to route to this service (e.g. myapp).'),
    required: true,
    default: null,
    placeholder: 'myapp',
    masked: false,
    inputmode: 'text',
    patterns: [
      {
        regex: '^[a-zA-Z0-9][a-zA-Z0-9\\-]*$',
        description: i18n('Subdomain only, no dots (e.g. myapp)'),
      },
    ],
  }),
  domain: Value.dynamicUnion(async ({ effects }) => {
    const conf = await store.read().once()
    const zones = conf?.zones ?? {}
    const variants: Record<string, { name: string; spec: ReturnType<typeof InputSpec.of> }> = {}

    for (const [id, z] of Object.entries(zones)) {
      if (!z) continue
      variants[id] = { name: z.zoneName, spec: InputSpec.of({}) }
    }

    if (Object.keys(variants).length === 0) {
      variants['none'] = { name: i18n('Login to Cloudflare to see your domains'), spec: InputSpec.of({}) }
    }

    return {
      name: i18n('Domain'),
      default: Object.keys(variants)[0],
      disabled: false,
      variants: Variants.of(variants),
    }
  }),
})

export const addPublicHostname = sdk.Action.withInput(
  'add-public-hostname',

  async () => ({
    name: i18n('Add Public Hostname'),
    description: i18n('Route a public Cloudflare hostname to this service'),
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
    const zoneId = (input.domain as { selection: string }).selection

    const conf = await store.read().once()

    if (zoneId === 'none' || !conf?.zones?.[zoneId]) {
      return {
        version: '1' as const,
        title: i18n('No Zone Configured'),
        message: i18n('Login to Cloudflare first (run "Login to Cloudflare" action) to configure a DNS zone.'),
        result: null,
      }
    }

    if (!conf.tunnel) {
      return {
        version: '1' as const,
        title: i18n('No Tunnel Configured'),
        message: i18n('Select a Cloudflare tunnel first (run "Cloudflare Tunnel" action).'),
        result: null,
      }
    }

    const zone = conf.zones[zoneId]
    const tunnelAccountId = conf.tunnel.accountId || zone.accountId

    if (conf.tunnel.accountId && zone.accountId !== conf.tunnel.accountId) {
      return {
        version: '1' as const,
        title: 'Cloudflare Account Mismatch',
        message: 'The selected domain belongs to a different Cloudflare account than the selected tunnel. Re-run the Cloudflare Tunnel action and choose a tunnel from this account, or pick a domain from the tunnel account.',
        result: null,
      }
    }

    const hostname = `${subdomain}.${zone.zoneName}`
    const host = packageId === 'STARTOS' ? 'startos' : `${packageId}.startos`
    const service = `http://${host}:${internalPort}`
    const tunnelId = conf.tunnel.id
    const nextEntry = {
      packageId: packageId === 'STARTOS' ? null : packageId,
      hostId,
      interfaceId,
      internalPort,
      service,
      zoneId,
    }
    const nextIngress = {
      ...(conf.ingress ?? {}),
      [hostname]: nextEntry,
    }

    // Push to Cloudflare first so local state only changes after the remote config is updated.
    try {
      await pushIngressToApi(zone.accountId, tunnelId, zone.apiToken, nextIngress)
    } catch (error) {
      const summary = summarizeCloudflareError(error)
      console.error(`Failed to update Cloudflare tunnel config for ${hostname}: ${summary}`)
      return {
        version: '1' as const,
        title: 'Cloudflare Update Failed',
        message: `Could not update the Cloudflare tunnel configuration for ${hostname}. ${summary}`,
        result: null,
      }
    }

    await store.merge(effects, {
      tunnel: {
        ...conf.tunnel,
        accountId: tunnelAccountId,
      },
      ingress: {
        [hostname]: nextEntry,
      },
    })

    // Create DNS CNAME via cloudflared CLI using zone-specific cert
    const certSubpath = zoneCertSubpath(zoneId)
    let certExists = false
    try {
      await sdk.volumes.main.readFile(certSubpath)
      certExists = true
    } catch {}

    let dnsCreated = false
    let dnsFailureDetail: string | null = null
    if (certExists) {
      await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'main' },
        sdk.Mounts.of()
          .mountVolume({ volumeId: 'main', subpath: null, mountpoint: '/root/data', readonly: false })
          .mountVolume({ volumeId: 'main', subpath: '.cloudflared', mountpoint: '/root/.cloudflared', readonly: true }),
        'route-dns',
        async (sub) => {
          const certPath = `/root/.cloudflared/zone-${zoneId}.pem`
          const result = await sub.exec(
            [
              '/usr/local/bin/cloudflared', '--no-autoupdate',
              `--origincert=${certPath}`,
              'tunnel', 'route', 'dns', '--overwrite-dns',
              tunnelId, hostname,
            ],
            {}, 30_000,
          )
          if (result.stdout) console.info(result.stdout)
          if (result.stderr) console.info(result.stderr)
          if (result.exitCode === 0) {
            dnsCreated = true
          } else {
            dnsFailureDetail = summarizeDnsRouteFailure(
              `${result.stderr || ''}\n${result.stdout || ''}`,
            )
            console.error(
              `DNS route creation failed for ${hostname}: ${dnsFailureDetail}. Add CNAME manually: ${hostname} -> ${tunnelId}.cfargotunnel.com`,
            )
          }
        },
      )
    } else {
      dnsFailureDetail = 'No zone certificate is available for this zone.'
      console.info(`No cert for zone ${zoneId} - add CNAME manually: ${hostname} -> ${tunnelId}.cfargotunnel.com`)
    }

    await effects.restart()

    return {
      version: '1' as const,
      title: i18n('Public Hostname Added'),
      message: dnsCreated
        ? `${hostname} is now routed to this service. ${i18n('DNS record created automatically.')}`
        : dnsFailureDetail
          ? `${hostname} is now routed to this service, but automatic DNS creation failed: ${dnsFailureDetail} ${i18n('Add a CNAME record manually in the Cloudflare dashboard (proxied).')} ${hostname} -> ${tunnelId}.cfargotunnel.com`
          : `${hostname} is now routed to this service. ${i18n('Add a CNAME record manually in the Cloudflare dashboard (proxied).')} ${hostname} -> ${tunnelId}.cfargotunnel.com`,
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
