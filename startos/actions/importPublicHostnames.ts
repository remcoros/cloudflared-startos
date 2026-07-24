import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import {
  CloudflareIngressRule,
  fetchIngressFromApi,
  summarizeCloudflareError,
} from '../cfApi'
import { i18n } from '../i18n'
import {
  associateMigratedIngressWithZones,
  isWholeHostnameRule,
  parseLegacyServiceTarget,
  StableIngress,
  updateCloudflareIngress,
} from '../init/reconcileIngress'

function normalizedHostname(hostname: string) {
  return hostname.trim().toLowerCase()
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

    const tunnelZone = Object.values(conf.zones ?? {}).find(
      (zone) =>
        zone &&
        (!conf.tunnel?.accountId || zone.accountId === conf.tunnel.accountId),
    )
    if (!tunnelZone) {
      return {
        version: '1',
        title: i18n('No Zone Configured'),
        message: i18n(
          'Login to a Cloudflare DNS zone in the same account as the selected tunnel, then try again.',
        ),
        result: null,
      }
    }

    const existingHostnames = new Set(
      Object.keys(conf.ingress ?? {})
        .filter((hostname) => !!conf.ingress?.[hostname])
        .map(normalizedHostname),
    )

    // Fetch all ingress rules from Cloudflare
    let cfRules: Array<
      CloudflareIngressRule & { hostname: string; service: string }
    >
    try {
      cfRules = await fetchIngressFromApi(
        tunnelZone.accountId,
        conf.tunnel.id,
        tunnelZone.apiToken,
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
    const newRules = cfRules.filter(
      (rule) => !existingHostnames.has(normalizedHostname(rule.hostname)),
    )

    // Get all installed packages and their interfaces
    const packageIds = await effects.getInstalledPackages()
    const interfaceMap: Map<
      string,
      {
        packageId: string
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
          interfaceMap.get(key)!.push({
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
        packageId: string
        hostId: string
        interfaceId: string
        internalPort: number
        service: string
        zoneId: string
      }
    > = {}

    for (const rule of newRules) {
      if (!isWholeHostnameRule(rule)) {
        skipped.push(
          `${rule.hostname} (path-specific routes remain managed in Cloudflare)`,
        )
        continue
      }

      // Only import hostnames that belong to a zone we know about
      const matchedZone = knownZones.find(([, zone]) => {
        const hostname = normalizedHostname(rule.hostname)
        const zoneName = normalizedHostname(zone.zoneName)
        return hostname.endsWith(`.${zoneName}`) || hostname === zoneName
      })
      if (!matchedZone) {
        skipped.push(`${rule.hostname} (not in any configured zone)`)
        continue
      }
      const zoneId = matchedZone[0]

      const parsed = parseLegacyServiceTarget(rule.service)
      if (!parsed) {
        skipped.push(`${rule.hostname} (unrecognised service: ${rule.service})`)
        continue
      }

      const { packageId, internalPort } = parsed
      const key = `${packageId}:${internalPort}`

      let match:
        | {
            packageId: string
            interfaceId: string
            hostId: string
            internalPort: number
          }
        | undefined

      if (packageId !== 'start-os') {
        const candidates = interfaceMap.get(key)
        const hostIds = new Set(
          candidates?.map((candidate) => candidate.hostId),
        )
        if (hostIds.size === 1) match = candidates?.[0]
      }

      if (!match && packageId !== 'start-os') {
        const candidates = interfaceMap.get(key)
        skipped.push(
          `${rule.hostname} (${candidates?.length ? 'multiple matching interfaces' : 'no matching interface found'} for ${packageId}:${internalPort})`,
        )
        continue
      }

      ingressUpdates[rule.hostname] = {
        packageId,
        hostId: match?.hostId ?? 'admin',
        interfaceId: match?.interfaceId ?? 'admin-ui',
        internalPort,
        service: rule.service,
        zoneId,
      }
      imported++
    }

    const currentEntries = Object.entries(conf.ingress ?? {}).filter(
      (item): item is [string, NonNullable<(typeof item)[1]>] => !!item[1],
    )
    const upserts: Record<string, StableIngress> = Object.fromEntries([
      ...currentEntries.map(([hostname, entry]) => [
        hostname,
        {
          packageId: entry.packageId,
          hostId: entry.hostId,
          interfaceId: entry.interfaceId,
          internalPort: entry.internalPort,
          zoneId: entry.zoneId,
        },
      ]),
      ...Object.entries(ingressUpdates).map(([hostname, entry]) => [
        hostname,
        {
          packageId: entry.packageId,
          hostId: entry.hostId,
          interfaceId: entry.interfaceId,
          internalPort: entry.internalPort,
          zoneId: entry.zoneId,
        },
      ]),
    ])
    const expectedServices = Object.fromEntries([
      ...currentEntries.map(([hostname, entry]) => [hostname, entry.service]),
      ...Object.entries(ingressUpdates).map(([hostname, entry]) => [
        hostname,
        entry.service,
      ]),
    ])

    let reconciled = false
    try {
      // Update Cloudflare first. Local ownership is recorded only after the
      // complete preservation-aware update succeeds.
      const result = await updateCloudflareIngress(
        effects,
        {
          accountId: tunnelZone.accountId,
          tunnelId: conf.tunnel.id,
          apiToken: tunnelZone.apiToken,
        },
        upserts,
        [],
        expectedServices,
      )
      reconciled = result.updated
      await store.merge(effects, {
        tunnel: { ...conf.tunnel, accountId: tunnelZone.accountId },
        ingress: {
          ...associateMigratedIngressWithZones(
            result.migratedIngress,
            conf.zones,
          ),
          ...result.ingress,
        },
        repairRequired: false,
        repairMessage: null,
      })
      await sdk.action.clearTask(effects, 'repair-cloudflare-routes')
    } catch (error) {
      const summary = summarizeCloudflareError(error)
      console.error(
        `Failed to import and reconcile Cloudflare routes: ${summary}`,
      )
      return {
        version: '1',
        title: 'Cloudflare Import Failed',
        message: `Could not safely import and update the Cloudflare routes. No local routes were imported. ${summary}`,
        result: null,
      }
    }

    const lines: string[] = []
    if (imported > 0)
      lines.push(
        `Imported ${imported} hostname${imported === 1 ? '' : 's'}: ${Object.keys(ingressUpdates).join(', ')}`,
      )
    if (skipped.length > 0)
      lines.push(`Skipped ${skipped.length}: ${skipped.join('; ')}`)
    if (reconciled) lines.push('Updated legacy routes in Cloudflare.')

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
