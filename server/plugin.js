import { setupLocalization } from './config/i18nConfig.js'
import registerPlugins from './plugins/index.js'
import setupMiddleware from './middleware/index.js'
import addRoutes from './routes/index.js'
import knex from 'knex'
import * as knexConfig from '../knexfile.js'

export default async (app, _options) => {
  // Run migrations in production
  if (process.env.NODE_ENV === 'production') {
    const db = knex(knexConfig.production)
    try {
      await db.migrate.latest()
      console.log('✅ Database migrations completed')
    } 
    catch (error) {
      console.error('❌ Migration failed:', error)
      throw error
    } 
    finally {
      await db.destroy()
    }
  }

  await setupLocalization()
  await registerPlugins(app)
  setupMiddleware(app)
  addRoutes(app)

  return app
}
