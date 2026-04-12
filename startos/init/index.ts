import { sdk } from '../sdk'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../install/versionGraph'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedStore } from './seedStore'
import { writeConfig } from './writeConfig'
import { exportUrls, registerUrlPlugin } from '../plugin/url'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedStore,
  writeConfig,
  setInterfaces,
  actions,
  registerUrlPlugin,
  exportUrls,
)

export const uninit = sdk.setupUninit(versionGraph)
