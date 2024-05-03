# Cloudflare Tunnel for StartOS Instructions

```
----- WARNING -----

This is for advanced users who know what they are doing.

Exposing your server on the internet brings a lot of responsibility and can expose your server/service to all kind of attacks.

Don't be reckless!

----- WARNING -----
```

Here are some basic instructions. We won't go into detail because this should NOT be newb friendly. You have to REALLY KNOW WHAT YOU ARE DOING!!

* You need a cloudflare account
* Setup a website, with domain, dns and flexible ssl
* Create a tunnel in cloudflare 'Zero Trust'
* Copy the generated token and paste it in StartOS Cloudflare Tunnel service configuration
* Start the Cloudflare Tunnel service in StartOS
* In cloudflare tunnel dashboard, add public hostnames and route them directly to a StartOS service. For example: 

```
Subdomain: btcpay
Domain: mydomain.xyz
Path: (empty)

Service Type: HTTP
URL: btcpayserver.embassy:80
```

If you have setup the website, domain (mydomain.xyz), DNS, a SSL certificate and tunnel correctly, the BTCPay server is now exposed through a cloudflare tunnel on 'https://btcpay.mydomain.xyz'
