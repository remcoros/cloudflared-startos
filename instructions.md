# Cloudflare Tunnel

Before you start, you need a Cloudflare account with at least one domain already on Cloudflare DNS. This service cannot register a domain or move one for you.

## Documentation

- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) — Cloudflare's own guide to what a tunnel is and what it can carry.
- [Routing to a tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/routing-to-tunnel/) — the reference for public hostnames, DNS records, and per-route settings.
- [cloudflared](https://github.com/cloudflare/cloudflared) — the upstream project this service runs.

## What you get on StartOS

A running Cloudflare tunnel, plus the ability to put any of your other services on a public address of your own domain.

- Traffic reaches your services through Cloudflare, over a connection your server opens outward. You do not open a port, forward anything on your router, or need a static IP.
- Once a tunnel is set up, every other service on this server gets a **Cloudflare Tunnel** section in its address list, where you can hand it a subdomain.
- Addresses you create here are re-pointed at their service every time Cloudflare Tunnel starts, so a reinstall that moves a service's internal port is fixed by a restart — or by running **Repair Cloudflare Routes**.
- Routes and settings you create yourself in the Cloudflare dashboard are left alone.

## Getting set up

1. Run **Login to Cloudflare**. It returns a Cloudflare authorization link.
2. Open that link, sign in, and approve one domain. You can scan the QR code if you want to approve from your phone.
3. Run **Cloudflare Tunnel** and either pick an existing tunnel or create a new one. A name is suggested for you.
4. That's it — the tunnel connects on its own.

To manage a second domain, run **Add DNS Zone** (the login action takes this name once you have one domain) and approve the next one. Each run authorizes exactly one domain.

## Giving a service a public address

1. Open the service you want to reach publicly and go to the address list for the interface you want to expose.
2. In the **Cloudflare Tunnel** section, choose **Add**.
3. Enter a subdomain and pick which of your domains to put it under.
4. The address appears in the list, and Cloudflare starts routing to it.

To take an address down, use the overflow menu on its row and choose **Delete**. Both the tunnel route and the DNS record are removed.

If the DNS record could not be created automatically, the result tells you exactly which record to add in the Cloudflare dashboard. Add it as a proxied CNAME and the address will start working.

## Actions

- **Login to Cloudflare** / **Add DNS Zone** — authorize a domain. Run it once per domain.
- **Cloudflare Tunnel** — choose or create the tunnel this server runs.
- **Remove DNS Zone** — stop managing a domain here. Its records and routes in Cloudflare are not deleted, so anything already working keeps working.
- **Import Public Hostnames** — adopt addresses that already exist on the tunnel, so they show up on their services here and are managed from then on. Safe to run any time; it skips anything it already tracks and tells you what it left alone.
- **Managed Public Routes** — see the tunnel, the domains, and every address managed here, with what each one points at.
- **Repair Cloudflare Routes** — retry after a failed update. Run it once you've fixed what went wrong.

## Limitations

- An address created here points at your service over plain HTTP inside the server. A service that only speaks HTTPS on the port you pick cannot be published this way.
- Switching to a different tunnel does not move addresses you already created — their DNS records still point at the old tunnel until you recreate them.
- Addresses are re-pointed when Cloudflare Tunnel starts, not continuously. If a service's internal port moves while Cloudflare Tunnel is running, its address stops working until you restart Cloudflare Tunnel or run **Repair Cloudflare Routes**.
