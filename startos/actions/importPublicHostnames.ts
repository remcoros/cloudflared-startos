import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { fetchIngressFromApi, summarizeCloudflareError } from '../cfApi'
import { i18n } from '../i18n'

/**
 * Parse a cloudflared service URL of the form http://<host>:<port>
 * and return the packageId + internalPort if it matches a StartOS service pattern.
 *
 * StartOS service hostnames look like:
 *   http://<packageId>.startos:<port>  (regular services)
 *   http://startos:<port>              (STARTOS itself)
 */
function parseServiceUrl(
  service: string,
): { packageId: string | null; internalPort: number } | null {
  try {
    const url = new URL(service)
    const port = Number(url.port)
    if (!port) return null

    const host = url.hostname
    if (host === 'startos') {
      return { packageId: null, internalPort: port }
    }
    if (host.endsWith('.startos')) {
      const packageId = host.slice(0, -'.startos'.length)
      return { packageId, internalPort: port }
    }
    return null
  } catch {
    return null
  }
}

export const importPublicHostnames = sdk.Action.withoutInput(
  'import-public-hostnames',

  async () => ({
    name: i18n('Import Public Hostnames'),
    description: i18n(
      'Scan existing public hostnames from your Cloudflare tunnel and add URLs to matching installed services.',
    ),
    warning: i18n(
      'This will scan existing public hostnames from the Cloudflare tunnel and add URLs to matching installed services.',
    ),
    allowedStatuses: 'any',
    group: 'Import',
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const conf = await store.read().once()

    if (!conf?.tunnel) {
      return {
        version: '1',
        title: i18n('No Tunnel Configured'),
        message: i18n(
          'Select a Cloudflare tunnel first (run "Cloudflare Tunnel" action).',
        ),
        result: null,
      }
    }

    // Need at least one zone to make API calls
    const firstZone = Object.values(conf.zones ?? {}).find(Boolean)
    if (!firstZone) {
      return {
        version: '1',
        title: i18n('No Zone Configured'),
        message: i18n(
          'Login to Cloudflare first (run "Login to Cloudflare" action) to configure a DNS zone.',
        ),
        result: null,
      }
    }

    const existingHostnames = new Set(
      Object.keys(conf.ingress ?? {}).filter((h) => !!conf.ingress?.[h]),
    )

    // Fetch all ingress rules from Cloudflare
    let cfRules: Array<{ hostname: string; service: string }>
    try {
      cfRules = await fetchIngressFromApi(
        firstZone.accountId,
        conf.tunnel.id,
        firstZone.apiToken,
      )
    } catch (error) {
      const summary = summarizeCloudflareError(error)
      console.error(
        `Failed to import public hostnames from Cloudflare: ${summary}`,
      )
      return {
        version: '1',
        title: 'Cloudflare Import Failed',
        message: `Could not read the Cloudflare tunnel configuration. ${summary}`,
        result: null,
      }
    }

    // Only consider rules not already tracked locally
    const newRules = cfRules.filter((r) => !existingHostnames.has(r.hostname))

    if (newRules.length === 0) {
      return {
        version: '1',
        title: i18n('Import Public Hostnames'),
        message: i18n(
          'No new public hostnames found in Cloudflare that are not already tracked.',
        ),
        result: null,
      }
    }

    // Get all installed packages and their interfaces
    const packageIds = await effects.getInstalledPackages()
    const interfaceMap: Map<
      string,
      {
        packageId: string | null
        interfaceId: string
        hostId: string
        internalPort: number
      }[]
    > = new Map()

    for (const pkgId of packageIds) {
      try {
        const interfaces = await effects.listServiceInterfaces({
          packageId: pkgId,
        })
        for (const [ifaceId, iface] of Object.entries(interfaces)) {
          const { hostId, internalPort } = iface.addressInfo
          const key = `${pkgId}:${internalPort}`
          if (!interfaceMap.has(key)) interfaceMap.set(key, [])
          interfaceMap
            .get(key)!
            .push({
              packageId: pkgId,
              interfaceId: ifaceId,
              hostId,
              internalPort,
            })
        }
      } catch {
        // package may not be running / no interfaces yet — skip
      }
    }

    // Build a lookup of known zone names → zoneId so we can filter and tag hostnames
    const knownZones = Object.entries(conf.zones ?? {}).filter(
      (e): e is [string, NonNullable<(typeof e)[1]>] => !!e[1],
    )

    let imported = 0
    const skipped: string[] = []
    const ingressUpdates: Record<
      string,
      {
        packageId: string | null
        hostId: string
        interfaceId: string
        internalPort: number
        service: string
        zoneId: string
      }
    > = {}

    for (const rule of newRules) {
      // Only import hostnames that belong to a zone we know about
      const matchedZone = knownZones.find(
        ([, z]) =>
          rule.hostname.endsWith(`.${z.zoneName}`) ||
          rule.hostname === z.zoneName,
      )
      if (!matchedZone) {
        skipped.push(`${rule.hostname} (not in any configured zone)`)
        continue
      }
      const zoneId = matchedZone[0]

      const parsed = parseServiceUrl(rule.service)
      if (!parsed) {
        skipped.push(`${rule.hostname} (unrecognised service: ${rule.service})`)
        continue
      }

      const { packageId, internalPort } = parsed
      const key = packageId
        ? `${packageId}:${internalPort}`
        : `cloudflared:${internalPort}` // STARTOS itself unlikely but handled

      let match:
        | {
            packageId: string | null
            interfaceId: string
            hostId: string
            internalPort: number
          }
        | undefined

      if (packageId) {
        const candidates = interfaceMap.get(key)
        match = candidates?.[0] // take the first matching interface for this package+port
      }

      if (!match && packageId) {
        skipped.push(
          `${rule.hostname} (no matching interface found for ${packageId}:${internalPort})`,
        )
        continue
      }

      ingressUpdates[rule.hostname] = {
        packageId: packageId ?? null,
        hostId: match?.hostId ?? 'main',
        interfaceId: match?.interfaceId ?? 'main',
        internalPort,
        service: rule.service,
        zoneId,
      }
      imported++
    }

    if (imported > 0) {
      await store.merge(effects, { ingress: ingressUpdates })
      await effects.restart()
    }

    const lines: string[] = []
    if (imported > 0)
      lines.push(
        `Imported ${imported} hostname${imported === 1 ? '' : 's'}: ${Object.keys(ingressUpdates).join(', ')}`,
      )
    if (skipped.length > 0)
      lines.push(`Skipped ${skipped.length}: ${skipped.join('; ')}`)

    return {
      version: '1',
      title: i18n('Import Public Hostnames'),
      message:
        lines.join('\n') ||
        i18n(
          'No new public hostnames found in Cloudflare that are not already tracked.',
        ),
      result: null,
    }
  },
)
