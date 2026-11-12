import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'

/**
 * Standard mounts for cloudflared CLI subcontainers.
 * Mounts the main volume at /root/data and .cloudflared at /root/.cloudflared.
 *
 * .cloudflared must be writable here because tunnel token commands write
 * credentials into the mounted volume.
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
    readonly: false,
  })

/**
 * Run a cloudflared command in a temp subcontainer and return stdout as a string.
 * Throws if exit code is non-zero.
 */
export async function runCf(
  effects: T.Effects,
  args: string[],
  timeoutMs = 30_000,
  origincert?: string,
): Promise<string> {
  const certArgs = origincert ? [`--origincert=${origincert}`] : []
  return sdk.SubContainer.withTemp(
    effects,
    { imageId: 'main' },
    cfMounts,
    'cf-cmd',
    async (sub) => {
      const result = await sub.exec(
        ['/usr/local/bin/cloudflared', '--no-autoupdate', ...certArgs, ...args],
        { timeout: timeoutMs },
      )
      if (result.stderr) console.info(result.stderr)
      if (result.exitCode !== 0) {
        throw new Error(
          `cloudflared ${args[0]} failed (exit ${result.exitCode}): ${(result.stderr || result.stdout).toString()}`,
        )
      }
      return result.stdout.toString()
    },
  )
}

// Serialize complete route operations, including their local writes. A remote
// read/rebase alone cannot protect two concurrent full-configuration PUTs.
let routeOperation: Promise<unknown> = Promise.resolve()

export function withRouteLock<A>(run: () => Promise<A>): Promise<A> {
  const result = routeOperation.then(run)
  routeOperation = result.catch(() => undefined)
  return result
}

export async function isPackageInstalled(
  effects: T.Effects,
  packageId: string,
  watch = false,
): Promise<boolean> {
  // The server's admin host is not an installed service package.
  if (packageId === 'start-os') return true
  const present = sdk.getServiceManifest(effects, packageId, Boolean)
  return watch ? present.const() : present.once()
}
