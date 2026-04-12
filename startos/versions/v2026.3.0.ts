import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v2026_3_0 = VersionInfo.of({
  version: '2026.3.0:1-beta.1',
  releaseNotes: {
    en_US:
      'Cloudflare login and tunnel selection, managed public hostnames via the URL plugin, multi-zone DNS support, import of existing routes, and a Managed Public Routes overview action',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
