import { VersionInfo } from '@start9labs/start-sdk'

export const v2026_3_0 = VersionInfo.of({
  version: '2026.3.0:1.0',
  releaseNotes: {
    en_US: 'Updated cloudflared to 2026.3.0 - [Changelog](https://github.com/cloudflare/cloudflared/blob/2026.3.0/RELEASE_NOTES)',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
