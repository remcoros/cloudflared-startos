import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v2026_3_0 = VersionInfo.of({
  version: '2026.3.0:1.0',
  releaseNotes: {
    en_US:
      'Revamped setup: login to Cloudflare, select/create tunnel, automatic DNS routes, and URL plugin for exposing services via public hostnames',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
