import { sdk } from '../sdk'
import { createDefaultStore, store } from '../fileModels/store.yaml'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  token: Value.text({
    name: 'Authentication Token',
    description: 'The authentication token for your Cloudflare tunnel.',
    required: true,
    default: '',
    placeholder: '',
  }),
})

export const setToken = sdk.Action.withInput(
  // id
  'setToken',

  // metadata
  async ({ effects }) => ({
    name: 'Set Authentication Token',
    description: 'Set the authentication token for your Cloudflare tunnel.',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    let settings = await store.read().once()
    if (!settings) {
      await createDefaultStore(effects)
      settings = (await store.read().once())!
    }

    return {
      token: settings.token,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    await store.merge(effects, {
      token: input.token,
    })
  },
)