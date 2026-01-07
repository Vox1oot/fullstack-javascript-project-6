import { mode } from './paths.js'

export const rollbarConfig = {
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: mode,
  captureUncaught: true,
  captureUnhandledRejections: true,
  enabled: mode === 'production',
}
