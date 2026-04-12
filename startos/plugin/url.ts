import { addPublicHostname } from '../actions/addPublicHostname'
import { deletePublicHostname } from '../actions/deletePublicHostname'
import { store } from '../fileModels/store.yaml'
import { sdk } from '../sdk'

export const registerUrlPlugin = sdk.setupOnInit(async (effects) =>
  sdk.plugin.url.register(effects, { tableAction: addPublicHostname }),
)

export const exportUrls = sdk.plugin.url.setupExportedUrls(
  async ({ effects }) => {
    const ingress =
      (await store.read((s) => s.ingress).const(effects)) ?? {}

    for (const [hostname, entry] of Object.entries(ingress)) {
      if (!entry) continue

      await sdk.plugin.url
        .exportUrl(effects, {
          hostnameInfo: {
            packageId: entry.packageId,
            hostId: entry.hostId,
            internalPort: entry.internalPort,
            ssl: true,
            public: true,
            hostname,
            port: 443,
            info: null,
          },
          removeAction: deletePublicHostname,
          overflowActions: [],
        })
        .catch((e) => {
          console.error(`Failed to export url for ${hostname}:`, e)
        })
    }
  },
)
