import { sdk } from './sdk'
import { i18n } from './i18n'

export const metricsHostId = 'metrics'
export const metricsInterfaceId = 'metrics'
export const metricsPort = 20241

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, metricsHostId)
  const origin = await multi.bindPort(metricsPort, { protocol: 'http' })

  const metrics = sdk.createInterface(effects, {
    name: i18n('Metrics'),
    id: metricsInterfaceId,
    description: i18n('Prometheus metrics endpoint'),
    type: 'api',
    schemeOverride: null,
    masked: false,
    username: null,
    path: '/metrics',
    query: {},
  })

  return [await origin.export([metrics])]
})
