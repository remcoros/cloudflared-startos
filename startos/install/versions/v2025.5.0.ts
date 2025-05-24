import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v2025_5_0 = VersionInfo.of({
  version: '2025.5.0:1.0',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
