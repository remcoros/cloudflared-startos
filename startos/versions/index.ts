import { VersionGraph } from '@start9labs/start-sdk'
import { current, CLOUDFLARED_VERSION } from './current'
import { v2026_3_0 } from './v2026.3.0'
import { v2026_5_2 } from './v2026.5.2'

export const versionGraph = VersionGraph.of({
  current,
  other: [v2026_3_0, v2026_5_2],
})

export { CLOUDFLARED_VERSION }
