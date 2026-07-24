import { VersionGraph } from '@start9labs/start-sdk'
import { current, CLOUDFLARED_VERSION } from './current'
import { v2026_3_0 } from './v2026.3.0'
import { v2026_5_2 } from './v2026.5.2'
import { v2026_6_1_0 } from './v2026.6.1.0'
import { v2026_6_1_1 } from './v2026.6.1.1'

export const versionGraph = VersionGraph.of({
  current,
  other: [v2026_6_1_1, v2026_6_1_0, v2026_5_2, v2026_3_0],
})

export { CLOUDFLARED_VERSION }
