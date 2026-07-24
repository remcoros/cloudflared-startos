const CF_API = 'https://api.cloudflare.com/client/v4'

type CloudflareBody = {
  success?: boolean
  errors?: Array<{ code?: number; message?: string }>
  messages?: Array<{ code?: number; message?: string }>
  result?: any
}

export type CloudflareIngressRule = {
  hostname?: string
  service?: string
  [key: string]: unknown
}

export type CloudflareTunnelConfig = {
  ingress: CloudflareIngressRule[]
  [key: string]: unknown
}

export class CloudflareApiError extends Error {
  context: string
  status: number
  body: CloudflareBody | string | null

  constructor(
    context: string,
    status: number,
    body: CloudflareBody | string | null,
  ) {
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

function summarizeCloudflareBody(
  body: CloudflareBody | string | null | undefined,
): string {
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

  const success =
    typeof body === 'object' && body !== null ? body.success : false
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Fetch the complete remotely-managed tunnel configuration.
 *
 * Callers must preserve this object when changing ingress. Cloudflare's PUT
 * endpoint replaces the complete configuration, not just the supplied rules.
 */
export async function fetchTunnelConfig(
  accountId: string,
  tunnelId: string,
  apiToken: string,
): Promise<CloudflareTunnelConfig> {
  const data = await fetchCloudflare(
    `${CF_API}/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`,
    { headers: authHeaders(apiToken) },
    `Failed to fetch Cloudflare tunnel configuration for tunnel ${tunnelId}`,
  )

  const config = isRecord(data.result) ? data.result.config : null
  if (!isRecord(config)) {
    throw new Error(
      `Cloudflare returned no usable configuration for tunnel ${tunnelId}. Refusing to replace it.`,
    )
  }

  const ingress = config.ingress
  if (!Array.isArray(ingress) || !ingress.every(isRecord)) {
    throw new Error(
      `Cloudflare returned malformed ingress rules for tunnel ${tunnelId}. Refusing to replace them.`,
    )
  }

  return {
    ...config,
    ingress: ingress as CloudflareIngressRule[],
  }
}

/**
 * Read, mutate, and replace a complete tunnel configuration.
 *
 * The updater receives the live Cloudflare object so it can retain every
 * unowned route and field. Throwing from the updater prevents the PUT.
 */
export async function updateTunnelConfig(
  accountId: string,
  tunnelId: string,
  apiToken: string,
  updater: (
    config: CloudflareTunnelConfig,
  ) => Promise<CloudflareTunnelConfig> | CloudflareTunnelConfig,
): Promise<boolean> {
  let current = await fetchTunnelConfig(accountId, tunnelId, apiToken)

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const next = await updater(current)
    const currentJson = JSON.stringify(current)
    if (JSON.stringify(next) === currentJson) return false

    // Resolving StartOS bindings can take time. Re-read immediately before the
    // full-config PUT and rebase if a dashboard edit landed in the meantime.
    const latest = await fetchTunnelConfig(accountId, tunnelId, apiToken)
    if (JSON.stringify(latest) !== currentJson) {
      if (attempt === 2) {
        throw new Error(
          `Cloudflare tunnel ${tunnelId} kept changing while preparing an update. Refusing to replace a newer configuration.`,
        )
      }
      current = latest
      continue
    }

    await fetchCloudflare(
      `${CF_API}/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`,
      {
        method: 'PUT',
        headers: authHeaders(apiToken),
        body: JSON.stringify({ config: next }),
      },
      `Failed to update Cloudflare tunnel configuration for tunnel ${tunnelId}`,
    )
    return true
  }

  return false
}

/**
 * Fetch current ingress rules from the Cloudflare API.
 * Returns only hostname-bearing rules (excludes catch-all).
 */
export async function fetchIngressFromApi(
  accountId: string,
  tunnelId: string,
  apiToken: string,
): Promise<
  Array<
    CloudflareIngressRule & {
      hostname: string
      service: string
    }
  >
> {
  const config = await fetchTunnelConfig(accountId, tunnelId, apiToken)
  return config.ingress.filter(
    (
      rule,
    ): rule is CloudflareIngressRule & {
      hostname: string
      service: string
    } => typeof rule.hostname === 'string' && typeof rule.service === 'string',
  )
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
