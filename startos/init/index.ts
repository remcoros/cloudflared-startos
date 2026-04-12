import { sdk } from '../sdk'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedStore } from './seedStore'
import { writeConfig } from './writeConfig'
import { exportUrls, registerUrlPlugin } from '../plugin/url'
import { setupTasks } from './setupTasks'
import { setupZoneInfo } from './setupZoneInfo'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedStore,
  setupZoneInfo,
  writeConfig,
  setInterfaces,
  actions,
  registerUrlPlugin,
  setupTasks,
  exportUrls,
)

export const uninit = sdk.setupUninit(versionGraph)
