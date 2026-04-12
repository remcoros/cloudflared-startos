import { sdk } from '../sdk'
import { cloudflareLogin } from './cloudflareLogin'
import { selectTunnel } from './selectTunnel'
import { addPublicHostname } from './addPublicHostname'
import { deletePublicHostname } from './deletePublicHostname'

export const actions = sdk.Actions.of()
  .addAction(cloudflareLogin)
  .addAction(selectTunnel)
  .addAction(addPublicHostname)
  .addAction(deletePublicHostname)
