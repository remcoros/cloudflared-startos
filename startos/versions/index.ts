import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v2026_3_0 } from './v2026.3.0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v2026_3_0],
})

export const CLOUDFLARED_VERSION = '2026.5.2'
