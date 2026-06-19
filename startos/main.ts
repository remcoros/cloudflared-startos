import { store } from './fileModels/store.yaml'
import { sdk } from './sdk'
import { i18n } from './i18n'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info('Starting cloudflared...')

  const tunnelId = await store
    .read((conf) => conf.tunnel?.id ?? null)
    .const(effects)

  if (!tunnelId) {
    throw new Error('No Cloudflare tunnel is configured.')
  }

  const credFile = `/root/.cloudflared/${tunnelId}.json`

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(
      effects,
      {
        imageId: 'main',
      },
      sdk.Mounts.of()
        .mountVolume({
          volumeId: 'main',
          subpath: null,
          mountpoint: '/root/data',
          readonly: false,
        })
        .mountVolume({
          volumeId: 'main',
          subpath: '.cloudflared',
          mountpoint: '/root/.cloudflared',
          readonly: true,
        }),
      'main',
    ),
    exec: {
      command: [
        '/usr/local/bin/cloudflared',
        '--no-autoupdate',
        '--management-diagnostics=false',
        '--metrics',
        '0.0.0.0:20241',
        'tunnel',
        '--credentials-file',
        credFile,
        'run',
        tunnelId,
      ],
      env: {},
    },
    ready: {
      display: i18n('Cloudflare tunnel'),
      fn: () =>
        sdk.healthCheck.checkWebUrl(
          effects,
          'http://cloudflared.startos:20241/metrics',
          {
            successMessage: i18n('Cloudflare tunnel is running'),
            errorMessage: i18n('Cloudflare tunnel is not running'),
          },
        ),
    },
    requires: [],
  })
})
