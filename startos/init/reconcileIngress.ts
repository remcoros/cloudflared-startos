import { T } from '@start9labs/start-sdk'
import {
  CloudflareIngressRule,
  CloudflareTunnelConfig,
  summarizeCloudflareError,
  updateTunnelConfig,
} from '../cfApi'
import { IngressEntry, StoreType, store } from '../fileModels/store.yaml'
import { sdk } from '../sdk'
import { i18n } from '../i18n'

export type StableIngress = Omit<IngressEntry, 'service'>

type LegacyServiceTarget = {
  packageId: string
  internalPort: number
  url: URL
}

type CloudflareCredentials = {
  accountId: string
  tunnelId: string
  apiToken: string
}

function normalizedHostname(hostname: string) {
  return hostname.trim().toLowerCase()
}

export function isWholeHostnameRule(rule: CloudflareIngressRule) {
  return typeof rule.path !== 'string' || rule.path.length === 0
}

/** Parse beta.9 StartOS targets without treating ordinary remote origins as owned. */
export function parseLegacyServiceTarget(
  service: string,
): LegacyServiceTarget | null {
  try {
    const url = new URL(service)
    const hostname = url.hostname.toLowerCase()
    const internalPort =
      Number(url.port) ||
      (url.protocol === 'http:' ? 80 : url.protocol === 'https:' ? 443 : 0)
    if (!internalPort) return null

    if (hostname === 'startos') {
      return { packageId: 'start-os', internalPort, url }
    }
    if (!hostname.endsWith('.startos')) return null

    const packageId = hostname.slice(0, -'.startos'.length)
    if (!packageId) return null
    return { packageId, internalPort, url }
  } catch {
    return null
  }
}

function serviceWithAddress(url: URL, address: string) {
  const next = new URL(url.toString())
  const separator = address.lastIndexOf(':')
  if (separator < 1)
    throw new Error(
      i18n('Invalid StartOS bridge address: ${address}', { address }),
    )
  next.hostname = address.slice(0, separator)
  next.port = address.slice(separator + 1)
  const result = next.toString()
  return next.pathname === '/' && !next.search && !next.hash
    ? result.replace(/\/$/, '')
    : result
}

async function resolveService(effects: T.Effects, entry: StableIngress) {
  const value = await sdk.host
    .getBridgeAddress(effects, {
      packageId: entry.packageId,
      hostId: entry.hostId,
      internalPort: entry.internalPort,
    })
    .once()
  return value ? `http://${value}` : null
}

async function resolveLegacyService(
  effects: T.Effects,
  target: LegacyServiceTarget,
) {
  let hostId = 'admin'
  let interfaceId = 'admin-ui'

  if (target.packageId !== 'start-os') {
    let interfaces: Awaited<ReturnType<T.Effects['listServiceInterfaces']>>
    try {
      interfaces = await effects.listServiceInterfaces({
        packageId: target.packageId,
      })
    } catch {
      throw new Error(
        i18n('Could not inspect ${packageId} while migrating ${url}.', {
          packageId: target.packageId,
          url: target.url.toString(),
        }),
      )
    }

    const matchingInterfaces = Object.entries(interfaces).filter(
      ([, iface]) => iface.addressInfo.internalPort === target.internalPort,
    )
    const matchingHostIds = [
      ...new Set(
        matchingInterfaces.map(([, iface]) => iface.addressInfo.hostId),
      ),
    ]

    if (matchingHostIds.length !== 1) {
      throw new Error(
        i18n(
          matchingHostIds.length === 0
            ? 'Cannot safely migrate ${url}: no matching interface exists for ${target}. The live Cloudflare configuration was not changed.'
            : 'Cannot safely migrate ${url}: multiple matching interfaces exist for ${target}. The live Cloudflare configuration was not changed.',
          {
            url: target.url.toString(),
            target: `${target.packageId}:${target.internalPort}`,
          },
        ),
      )
    }
    hostId = matchingHostIds[0]
    interfaceId = matchingInterfaces.find(
      ([, iface]) => iface.addressInfo.hostId === hostId,
    )![0]
  }

  const address = await resolveService(effects, {
    packageId: target.packageId,
    hostId,
    interfaceId: target.packageId === 'start-os' ? 'admin-ui' : '',
    internalPort: target.internalPort,
    zoneId: '',
  })
  if (!address) {
    throw new Error(
      i18n(
        'Cannot resolve a StartOS bridge address for ${url}. The live Cloudflare configuration was not changed.',
        { url: target.url.toString() },
      ),
    )
  }

  return {
    service: serviceWithAddress(target.url, address.slice('http://'.length)),
    entry: {
      packageId: target.packageId,
      hostId,
      interfaceId,
      internalPort: target.internalPort,
      zoneId: '',
    },
  }
}

