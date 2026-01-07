import fp from 'fastify-plugin'
import { Authenticator } from '@fastify/passport'
import fastifySecureSession from '@fastify/secure-session'
import AuthStrategy from '../auth/AuthStrategy.js'
import { sessionConfig } from '../config/sessionConfig.js'

const fastifyPassport = new Authenticator()

async function authPlugin(app) {
  await app.register(fastifySecureSession, sessionConfig)

  fastifyPassport.registerUserDeserializer(
    user => app.objection.models.user.query().findById(user.id),
  )
  fastifyPassport.registerUserSerializer(user => Promise.resolve(user))
  fastifyPassport.use(new AuthStrategy('form', app))

  await app.register(fastifyPassport.initialize())
  await app.register(fastifyPassport.secureSession())
  await app.decorate('fp', fastifyPassport)
}

export { fastifyPassport }
export default fp(authPlugin)
