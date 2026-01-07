import fp from 'fastify-plugin'
import fastifyObjectionjs from 'fastify-objectionjs'
import * as knexConfig from '../../knexfile.js'
import models from '../models/index.js'
import { mode } from '../config/paths.js'

async function databasePlugin(app) {
  await app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  })
}

export default fp(databasePlugin)