function mergeIngressRules(
  config: CloudflareTunnelConfig,
  upserts: Record<string, IngressEntry>,
  removals: Set<string>,
  migratedRules: CloudflareIngressRule[],
): CloudflareTunnelConfig {
  const normalizedUpserts = new Map(
    Object.entries(upserts).map(([hostname, entry]) => [
      normalizedHostname(hostname),
      { hostname, entry },
    ]),
  )
  const matched = new Set<string>()
  const rules: CloudflareIngressRule[] = []

  for (const hostname of new Set([...normalizedUpserts.keys(), ...removals])) {
    const matches = migratedRules.filter(
      (rule) =>
        typeof rule.hostname === 'string' &&
        normalizedHostname(rule.hostname) === hostname &&
        isWholeHostnameRule(rule),
    )
    if (matches.length > 1) {
      throw new Error(
        i18n(
          'Cloudflare has multiple whole-hostname rules for ${hostname}. Refusing to guess which route is managed; the live configuration was not changed.',
          { hostname },
        ),
      )
    }
  }

  for (const rule of migratedRules) {
    const hostname =
      typeof rule.hostname === 'string'
        ? normalizedHostname(rule.hostname)
        : null
    if (hostname && removals.has(hostname) && isWholeHostnameRule(rule)) {
      continue
    }

    const upsert =
      hostname && isWholeHostnameRule(rule)
        ? normalizedUpserts.get(hostname)
        : undefined
    if (upsert) {
      matched.add(hostname!)
      rules.push({ ...rule, service: upsert.entry.service })
    } else {
      rules.push(rule)
    }
  }

  const additions = [...normalizedUpserts.entries()]
    .filter(([hostname]) => !matched.has(hostname) && !removals.has(hostname))
    .map(([, { hostname, entry }]) => ({
      hostname,
      service: entry.service,
    }))

  const fallbackIndex = rules.findIndex(
    (rule) => typeof rule.hostname !== 'string',
  )
  if (fallbackIndex < 0) {
    rules.push(...additions, { service: 'http_status:404' })
  } else {
    rules.splice(fallbackIndex, 0, ...additions)
  }

  return { ...config, ingress: rules }
}

function assertMutationOwnership(
  rules: CloudflareIngressRule[],
  hostnames: Set<string>,
  expectedServices: Record<string, string | null>,
  desiredIngress: Record<string, IngressEntry>,
) {
  const normalizedExpected = new Map(
    Object.entries(expectedServices).map(([hostname, service]) => [
      normalizedHostname(hostname),
      service,
    ]),
  )
  const normalizedDesired = new Map(
    Object.entries(desiredIngress).map(([hostname, entry]) => [
      normalizedHostname(hostname),
      entry.service,
    ]),
  )

  for (const hostname of hostnames) {
    const matches = rules.filter(
      (rule) =>
        typeof rule.hostname === 'string' &&
        normalizedHostname(rule.hostname) === hostname &&
        isWholeHostnameRule(rule),
    )
    if (matches.length > 1) {
      throw new Error(
        i18n(
          'Cloudflare has multiple whole-hostname rules for ${hostname}. Refusing to guess which route is managed; the live configuration was not changed.',
          { hostname },
        ),
      )
    }
    if (matches.length === 0) continue

    const expected = normalizedExpected.get(hostname)
    const actual = matches[0].service
    const desired = normalizedDesired.get(hostname)
    if (
      actual !== desired &&
      (expected === undefined || expected === null || actual !== expected)
    ) {
      throw new Error(
        i18n(
          'The live Cloudflare route for ${hostname} no longer matches the StartOS-managed route. Refusing to overwrite or remove it; import or reconcile the route manually first.',
          { hostname },
        ),
      )
    }
  }
}

