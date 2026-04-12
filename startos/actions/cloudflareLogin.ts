import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { certPem } from '../fileModels/certPem'

const LOGIN_URL_PATH = '/start9/login-url.txt'

const mounts = sdk.Mounts.of()
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
    readonly: false,
  })

export const cloudflareLogin = sdk.Action.withoutInput(
  'cloudflare-login',

  async ({ effects }) => {
    const loggedIn = !!(await certPem.read().const(effects))
    const conf = await store.read().const(effects)
    const zoneName = conf?.zoneInfo?.zoneName
    const nameLabel = loggedIn
      ? `Cloudflare Account: Logged in${zoneName ? ` (${zoneName})` : ''}`
      : 'Cloudflare Account: Not logged in'
    return {
      name: nameLabel,
      description:
        'Authenticates with your Cloudflare account so DNS routes can be created automatically. ' +
        'Returns an authorization URL - visit it in your browser to complete login.',
      warning: null,
      allowedStatuses: 'any',
      group: 'Configuration',
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    // Clear any stale URL file before starting
    await sdk.volumes.main.writeFile(LOGIN_URL_PATH, 'pending').catch(() => {})

    // Fire and forget - cf-login.sh starts cloudflared login, extracts the auth URL,
    // writes it to the volume, then waits up to 10 min for auth to complete
    sdk.SubContainer.withTemp(effects, { imageId: 'main' }, mounts, 'cf-login',
      async (sub) => {
        const result = await sub.exec(['/usr/local/bin/cf-login.sh'], {}, 10 * 60 * 1000)
        if (result.stdout) console.info(result.stdout)
        if (result.stderr) console.info(result.stderr)
        if (result.exitCode !== 0) {
          console.error(`cf-login.sh exited with code ${result.exitCode}`)
        }
      },
    ).catch((e) => console.error(`cf-login error: ${String(e)}`))

    // Poll for the URL written by cf-login.sh (up to 30s)
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
      await new Promise<void>((r) => setTimeout(r, 2000))
      try {
        const url = (await sdk.volumes.main.readFile(LOGIN_URL_PATH)).toString().trim()
        if (url.startsWith('https://dash.cloudflare.com')) {
          return {
            version: '1' as const,
            title: 'Cloudflare Authorization',
            message:
              'Visit the URL below to authorize. After authorizing, DNS routes will be created automatically when you add a public hostname.',
            result: {
              type: 'single' as const,
              value: url,
              copyable: true,
              qr: false,
              masked: false,
            },
          }
        }
      } catch {
        // not written yet
      }
    }

    throw new Error('Timed out waiting for Cloudflare auth URL. Check the service logs.')
  },
)
