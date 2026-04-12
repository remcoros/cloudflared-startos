import { T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { IngressEntry } from './store.yaml'
import { FileHelper } from '@start9labs/start-sdk'

/**
 * FileHelper for cert.pem — used only for .const() reactive watching.
 * When cert.pem is created/deleted, action metadata re-evaluates.
 */
export const certPem = FileHelper.string({
  base: sdk.volumes.main,
  subpath: '/.cloudflared/cert.pem',
})

export const TUNNEL_CONFIG_PATH = '/start9/tunnel.yaml'

/**
 * Build and write the cloudflared tunnel config YAML to the volume.
 * We only ever write this file — cloudflared reads it once at startup via --config.
 */
export async function writeTunnelConfig(
  effects: T.Effects,
  ingress: Record<string, IngressEntry | null | undefined>,
): Promise<void> {
  const lines: string[] = ['ingress:']

  for (const [hostname, entry] of Object.entries(ingress)) {
    if (!entry) continue
    lines.push(`  - hostname: ${hostname}`)
    lines.push(`    service: ${entry.service}`)
  }

  // Required catch-all rule
  lines.push('  - service: http_status:404')
  lines.push('')

  await sdk.volumes.main.writeFile(TUNNEL_CONFIG_PATH, lines.join('\n'))
}
