import authMiddleware from './auth.js'
import errorHandler from './errorHandler.js'

export default (app) => {
  app.addHook('preHandler', async (req, reply) => {
    reply.locals = {
      isAuthenticated: () => req.isAuthenticated(),
    }
  })
  
  authMiddleware(app)
  errorHandler(app)
}
