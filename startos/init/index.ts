import { sdk } from '../sdk'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../install/versionGraph'
import { actions } from '../actions'
import { restoreInit } from '../backups'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  actions
)

export const uninit = sdk.setupUninit(versionGraph)