async function migrateLegacyRules(
  effects: T.Effects,
  rules: CloudflareIngressRule[],
  skipHostnames: Set<string>,
) {
  const resolved = new Map<string, string>()
  const resolvedEntries = new Map<string, StableIngress>()
  let migrated = 0
  const next: CloudflareIngressRule[] = []
  const ingress: Record<string, IngressEntry> = {}

  for (const rule of rules) {
    const hostname =
      typeof rule.hostname === 'string'
        ? normalizedHostname(rule.hostname)
        : null
    if (hostname && skipHostnames.has(hostname) && isWholeHostnameRule(rule)) {
      next.push(rule)
      continue
    }

    const target =
      typeof rule.service === 'string'
        ? parseLegacyServiceTarget(rule.service)
        : null
    if (!target) {
      next.push(rule)
      continue
    }

    const cacheKey = target.url.toString()
    let service = resolved.get(cacheKey)
    let entry = resolvedEntries.get(cacheKey)
    if (!service) {
      const result = await resolveLegacyService(effects, target)
      service = result.service
      entry = result.entry
      resolved.set(cacheKey, result.service)
      resolvedEntries.set(cacheKey, result.entry)
    }
    next.push({ ...rule, service })
    if (hostname && entry && isWholeHostnameRule(rule)) {
      ingress[rule.hostname!] = { ...entry, service }
    }
    migrated += 1
  }

  return { rules: next, ingress, migrated }
}

export function associateMigratedIngressWithZones(
  ingress: Record<string, IngressEntry>,
  zones: StoreType['zones'],
) {
  const knownZones = Object.entries(zones)
    .filter(
      (item): item is [string, NonNullable<(typeof item)[1]>] =>
        item[1] !== null && item[1] !== undefined,
    )
    .sort(([, left], [, right]) => right.zoneName.length - left.zoneName.length)
  const associated: Record<string, IngressEntry> = {}

  for (const [hostname, entry] of Object.entries(ingress)) {
    const normalized = normalizedHostname(hostname)
    const zone = knownZones.find(
      ([, value]) =>
        normalized === normalizedHostname(value.zoneName) ||
        normalized.endsWith(`.${normalizedHostname(value.zoneName)}`),
    )
    if (zone) associated[hostname] = { ...entry, zoneId: zone[0] }
  }

  return associated
}

/**
 * Safely update owned routes while retaining the complete live Cloudflare
 * configuration. Legacy .startos targets are migrated in the same atomic PUT.
 */
export async function updateCloudflareIngress(
  effects: T.Effects,
  credentials: CloudflareCredentials,
  upserts: Record<string, StableIngress> = {},
  removeHostnames: string[] = [],
  expectedServices: Record<string, string | null> = {},
) {
  const resolvedUpserts: Record<string, IngressEntry> = {}
  for (const [hostname, entry] of Object.entries(upserts)) {
    const service = await resolveService(effects, entry)
    if (!service) {
      throw new Error(
        i18n('Could not resolve ${target} for ${hostname}.', {
          target: `${entry.packageId}/${entry.hostId}:${entry.internalPort}`,
          hostname,
        }),
      )
    }
    resolvedUpserts[hostname] = { ...entry, service }
  }

  const removals = new Set(removeHostnames.map(normalizedHostname))
  const skipHostnames = new Set([
    ...removals,
    ...Object.keys(resolvedUpserts).map(normalizedHostname),
  ])
  let migrated = 0
  let migratedIngress: Record<string, IngressEntry> = {}

  const updated = await updateTunnelConfig(
    credentials.accountId,
    credentials.tunnelId,
    credentials.apiToken,
    async (config) => {
      assertMutationOwnership(
        config.ingress,
        new Set([
          ...removals,
          ...Object.keys(resolvedUpserts).map(normalizedHostname),
        ]),
        expectedServices,
        resolvedUpserts,
      )
      const migration = await migrateLegacyRules(
        effects,
        config.ingress,
        skipHostnames,
      )
      migrated = migration.migrated
      migratedIngress = migration.ingress
      return mergeIngressRules(
        config,
        resolvedUpserts,
        removals,
        migration.rules,
      )
    },
  )

  return { ingress: resolvedUpserts, migratedIngress, migrated, updated }
}

