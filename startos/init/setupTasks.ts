import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { cloudflareLogin } from '../actions/cloudflareLogin'
import { selectTunnel } from '../actions/selectTunnel'

/**
 * Reactively manage required tasks.
 * Re-runs whenever the store changes (zones or tunnel).
 * - No zones configured -> task to login
 * - No tunnel selected -> task to select tunnel
 */
export const setupTasks = sdk.setupOnInit(async (effects) => {
  const conf = await store.read().const(effects)
  const hasZone = Object.keys(conf?.zones ?? {}).length > 0

  if (!hasZone) {
    await sdk.action.createOwnTask(effects, cloudflareLogin, 'critical', {
      reason: 'Login to Cloudflare to configure a DNS zone',
    })
    return
  }

  if (!conf?.tunnel) {
    await sdk.action.createOwnTask(effects, selectTunnel, 'critical', {
      reason: 'Select or create a Cloudflare tunnel for this server',
    })
  }
})
