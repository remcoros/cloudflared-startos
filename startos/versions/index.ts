import { VersionGraph } from '@start9labs/start-sdk'
import { current, CLOUDFLARED_VERSION } from './current'
import { v_2026_6_1_1 } from './v2026.6.1_1'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_2026_6_1_1],
})

export { CLOUDFLARED_VERSION }
