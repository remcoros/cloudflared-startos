export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Cloudflare tunnel': 1,
  'Cloudflare tunnel is running': 2,
  'Cloudflare tunnel is not running': 3,

  // interfaces.ts
  Metrics: 100,
  'Prometheus metrics endpoint': 101,

  // actions/cloudflareLogin.ts
  'Login to Cloudflare': 200,
  'Add DNS Zone': 201,
  'Authenticates with a Cloudflare DNS zone. Run this action again to add additional zones.': 202,

  // actions/selectTunnel.ts
  'A name for your new Cloudflare tunnel.': 209,
  'Cloudflare Tunnel: Not selected': 210,
  'Choose which Cloudflare tunnel this server runs. You can select an existing tunnel or create a new one.': 211,
  'Login to Cloudflare first to configure a zone': 212,

  // actions/removeZone.ts
  'Remove DNS Zone': 220,
  'Remove a Cloudflare DNS zone from this package. Existing hostnames in that zone may keep working, but this package will no longer manage their DNS or tunnel routes.': 221,
  'Existing DNS records and ingress rules in Cloudflare will NOT be deleted.': 222,
  'No zones configured': 223,

  // actions/addPublicHostname.ts
  'Add Public Hostname': 230,
  'Route a public Cloudflare hostname to this service': 231,
  Subdomain: 232,
  'The subdomain to route to this service (e.g. myapp).': 233,
  'Subdomain only, no dots (e.g. myapp)': 234,
  Domain: 235,
  'Login to Cloudflare to see your domains': 236,
  'No Zone Configured': 237,
  'Login to Cloudflare first (run "Login to Cloudflare" action) to configure a DNS zone.': 238,
  'No Tunnel Configured': 239,
  'Select a Cloudflare tunnel first (run "Cloudflare Tunnel" action).': 240,
  'Public Hostname Added': 241,
  'DNS record created automatically.': 242,
  'Add a CNAME record manually in the Cloudflare dashboard (proxied).': 243,

  // actions/importPublicHostnames.ts
  'Import Public Hostnames': 260,
  'Scan existing public hostnames from your Cloudflare tunnel and add URLs to matching installed services.': 261,
  'This will scan existing public hostnames from the Cloudflare tunnel and add URLs to matching installed services.': 262,
  'No new public hostnames found in Cloudflare that are not already tracked.': 263,

  // actions/deletePublicHostname.ts
  'Delete Public Hostname': 250,
  'Remove a Cloudflare public hostname route': 251,
  'This will remove this hostname from your Cloudflare tunnel and delete the DNS record from Cloudflare.': 252,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
