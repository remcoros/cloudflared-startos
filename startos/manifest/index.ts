import { setupManifest } from '@start9labs/start-sdk'
import { CLOUDFLARED_VERSION } from '../install/versions'

export const manifest = setupManifest({
  id: 'cloudflared',
  title: 'Cloudflare Tunnel',
  license: 'Apache 2.0',
  packageRepo: 'https://github.com/remcoros/cloudflared-startos',
  upstreamRepo: 'https://github.com/cloudflare/cloudflared',
  marketingUrl: 'https://cloudflare.com/',
  donationUrl: null,
  docsUrls: [
    'https://github.com/remcoros/cloudflared-startos/blob/main/instructions.md',
  ],
  description: {
    short: {
      en_US: 'Cloudflare Tunnel client',
      es_ES: 'Cliente de túnel Cloudflare',
      de_DE: 'Cloudflare-Tunnel-Client',
      pl_PL: 'Klient tunelu Cloudflare',
      fr_FR: 'Client de tunnel Cloudflare',
    },
    long: {
      en_US:
        'With the Cloudflare Tunnel client you can proxy traffic from the Cloudflare network to your StartOS server.',
      es_ES:
        'Con el cliente de túnel Cloudflare puedes enviar tráfico proxy desde la red Cloudflare a tu servidor StartOS.',
      de_DE:
        'Mit dem Cloudflare-Tunnel-Client können Sie Datenverkehr vom Cloudflare-Netzwerk zu Ihrem StartOS-Server weiterleiten.',
      pl_PL:
        'Za pomocą klienta tunelu Cloudflare możesz proxy ruch z sieci Cloudflare do twojego serwera StartOS.',
      fr_FR:
        'Avec le client de tunnel Cloudflare, vous pouvez proxifier le trafic du réseau Cloudflare vers votre serveur StartOS.',
    },
  },
  volumes: ['main'],
  images: {
    main: {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          buildArgs: {
            CLOUDFLARED_IMAGE: 'cloudflare/cloudflared:' + CLOUDFLARED_VERSION,
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissingAs: 'aarch64',
    },
  },
  dependencies: {},
})
