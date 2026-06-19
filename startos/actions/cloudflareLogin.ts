import { randomUUID } from 'crypto'
import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { i18n } from '../i18n'

const LOGIN_URL_PATH = '/start9/login-url.txt'
const LOGIN_SESSION_PATH = '/start9/login-session-id.txt'

const mounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: '/root/data',
  readonly: false,
})

export const cloudflareLogin = sdk.Action.withoutInput(
  'cloudflare-login',

  async ({ effects }) => {
    const hasZone =
      (await store
        .read((conf) => Object.values(conf.zones ?? {}).some(Boolean))
        .const(effects)) ?? false
    const nameLabel = hasZone
      ? i18n('Add DNS Zone')
      : i18n('Login to Cloudflare')
    return {
      name: nameLabel,
      description: i18n(
        'Authenticates with a Cloudflare DNS zone. Run this action again to add additional zones.',
      ),
      warning: null,
      allowedStatuses: 'any',
      group: 'Configuration',
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const sessionId = randomUUID()

    // Mark this login flow as the only active one and clear any stale URL.
    await sdk.volumes.main.writeFile(LOGIN_URL_PATH, 'pending').catch(() => {})
    await sdk.volumes.main.writeFile(LOGIN_SESSION_PATH, sessionId)

    // Fire and forget - cf-login.sh starts cloudflared login, extracts the auth URL,
    // writes it to the volume, then waits up to 10 min for auth to complete.
    // If the action is triggered again, the older flow notices that it has been
    // superseded and shuts itself down cleanly.
    sdk.SubContainer.withTemp(
      effects,
      { imageId: 'main' },
      mounts,
      'cf-login',
      async (sub) => {
        const result = await sub.exec(
          ['/usr/local/bin/cf-login.sh'],
          {
            env: {
              LOGIN_SESSION_ID: sessionId,
            },
          },
          10 * 60 * 1000 + 35_000,
        )
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

      const activeSession = (await sdk.volumes.main.readFile(LOGIN_SESSION_PATH))
        .toString()
        .trim()
      if (activeSession !== sessionId) {
        throw new Error(
          'Cloudflare login was restarted by a newer request. Use the newest login action result.',
        )
      }

      try {
        const url = (await sdk.volumes.main.readFile(LOGIN_URL_PATH))
          .toString()
          .trim()
        if (url.startsWith('https://dash.cloudflare.com')) {
          return {
            version: '1',
            title: 'Cloudflare Authorization',
            message:
              'Visit the URL below to authorize. After authorizing, DNS routes will be created automatically when you add a public hostname.',
            result: {
              type: 'single',
              value: url,
              copyable: true,
              qr: true,
              masked: false,
            },
          }
        }
      } catch {
        // not written yet
      }
    }

    throw new Error(
      'Timed out waiting for Cloudflare auth URL. Check the service logs.',
    )
  },
)
