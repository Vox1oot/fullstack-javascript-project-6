import { setupLocalization } from './config/i18nConfig.js'
import registerPlugins from './plugins/index.js'
import setupMiddleware from './middleware/index.js'
import addRoutes from './routes/index.js'

export default async (app, _options) => {
  await setupLocalization()
  await registerPlugins(app)
  setupMiddleware(app)
  addRoutes(app)

  return app
}
