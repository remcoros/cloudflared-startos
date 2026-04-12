import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * FileHelper for cert.pem - used only for .const() reactive watching.
 * When cert.pem is created/deleted, action metadata re-evaluates.
 */
export const certPem = FileHelper.string({
  base: sdk.volumes.main,
  subpath: '/.cloudflared/cert.pem',
})
