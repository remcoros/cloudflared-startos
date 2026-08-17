import { T } from '@start9labs/start-sdk'
import { store, IngressEntry, ZoneInfo } from '../fileModels/store.yaml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

function single(
  name: string,
  value: string,
  description: string | null = null,
  copyable = false,
): T.ActionResultMember {
  return {
    type: 'single',
    name,
    description,
    value,
    copyable,
    masked: false,
    qr: false,
  }
}

function group(
  name: string,
  value: T.ActionResultMember[],
  description: string | null = null,
): T.ActionResultMember {
  return {
    type: 'group',
    name,
    description,
    value,
  }
}

function getTunnelGroup(conf: {
  tunnel: { id: string; name: string; accountId: string } | null
}): T.ActionResultMember {
  const tunnel = conf.tunnel

  if (!tunnel) {
    return group(i18n('Cloudflare Tunnel'), [
      single(i18n('Cloudflare Tunnel'), i18n('No tunnel selected')),
    ])
  }

  const value: T.ActionResultMember[] = [
    single(i18n('Tunnel Name'), tunnel.name),
    single(i18n('Tunnel ID'), tunnel.id, null, true),
  ]

  if (tunnel.accountId) {
    value.push(single(i18n('Account ID'), tunnel.accountId, null, true))
  }

  return group(i18n('Cloudflare Tunnel'), value)
}

function getZoneGroups(
  zones: Array<[string, ZoneInfo]>,
  ingressEntries: Array<[string, IngressEntry]>,
): T.ActionResultMember[] {
  if (zones.length === 0) {
    return [
      group(i18n('Configured DNS Zones'), [
        single(i18n('Configured DNS Zones'), i18n('No DNS zones configured')),
      ]),
    ]
  }

  return zones.map(([id, zone]) => {
    const zoneRoutes = ingressEntries.filter(([, entry]) => entry.zoneId === id)

    const routeGroups: T.ActionResultMember[] = zoneRoutes.length
      ? zoneRoutes.map(([hostname, entry]) =>
          group(hostname, [
            single(i18n('Public URL'), `https://${hostname}`, null, true),
            single(
              i18n('Package'),
              entry.packageId === 'start-os'
                ? i18n('StartOS Server')
                : entry.packageId,
            ),
            single(i18n('Interface ID'), entry.interfaceId),
            single(i18n('Internal Target'), entry.service, null, true),
          ]),
        )
      : [
          single(
            i18n('Application Routes'),
            i18n('No application routes are currently managed in this zone'),
          ),
        ]

    return group(i18n('DNS Zone: ${name}', { name: zone.zoneName }), [
      single(i18n('Zone ID'), zone.zoneId, null, true),
      ...routeGroups,
    ])
  })
}

export const managedOverview = sdk.Action.withoutInput(
  'managed-overview',

  async () => ({
    name: i18n('Managed Public Routes'),
    description: i18n(
      'View the Cloudflare DNS zones, tunnel, and application routes currently managed by this package.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Information'),
    visibility: 'enabled',
  }),

  async ({ effects }): Promise<T.ActionResult & { version: '1' }> => {
    const conf = await store.read().const(effects)
    const zones = Object.entries(conf?.zones ?? {})
      .filter((entry): entry is [string, ZoneInfo] => !!entry[1])
      .sort((a, b) => a[1].zoneName.localeCompare(b[1].zoneName))

    const ingressEntries = Object.entries(conf?.ingress ?? {})
      .filter((entry): entry is [string, IngressEntry] => !!entry[1])
      .sort((a, b) => a[0].localeCompare(b[0]))

    return {
      version: '1',
      title: i18n('Managed Public Routes'),
      message: i18n(
        'Show the DNS zones, tunnel, and public hostnames currently managed by this package.',
      ),
      result: {
        type: 'group',
        value: [
          getTunnelGroup({ tunnel: conf?.tunnel ?? null }),
          ...getZoneGroups(zones, ingressEntries),
        ],
      },
    }
  },
)
