import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { certPem } from '../fileModels/certPem'
import { runCf } from '../cfRunner'

const { InputSpec, Value, Variants } = sdk

/**
 * Parse `cloudflared tunnel list --output json` output.
 * Returns array of { id, name }.
 */
function parseTunnelList(stdout: string): Array<{ id: string; name: string }> {
  try {
    const parsed = JSON.parse(stdout.trim())
    if (Array.isArray(parsed)) {
      return parsed
        .filter((t: any) => t.id && t.name && (t.deleted_at?.startsWith('0001') ?? true))
        .map((t: any) => ({ id: String(t.id), name: String(t.name) }))
    }
  } catch {
    // fallback: parse text table (ID NAME CREATED ...)
    const lines = stdout.split('\n').filter(Boolean)
    const result: Array<{ id: string; name: string }> = []
    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      // UUID pattern check
      if (parts[0]?.match(/^[0-9a-f-]{36}$/)) {
        result.push({ id: parts[0], name: parts[1] })
      }
    }
    return result
  }
  return []
}

const newTunnelSpec = (serverName: string | null) =>
  InputSpec.of({
    name: Value.text({
      name: 'Tunnel Name',
      description: 'A name for your new Cloudflare tunnel.',
      required: true,
      default: serverName,
      placeholder: 'my-server',
      masked: false,
      inputmode: 'text',
    }),
  })

export const selectTunnel = sdk.Action.withInput(
  'select-tunnel',

  async ({ effects }) => {
    const loggedIn = !!(await certPem.read().const(effects))
    if (!loggedIn) {
      return {
        name: 'Select Tunnel',
        description: 'Login to Cloudflare first before selecting a tunnel.',
        warning: null,
        allowedStatuses: 'any' as const,
        group: 'Configuration',
        visibility: { disabled: 'Login to Cloudflare first' } as const,
      }
    }
    const conf = await store.read().const(effects)
    const current = conf?.tunnel?.name
    const nameLabel = current
      ? `Cloudflare Tunnel: ${current}`
      : 'Cloudflare Tunnel: Not selected'
    return {
      name: nameLabel,
      description:
        'Choose which Cloudflare tunnel this server runs. You can select an existing tunnel or create a new one.',
      warning: null,
      allowedStatuses: 'any',
      group: 'Configuration',
      visibility: 'enabled',
    }
  },

  InputSpec.of({
    tunnel: Value.dynamicUnion(async ({ effects }) => {
      // Fetch list of available tunnels
      let tunnels: Array<{ id: string; name: string }> = []
      try {
        const stdout = await runCf(effects!, ['tunnel', 'list', '--output', 'json'])
        tunnels = parseTunnelList(stdout)
      } catch (e) {
        console.error(`Failed to list tunnels: ${String(e)}`)
      }

      // Infer server name from mDNS for new tunnel default
      let serverName: string | null = null
      try {
        const mdnsUrl = await sdk.serviceInterface
          .getOwn(effects!, 'metrics', (iface) =>
            iface?.addressInfo?.nonLocal.filter({ kind: 'mdns' })?.format()[0],
          )
          .once()
        if (mdnsUrl) {
          serverName = new URL(mdnsUrl).hostname.replace(/\.local$/, '')
        }
      } catch {}

      const variants: Record<string, { name: string; spec: ReturnType<typeof InputSpec.of> }> = {}

      for (const t of tunnels) {
        variants[t.id] = {
          name: t.name,
          spec: InputSpec.of({}),
        }
      }

      // 'Create new tunnel' always at the bottom
      variants['new'] = {
        name: 'Create new tunnel',
        spec: newTunnelSpec(serverName),
      }

      return {
        name: 'Tunnel',
        default: tunnels[0]?.id ?? 'new',
        disabled: false,
        variants: Variants.of(variants),
      }
    }),
  }),

  // pre-fill with current tunnel selection
  async ({ effects }) => {
    const conf = await store.read().once()
    return {
      tunnel: conf?.tunnel
        ? { selection: conf.tunnel.id, value: {} }
        : { selection: 'new', value: {} },
    }
  },

  async ({ effects, input }) => {
    const selection = (input.tunnel as { selection: string; value: { name?: string } })
    let tunnelId: string
    let tunnelName: string

    if (selection.selection === 'new') {
      const name = selection.value.name?.trim()
      if (!name) throw new Error('Tunnel name is required.')

      // Create the tunnel - response includes id and name
      const stdout = await runCf(effects, ['tunnel', 'create', '--output', 'json', name])
      const created = JSON.parse(stdout.trim())
      tunnelId = created.id
      tunnelName = created.name
    } else {
      tunnelId = selection.selection
      const listOut = await runCf(effects, ['tunnel', 'list', '--output', 'json'])
      const tunnels = parseTunnelList(listOut)
      const found = tunnels.find((t) => t.id === tunnelId)
      tunnelName = found?.name ?? tunnelId
    }

    // Save credentials JSON to volume (delete first - cloudflared refuses to overwrite)
    const credFile = `/root/.cloudflared/${tunnelId}.json`
    const credSubpath = `/.cloudflared/${tunnelId}.json`
    try {
      const { unlink } = await import('node:fs/promises')
      await unlink(sdk.volumes.main.subpath(credSubpath))
    } catch { /* file didn't exist, that's fine */ }
    await runCf(effects, ['tunnel', 'token', `--cred-file=${credFile}`, tunnelId])

    await store.merge(effects, {
      tunnel: { id: tunnelId, name: tunnelName },
    })

    console.info(`Tunnel set to: ${tunnelName} (${tunnelId})`)

    await effects.restart()
  },
)
