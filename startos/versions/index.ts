import { VersionGraph } from '@start9labs/start-sdk'
import { v2026_3_0 } from './v2026.3.0'
import { v2026_5_0 } from './v2026.5.0'

export const versionGraph = VersionGraph.of({
  current: v2026_5_0,
  other: [v2026_3_0],
})

export const CLOUDFLARED_VERSION = '2026.5.0'
