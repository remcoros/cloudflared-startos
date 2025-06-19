import { setupManifest } from '@start9labs/start-sdk'

const CLOUDFLARED_IMAGE = 'cloudflare/cloudflared:2025.6.1'

export const manifest = setupManifest({
  id: 'cloudflared',
  title: 'Cloudflare Tunnel',
  license: 'Apache 2.0',
  wrapperRepo: 'https://github.com/remcoros/cloudflared-startos',
  upstreamRepo: 'https://github.com/cloudflare/cloudflared',
  supportSite: 'https://github.com/cloudflare/cloudflared/issues',
  marketingSite: 'https://cloudflare.com/',
  donationUrl: 'https://cloudflare.com/',
  description: {
    short: 'Cloudflare Tunnel client',
    long: 'With the Cloudflare Tunnel client you can proxy traffic from the Cloudflare network to your StartOS server.',
  },
  volumes: ['main'],
  images: {
    main: {
      arch: ['x86_64', 'aarch64'],
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          buildArgs: {
            CLOUDFLARED_IMAGE: CLOUDFLARED_IMAGE,
          },
        },
      },
    },
  },
  hardwareRequirements: {},
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
