import { store } from './fileModels/store.yaml'
import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'

export const main = sdk.setupMain(async ({ effects, started }) => {
  console.info('Starting cloudflared...')

  const conf = (await store.read().const(effects))!

  const healthReceipts: T.HealthCheck[] = []

  return sdk.Daemons.of(effects, started, healthReceipts).addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(
      effects,
      {
        imageId: 'main',
      },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/root/data',
        readonly: false,
      }),
      'main',
    ),
    command: [
      '/usr/local/bin/cloudflared',
      '--no-autoupdate',
      '--management-diagnostics=false',
      'tunnel',
      'run',
    ],
    env: {
      TUNNEL_TOKEN: conf.token,
    },
    ready: {
      display: null,
      fn: () => ({
        result: 'success',
        message: null,
      }),
    },
    requires: [],
  })
})
