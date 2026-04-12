import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'

/**
 * Standard mounts for cloudflared CLI subcontainers.
 * Mounts the main volume at /root/data and .cloudflared at /root/.cloudflared.
 */
export const cfMounts = sdk.Mounts.of()
  .mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/root/data',
    readonly: false,
  })
  .mountVolume({
    volumeId: 'main',
    subpath: '.cloudflared',
    mountpoint: '/root/.cloudflared',
    readonly: true,
  })

/**
 * Run a cloudflared command in a temp subcontainer and return stdout as a string.
 * Throws if exit code is non-zero.
 */
export async function runCf(
  effects: T.Effects,
  args: string[],
  timeoutMs = 30_000,
): Promise<string> {
  return sdk.SubContainer.withTemp(
    effects,
    { imageId: 'main' },
    cfMounts,
    'cf-cmd',
    async (sub) => {
      const result = await sub.exec(
        ['/usr/local/bin/cloudflared', '--no-autoupdate', ...args],
        {},
        timeoutMs,
      )
      if (result.stderr) console.info(result.stderr)
      if (result.exitCode !== 0) {
        throw new Error(
          `cloudflared ${args[0]} failed (exit ${result.exitCode}): ${result.stderr || result.stdout}`,
        )
      }
      return result.stdout.toString()
    },
  )
}
