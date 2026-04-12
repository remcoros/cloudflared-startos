import { sdk } from '../sdk'
import { certPem } from '../fileModels/tunnel.yaml'
import { store, ZoneInfo } from '../fileModels/store.yaml'

/**
 * Decode the zone credentials from cert.pem and fetch the zone name from
 * the Cloudflare API. Runs reactively when cert.pem changes.
 * Stores the result so we only fetch once (or when the cert changes).
 */
export const setupZoneInfo = sdk.setupOnInit(async (effects) => {
  const cert = await certPem.read().const(effects)
  if (!cert) {
    // Not logged in - clear any stale zone info
    const conf = await store.read().once()
    if (conf?.zoneInfo) {
      await store.merge(effects, { zoneInfo: null })
    }
    return
  }

  // Avoid re-fetching if we already have zone info from the same cert
  const existing = await store.read().once()

  // Decode cert.pem: PEM-wrapped base64 JSON { zoneID, accountID, apiToken }
  let decoded: any
  try {
    const lines = cert
      .split('\n')
      .filter((l) => l && !l.startsWith('-----'))
    decoded = JSON.parse(
      Buffer.from(lines.join(''), 'base64').toString('utf8'),
    )
  } catch (e) {
    console.error(`Failed to decode cert.pem: ${String(e)}`)
    return
  }

  if (existing?.zoneInfo?.zoneId === decoded.zoneID) return

  // Fetch zone name from Cloudflare API
  let zoneInfo: ZoneInfo
  try {
    const resp = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${decoded.zoneID}`,
      {
        headers: {
          Authorization: `Bearer ${decoded.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
    const data = (await resp.json()) as any
    if (!data.success) {
      throw new Error(`CF API error: ${JSON.stringify(data.errors)}`)
    }

    zoneInfo = {
      zoneId: decoded.zoneID,
      zoneName: data.result.name,
      accountId: decoded.accountID,
      apiToken: decoded.apiToken,
    }
  } catch (e) {
    console.error(`Failed to fetch zone info from cert.pem: ${String(e)}`)
    return
  }

  await store.merge(effects, { zoneInfo })
  console.info(`Zone info stored: ${zoneInfo.zoneName} (${zoneInfo.zoneId})`)
})
