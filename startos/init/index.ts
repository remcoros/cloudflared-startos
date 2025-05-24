import { sdk } from '../sdk'
import { versionGraph } from '../install/versionGraph'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { setToken } from '../actions/setToken'

const setupPostInstall = sdk.setupOnInit(async (effects, kind) => {
  if (kind == 'install') {
    // require the config action to run once, to have a password for the ui set
    await sdk.action.createOwnTask(effects, setToken, 'critical', {
      reason: 'Configure default settings',
    })
  }
})

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  actions,
)

export const uninit = sdk.setupUninit(versionGraph)
