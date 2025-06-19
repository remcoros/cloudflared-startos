import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v2025_6_1 = VersionInfo.of({
  version: '2025.6.1:1.0',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
