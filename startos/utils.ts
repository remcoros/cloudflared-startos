import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'

// Cloudflared CLI mounts require writable credentials.
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

// Run a temporary cloudflared command and return its stdout.
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

// Serialize remote route changes with their local writes.
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
