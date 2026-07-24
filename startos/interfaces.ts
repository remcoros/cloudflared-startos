import { sdk } from './sdk'

export const metricsHostId = 'metrics'
export const metricsInterfaceId = 'metrics'
export const metricsPort = 20241

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, metricsHostId)
  const uiMultiOrigin = await uiMulti.bindPort(metricsPort, {
    protocol: 'http',
  })

  const ui = sdk.createInterface(effects, {
    name: 'Metrics',
    id: metricsInterfaceId,
    description: 'Prometheus metrics endpoint',
    type: 'api',
    schemeOverride: null,
    masked: false,
    username: null,
    path: '',
    query: {},
  })

  const uiReceipt = await uiMultiOrigin.export([ui])

  return [uiReceipt]
})
