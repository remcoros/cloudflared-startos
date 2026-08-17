import { reconcileIngressOnce } from '../init/reconcileIngress'
import { sdk } from '../sdk'
import { i18n } from '../i18n'

export const repairRoutes = sdk.Action.withoutInput(
  'repair-routes',
  async () => ({
    name: i18n('Repair Cloudflare Routes'),
    description: i18n(
      'Reconnect managed Cloudflare routes to their selected StartOS services.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    try {
      const { hasTunnel } = await reconcileIngressOnce(effects)
      if (!hasTunnel) {
        return {
          version: '1',
          title: i18n('No Tunnel Configured'),
          message: i18n(
            'There are no managed Cloudflare routes to repair until a tunnel is selected.',
          ),
          result: null,
        }
      }
      return {
        version: '1',
        title: i18n('Cloudflare Routes Repaired'),
        message: i18n('Managed Cloudflare routes were updated successfully.'),
        result: null,
      }
    } catch (error) {
      console.error('Cloudflare route repair failed:', error)
      return {
        version: '1',
        title: i18n('Cloudflare Route Repair Failed'),
        message: i18n(
          'Cloudflare routes could not be updated safely. Check the service logs, then try again.',
        ),
        result: null,
      }
    }
  },
)
