import { IngressEntry } from './fileModels/store.yaml'

const CF_API = 'https://api.cloudflare.com/client/v4'

function authHeaders(apiToken: string) {
  return {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Push ingress rules to the Cloudflare API.
 * This is the single source of truth for tunnel ingress when source=cloudflare.
 * Always appends the required catch-all rule.
 */
export async function pushIngressToApi(
  accountId: string,
  tunnelId: string,
  apiToken: string,
  ingress: Record<string, IngressEntry | null | undefined>,
): Promise<void> {
  const rules: Array<{ hostname?: string; service: string }> = []

  for (const [hostname, entry] of Object.entries(ingress)) {
    if (!entry) continue
    rules.push({ hostname, service: entry.service })
  }

  // Required catch-all
  rules.push({ service: 'http_status:404' })

  const resp = await fetch(
    `${CF_API}/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`,
    {
      method: 'PUT',
      headers: authHeaders(apiToken),
      body: JSON.stringify({
        config: {
          ingress: rules,
          'warp-routing': { enabled: false },
        },
      }),
    },
  )

  const data = (await resp.json()) as any
  if (!data.success) {
    throw new Error(`CF API error: ${JSON.stringify(data.errors)}`)
  }
}

/**
 * Fetch current ingress rules from the Cloudflare API.
 * Returns only hostname-bearing rules (excludes catch-all).
 */
export async function fetchIngressFromApi(
  accountId: string,
  tunnelId: string,
  apiToken: string,
): Promise<Array<{ hostname: string; service: string }>> {
  try {
    const resp = await fetch(
      `${CF_API}/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`,
      { headers: authHeaders(apiToken) },
    )
    const data = (await resp.json()) as any
    if (!data.success) return []
    return (
      (data.result?.config?.ingress as Array<{ hostname?: string; service: string }>) ?? []
    ).filter((r): r is { hostname: string; service: string } => !!r.hostname)
  } catch (e) {
    console.error(`Failed to fetch ingress from CF API: ${String(e)}`)
    return []
  }
}

/**
 * Delete a DNS CNAME record for a hostname from Cloudflare DNS.
 */
export async function deleteDnsRecord(
  zoneId: string,
  hostname: string,
  apiToken: string,
): Promise<void> {
  const listResp = await fetch(
    `${CF_API}/zones/${zoneId}/dns_records?name=${hostname}&type=CNAME`,
    { headers: authHeaders(apiToken) },
  )
  const listData = (await listResp.json()) as any
  const records: Array<{ id: string }> = listData.result ?? []

  for (const record of records) {
    const delResp = await fetch(
      `${CF_API}/zones/${zoneId}/dns_records/${record.id}`,
      { method: 'DELETE', headers: authHeaders(apiToken) },
    )
    const delData = (await delResp.json()) as any
    if (delData.success) {
      console.info(`DNS record deleted for ${hostname}`)
    } else {
      console.error(`Failed to delete DNS record for ${hostname}: ${JSON.stringify(delData.errors)}`)
    }
  }

  if (records.length === 0) {
    console.info(`No DNS CNAME record found for ${hostname}`)
  }
}
