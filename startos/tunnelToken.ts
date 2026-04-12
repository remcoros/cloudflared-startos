/**
 * The TUNNEL_TOKEN is base64-encoded JSON with short field names:
 * { a: accountTag, t: tunnelId, s: tunnelSecret }
 * Decoded via base64.StdEncoding per cloudflared source.
 */
export type TunnelCredentials = {
  AccountTag: string
  TunnelID: string
  TunnelSecret: string
}

export function decodeTunnelToken(token: string): TunnelCredentials {
  try {
    const json = Buffer.from(token, 'base64').toString('utf8')
    const parsed = JSON.parse(json)
    // Short field names used in the wire format
    const accountTag = parsed.a
    const tunnelID = parsed.t
    const tunnelSecret = parsed.s
    if (!accountTag || !tunnelID || !tunnelSecret) {
      throw new Error('Missing required fields in tunnel token')
    }
    return { AccountTag: accountTag, TunnelID: tunnelID, TunnelSecret: tunnelSecret }
  } catch (e) {
    throw new Error(
      `Invalid tunnel token: could not decode credentials. Make sure you pasted the full token from the Cloudflare dashboard.`,
    )
  }
}
