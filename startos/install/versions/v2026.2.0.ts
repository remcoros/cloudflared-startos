import { VersionInfo } from '@start9labs/start-sdk'

export const v2026_2_0 = VersionInfo.of({
  version: '2026.2.0:1.0',
  releaseNotes: 'Updated cloudflared to 2026.2.0 - [Changelog](https://github.com/cloudflare/cloudflared/blob/2026.2.0/RELEASE_NOTES)',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
