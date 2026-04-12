import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { writeTunnelConfig } from '../fileModels/tunnel.yaml'

/**
 * (Re)generate the cloudflared tunnel.yaml from the store before every start.
 * Runs on all init kinds (install, update, restore, null/restart).
 */
export const writeConfig = sdk.setupOnInit(async (effects) => {
  const conf = await store.read().once()
  await writeTunnelConfig(effects, conf?.ingress ?? {})
})