async function setRepairState(
  effects: T.Effects,
  required: boolean,
  message: string | null,
) {
  await store.merge(
    effects,
    { repairRequired: required, repairMessage: message },
    { allowWriteAfterConst: true },
  )
  if (!required) await sdk.action.clearTask(effects, 'repair-cloudflare-routes')
}

async function reconcileConfig(
  effects: T.Effects,
  conf: Pick<StoreType, 'tunnel' | 'zones'> & {
    ingress: Record<string, IngressEntry | null>
  },
) {
  const entries = Object.entries(conf.ingress).filter(
    (item): item is [string, IngressEntry] => item[1] !== null,
  )
  if (!conf.tunnel) {
    await setRepairState(effects, false, null)
    return { hasTunnel: false, repaired: 0, migrated: 0, updated: false }
  }

  const zone =
    Object.values(conf.zones).find(
      (candidate) =>
        candidate &&
        (!conf.tunnel?.accountId ||
          candidate.accountId === conf.tunnel.accountId),
    ) ?? Object.values(conf.zones).find(Boolean)
  if (!zone) {
    const message = i18n(
      'No Cloudflare zone credentials are available to repair tunnel routes.',
    )
    await setRepairState(effects, true, message)
    throw new Error(message)
  }

  let result: Awaited<ReturnType<typeof updateCloudflareIngress>>
  try {
    result = await updateCloudflareIngress(
      effects,
      {
        accountId: zone.accountId,
        tunnelId: conf.tunnel.id,
        apiToken: zone.apiToken,
      },
      Object.fromEntries(
        entries.map(([hostname, entry]) => [
          hostname,
          {
            packageId: entry.packageId,
            hostId: entry.hostId,
            interfaceId: entry.interfaceId,
            internalPort: entry.internalPort,
            zoneId: entry.zoneId,
          },
        ]),
      ),
      [],
      Object.fromEntries(
        entries.map(([hostname, entry]) => [hostname, entry.service]),
      ),
    )
  } catch (error) {
    console.error(
      'Cloudflare route reconciliation failed:',
      summarizeCloudflareError(error),
    )
    const message = i18n(
      'Cloudflare routes could not be updated safely. Check the service logs, then try again.',
    )
    await setRepairState(effects, true, message)
    throw error
  }

  await store.merge(
    effects,
    {
      ingress: {
        ...associateMigratedIngressWithZones(
          result.migratedIngress,
          conf.zones,
        ),
        ...result.ingress,
      },
      repairRequired: false,
      repairMessage: null,
    },
    { allowWriteAfterConst: true },
  )
  await sdk.action.clearTask(effects, 'repair-cloudflare-routes')
  return {
    hasTunnel: true,
    repaired: entries.length + result.migrated,
    migrated: result.migrated,
    updated: result.updated,
  }
}

export async function reconcileIngressOnce(effects: T.Effects) {
  const conf = await store.read().once()
  if (!conf)
    return { hasTunnel: false, repaired: 0, migrated: 0, updated: false }
  return reconcileConfig(effects, {
    tunnel: conf.tunnel,
    zones: conf.zones,
    ingress: Object.fromEntries(
      Object.entries(conf.ingress).map(([hostname, entry]) => [
        hostname,
        entry,
      ]),
    ),
  })
}

export const reconcileIngress = sdk.setupOnInit(async (effects) => {
  const conf = await store
    .read((value) => ({
      tunnel: value.tunnel,
      zones: value.zones,
      ingress: Object.fromEntries(
        Object.entries(value.ingress).map(([hostname, entry]) => [
          hostname,
          entry,
        ]),
      ),
    }))
    .once()
  if (!conf) return

  try {
    await reconcileConfig(effects, conf)
  } catch (error) {
    console.error('Cloudflare route reconciliation failed:', error)
  }
})
