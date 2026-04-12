import { VersionInfo } from '@start9labs/start-sdk'

export const v2025_11_1 = VersionInfo.of({
  version: '2025.11.1:1.0',
  releaseNotes: {
    en_US: 'Updated cloudflared to 2025.11.1 - [Changelog](https://github.com/cloudflare/cloudflared/blob/2025.11.1/RELEASE_NOTES)',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
