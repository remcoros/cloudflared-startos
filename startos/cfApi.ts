import { IngressEntry } from './fileModels/store.yaml'

const CF_API = 'https://api.cloudflare.com/client/v4'

type CloudflareBody = {
  success?: boolean
  errors?: Array<{ code?: number; message?: string }>
  messages?: Array<{ code?: number; message?: string }>
  result?: any
}

export class CloudflareApiError extends Error {
  context: string
  status: number
  body: CloudflareBody | string | null

  constructor(context: string, status: number, body: CloudflareBody | string | null) {
    super(`${context}: ${summarizeCloudflareBody(body)}`)
    this.name = 'CloudflareApiError'
    this.context = context
    this.status = status
    this.body = body
  }
}

function authHeaders(apiToken: string) {
  return {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  }
}

function summarizeCloudflareBody(body: CloudflareBody | string | null | undefined): string {
  if (!body) return 'Unknown Cloudflare error'

  if (typeof body === 'string') {
    return body.trim() || 'Unknown Cloudflare error'
  }

  const parts = [...(body.errors ?? []), ...(body.messages ?? [])]
    .map((entry) => {
      const code = entry.code ? `#${entry.code} ` : ''
      return `${code}${entry.message ?? 'Unknown error'}`.trim()
    })
    .filter(Boolean)

  if (parts.length > 0) return parts.join('; ')
  return 'Unknown Cloudflare error'
}

export function summarizeCloudflareError(error: unknown): string {
  if (error instanceof CloudflareApiError) {
    const status = error.status ? ` (HTTP ${error.status})` : ''
    return `${summarizeCloudflareBody(error.body)}${status}`
  }
  if (error instanceof Error) return error.message
  return String(error)
}

async function parseCloudflareResponse(
  resp: Response,
  context: string,
): Promise<CloudflareBody> {
  let body: CloudflareBody | string | null = null

  try {
    body = (await resp.json()) as CloudflareBody
  } catch {
    try {
      body = await resp.text()
    } catch {
      body = null
    }
  }

  const success = typeof body === 'object' && body !== null ? body.success : false
  if (!resp.ok || !success) {
    throw new CloudflareApiError(context, resp.status, body)
  }

  return body as CloudflareBody
}

async function fetchCloudflare(
  input: string,
  init: RequestInit,
  context: string,
): Promise<CloudflareBody> {
  try {
    const resp = await fetch(input, init)
    return await parseCloudflareResponse(resp, context)
  } catch (error) {
    if (error instanceof CloudflareApiError) throw error
    throw new CloudflareApiError(
      context,
      0,
      error instanceof Error ? error.message : String(error),
    )
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

  await fetchCloudflare(
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
    `Failed to update Cloudflare tunnel configuration for tunnel ${tunnelId}`,
  )
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
  const data = await fetchCloudflare(
    `${CF_API}/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`,
    { headers: authHeaders(apiToken) },
    `Failed to fetch Cloudflare tunnel configuration for tunnel ${tunnelId}`,
  )

  return (
    (data.result?.config?.ingress as Array<{ hostname?: string; service: string }>) ?? []
  ).filter((r): r is { hostname: string; service: string } => !!r.hostname)
}

export type DeleteDnsRecordResult = {
  deletedCount: number
  missing: boolean
  errors: string[]
}

/**
 * Delete a DNS CNAME record for a hostname from Cloudflare DNS.
 */
export async function deleteDnsRecord(
  zoneId: string,
  hostname: string,
  apiToken: string,
): Promise<DeleteDnsRecordResult> {
  const listData = await fetchCloudflare(
    `${CF_API}/zones/${zoneId}/dns_records?name=${hostname}&type=CNAME`,
    { headers: authHeaders(apiToken) },
    `Failed to list DNS records for ${hostname}`,
  )
  const records: Array<{ id: string }> = listData.result ?? []
  const errors: string[] = []
  let deletedCount = 0

  for (const record of records) {
    try {
      await fetchCloudflare(
        `${CF_API}/zones/${zoneId}/dns_records/${record.id}`,
        { method: 'DELETE', headers: authHeaders(apiToken) },
        `Failed to delete DNS record ${record.id} for ${hostname}`,
      )
      deletedCount += 1
      console.info(`DNS record deleted for ${hostname}`)
    } catch (error) {
      const summary = summarizeCloudflareError(error)
      errors.push(summary)
      console.error(`Failed to delete DNS record for ${hostname}: ${summary}`)
    }
  }

  if (records.length === 0) {
    console.info(`No DNS CNAME record found for ${hostname}`)
  }

  return {
    deletedCount,
    missing: records.length === 0,
    errors,
  }
}
