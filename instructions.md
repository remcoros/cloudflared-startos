# Cloudflare Tunnel Instructions

Cloudflare Tunnel (cloudflared) creates an outbound-only connection from your StartOS server to the Cloudflare edge network. This lets you expose services publicly via your own domain without opening inbound ports or changing your router.

Routes managed by this service are kept pointed at the correct service on your StartOS server. Routes and advanced settings that you manage directly in Cloudflare are left in place. If Cloudflare cannot be updated safely, no changes are sent; use **Repair Cloudflare Routes** after correcting the problem.

## Requirements

- A Cloudflare account
- A domain managed by Cloudflare DNS

## First-time setup

1. Run the **Login to Cloudflare** action. A Cloudflare authorization URL will be returned.
2. Open that URL in a browser, log in, and approve access for one DNS zone (domain).
3. Repeat the login action if you want to manage additional DNS zones.
4. Run **Cloudflare Tunnel** to choose an existing tunnel or create a new one.
5. Once a tunnel is selected, the service will start automatically.

## Assigning a public address to a service

Once a tunnel is selected and the service is running, you can assign a public Cloudflare subdomain to any service interface directly from that service's addresses page.

1. Navigate to the service you want to expose publicly.
2. Open the interface's addresses page.
3. In the **Cloudflare Tunnel** addresses table, click **Add** to assign a subdomain.
4. Enter a subdomain and select the DNS zone (domain) to use.
5. Cloudflare Tunnel will route traffic from `subdomain.yourdomain.com` to that interface.

To remove an address, click the overflow menu on that row and select **Delete**.

Routes created directly in Cloudflare continue to work. Run **Import Public Hostnames** if you want compatible routes to appear in StartOS and stay connected to their selected services automatically.

## Actions

- **Login to Cloudflare** - Authenticate with a Cloudflare DNS zone.
- **Cloudflare Tunnel** - Choose or create a Cloudflare tunnel.
- **Add DNS Zone** - Add another domain from Cloudflare.
- **Remove DNS Zone** - Stop managing a domain without deleting its existing Cloudflare records.
- **Import Public Hostnames** - Import existing hostname routes from Cloudflare.
- **Managed Public Routes** - View the domains, tunnel, and public addresses managed here.
- **Repair Cloudflare Routes** - Retry route updates after a connection or configuration problem.
