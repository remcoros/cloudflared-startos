import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { cloudflareLogin } from '../actions/cloudflareLogin'
import { selectTunnel } from '../actions/selectTunnel'
import { repairRoutes } from '../actions/repairRoutes'
import { i18n } from '../i18n'

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
      repairRequired: conf.repairRequired,
      repairMessage: conf.repairMessage,
    }))
    .const(effects)
  const hasZone = state?.hasZone ?? false

  if (!hasZone) {
    await sdk.action.createOwnTask(effects, cloudflareLogin, 'critical', {
      reason: i18n('Login to Cloudflare to configure a DNS zone'),
    })
    return
  }

  if (!state?.hasTunnel) {
    await sdk.action.createOwnTask(effects, selectTunnel, 'critical', {
      reason: i18n('Select or create a Cloudflare tunnel for this server'),
    })
  }

  if (state?.repairRequired) {
    await sdk.action.createOwnTask(effects, repairRoutes, 'important', {
      replayId: 'repair-cloudflare-routes',
      reason:
        state.repairMessage ??
        i18n(
          'Cloudflare routes need to be reconnected to their selected StartOS services.',
        ),
    })
  }
})
