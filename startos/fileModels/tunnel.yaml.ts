import { T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { IngressEntry, StoreType } from './store.yaml'
import { FileHelper } from '@start9labs/start-sdk'

/**
 * FileHelper for cert.pem - used only for .const() reactive watching.
 */
export const certPem = FileHelper.string({
  base: sdk.volumes.main,
  subpath: '/.cloudflared/cert.pem',
})

export const TUNNEL_CONFIG_PATH = '/start9/tunnel.yaml'

/**
 * Fetch ingress rules from the Cloudflare API (dashboard-managed config).
 * Returns array of { hostname?, service } - excludes the catch-all.
 */
async function fetchRemoteIngress(
  accountId: string,
  tunnelId: string,
  apiToken: string,
): Promise<Array<{ hostname?: string; service: string }>> {
  try {
    const resp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    const data = (await resp.json()) as any
    if (!data.success) return []
    return (
      (data.result?.config?.ingress as Array<{ hostname?: string; service: string }>) ?? []
    ).filter((r) => r.hostname) // exclude catch-all
  } catch (e) {
    console.error(`Failed to fetch remote ingress: ${String(e)}`)
    return []
  }
}

/**
 * Build and write the cloudflared tunnel config YAML to the volume.
 * Merges local store ingress with dashboard-configured remote ingress.
 * Local rules take precedence; remote-only rules are appended.
 * cloudflared reads this once at startup via --config.
 */
export async function writeTunnelConfig(
  effects: T.Effects,
  conf: Pick<StoreType, 'ingress' | 'tunnel' | 'zoneInfo'>,
): Promise<void> {
  const localIngress = conf.ingress ?? {}

  // Fetch remote (dashboard) ingress if we have credentials
  let remoteRules: Array<{ hostname: string; service: string }> = []
  if (conf.tunnel && conf.zoneInfo) {
    const raw = await fetchRemoteIngress(
      conf.zoneInfo.accountId,
      conf.tunnel.id,
      conf.zoneInfo.apiToken,
    )
    remoteRules = raw.filter((r): r is { hostname: string; service: string } => !!r.hostname)
  }

  const lines: string[] = ['ingress:']

  // Local rules first (take precedence)
  const localHostnames = new Set<string>()
  for (const [hostname, entry] of Object.entries(localIngress)) {
    if (!entry) continue
    lines.push(`  - hostname: ${hostname}`)
    lines.push(`    service: ${entry.service}`)
    localHostnames.add(hostname)
  }

  // Remote rules that aren't already covered locally
  for (const rule of remoteRules) {
    if (localHostnames.has(rule.hostname)) continue
    lines.push(`  - hostname: ${rule.hostname}`)
    lines.push(`    service: ${rule.service}`)
  }

  // Required catch-all
  lines.push('  - service: http_status:404')
  lines.push('')

  await sdk.volumes.main.writeFile(TUNNEL_CONFIG_PATH, lines.join('\n'))
}
