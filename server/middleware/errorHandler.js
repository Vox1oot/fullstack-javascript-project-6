import Rollbar from 'rollbar'
import { rollbarConfig } from '../config/rollbarConfig.js'
import { mode } from '../config/paths.js'

const rollbar = new Rollbar(rollbarConfig)

export default (app) => {
  app.setErrorHandler((error, request, reply) => {
    if (mode === 'production') {
      rollbar.error(error, request)
    }
    else {
      app.log.error(error)
    }

    const statusCode = error.statusCode || 500
    reply.status(statusCode).send({
      error: mode === 'production' ? 'Internal Server Error' : error.message,
      statusCode,
    })
  })

  app.decorate('rollbar', rollbar)
}
