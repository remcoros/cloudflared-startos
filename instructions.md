# Cloudflare Tunnel Instructions

Cloudflare Tunnel (cloudflared) creates an outbound-only connection from your StartOS server to the Cloudflare edge network. This lets you expose services publicly via your own domain without opening inbound ports or changing your router.

## Requirements

- A Cloudflare account
- A domain managed by Cloudflare DNS

## First-time setup

1. Run the **Login to Cloudflare** action. A Cloudflare authorization URL will be returned.
2. Open that URL in a browser, log in, and approve access for one DNS zone (domain).
3. Repeat the login action if you want to manage additional DNS zones.
4. Run **Select Tunnel** to choose an existing tunnel or create a new one.
5. Once a tunnel is selected, the service will start automatically.

## Assigning a public address to a service

Once a tunnel is selected and the service is running, you can assign a public Cloudflare subdomain to any service interface directly from that service's addresses page.

1. Navigate to the service you want to expose publicly.
2. Open the interface's addresses page.
3. In the **Cloudflare Tunnel** addresses table, click **Add** to assign a subdomain.
4. Enter a subdomain and select the DNS zone (domain) to use.
5. Cloudflare Tunnel will route traffic from `subdomain.yourdomain.com` to that interface.

To remove an address, click the overflow menu on that row and select **Delete**.

If you have existing hostname routes already configured in Cloudflare, run **Import Public Hostnames** to load them into this service.

## Actions

- **Login to Cloudflare** - Authenticate with a Cloudflare DNS zone.
- **Select Tunnel** - Choose or create a Cloudflare tunnel.
- **Import Public Hostnames** - Import existing hostname routes from Cloudflare.
