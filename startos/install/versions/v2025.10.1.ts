import { VersionInfo } from '@start9labs/start-sdk'

export const v2025_10_1 = VersionInfo.of({
  version: '2025.10.1:1.0',
  releaseNotes: { en_US: 'Updated cloudflared to 2025.10.1' },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
