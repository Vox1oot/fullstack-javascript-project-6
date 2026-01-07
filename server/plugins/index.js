import fastifySensible from '@fastify/sensible'
import fastifyFormbody from '@fastify/formbody'
import fastifyMethodOverride from 'fastify-method-override'
import qs from 'qs'
import databasePlugin from './database.js'
import authPlugin from './auth.js'
import viewPlugin from './view.js'
import staticPlugin from './static.js'

export default async (app) => {
  await app.register(fastifySensible)
  await app.register(fastifyFormbody, { parser: qs.parse })
  await app.register(fastifyMethodOverride)
  await app.register(databasePlugin)
  await app.register(authPlugin)
  await app.register(viewPlugin)
  await app.register(staticPlugin)
}
