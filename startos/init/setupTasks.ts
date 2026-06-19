import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { cloudflareLogin } from '../actions/cloudflareLogin'
import { selectTunnel } from '../actions/selectTunnel'

/**
 * Reactively manage required tasks.
 * Re-runs whenever zone availability or tunnel selection changes.
 * - No zones configured -> task to login
 * - No tunnel selected -> task to select tunnel
 */
export const setupTasks = sdk.setupOnInit(async (effects) => {
  const state = await store
    .read((conf) => ({
      hasZone: Object.keys(conf.zones ?? {}).length > 0,
      hasTunnel: !!conf.tunnel,
    }))
    .const(effects)
  const hasZone = state?.hasZone ?? false

  if (!hasZone) {
    await sdk.action.createOwnTask(effects, cloudflareLogin, 'critical', {
      reason: 'Login to Cloudflare to configure a DNS zone',
    })
    return
  }

  if (!state?.hasTunnel) {
    await sdk.action.createOwnTask(effects, selectTunnel, 'critical', {
      reason: 'Select or create a Cloudflare tunnel for this server',
    })
  }
})
