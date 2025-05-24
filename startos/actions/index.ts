import { sdk } from '../sdk'
import { setToken } from './setToken'

export const actions = sdk.Actions.of().addAction(setToken)
