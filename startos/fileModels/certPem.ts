import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * FileHelper for cert.pem - used only for .const() reactive watching.
 * When cert.pem is created/deleted, action metadata re-evaluates.
 */
export const certPem = FileHelper.string({
  base: sdk.volumes.main,
  subpath: '/.cloudflared/cert.pem',
})

/** Decode the cloudflared cert.pem into its JSON fields. */
export function decodeCert(cert: string): {
  zoneID: string
  accountID: string
  apiToken: string
} {
  const lines = cert.split('\n').filter((l) => l && !l.startsWith('-----'))
  return JSON.parse(Buffer.from(lines.join(''), 'base64').toString('utf8'))
}

/** Path within the .cloudflared volume subpath for a zone-specific cert. */
export function zoneCertSubpath(zoneId: string): string {
  return `/.cloudflared/zone-${zoneId}.pem`
}
