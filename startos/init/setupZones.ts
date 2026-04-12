import { sdk } from '../sdk'
import { certPem, decodeCert, zoneCertSubpath } from '../fileModels/certPem'
import { store } from '../fileModels/store.yaml'

const CF_API = 'https://api.cloudflare.com/client/v4'

/**
 * Runs reactively when cert.pem changes (new login).
 * Decodes the cert, fetches zone name, copies cert to a zone-specific file,
 * and adds the zone to the store's zones map.
 * Existing zones are preserved.
 */
export const setupZones = sdk.setupOnInit(async (effects) => {
  const cert = await certPem.read().const(effects)
  if (!cert) return

  // Decode cert
  let decoded: { zoneID: string; accountID: string; apiToken: string }
  try {
    decoded = decodeCert(cert)
  } catch (e) {
    console.error(`Failed to decode cert.pem: ${String(e)}`)
    return
  }

  // Skip if this zone is already registered
  const existing = await store.read().once()
  if (existing?.zones?.[decoded.zoneID]) return

  // Fetch zone name from Cloudflare API
  let zoneName: string
  try {
    const resp = await fetch(`${CF_API}/zones/${decoded.zoneID}`, {
      headers: {
        Authorization: `Bearer ${decoded.apiToken}`,
        'Content-Type': 'application/json',
      },
    })
    const data = (await resp.json()) as any
    if (!data.success) throw new Error(JSON.stringify(data.errors))
    zoneName = data.result.name
  } catch (e) {
    console.error(`Failed to fetch zone name: ${String(e)}`)
    return
  }

  // Copy cert.pem to a zone-specific file so it survives future logins,
  // then delete cert.pem so the state is always in the zones map
  await sdk.volumes.main.writeFile(zoneCertSubpath(decoded.zoneID), cert)
  try {
    const { unlink } = await import('node:fs/promises')
    await unlink(sdk.volumes.main.subpath('/.cloudflared/cert.pem'))
  } catch {}

  // Store the zone
  await store.merge(effects, {
    zones: {
      [decoded.zoneID]: {
        zoneId: decoded.zoneID,
        zoneName,
        accountId: decoded.accountID,
        apiToken: decoded.apiToken,
      },
    },
  })

  console.info(`Zone registered: ${zoneName} (${decoded.zoneID})`)
})
