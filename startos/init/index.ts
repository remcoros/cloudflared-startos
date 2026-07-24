import { sdk } from '../sdk'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedStore } from './seedStore'
import { exportUrls, registerUrlPlugin } from '../plugin/url'
import { setupTasks } from './setupTasks'
import { setupZones } from './setupZones'
import { reconcileIngress } from './reconcileIngress'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedStore,
  setupZones,
  setInterfaces,
  actions,
  registerUrlPlugin,
  reconcileIngress,
  setupTasks,
  exportUrls,
)

export const uninit = sdk.setupUninit(versionGraph)
