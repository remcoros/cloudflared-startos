import { setupManifest } from '@start9labs/start-sdk'
import { ImageSource } from '@start9labs/start-sdk/base/lib/osBindings'
import { SDKImageInputSpec } from '@start9labs/start-sdk/base/lib/types/ManifestTypes'

const BUILD = process.env.BUILD || ''

const architectures =
  BUILD === 'x86_64' || BUILD === 'aarch64' ? [BUILD] : ['x86_64', 'aarch64']

const CLOUDFLARED_IMAGE = 'cloudflare/cloudflared:2025.8.1'

export const manifest = setupManifest({
  id: 'cloudflared',
  title: 'Cloudflare Tunnel',
  license: 'Apache 2.0',
  wrapperRepo: 'https://github.com/remcoros/cloudflared-startos',
  upstreamRepo: 'https://github.com/cloudflare/cloudflared',
  supportSite: 'https://github.com/cloudflare/cloudflared/issues',
  docsUrl:
    'https://github.com/remcoros/cloudflared-startos/blob/main/instructions.md',
  marketingSite: 'https://cloudflare.com/',
  donationUrl: 'https://cloudflare.com/',
  description: {
    short: 'Cloudflare Tunnel client',
    long: 'With the Cloudflare Tunnel client you can proxy traffic from the Cloudflare network to your StartOS server.',
  },
  volumes: ['main'],
  images: {
    main: {
      arch: architectures,
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          buildArgs: {
            CLOUDFLARED_IMAGE: CLOUDFLARED_IMAGE,
          },
        },
      } as ImageSource,
    } as SDKImageInputSpec,
  },
  hardwareRequirements: {
    arch: architectures,
  },
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
