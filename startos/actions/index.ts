import { sdk } from '../sdk'
import { setToken } from './setToken'
import { addPublicHostname } from './addPublicHostname'
import { deletePublicHostname } from './deletePublicHostname'
import { cloudflareLogin } from './cloudflareLogin'

export const actions = sdk.Actions.of()
  .addAction(setToken)
  .addAction(cloudflareLogin)
  .addAction(addPublicHostname)
  .addAction(deletePublicHostname)
