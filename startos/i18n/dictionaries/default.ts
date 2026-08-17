export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Cloudflare tunnel': 1,
  'Cloudflare tunnel is running': 2,
  'Cloudflare tunnel is not running': 3,
  'No Cloudflare tunnel is configured.': 4,
  'Cloudflared configuration is unavailable.': 5,

  // interfaces.ts
  Metrics: 100,
  'Prometheus metrics endpoint': 101,

  // actions/cloudflareLogin.ts
  'Login to Cloudflare': 200,
  'Add DNS Zone': 201,
  'Authenticates with a Cloudflare DNS zone. Run this action again to add additional zones.': 202,
  'Cloudflare Authorization': 203,
  'Visit the URL below to authorize. After authorizing, DNS routes will be created automatically when you add a public hostname.': 204,
  'Cloudflare login was restarted by a newer request. Use the newest login action result.': 205,
  'Timed out waiting for the Cloudflare authorization URL. Check the service logs.': 206,

  // actions/selectTunnel.ts
  'A name for your new Cloudflare tunnel.': 209,
  'Cloudflare Tunnel: Not selected': 210,
  'Choose which Cloudflare tunnel this server runs. You can select an existing tunnel or create a new one.': 211,
  'Login to Cloudflare first to configure a zone': 212,
  'Select Tunnel': 213,
  'Cloudflare Tunnel: ${name}': 214,
  'Could not load existing tunnels from Cloudflare. You can still create a new tunnel.': 215,
  'Create new tunnel': 216,
  Tunnel: 217,
  'Tunnel name is required.': 218,

  // actions/removeZone.ts
  'Remove DNS Zone': 220,
  'Remove a Cloudflare DNS zone from this package. Existing hostnames in that zone may keep working, but this package will no longer manage their DNS or tunnel routes.': 221,
  'Existing DNS records and ingress rules in Cloudflare will NOT be deleted.': 222,
  'No zones configured': 223,
  Zone: 224,

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
  'Cloudflare did not return a detailed DNS error.': 244,
  'Cloudflare reports that a DNS record for this hostname already exists.': 245,
  'Cloudflare rejected the DNS update because authentication failed.': 246,
  'Cloudflare could not find the requested tunnel or DNS zone.': 247,
  'Cloudflare Account Mismatch': 248,
  'The selected domain belongs to a different Cloudflare account than the selected tunnel. Re-run the Cloudflare Tunnel action and choose a tunnel from this account, or pick a domain from the tunnel account.': 249,
  'Cloudflare Update Failed': 253,
  'Could not update the Cloudflare tunnel configuration for ${hostname}. ${detail}': 254,
  'No zone certificate is available for this zone.': 255,
  '${hostname} is now routed to this service. The DNS record was created automatically.': 256,
  '${hostname} is now routed to this service, but the DNS record could not be created automatically: ${detail} Add a proxied CNAME record for it in the Cloudflare dashboard, pointing at ${target}': 257,
  '${hostname} is now routed to this service. Add a proxied CNAME record for it in the Cloudflare dashboard, pointing at ${target}': 258,

  // actions/deletePublicHostname.ts
  'Delete Public Hostname': 250,
  'Remove a Cloudflare public hostname route': 251,
  'This will remove this hostname from your Cloudflare tunnel and delete the DNS record from Cloudflare.': 252,
  'Could not remove ${hostname} from the Cloudflare tunnel configuration. ${detail}': 259,
  'The Cloudflare tunnel was updated, but deleting the DNS record failed: ${detail}': 265,
  'The Cloudflare tunnel was updated, but this package could not determine which zone to use for deleting the DNS record automatically.': 266,
  'Public Hostname Removed with DNS Warning': 267,
  'No Cloudflare zone credentials found for ${hostname}. Refusing to remove the local entry before the remote tunnel configuration is updated.': 327,

  // actions/importPublicHostnames.ts
  'Import Public Hostnames': 260,
  'Scan existing public hostnames from your Cloudflare tunnel and add URLs to matching installed services.': 261,
  'This will scan existing public hostnames from the Cloudflare tunnel and add URLs to matching installed services.': 262,
  'No new public hostnames found in Cloudflare that are not already tracked.': 263,
  'Login to a Cloudflare DNS zone in the same account as the selected tunnel, then try again.': 264,
  'Cloudflare Import Failed': 268,
  'Could not read the Cloudflare tunnel configuration. ${detail}': 269,
  'Could not safely import and update the Cloudflare routes. No local routes were imported. ${detail}': 293,
  '${hostname} (path-specific routes remain managed in Cloudflare)': 294,
  '${hostname} (not in any configured zone)': 295,
  '${hostname} (unrecognized service: ${service})': 296,
  '${hostname} (multiple matching interfaces for ${target})': 297,
  '${hostname} (no matching interface found for ${target})': 298,
  'Imported 1 public hostname: ${hostnames}': 310,
  'Imported ${count} public hostnames: ${hostnames}': 311,
  'Skipped ${count}: ${details}': 312,
  'Updated legacy routes in Cloudflare.': 313,

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
  'Zone ID': 281,
  'Public URL': 285,
  Package: 286,
  'StartOS Server': 287,
  'DNS Zone: ${name}': 314,
  'Interface ID': 289,
  'Internal Target': 290,
  'Application Routes': 291,
  'No application routes are currently managed in this zone': 292,

  // actions/repairRoutes.ts and init/setupTasks.ts
  'Repair Cloudflare Routes': 300,
  'Reconnect managed Cloudflare routes to their selected StartOS services.': 301,
  'Cloudflare Routes Repaired': 302,
  'There are no managed Cloudflare routes to repair until a tunnel is selected.': 328,
  'Managed Cloudflare routes were updated successfully.': 303,
  'Cloudflare Route Repair Failed': 304,
  'Cloudflare routes could not be updated safely. Check the service logs, then try again.': 305,
  'Login to Cloudflare to configure a DNS zone': 306,
  'Select or create a Cloudflare tunnel for this server': 307,
  'Cloudflare routes need to be reconnected to their selected StartOS services.': 308,
  'No Cloudflare zone credentials are available to repair tunnel routes.': 309,

  // cfApi.ts and init/reconcileIngress.ts
  'Cloudflare has multiple whole-hostname rules for ${hostname}. Refusing to guess which route is managed; the live configuration was not changed.': 315,
  'The live Cloudflare route for ${hostname} no longer matches the StartOS-managed route. Refusing to overwrite or remove it; import or reconcile the route manually first.': 316,
  'Could not resolve ${target} for ${hostname}.': 317,
  'Cloudflare tunnel ${tunnelId} kept changing while preparing an update. Refusing to replace a newer configuration.': 318,
  'Cloudflare returned no usable configuration for tunnel ${tunnelId}. Refusing to replace it.': 319,
  'Cloudflare returned malformed ingress rules for tunnel ${tunnelId}. Refusing to replace them.': 320,
  'Cannot safely migrate ${url}: no matching interface exists for ${target}. The live Cloudflare configuration was not changed.': 321,
  'Cannot safely migrate ${url}: multiple matching interfaces exist for ${target}. The live Cloudflare configuration was not changed.': 322,
  'Could not inspect ${packageId} while migrating ${url}.': 324,
  'Cannot resolve a StartOS bridge address for ${url}. The live Cloudflare configuration was not changed.': 325,
  'Invalid StartOS bridge address: ${address}': 326,

  // action groups
  Configuration: 400,
  Import: 401,
  Information: 402,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
