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
  'Login to a Cloudflare DNS zone in the same account as the selected tunnel, then try again.': 264,

  // actions/deletePublicHostname.ts
  'Delete Public Hostname': 250,
  'Remove a Cloudflare public hostname route': 251,
  'This will remove this hostname from your Cloudflare tunnel and delete the DNS record from Cloudflare.': 252,

  // actions/managedOverview.ts
  'Managed Public Routes': 270,
  'View the Cloudflare DNS zones, tunnel, and application routes currently managed by this package.': 271,
  'Show the DNS zones, tunnel, and public hostnames currently managed by this package.': 272,
  'Cloudflare Tunnel': 273,
  'No tunnel selected': 274,
  'Tunnel Name': 275,
  'Tunnel ID': 276,
  'Account ID': 277,
  'Configured DNS Zones': 278,
  'No DNS zones configured': 279,
  'Domain Name': 280,
  'Zone ID': 281,
  'Managed Hostnames': 282,
  'Managed Application Routes': 283,
  'No public hostnames are currently managed': 284,
  'Public URL': 285,
  Package: 286,
  'StartOS Server': 287,
  'DNS Zone': 288,
  'Interface ID': 289,
  'Internal Target': 290,
  'Application Routes': 291,
  'No application routes are currently managed in this zone': 292,

  // actions/repairRoutes.ts and init/setupTasks.ts
  'Repair Cloudflare Routes': 300,
  'Reconnect managed Cloudflare routes to their selected StartOS services.': 301,
  'Cloudflare Routes Repaired': 302,
  'Managed Cloudflare routes were updated successfully.': 303,
  'Cloudflare Route Repair Failed': 304,
  'Cloudflare routes could not be updated safely. Check the service logs, then try again.': 305,
  'Login to Cloudflare to configure a DNS zone': 306,
  'Select or create a Cloudflare tunnel for this server': 307,
  'Cloudflare routes need to be reconnected to their selected StartOS services.': 308,
  'No Cloudflare zone credentials are available to repair tunnel routes.': 309,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
