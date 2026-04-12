# Cloudflare Tunnel for StartOS Instructions

```
----- WARNING -----

Publishing services on the public internet requires care.
Use Cloudflare Tunnel only if you understand the security implications of exposing a service publicly.

----- WARNING -----
```

## Quick setup

1. Install the Cloudflare Tunnel package on StartOS.
2. Run **Login to Cloudflare** and open the returned authorization URL.
3. Approve access for the DNS zone you want to manage.
4. Run **Select Tunnel** and either choose an existing tunnel or create a new one.
5. Open another service on StartOS, go to **URLs**, and add a Cloudflare Tunnel URL.
6. Pick a subdomain and one of the logged-in DNS zones.

The package will:
- update the Cloudflare tunnel ingress configuration automatically
- try to create the DNS record automatically
- return a manual CNAME fallback if Cloudflare rejects the DNS change

Manual fallback CNAME format:

```text
<hostname> -> <tunnel-id>.cfargotunnel.com
```

Use the **Import Public Hostnames** action if the tunnel already has hostnames configured in Cloudflare and you want StartOS to manage and display them too.

Use **Managed Public Routes** to see the currently selected tunnel, DNS zones, and managed application routes in one place.
