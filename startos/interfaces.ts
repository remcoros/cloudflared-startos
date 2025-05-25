import { sdk } from './sdk'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, 'ui')
  const uiMultiOrigin = await uiMulti.bindPort(20241, {
    protocol: 'http',
  })

  const ui = sdk.createInterface(effects, {
    name: 'Metrics',
    id: 'metrics',
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
