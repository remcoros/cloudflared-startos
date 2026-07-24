import { sdk } from '../sdk'
import { cloudflareLogin } from './cloudflareLogin'
import { selectTunnel } from './selectTunnel'
import { removeZone } from './removeZone'
import { addPublicHostname } from './addPublicHostname'
import { deletePublicHostname } from './deletePublicHostname'
import { importPublicHostnames } from './importPublicHostnames'
import { managedOverview } from './managedOverview'
import { repairRoutes } from './repairRoutes'

export const actions = sdk.Actions.of()
  .addAction(cloudflareLogin)
  .addAction(selectTunnel)
  .addAction(removeZone)
  .addAction(addPublicHostname)
  .addAction(deletePublicHostname)
  .addAction(importPublicHostnames)
  .addAction(managedOverview)
  .addAction(repairRoutes)
