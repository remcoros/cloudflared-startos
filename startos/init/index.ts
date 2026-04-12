import { sdk } from '../sdk'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../install/versionGraph'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedStore } from './seedStore'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedStore,
  setInterfaces,
  actions,
)

export const uninit = sdk.setupUninit(versionGraph)
