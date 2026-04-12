import { sdk } from '../sdk'
import { certPem } from '../fileModels/certPem'
import { store } from '../fileModels/store.yaml'
import { cloudflareLogin } from '../actions/cloudflareLogin'
import { selectTunnel } from '../actions/selectTunnel'

/**
 * Reactively manage required tasks.
 * Re-runs whenever cert.pem or the store changes.
 * - No cert.pem → task to login
 * - No tunnel selected → task to select tunnel
 */
export const setupTasks = sdk.setupOnInit(async (effects) => {
  const loggedIn = !!(await certPem.read().const(effects))
  if (!loggedIn) {
    await sdk.action.createOwnTask(effects, cloudflareLogin, 'critical', {
      reason: 'Login to Cloudflare to manage tunnels and DNS routes',
    })
    return
  }

  const conf = await store.read().const(effects)
  if (!conf?.tunnel) {
    await sdk.action.createOwnTask(effects, selectTunnel, 'critical', {
      reason: 'Select or create a Cloudflare tunnel for this server',
    })
  }
})
